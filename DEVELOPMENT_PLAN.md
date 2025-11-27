# Smartop - Kapsamlı Geliştirme Planı

**Hazırlanma Tarihi:** 27 Kasım 2025
**Proje:** Smartop - Ağır İş Makinesi Filo Yönetimi SaaS Platformu

---

## 1. Mevcut Durum Analizi

### 1.1 Frontend Özellikleri (Tamamlanmış)

| Modül | Özellikler | Durum |
|-------|-----------|-------|
| **Dashboard** | Fleet overview, metrikler, grafikler, makine detayları | ✅ |
| **Makine Yönetimi** | CRUD, fiyatlandırma, sepet, ödeme simülasyonu | ✅ |
| **Operatör Yönetimi** | CRUD, lisanslar, uzmanlıklar | ✅ |
| **İş Yönetimi** | Proje/şantiye yönetimi, makine atamaları | ✅ |
| **Checklist Yönetimi** | Şablon CRUD, günlük kontrol listeleri | ✅ |
| **Onay Workflow** | Operatör gönderileri, yönetici onayları | ✅ |
| **Finans Modülü** | Faturalar, ödeme yöntemi, fiyatlandırma | ✅ |
| **Ayarlar** | Profil, firma, bildirimler, güvenlik | ✅ |
| **Mobil Simülatör** | Operatör/Yönetici dual-role demo | ✅ |
| **Landing Page** | ROI hesaplayıcı, özellikler, CTA | ✅ |

### 1.2 Teknoloji Stack (Frontend)
- React 19 + TypeScript + Vite
- Tailwind CSS (CDN)
- Recharts (grafikler)
- Framer Motion (animasyonlar)
- Lucide React (ikonlar)

---

## 2. Backend Planlaması

### 2.1 Teknoloji Stack Önerisi

