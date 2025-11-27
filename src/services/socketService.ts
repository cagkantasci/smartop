import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export interface MachineLocationEvent {
  machineId: string;
  location: { lat: number; lng: number };
  timestamp: string;
}

export interface MachineStatusEvent {
  machineId: string;
  status: string;
  previousStatus: string;
  timestamp: string;
}

export interface JobProgressEvent {
  jobId: string;
  progress: number;
  status: string;
  timestamp: string;
}

export interface JobStatusEvent {
  jobId: string;
  status: string;
  previousStatus: string;
  timestamp: string;
}

export interface ChecklistSubmittedEvent {
  id: string;
  machineId: string;
  operatorId: string;
  operatorName: string;
  issuesCount: number;
  timestamp: string;
}

export interface ChecklistReviewedEvent {
  submissionId: string;
  status: 'approved' | 'rejected';
  reviewerId: string;
  timestamp: string;
}

export interface AlertEvent {
  id: string;
  type: 'machine_fault' | 'checklist_issue' | 'job_delay' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  resourceId?: string;
  resourceType?: 'machine' | 'job' | 'checklist';
  timestamp: string;
}

export interface DashboardStatsEvent {
  activeMachines: number;
  activeJobs: number;
  pendingChecklists: number;
  alerts: number;
  timestamp: string;
}

type EventHandlers = {
  'connected': (data: { message: string; userId: string }) => void;
  'machine:location': (data: MachineLocationEvent) => void;
  'machine:status': (data: MachineStatusEvent) => void;
  'job:progress': (data: JobProgressEvent) => void;
  'job:status': (data: JobStatusEvent) => void;
  'checklist:submitted': (data: ChecklistSubmittedEvent) => void;
  'checklist:reviewed': (data: ChecklistReviewedEvent) => void;
  'alert': (data: AlertEvent) => void;
  'dashboard:stats': (data: DashboardStatsEvent) => void;
};

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.socket = io(`${SOCKET_URL}/events`, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('[Socket] Connected to server');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('[Socket] Connection error:', error.message);
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('[Socket] Disconnected:', reason);
      });

      this.socket.on('connected', (data) => {
        console.log('[Socket] Authenticated:', data);
        this.emit('connected', data);
      });

      // Register all event listeners
      this.setupEventListeners();
    });
  }

  private setupEventListeners() {
    if (!this.socket) return;

    const events: (keyof EventHandlers)[] = [
      'machine:location',
      'machine:status',
      'job:progress',
      'job:status',
      'checklist:submitted',
      'checklist:reviewed',
      'alert',
      'dashboard:stats',
    ];

    events.forEach((event) => {
      this.socket?.on(event, (data) => {
        this.emit(event, data);
      });
    });
  }

  private emit(event: string, data: unknown) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // Subscribe to machine updates
  subscribeMachine(machineId: string) {
    this.socket?.emit('machine:subscribe', { machineId });
  }

  unsubscribeMachine(machineId: string) {
    this.socket?.emit('machine:unsubscribe', { machineId });
  }

  // Subscribe to job updates
  subscribeJob(jobId: string) {
    this.socket?.emit('job:subscribe', { jobId });
  }

  unsubscribeJob(jobId: string) {
    this.socket?.emit('job:unsubscribe', { jobId });
  }

  // Event listeners
  on<K extends keyof EventHandlers>(event: K, handler: EventHandlers[K]) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }

  off<K extends keyof EventHandlers>(event: K, handler?: EventHandlers[K]) {
    if (handler) {
      this.listeners.get(event)?.delete(handler);
    } else {
      this.listeners.delete(event);
    }
  }
}

// Singleton instance
export const socketService = new SocketService();

export default socketService;
