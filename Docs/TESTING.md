# Equipment Rental System - Testing Strategy

## Testing Overview

The Equipment Rental System implements a comprehensive testing strategy covering all layers of the application, from unit tests to end-to-end integration tests. This ensures code quality, reliability, and maintainability while supporting continuous integration and deployment.

## Testing Architecture

### Testing Pyramid

```
                    E2E Tests
                   /         \
                  /           \
                 /             \
            Integration Tests   \
           /                     \
          /                       \
         /                         \
    Unit Tests                      \
   /          \                      \
  /            \                      \
Frontend      Backend                 \
Components    Services                 \
```

### Testing Levels

**Unit Tests (70%):**
- Component testing (React)
- Service testing (Business logic)
- Utility function testing
- Hook testing

**Integration Tests (20%):**
- API endpoint testing
- Database integration
- Authentication flow
- External service integration

**End-to-End Tests (10%):**
- User workflow testing
- Cross-browser compatibility
- Mobile responsiveness
- Performance testing

## Frontend Testing

### Component Testing with Vitest

**Testing Setup:**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.ts',
      ],
    },
  },
})
```

**Test Setup File:**
```typescript
// src/test/setup.ts
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Clean up after each test
afterEach(() => {
  cleanup()
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
```

### Component Testing Examples

**Basic Component Test:**
```typescript
// src/components/EquipmentCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { EquipmentCard } from './EquipmentCard'
import { mockEquipment } from '@/test/mocks'

describe('EquipmentCard', () => {
  it('renders equipment information correctly', () => {
    render(<EquipmentCard equipment={mockEquipment} />)
    
    expect(screen.getByText(mockEquipment.name)).toBeInTheDocument()
    expect(screen.getByText(mockEquipment.description)).toBeInTheDocument()
    expect(screen.getByText(`$${mockEquipment.dailyRate}/day`)).toBeInTheDocument()
  })

  it('shows availability status', () => {
    const unavailableEquipment = { ...mockEquipment, isAvailable: false }
    render(<EquipmentCard equipment={unavailableEquipment} />)
    
    expect(screen.getByText('Unavailable')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reserve/i })).toBeDisabled()
  })

  it('handles reservation button click', async () => {
    const onReserve = vi.fn()
    render(<EquipmentCard equipment={mockEquipment} onReserve={onReserve} />)
    
    const reserveButton = screen.getByRole('button', { name: /reserve/i })
    fireEvent.click(reserveButton)
    
    expect(onReserve).toHaveBeenCalledWith(mockEquipment.id)
  })
})
```

**Form Component Test:**
```typescript
// src/components/ReservationForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ReservationForm } from './ReservationForm'

describe('ReservationForm', () => {
  const mockSubmit = vi.fn()
  
  beforeEach(() => {
    mockSubmit.mockClear()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<ReservationForm onSubmit={mockSubmit} />)
    
    const submitButton = screen.getByRole('button', { name: /submit/i })
    await user.click(submitButton)
    
    expect(screen.getByText('Equipment is required')).toBeInTheDocument()
    expect(screen.getByText('Start date is required')).toBeInTheDocument()
    expect(mockSubmit).not.toHaveBeenCalled()
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    render(<ReservationForm onSubmit={mockSubmit} />)
    
    // Fill form fields
    await user.selectOptions(screen.getByLabelText(/equipment/i), 'camera-1')
    await user.type(screen.getByLabelText(/start date/i), '2024-01-15')
    await user.type(screen.getByLabelText(/end date/i), '2024-01-17')
    await user.type(screen.getByLabelText(/project title/i), 'Test Project')
    
    const submitButton = screen.getByRole('button', { name: /submit/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        equipmentId: 'camera-1',
        startDate: '2024-01-15',
        endDate: '2024-01-17',
        projectTitle: 'Test Project',
      })
    })
  })
})
```

### Hook Testing

**Custom Hook Test:**
```typescript
// src/hooks/useAuth.test.tsx
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useAuth } from './useAuth'
import { AuthProvider } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'