```
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND STACK                            │
├─────────────────────────────────────────────────────────────────┤
│  Runtime:        Node.js 20 LTS + TypeScript 5.x               │
│  Framework:      NestJS 10.x (Enterprise-grade, modular)       │
│  ORM:            Prisma 5.x (Type-safe database access)        │
│  Database:       PostgreSQL 16 (Primary)                       │
│  Cache:          Redis 7.x (Session, cache, queues)            │
│  Search:         Elasticsearch 8.x (Fleet search, logs)        │
│  Queue:          Bull MQ (Background jobs, notifications)      │
│  Auth:           Passport.js + JWT + OAuth2                    │
│  File Storage:   AWS S3 / MinIO (On-premise option)            │
│  API:            REST + GraphQL (Hybrid approach)              │
│  Real-time:      Socket.io (Live updates, notifications)       │
│  Payments:       iyzico / Stripe (Turkish market)              │
│  Email:          SendGrid / AWS SES                            │
│  SMS:            NetGSM / Twilio (Turkish SMS)                 │
│  Monitoring:     Prometheus + Grafana                          │
│  Logging:        Winston + ELK Stack                           │
│  Testing:        Jest + Supertest                              │
│  Docs:           Swagger/OpenAPI 3.0                           │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Veritabanı Şeması

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== AUTHENTICATION ====================

model User {
  id                String    @id @default(uuid())
  email             String    @unique
  password          String
  role              UserRole  @default(OPERATOR)
  firstName         String
  lastName          String
  phone             String?
  avatarUrl         String?
  isActive          Boolean   @default(true)
  emailVerified     Boolean   @default(false)
  twoFactorEnabled  Boolean   @default(false)
  twoFactorSecret   String?
  lastLoginAt       DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  company           Company?   @relation(fields: [companyId], references: [id])
  companyId         String?
  operator          Operator?
  sessions          Session[]
  notifications     Notification[]
  activityLogs      ActivityLog[]
}

enum UserRole {
  SUPER_ADMIN
  COMPANY_ADMIN
  MANAGER
  OPERATOR
}

model Session {
  id           String   @id @default(uuid())
  token        String   @unique
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  deviceInfo   String?
  ipAddress    String?
  expiresAt    DateTime
  createdAt    DateTime @default(now())
}

// ==================== COMPANY ====================

model Company {
  id              String    @id @default(uuid())
  name            String
  taxNumber       String    @unique
  taxOffice       String
  phone           String
  email           String
  address         String
  city            String
  country         String    @default("Türkiye")
  logoUrl         String?
  subscriptionPlan SubscriptionPlan @default(PAY_AS_YOU_GO)
  subscriptionStatus SubscriptionStatus @default(ACTIVE)
  machineQuota    Int       @default(0)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  users           User[]
  machines        Machine[]
  operators       Operator[]
  jobs            Job[]
  checklistTemplates ChecklistTemplate[]
  invoices        Invoice[]
  settings        CompanySettings?
}

enum SubscriptionPlan {
  PAY_AS_YOU_GO
  STARTER
  PROFESSIONAL
  ENTERPRISE
}

enum SubscriptionStatus {
  ACTIVE
  PAST_DUE
  CANCELLED
  SUSPENDED
}

model CompanySettings {
  id                    String   @id @default(uuid())
  companyId             String   @unique
  company               Company  @relation(fields: [companyId], references: [id])
  language              String   @default("tr")
  timezone              String   @default("Europe/Istanbul")
  currency              String   @default("TRY")
  emailNotifications    Boolean  @default(true)
  pushNotifications     Boolean  @default(true)
  maintenanceAlerts     Boolean  @default(true)
  weeklyReport          Boolean  @default(true)
  marketingEmails       Boolean  @default(false)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

// ==================== MACHINES ====================

model Machine {
  id              String        @id @default(uuid())
  companyId       String
  company         Company       @relation(fields: [companyId], references: [id])
  type            MachineType
  brand           String
  model           String
  serialNumber    String        @unique
  year            Int
  status          MachineStatus @default(IDLE)
  currentEngineHours Float      @default(0)
  lastServiceDate DateTime?
  nextServiceDue  DateTime?
  imageUrl        String?
  latitude        Float?
  longitude       Float?
  currentJobId    String?
  currentJob      Job?          @relation("CurrentJob", fields: [currentJobId], references: [id])
  assignedOperatorId String?
  assignedOperator Operator?    @relation("AssignedOperator", fields: [assignedOperatorId], references: [id])
  checklistTemplateId String?
  checklistTemplate ChecklistTemplate? @relation(fields: [checklistTemplateId], references: [id])
  isActive        Boolean       @default(true)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  serviceRecords  ServiceRecord[]
  faultReports    FaultReport[]
  meterReadings   MeterReading[]
  checklistSubmissions ChecklistSubmission[]
  jobAssignments  JobMachineAssignment[]
}

enum MachineType {
  EXCAVATOR
  DOZER
  CRANE
  LOADER
  TRUCK
  GRADER
  ROLLER
  FORKLIFT
  CONCRETE_MIXER
  DUMP_TRUCK
}

enum MachineStatus {
  ACTIVE
  MAINTENANCE
  IDLE
  OUT_OF_SERVICE
}

model ServiceRecord {
  id              String   @id @default(uuid())
  machineId       String
  machine         Machine  @relation(fields: [machineId], references: [id])
  serviceType     String
  description     String
  cost            Float?
  performedBy     String?
  performedAt     DateTime
  nextServiceDue  DateTime?
  engineHoursAtService Float?
  notes           String?
  createdAt       DateTime @default(now())
}

model FaultReport {
  id              String   @id @default(uuid())
  machineId       String
  machine         Machine  @relation(fields: [machineId], references: [id])
  faultCode       String?
  description     String
  severity        FaultSeverity
  reportedById    String
  reportedAt      DateTime @default(now())
  resolvedAt      DateTime?
  resolution      String?
  photoUrls       String[]
  createdAt       DateTime @default(now())
}

enum FaultSeverity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

model MeterReading {
  id              String   @id @default(uuid())
  machineId       String
  machine         Machine  @relation(fields: [machineId], references: [id])
  readingType     MeterType
  value           Float
  recordedById    String
  recordedAt      DateTime @default(now())
  jobId           String?
  isStartReading  Boolean  @default(false)
  createdAt       DateTime @default(now())
}

enum MeterType {
  ENGINE_HOURS
  KILOMETERS
  FUEL_LEVEL
}

// ==================== OPERATORS ====================

model Operator {
  id              String   @id @default(uuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
  companyId       String
  company         Company  @relation(fields: [companyId], references: [id])
  employeeId      String?
  licenses        License[]
  specialties     MachineType[]
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  assignedMachines Machine[] @relation("AssignedOperator")
  checklistSubmissions ChecklistSubmission[]
  jobAssignments  JobOperatorAssignment[]
}

model License {
  id              String   @id @default(uuid())
  operatorId      String
  operator        Operator @relation(fields: [operatorId], references: [id], onDelete: Cascade)
  type            LicenseType
  licenseNumber   String?
  issuedAt        DateTime?
  expiresAt       DateTime?
  isVerified      Boolean  @default(false)
  documentUrl     String?
  createdAt       DateTime @default(now())
}

enum LicenseType {
  G_CLASS
  C_CLASS
  FORKLIFT
  CRANE_OPERATOR
  SRC
  PSYCHOTECHNICAL
  ADR
  HEAVY_EQUIPMENT
}

// ==================== JOBS ====================

model Job {
  id              String   @id @default(uuid())
  companyId       String
  company         Company  @relation(fields: [companyId], references: [id])
  title           String
  description     String?
  location        String
  latitude        Float?
  longitude       Float?
  status          JobStatus @default(PLANNED)
  progress        Float    @default(0)
  startDate       DateTime
  estimatedEndDate DateTime?
  actualEndDate   DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  currentMachines Machine[] @relation("CurrentJob")
  machineAssignments JobMachineAssignment[]
  operatorAssignments JobOperatorAssignment[]
}

enum JobStatus {
  PLANNED
  IN_PROGRESS
  COMPLETED
  DELAYED
  CANCELLED
}

model JobMachineAssignment {
  id              String   @id @default(uuid())
  jobId           String
  job             Job      @relation(fields: [jobId], references: [id])
  machineId       String
  machine         Machine  @relation(fields: [machineId], references: [id])
  assignedAt      DateTime @default(now())
  removedAt       DateTime?

  @@unique([jobId, machineId])
}

model JobOperatorAssignment {
  id              String   @id @default(uuid())
  jobId           String
  job             Job      @relation(fields: [jobId], references: [id])
  operatorId      String
  operator        Operator @relation(fields: [operatorId], references: [id])
  assignedAt      DateTime @default(now())
  removedAt       DateTime?

  @@unique([jobId, operatorId])
}

// ==================== CHECKLISTS ====================

model ChecklistTemplate {
  id              String   @id @default(uuid())
  companyId       String
  company         Company  @relation(fields: [companyId], references: [id])
  name            String
  machineTypes    MachineType[]
  items           ChecklistTemplateItem[]
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  machines        Machine[]
  submissions     ChecklistSubmission[]
}

model ChecklistTemplateItem {
  id              String   @id @default(uuid())
  templateId      String
  template        ChecklistTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)
  label           String
  description     String?
  order           Int
  isRequired      Boolean  @default(true)
  requiresPhoto   Boolean  @default(false)
  requiresValue   Boolean  @default(false)
  valueUnit       String?
  createdAt       DateTime @default(now())
}

model ChecklistSubmission {
  id              String   @id @default(uuid())
  templateId      String
  template        ChecklistTemplate @relation(fields: [templateId], references: [id])
  machineId       String
  machine         Machine  @relation(fields: [machineId], references: [id])
  operatorId      String
  operator        Operator @relation(fields: [operatorId], references: [id])
  status          ApprovalStatus @default(PENDING)
  submittedAt     DateTime @default(now())
  reviewedAt      DateTime?
  reviewedById    String?
  reviewNotes     String?
  entries         ChecklistEntry[]
  createdAt       DateTime @default(now())
}

enum ApprovalStatus {
  PENDING
  APPROVED
  REJECTED
}

model ChecklistEntry {
  id              String   @id @default(uuid())
  submissionId    String
  submission      ChecklistSubmission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  templateItemId  String
  label           String
  isOk            Boolean
  value           String?
  photoUrl        String?
  notes           String?
  createdAt       DateTime @default(now())
}

// ==================== FINANCE ====================

model Invoice {
  id              String   @id @default(uuid())
  companyId       String
  company         Company  @relation(fields: [companyId], references: [id])
  invoiceNumber   String   @unique
  description     String
  amount          Float
  currency        String   @default("TRY")
  status          InvoiceStatus @default(PENDING)
  dueDate         DateTime
  paidAt          DateTime?
  billingPeriodStart DateTime
  billingPeriodEnd DateTime
  machineCount    Int
  unitPrice       Float
  discountPercent Float    @default(0)
  discountAmount  Float    @default(0)
  taxRate         Float    @default(20)
  taxAmount       Float
  totalAmount     Float
  pdfUrl          String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  items           InvoiceItem[]
  payments        Payment[]
}

enum InvoiceStatus {
  DRAFT
  PENDING
  PAID
  OVERDUE
  CANCELLED
}

model InvoiceItem {
  id              String   @id @default(uuid())
  invoiceId       String
  invoice         Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  description     String
  quantity        Int
  unitPrice       Float
  amount          Float
  createdAt       DateTime @default(now())
}

model Payment {
  id              String   @id @default(uuid())
  invoiceId       String
  invoice         Invoice  @relation(fields: [invoiceId], references: [id])
  amount          Float
  currency        String   @default("TRY")
  method          PaymentMethod
  status          PaymentStatus
  transactionId   String?
  gatewayResponse Json?
  paidAt          DateTime?
  createdAt       DateTime @default(now())
}

enum PaymentMethod {
  CREDIT_CARD
  BANK_TRANSFER
  APPLE_PAY
  GOOGLE_PAY
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}

model PaymentMethod {
  id              String   @id @default(uuid())
  companyId       String
  type            PaymentMethod
  last4           String?
  brand           String?
  expiryMonth     Int?
  expiryYear      Int?
  isDefault       Boolean  @default(false)
  gatewayToken    String?
  createdAt       DateTime @default(now())
}

// ==================== NOTIFICATIONS ====================

model Notification {
  id              String   @id @default(uuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  type            NotificationType
  title           String
  message         String
  data            Json?
  isRead          Boolean  @default(false)
  readAt          DateTime?
  createdAt       DateTime @default(now())
}

enum NotificationType {
  CHECKLIST_PENDING
  CHECKLIST_APPROVED
  CHECKLIST_REJECTED
  MAINTENANCE_DUE
  JOB_ASSIGNED
  PAYMENT_REMINDER
  SYSTEM_ALERT
}

// ==================== ACTIVITY LOGS ====================

model ActivityLog {
  id              String   @id @default(uuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  action          String
  entityType      String
  entityId        String?
  metadata        Json?
  ipAddress       String?
  userAgent       String?
  createdAt       DateTime @default(now())
}
```

