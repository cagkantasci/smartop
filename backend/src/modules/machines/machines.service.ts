import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { QueryMachinesDto } from './dto/query-machines.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class MachinesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMachineDto, organizationId: string) {
    // Check serial number uniqueness within organization
    if (dto.serialNumber) {
      const existing = await this.prisma.machine.findFirst({
        where: { organizationId, serialNumber: dto.serialNumber },
      });

      if (existing) {
        throw new ConflictException('Serial number already exists in this organization');
      }
    }

    // Verify assigned operator belongs to organization
    if (dto.assignedOperatorId) {
      const operator = await this.prisma.user.findFirst({
        where: { id: dto.assignedOperatorId, organizationId },
      });

      if (!operator) {
        throw new NotFoundException('Assigned operator not found in organization');
      }
    }

    const machine = await this.prisma.machine.create({
      data: {
        organizationId,
        ...dto,
      },
      include: {
        assignedOperator: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        checklistTemplate: {
          select: { id: true, name: true },
        },
      },
    });

    return machine;
  }

  async findAll(organizationId: string, query: QueryMachinesDto) {
    const {
      search,
      machineType,
      status,
      assignedOperatorId,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const where: any = { organizationId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } },
        { licensePlate: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (machineType) {
      where.machineType = machineType;
    }

    if (status) {
      where.status = status;
    }

    if (assignedOperatorId) {
      where.assignedOperatorId = assignedOperatorId;
    }

    const [machines, total] = await Promise.all([
      this.prisma.machine.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          assignedOperator: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          checklistTemplate: {
            select: { id: true, name: true },
          },
        },
      }),
      this.prisma.machine.count({ where }),
    ]);

    return {
      data: machines,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, organizationId: string) {
    const machine = await this.prisma.machine.findFirst({
      where: { id, organizationId },
      include: {
        assignedOperator: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
        checklistTemplate: true,
        serviceRecords: {
          orderBy: { serviceDate: 'desc' },
          take: 5,
        },
        checklistSubmissions: {
          orderBy: { submittedAt: 'desc' },
          take: 5,
          include: {
            operator: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
      },
    });

    if (!machine) {
      throw new NotFoundException('Machine not found');
    }

    return machine;
  }

  async update(id: string, dto: UpdateMachineDto, organizationId: string) {
    const machine = await this.prisma.machine.findFirst({
      where: { id, organizationId },
    });

    if (!machine) {
      throw new NotFoundException('Machine not found');
    }

    // Check serial number uniqueness
    if (dto.serialNumber && dto.serialNumber !== machine.serialNumber) {
      const existing = await this.prisma.machine.findFirst({
        where: {
          organizationId,
          serialNumber: dto.serialNumber,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException('Serial number already exists in this organization');
      }
    }

    // Verify assigned operator
    if (dto.assignedOperatorId) {
      const operator = await this.prisma.user.findFirst({
        where: { id: dto.assignedOperatorId, organizationId },
      });

      if (!operator) {
        throw new NotFoundException('Assigned operator not found in organization');
      }
    }

    const updatedMachine = await this.prisma.machine.update({
      where: { id },
      data: dto,
      include: {
        assignedOperator: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        checklistTemplate: {
          select: { id: true, name: true },
        },
      },
    });

    return updatedMachine;
  }

  async remove(id: string, organizationId: string) {
    const machine = await this.prisma.machine.findFirst({
      where: { id, organizationId },
    });

    if (!machine) {
      throw new NotFoundException('Machine not found');
    }

    await this.prisma.machine.delete({ where: { id } });

    return { message: 'Machine deleted successfully' };
  }

  async updateLocation(id: string, dto: UpdateLocationDto, organizationId: string) {
    const machine = await this.prisma.machine.findFirst({
      where: { id, organizationId },
    });

    if (!machine) {
      throw new NotFoundException('Machine not found');
    }

    const updatedMachine = await this.prisma.machine.update({
      where: { id },
      data: {
        locationLat: dto.lat,
        locationLng: dto.lng,
        locationAddress: dto.address,
        locationUpdatedAt: new Date(),
      },
    });

    return updatedMachine;
  }

  async assignOperator(id: string, operatorId: string | null, organizationId: string) {
    const machine = await this.prisma.machine.findFirst({
      where: { id, organizationId },
    });

    if (!machine) {
      throw new NotFoundException('Machine not found');
    }

    if (operatorId) {
      const operator = await this.prisma.user.findFirst({
        where: { id: operatorId, organizationId },
      });

      if (!operator) {
        throw new NotFoundException('Operator not found in organization');
      }
    }

    const updatedMachine = await this.prisma.machine.update({
      where: { id },
      data: { assignedOperatorId: operatorId },
      include: {
        assignedOperator: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    return updatedMachine;
  }

  async getHistory(id: string, organizationId: string) {
    const machine = await this.prisma.machine.findFirst({
      where: { id, organizationId },
    });

    if (!machine) {
      throw new NotFoundException('Machine not found');
    }

    const serviceRecords = await this.prisma.serviceRecord.findMany({
      where: { machineId: id },
      orderBy: { serviceDate: 'desc' },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return serviceRecords;
  }

  async getChecklists(id: string, organizationId: string) {
    const machine = await this.prisma.machine.findFirst({
      where: { id, organizationId },
    });

    if (!machine) {
      throw new NotFoundException('Machine not found');
    }

    const submissions = await this.prisma.checklistSubmission.findMany({
      where: { machineId: id },
      orderBy: { submittedAt: 'desc' },
      include: {
        operator: {
          select: { id: true, firstName: true, lastName: true },
        },
        reviewer: {
          select: { id: true, firstName: true, lastName: true },
        },
        template: {
          select: { id: true, name: true },
        },
      },
    });

    return submissions;
  }
}
