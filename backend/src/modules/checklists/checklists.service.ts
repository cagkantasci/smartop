import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { ReviewSubmissionDto } from './dto/review-submission.dto';

@Injectable()
export class ChecklistsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  // Template methods
  async createTemplate(dto: CreateTemplateDto, organizationId: string, userId: string) {
    const template = await this.prisma.checklistTemplate.create({
      data: {
        organizationId,
        name: dto.name,
        description: dto.description,
        machineTypes: dto.machineTypes || [],
        items: dto.items as any,
        createdById: userId,
      },
    });

    return template;
  }

  async findAllTemplates(organizationId: string) {
    const templates = await this.prisma.checklistTemplate.findMany({
      where: { organizationId, isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        _count: {
          select: { machines: true },
        },
      },
    });

    return templates;
  }

  async findOneTemplate(id: string, organizationId: string) {
    const template = await this.prisma.checklistTemplate.findFirst({
      where: { id, organizationId },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        machines: {
          select: { id: true, name: true },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  async updateTemplate(id: string, dto: Partial<CreateTemplateDto>, organizationId: string) {
    const template = await this.prisma.checklistTemplate.findFirst({
      where: { id, organizationId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    const updateData: any = { ...dto };
    if (dto.items) {
      updateData.items = dto.items as any;
    }
    const updated = await this.prisma.checklistTemplate.update({
      where: { id },
      data: updateData,
    });

    return updated;
  }

  async deleteTemplate(id: string, organizationId: string) {
    const template = await this.prisma.checklistTemplate.findFirst({
      where: { id, organizationId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Soft delete
    await this.prisma.checklistTemplate.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Template deleted successfully' };
  }

  // Submission methods
  async createSubmission(
    dto: CreateSubmissionDto,
    organizationId: string,
    operatorId: string,
  ) {
    // Verify machine belongs to organization
    const machine = await this.prisma.machine.findFirst({
      where: { id: dto.machineId, organizationId },
    });

    if (!machine) {
      throw new NotFoundException('Machine not found');
    }

    // Verify template exists
    const template = await this.prisma.checklistTemplate.findFirst({
      where: { id: dto.templateId, organizationId, isActive: true },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Count issues
    const issuesCount = dto.entries.filter((e) => !e.isOk).length;

    const submission = await this.prisma.checklistSubmission.create({
      data: {
        organizationId,
        machineId: dto.machineId,
        templateId: dto.templateId,
        operatorId,
        entries: dto.entries as any,
        issuesCount,
        notes: dto.notes,
        locationLat: dto.locationLat,
        locationLng: dto.locationLng,
        startHours: dto.startHours,
        endHours: dto.endHours,
      },
      include: {
        machine: {
          select: { id: true, name: true },
        },
        template: {
          select: { id: true, name: true },
        },
        operator: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    // Send push notification to managers
    await this.notificationsService.notifyChecklistSubmitted({
      id: submission.id,
      organizationId,
      operatorId,
      machineId: dto.machineId,
      operator: submission.operator,
      machine: submission.machine,
    });

    return submission;
  }

  async findAllSubmissions(
    organizationId: string,
    query: {
      status?: string;
      machineId?: string;
      operatorId?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const { status, machineId, operatorId, page = 1, limit = 20 } = query;

    const where: any = { organizationId };

    if (status) {
      where.status = status;
    }

    if (machineId) {
      where.machineId = machineId;
    }

    if (operatorId) {
      where.operatorId = operatorId;
    }

    const [submissions, total] = await Promise.all([
      this.prisma.checklistSubmission.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { submittedAt: 'desc' },
        include: {
          machine: {
            select: { id: true, name: true, machineType: true },
          },
          template: {
            select: { id: true, name: true },
          },
          operator: {
            select: { id: true, firstName: true, lastName: true },
          },
          reviewer: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      }),
      this.prisma.checklistSubmission.count({ where }),
    ]);

    return {
      data: submissions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneSubmission(id: string, organizationId: string) {
    const submission = await this.prisma.checklistSubmission.findFirst({
      where: { id, organizationId },
      include: {
        machine: true,
        template: true,
        operator: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
        reviewer: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    return submission;
  }

  async reviewSubmission(
    id: string,
    dto: ReviewSubmissionDto,
    organizationId: string,
    reviewerId: string,
    reviewerRole: string,
  ) {
    // Only managers and admins can review
    if (!['admin', 'manager'].includes(reviewerRole)) {
      throw new ForbiddenException('Only managers and admins can review submissions');
    }

    const submission = await this.prisma.checklistSubmission.findFirst({
      where: { id, organizationId },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (submission.status !== 'pending') {
      throw new BadRequestException('Submission has already been reviewed');
    }

    const updated = await this.prisma.checklistSubmission.update({
      where: { id },
      data: {
        status: dto.status,
        reviewerId,
        reviewerNotes: dto.notes,
        reviewedAt: new Date(),
      },
      include: {
        machine: true,
        operator: {
          select: { id: true, firstName: true, lastName: true },
        },
        reviewer: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    // Send push notification to operator about review result
    if (updated.reviewer) {
      await this.notificationsService.notifyChecklistReviewed({
        id: updated.id,
        organizationId,
        operatorId: submission.operatorId,
        status: dto.status,
        reviewerNotes: dto.notes,
        machine: updated.machine,
        reviewer: updated.reviewer,
      });
    }

    return updated;
  }
}
