import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto, organizationId: string, creatorRole: string) {
    // Only admins can create users
    if (creatorRole !== 'admin') {
      throw new ForbiddenException('Only admins can create users');
    }

    // Check if email exists in organization
    const existingUser = await this.prisma.user.findFirst({
      where: { organizationId, email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists in this organization');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        organizationId,
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role || 'operator',
        phone: dto.phone,
        jobTitle: dto.jobTitle,
        licenses: dto.licenses || [],
        specialties: dto.specialties || [],
      },
    });

    return this.sanitizeUser(user);
  }

  async findAll(organizationId: string, query: QueryUsersDto) {
    const { search, role, isActive, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    const where: any = { organizationId };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          phone: true,
          avatarUrl: true,
          jobTitle: true,
          licenses: true,
          specialties: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, organizationId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, organizationId },
      include: {
        assignedMachines: {
          select: { id: true, name: true, machineType: true, status: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    organizationId: string,
    requestingUserId: string,
    requestingUserRole: string,
  ) {
    const user = await this.prisma.user.findFirst({
      where: { id, organizationId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Users can update their own profile (limited fields)
    // Admins can update any user
    if (requestingUserId !== id && requestingUserRole !== 'admin') {
      throw new ForbiddenException('Only admins can update other users');
    }

    // Non-admins can only update certain fields
    if (requestingUserRole !== 'admin') {
      const allowedFields = ['firstName', 'lastName', 'phone', 'avatarUrl'];
      const updateData: any = {};
      for (const field of allowedFields) {
        if ((dto as any)[field] !== undefined) {
          updateData[field] = (dto as any)[field];
        }
      }
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateData,
      });
      return this.sanitizeUser(updatedUser);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dto,
    });

    return this.sanitizeUser(updatedUser);
  }

  async remove(id: string, organizationId: string, requestingUserRole: string) {
    if (requestingUserRole !== 'admin') {
      throw new ForbiddenException('Only admins can delete users');
    }

    const user = await this.prisma.user.findFirst({
      where: { id, organizationId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Soft delete - just deactivate
    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'User deactivated successfully' };
  }

  // Update operator location (for live tracking)
  async updateLocation(userId: string, dto: UpdateLocationDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        locationLat: dto.latitude,
        locationLng: dto.longitude,
        locationAddress: dto.address,
        locationUpdatedAt: new Date(),
      },
    });

    return {
      id: updatedUser.id,
      locationLat: updatedUser.locationLat,
      locationLng: updatedUser.locationLng,
      locationAddress: updatedUser.locationAddress,
      locationUpdatedAt: updatedUser.locationUpdatedAt,
    };
  }

  // Get all operators with location (for map display)
  async getOperatorsWithLocation(organizationId: string) {
    const operators = await this.prisma.user.findMany({
      where: {
        organizationId,
        role: 'operator',
        isActive: true,
        locationLat: { not: null },
        locationLng: { not: null },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        locationLat: true,
        locationLng: true,
        locationAddress: true,
        locationUpdatedAt: true,
        assignedMachines: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    return operators;
  }

  // Toggle biometric auth setting
  async toggleBiometric(userId: string, enabled: boolean) {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { biometricEnabled: enabled },
    });

    return {
      biometricEnabled: updatedUser.biometricEnabled,
    };
  }

  // Update own profile
  async updateProfile(userId: string, dto: UpdateUserDto, organizationId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, organizationId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only allow updating profile fields
    const allowedFields = ['firstName', 'lastName', 'phone', 'avatarUrl'];
    const updateData: any = {};
    for (const field of allowedFields) {
      if ((dto as any)[field] !== undefined) {
        updateData[field] = (dto as any)[field];
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return this.sanitizeUser(updatedUser);
  }

  // Change password
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.passwordHash) {
      throw new ForbiddenException('Password not set for this user');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new ForbiddenException('Current password is incorrect');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return { message: 'Password changed successfully' };
  }

  // Update notification settings
  async updateNotificationSettings(userId: string, settings: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const allowedSettings = [
      'pushEnabled',
      'emailEnabled',
      'smsEnabled',
      'checklistReminderEnabled',
      'jobUpdatesEnabled',
      'maintenanceAlertsEnabled',
    ];

    const updateData: any = {};
    for (const setting of allowedSettings) {
      if (settings[setting] !== undefined) {
        updateData[setting] = settings[setting];
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return {
      pushEnabled: updatedUser.pushEnabled,
      emailEnabled: updatedUser.emailEnabled,
      smsEnabled: updatedUser.smsEnabled,
      checklistReminderEnabled: updatedUser.checklistReminderEnabled,
      jobUpdatesEnabled: updatedUser.jobUpdatesEnabled,
      maintenanceAlertsEnabled: updatedUser.maintenanceAlertsEnabled,
    };
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }
}