### 2.3 API Endpoint Planlaması

#### Authentication API
```
POST   /api/v1/auth/register           - Yeni kullanıcı kaydı
POST   /api/v1/auth/login              - Kullanıcı girişi
POST   /api/v1/auth/logout             - Çıkış
POST   /api/v1/auth/refresh            - Token yenileme
POST   /api/v1/auth/forgot-password    - Şifre sıfırlama isteği
POST   /api/v1/auth/reset-password     - Şifre sıfırlama
POST   /api/v1/auth/verify-email       - Email doğrulama
POST   /api/v1/auth/2fa/setup          - 2FA kurulumu
POST   /api/v1/auth/2fa/verify         - 2FA doğrulama
```

#### User API
```
GET    /api/v1/users/me                - Mevcut kullanıcı bilgileri
PUT    /api/v1/users/me                - Profil güncelleme
PUT    /api/v1/users/me/password       - Şifre değiştirme
PUT    /api/v1/users/me/avatar         - Avatar yükleme
GET    /api/v1/users                   - Şirket kullanıcıları (Admin)
POST   /api/v1/users                   - Yeni kullanıcı ekleme (Admin)
PUT    /api/v1/users/:id               - Kullanıcı güncelleme (Admin)
DELETE /api/v1/users/:id               - Kullanıcı silme (Admin)
```