// Mock API client
vi.mock('@/lib/api')

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

describe('useAuth', () => {
  it('initializes with unauthenticated state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isLoading).toBe(false)
  })

  it('handles successful login', async () => {
    const mockUser = { id: '1', email: 'test@example.com', role: 'student' }
    const mockTokens = { accessToken: 'token', refreshToken: 'refresh' }
    
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      user: mockUser,
      tokens: mockTokens,
    })
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      await result.current.login('test@example.com', 'password')
    })
    
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual(mockUser)
  })

  it('handles login failure', async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Invalid credentials'))
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await expect(
      act(async () => {
        await result.current.login('test@example.com', 'wrong-password')
      })
    ).rejects.toThrow('Invalid credentials')
    
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })
})
```

## Backend Testing

### API Testing with Jest

**Test Setup:**
```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/types/**/*',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
}
```

**Test Setup File:**
```typescript
// tests/setup.ts
import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'

import prisma from '../src/lib/prisma'

jest.mock('../src/lib/prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}))

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

beforeEach(() => {
  mockReset(prismaMock)
})
```

### API Endpoint Testing

**Controller Test:**
```typescript
// src/controllers/equipment.test.ts
import request from 'supertest'
import app from '../app'
import { prismaMock } from '../../tests/setup'
import { mockEquipment, mockUser } from '../../tests/mocks'

describe('Equipment Controller', () => {
  describe('GET /api/v1/equipment', () => {
    it('returns equipment list for authenticated user', async () => {
      const mockToken = generateValidToken(mockUser)
      
      prismaMock.equipment.findMany.mockResolvedValue([mockEquipment])
      
      const response = await request(app)
        .get('/api/v1/equipment')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200)
      
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0]).toMatchObject({
        id: mockEquipment.id,
        name: mockEquipment.name,
      })
    })

    it('returns 401 for unauthenticated request', async () => {
      await request(app)
        .get('/api/v1/equipment')
        .expect(401)
    })

    it('filters equipment by category', async () => {
      const mockToken = generateValidToken(mockUser)
      const categoryId = 'camera-category'
      
      prismaMock.equipment.findMany.mockResolvedValue([mockEquipment])
      
      await request(app)
        .get(`/api/v1/equipment?categoryId=${categoryId}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200)
      
      expect(prismaMock.equipment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoryId,
          }),
        })
      )
    })
  })

  describe('POST /api/v1/equipment', () => {
    it('creates equipment for manager user', async () => {
      const managerUser = { ...mockUser, role: 'manager' }
      const mockToken = generateValidToken(managerUser)
      const equipmentData = {
        name: 'New Camera',
        description: 'Test camera',
        categoryId: 'camera-category',
        dailyRate: 50,
      }
      
      prismaMock.equipment.create.mockResolvedValue({
        ...mockEquipment,
        ...equipmentData,
      })
      
      const response = await request(app)
        .post('/api/v1/equipment')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(equipmentData)
        .expect(201)
      
      expect(response.body.success).toBe(true)
      expect(response.body.data.name).toBe(equipmentData.name)
    })

    it('returns 403 for student user', async () => {
      const studentUser = { ...mockUser, role: 'student' }
      const mockToken = generateValidToken(studentUser)
      
      await request(app)
        .post('/api/v1/equipment')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ name: 'Test' })
        .expect(403)
    })

    it('validates required fields', async () => {
      const managerUser = { ...mockUser, role: 'manager' }
      const mockToken = generateValidToken(managerUser)
      
      const response = await request(app)
        .post('/api/v1/equipment')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({})
        .expect(400)
      
      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })
  })
})
```

### Service Testing

**Business Logic Test:**
```typescript
// src/services/reservation.test.ts
import { ReservationService } from './reservation'
import { prismaMock } from '../../tests/setup'
import { mockReservation, mockEquipment, mockUser } from '../../tests/mocks'

describe('ReservationService', () => {
  let reservationService: ReservationService

  beforeEach(() => {
    reservationService = new ReservationService()
  })

  describe('createReservation', () => {
    it('creates reservation when equipment is available', async () => {
      const reservationData = {
        equipmentId: mockEquipment.id,
        userId: mockUser.id,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-17'),
        projectTitle: 'Test Project',
      }

      // Mock no conflicts
      prismaMock.reservation.findMany.mockResolvedValue([])
      prismaMock.reservation.create.mockResolvedValue(mockReservation)

      const result = await reservationService.createReservation(reservationData)

      expect(result).toEqual(mockReservation)
      expect(prismaMock.reservation.create).toHaveBeenCalledWith({
        data: reservationData,
      })
    })

    it('throws conflict error when equipment is unavailable', async () => {
      const reservationData = {
        equipmentId: mockEquipment.id,
        userId: mockUser.id,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-17'),
        projectTitle: 'Test Project',
      }

      // Mock existing reservation conflict
      prismaMock.reservation.findMany.mockResolvedValue([
        {
          ...mockReservation,
          startDate: new Date('2024-01-14'),
          endDate: new Date('2024-01-16'),
        },
      ])

      await expect(
        reservationService.createReservation(reservationData)
      ).rejects.toThrow('Equipment not available for selected dates')
    })
  })

  describe('approveReservation', () => {
    it('approves reservation for faculty user', async () => {
      const facultyUser = { ...mockUser, role: 'faculty' }
      const reservationId = mockReservation.id

      prismaMock.reservation.findUnique.mockResolvedValue(mockReservation)
      prismaMock.reservation.update.mockResolvedValue({
        ...mockReservation,
        status: 'approved',
      })

      const result = await reservationService.approveReservation(
        reservationId,
        facultyUser.id
      )

      expect(result.status).toBe('approved')
      expect(prismaMock.reservation.update).toHaveBeenCalledWith({
        where: { id: reservationId },
        data: {
          status: 'approved',
          approvedBy: facultyUser.id,
          approvedAt: expect.any(Date),
        },
      })
    })
  })
})
```

## Integration Testing

### Database Integration Tests

**Database Test Setup:**
```typescript
// tests/integration/setup.ts
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_TEST,
    },
  },
})

beforeAll(async () => {
  // Run migrations
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL_TEST },
  })
  
  await prisma.$connect()
})

afterAll(async () => {
  await prisma.$disconnect()
})

beforeEach(async () => {
  // Clean database
  const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `
  
  for (const { tablename } of tablenames) {
    if (tablename !== '_prisma_migrations') {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`)
    }
  }
})
```

**Integration Test Example:**
```typescript
// tests/integration/reservation-flow.test.ts
import request from 'supertest'
import app from '../../src/app'
import { prisma } from '../../src/lib/prisma'
import { createTestUser, createTestEquipment } from '../helpers'

describe('Reservation Flow Integration', () => {
  let student: any
  let faculty: any
  let equipment: any

  beforeEach(async () => {
    student = await createTestUser({ role: 'student' })
    faculty = await createTestUser({ role: 'faculty' })
    equipment = await createTestEquipment()
  })

  it('completes full reservation workflow', async () => {
    // 1. Student creates reservation
    const studentToken = generateValidToken(student)
    const reservationData = {
      equipmentId: equipment.id,
      startDate: '2024-01-15T10:00:00Z',
      endDate: '2024-01-17T16:00:00Z',
      projectTitle: 'Integration Test Project',
    }

    const createResponse = await request(app)
      .post('/api/v1/reservations')
      .set('Authorization', `Bearer ${studentToken}`)
      .send(reservationData)
      .expect(201)

    const reservationId = createResponse.body.data.id
    expect(createResponse.body.data.status).toBe('pending')

    // 2. Faculty approves reservation
    const facultyToken = generateValidToken(faculty)
    
    const approveResponse = await request(app)
      .post(`/api/v1/reservations/${reservationId}/approve`)
      .set('Authorization', `Bearer ${facultyToken}`)
      .expect(200)

    expect(approveResponse.body.data.status).toBe('approved')

    // 3. Verify database state
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { equipment: true, user: true },
    })

    expect(reservation).toBeDefined()
    expect(reservation?.status).toBe('approved')
    expect(reservation?.approvedBy).toBe(faculty.id)
  })

  it('prevents double booking', async () => {
    // Create first reservation
    const studentToken = generateValidToken(student)
    
    await request(app)
      .post('/api/v1/reservations')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        equipmentId: equipment.id,
        startDate: '2024-01-15T10:00:00Z',
        endDate: '2024-01-17T16:00:00Z',
        projectTitle: 'First Reservation',
      })
      .expect(201)

    // Try to create overlapping reservation
    const response = await request(app)
      .post('/api/v1/reservations')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        equipmentId: equipment.id,
        startDate: '2024-01-16T10:00:00Z',
        endDate: '2024-01-18T16:00:00Z',
        projectTitle: 'Conflicting Reservation',
      })
      .expect(409)

    expect(response.body.error.code).toBe('EQUIPMENT_UNAVAILABLE')
  })
})
```

## End-to-End Testing

### Playwright E2E Tests

**E2E Test Setup:**
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
})
```

**E2E Test Example:**
```typescript
// e2e/reservation-workflow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Reservation Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as student
    await page.goto('/login')
    await page.fill('[data-testid=email-input]', 'student@example.com')
    await page.fill('[data-testid=password-input]', 'password123')
    await page.click('[data-testid=login-button]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('student can create and view reservation', async ({ page }) => {
    // Navigate to equipment page
    await page.click('[data-testid=equipment-nav]')
    await expect(page).toHaveURL('/equipment')

    // Search for camera
    await page.fill('[data-testid=search-input]', 'Canon EOS R5')
    await page.press('[data-testid=search-input]', 'Enter')

    // Select equipment and create reservation
    await page.click('[data-testid=equipment-card]:first-child [data-testid=reserve-button]')
    
    // Fill reservation form
    await page.fill('[data-testid=start-date]', '2024-01-15')
    await page.fill('[data-testid=end-date]', '2024-01-17')
    await page.fill('[data-testid=project-title]', 'E2E Test Project')
    await page.fill('[data-testid=project-description]', 'Testing the reservation workflow')
    
    // Submit reservation
    await page.click('[data-testid=submit-reservation]')
    
    // Verify success message
    await expect(page.locator('[data-testid=success-message]')).toBeVisible()
    
    // Navigate to reservations page
    await page.click('[data-testid=reservations-nav]')
    
    // Verify reservation appears in list
    await expect(page.locator('[data-testid=reservation-item]')).toContainText('E2E Test Project')
    await expect(page.locator('[data-testid=reservation-status]')).toContainText('Pending')
  })

  test('equipment availability is updated in real-time', async ({ page, context }) => {
    // Open two browser contexts to simulate multiple users
    const page2 = await context.newPage()
    
    // Both users navigate to equipment page
    await page.goto('/equipment')
    await page2.goto('/equipment')
    
    // User 1 reserves equipment
    await page.click('[data-testid=equipment-card]:first-child [data-testid=reserve-button]')
    await page.fill('[data-testid=start-date]', '2024-01-15')
    await page.fill('[data-testid=end-date]', '2024-01-17')
    await page.fill('[data-testid=project-title]', 'First Reservation')
    await page.click('[data-testid=submit-reservation]')
    
    // User 2 should see equipment as unavailable for those dates
    await page2.reload()
    await page2.fill('[data-testid=start-date-filter]', '2024-01-15')
    await page2.fill('[data-testid=end-date-filter]', '2024-01-17')
    await page2.click('[data-testid=check-availability]')
    
    await expect(page2.locator('[data-testid=equipment-card]:first-child')).toContainText('Unavailable')
  })
})
```

## Test Data Management

### Test Fixtures

**Mock Data Factory:**
```typescript
// tests/fixtures/index.ts
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: '1',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'student',
  tenantId: 'tenant-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockEquipment = (overrides: Partial<Equipment> = {}): Equipment => ({
  id: 'equipment-1',
  name: 'Canon EOS R5',
  description: 'Professional mirrorless camera',
  categoryId: 'camera-category',
  condition: 'excellent',
  dailyRate: 75,
  isAvailable: true,
  tenantId: 'tenant-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockReservation = (overrides: Partial<Reservation> = {}): Reservation => ({
  id: 'reservation-1',
  equipmentId: 'equipment-1',
  userId: '1',
  startDate: new Date('2024-01-15'),
  endDate: new Date('2024-01-17'),
  status: 'pending',
  projectTitle: 'Test Project',
  tenantId: 'tenant-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})
```

### Database Seeding for Tests

**Test Database Seeder:**
```typescript
// tests/helpers/seedTestData.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const seedTestData = async () => {
  // Create test tenant
  const tenant = await prisma.tenant.create({
    data: {
      id: 'test-tenant',
      name: 'Test University',
      slug: 'test-university',
      settings: {},
    },
  })

  // Create test users
  const student = await prisma.user.create({
    data: {
      email: 'student@test.edu',
      passwordHash: await hashPassword('password123'),
      firstName: 'Test',
      lastName: 'Student',
      role: 'student',
      tenantId: tenant.id,
    },
  })

  const faculty = await prisma.user.create({
    data: {
      email: 'faculty@test.edu',
      passwordHash: await hashPassword('password123'),
      firstName: 'Test',
      lastName: 'Faculty',
      role: 'faculty',
      tenantId: tenant.id,
    },
  })

  // Create test equipment category
  const category = await prisma.equipmentCategory.create({
    data: {
      name: 'Cameras',
      slug: 'cameras',
      tenantId: tenant.id,
    },
  })

  // Create test equipment
  const equipment = await prisma.equipment.create({
    data: {
      name: 'Canon EOS R5',
      description: 'Professional mirrorless camera',
      categoryId: category.id,
      condition: 'excellent',
      dailyRate: 75,
      tenantId: tenant.id,
    },
  })

  return { tenant, student, faculty, category, equipment }
}
```

## Performance Testing

### Load Testing with Artillery

**Artillery Configuration:**
```yaml
# artillery.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 20
    - duration: 60
      arrivalRate: 5
  variables:
    testUsers:
      - "student1@test.edu"
      - "student2@test.edu"
      - "faculty1@test.edu"

scenarios:
  - name: "Equipment browsing"
    weight: 70
    flow:
      - post:
          url: "/api/v1/auth/login"
          json:
            email: "{{ $randomString() }}@test.edu"
            password: "password123"
          capture:
            json: "$.tokens.accessToken"
            as: "token"
      - get:
          url: "/api/v1/equipment"
          headers:
            Authorization: "Bearer {{ token }}"
      - think: 2
      - get:
          url: "/api/v1/equipment/{{ $randomString() }}"
          headers:
            Authorization: "Bearer {{ token }}"

  - name: "Reservation creation"
    weight: 30
    flow:
      - post:
          url: "/api/v1/auth/login"
          json:
            email: "{{ $randomString() }}@test.edu"
            password: "password123"
          capture:
            json: "$.tokens.accessToken"
            as: "token"
      - post:
          url: "/api/v1/reservations"
          headers:
            Authorization: "Bearer {{ token }}"
          json:
            equipmentId: "{{ $randomString() }}"
            startDate: "2024-01-15T10:00:00Z"
            endDate: "2024-01-17T16:00:00Z"
            projectTitle: "Load Test Reservation"
```

## Continuous Integration

### GitHub Actions Testing Workflow

**CI Configuration:**
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Run unit tests
        run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  test-backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        working-directory: ./backend
        run: npm ci
      
      - name: Run database migrations
        working-directory: ./backend
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
      
      - name: Run tests
        working-directory: ./backend
        run: npm run test:coverage
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Start application
        run: |
          npm run build
          npm run preview &
          npx wait-on http://localhost:4173
      
      - name: Run E2E tests
        run: npx playwright test
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

This comprehensive testing strategy ensures high code quality, reliability, and maintainability of the Equipment Rental System across all environments and use cases. 