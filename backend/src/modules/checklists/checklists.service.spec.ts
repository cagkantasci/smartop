import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ChecklistsService } from './checklists.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

describe('ChecklistsService', () => {
  let service: ChecklistsService;
  let prismaService: PrismaService;
  let notificationsService: NotificationsService;

  const mockPrismaService = {
    checklistTemplate: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    checklistSubmission: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    machine: {
      findFirst: jest.fn(),
    },
  };

  const mockNotificationsService = {
    notifyChecklistSubmitted: jest.fn(),
    notifyChecklistReviewed: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChecklistsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    service = module.get<ChecklistsService>(ChecklistsService);
    prismaService = module.get<PrismaService>(PrismaService);
    notificationsService = module.get<NotificationsService>(NotificationsService);

    jest.clearAllMocks();
  });

  describe('createTemplate', () => {
    it('should successfully create a checklist template', async () => {
      const createDto = {
        name: 'Daily Inspection',
        description: 'Daily equipment check',
        machineTypes: ['excavator'],
        items: [
          { id: '1', label: 'Check oil level', type: 'boolean' as const, required: true },
          { id: '2', label: 'Inspect tires', type: 'boolean' as const, required: true },
        ],
      };

      const mockTemplate = {
        id: 'template-1',
        organizationId: 'org-1',
        ...createDto,
      };

      mockPrismaService.checklistTemplate.create.mockResolvedValue(mockTemplate);

      const result = await service.createTemplate(createDto, 'org-1', 'user-1');

      expect(result).toEqual(mockTemplate);
      expect(mockPrismaService.checklistTemplate.create).toHaveBeenCalledWith({
        data: {
          organizationId: 'org-1',
          name: createDto.name,
          description: createDto.description,
          machineTypes: createDto.machineTypes,
          items: createDto.items,
          createdById: 'user-1',
        },
      });
    });
  });

  describe('findAllTemplates', () => {
    it('should return all active templates for organization', async () => {
      const mockTemplates = [
        {
          id: 'template-1',
          name: 'Daily Inspection',
          organizationId: 'org-1',
          isActive: true,
        },
        {
          id: 'template-2',
          name: 'Weekly Inspection',
          organizationId: 'org-1',
          isActive: true,
        },
      ];

      mockPrismaService.checklistTemplate.findMany.mockResolvedValue(mockTemplates);

      const result = await service.findAllTemplates('org-1');

      expect(result).toEqual(mockTemplates);
      expect(mockPrismaService.checklistTemplate.findMany).toHaveBeenCalledWith({
        where: { organizationId: 'org-1', isActive: true },
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
    });
  });

  describe('createSubmission', () => {
    it('should successfully create a checklist submission', async () => {
      const createDto = {
        machineId: 'machine-1',
        templateId: 'template-1',
        entries: [
          { itemId: '1', label: 'Check oil level', isOk: true },
          { itemId: '2', label: 'Inspect tires', isOk: false, value: 'Tire damaged' },
        ],
        notes: 'General notes',
        locationLat: 40.7128,
        locationLng: -74.006,
        startHours: 100,
        endHours: 108,
      };

      const mockMachine = {
        id: 'machine-1',
        name: 'Excavator 1',
        organizationId: 'org-1',
      };

      const mockTemplate = {
        id: 'template-1',
        name: 'Daily Inspection',
        organizationId: 'org-1',
        isActive: true,
      };

      const mockSubmission = {
        id: 'submission-1',
        organizationId: 'org-1',
        machineId: 'machine-1',
        templateId: 'template-1',
        operatorId: 'operator-1',
        entries: createDto.entries,
        issuesCount: 1,
        machine: { id: 'machine-1', name: 'Excavator 1' },
        template: { id: 'template-1', name: 'Daily Inspection' },
        operator: { id: 'operator-1', firstName: 'John', lastName: 'Doe' },
      };

      mockPrismaService.machine.findFirst.mockResolvedValue(mockMachine);
      mockPrismaService.checklistTemplate.findFirst.mockResolvedValue(mockTemplate);
      mockPrismaService.checklistSubmission.create.mockResolvedValue(mockSubmission);

      const result = await service.createSubmission(createDto, 'org-1', 'operator-1');

      expect(result).toEqual(mockSubmission);
      expect(result.issuesCount).toBe(1);
      expect(mockNotificationsService.notifyChecklistSubmitted).toHaveBeenCalled();
    });

    it('should throw NotFoundException if machine not found', async () => {
      const createDto = {
        machineId: 'non-existent',
        templateId: 'template-1',
        entries: [],
      };

      mockPrismaService.machine.findFirst.mockResolvedValue(null);

      await expect(
        service.createSubmission(createDto, 'org-1', 'operator-1'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.createSubmission(createDto, 'org-1', 'operator-1'),
      ).rejects.toThrow('Machine not found');
    });

    it('should throw NotFoundException if template not found', async () => {
      const createDto = {
        machineId: 'machine-1',
        templateId: 'non-existent',
        entries: [],
      };

      mockPrismaService.machine.findFirst.mockResolvedValue({ id: 'machine-1' });
      mockPrismaService.checklistTemplate.findFirst.mockResolvedValue(null);

      await expect(
        service.createSubmission(createDto, 'org-1', 'operator-1'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.createSubmission(createDto, 'org-1', 'operator-1'),
      ).rejects.toThrow('Template not found');
    });
  });

  describe('reviewSubmission', () => {
    it('should successfully approve a submission (manager role)', async () => {
      const reviewDto = {
        status: 'approved' as const,
        notes: 'Looks good',
      };

      const mockSubmission = {
        id: 'submission-1',
        organizationId: 'org-1',
        status: 'pending',
        operatorId: 'operator-1',
      };

      const mockUpdatedSubmission = {
        ...mockSubmission,
        status: 'approved',
        reviewerId: 'manager-1',
        reviewerNotes: 'Looks good',
        machine: { id: 'machine-1', name: 'Excavator 1' },
        operator: { id: 'operator-1', firstName: 'John', lastName: 'Doe' },
        reviewer: { id: 'manager-1', firstName: 'Jane', lastName: 'Smith' },
      };

      mockPrismaService.checklistSubmission.findFirst.mockResolvedValue(mockSubmission);
      mockPrismaService.checklistSubmission.update.mockResolvedValue(mockUpdatedSubmission);

      const result = await service.reviewSubmission(
        'submission-1',
        reviewDto,
        'org-1',
        'manager-1',
        'manager',
      );

      expect(result.status).toBe('approved');
      expect(mockNotificationsService.notifyChecklistReviewed).toHaveBeenCalled();
    });

    it('should successfully reject a submission (admin role)', async () => {
      const reviewDto = {
        status: 'rejected' as const,
        notes: 'Missing photos',
      };

      const mockSubmission = {
        id: 'submission-1',
        organizationId: 'org-1',
        status: 'pending',
        operatorId: 'operator-1',
      };

      const mockUpdatedSubmission = {
        ...mockSubmission,
        status: 'rejected',
        reviewerId: 'admin-1',
        reviewerNotes: 'Missing photos',
        machine: { id: 'machine-1', name: 'Excavator 1' },
        operator: { id: 'operator-1', firstName: 'John', lastName: 'Doe' },
        reviewer: { id: 'admin-1', firstName: 'Admin', lastName: 'User' },
      };

      mockPrismaService.checklistSubmission.findFirst.mockResolvedValue(mockSubmission);
      mockPrismaService.checklistSubmission.update.mockResolvedValue(mockUpdatedSubmission);

      const result = await service.reviewSubmission(
        'submission-1',
        reviewDto,
        'org-1',
        'admin-1',
        'admin',
      );

      expect(result.status).toBe('rejected');
      expect(mockNotificationsService.notifyChecklistReviewed).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is operator', async () => {
      const reviewDto = {
        status: 'approved' as const,
        notes: '',
      };

      await expect(
        service.reviewSubmission('submission-1', reviewDto, 'org-1', 'operator-1', 'operator'),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.reviewSubmission('submission-1', reviewDto, 'org-1', 'operator-1', 'operator'),
      ).rejects.toThrow('Only managers and admins can review submissions');
    });

    it('should throw NotFoundException if submission not found', async () => {
      const reviewDto = {
        status: 'approved' as const,
        notes: '',
      };

      mockPrismaService.checklistSubmission.findFirst.mockResolvedValue(null);

      await expect(
        service.reviewSubmission('non-existent', reviewDto, 'org-1', 'manager-1', 'manager'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if submission already reviewed', async () => {
      const reviewDto = {
        status: 'approved' as const,
        notes: '',
      };

      const mockSubmission = {
        id: 'submission-1',
        organizationId: 'org-1',
        status: 'approved', // Already reviewed
      };

      mockPrismaService.checklistSubmission.findFirst.mockResolvedValue(mockSubmission);

      await expect(
        service.reviewSubmission('submission-1', reviewDto, 'org-1', 'manager-1', 'manager'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.reviewSubmission('submission-1', reviewDto, 'org-1', 'manager-1', 'manager'),
      ).rejects.toThrow('Submission has already been reviewed');
    });
  });

  describe('findAllSubmissions', () => {
    it('should return paginated submissions with filters', async () => {
      const query = {
        status: 'pending',
        machineId: 'machine-1',
        page: 1,
        limit: 20,
      };

      const mockSubmissions = [
        {
          id: 'submission-1',
          status: 'pending',
          machineId: 'machine-1',
        },
      ];

      mockPrismaService.checklistSubmission.findMany.mockResolvedValue(mockSubmissions);
      mockPrismaService.checklistSubmission.count.mockResolvedValue(1);

      const result = await service.findAllSubmissions('org-1', query);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });
  });

  describe('deleteTemplate', () => {
    it('should soft delete a template', async () => {
      const mockTemplate = {
        id: 'template-1',
        organizationId: 'org-1',
        isActive: true,
      };

      mockPrismaService.checklistTemplate.findFirst.mockResolvedValue(mockTemplate);
      mockPrismaService.checklistTemplate.update.mockResolvedValue({
        ...mockTemplate,
        isActive: false,
      });

      const result = await service.deleteTemplate('template-1', 'org-1');

      expect(result).toEqual({ message: 'Template deleted successfully' });
      expect(mockPrismaService.checklistTemplate.update).toHaveBeenCalledWith({
        where: { id: 'template-1' },
        data: { isActive: false },
      });
    });
  });
});