#### Company API
```
GET    /api/v1/company                 - Şirket bilgileri
PUT    /api/v1/company                 - Şirket güncelleme
GET    /api/v1/company/settings        - Şirket ayarları
PUT    /api/v1/company/settings        - Ayarları güncelleme
GET    /api/v1/company/stats           - Dashboard istatistikleri
```

#### Machine API
```
GET    /api/v1/machines                - Makine listesi
GET    /api/v1/machines/:id            - Makine detayı
POST   /api/v1/machines                - Makine ekleme
PUT    /api/v1/machines/:id            - Makine güncelleme
DELETE /api/v1/machines/:id            - Makine silme
PUT    /api/v1/machines/:id/status     - Durum güncelleme
PUT    /api/v1/machines/:id/location   - Lokasyon güncelleme
PUT    /api/v1/machines/:id/assign     - Operatör/Checklist atama
GET    /api/v1/machines/:id/history    - Servis geçmişi
POST   /api/v1/machines/:id/service    - Servis kaydı ekleme
GET    /api/v1/machines/:id/faults     - Arıza raporları
POST   /api/v1/machines/:id/faults     - Arıza raporu ekleme
GET    /api/v1/machines/:id/meters     - Sayaç okumaları
POST   /api/v1/machines/:id/meters     - Sayaç okuma kaydet
GET    /api/v1/machines/types          - Makine tipleri listesi
GET    /api/v1/machines/brands         - Marka/Model veritabanı
```

#### Operator API
```
GET    /api/v1/operators               - Operatör listesi
GET    /api/v1/operators/:id           - Operatör detayı
POST   /api/v1/operators               - Operatör ekleme
PUT    /api/v1/operators/:id           - Operatör güncelleme
DELETE /api/v1/operators/:id           - Operatör silme
GET    /api/v1/operators/:id/licenses  - Lisanslar
POST   /api/v1/operators/:id/licenses  - Lisans ekleme
DELETE /api/v1/operators/:id/licenses/:licenseId - Lisans silme
GET    /api/v1/operators/:id/assignments - Atamalar
```

#### Job API
```
GET    /api/v1/jobs                    - İş listesi
GET    /api/v1/jobs/:id                - İş detayı
POST   /api/v1/jobs                    - İş oluşturma
PUT    /api/v1/jobs/:id                - İş güncelleme
DELETE /api/v1/jobs/:id                - İş silme
PUT    /api/v1/jobs/:id/status         - Durum güncelleme
PUT    /api/v1/jobs/:id/progress       - İlerleme güncelleme
POST   /api/v1/jobs/:id/machines       - Makine atama
DELETE /api/v1/jobs/:id/machines/:machineId - Makine çıkarma
POST   /api/v1/jobs/:id/operators      - Operatör atama
DELETE /api/v1/jobs/:id/operators/:operatorId - Operatör çıkarma
```

#### Checklist API
```
GET    /api/v1/checklists/templates    - Şablon listesi
GET    /api/v1/checklists/templates/:id - Şablon detayı
POST   /api/v1/checklists/templates    - Şablon oluşturma
PUT    /api/v1/checklists/templates/:id - Şablon güncelleme
DELETE /api/v1/checklists/templates/:id - Şablon silme

GET    /api/v1/checklists/submissions  - Gönderiler listesi
GET    /api/v1/checklists/submissions/:id - Gönderi detayı
POST   /api/v1/checklists/submissions  - Checklist gönderme (Operatör)
GET    /api/v1/checklists/pending      - Bekleyen onaylar
POST   /api/v1/checklists/:id/approve  - Onayla
POST   /api/v1/checklists/:id/reject   - Reddet
```

#### Finance API
```
GET    /api/v1/invoices                - Fatura listesi
GET    /api/v1/invoices/:id            - Fatura detayı
GET    /api/v1/invoices/:id/pdf        - PDF indirme
GET    /api/v1/billing/summary         - Fatura özeti
GET    /api/v1/billing/usage           - Kullanım detayları
GET    /api/v1/payment-methods         - Ödeme yöntemleri
POST   /api/v1/payment-methods         - Ödeme yöntemi ekleme
DELETE /api/v1/payment-methods/:id     - Ödeme yöntemi silme
PUT    /api/v1/payment-methods/:id/default - Varsayılan yapma
POST   /api/v1/payments                - Ödeme yapma
GET    /api/v1/payments/:id            - Ödeme durumu
```

