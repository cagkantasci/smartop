import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateJobDto } from './dto/create-job.dto';

@Injectable()
export class JobsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateJobDto, organizationId: string, userId: string) {
    const { machineIds, operatorIds, ...jobData } = dto;

    const job = await this.prisma.job.create({
      data: {
        organizationId,
        ...jobData,
        createdById: userId,
      },
    });

    // Create assignments if provided
    if (machineIds?.length || operatorIds?.length) {
      const assignments = [];

      if (machineIds?.length) {
        for (const machineId of machineIds) {
          assignments.push({
            jobId: job.id,
            machineId,
          });
        }
      }

      if (operatorIds?.length) {
        for (const operatorId of operatorIds) {
          assignments.push({
            jobId: job.id,
            operatorId,
          });
        }
      }

      await this.prisma.jobAssignment.createMany({
        data: assignments,
        skipDuplicates: true,
      });

      // Send push notifications to assigned operators
      if (operatorIds?.length) {
        await this.notificationsService.notifyJobAssigned(
          {
            id: job.id,
            organizationId,
            title: jobData.title,
            description: jobData.description,
          },
          operatorIds,
        );
      }
    }

    return this.findOne(job.id, organizationId);
  }

  async findAll(
    organizationId: string,
    query: {
      status?: string;
      priority?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const { status, priority, page = 1, limit = 20 } = query;

    const where: any = { organizationId };

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: { id: true, firstName: true, lastName: true },
          },
          jobAssignments: {
            include: {
              machine: {
                select: { id: true, name: true, machineType: true },
              },
              operator: {
                select: { id: true, firstName: true, lastName: true },
              },
            },
          },
        },
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      data: jobs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, organizationId: string) {
    const job = await this.prisma.job.findFirst({
      where: { id, organizationId },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        jobAssignments: {
          include: {
            machine: true,
            operator: {
              select: { id: true, firstName: true, lastName: true, phone: true },
            },
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  async update(
    id: string,
    dto: Partial<CreateJobDto>,
    organizationId: string,
  ) {
    const job = await this.prisma.job.findFirst({
      where: { id, organizationId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const { machineIds, operatorIds, ...updateData } = dto;

    const updated = await this.prisma.job.update({
      where: { id },
      data: updateData,
    });

    return this.findOne(id, organizationId);
  }

  async remove(id: string, organizationId: string) {
    const job = await this.prisma.job.findFirst({
      where: { id, organizationId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    await this.prisma.job.delete({ where: { id } });

    return { message: 'Job deleted successfully' };
  }

  async startJob(id: string, organizationId: string, userId: string) {
    const job = await this.prisma.job.findFirst({
      where: { id, organizationId },
      include: {
        jobAssignments: {
          where: { operatorId: { not: null } },
          include: {
            operator: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.status !== 'scheduled') {
      throw new BadRequestException('Job can only be started from scheduled status');
    }

    const updated = await this.prisma.job.update({
      where: { id },
      data: {
        status: 'in_progress',
        actualStart: new Date(),
      },
    });

    // Send push notification to managers about job start
    const managers = await this.prisma.user.findMany({
      where: { organizationId, role: { in: ['admin', 'manager'] }, isActive: true },
      select: { id: true },
    });

    const operator = job.jobAssignments.find((a: any) => a.operator)?.operator;
    const operatorName = operator ? `${operator.firstName} ${operator.lastName}` : 'Operatör';

    if (managers.length > 0) {
      const managerIds = managers.map((m: any) => m.id);
      await this.notificationsService.createBulk(
        organizationId,
        managerIds,
        'job_started',
        'İş Başladı',
        `"${job.title}" işi ${operatorName} tarafından başlatıldı.`,
        { jobId: id },
      );
    }

    return updated;
  }

  async completeJob(id: string, organizationId: string) {
    const job = await this.prisma.job.findFirst({
      where: { id, organizationId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.status !== 'in_progress') {
      throw new BadRequestException('Job can only be completed from in_progress status');
    }

    const actualEnd = new Date();
    const actualStart = job.actualStart || new Date();
    const actualHours = (actualEnd.getTime() - actualStart.getTime()) / (1000 * 60 * 60);

    const updated = await this.prisma.job.update({
      where: { id },
      data: {
        status: 'completed',
        progress: 100,
        actualEnd,
        actualHours,
      },
    });

    // Send push notification to managers about job completion
    const managers = await this.prisma.user.findMany({
      where: { organizationId, role: { in: ['admin', 'manager'] }, isActive: true },
      select: { id: true },
    });

    if (managers.length > 0) {
      const managerIds = managers.map((m: any) => m.id);
      await this.notificationsService.createBulk(
        organizationId,
        managerIds,
        'job_completed',
        'İş Tamamlandı',
        `"${job.title}" işi başarıyla tamamlandı.`,
        { jobId: id },
      );
    }

    return updated;
  }

  async assignResources(
    id: string,
    machineIds: string[],
    operatorIds: string[],
    organizationId: string,
  ) {
    const job = await this.prisma.job.findFirst({
      where: { id, organizationId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Verify machines belong to organization
    if (machineIds?.length) {
      const machines = await this.prisma.machine.findMany({
        where: { id: { in: machineIds }, organizationId },
      });

      if (machines.length !== machineIds.length) {
        throw new BadRequestException('Some machines not found in organization');
      }
    }

    // Verify operators belong to organization
    if (operatorIds?.length) {
      const operators = await this.prisma.user.findMany({
        where: { id: { in: operatorIds }, organizationId },
      });

      if (operators.length !== operatorIds.length) {
        throw new BadRequestException('Some operators not found in organization');
      }
    }

    // Delete existing machine assignments and create new ones (replace strategy)
    await this.prisma.jobAssignment.deleteMany({
      where: { jobId: id },
    });

    // Create new assignments
    const assignments = [];

    for (const machineId of machineIds || []) {
      assignments.push({
        jobId: id,
        machineId,
      });
    }

    for (const operatorId of operatorIds || []) {
      assignments.push({
        jobId: id,
        operatorId,
      });
    }

    if (assignments.length > 0) {
      await this.prisma.jobAssignment.createMany({
        data: assignments,
      });
    }

    return this.findOne(id, organizationId);
  }
}
