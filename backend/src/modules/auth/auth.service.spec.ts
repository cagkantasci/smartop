import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../../common/prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockPrismaService = {
    organization: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    refreshToken: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    passwordResetToken: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user and organization', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        organizationName: 'Test Org',
        organizationSlug: 'test-org',
      };

      const mockOrganization = {
        id: 'org-1',
        name: 'Test Org',
        slug: 'test-org',
        subscriptionStatus: 'trial',
      };

      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        organizationId: 'org-1',
        role: 'admin',
        passwordHash: 'hashed',
      };

      mockPrismaService.organization.findUnique.mockResolvedValue(null);
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.$transaction.mockResolvedValue({
        organization: mockOrganization,
        user: mockUser,
      });
      mockJwtService.sign.mockReturnValue('mock-jwt-token');
      mockConfigService.get.mockReturnValue('15m');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('organization');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('should throw ConflictException if organization slug exists', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        organizationName: 'Test Org',
        organizationSlug: 'test-org',
      };

      mockPrismaService.organization.findUnique.mockResolvedValue({
        id: 'existing-org',
        slug: 'test-org',
      });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      await expect(service.register(registerDto)).rejects.toThrow(
        'Organization slug already exists',
      );
    });

    it('should throw ConflictException if email is already registered', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        organizationName: 'Test Org',
        organizationSlug: 'test-org',
      };

      mockPrismaService.organization.findUnique.mockResolvedValue(null);
      mockPrismaService.user.findFirst.mockResolvedValue({
        id: 'existing-user',
        email: 'test@example.com',
      });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      await expect(service.register(registerDto)).rejects.toThrow('Email already registered');
    });
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('password123', 12),
        isActive: true,
        organizationId: 'org-1',
        role: 'admin',
        organization: {
          id: 'org-1',
          name: 'Test Org',
        },
      };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');
      mockConfigService.get.mockReturnValue('15m');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('organization');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(loginDto.email);
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      const loginDto = {
        email: 'wrong@example.com',
        password: 'password123',
      };

      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('password123', 12),
        isActive: true,
      };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException for deactivated account', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('password123', 12),
        isActive: false,
      };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Account is deactivated');
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh tokens with valid refresh token', async () => {
      const refreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };

      const mockStoredToken = {
        id: 'token-1',
        tokenHash: 'hashed-token',
        expiresAt: new Date(Date.now() + 1000000),
        revokedAt: null,
        user: {
          id: 'user-1',
          email: 'test@example.com',
          isActive: true,
          organizationId: 'org-1',
          role: 'admin',
          organization: {
            id: 'org-1',
            name: 'Test Org',
          },
        },
      };

      mockPrismaService.refreshToken.findFirst.mockResolvedValue(mockStoredToken);
      mockPrismaService.refreshToken.update.mockResolvedValue(mockStoredToken);
      mockJwtService.sign.mockReturnValue('new-jwt-token');
      mockConfigService.get.mockReturnValue('15m');

      const result = await service.refreshToken(refreshTokenDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockPrismaService.refreshToken.update).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const refreshTokenDto = {
        refreshToken: 'invalid-token',
      };

      mockPrismaService.refreshToken.findFirst.mockResolvedValue(null);

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(
        'Invalid or expired refresh token',
      );
    });

    it('should throw UnauthorizedException for expired refresh token', async () => {
      const refreshTokenDto = {
        refreshToken: 'expired-token',
      };

      const mockExpiredToken = {
        id: 'token-1',
        tokenHash: 'hashed-token',
        expiresAt: new Date(Date.now() - 1000000), // Expired
        revokedAt: null,
      };

      mockPrismaService.refreshToken.findFirst.mockResolvedValue(null); // Expired tokens won't be found

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should successfully revoke refresh token', async () => {
      const refreshToken = 'valid-refresh-token';

      mockPrismaService.refreshToken.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.logout(refreshToken);

      expect(result).toEqual({ message: 'Logged out successfully' });
      expect(mockPrismaService.refreshToken.updateMany).toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    it('should create password reset token for existing user', async () => {
      const forgotPasswordDto = {
        email: 'test@example.com',
      };

      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
      };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.passwordResetToken.updateMany.mockResolvedValue({ count: 0 });
      mockPrismaService.passwordResetToken.create.mockResolvedValue({
        id: 'reset-1',
        userId: 'user-1',
      });
      mockConfigService.get.mockReturnValue('development');

      const result = await service.forgotPassword(forgotPasswordDto);

      expect(result).toHaveProperty('message');
      expect(mockPrismaService.passwordResetToken.create).toHaveBeenCalled();
    });

    it('should return success even for non-existent email (security)', async () => {
      const forgotPasswordDto = {
        email: 'nonexistent@example.com',
      };

      mockPrismaService.user.findFirst.mockResolvedValue(null);

      const result = await service.forgotPassword(forgotPasswordDto);

      expect(result).toHaveProperty('message');
      expect(mockPrismaService.passwordResetToken.create).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should successfully reset password with valid token', async () => {
      const resetPasswordDto = {
        token: 'valid-reset-token',
        newPassword: 'newpassword123',
      };

      const mockResetToken = {
        id: 'reset-1',
        userId: 'user-1',
        tokenHash: 'hashed-token',
        expiresAt: new Date(Date.now() + 1000000),
        usedAt: null,
        user: {
          id: 'user-1',
          email: 'test@example.com',
        },
      };

      mockPrismaService.passwordResetToken.findFirst.mockResolvedValue(mockResetToken);
      mockPrismaService.$transaction.mockResolvedValue([{}, {}, {}]);

      const result = await service.resetPassword(resetPasswordDto);

      expect(result).toHaveProperty('message');
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid or expired token', async () => {
      const resetPasswordDto = {
        token: 'invalid-token',
        newPassword: 'newpassword123',
      };

      mockPrismaService.passwordResetToken.findFirst.mockResolvedValue(null);

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getMe', () => {
    it('should return user and organization data', async () => {
      const userId = 'user-1';

      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        passwordHash: 'hashed',
        organization: {
          id: 'org-1',
          name: 'Test Org',
        },
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getMe(userId);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('organization');
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const userId = 'non-existent';

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getMe(userId)).rejects.toThrow(UnauthorizedException);
    });
  });
});
