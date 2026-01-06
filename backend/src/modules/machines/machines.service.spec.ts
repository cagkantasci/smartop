import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { MachinesService } from './machines.service';
import { PrismaService } from '../../common/prisma/prisma.service';

describe('MachinesService', () => {
  let service: MachinesService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    machine: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
    },
    serviceRecord: {
      findMany: jest.fn(),
    },
    checklistSubmission: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MachinesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MachinesService>(MachinesService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should successfully create a machine', async () => {
      const createDto = {
        name: 'Excavator 1',
        brand: 'Caterpillar',
        model: '320D',
        machineType: 'excavator' as const,
        serialNumber: 'SN123456',
        licensePlate: 'AB-1234',
        year: 2020,
      };

      const mockMachine = {
        id: 'machine-1',
        organizationId: 'org-1',
        ...createDto,
      };

      mockPrismaService.machine.findFirst.mockResolvedValue(null);
      mockPrismaService.machine.create.mockResolvedValue(mockMachine);

      const result = await service.create(createDto, 'org-1');

      expect(result).toEqual(mockMachine);
      expect(mockPrismaService.machine.create).toHaveBeenCalledWith({
        data: {
          organizationId: 'org-1',
          ...createDto,
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
    });

    it('should throw ConflictException if serial number exists', async () => {
      const createDto = {
        name: 'Excavator 1',
        brand: 'Caterpillar',
        model: '320D',
        machineType: 'excavator' as const,
        serialNumber: 'SN123456',
      };

      mockPrismaService.machine.findFirst.mockResolvedValue({
        id: 'existing-machine',
        serialNumber: 'SN123456',
      });

      await expect(service.create(createDto, 'org-1')).rejects.toThrow(ConflictException);
      await expect(service.create(createDto, 'org-1')).rejects.toThrow(
        'Serial number already exists in this organization',
      );
    });

    it('should throw NotFoundException if assigned operator not found', async () => {
      const createDto = {
        name: 'Excavator 1',
        brand: 'Caterpillar',
        model: '320D',
        machineType: 'excavator' as const,
        assignedOperatorId: 'non-existent-operator',
      };

      mockPrismaService.machine.findFirst.mockResolvedValue(null);
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.create(createDto, 'org-1')).rejects.toThrow(NotFoundException);
      await expect(service.create(createDto, 'org-1')).rejects.toThrow(
        'Assigned operator not found in organization',
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated machines with filters', async () => {
      const query = {
        search: 'Excavator',
        machineType: 'excavator',
        status: 'active',
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc' as const,
      };

      const mockMachines = [
        {
          id: 'machine-1',
          name: 'Excavator 1',
          machineType: 'excavator',
          status: 'active',
        },
      ];

      mockPrismaService.machine.findMany.mockResolvedValue(mockMachines);
      mockPrismaService.machine.count.mockResolvedValue(1);

      const result = await service.findAll('org-1', query);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.data).toEqual(mockMachines);
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });

    it('should handle search across multiple fields', async () => {
      const query = {
        search: 'CAT',
        page: 1,
        limit: 20,
      };

      mockPrismaService.machine.findMany.mockResolvedValue([]);
      mockPrismaService.machine.count.mockResolvedValue(0);

      await service.findAll('org-1', query);

      const callArgs = mockPrismaService.machine.findMany.mock.calls[0][0];
      expect(callArgs.where.OR).toBeDefined();
      expect(callArgs.where.OR.length).toBeGreaterThan(0);
    });
  });

  describe('findOne', () => {
    it('should return machine with relations', async () => {
      const mockMachine = {
        id: 'machine-1',
        name: 'Excavator 1',
        organizationId: 'org-1',
        assignedOperator: {
          id: 'operator-1',
          firstName: 'John',
          lastName: 'Doe',
        },
        serviceRecords: [],
        checklistSubmissions: [],
      };

      mockPrismaService.machine.findFirst.mockResolvedValue(mockMachine);

      const result = await service.findOne('machine-1', 'org-1');

      expect(result).toEqual(mockMachine);
    });

    it('should throw NotFoundException if machine not found', async () => {
      mockPrismaService.machine.findFirst.mockResolvedValue(null);

      await expect(service.findOne('non-existent', 'org-1')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent', 'org-1')).rejects.toThrow(
        'Machine not found',
      );
    });
  });

  describe('update', () => {
    it('should successfully update a machine', async () => {
      const updateDto = {
        name: 'Updated Excavator',
        status: 'maintenance' as const,
      };

      const mockExistingMachine = {
        id: 'machine-1',
        organizationId: 'org-1',
        serialNumber: 'SN123456',
      };

      const mockUpdatedMachine = {
        ...mockExistingMachine,
        ...updateDto,
      };

      mockPrismaService.machine.findFirst.mockResolvedValueOnce(mockExistingMachine);
      mockPrismaService.machine.update.mockResolvedValue(mockUpdatedMachine);

      const result = await service.update('machine-1', updateDto, 'org-1');

      expect(result.name).toBe('Updated Excavator');
      expect(result.status).toBe('maintenance');
    });

    it('should throw NotFoundException if machine not found', async () => {
      const updateDto = {
        name: 'Updated Excavator',
      };

      mockPrismaService.machine.findFirst.mockResolvedValue(null);

      await expect(service.update('non-existent', updateDto, 'org-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if new serial number exists', async () => {
      const updateDto = {
        serialNumber: 'EXISTING-SN',
      };

      const mockExistingMachine = {
        id: 'machine-1',
        organizationId: 'org-1',
        serialNumber: 'OLD-SN',
      };

      mockPrismaService.machine.findFirst
        .mockResolvedValueOnce(mockExistingMachine)
        .mockResolvedValueOnce({ id: 'other-machine', serialNumber: 'EXISTING-SN' });

      await expect(service.update('machine-1', updateDto, 'org-1')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('should successfully delete a machine', async () => {
      const mockMachine = {
        id: 'machine-1',
        organizationId: 'org-1',
      };

      mockPrismaService.machine.findFirst.mockResolvedValue(mockMachine);
      mockPrismaService.machine.delete.mockResolvedValue(mockMachine);

      const result = await service.remove('machine-1', 'org-1');

      expect(result).toEqual({ message: 'Machine deleted successfully' });
      expect(mockPrismaService.machine.delete).toHaveBeenCalledWith({
        where: { id: 'machine-1' },
      });
    });

    it('should throw NotFoundException if machine not found', async () => {
      mockPrismaService.machine.findFirst.mockResolvedValue(null);

      await expect(service.remove('non-existent', 'org-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateLocation', () => {
    it('should successfully update machine location', async () => {
      const locationDto = {
        lat: 40.7128,
        lng: -74.006,
        address: 'New York, NY',
      };

      const mockMachine = {
        id: 'machine-1',
        organizationId: 'org-1',
      };

      const mockUpdatedMachine = {
        ...mockMachine,
        locationLat: 40.7128,
        locationLng: -74.006,
        locationAddress: 'New York, NY',
      };

      mockPrismaService.machine.findFirst.mockResolvedValue(mockMachine);
      mockPrismaService.machine.update.mockResolvedValue(mockUpdatedMachine);

      const result = await service.updateLocation('machine-1', locationDto, 'org-1');

      expect(result.locationLat).toBe(40.7128);
      expect(result.locationLng).toBe(-74.006);
      expect(result.locationAddress).toBe('New York, NY');
    });
  });

  describe('assignOperator', () => {
    it('should successfully assign operator to machine', async () => {
      const mockMachine = {
        id: 'machine-1',
        organizationId: 'org-1',
      };

      const mockOperator = {
        id: 'operator-1',
        organizationId: 'org-1',
      };

      const mockUpdatedMachine = {
        ...mockMachine,
        assignedOperatorId: 'operator-1',
        assignedOperator: {
          id: 'operator-1',
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      mockPrismaService.machine.findFirst.mockResolvedValue(mockMachine);
      mockPrismaService.user.findFirst.mockResolvedValue(mockOperator);
      mockPrismaService.machine.update.mockResolvedValue(mockUpdatedMachine);

      const result = await service.assignOperator('machine-1', 'operator-1', 'org-1');

      expect(result.assignedOperatorId).toBe('operator-1');
    });

    it('should unassign operator when operatorId is null', async () => {
      const mockMachine = {
        id: 'machine-1',
        organizationId: 'org-1',
      };

      const mockUpdatedMachine = {
        ...mockMachine,
        assignedOperatorId: null,
        assignedOperator: null,
      };

      mockPrismaService.machine.findFirst.mockResolvedValue(mockMachine);
      mockPrismaService.machine.update.mockResolvedValue(mockUpdatedMachine);

      const result = await service.assignOperator('machine-1', null, 'org-1');

      expect(result.assignedOperatorId).toBeNull();
    });
  });

  describe('getHistory', () => {
    it('should return service records for machine', async () => {
      const mockMachine = {
        id: 'machine-1',
        organizationId: 'org-1',
      };

      const mockServiceRecords = [
        {
          id: 'record-1',
          machineId: 'machine-1',
          serviceDate: new Date(),
          description: 'Oil change',
        },
      ];

      mockPrismaService.machine.findFirst.mockResolvedValue(mockMachine);
      mockPrismaService.serviceRecord.findMany.mockResolvedValue(mockServiceRecords);

      const result = await service.getHistory('machine-1', 'org-1');

      expect(result).toEqual(mockServiceRecords);
    });
  });

  describe('getChecklists', () => {
    it('should return checklist submissions for machine', async () => {
      const mockMachine = {
        id: 'machine-1',
        organizationId: 'org-1',
      };

      const mockSubmissions = [
        {
          id: 'submission-1',
          machineId: 'machine-1',
          status: 'pending',
        },
      ];

      mockPrismaService.machine.findFirst.mockResolvedValue(mockMachine);
      mockPrismaService.checklistSubmission.findMany.mockResolvedValue(mockSubmissions);

      const result = await service.getChecklists('machine-1', 'org-1');

      expect(result).toEqual(mockSubmissions);
    });
  });
});
