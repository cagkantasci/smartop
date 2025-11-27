# Smartop - Strategic Project Analysis & Development Plan

> **Document Version**: 1.0
> **Date**: November 2025
> **Status**: Planning Phase

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current Codebase Analysis](#2-current-codebase-analysis)
3. [Code Quality Assessment](#3-code-quality-assessment)
4. [Security Assessment](#4-security-assessment)
5. [Backend Architecture Plan](#5-backend-architecture-plan)
6. [Mobile Application Plan](#6-mobile-application-plan)
7. [Marketing Website Plan](#7-marketing-website-plan)
8. [Implementation Roadmap](#8-implementation-roadmap)
9. [Risk Assessment](#9-risk-assessment)
10. [Technical Specifications](#10-technical-specifications)

---

## 1. Executive Summary

**Smartop** is a B2B SaaS platform for heavy equipment management, digitizing control processes and workflow approvals between Managers and Operators in the construction, mining, and logistics industries.

### Vision
Transform paper-based equipment inspection workflows into a seamless digital experience, reducing downtime by 40% and improving operational efficiency.

### Current State
The project is currently a **frontend-only React prototype** built with Vite, featuring a complete UI demonstration but lacking backend infrastructure.

### Key Statistics
| Metric | Value |
|--------|-------|
| Total Components | 13 |
| Lines of Code | ~4,500 |
| Type Definitions | 24 |
| Languages Supported | Turkish, English |

---

## 2. Current Codebase Analysis

### Project Structure

```
smartop/
├── App.tsx                    # Main app with all state management (214 lines)
├── index.tsx                  # React entry point
├── types.ts                   # TypeScript type definitions (272 lines)
├── vite.config.ts            # Vite configuration
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript configuration
├── index.html                # HTML entry
│
├── components/
│   ├── Dashboard.tsx         # Operational overview with charts (440 lines)
│   ├── MachineManagement.tsx # Fleet CRUD operations (777 lines)
│   ├── OperatorManagement.tsx# Personnel management (304 lines)
│   ├── JobManagement.tsx     # Job/site tracking (163 lines)
│   ├── ChecklistManagement.tsx# Template editor (230 lines)
│   ├── ApprovalWorkflow.tsx  # Manager approvals (211 lines)
│   ├── FinanceModule.tsx     # Billing/invoices (188 lines)
│   ├── Settings.tsx          # User preferences (353 lines)
│   ├── Sidebar.tsx           # Navigation (151 lines)
│   ├── LandingPage.tsx       # Marketing page (229 lines)
│   ├── MobileAppSimulator.tsx# Mobile demo (897 lines)
│   └── GeminiAdvisor.tsx     # AI assistant (99 lines)
```

### Technology Stack

| Layer | Technology | Version | Status |
|-------|------------|---------|--------|
| Framework | React | 19.0.0 | ✅ Current |
| Build Tool | Vite | 6.2.0 | ✅ Current |
| Language | TypeScript | 5.8.3 | ✅ Current |
| Styling | Tailwind CSS | 3.x (CDN) | ⚠️ Needs setup |
| Charts | Recharts | 2.15.3 | ✅ Good |
| Animation | Framer Motion | 12.0.0 | ✅ Good |
| Icons | Lucide React | 0.469.0 | ✅ Good |
| AI | @google/genai | 1.0.1 | ⚠️ Needs API key |

### Features Implemented (Frontend Only)

| Feature | Component | Status |
|---------|-----------|--------|
| Dashboard with KPIs | Dashboard.tsx | ✅ UI Complete |
| Machine Fleet Management | MachineManagement.tsx | ✅ UI Complete |
| Operator Management | OperatorManagement.tsx | ✅ UI Complete |
| Job/Site Tracking | JobManagement.tsx | ✅ UI Complete |
| Checklist Templates | ChecklistManagement.tsx | ✅ UI Complete |
| Approval Workflow | ApprovalWorkflow.tsx | ✅ UI Complete |
| Finance/Billing | FinanceModule.tsx | ✅ UI Complete |
| Settings | Settings.tsx | ✅ UI Complete |
| Mobile Simulator | MobileAppSimulator.tsx | ✅ UI Complete |
| AI Advisor | GeminiAdvisor.tsx | ⚠️ Needs API |
| Landing Page | LandingPage.tsx | ✅ UI Complete |
| Dark Mode | App.tsx | ✅ Working |
| i18n (TR/EN) | App.tsx | ✅ Working |

---

## 3. Code Quality Assessment

### Strengths

1. **TypeScript Usage**: Well-typed with comprehensive interfaces
2. **Component Architecture**: Logical separation of concerns
3. **Internationalization**: Full TR/EN support with translation dictionaries
4. **Theme Support**: Dark mode with consistent styling
5. **Responsive Design**: Mobile-first approach
6. **UI/UX Quality**: Professional, polished interface with animations

### Issues Identified

| Severity | Issue | Location | Impact | Recommendation |
|----------|-------|----------|--------|----------------|
| 🔴 High | All state in App.tsx | `App.tsx:77-138` | Scalability | Migrate to Zustand/Redux |
| 🔴 High | No backend/persistence | All components | Data loss | Build API layer |
| 🔴 High | No authentication | `App.tsx:77` | Security | Implement JWT auth |
| 🟠 Medium | Large components | `MobileAppSimulator.tsx` | Maintainability | Split into modules |
| 🟠 Medium | No form validation | All forms | Data integrity | Add react-hook-form + zod |
| 🟠 Medium | No error boundaries | App-wide | UX | Add error handling |
| 🟠 Medium | Hardcoded mock data | `App.tsx:18-48` | Testing | Move to fixtures/API |
| 🟡 Low | No tests | Project-wide | Quality | Add Jest + RTL |
| 🟡 Low | Missing ESLint config | Root | Consistency | Add linting rules |
| 🟡 Low | Tailwind via CDN | index.html | Performance | Install via npm |

### Code Metrics

```
Component Size Distribution:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MobileAppSimulator.tsx  ████████████████████████████████ 897 lines
MachineManagement.tsx   ███████████████████████████ 777 lines
Dashboard.tsx           ███████████████ 440 lines
Settings.tsx            ████████████ 353 lines
OperatorManagement.tsx  ██████████ 304 lines
types.ts                █████████ 272 lines
ChecklistManagement.tsx ████████ 230 lines
LandingPage.tsx         ████████ 229 lines
App.tsx                 ███████ 214 lines
ApprovalWorkflow.tsx    ███████ 211 lines
FinanceModule.tsx       ██████ 188 lines
JobManagement.tsx       █████ 163 lines
Sidebar.tsx             █████ 151 lines
GeminiAdvisor.tsx       ███ 99 lines
```

---

## 4. Security Assessment

### Current Security Posture: 🔴 Critical (Prototype Only)

This is expected for a prototype but must be addressed before production.

### Critical Security Gaps

| # | Vulnerability | Risk Level | Description |
|---|---------------|------------|-------------|
| 1 | No Authentication | 🔴 Critical | Login is simulated with boolean state |
| 2 | No Authorization | 🔴 Critical | No role-based access control |
| 3 | API Key Exposure | 🔴 Critical | Gemini key in client-side code |
| 4 | No Input Validation | 🟠 High | User inputs not sanitized |
| 5 | External Images | 🟠 High | Unsplash URLs could be XSS vectors |
| 6 | No HTTPS Enforcement | 🟠 High | No SSL configuration |
| 7 | Mock Payment | 🟡 Medium | No actual payment security |
| 8 | Local Storage | 🟡 Medium | Sensitive data in browser |

### Security Requirements for Production

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Authentication                                             │
│  ├── JWT access tokens (15min expiry)                      │
│  ├── Refresh tokens (7 days, httpOnly cookie)              │
│  ├── OAuth2/SAML for enterprise SSO                        │
│  └── MFA support (TOTP)                                    │
│                                                             │
│  Authorization                                              │
│  ├── Role-based: Admin, Manager, Operator                  │
│  ├── Resource-based: Own machines, org machines            │
│  └── Permission matrix per endpoint                        │
│                                                             │
│  API Security                                               │
│  ├── Rate limiting (100 req/min per user)                  │
│  ├── CORS whitelist                                        │
│  ├── Input validation (zod schemas)                        │
│  ├── SQL injection prevention (parameterized queries)      │
│  └── XSS prevention (output encoding)                      │
│                                                             │
│  Data Security                                              │
│  ├── Encryption at rest (AES-256)                          │
│  ├── TLS 1.3 in transit                                    │
│  ├── PII masking in logs                                   │
│  └── GDPR/KVKK compliance                                  │
│                                                             │
│  Infrastructure                                             │
│  ├── WAF (Web Application Firewall)                        │
│  ├── DDoS protection                                       │
│  ├── Secrets management (AWS Secrets Manager)              │
│  └── Audit logging                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Backend Architecture Plan

### Recommended Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND STACK                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Runtime:          Node.js 20 LTS                           │
│  Framework:        NestJS 10.x (TypeScript, modular)        │
│  Database:         PostgreSQL 16 (relational integrity)     │
│  ORM:              Prisma (type-safe queries)               │
│  Cache:            Redis 7 (sessions, real-time pub/sub)    │
│  Queue:            BullMQ (background jobs)                 │
│  Storage:          AWS S3 / Cloudflare R2 (images, docs)    │
│  Real-time:        Socket.io (notifications, live updates)  │
│  Search:           Meilisearch (optional, for fleet search) │
│  Email:            SendGrid / AWS SES                       │
│  Monitoring:       Prometheus + Grafana                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### System Architecture Diagram

```
                                    ┌──────────────────┐
                                    │   CloudFlare     │
                                    │   (CDN + WAF)    │
                                    └────────┬─────────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
            ┌───────▼───────┐       ┌───────▼───────┐       ┌───────▼───────┐
            │  Web App      │       │  Mobile App   │       │  Marketing    │
            │  (React)      │       │  (React Native│       │  (Next.js)    │
            │  app.smartop  │       │  iOS/Android) │       │  smartop.com  │
            └───────┬───────┘       └───────┬───────┘       └───────────────┘
                    │                       │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │    API Gateway        │
                    │    (Kong / AWS)       │
                    │    api.smartop.com    │
                    └───────────┬───────────┘
                                │
            ┌───────────────────┼───────────────────┐
            │                   │                   │
    ┌───────▼───────┐   ┌──────▼──────┐   ┌───────▼───────┐
    │  Auth Service │   │  Core API   │   │  Notification │
    │  (NestJS)     │   │  (NestJS)   │   │  Service      │
    └───────┬───────┘   └──────┬──────┘   └───────┬───────┘
            │                  │                   │
            └──────────────────┼───────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
┌───────▼───────┐      ┌──────▼──────┐      ┌───────▼───────┐
│  PostgreSQL   │      │   Redis     │      │   S3/R2       │
│  (Primary DB) │      │   (Cache)   │      │   (Storage)   │
└───────────────┘      └─────────────┘      └───────────────┘
```

### Database Schema

```sql
-- ============================================
-- SMARTOP DATABASE SCHEMA
-- PostgreSQL 16+
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ORGANIZATIONS (Multi-tenant root)
-- ============================================
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    tax_number VARCHAR(50),
    tax_office VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    logo_url TEXT,
    subscription_tier VARCHAR(20) DEFAULT 'starter'
        CHECK (subscription_tier IN ('starter', 'professional', 'enterprise')),
    subscription_status VARCHAR(20) DEFAULT 'active'
        CHECK (subscription_status IN ('active', 'past_due', 'cancelled', 'trial')),
    trial_ends_at TIMESTAMP,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- USERS
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'operator'
        CHECK (role IN ('admin', 'manager', 'operator')),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    job_title VARCHAR(100),
    licenses TEXT[] DEFAULT '{}',
    specialties TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    email_verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, email)
);

-- ============================================
-- MACHINES
-- ============================================
CREATE TABLE machines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    machine_type VARCHAR(50) NOT NULL
        CHECK (machine_type IN ('excavator', 'dozer', 'crane', 'loader', 'truck', 'grader', 'roller', 'other')),
    serial_number VARCHAR(100),
    license_plate VARCHAR(20),
    status VARCHAR(20) DEFAULT 'idle'
        CHECK (status IN ('active', 'idle', 'maintenance', 'out_of_service')),
    engine_hours DECIMAL(10,2) DEFAULT 0,
    odometer DECIMAL(12,2) DEFAULT 0,
    fuel_type VARCHAR(20),
    fuel_capacity DECIMAL(8,2),
    last_service_date DATE,
    next_service_date DATE,
    next_service_hours DECIMAL(10,2),
    image_url TEXT,
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    location_address TEXT,
    location_updated_at TIMESTAMP,
    assigned_operator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    checklist_template_id UUID,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, serial_number)
);

-- ============================================
-- CHECKLIST TEMPLATES
-- ============================================
CREATE TABLE checklist_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    machine_types TEXT[] DEFAULT '{}',
    items JSONB NOT NULL DEFAULT '[]',
    -- items format: [{"id": "uuid", "label": "Motor Yağı Kontrolü", "type": "boolean", "required": true}]
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key after checklist_templates exists
ALTER TABLE machines
    ADD CONSTRAINT fk_checklist_template
    FOREIGN KEY (checklist_template_id)
    REFERENCES checklist_templates(id) ON DELETE SET NULL;

-- ============================================
-- CHECKLIST SUBMISSIONS
-- ============================================
CREATE TABLE checklist_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES checklist_templates(id),
    operator_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),
    entries JSONB NOT NULL DEFAULT '[]',
    -- entries format: [{"item_id": "uuid", "label": "...", "is_ok": true, "value": "...", "photo_url": "..."}]
    issues_count INTEGER DEFAULT 0,
    notes TEXT,
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewer_id UUID REFERENCES users(id),
    reviewer_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- JOBS / WORK ORDERS
-- ============================================
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location_name VARCHAR(255),
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    location_address TEXT,
    status VARCHAR(20) DEFAULT 'scheduled'
        CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'delayed')),
    priority VARCHAR(20) DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    scheduled_start DATE,
    scheduled_end DATE,
    actual_start TIMESTAMP,
    actual_end TIMESTAMP,
    estimated_hours DECIMAL(8,2),
    actual_hours DECIMAL(8,2),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- JOB ASSIGNMENTS (Many-to-Many)
-- ============================================
CREATE TABLE job_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    machine_id UUID REFERENCES machines(id) ON DELETE SET NULL,
    operator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    start_meter_reading DECIMAL(12,2),
    end_meter_reading DECIMAL(12,2),
    notes TEXT,
    UNIQUE(job_id, machine_id)
);

-- ============================================
-- SERVICE RECORDS
-- ============================================
CREATE TABLE service_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    service_type VARCHAR(50) NOT NULL
        CHECK (service_type IN ('maintenance', 'repair', 'inspection', 'oil_change', 'tire_change', 'other')),
    description TEXT NOT NULL,
    performed_by VARCHAR(255),
    vendor VARCHAR(255),
    cost DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'TRY',
    parts_used JSONB DEFAULT '[]',
    meter_reading DECIMAL(12,2),
    service_date DATE NOT NULL,
    next_service_date DATE,
    next_service_hours DECIMAL(10,2),
    attachments TEXT[] DEFAULT '{}',
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INVOICES
-- ============================================
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TRY',
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('draft', 'pending', 'paid', 'overdue', 'cancelled')),
    description TEXT,
    line_items JSONB DEFAULT '[]',
    -- line_items format: [{"description": "...", "quantity": 1, "unit_price": 500, "total": 500}]
    billing_period_start DATE,
    billing_period_end DATE,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    paid_at TIMESTAMP,
    payment_method VARCHAR(50),
    stripe_invoice_id VARCHAR(100),
    pdf_url TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- AUDIT LOG
-- ============================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- REFRESH TOKENS
-- ============================================
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_machines_org ON machines(organization_id);
CREATE INDEX idx_machines_status ON machines(status);
CREATE INDEX idx_machines_operator ON machines(assigned_operator_id);
CREATE INDEX idx_checklist_submissions_org ON checklist_submissions(organization_id);
CREATE INDEX idx_checklist_submissions_status ON checklist_submissions(status);
CREATE INDEX idx_checklist_submissions_machine ON checklist_submissions(machine_id);
CREATE INDEX idx_checklist_submissions_date ON checklist_submissions(submitted_at);
CREATE INDEX idx_jobs_org ON jobs(organization_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_service_records_machine ON service_records(machine_id);
CREATE INDEX idx_invoices_org ON invoices(organization_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
```

### API Endpoints

```
BASE URL: https://api.smartop.com/v1

┌─────────────────────────────────────────────────────────────────────────────┐
│ AUTHENTICATION                                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│ POST   /auth/register          Register new organization + admin user       │
│ POST   /auth/login             Login and receive tokens                     │
│ POST   /auth/refresh           Refresh access token                         │
│ POST   /auth/logout            Revoke refresh token                         │
│ POST   /auth/forgot-password   Request password reset                       │
│ POST   /auth/reset-password    Reset password with token                    │
│ GET    /auth/me                Get current user profile                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ ORGANIZATIONS                                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ GET    /organizations/:id      Get organization details                     │
│ PATCH  /organizations/:id      Update organization                          │
│ GET    /organizations/:id/stats Get organization statistics                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ USERS                                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ GET    /users                  List users (paginated, filterable)           │
│ POST   /users                  Create new user (invite)                     │
│ GET    /users/:id              Get user details                             │
│ PATCH  /users/:id              Update user                                  │
│ DELETE /users/:id              Deactivate user                              │
│ POST   /users/:id/avatar       Upload user avatar                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ MACHINES                                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ GET    /machines               List machines (paginated, filterable)        │
│ POST   /machines               Create new machine                           │
│ GET    /machines/:id           Get machine details                          │
│ PATCH  /machines/:id           Update machine                               │
│ DELETE /machines/:id           Delete machine                               │
│ POST   /machines/:id/image     Upload machine image                         │
│ PATCH  /machines/:id/location  Update machine location                      │
│ GET    /machines/:id/history   Get machine service history                  │
│ GET    /machines/:id/checklists Get machine checklist history               │
│ POST   /machines/:id/assign    Assign operator to machine                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ CHECKLISTS                                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ GET    /checklist-templates    List checklist templates                     │
│ POST   /checklist-templates    Create new template                          │
│ GET    /checklist-templates/:id Get template details                        │
│ PATCH  /checklist-templates/:id Update template                             │
│ DELETE /checklist-templates/:id Delete template                             │
│                                                                             │
│ GET    /checklist-submissions  List submissions (filterable by status)      │
│ POST   /checklist-submissions  Submit new checklist                         │
│ GET    /checklist-submissions/:id Get submission details                    │
│ PATCH  /checklist-submissions/:id/approve Approve submission                │
│ PATCH  /checklist-submissions/:id/reject  Reject submission                 │
│ POST   /checklist-submissions/:id/photos  Upload photo evidence             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ JOBS                                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ GET    /jobs                   List jobs (paginated, filterable)            │
│ POST   /jobs                   Create new job                               │
│ GET    /jobs/:id               Get job details                              │
│ PATCH  /jobs/:id               Update job                                   │
│ DELETE /jobs/:id               Delete job                                   │
│ POST   /jobs/:id/assign        Assign machines/operators                    │
│ PATCH  /jobs/:id/start         Start job                                    │
│ PATCH  /jobs/:id/complete      Complete job                                 │
│ GET    /jobs/:id/timeline      Get job activity timeline                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ SERVICE RECORDS                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ GET    /service-records        List service records                         │
│ POST   /service-records        Create service record                        │
│ GET    /service-records/:id    Get service record details                   │
│ PATCH  /service-records/:id    Update service record                        │
│ DELETE /service-records/:id    Delete service record                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ INVOICES                                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ GET    /invoices               List invoices                                │
│ GET    /invoices/:id           Get invoice details                          │
│ GET    /invoices/:id/pdf       Download invoice PDF                         │
│ GET    /billing/subscription   Get current subscription                     │
│ POST   /billing/subscribe      Subscribe to plan                            │
│ PATCH  /billing/subscription   Update subscription                          │
│ DELETE /billing/subscription   Cancel subscription                          │
│ GET    /billing/payment-methods List payment methods                        │
│ POST   /billing/payment-methods Add payment method                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ ANALYTICS                                                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ GET    /analytics/dashboard    Get dashboard KPIs                           │
│ GET    /analytics/machines     Get machine utilization stats                │
│ GET    /analytics/operators    Get operator performance stats               │
│ GET    /analytics/checklists   Get checklist compliance stats               │
│ GET    /analytics/reports      Generate custom report                       │
│ GET    /analytics/export       Export data (CSV/Excel)                      │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ NOTIFICATIONS                                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ GET    /notifications          List user notifications                      │
│ PATCH  /notifications/:id/read Mark as read                                 │
│ POST   /notifications/read-all Mark all as read                             │
│ GET    /notifications/settings Get notification preferences                 │
│ PATCH  /notifications/settings Update preferences                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ WEBHOOKS (for integrations)                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ GET    /webhooks               List webhooks                                │
│ POST   /webhooks               Create webhook                               │
│ DELETE /webhooks/:id           Delete webhook                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Mobile Application Plan

### Platform Strategy

**React Native with Expo** - Maximizes code sharing with existing React codebase while providing native performance.

### Application Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SMARTOP MOBILE APPS                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────┐       ┌─────────────────────────┐            │
│   │     OPERATOR APP        │       │     MANAGER APP         │            │
│   │     (Field Workers)     │       │     (Supervisors)       │            │
│   ├─────────────────────────┤       ├─────────────────────────┤            │
│   │                         │       │                         │            │
│   │ • Daily checklist       │       │ • Approval queue        │            │
│   │ • Photo capture         │       │ • Fleet map view        │            │
│   │ • Meter/hour logging    │       │ • Machine status        │            │
│   │ • Job start/stop        │       │ • Team overview         │            │
│   │ • Offline mode          │       │ • Analytics             │            │
│   │ • GPS tracking          │       │ • Notifications         │            │
│   │ • QR code scanning      │       │ • Reports               │            │
│   │                         │       │                         │            │
│   └─────────────────────────┘       └─────────────────────────┘            │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────┐          │
│   │                    SHARED COMPONENTS                         │          │
│   ├─────────────────────────────────────────────────────────────┤          │
│   │ • Authentication (Biometric + PIN)                          │          │
│   │ • Push Notifications (FCM)                                  │          │
│   │ • Offline Storage (WatermelonDB)                            │          │
│   │ • Camera Integration (Expo Camera)                          │          │
│   │ • Location Services (Expo Location)                         │          │
│   │ • Deep Linking                                              │          │
│   └─────────────────────────────────────────────────────────────┘          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Framework | React Native 0.73+ | Cross-platform native apps |
| Tooling | Expo SDK 50+ | Simplified development |
| State | Zustand + React Query | State management + caching |
| Offline DB | WatermelonDB | SQLite-based offline storage |
| Navigation | React Navigation 6 | Screen navigation |
| Forms | React Hook Form | Form handling |
| Camera | Expo Camera | Photo capture |
| Location | Expo Location | GPS tracking |
| Push | Expo Notifications + FCM | Push notifications |
| Auth | Expo SecureStore | Secure token storage |
| Maps | React Native Maps | Fleet location view |

### Screen Flows

#### Operator App Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Login   │───▶│   Home   │───▶│ Machine  │───▶│Checklist │
│  Screen  │    │Dashboard │    │  Select  │    │   Flow   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                     │                               │
                     ▼                               ▼
               ┌──────────┐                   ┌──────────┐
               │   Jobs   │                   │  Photo   │
               │   List   │                   │ Capture  │
               └──────────┘                   └──────────┘
                     │                               │
                     ▼                               ▼
               ┌──────────┐                   ┌──────────┐
               │   Job    │                   │  Submit  │
               │  Detail  │                   │  Review  │
               └──────────┘                   └──────────┘
                     │
                     ▼
               ┌──────────┐
               │  Meter   │
               │  Input   │
               └──────────┘
```

#### Manager App Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐
│  Login   │───▶│Dashboard │───▶│ Approval │
│  Screen  │    │   KPIs   │    │   Queue  │
└──────────┘    └──────────┘    └──────────┘
                     │               │
                     ▼               ▼
               ┌──────────┐    ┌──────────┐
               │  Fleet   │    │ Checklist│
               │   Map    │    │  Detail  │
               └──────────┘    └──────────┘
                     │               │
                     ▼               ▼
               ┌──────────┐    ┌──────────┐
               │ Machine  │    │ Approve/ │
               │  Detail  │    │  Reject  │
               └──────────┘    └──────────┘
```

### Offline-First Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         OFFLINE SYNC ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐         ┌─────────────┐         ┌─────────────┐          │
│   │   UI Layer  │◀───────▶│ Repository  │◀───────▶│  API Layer  │          │
│   └─────────────┘         │   Pattern   │         └──────┬──────┘          │
│                           └──────┬──────┘                │                 │
│                                  │                       │                 │
│                                  ▼                       ▼                 │
│                           ┌─────────────┐         ┌─────────────┐          │
│                           │WatermelonDB │         │  REST API   │          │
│                           │  (SQLite)   │◀───────▶│   Server    │          │
│                           └─────────────┘  Sync   └─────────────┘          │
│                                                                             │
│   Sync Strategy:                                                            │
│   1. All reads from local DB first                                         │
│   2. Writes queued in local DB                                             │
│   3. Background sync when online                                           │
│   4. Conflict resolution: Server wins (with local backup)                  │
│   5. Photo uploads queued separately                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Marketing Website Plan

### Information Architecture

```
smartop.com/
│
├── / (Homepage)
│   ├── Hero section with value proposition
│   ├── Feature highlights (3-4 key benefits)
│   ├── Interactive ROI calculator
│   ├── Customer logos & testimonials
│   ├── Pricing preview
│   └── CTA: Start free trial
│
├── /features
│   ├── /features/fleet-management
│   ├── /features/digital-checklists
│   ├── /features/approval-workflows
│   ├── /features/mobile-apps
│   ├── /features/analytics
│   └── /features/integrations
│
├── /pricing
│   ├── Plan comparison table
│   ├── ROI calculator
│   ├── FAQ
│   └── Enterprise contact form
│
├── /use-cases
│   ├── /use-cases/construction
│   ├── /use-cases/mining
│   ├── /use-cases/rental
│   └── /use-cases/logistics
│
├── /resources
│   ├── /blog
│   ├── /guides
│   ├── /api-docs
│   └── /help-center
│
├── /company
│   ├── /about
│   ├── /careers
│   └── /contact
│
└── /auth
    ├── /login
    ├── /register
    └── /reset-password
```

### Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Framework | Next.js 14 (App Router) | SSR/SSG for SEO |
| Styling | Tailwind CSS | Consistent design system |
| CMS | Sanity.io | Blog & content management |
| Analytics | Google Analytics 4 + Mixpanel | User behavior tracking |
| Chat | Intercom | Customer support |
| Forms | HubSpot | Lead capture |
| Hosting | Vercel | Edge deployment |
| CDN | Cloudflare | Performance & security |

### SEO Strategy

**Primary Keywords (Turkish Market)**
- "iş makinesi yönetimi" (heavy equipment management)
- "filo takip yazılımı" (fleet tracking software)
- "şantiye kontrol uygulaması" (construction site control app)
- "makine bakım yazılımı" (equipment maintenance software)
- "dijital kontrol listesi" (digital checklist)

**Content Strategy**
1. Industry-specific blog posts (2/week)
2. Case studies with ROI metrics
3. Comparison guides (vs. paper forms, vs. competitors)
4. How-to guides and tutorials
5. Industry reports and whitepapers

### Conversion Optimization

```
Funnel Stages:
───────────────────────────────────────────────────────────────────────────────
Stage 1: Awareness
├── SEO-optimized landing pages
├── Google Ads (search + display)
├── LinkedIn ads (B2B targeting)
└── Industry event presence

Stage 2: Interest
├── ROI calculator engagement
├── Blog content consumption
├── Newsletter signup
└── Resource downloads

Stage 3: Consideration
├── Product demo request
├── Free trial signup
├── Comparison page visits
└── Pricing page engagement

Stage 4: Decision
├── Trial-to-paid conversion
├── Sales team contact
├── Contract negotiation
└── Implementation kickoff
───────────────────────────────────────────────────────────────────────────────
```

---

## 8. Implementation Roadmap

### Phase Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        IMPLEMENTATION TIMELINE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Phase 1        Phase 2        Phase 3        Phase 4        Phase 5       │
│  Foundation     Core MVP       Mobile         Finance        Advanced      │
│                                                                             │
│  ████████       ████████       ████████       ████████       ████████      │
│  Weeks 1-6      Weeks 7-12     Weeks 13-20    Weeks 21-24    Ongoing       │
│                                                                             │
│  • Backend      • Checklists   • Operator     • Payments     • AI          │
│  • Auth         • Approvals    • Manager      • Invoicing    • Analytics   │
│  • Database     • Real-time    • Offline      • Billing      • API         │
│  • Basic API    • Frontend     • App Store    • Portal       • Expansion   │
│                   Integration                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Phase 1: Foundation (Weeks 1-6)

**Goal**: Establish backend infrastructure and core authentication

| Week | Task | Deliverables |
|------|------|--------------|
| 1-2 | Project Setup | NestJS project, PostgreSQL, Docker, CI/CD |
| 2-3 | Database | Schema implementation, migrations, seeding |
| 3-4 | Authentication | JWT auth, refresh tokens, password reset |
| 4-5 | Core CRUD | Organizations, Users, Machines APIs |
| 5-6 | Authorization | RBAC, permissions, multi-tenant isolation |

**Exit Criteria**:
- [ ] User can register organization and login
- [ ] CRUD operations for machines work
- [ ] API documentation complete
- [ ] 80%+ test coverage on auth module

### Phase 2: Core MVP (Weeks 7-12)

**Goal**: Implement core business logic and connect frontend

| Week | Task | Deliverables |
|------|------|--------------|
| 7-8 | Checklist System | Templates CRUD, submission API |
| 8-9 | Approval Workflow | Status management, reviewer assignment |
| 9-10 | Real-time | WebSocket notifications, live updates |
| 10-11 | Frontend Integration | Connect React app to API |
| 11-12 | Jobs & Analytics | Job management, dashboard APIs |

**Exit Criteria**:
- [ ] Full checklist submission flow works
- [ ] Manager can approve/reject in real-time
- [ ] Dashboard shows live data from backend
- [ ] Jobs can be created and assigned

### Phase 3: Mobile MVP (Weeks 13-20)

**Goal**: Launch native mobile apps for operators and managers

| Week | Task | Deliverables |
|------|------|--------------|
| 13-14 | Expo Setup | Project structure, navigation, theming |
| 15-16 | Operator Core | Checklist flow, camera, offline storage |
| 16-17 | Offline Sync | WatermelonDB setup, sync logic |
| 17-18 | Manager Core | Approval queue, fleet view |
| 18-19 | Push & Location | FCM integration, GPS tracking |
| 19-20 | QA & Submission | Testing, App Store, Play Store |

**Exit Criteria**:
- [ ] Both apps published on stores
- [ ] Offline checklist submission works
- [ ] Push notifications delivered
- [ ] GPS location tracked in background

### Phase 4: Finance & Billing (Weeks 21-24)

**Goal**: Implement subscription billing and invoice management

| Week | Task | Deliverables |
|------|------|--------------|
| 21-22 | Payment Integration | Stripe/iyzico setup, webhooks |
| 22-23 | Subscription Logic | Plans, trials, upgrades, downgrades |
| 23-24 | Invoicing | PDF generation, email delivery, portal |

**Exit Criteria**:
- [ ] Users can subscribe and pay
- [ ] Invoices auto-generated and delivered
- [ ] Subscription management self-service

### Phase 5: Advanced Features (Ongoing)

**Goal**: Continuous improvement and feature expansion

| Priority | Feature | Description |
|----------|---------|-------------|
| High | AI Advisor | Gemini integration for maintenance predictions |
| High | Advanced Analytics | Custom reports, data export, trends |
| Medium | Public API | Developer documentation, webhooks |
| Medium | Integrations | ERP systems, accounting software |
| Low | White-label | Custom branding for enterprise |
| Low | International | Multi-language, multi-currency |

---

## 9. Risk Assessment

### Risk Matrix

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| **Offline sync data conflicts** | Medium | High | Implement conflict resolution UI, server-wins with local backup |
| **Multi-tenant data leakage** | Low | Critical | Row-level security in PostgreSQL, thorough testing, audit logs |
| **Real-time scalability** | Medium | Medium | Redis pub/sub, horizontal scaling, connection pooling |
| **Mobile app store rejection** | Low | High | Follow guidelines strictly, prepare for resubmission |
| **Payment integration issues** | Medium | High | Use established providers, extensive testing, fallback options |
| **User adoption resistance** | Medium | High | Comprehensive onboarding, training materials, gradual rollout |
| **Competitor feature parity** | Medium | Medium | Focus on niche (construction), local market, superior UX |
| **Technical debt accumulation** | High | Medium | Code reviews, documentation, refactoring sprints |

### Contingency Plans

```
Scenario: Offline sync causes data loss
├── Detection: Monitor sync failure rates in analytics
├── Response: Automatic retry queue with exponential backoff
└── Recovery: Local backup restoration, manual conflict resolution

Scenario: Payment provider outage
├── Detection: Webhook monitoring, health checks
├── Response: Queue payments for retry
└── Recovery: Switch to backup provider, manual processing

Scenario: Mobile app update breaks offline
├── Detection: Crash reporting (Sentry), user feedback
├── Response: Force update with fix, communication to users
└── Recovery: Hotfix release, data recovery scripts
```

---

## 10. Technical Specifications

### Development Environment

```yaml
# Required Tools
node: ">=20.0.0"
npm: ">=10.0.0"
docker: ">=24.0.0"
postgresql: ">=16.0"
redis: ">=7.0"

# Recommended IDE
ide: "VS Code"
extensions:
  - ESLint
  - Prettier
  - TypeScript
  - Tailwind CSS IntelliSense
  - Docker
  - Prisma
```

### Code Standards

```
TypeScript Configuration:
├── Strict mode enabled
├── No implicit any
├── Strict null checks
└── ES2022 target

Linting:
├── ESLint with Airbnb config
├── Prettier for formatting
├── Husky pre-commit hooks
└── lint-staged for performance

Testing:
├── Jest for unit tests
├── Supertest for API tests
├── React Testing Library for components
├── Detox for mobile E2E
└── Minimum 80% coverage
```

### Infrastructure Requirements

```
Production Environment:
├── Compute: 2x t3.medium (API), 1x t3.small (workers)
├── Database: RDS PostgreSQL db.t3.medium
├── Cache: ElastiCache Redis cache.t3.micro
├── Storage: S3 Standard (images, documents)
├── CDN: CloudFront (static assets, API caching)
└── Monitoring: CloudWatch, Sentry, Datadog

Estimated Monthly Cost: $300-500 (initial)
```

### Deployment Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CI/CD PIPELINE                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐       │
│  │  Push  │───▶│  Lint  │───▶│  Test  │───▶│ Build  │───▶│ Deploy │       │
│  │ to Git │    │& Format│    │& Cover │    │& Bundle│    │        │       │
│  └────────┘    └────────┘    └────────┘    └────────┘    └────────┘       │
│                                                               │             │
│                                              ┌────────────────┼──────┐      │
│                                              │                │      │      │
│                                              ▼                ▼      ▼      │
│                                         ┌────────┐     ┌────────┐ ┌─────┐  │
│                                         │Staging │     │  Prod  │ │ CDN │  │
│                                         │  Env   │     │  Env   │ │     │  │
│                                         └────────┘     └────────┘ └─────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **Operator** | Field worker who operates machines and fills checklists |
| **Manager** | Supervisor who approves checklists and manages fleet |
| **Checklist** | Daily inspection form for machine safety checks |
| **Fleet** | Collection of machines owned by an organization |
| **Job** | Work order or task assigned to machines/operators |
| **Meter Reading** | Engine hours or odometer value for tracking usage |

## Appendix B: References

- [NestJS Documentation](https://docs.nestjs.com/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [WatermelonDB Documentation](https://nozbe.github.io/WatermelonDB/)

---

**Document maintained by**: Smartop Development Team
**Last updated**: November 2025
**Next review**: December 2025
