# Equipment Rental System - Development Guide

## Overview

This guide covers the complete development setup, workflow, and best practices for the Equipment Rental System. It's designed for developers joining the project or setting up a local development environment.

## Prerequisites

### System Requirements

**Required Software:**
- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher (comes with Node.js)
- **Git**: 2.30.0 or higher
- **Docker**: 24.0.0 or higher
- **Docker Compose**: 2.20.0 or higher

**Recommended Tools:**
- **VS Code**: With recommended extensions
- **Postman**: For API testing
- **TablePlus/pgAdmin**: For database management
- **Chrome DevTools**: For debugging

### Operating System Support

**Fully Supported:**
- macOS 12.0+
- Ubuntu 20.04+ / Debian 11+
- Windows 10+ with WSL2

**Development Environment:**
- Terminal/Command Line interface
- Git Bash (Windows users)
- Modern code editor

## Project Setup

### Initial Setup

1. **Clone the repository:**
```bash
git clone https://github.com/your-org/gear-pool.git
cd gear-pool
```

2. **Install dependencies:**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies (when available)
cd backend
npm install
cd ..
```

3. **Environment configuration:**
```bash
# Copy environment template
cp .env.example .env.development

# Edit environment variables
nano .env.development
```

4. **Start development services:**
```bash
# Start infrastructure services
docker-compose -f docker-compose.dev.yml up -d

# Start frontend development server
npm run dev

# Start backend development server (in separate terminal)
cd backend && npm run dev
```

### Environment Variables

**Frontend Environment (`.env.development`):**
```env
# Development Configuration
NODE_ENV=development
VITE_APP_TITLE=Gear Pool Development
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_VERSION=1.0.0-dev

# Authentication
VITE_JWT_STORAGE_KEY=gear_pool_token
VITE_REFRESH_TOKEN_KEY=gear_pool_refresh_token

# Features
VITE_ENABLE_MOCK_DATA=true
VITE_ENABLE_DEV_TOOLS=true
VITE_ENABLE_ERROR_BOUNDARY=true

# External Services
VITE_SENTRY_DSN=
VITE_GOOGLE_ANALYTICS_ID=
VITE_STRIPE_PUBLISHABLE_KEY=
```

**Backend Environment (when available):**
```env
# Application
NODE_ENV=development
PORT=3000
HOST=localhost
API_VERSION=v1

# Database
DATABASE_URL=postgresql://gear_pool_user:dev_password@localhost:5432/gear_pool_dev
DB_LOGGING=true
DB_SYNC=false

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PREFIX=gear_pool:dev:

# Authentication
JWT_SECRET=your_jwt_secret_key_for_development
JWT_REFRESH_SECRET=your_refresh_secret_key_for_development
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=10

# Email (Development)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@gear-pool.dev
SMTP_SECURE=false

# File Upload
UPLOAD_MAX_SIZE=5242880
UPLOAD_DEST=./uploads
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp

# Development
LOG_LEVEL=debug
ENABLE_CORS=true
CORS_ORIGIN=http://localhost:5173
ENABLE_REQUEST_LOGGING=true
```

## Development Workflow

### Git Workflow

**Branching Strategy:**
```bash
# Main branches
main          # Production-ready code
develop       # Integration branch
feature/*     # Feature development
bugfix/*      # Bug fixes
hotfix/*      # Emergency fixes
release/*     # Release preparation
```

**Feature Development:**
```bash
# Create feature branch
git checkout develop
git pull origin develop
git checkout -b feature/equipment-search

# Work on feature
git add .
git commit -m "feat: add equipment search functionality"

# Push and create PR
git push origin feature/equipment-search
# Create Pull Request to develop
```

**Commit Convention:**
```bash
# Format: type(scope): description
feat(auth): add JWT token refresh mechanism
fix(ui): resolve mobile navigation issue
docs(api): update endpoint documentation
style(components): improve button styling
refactor(utils): optimize date formatting
test(api): add user authentication tests
chore(deps): update dependency versions
```

### Code Organization

**Frontend Structure:**
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI components
│   ├── forms/           # Form components
│   ├── layout/          # Layout components
│   └── equipment/       # Equipment-specific components
├── pages/               # Page components
│   ├── auth/           # Authentication pages
│   ├── equipment/      # Equipment pages
│   ├── reservations/   # Reservation pages
│   └── admin/          # Admin pages
├── hooks/               # Custom React hooks
│   ├── useAuth.ts      # Authentication hook
│   ├── useApi.ts       # API integration hook
│   └── useLocalStorage.ts
├── lib/                 # Utility libraries
│   ├── api.ts          # API client
│   ├── auth.ts         # Authentication utilities
│   ├── utils.ts        # General utilities
│   └── validations.ts  # Form validations
├── types/               # TypeScript type definitions
│   ├── api.ts          # API response types
│   ├── auth.ts         # Authentication types
│   └── equipment.ts    # Equipment types
├── styles/              # Global styles
├── assets/              # Static assets
└── constants/           # Application constants
```

**Backend Structure (when implemented):**
```
backend/
├── src/
│   ├── controllers/     # Route handlers
│   ├── services/        # Business logic
│   ├── models/          # Database models
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript types
│   ├── config/          # Configuration files
│   └── validators/      # Input validation
├── tests/               # Test files
├── migrations/          # Database migrations
├── seeds/               # Database seeds
└── docs/                # API documentation
```

### Development Scripts

**Frontend Scripts:**
```json
{
  "scripts": {
    "dev": "vite --host",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,md}\"",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

**Backend Scripts (when available):**
```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint . --ext .ts",
    "lint:fix": "eslint . --ext .ts --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "db:migrate": "prisma migrate dev",
    "db:seed": "ts-node prisma/seed.ts",
    "db:studio": "prisma studio"
  }
}
```

## Technology Stack Deep Dive

### Frontend Technologies

#### React 18 with TypeScript

**Key Features:**
- Concurrent rendering for better performance
- Automatic batching for state updates
- Suspense for data fetching
- Strict type checking with TypeScript

**Configuration (`tsconfig.json`):**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

#### Vite Build Tool

**Configuration (`vite.config.ts`):**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/types': path.resolve(__dirname, './src/types'),
    },
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
})
```

#### Tailwind CSS

**Configuration (`tailwind.config.ts`):**
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

### Backend Technologies (Planned)

#### Node.js with Express

**Server Setup:**
```typescript
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import { authRoutes, equipmentRoutes, reservationRoutes } from './routes'
import { errorHandler, notFound } from './middleware'

const app = express()

// Security middleware
app.use(helmet())
app.use(compression())

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:5173',
  credentials: true,
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})
app.use('/api', limiter)

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/equipment', equipmentRoutes)
app.use('/api/v1/reservations', reservationRoutes)

// Error handling
app.use(notFound)
app.use(errorHandler)

export default app
```

#### PostgreSQL with Prisma

**Prisma Schema:**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                String   @id @default(cuid())
  email             String   @unique
  passwordHash      String
  firstName         String
  lastName          String
  role              UserRole @default(STUDENT)
  tenantId          String
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  tenant            Tenant   @relation(fields: [tenantId], references: [id])
  reservations      Reservation[]
  
  @@map("users")
}

model Equipment {
  id                String   @id @default(cuid())
  name              String
  description       String?
  categoryId        String
  condition         EquipmentCondition @default(GOOD)
  tenantId          String
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  category          EquipmentCategory @relation(fields: [categoryId], references: [id])
  tenant            Tenant   @relation(fields: [tenantId], references: [id])
  reservationItems  ReservationItem[]
  
  @@map("equipment")
}

enum UserRole {
  STUDENT
  FACULTY
  MANAGER
  ADMIN
}

enum EquipmentCondition {
  EXCELLENT
  GOOD
  FAIR
  POOR
  RETIRED
}
```

## Testing Strategy

### Frontend Testing

#### Testing Setup with Vitest

**Configuration (`vitest.config.ts`):**
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**Test Setup (`src/test/setup.ts`):**
```typescript
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Clean up after each test
afterEach(() => {
  cleanup()
})

// Mock environment variables
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

#### Component Testing

**Example Component Test:**
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { EquipmentCard } from '@/components/equipment/EquipmentCard'
import { mockEquipment } from '@/test/mocks'

describe('EquipmentCard', () => {
  it('renders equipment information correctly', () => {
    render(<EquipmentCard equipment={mockEquipment} />)
    
    expect(screen.getByText(mockEquipment.name)).toBeInTheDocument()
    expect(screen.getByText(mockEquipment.description)).toBeInTheDocument()
    expect(screen.getByText(`$${mockEquipment.dailyRate}/day`)).toBeInTheDocument()
  })

  it('handles reservation button click', async () => {
    const onReserve = vi.fn()
    render(<EquipmentCard equipment={mockEquipment} onReserve={onReserve} />)
    
    fireEvent.click(screen.getByText('Reserve'))
    
    await waitFor(() => {
      expect(onReserve).toHaveBeenCalledWith(mockEquipment.id)
    })
  })

  it('shows availability status', () => {
    const unavailableEquipment = { ...mockEquipment, isAvailable: false }
    render(<EquipmentCard equipment={unavailableEquipment} />)
    
    expect(screen.getByText('Unavailable')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reserve' })).toBeDisabled()
  })
})
```

#### Hook Testing

**Example Hook Test:**
```typescript
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useAuth } from '@/hooks/useAuth'
import { AuthProvider } from '@/contexts/AuthContext'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

describe('useAuth', () => {
  it('provides authentication state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isLoading).toBe(false)
  })

  it('handles login correctly', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      await result.current.login('test@example.com', 'password')
    })
    
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual(expect.objectContaining({
      email: 'test@example.com'
    }))
  })
})
```

### Backend Testing (when implemented)

#### API Testing with Jest

**Example API Test:**
```typescript
import request from 'supertest'
import app from '../src/app'
import { prisma } from '../src/lib/prisma'

describe('Auth API', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student',
        tenantId: 'tenant-1'
      }

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201)

      expect(response.body.user.email).toBe(userData.email)
      expect(response.body.user.passwordHash).toBeUndefined()
    })

    it('should return 400 for invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      }

      await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400)
    })
  })
})
```

## Code Quality

### ESLint Configuration

**ESLint Config (`.eslintrc.json`):**
```json
{
  "root": true,
  "env": { "browser": true, "es2020": true },
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "react-hooks/recommended",
    "prettier"
  ],
  "ignorePatterns": ["dist", ".eslintrc.cjs"],
  "parser": "@typescript-eslint/parser",
  "plugins": ["react-refresh", "@typescript-eslint"],
  "rules": {
    "react-refresh/only-export-components": [
      "warn",
      { "allowConstantExport": true }
    ],
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### Prettier Configuration

**Prettier Config (`.prettierrc`):**
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### Pre-commit Hooks

**Husky Setup:**
```bash
# Install husky
npm install --save-dev husky lint-staged

# Initialize husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

**Lint-staged Config (`package.json`):**
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,md,json}": [
      "prettier --write"
    ]
  }
}
```

## API Integration

### API Client Setup

**API Client (`src/lib/api.ts`):**
```typescript
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { AuthTokens } from '@/types/auth'

class ApiClient {
  private client: AxiosInstance
  private tokens: AuthTokens | null = null

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (this.tokens?.accessToken) {
          config.headers.Authorization = `Bearer ${this.tokens.accessToken}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && this.tokens?.refreshToken) {
          try {
            await this.refreshToken()
            return this.client.request(error.config)
          } catch (refreshError) {
            this.logout()
            throw refreshError
          }
        }
        return Promise.reject(error)
      }
    )
  }

  setTokens(tokens: AuthTokens) {
    this.tokens = tokens
  }

  async refreshToken() {
    const response = await this.client.post('/auth/refresh', {
      refreshToken: this.tokens?.refreshToken,
    })
    this.setTokens(response.data)
  }

  logout() {
    this.tokens = null
    localStorage.removeItem('authTokens')
  }

  // API methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get(url, config)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete(url, config)
    return response.data
  }
}

export const apiClient = new ApiClient(
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'
)
```

### API Services

**Equipment Service (`src/services/equipment.ts`):**
```typescript
import { apiClient } from '@/lib/api'
import type { Equipment, EquipmentFilters, PaginatedResponse } from '@/types/api'

export const equipmentService = {
  async getEquipment(filters?: EquipmentFilters): Promise<PaginatedResponse<Equipment>> {
    return apiClient.get('/equipment', { params: filters })
  },

  async getEquipmentById(id: string): Promise<Equipment> {
    return apiClient.get(`/equipment/${id}`)
  },

  async createEquipment(data: Partial<Equipment>): Promise<Equipment> {
    return apiClient.post('/equipment', data)
  },

  async updateEquipment(id: string, data: Partial<Equipment>): Promise<Equipment> {
    return apiClient.put(`/equipment/${id}`, data)
  },

  async deleteEquipment(id: string): Promise<void> {
    return apiClient.delete(`/equipment/${id}`)
  },

  async checkAvailability(id: string, startDate: string, endDate: string) {
    return apiClient.get(`/equipment/${id}/availability`, {
      params: { startDate, endDate },
    })
  },
}
```

## State Management

### Context Setup

**Auth Context (`src/contexts/AuthContext.tsx`):**
```typescript
import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { authService } from '@/services/auth'
import type { User, AuthTokens } from '@/types/auth'

interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; tokens: AuthTokens } }
  | { type: 'AUTH_FAILURE' }
  | { type: 'LOGOUT' }

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,
}

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true }
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isAuthenticated: true,
        isLoading: false,
      }
    case 'AUTH_FAILURE':
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
      }
    default:
      return state
  }
}

const AuthContext = createContext<{
  state: AuthState
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (userData: any) => Promise<void>
} | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const initAuth = async () => {
      const storedTokens = localStorage.getItem('authTokens')
      if (storedTokens) {
        try {
          const tokens = JSON.parse(storedTokens)
          const user = await authService.getCurrentUser(tokens.accessToken)
          dispatch({ type: 'AUTH_SUCCESS', payload: { user, tokens } })
        } catch {
          localStorage.removeItem('authTokens')
          dispatch({ type: 'AUTH_FAILURE' })
        }
      } else {
        dispatch({ type: 'AUTH_FAILURE' })
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    dispatch({ type: 'AUTH_START' })
    try {
      const response = await authService.login(email, password)
      localStorage.setItem('authTokens', JSON.stringify(response.tokens))
      dispatch({ type: 'AUTH_SUCCESS', payload: response })
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE' })
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('authTokens')
    dispatch({ type: 'LOGOUT' })
  }

  const register = async (userData: any) => {
    dispatch({ type: 'AUTH_START' })
    try {
      const response = await authService.register(userData)
      localStorage.setItem('authTokens', JSON.stringify(response.tokens))
      dispatch({ type: 'AUTH_SUCCESS', payload: response })
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE' })
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ state, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

## Performance Optimization

### Code Splitting

**Route-based Code Splitting:**
```typescript
import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

// Lazy load pages
const Equipment = lazy(() => import('@/pages/Equipment'))
const Reservations = lazy(() => import('@/pages/Reservations'))
const Admin = lazy(() => import('@/pages/Admin'))

export const AppRoutes = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Routes>
      <Route path="/equipment" element={<Equipment />} />
      <Route path="/reservations" element={<Reservations />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  </Suspense>
)
```

### Bundle Analysis

```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist

# Check for duplicate dependencies
npm ls --depth=0
```

### Caching Strategy

**Service Worker Setup:**
```typescript
// src/sw.ts
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies'

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// Cache API responses
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
  })
)

// Cache images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
  })
)
```

## Debugging and Development Tools

### VS Code Configuration

**Settings (`.vscode/settings.json`):**
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

**Extensions (`.vscode/extensions.json`):**
```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "vitest.explorer"
  ]
}
```

### Development Debugging

**React DevTools:**
```typescript
// Enable React DevTools in development
if (import.meta.env.DEV) {
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || {}
}
```

**Console Debugging:**
```typescript
// Development-only logging utility
export const devLog = (message: string, data?: any) => {
  if (import.meta.env.DEV) {
    console.log(`[DEV] ${message}`, data)
  }
}

// API request logging
if (import.meta.env.DEV) {
  apiClient.interceptors.request.use(request => {
    console.log('API Request:', request)
    return request
  })
}
```

## Deployment Preparation

### Build Optimization

**Production Build:**
```bash
# Clean build
rm -rf dist
npm run build

# Verify build
npm run preview

# Check bundle size
du -sh dist/*
```

**Environment Variables for Production:**
```env
NODE_ENV=production
VITE_API_BASE_URL=https://api.gear-pool.com/api/v1
VITE_SENTRY_DSN=your_sentry_dsn
VITE_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
```

### Docker Development

**Development Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Development server
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
```

## Contributing Guidelines

### Pull Request Process

1. **Create Feature Branch:**
```bash
git checkout -b feature/description
```

2. **Make Changes:**
   - Follow coding standards
   - Add tests for new features
   - Update documentation
   - Ensure all tests pass

3. **Commit Changes:**
```bash
git add .
git commit -m "feat: add new feature description"
```

4. **Push and Create PR:**
```bash
git push origin feature/description
# Create PR through GitHub interface
```

### Code Review Checklist

**For Reviewers:**
- [ ] Code follows project conventions
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance impact considered
- [ ] Accessibility requirements met
- [ ] Mobile responsiveness verified

**For Authors:**
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Linting passes
- [ ] Build succeeds
- [ ] Documentation updated
- [ ] Breaking changes documented

This development guide provides comprehensive information for setting up and contributing to the Equipment Rental System. For additional questions, please refer to the project README or contact the development team. 