#### Notification API
```
GET    /api/v1/notifications           - Bildirimler
PUT    /api/v1/notifications/:id/read  - Okundu işaretle
PUT    /api/v1/notifications/read-all  - Tümünü okundu işaretle
DELETE /api/v1/notifications/:id       - Bildirim silme
```

#### Upload API
```
POST   /api/v1/uploads/image           - Resim yükleme
POST   /api/v1/uploads/document        - Döküman yükleme
DELETE /api/v1/uploads/:id             - Dosya silme
```

#### Analytics API
```
GET    /api/v1/analytics/fleet         - Filo analitiği
GET    /api/v1/analytics/usage         - Kullanım analitiği
GET    /api/v1/analytics/operators     - Operatör performansı
GET    /api/v1/analytics/maintenance   - Bakım analitiği
GET    /api/v1/analytics/costs         - Maliyet analitiği
GET    /api/v1/analytics/export        - Rapor dışa aktarma
```

### 2.4 Backend Modül Yapısı (NestJS)

```
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── common/
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── pipes/
│   │   └── utils/
│   ├── config/
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   └── storage.config.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── local.strategy.ts
│   │   │   └── dto/
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── dto/
│   │   ├── companies/
│   │   │   ├── companies.module.ts
│   │   │   ├── companies.controller.ts
│   │   │   ├── companies.service.ts
│   │   │   └── dto/
│   │   ├── machines/
│   │   │   ├── machines.module.ts
│   │   │   ├── machines.controller.ts
│   │   │   ├── machines.service.ts
│   │   │   └── dto/
│   │   ├── operators/
│   │   │   ├── operators.module.ts
│   │   │   ├── operators.controller.ts
│   │   │   ├── operators.service.ts
│   │   │   └── dto/
│   │   ├── jobs/
│   │   │   ├── jobs.module.ts
│   │   │   ├── jobs.controller.ts
│   │   │   ├── jobs.service.ts
│   │   │   └── dto/
│   │   ├── checklists/
│   │   │   ├── checklists.module.ts
│   │   │   ├── checklists.controller.ts
│   │   │   ├── checklists.service.ts
│   │   │   └── dto/
│   │   ├── finance/
│   │   │   ├── finance.module.ts
│   │   │   ├── invoices.controller.ts
│   │   │   ├── payments.controller.ts
│   │   │   ├── invoices.service.ts
│   │   │   ├── payments.service.ts
│   │   │   └── dto/
│   │   ├── notifications/
│   │   │   ├── notifications.module.ts
│   │   │   ├── notifications.controller.ts
│   │   │   ├── notifications.service.ts
│   │   │   ├── notifications.gateway.ts (WebSocket)
│   │   │   └── dto/
│   │   ├── uploads/
│   │   │   ├── uploads.module.ts
│   │   │   ├── uploads.controller.ts
│   │   │   ├── uploads.service.ts
│   │   │   └── dto/
│   │   └── analytics/
│   │       ├── analytics.module.ts
│   │       ├── analytics.controller.ts
│   │       ├── analytics.service.ts
│   │       └── dto/
│   ├── jobs/ (Background Jobs)
│   │   ├── invoice-generation.job.ts
│   │   ├── notification-sender.job.ts
│   │   ├── maintenance-reminder.job.ts
│   │   └── report-generator.job.ts
│   └── prisma/
│       ├── prisma.module.ts
│       ├── prisma.service.ts
│       └── seed.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── test/
│   ├── e2e/
│   └── unit/
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── .env.example
├── nest-cli.json
├── package.json
└── tsconfig.json
```

---

## 3. Mobil Uygulama Planlaması

### 3.1 Teknoloji Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                      MOBILE APP STACK                           │
├─────────────────────────────────────────────────────────────────┤
│  Framework:      React Native 0.76+ (Expo SDK 52)              │
│  Language:       TypeScript 5.x                                 │
│  Navigation:     React Navigation 7.x                          │
│  State:          Zustand + TanStack Query                      │
│  Forms:          React Hook Form + Zod                         │
│  Styling:        Nativewind (Tailwind for RN)                  │
│  UI Components:  Tamagui or React Native Paper                 │
│  Camera:         expo-camera                                   │
│  Location:       expo-location                                 │
│  Biometrics:     expo-local-authentication                     │
│  Push:           expo-notifications + FCM/APNs                 │
│  Storage:        expo-secure-store + MMKV                      │
│  Charts:         Victory Native or react-native-charts-kit    │
│  Maps:           react-native-maps                             │
│  File Upload:    expo-image-picker + axios                     │
│  Offline:        WatermelonDB (local-first)                    │
│  Analytics:      expo-analytics (Mixpanel/Amplitude)           │
│  Crash:          Sentry                                        │
│  Testing:        Jest + Detox (E2E)                            │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Uygulama Yapısı

