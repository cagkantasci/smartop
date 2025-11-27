import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string, requestingUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: requestingUserId },
    });

    if (!user || user.organizationId !== id) {
      throw new ForbiddenException('Access denied to this organization');
    }

    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async update(
    id: string,
    dto: UpdateOrganizationDto,
    requestingUserId: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: requestingUserId },
    });

    if (!user || user.organizationId !== id) {
      throw new ForbiddenException('Access denied to this organization');
    }

    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins can update organization');
    }

    const organization = await this.prisma.organization.update({
      where: { id },
      data: dto,
    });

    return organization;
  }

  async getStats(id: string, requestingUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: requestingUserId },
    });

    if (!user || user.organizationId !== id) {
      throw new ForbiddenException('Access denied to this organization');
    }

    const [
      usersCount,
      machinesCount,
      activeJobsCount,
      pendingApprovalsCount,
    ] = await Promise.all([
      this.prisma.user.count({ where: { organizationId: id, isActive: true } }),
      this.prisma.machine.count({ where: { organizationId: id } }),
      this.prisma.job.count({
        where: { organizationId: id, status: 'in_progress' },
      }),
      this.prisma.checklistSubmission.count({
        where: { organizationId: id, status: 'pending' },
      }),
    ]);

    // Machine status breakdown
    const machinesByStatus = await this.prisma.machine.groupBy({
      by: ['status'],
      where: { organizationId: id },
      _count: { status: true },
    });

    // Recent checklist submissions
    const recentSubmissions = await this.prisma.checklistSubmission.count({
      where: {
        organizationId: id,
        submittedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    });

    return {
      users: usersCount,
      machines: machinesCount,
      activeJobs: activeJobsCount,
      pendingApprovals: pendingApprovalsCount,
      machinesByStatus: machinesByStatus.reduce(
        (acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        },
        {} as Record<string, number>,
      ),
      recentSubmissions,
    };
  }
}
