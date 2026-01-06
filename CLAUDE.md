# CLAUDE.md - Smartop AI Development Guide

> **Smartop**: B2B SaaS platform for heavy equipment management
> **Version**: 1.0 | **Last Updated**: January 2026

---

## Quick Reference

```
Tech Stack: React 19 + NestJS + Prisma + PostgreSQL + React Native (Expo)
API Base: http://localhost:3000/api
Frontend: http://localhost:5173
Mobile: Expo Go / Development Build
```

---

## Project Overview

Smartop digitizes equipment inspection workflows for construction, mining, and logistics industries. It connects **Managers** (approve/reject) with **Operators** (submit checklists) through a real-time approval system.

### Core Modules
| Module | Purpose | Status |
|--------|---------|--------|
| Dashboard | KPIs, charts, overview | ✅ Complete |
| Machine Management | Fleet CRUD | ✅ Complete |
| Operator Management | Personnel | ✅ Complete |
| Job Management | Sites/projects | ✅ Complete |
| Checklists | Inspection templates | ✅ Complete |
| Approval Workflow | Manager approvals | ✅ Complete |
| Finance | Billing/invoices | ✅ Complete |
| Mobile App | Operator interface | ✅ Complete |
| Notifications | Push/real-time | ✅ Complete |

---

## Project Structure

```
smartop/
├── backend/                 # NestJS API Server
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/       # JWT authentication
│   │   │   ├── users/      # User management
│   │   │   ├── organizations/
│   │   │   ├── machines/   # Equipment fleet
│   │   │   ├── jobs/       # Work sites
│   │   │   ├── checklists/ # Inspection forms
│   │   │   ├── notifications/
│   │   │   ├── uploads/    # File storage
│   │   │   └── events/     # SSE real-time
│   │   ├── common/         # Guards, filters, pipes
│   │   └── main.ts         # App bootstrap
│   └── prisma/
│       └── schema.prisma   # Database schema
│
├── frontend/               # React Web App (Vite)
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   └── services/      # API clients
│   └── index.html
│
├── mobile/                 # React Native (Expo)
│   └── src/
│       ├── screens/       # App screens
│       ├── components/    # Mobile UI
│       ├── navigation/    # React Navigation
│       ├── context/       # App state
│       └── services/      # API clients
│
├── .bmad/                  # BMad Agent Framework
├── .superclaude/           # SuperClaude Framework
├── PLANNING.md             # Architecture & roadmap
└── CLAUDE.md               # This file
```

---

## Development Commands

### Backend (NestJS)
```bash
cd backend
npm install              # Install dependencies
npm run dev              # Start dev server (port 3000)
npm run build            # Build for production
npm run start:prod       # Run production build
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Run migrations
npx prisma studio        # Database GUI
```

### Frontend (React/Vite)
```bash
cd frontend
npm install              # Install dependencies
npm run dev              # Start dev server (port 5173)
npm run build            # Build for production
npm run preview          # Preview production build
```

### Mobile (Expo)
```bash
cd mobile
npm install              # Install dependencies
npx expo start           # Start Expo dev server
npx expo start --android # Android emulator
npx expo start --ios     # iOS simulator
npx expo prebuild        # Generate native projects
eas build               # Build for stores
```

### Docker
```bash
docker-compose up -d     # Start all services
docker-compose down      # Stop services
docker-compose logs -f   # View logs
```

---

## API Endpoints

### Authentication
```
POST   /api/auth/login           # Login → JWT token
POST   /api/auth/register        # Register new user
POST   /api/auth/refresh         # Refresh token
GET    /api/auth/me              # Current user profile
```

### Users & Organizations
```
GET    /api/users                # List users (admin)
GET    /api/users/:id            # Get user
PATCH  /api/users/:id            # Update user
GET    /api/organizations        # List organizations
POST   /api/organizations        # Create organization
```

### Machines
```
GET    /api/machines             # List machines
POST   /api/machines             # Create machine
GET    /api/machines/:id         # Get machine details
PATCH  /api/machines/:id         # Update machine
DELETE /api/machines/:id         # Delete machine
GET    /api/machines/:id/history # Machine activity log
```

### Jobs
```
GET    /api/jobs                 # List jobs/sites
POST   /api/jobs                 # Create job
GET    /api/jobs/:id             # Get job details
PATCH  /api/jobs/:id             # Update job
DELETE /api/jobs/:id             # Delete job
```

### Checklists
```
GET    /api/checklists           # List checklist templates
POST   /api/checklists           # Create template
GET    /api/checklists/:id       # Get checklist
POST   /api/checklists/:id/submit # Submit completed checklist
GET    /api/checklists/pending   # Pending approvals
POST   /api/checklists/:id/approve # Approve checklist
POST   /api/checklists/:id/reject  # Reject checklist
```

### Notifications
```
GET    /api/notifications        # List notifications
POST   /api/notifications/read/:id    # Mark as read
POST   /api/notifications/read-all    # Mark all as read
GET    /api/events/stream        # SSE real-time events
```

### File Uploads
```
POST   /api/uploads              # Upload file
GET    /api/uploads/:id          # Get file
DELETE /api/uploads/:id          # Delete file
```

---

## Database Schema (Key Models)