```
mobile/
├── app/                          # Expo Router (file-based routing)
│   ├── _layout.tsx              # Root layout (auth check)
│   ├── index.tsx                # Entry point
│   ├── (auth)/                  # Auth group
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (operator)/              # Operator role screens
│   │   ├── _layout.tsx          # Bottom tab navigator
│   │   ├── home/
│   │   │   └── index.tsx        # Dashboard
│   │   ├── jobs/
│   │   │   ├── index.tsx        # Job list
│   │   │   ├── [id].tsx         # Job detail
│   │   │   └── [id]/
│   │   │       ├── checklist.tsx    # Checklist flow
│   │   │       ├── meter-start.tsx  # Start meter
│   │   │       └── meter-end.tsx    # End meter
│   │   ├── machines/
│   │   │   ├── index.tsx        # Assigned machines
│   │   │   └── [id].tsx         # Machine detail
│   │   └── profile/
│   │       ├── index.tsx        # Profile
│   │       └── settings.tsx     # Settings
│   ├── (manager)/               # Manager role screens
│   │   ├── _layout.tsx          # Bottom tab navigator
│   │   ├── home/
│   │   │   └── index.tsx        # Dashboard
│   │   ├── fleet/
│   │   │   ├── index.tsx        # All machines
│   │   │   ├── [id].tsx         # Machine detail
│   │   │   └── add.tsx          # Add machine
│   │   ├── approvals/
│   │   │   ├── index.tsx        # Pending list
│   │   │   └── [id].tsx         # Approval detail
│   │   ├── operators/
│   │   │   ├── index.tsx        # Operator list
│   │   │   └── [id].tsx         # Operator detail
│   │   ├── jobs/
│   │   │   ├── index.tsx        # Job list
│   │   │   ├── [id].tsx         # Job detail
│   │   │   └── add.tsx          # Add job
│   │   ├── cart/
│   │   │   ├── index.tsx        # Cart
│   │   │   └── checkout.tsx     # Payment
│   │   └── profile/
│   │       ├── index.tsx        # Profile
│   │       ├── company.tsx      # Company settings
│   │       └── settings.tsx     # App settings
│   └── +not-found.tsx
├── components/
│   ├── ui/                      # Base UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Badge.tsx
│   │   ├── Avatar.tsx
│   │   └── ...
│   ├── forms/                   # Form components
│   │   ├── ChecklistForm.tsx
│   │   ├── MeterInputForm.tsx
│   │   └── ...
│   ├── charts/                  # Chart components
│   │   ├── UsageChart.tsx
│   │   ├── StatusPie.tsx
│   │   └── ...
│   ├── machine/
│   │   ├── MachineCard.tsx
│   │   ├── MachineList.tsx
│   │   └── ...
│   ├── operator/
│   │   ├── OperatorCard.tsx
│   │   └── ...
│   ├── job/
│   │   ├── JobCard.tsx
│   │   └── ...
│   ├── checklist/
│   │   ├── ChecklistItem.tsx
│   │   ├── ChecklistProgress.tsx
│   │   └── ...
│   └── approval/
│       ├── ApprovalCard.tsx
│       └── ApprovalDetail.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useMachines.ts
│   ├── useJobs.ts
│   ├── useChecklists.ts
│   ├── useApprovals.ts
│   ├── useNotifications.ts
│   ├── useLocation.ts
│   ├── useCamera.ts
│   └── useBiometrics.ts
├── services/
│   ├── api/
│   │   ├── client.ts            # Axios instance
│   │   ├── auth.api.ts
│   │   ├── machines.api.ts
│   │   ├── operators.api.ts
│   │   ├── jobs.api.ts
│   │   ├── checklists.api.ts
│   │   ├── finance.api.ts
│   │   └── uploads.api.ts
│   ├── storage/
│   │   ├── secure.ts            # Secure storage
│   │   └── async.ts             # Async storage
│   ├── notifications/
│   │   └── push.ts              # Push notification handler
│   └── analytics/
│       └── tracker.ts           # Event tracking
├── stores/
│   ├── auth.store.ts
│   ├── cart.store.ts
│   ├── settings.store.ts
│   └── offline.store.ts
├── types/
│   ├── api.types.ts
│   ├── navigation.types.ts
│   └── models.types.ts
├── utils/
│   ├── formatters.ts
│   ├── validators.ts
│   └── helpers.ts
├── constants/
│   ├── colors.ts
│   ├── layout.ts
│   └── config.ts
├── assets/
│   ├── images/
│   ├── fonts/
│   └── icons/
├── app.json
├── babel.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

### 3.3 Ekran Akışları

#### Operatör Akışı
```
Login → Home Dashboard
         ├── Günün İşi (Active Job)
         │    └── Start Job → Meter Input → Checklist → End Job → Meter Input → Submit
         ├── Atanmış Makineler
         │    └── Machine Detail (specs, status, history)
         └── Profil & Ayarlar
```

#### Yönetici Akışı
```
Login → Home Dashboard
         ├── Fleet Overview
         │    ├── Machine List → Detail → Edit/Assign
         │    └── Add Machine → Cart → Payment
         ├── Approvals
         │    └── Pending List → Detail → Approve/Reject
         ├── Jobs
         │    ├── Job List → Detail → Progress
         │    └── Add Job → Assign Machines/Operators
         ├── Operators
         │    └── Operator List → Detail
         └── Profil & Ayarlar
