import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    prisma = app.get<PrismaService>(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await prisma.refreshToken.deleteMany({});
    await prisma.passwordResetToken.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.organization.deleteMany({});
  });

  describe('/api/auth/register (POST)', () => {
    it('should register a new user and organization', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
          firstName: 'John',
          lastName: 'Doe',
          phone: '1234567890',
          organizationName: 'Test Company',
          organizationSlug: 'test-company',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('user');
          expect(res.body).toHaveProperty('organization');
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body.user.email).toBe('test@example.com');
          expect(res.body.user.role).toBe('admin');
          expect(res.body.organization.slug).toBe('test-company');
          expect(res.body.user).not.toHaveProperty('passwordHash');
        });
    });

    it('should fail with duplicate organization slug', async () => {
      // Create first organization
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'first@example.com',
          password: 'Password123!',
          firstName: 'First',
          lastName: 'User',
          phone: '1111111111',
          organizationName: 'Test Company',
          organizationSlug: 'test-company',
        });

      // Try to create duplicate
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'second@example.com',
          password: 'Password123!',
          firstName: 'Second',
          lastName: 'User',
          phone: '2222222222',
          organizationName: 'Another Company',
          organizationSlug: 'test-company', // Same slug
        })
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toContain('Organization slug already exists');
        });
    });

    it('should fail with duplicate email', async () => {
      // Create first user
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
          firstName: 'First',
          lastName: 'User',
          phone: '1111111111',
          organizationName: 'First Company',
          organizationSlug: 'first-company',
        });

      // Try to create duplicate email
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'test@example.com', // Same email
          password: 'Password123!',
          firstName: 'Second',
          lastName: 'User',
          phone: '2222222222',
          organizationName: 'Second Company',
          organizationSlug: 'second-company',
        })
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toContain('Email already registered');
        });
    });

    it('should fail with invalid email format', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Password123!',
          firstName: 'John',
          lastName: 'Doe',
          phone: '1234567890',
          organizationName: 'Test Company',
          organizationSlug: 'test-company',
        })
        .expect(400);
    });
  });

  describe('/api/auth/login (POST)', () => {
    beforeEach(async () => {
      // Create test user
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'login@example.com',
          password: 'Password123!',
          firstName: 'Login',
          lastName: 'Test',
          phone: '1234567890',
          organizationName: 'Login Test Company',
          organizationSlug: 'login-test',
        });
    });

    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'Password123!',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('user');
          expect(res.body).toHaveProperty('organization');
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body.user.email).toBe('login@example.com');
        });
    });

    it('should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'Password123!',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid credentials');
        });
    });

    it('should fail with invalid password', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPassword!',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid credentials');
        });
    });
  });

  describe('/api/auth/refresh (POST)', () => {
    let refreshToken: string;

    beforeEach(async () => {
      // Register and get refresh token
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'refresh@example.com',
          password: 'Password123!',
          firstName: 'Refresh',
          lastName: 'Test',
          phone: '1234567890',
          organizationName: 'Refresh Test Company',
          organizationSlug: 'refresh-test',
        });

      refreshToken = response.body.refreshToken;
    });

    it('should refresh access token with valid refresh token', () => {
      return request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({
          refreshToken,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body.refreshToken).not.toBe(refreshToken); // Should be new token
        });
    });

    it('should fail with invalid refresh token', () => {
      return request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'invalid-token',
        })
        .expect(401);
    });
  });

  describe('/api/auth/me (GET)', () => {
    let accessToken: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'me@example.com',
          password: 'Password123!',
          firstName: 'Me',
          lastName: 'Test',
          phone: '1234567890',
          organizationName: 'Me Test Company',
          organizationSlug: 'me-test',
        });

      accessToken = response.body.accessToken;
    });

    it('should return current user with valid token', () => {
      return request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('user');
          expect(res.body).toHaveProperty('organization');
          expect(res.body.user.email).toBe('me@example.com');
        });
    });

    it('should fail without authorization header', () => {
      return request(app.getHttpServer())
        .get('/api/auth/me')
        .expect(401);
    });

    it('should fail with invalid token', () => {
      return request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('/api/auth/logout (POST)', () => {
    let refreshToken: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'logout@example.com',
          password: 'Password123!',
          firstName: 'Logout',
          lastName: 'Test',
          phone: '1234567890',
          organizationName: 'Logout Test Company',
          organizationSlug: 'logout-test',
        });

      refreshToken = response.body.refreshToken;
    });

    it('should logout and revoke refresh token', async () => {
      // Logout
      await request(app.getHttpServer())
        .post('/api/auth/logout')
        .send({
          refreshToken,
        })
        .expect(200);

      // Try to use revoked token
      return request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({
          refreshToken,
        })
        .expect(401);
    });
  });
});