```prisma
model User {
  id             String   @id @default(uuid())
  email          String   @unique
  password       String
  name           String
  role           Role     @default(OPERATOR)
  organizationId String?
  organization   Organization?
  machines       Machine[]
  checklists     ChecklistSubmission[]
}

model Machine {
  id           String   @id @default(uuid())
  name         String
  type         String
  serialNumber String   @unique
  status       MachineStatus
  organizationId String
  assignedUserId String?
  checklists   ChecklistSubmission[]
}

model ChecklistSubmission {
  id          String   @id @default(uuid())
  machineId   String
  userId      String
  status      ApprovalStatus
  items       Json
  photos      String[]
  notes       String?
  submittedAt DateTime
  approvedAt  DateTime?
  approvedBy  String?
}

enum Role { ADMIN, MANAGER, OPERATOR }
enum MachineStatus { ACTIVE, MAINTENANCE, INACTIVE }
enum ApprovalStatus { PENDING, APPROVED, REJECTED }
```

---

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/smartop"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
```

### Mobile (.env)
```env
EXPO_PUBLIC_API_URL=http://192.168.1.x:3000/api
```

---

## AI Framework Integration

### BMad Method (.bmad/)
BMAD provides structured agent workflows with:
- **Simple Agents**: Single-file, focused tasks (code review, commits)
- **Expert Agents**: Multi-file with memory (architecture, planning)
- **Workflows**: Step-by-step processes for complex tasks

**Key Concepts**:
- Progressive disclosure: Each step only knows next step
- Menu-driven interaction: [A] Advanced, [P] Party, [C] Continue
- Sidecar pattern: Companion folders for agent context

### SuperClaude (.superclaude/)
SuperClaude enhances Claude with:
- **PM Agent**: Pre-execution confidence checking (25-250x token savings)
- **Parallel Execution**: Wave → Checkpoint → Wave pattern (3.5x speedup)
- **Hallucination Detection**: Four Questions validation (94% accuracy)

**Core Patterns**:
```
1. ConfidenceChecker: ≥90% proceed, 70-89% alternatives, <70% ask
2. SelfCheckProtocol: Evidence-based validation (no speculation)
3. ReflexionPattern: Error learning across sessions
```

---

## Development Principles

### 1. Confidence-First Development
Before implementing, check:
- [ ] No duplicate implementations exist?
- [ ] Architecture compliance verified?
- [ ] Official documentation checked?
- [ ] Root cause identified (for bugs)?

### 2. Evidence-Based Validation
Never claim "done" without:
- Actual test output shown
- Working code demonstrated
- No warnings/errors ignored

### 3. Parallel-First Execution
```
# Optimal pattern
[Read files in parallel] → Analyze → [Edit files in parallel]

# NOT this
Read file 1 → Analyze → Edit file 1 → Read file 2 → ...
```

### 4. Token Efficiency
| Task Type | Budget |
|-----------|--------|
| Typo fix | 200 tokens |
| Bug fix | 1,000 tokens |
| Feature | 2,500 tokens |
| Confidence check | 100-200 (saves 5,000-50,000) |

---

## Code Style Guidelines

### TypeScript/React
```typescript
// Use functional components with hooks
const Component: React.FC<Props> = ({ prop1, prop2 }) => {
  const [state, setState] = useState<Type>(initial);

  // Early return for loading/error states
  if (loading) return <Skeleton />;
  if (error) return <ErrorBoundary error={error} />;

  return <div>...</div>;
};

// Use zod for validation
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```

### NestJS
```typescript
@Controller('machines')
export class MachinesController {
  constructor(private readonly machinesService: MachinesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Query() query: PaginationDto) {
    return this.machinesService.findAll(query);
  }
}
```

### Prisma
```typescript
// Always use transactions for multi-step operations
await prisma.$transaction(async (tx) => {
  await tx.machine.update(...);
  await tx.notification.create(...);
});
```

---

## Security Checklist

### Authentication
- [x] JWT with short expiry (15min)
- [x] Refresh tokens (httpOnly cookie)
- [x] Password hashing (bcrypt)
- [ ] MFA support (planned)

### Authorization
- [x] Role-based access (Admin/Manager/Operator)
- [x] Resource ownership checks
- [x] Guard decorators on all routes

### API Security
- [x] CORS configuration
- [x] Rate limiting
- [x] Input validation (class-validator)
- [x] SQL injection prevention (Prisma)

---

## Common Tasks

### Add New API Endpoint
1. Create DTO in `backend/src/modules/{module}/dto/`
2. Add method to service in `{module}.service.ts`
3. Add route to controller in `{module}.controller.ts`
4. Update Prisma schema if needed
5. Run `npx prisma migrate dev`

### Add New Mobile Screen
1. Create screen in `mobile/src/screens/`
2. Add to navigation in `mobile/src/navigation/`
3. Create API service if needed
4. Add translations (TR/EN)

### Debug API Issues
```bash
# Check API health
curl http://localhost:3000/api/health

# Check database connection
cd backend && npx prisma studio

# View real-time logs
docker-compose logs -f backend
```

---

## Troubleshooting

### API Not Responding
```bash
# Check if port 3000 is in use
netstat -an | findstr :3000

# Restart backend
cd backend && npm run dev
```

### Database Connection Failed
```bash
# Check PostgreSQL is running
docker-compose ps

# Reset database
npx prisma migrate reset
```

### Mobile Can't Connect to API
```bash
# Use local IP, not localhost
# Find your IP:
ipconfig  # Windows
ifconfig  # Mac/Linux

# Update mobile .env
EXPO_PUBLIC_API_URL=http://YOUR_IP:3000/api
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| [PLANNING.md](PLANNING.md) | Full architecture & roadmap |
| [backend/prisma/schema.prisma](backend/prisma/schema.prisma) | Database schema |
| [backend/src/main.ts](backend/src/main.ts) | API bootstrap |
| [frontend/src/App.tsx](frontend/src/App.tsx) | Web app entry |
| [mobile/App.tsx](mobile/App.tsx) | Mobile app entry |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 2026 | Initial comprehensive guide |

---

*This document is the single source of truth for Smartop development. Keep it updated!*
