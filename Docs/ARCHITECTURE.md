# Equipment Rental System - Architecture Documentation

## System Overview

The Equipment Rental System is designed as a modern, scalable web application using a multi-tenant architecture that serves educational institutions with equipment management needs. The system follows microservices principles with clear separation of concerns, robust security, and high availability.

## Architectural Principles

### Design Philosophy

**Scalability First:**
- Horizontal scaling capabilities
- Multi-tenant architecture with data isolation
- Microservices-ready design
- Load balancing support

**Security by Design:**
- Role-based access control (RBAC)
- JWT-based authentication
- Data encryption at rest and in transit
- API rate limiting and protection

**Mobile-First Approach:**
- Progressive Web App (PWA) capabilities
- Responsive design principles
- Offline functionality
- Touch-optimized interfaces

**Developer Experience:**
- Type-safe development with TypeScript
- Comprehensive testing strategies
- Hot reload development environment
- Automated deployment pipelines

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                         │
├─────────────────────────────────────────────────────────────┤
│  React SPA  │  Mobile PWA  │  Future Mobile Apps  │  Admin  │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway / Load Balancer             │
├─────────────────────────────────────────────────────────────┤
│                        Nginx / HAProxy                      │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                      │
├─────────────────────────────────────────────────────────────┤
│  Auth Service  │  Equipment Service  │  Reservation Service │
│  User Service  │  Notification Svc   │  Analytics Service   │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                            │
├─────────────────────────────────────────────────────────────┤
│    PostgreSQL    │     Redis Cache     │    File Storage    │
│   (Primary DB)   │   (Session/Cache)   │  (Images/Documents)│
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                     │
├─────────────────────────────────────────────────────────────┤
│     Docker Containers    │    Kubernetes/Docker Swarm      │
│    Monitoring & Logging  │         Backup Services         │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        App Shell                            │
├─────────────────────────────────────────────────────────────┤
│  Navigation  │  Header  │  Footer  │  Global Modals        │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                       Page Layer                            │
├─────────────────────────────────────────────────────────────┤
│  Equipment Page  │  Reservation Page  │  Profile Page       │
│  Admin Pages     │  Auth Pages        │  Dashboard Page     │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                    Feature Components                       │
├─────────────────────────────────────────────────────────────┤
│  EquipmentList  │  ReservationForm  │  UserManagement      │
│  Calendar       │  SearchFilters    │  Analytics           │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                      UI Components                          │
├─────────────────────────────────────────────────────────────┤
│  Button  │  Input  │  Modal  │  Card  │  Table  │  Form    │
└─────────────────────────────────────────────────────────────┘
```

### State Management

**Context-Based State Management:**
```typescript
// Global State Structure
interface AppState {
  auth: {
    user: User | null
    tokens: AuthTokens | null
    isAuthenticated: boolean
    isLoading: boolean
  }
  equipment: {
    items: Equipment[]
    filters: EquipmentFilters
    pagination: PaginationState
    loading: boolean
  }
  reservations: {
    userReservations: Reservation[]
    pendingApprovals: Reservation[]
    calendar: CalendarState
    loading: boolean
  }
  ui: {
    theme: 'light' | 'dark'
    sidebar: boolean
    modals: ModalState
    notifications: Notification[]
  }
}
```

**Data Flow Pattern:**
```
User Interaction → Component → Custom Hook → API Service → Context Update → UI Re-render
```

### React Component Patterns

**Compound Components:**
```typescript
// Equipment search with compound pattern
<EquipmentSearch>
  <EquipmentSearch.Filters>
    <EquipmentSearch.CategoryFilter />
    <EquipmentSearch.AvailabilityFilter />
    <EquipmentSearch.ConditionFilter />
  </EquipmentSearch.Filters>
  <EquipmentSearch.Results>
    <EquipmentSearch.Grid />
    <EquipmentSearch.Pagination />
  </EquipmentSearch.Results>