```

### 3.4 Önemli Mobil Özellikler

| Özellik | Açıklama | Teknoloji |
|---------|----------|-----------|
| **Offline Mode** | İnternet olmadan checklist doldurma | WatermelonDB + Sync |
| **Photo Capture** | Arıza fotoğrafı çekme | expo-camera |
| **GPS Tracking** | Makine lokasyonu kayıt | expo-location |
| **Push Notifications** | Anlık bildirimler | FCM/APNs |
| **Biometric Auth** | Parmak izi / Face ID | expo-local-authentication |
| **Dark Mode** | Karanlık tema desteği | Nativewind |
| **Localization** | TR/EN dil desteği | i18next |
| **Deep Linking** | Bildirimden direkt açılma | Expo Linking |

---

## 4. Marketing Website Planlaması

### 4.1 Teknoloji Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                    MARKETING WEBSITE STACK                       │
├─────────────────────────────────────────────────────────────────┤
│  Framework:      Next.js 15 (App Router)                        │
│  Language:       TypeScript 5.x                                 │
│  Styling:        Tailwind CSS 4.x                               │
│  UI:             shadcn/ui + Radix Primitives                   │
│  Animations:     Framer Motion                                  │
│  CMS:            Sanity.io or Contentful (Blog/Case Studies)   │
│  Forms:          React Hook Form + Zod                          │
│  Email:          Resend (transactional) + Mailchimp (marketing) │
│  Analytics:      Vercel Analytics + Google Analytics 4          │
│  SEO:            next-seo + JSON-LD structured data            │
│  A/B Testing:    Vercel Edge Config or PostHog                 │
│  Deployment:     Vercel                                         │
│  Performance:    Image optimization, ISR, edge functions       │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Site Yapısı

```
marketing-website/
├── app/
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Homepage
│   ├── globals.css
│   ├── (marketing)/
│   │   ├── layout.tsx           # Marketing layout (header/footer)
│   │   ├── features/
│   │   │   └── page.tsx         # Features page
│   │   ├── pricing/
│   │   │   └── page.tsx         # Pricing page
│   │   ├── about/
│   │   │   └── page.tsx         # About us
│   │   ├── contact/
│   │   │   └── page.tsx         # Contact form
│   │   ├── demo/
│   │   │   └── page.tsx         # Book a demo
│   │   ├── roi-calculator/
│   │   │   └── page.tsx         # Interactive ROI calculator
│   │   └── industries/
│   │       ├── page.tsx         # Industries overview
│   │       ├── construction/
│   │       │   └── page.tsx
│   │       ├── mining/
│   │       │   └── page.tsx
│   │       └── logistics/
│   │           └── page.tsx
│   ├── (resources)/
│   │   ├── layout.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx         # Blog list
│   │   │   └── [slug]/
│   │   │       └── page.tsx     # Blog post
│   │   ├── case-studies/
│   │   │   ├── page.tsx         # Case studies list
│   │   │   └── [slug]/
│   │   │       └── page.tsx     # Case study detail
│   │   ├── guides/
│   │   │   └── page.tsx         # Guides & ebooks
│   │   ├── webinars/
│   │   │   └── page.tsx         # Webinars
│   │   └── help-center/
│   │       ├── page.tsx         # Help center
│   │       └── [category]/
│   │           └── [slug]/
│   │               └── page.tsx
│   ├── (legal)/
│   │   ├── privacy/
│   │   │   └── page.tsx         # Privacy policy
│   │   ├── terms/
│   │   │   └── page.tsx         # Terms of service
│   │   └── cookies/
│   │       └── page.tsx         # Cookie policy
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx         # Login redirect to app
│   │   └── signup/
│   │       └── page.tsx         # Signup flow
│   ├── api/
│   │   ├── contact/
│   │   │   └── route.ts         # Contact form handler
│   │   ├── demo/
│   │   │   └── route.ts         # Demo booking
│   │   ├── newsletter/
│   │   │   └── route.ts         # Newsletter signup
│   │   └── roi/
│   │       └── route.ts         # ROI calculation API
│   └── sitemap.ts               # Dynamic sitemap
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── MobileNav.tsx
│   │   └── CookieBanner.tsx
│   ├── sections/
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── Benefits.tsx
│   │   ├── Testimonials.tsx
│   │   ├── ROICalculator.tsx
│   │   ├── Pricing.tsx
│   │   ├── CTASection.tsx
│   │   ├── TrustedBy.tsx
│   │   └── FAQ.tsx
│   ├── ui/                      # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── forms/
│   │   ├── ContactForm.tsx
│   │   ├── DemoForm.tsx
│   │   └── NewsletterForm.tsx
│   └── shared/
│       ├── Logo.tsx
│       ├── SocialLinks.tsx
│       └── LanguageSwitcher.tsx
├── lib/
│   ├── sanity/                  # CMS client
│   ├── email/                   # Email templates
│   └── utils.ts
├── content/                     # Static content
│   ├── features.json
│   ├── pricing.json
│   └── faqs.json
├── public/
│   ├── images/
│   ├── icons/
│   └── videos/
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 4.3 Sayfa Planları

#### Homepage (/)
- Hero section with headline + CTA
- Trusted by logos (müşteri logoları)
- Key features (3-4 highlight)
- How it works (3 steps)
- Benefits section
- Interactive ROI Calculator widget
- Testimonials/Case study highlights
- CTA section
- Footer with links

