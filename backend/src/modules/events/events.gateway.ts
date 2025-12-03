import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface AuthenticatedSocket extends Socket {
  user?: {
    userId: string;
    organizationId: string;
    role: string;
  };
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:5173'],
    credentials: true,
  },
  namespace: '/events',
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger('EventsGateway');

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth?.token ||
                    client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Client ${client.id} connection rejected: No token`);
        client.disconnect();
        return;
      }

      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      if (!jwtSecret) {
        this.logger.error('JWT_SECRET environment variable is required');
        client.disconnect();
        return;
      }
      const payload = this.jwtService.verify(token, {
        secret: jwtSecret,
      });

      client.user = {
        userId: payload.sub,
        organizationId: payload.organizationId,
        role: payload.role,
      };

      // Join organization-specific room
      client.join(`org:${client.user.organizationId}`);

      this.logger.log(
        `Client ${client.id} connected (User: ${client.user.userId}, Org: ${client.user.organizationId})`,
      );

      // Notify client of successful connection
      client.emit('connected', {
        message: 'Connected to Smartop real-time events',
        userId: client.user.userId,
      });
    } catch (error) {
      this.logger.warn(`Client ${client.id} connection rejected: Invalid token`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client ${client.id} disconnected`);
  }

  // =====================
  // Machine Events
  // =====================

  @SubscribeMessage('machine:subscribe')
  handleMachineSubscribe(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { machineId: string },
  ) {
    if (!client.user) return;

    const room = `machine:${data.machineId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} subscribed to ${room}`);

    return { event: 'machine:subscribed', data: { machineId: data.machineId } };
  }

  @SubscribeMessage('machine:unsubscribe')
  handleMachineUnsubscribe(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { machineId: string },
  ) {
    const room = `machine:${data.machineId}`;
    client.leave(room);
    this.logger.log(`Client ${client.id} unsubscribed from ${room}`);

    return { event: 'machine:unsubscribed', data: { machineId: data.machineId } };
  }

  // Emit machine location update to all subscribers
  emitMachineLocationUpdate(
    organizationId: string,
    machineId: string,
    location: { lat: number; lng: number },
  ) {
    this.server.to(`org:${organizationId}`).emit('machine:location', {
      machineId,
      location,
      timestamp: new Date().toISOString(),
    });
  }

  // Emit machine status change
  emitMachineStatusChange(
    organizationId: string,
    machineId: string,
    status: string,
    previousStatus: string,
  ) {
    this.server.to(`org:${organizationId}`).emit('machine:status', {
      machineId,
      status,
      previousStatus,
      timestamp: new Date().toISOString(),
    });
  }

  // =====================
  // Job Events
  // =====================

  @SubscribeMessage('job:subscribe')
  handleJobSubscribe(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { jobId: string },
  ) {
    if (!client.user) return;

    const room = `job:${data.jobId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} subscribed to ${room}`);

    return { event: 'job:subscribed', data: { jobId: data.jobId } };
  }

  // Emit job progress update
  emitJobProgressUpdate(
    organizationId: string,
    jobId: string,
    progress: number,
    status: string,
  ) {
    this.server.to(`org:${organizationId}`).emit('job:progress', {
      jobId,
      progress,
      status,
      timestamp: new Date().toISOString(),
    });

    // Also emit to job-specific room for detailed subscribers
    this.server.to(`job:${jobId}`).emit('job:progress', {
      jobId,
      progress,
      status,
      timestamp: new Date().toISOString(),
    });
  }

  // Emit job status change
  emitJobStatusChange(
    organizationId: string,
    jobId: string,
    status: string,
    previousStatus: string,
  ) {
    this.server.to(`org:${organizationId}`).emit('job:status', {
      jobId,
      status,
      previousStatus,
      timestamp: new Date().toISOString(),
    });
  }

  // =====================
  // Checklist Events
  // =====================

  // Emit new checklist submission
  emitChecklistSubmission(
    organizationId: string,
    submission: {
      id: string;
      machineId: string;
      operatorId: string;
      operatorName: string;
      issuesCount: number;
    },
  ) {
    this.server.to(`org:${organizationId}`).emit('checklist:submitted', {
      ...submission,
      timestamp: new Date().toISOString(),
    });
  }

  // Emit checklist review result
  emitChecklistReviewed(
    organizationId: string,
    submissionId: string,
    status: 'approved' | 'rejected',
    reviewerId: string,
  ) {
    this.server.to(`org:${organizationId}`).emit('checklist:reviewed', {
      submissionId,
      status,
      reviewerId,
      timestamp: new Date().toISOString(),
    });
  }

  // =====================
  // Alert Events
  // =====================

  // Emit critical alert to organization
  emitAlert(
    organizationId: string,
    alert: {
      type: 'machine_fault' | 'checklist_issue' | 'job_delay' | 'system';
      severity: 'low' | 'medium' | 'high' | 'critical';
      title: string;
      message: string;
      resourceId?: string;
      resourceType?: 'machine' | 'job' | 'checklist';
    },
  ) {
    this.server.to(`org:${organizationId}`).emit('alert', {
      ...alert,
      id: `alert_${Date.now()}`,
      timestamp: new Date().toISOString(),
    });
  }

  // =====================
  // Dashboard Stats
  // =====================

  // Emit real-time dashboard stats update
  emitDashboardStats(
    organizationId: string,
    stats: {
      activeMachines: number;
      activeJobs: number;
      pendingChecklists: number;
      alerts: number;
    },
  ) {
    this.server.to(`org:${organizationId}`).emit('dashboard:stats', {
      ...stats,
      timestamp: new Date().toISOString(),
    });
  }
}