</EquipmentSearch>
```

**Custom Hooks Pattern:**
```typescript
// Equipment management hook
export const useEquipment = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEquipment = useCallback(async (filters?: EquipmentFilters) => {
    setLoading(true)
    try {
      const data = await equipmentService.getEquipment(filters)
      setEquipment(data.items)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  return { equipment, loading, error, fetchEquipment }
}
```

## Backend Architecture

### Service-Oriented Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Rate Limiting  │  Authentication  │  Request Routing       │
│  CORS Handling  │  Request Logging │  Response Formatting   │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                   Controller Layer                          │
├─────────────────────────────────────────────────────────────┤
│  AuthController     │  EquipmentController                  │
│  UserController     │  ReservationController                │
│  AdminController    │  NotificationController               │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                            │
├─────────────────────────────────────────────────────────────┤
│  AuthService       │  EquipmentService                      │
│  UserService       │  ReservationService                    │
│  EmailService      │  FileUploadService                     │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                 Repository Layer                            │
├─────────────────────────────────────────────────────────────┤
│  UserRepository         │  EquipmentRepository              │
│  ReservationRepository  │  TenantRepository                 │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                              │
├─────────────────────────────────────────────────────────────┤
│           PostgreSQL with Prisma ORM                       │
└─────────────────────────────────────────────────────────────┘
```

### API Design Patterns

**RESTful API Structure:**
```
POST   /api/v1/auth/login               # Authentication
POST   /api/v1/auth/register            # User registration
POST   /api/v1/auth/refresh             # Token refresh

GET    /api/v1/equipment                # List equipment
POST   /api/v1/equipment                # Create equipment
GET    /api/v1/equipment/:id            # Get equipment details
PUT    /api/v1/equipment/:id            # Update equipment
DELETE /api/v1/equipment/:id            # Delete equipment

GET    /api/v1/reservations             # List reservations
POST   /api/v1/reservations             # Create reservation
GET    /api/v1/reservations/:id         # Get reservation details
PUT    /api/v1/reservations/:id         # Update reservation
DELETE /api/v1/reservations/:id         # Cancel reservation

POST   /api/v1/reservations/:id/approve # Approve reservation
POST   /api/v1/reservations/:id/reject  # Reject reservation
POST   /api/v1/reservations/:id/checkin # Check in equipment
POST   /api/v1/reservations/:id/checkout # Check out equipment
```

**Response Format Standardization:**
```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    timestamp: string
    requestId: string
    pagination?: PaginationMeta
  }
}
```

### Middleware Architecture

**Request Processing Pipeline:**
```typescript
// Middleware chain
app.use(requestLogger)      // Log all requests
app.use(rateLimiter)        // Rate limiting
app.use(authenticate)       // JWT verification
app.use(authorize)          // Permission checking
app.use(validateInput)      // Input validation
app.use(tenantIsolation)    // Multi-tenant data isolation
app.use(controller)         // Business logic
app.use(errorHandler)       // Error handling
app.use(responseFormatter)  // Format response
```

## Database Architecture

### Multi-Tenant Data Model

**Tenant Isolation Strategy:**
```sql
-- Row-level security with tenant_id
CREATE POLICY tenant_isolation ON equipment
  FOR ALL TO application_role
  USING (tenant_id = current_setting('app.current_tenant'));

-- All tables include tenant_id
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  -- other fields
  created_at TIMESTAMP DEFAULT NOW()
);

-- Composite indexes for performance
CREATE INDEX idx_equipment_tenant_category 
  ON equipment(tenant_id, category_id);
```

### Database Schema Design

**Core Entity Relationships:**
```
Tenants (1) ──────── (∞) Users
   │                      │
   │                      │
   └── (∞) Equipment      │
           │              │
           │              │
           └── (∞) Reservations (∞) ──┘
                   │
                   │
                   └── (∞) ReservationItems
```

**Optimized Indexes:**
```sql
-- Performance-critical indexes
CREATE INDEX idx_equipment_search ON equipment 
  USING GIN(to_tsvector('english', name || ' ' || description));

CREATE INDEX idx_reservations_timeline ON reservations 
  (tenant_id, start_date, end_date);

CREATE INDEX idx_users_tenant_role ON users 
  (tenant_id, role, is_active);
```

### Data Consistency

**ACID Transactions:**
```typescript
// Reservation creation with equipment locking
async createReservation(reservationData: CreateReservationDto) {
  return await this.prisma.$transaction(async (tx) => {
    // 1. Check equipment availability
    const conflicts = await tx.reservation.findMany({
      where: {
        equipmentId: reservationData.equipmentId,
        status: { in: ['approved', 'active'] },
        OR: [
          {
            startDate: { lte: reservationData.endDate },
            endDate: { gte: reservationData.startDate },
          },
        ],
      },
    })

    if (conflicts.length > 0) {
      throw new ConflictException('Equipment not available')
    }

    // 2. Create reservation
    const reservation = await tx.reservation.create({
      data: reservationData,
    })

    // 3. Log audit trail
    await tx.auditLog.create({
      data: {
        action: 'reservation_created',
        entityId: reservation.id,
        userId: reservationData.userId,
        tenantId: reservationData.tenantId,
      },
    })

    return reservation
  })
}
```

## Security Architecture

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   Authentication Flow                       │
└─────────────────────────────────────────────────────────────┘

1. User Login Request
   ↓
2. Credentials Validation
   ↓
3. JWT Access Token Generation (15 min)
   ↓
4. JWT Refresh Token Generation (7 days)
   ↓
5. Token Storage (HttpOnly cookies + localStorage)
   ↓
6. Subsequent Requests with Bearer Token
   ↓
7. Token Validation Middleware
   ↓
8. Automatic Token Refresh on Expiry
```

### Authorization Matrix

```typescript
// Role-based permissions
interface Permissions {
  equipment: {
    view: ['student', 'faculty', 'manager', 'admin']
    create: ['manager', 'admin']
    update: ['manager', 'admin']
    delete: ['admin']
  }
  reservations: {
    create: ['student', 'faculty', 'manager', 'admin']
    viewOwn: ['student', 'faculty', 'manager', 'admin']
    viewAll: ['faculty', 'manager', 'admin']
    approve: ['faculty', 'manager', 'admin']
    cancel: ['owner', 'manager', 'admin']
  }
  users: {
    viewOwn: ['student', 'faculty', 'manager', 'admin']
    viewAll: ['manager', 'admin']
    create: ['manager', 'admin']
    updateOwn: ['student', 'faculty', 'manager', 'admin']
    updateAll: ['admin']
  }
}
```

### Data Protection

**Encryption Strategy:**
```typescript
// At-rest encryption
- Database: AES-256 encryption for sensitive fields
- File storage: Server-side encryption (S3/MinIO)
- Backups: Encrypted with customer-managed keys

// In-transit encryption
- HTTPS/TLS 1.3 for all communications
- Certificate pinning for mobile apps
- HSTS headers for web browsers
```

## Caching Strategy

### Multi-Level Caching

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser Cache                            │
├─────────────────────────────────────────────────────────────┤
│  Static Assets (24h)  │  API Responses (5m)  │  Images (1h) │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                      CDN Cache                              │
├─────────────────────────────────────────────────────────────┤
│  Static Assets (1w)   │  Images (1d)         │  Fonts (1m)  │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                   Application Cache                         │
├─────────────────────────────────────────────────────────────┤
│  Session Data (1h)  │  User Profiles (30m)  │  Configs (1d) │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                    Database Cache                           │
├─────────────────────────────────────────────────────────────┤
│  Query Results (10m)  │  Aggregations (1h)  │  Lookups (1d) │
└─────────────────────────────────────────────────────────────┘
```

### Cache Implementation

**Redis Caching Strategy:**
```typescript
// Cache keys pattern
const CACHE_KEYS = {
  equipment: (tenantId: string, filters: string) => 
    `equipment:${tenantId}:${filters}`,
  user: (userId: string) => 
    `user:${userId}`,
  reservation: (tenantId: string, userId: string) => 
    `reservations:${tenantId}:${userId}`,
  availability: (equipmentId: string, date: string) => 
    `availability:${equipmentId}:${date}`,
}

// Cache invalidation patterns
async invalidateEquipmentCache(tenantId: string) {
  const pattern = `equipment:${tenantId}:*`
  const keys = await redis.keys(pattern)
  if (keys.length > 0) {
    await redis.del(keys)
  }
}
```

## API Rate Limiting

### Rate Limiting Strategy

```typescript
// Rate limiting configuration
const rateLimitConfig = {
  // General API rate limiting
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // requests per window
    skipSuccessfulRequests: false,
  },
  
  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000,
    max: 10, // login attempts
    skipSuccessfulRequests: true,
  },
  
  // File upload endpoints
  upload: {
    windowMs: 60 * 1000, // 1 minute
    max: 5, // uploads per minute
    skipSuccessfulRequests: false,
  },
  
  // Search endpoints
  search: {
    windowMs: 60 * 1000,
    max: 100, // searches per minute
    skipSuccessfulRequests: false,
  },
}
```

## Monitoring and Observability

### Application Monitoring

```
┌─────────────────────────────────────────────────────────────┐
│                   Frontend Monitoring                       │
├─────────────────────────────────────────────────────────────┤
│  Error Tracking  │  Performance  │  User Analytics          │
│    (Sentry)      │   (Lighthouse) │  (Google Analytics)     │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                   Backend Monitoring                        │
├─────────────────────────────────────────────────────────────┤
│  API Metrics     │  Error Logs   │  Performance Metrics     │
│  (Prometheus)    │   (Winston)   │    (New Relic)          │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                Infrastructure Monitoring                    │
├─────────────────────────────────────────────────────────────┤
│  Container Stats │  Database     │  Network Monitoring      │
│   (cAdvisor)     │  (pgMonitor)  │    (Grafana)            │
└─────────────────────────────────────────────────────────────┘
```

### Health Checks

**Application Health Endpoints:**
```typescript
// Health check implementation
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      storage: await checkStorage(),
      external: await checkExternalServices(),
    },
  }
  
  const allHealthy = Object.values(health.checks)
    .every(check => check.status === 'ok')
  
  res.status(allHealthy ? 200 : 503).json(health)
})
```

## Scalability Considerations

### Horizontal Scaling

**Load Balancing Strategy:**
```nginx
# Nginx load balancer configuration
upstream backend {
    least_conn;
    server backend-1:3000 weight=3;
    server backend-2:3000 weight=3;
    server backend-3:3000 weight=2;
    
    # Health checks
    health_check uri=/health interval=30s;
}

# Session affinity for file uploads
upstream upload {
    ip_hash;
    server backend-1:3000;
    server backend-2:3000;
}
```

**Database Scaling:**
```yaml
# Read replica configuration
database:
  primary:
    host: postgres-primary
    connections: 100
  replicas:
    - host: postgres-replica-1
      weight: 50
    - host: postgres-replica-2
      weight: 50
  
# Connection pooling
connection_pool:
  max_connections: 50
  idle_timeout: 30s
  max_lifetime: 1h
```

### Performance Optimization

**Frontend Optimization:**
```typescript
// Code splitting by route
const Equipment = lazy(() => 
  import('./pages/Equipment').then(module => ({
    default: module.Equipment
  }))
)

// Component-level code splitting
const HeavyChart = lazy(() => import('./components/HeavyChart'))

// Resource preloading
<link rel="preload" href="/api/equipment" as="fetch" />
<link rel="prefetch" href="/images/hero.jpg" />
```

**Backend Optimization:**
```typescript
// Database query optimization
async getEquipmentWithAvailability(filters: EquipmentFilters) {
  return this.prisma.equipment.findMany({
    where: filters,
    include: {
      category: true,
      _count: {
        select: {
          reservations: {
            where: {
              status: { in: ['approved', 'active'] },
              startDate: { lte: filters.endDate },
              endDate: { gte: filters.startDate },
            }
          }
        }
      }
    },
    orderBy: [
      { featured: 'desc' },
      { name: 'asc' }
    ]
  })
}
```

## Deployment Architecture

### Container Orchestration

```yaml
# Docker Swarm/Kubernetes deployment
version: '3.8'
services:
  frontend:
    image: gear-pool/frontend:latest
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 30s
      restart_policy:
        condition: on-failure
    networks:
      - frontend-network

  backend:
    image: gear-pool/backend:latest
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 30s
      restart_policy:
        condition: on-failure
    networks:
      - backend-network
    secrets:
      - db_password
      - jwt_secret

  database:
    image: postgres:15-alpine
    deploy:
      replicas: 1
      placement:
        constraints:
          - node.role == manager
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - backend-network
```

### CI/CD Pipeline

```yaml
# GitHub Actions workflow
name: Deploy Equipment Rental System

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Tests
        run: |
          npm ci
          npm run test:coverage
          npm run lint
          npm run type-check

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build Docker Images
        run: |
          docker build -t gear-pool/frontend .
          docker build -t gear-pool/backend ./backend

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Production
        run: |
          docker stack deploy -c docker-compose.prod.yml gear-pool
```

## Future Architecture Considerations

### Microservices Migration

**Service Decomposition Plan:**
```
Current Monolithic Backend
    ↓
Auth Service + Equipment Service + Reservation Service
    ↓
+ Notification Service + Analytics Service + File Service
    ↓
+ Billing Service + Audit Service + Integration Service
```

### Event-Driven Architecture

**Event Sourcing Implementation:**
```typescript
// Event-driven reservation workflow
interface ReservationEvent {
  type: 'ReservationCreated' | 'ReservationApproved' | 'EquipmentCheckedOut'
  aggregateId: string
  data: any
  timestamp: Date
  version: number
}

// Event handlers
const eventHandlers = {
  ReservationCreated: (event) => {
    // Send notification to faculty
    // Update equipment availability
    // Create calendar entry
  },
  ReservationApproved: (event) => {
    // Send confirmation email
    // Block equipment calendar
    // Generate pickup instructions
  }
}
```

### Advanced Features

**Machine Learning Integration:**
```typescript
// Equipment recommendation engine
interface RecommendationService {
  getEquipmentRecommendations(userId: string): Promise<Equipment[]>
  predictUsagePeaks(equipmentId: string): Promise<UsageForecast>
  detectAnomalousUsage(reservationData: Reservation[]): Promise<Anomaly[]>
}

// Predictive maintenance
interface MaintenancePredictor {
  predictMaintenanceNeeds(equipmentId: string): Promise<MaintenanceSchedule>
  optimizeEquipmentUtilization(departmentId: string): Promise<OptimizationPlan>
}
```

This architecture documentation provides a comprehensive overview of the Equipment Rental System's technical design, ensuring scalability, maintainability, and security while supporting the educational institution's equipment management needs. 