#### Features (/features)
- Feature grid with icons
- Detailed feature sections:
  - Fleet Management
  - Digital Checklists
  - Approval Workflows
  - Real-time Tracking
  - Financial Management
  - Analytics & Reporting
  - Mobile App
  - AI-Powered Insights

#### Pricing (/pricing)
- Pay-as-you-go model highlight
- Volume discount explanation
- Feature comparison table
- FAQ section
- Enterprise contact CTA

#### Industries (/industries/*)
- Industry-specific landing pages
- Use cases
- Relevant features
- Industry stats
- Case studies

#### ROI Calculator (/roi-calculator)
- Full-page interactive calculator
- Input: machine count, current costs
- Output: estimated savings
- PDF report download
- Lead capture form

#### Blog (/blog)
- SEO-optimized articles
- Categories: Industry, Product, Tips
- Author pages
- Related posts
- Newsletter signup

#### Case Studies (/case-studies)
- Customer success stories
- Metrics and results
- Video testimonials
- Industry filters

### 4.4 SEO Stratejisi

```typescript
// next-seo default config
const seoConfig = {
  defaultTitle: 'Smartop - Ağır İş Makinesi Filo Yönetimi',
  titleTemplate: '%s | Smartop',
  description: 'Ağır iş makinelerinizi dijital olarak yönetin. Gerçek zamanlı takip, dijital kontrol listeleri, onay iş akışları ve detaylı raporlama.',
  canonical: 'https://smartop.io',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://smartop.io',
    siteName: 'Smartop',
    images: [{ url: 'https://smartop.io/og-image.jpg' }],
  },
  twitter: {
    cardType: 'summary_large_image',
    site: '@smartop_io',
  },
  additionalMetaTags: [
    { name: 'keywords', content: 'filo yönetimi, iş makinesi, dijital checklist, fleet management' },
  ],
};
```

---

## 5. Geliştirme Fazları ve Önceliklendirme

### Faz 1: Backend MVP (4-6 hafta)
1. Proje kurulumu (NestJS, Prisma, PostgreSQL)
2. Authentication & Authorization
3. Company & User management
4. Machine CRUD + basic operations
5. Operator CRUD
6. Basic API documentation

### Faz 2: Backend Core Features (4-6 hafta)
1. Job management
2. Checklist templates & submissions
3. Approval workflow
4. File upload (S3)
5. Notification system (email + in-app)
6. WebSocket for real-time updates

### Faz 3: Backend Advanced (3-4 hafta)
1. Finance module (invoices, billing)
2. Payment integration (iyzico)
3. Analytics & reporting
4. Background jobs (cron, queues)
5. Admin dashboard API

### Faz 4: Mobile App MVP (4-6 hafta)
1. Project setup (Expo + React Native)
2. Authentication flows
3. Operator home & job flow
4. Checklist submission with photos
5. Basic manager view (fleet, approvals)

### Faz 5: Mobile App Complete (3-4 hafta)
1. Full manager features
2. Push notifications
3. Offline mode
4. Biometric auth
5. Polish & testing

### Faz 6: Marketing Website (3-4 hafta)
1. Next.js project setup
2. Homepage + core pages
3. Blog integration (CMS)
4. Contact & demo forms
5. SEO optimization
6. Analytics setup

---

## 6. Kalite Gereksinimleri

### 6.1 Code Quality
- ESLint + Prettier configuration
- Husky pre-commit hooks
- 80%+ test coverage
- SonarQube integration

### 6.2 Security
- OWASP Top 10 compliance
- Rate limiting
- Input validation (Zod/Joi)
- SQL injection prevention (Prisma)
- XSS prevention
- CORS configuration
- Helmet.js headers
- Regular dependency audits

### 6.3 Performance
- API response time < 200ms
- Database query optimization
- Redis caching
- CDN for static assets
- Image optimization
- Lazy loading

### 6.4 Monitoring
- Application metrics (Prometheus)
- Error tracking (Sentry)
- Log aggregation (ELK)
- Uptime monitoring
- Performance budgets

---

## 7. DevOps & Infrastructure

### 7.1 Development Environment
```yaml
# docker-compose.dev.yml
services:
  postgres:
    image: postgres:16
    ports:
      - "5432:5432"
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  minio:
    image: minio/minio
    ports:
      - "9000:9000"
```

### 7.2 Production Infrastructure
- **Cloud:** AWS / Google Cloud
- **Compute:** ECS/EKS or Cloud Run
- **Database:** RDS PostgreSQL (Multi-AZ)
- **Cache:** ElastiCache Redis
- **Storage:** S3 / Cloud Storage
- **CDN:** CloudFront / Cloud CDN
- **CI/CD:** GitHub Actions
- **Secrets:** AWS Secrets Manager
- **DNS:** Route 53 / Cloud DNS

---

## 8. Sonraki Adımlar

1. Backend projesinin oluşturulması ve temel yapının kurulması
2. Veritabanı şemasının migration'a dönüştürülmesi
3. Authentication modülünün geliştirilmesi
4. Frontend'in API entegrasyonuna hazırlanması
5. Mobil uygulama proje yapısının oluşturulması
6. Marketing website tasarımının finalize edilmesi

---

**Hazırlayan:** Claude AI
**Versiyon:** 1.0
**Güncelleme:** 27 Kasım 2025
