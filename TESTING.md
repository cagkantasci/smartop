# Smartop Testing Guide

Bu dokümantasyon Smartop projesi için yazılmış testlerin nasıl çalıştırılacağını ve yeni testlerin nasıl yazılacağını açıklar.

## İçindekiler

1. [Test Türleri](#test-türleri)
2. [Test Altyapısı](#test-altyapısı)
3. [Backend Testleri](#backend-testleri)
4. [Frontend Testleri](#frontend-testleri)
5. [Test Komutları](#test-komutları)
6. [Test Yazma Kuralları](#test-yazma-kuralları)
7. [Örnekler](#örnekler)

---

## Test Türleri

### 1. Unit Tests (Birim Testler)
En küçük kod parçalarını (fonksiyonlar, metodlar, servisler) izole olarak test eder.

**Ne zaman kullanılır:**
- Service layer metodlarını test ederken
- Utility fonksiyonlarını test ederken
- İş mantığını test ederken

**Örnek:**
```typescript
// auth.service.spec.ts
it('should hash password before saving', async () => {
  const password = 'password123';
  const hashed = await bcrypt.hash(password, 12);
  expect(hashed).not.toBe(password);
});
```

### 2. Integration Tests (Entegrasyon Testleri)
Birden fazla bileşenin birlikte çalışmasını test eder (API endpoints, database operations).

**Ne zaman kullanılır:**
- API endpoint'lerini test ederken
- Controller + Service + Database akışını test ederken
- Authentication flow'unu test ederken

**Örnek:**
```typescript
// auth.e2e-spec.ts
it('should register a new user and organization', () => {
  return request(app.getHttpServer())
    .post('/api/auth/register')
    .send(registerDto)
    .expect(201);
});
```

### 3. Component Tests (Komponent Testleri)
React komponentlerinin render edilmesini ve kullanıcı etkileşimlerini test eder.

**Ne zaman kullanılır:**
- UI komponentlerini test ederken
- Context provider'ları test ederken
- Custom hook'ları test ederken

**Örnek:**
```typescript
// AuthContext.test.tsx
it('should login user successfully', async () => {
  const { result } = renderHook(() => useAuth());
  await result.current.login('test@example.com', 'password');
  expect(result.current.isAuthenticated).toBe(true);
});
```

---

## Test Altyapısı

### Backend (NestJS + Jest)

**Kurulu Paketler:**
- `jest`: Test framework
- `ts-jest`: TypeScript desteği
- `@nestjs/testing`: NestJS test utilities
- `supertest`: HTTP assertion library

**Konfigürasyon:**
- [jest.config.js](backend/jest.config.js) - Ana Jest konfigürasyonu
- [test/jest-e2e.json](backend/test/jest-e2e.json) - E2E test konfigürasyonu
- [test/setup.ts](backend/test/setup.ts) - Global test setup

### Frontend (React + Vitest)

**Kurulu Paketler:**
- `vitest`: Test framework (Vite ile entegre)
- `@testing-library/react`: React testing utilities
- `@testing-library/jest-dom`: DOM matchers
- `@testing-library/user-event`: Kullanıcı etkileşimi simülasyonu
- `jsdom`: Browser environment simülasyonu

**Konfigürasyon:**
- [vitest.config.ts](frontend/vitest.config.ts) - Vitest konfigürasyonu
- [src/test/setup.ts](frontend/src/test/setup.ts) - Global test setup
- [src/test/utils/test-utils.tsx](frontend/src/test/utils/test-utils.tsx) - Custom render utilities

---

## Backend Testleri

### Dizin Yapısı

```
backend/
├── src/
│   └── modules/
│       ├── auth/
│       │   ├── auth.service.ts
│       │   └── auth.service.spec.ts       # Unit test
│       ├── machines/
│       │   ├── machines.service.ts
│       │   └── machines.service.spec.ts   # Unit test
│       └── checklists/
│           ├── checklists.service.ts
│           └── checklists.service.spec.ts # Unit test
└── test/
    ├── auth.e2e-spec.ts                   # Integration test
    ├── setup.ts
    └── jest-e2e.json
```

### Unit Test Yazma (Service)

```typescript
// Example: machines.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { MachinesService } from './machines.service';
import { PrismaService } from '../../common/prisma/prisma.service';

describe('MachinesService', () => {
  let service: MachinesService;
  let prismaService: PrismaService;

  // Mock PrismaService
  const mockPrismaService = {
    machine: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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

    // Her testten önce mock'ları temizle
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a machine successfully', async () => {
      const createDto = {
        name: 'Excavator 1',
        machineType: 'excavator',
      };

      const mockMachine = {
        id: 'machine-1',
        ...createDto,
      };

      mockPrismaService.machine.create.mockResolvedValue(mockMachine);

      const result = await service.create(createDto, 'org-1');

      expect(result).toEqual(mockMachine);
      expect(mockPrismaService.machine.create).toHaveBeenCalledWith({
        data: {
          organizationId: 'org-1',
          ...createDto,
        },
        include: expect.any(Object),
      });
    });

    it('should throw ConflictException for duplicate serial number', async () => {
      const createDto = {
        name: 'Excavator 1',
        serialNumber: 'EXISTING-SN',
      };

      mockPrismaService.machine.findFirst.mockResolvedValue({
        id: 'existing-machine',
        serialNumber: 'EXISTING-SN',
      });

      await expect(service.create(createDto, 'org-1')).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
```

### Integration Test Yazma (E2E)

```typescript
// Example: auth.e2e-spec.ts
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
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    prisma = app.get<PrismaService>(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Her testten önce database'i temizle
    await prisma.user.deleteMany({});
    await prisma.organization.deleteMany({});
  });

  describe('/api/auth/register (POST)', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
          firstName: 'John',
          lastName: 'Doe',
          organizationName: 'Test Org',
          organizationSlug: 'test-org',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('user');
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body.user.email).toBe('test@example.com');
        });
    });
  });
});
```

---

## Frontend Testleri

### Dizin Yapısı

```
frontend/
├── src/
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── AuthContext.test.tsx          # Context test
│   ├── components/
│   │   ├── Button.tsx
│   │   └── Button.test.tsx               # Component test
│   └── test/
│       ├── setup.ts                      # Global setup
│       ├── utils/
│       │   └── test-utils.tsx            # Custom render
│       └── mocks/
│           └── handlers.ts               # API mocks
└── vitest.config.ts
```

### Component Test Yazma

```typescript
// Example: Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByText('Click me'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

### Context Test Yazma

```typescript
// Example: AuthContext.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import * as authService from '../services/authService';

vi.mock('../services/authService');

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should login user successfully', async () => {
    const mockResponse = {
      user: { id: '1', email: 'test@example.com' },
      accessToken: 'token',
    };

    vi.mocked(authService.authService.login).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await result.current.login('test@example.com', 'password');

    expect(result.current.user).toEqual(mockResponse.user);
    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

### Custom Render Utility Kullanımı

```typescript
// src/test/utils/test-utils.tsx
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';

const AllTheProviders = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

export const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Kullanımı:
import { render } from '../test/utils/test-utils';
render(<MyComponent />);
```

---

## Test Komutları

### Backend

```bash
cd backend

# Tüm testleri çalıştır
npm test

# Watch mode (değişiklikleri izle)
npm run test:watch

# Coverage raporu oluştur
npm run test:cov

# E2E testleri çalıştır
npm run test:e2e

# Belirli bir test dosyasını çalıştır
npm test auth.service.spec.ts
```

### Frontend

```bash
cd frontend

# Tüm testleri çalıştır
npm test

# Watch mode
npm test -- --watch

# UI mode (browser'da görsel test runner)
npm run test:ui

# Coverage raporu oluştur
npm run test:coverage

# Belirli bir test dosyasını çalıştır
npm test AuthContext.test.tsx
```

---

## Test Yazma Kuralları

### 1. AAA Pattern (Arrange-Act-Assert)

```typescript
it('should create a machine', async () => {
  // Arrange - Test için gerekli verileri hazırla
  const createDto = { name: 'Excavator', type: 'heavy' };
  mockPrisma.machine.create.mockResolvedValue(mockMachine);

  // Act - Test edilecek fonksiyonu çalıştır
  const result = await service.create(createDto, 'org-1');

  // Assert - Sonuçları doğrula
  expect(result).toEqual(mockMachine);
  expect(mockPrisma.machine.create).toHaveBeenCalled();
});
```

### 2. Test İsimlendirme

```typescript
// ✅ İyi - Ne test edildiği açık
it('should throw NotFoundException when machine does not exist', () => {});

// ❌ Kötü - Belirsiz
it('should work', () => {});
it('test machine', () => {});
```

### 3. Test Bağımsızlığı

```typescript
// ✅ İyi - Her test kendi verilerini oluşturur
describe('MachinesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('test 1', () => {
    const data = createMockData();
    // test...
  });

  it('test 2', () => {
    const data = createMockData();
    // test...
  });
});

// ❌ Kötü - Testler birbirine bağımlı
let sharedData;
it('test 1', () => {
  sharedData = createData();
});
it('test 2', () => {
  // sharedData kullanımı - test 1'e bağımlı
});
```

### 4. Mock Kullanımı

```typescript
// ✅ İyi - Sadece gerekli methodları mock'la
const mockPrismaService = {
  machine: {
    create: jest.fn(),
    findFirst: jest.fn(),
  },
};

// Her testten önce mock'ları temizle
beforeEach(() => {
  jest.clearAllMocks();
});

// Mock return değerlerini belirle
mockPrismaService.machine.create.mockResolvedValue(mockMachine);
```

### 5. Error Testing

```typescript
// ✅ Hataları test et
it('should throw ConflictException for duplicate email', async () => {
  mockPrisma.user.findFirst.mockResolvedValue(existingUser);

  await expect(
    service.register(registerDto)
  ).rejects.toThrow(ConflictException);

  await expect(
    service.register(registerDto)
  ).rejects.toThrow('Email already registered');
});
```

### 6. Async/Await Kullanımı

```typescript
// ✅ İyi - async/await kullan
it('should create user', async () => {
  const result = await service.createUser(dto);
  expect(result).toBeDefined();
});

// ❌ Kötü - Promise return etme (karışık)
it('should create user', () => {
  return service.createUser(dto).then(result => {
    expect(result).toBeDefined();
  });
});
```

---

## Örnekler

### Backend Service Test

Tam örnek: [auth.service.spec.ts](backend/src/modules/auth/auth.service.spec.ts)

**Test edilen durumlar:**
- ✅ Başarılı kayıt
- ✅ Duplicate email hatası
- ✅ Başarılı login
- ✅ Geçersiz şifre hatası
- ✅ Token refresh
- ✅ Logout

### Backend E2E Test

Tam örnek: [auth.e2e-spec.ts](backend/test/auth.e2e-spec.ts)

**Test edilen flow'lar:**
- ✅ Register → Login → Get Me → Logout
- ✅ Refresh token flow
- ✅ Invalid credentials
- ✅ Validation errors

### Frontend Context Test

Tam örnek: [AuthContext.test.tsx](frontend/src/contexts/AuthContext.test.tsx)

**Test edilen durumlar:**
- ✅ Initial state
- ✅ Login flow
- ✅ Logout flow
- ✅ Session persistence
- ✅ Error handling

---

## Test Coverage Hedefleri

### Kritik Modüller (Minimum %80 Coverage)

- ✅ Authentication (auth.service.ts)
- ✅ Checklist submission & approval (checklists.service.ts)
- ✅ Machine management (machines.service.ts)
- ⏳ User management (users.service.ts)
- ⏳ Notifications (notifications.service.ts)

### Orta Öncelik (Minimum %60 Coverage)

- ⏳ Jobs management
- ⏳ Organizations
- ⏳ File uploads

### Düşük Öncelik

- ⏳ Email service
- ⏳ Push notifications

---

## Sorun Giderme

### Backend Test Hataları

**Problem:** `Cannot find module '@nestjs/testing'`
```bash
cd backend && npm install
```

**Problem:** Database connection errors
```bash
# Test database'i ayarla
cp .env.example .env.test
# .env.test içinde DATABASE_URL'i test database'e çevir
```

**Problem:** Port zaten kullanımda
```bash
# Test için farklı port kullan veya çalışan servisi durdur
npm run test -- --maxWorkers=1
```

### Frontend Test Hataları

**Problem:** `Cannot find module 'vitest'`
```bash
cd frontend && npm install
```

**Problem:** `window is not defined`
```typescript
// vitest.config.ts içinde environment: 'jsdom' olduğundan emin ol
export default defineConfig({
  test: {
    environment: 'jsdom',
  },
});
```

**Problem:** Mock'lar çalışmıyor
```typescript
// Mock'ların doğru import edildiğinden emin ol
vi.mock('../services/authService');

// Her testten önce temizle
beforeEach(() => {
  vi.clearAllMocks();
});
```

---

## Kaynaklar

### Dokümantasyon
- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)

### Best Practices
- [Testing Best Practices](https://testingjavascript.com/)
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## Sonraki Adımlar

1. ✅ Backend unit testleri tamamlandı
2. ✅ Backend E2E testleri başladı
3. ✅ Frontend context testleri başladı
4. ⏳ Kalan servisler için unit testler yazılacak
5. ⏳ Frontend component testleri genişletilecek
6. ⏳ E2E test coverage artırılacak
7. ⏳ CI/CD pipeline'a test entegrasyonu

---

**Son Güncelleme:** Ocak 2026
**Maintainer:** Smartop Development Team
