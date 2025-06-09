# Equipment Rental System - Configuration Guide

## Environment Configuration

### Development Environment

**Frontend Environment Variables (`.env.development`):**
```env
# Application Configuration
NODE_ENV=development
VITE_APP_TITLE=Gear Pool Development
VITE_APP_VERSION=1.0.0-dev
VITE_API_BASE_URL=http://localhost:3000/api/v1

# Authentication
VITE_JWT_STORAGE_KEY=gear_pool_token
VITE_REFRESH_TOKEN_KEY=gear_pool_refresh_token

# Features
VITE_ENABLE_MOCK_DATA=true
VITE_ENABLE_DEV_TOOLS=true
VITE_ENABLE_ERROR_BOUNDARY=true

# External Services
VITE_SENTRY_DSN=""
VITE_GOOGLE_ANALYTICS_ID=""
```

**Backend Environment Variables (`.env`):**
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
JWT_SECRET=your_jwt_secret_key_for_development_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_key_for_development_min_32_chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=10

# Email (Development with MailHog)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM=noreply@gear-pool.dev
SMTP_SECURE=false

# File Upload
UPLOAD_MAX_SIZE=5242880
UPLOAD_DEST=./uploads
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,application/pdf

# Development
LOG_LEVEL=debug
ENABLE_CORS=true
CORS_ORIGIN=http://localhost:5173
ENABLE_REQUEST_LOGGING=true
```

### Production Environment

**Frontend Production Variables (`.env.production`):**
```env
# Application Configuration
NODE_ENV=production
VITE_APP_TITLE=Gear Pool
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=https://api.gear-pool.com/api/v1

# Authentication
VITE_JWT_STORAGE_KEY=gear_pool_token
VITE_REFRESH_TOKEN_KEY=gear_pool_refresh_token

# Features
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_DEV_TOOLS=false
VITE_ENABLE_ERROR_BOUNDARY=true

# External Services
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
```

**Backend Production Variables:**
```env
# Application
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
API_VERSION=v1

# Database
DATABASE_URL=postgresql://username:password@db-host:5432/gear_pool_prod
DB_LOGGING=false
DB_SYNC=false
DB_POOL_MIN=2
DB_POOL_MAX=10

# Redis
REDIS_URL=redis://redis-host:6379
REDIS_PREFIX=gear_pool:prod:
REDIS_PASSWORD=your_redis_password

# Authentication
JWT_SECRET=your_production_jwt_secret_min_32_chars_very_secure
JWT_REFRESH_SECRET=your_production_refresh_secret_min_32_chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# Email (Production SMTP)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
SMTP_FROM=noreply@gear-pool.com
SMTP_SECURE=true

# File Upload
UPLOAD_MAX_SIZE=10485760
UPLOAD_DEST=./uploads
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,application/pdf
AWS_S3_BUCKET=gear-pool-uploads
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# Security
CORS_ORIGIN=https://gear-pool.com,https://www.gear-pool.com
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=1000
ENABLE_HELMET=true

# Monitoring
LOG_LEVEL=info
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
NEW_RELIC_LICENSE_KEY=your_new_relic_key
```

## Database Configuration

### PostgreSQL Setup

**Connection Configuration:**
```typescript
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Connection pool settings
export const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  pool: {
    min: parseInt(process.env.DB_POOL_MIN || '2'),
    max: parseInt(process.env.DB_POOL_MAX || '10'),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  },
  logging: process.env.DB_LOGGING === 'true',
}
```

**Migration Configuration:**
```typescript
// prisma/migrations/migration.sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable row-level security
ALTER DATABASE gear_pool_prod ENABLE row_level_security;

-- Create custom functions for multi-tenant security
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS uuid AS $$
BEGIN
  RETURN current_setting('app.current_tenant', true)::uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Redis Configuration

**Redis Settings:**
```typescript
// config/redis.ts
import Redis from 'ioredis'

export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keyPrefix: process.env.REDIS_PREFIX || 'gear_pool:',
}

export const redis = new Redis(redisConfig)

// Session store configuration
export const sessionConfig = {
  store: new RedisStore({ client: redis }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}
```

## Email Configuration

### SMTP Settings

**Development (MailHog):**
```typescript
// config/email.ts
export const emailConfig = {
  development: {
    host: 'localhost',
    port: 1025,
    secure: false,
    auth: undefined,
    tls: { rejectUnauthorized: false },
  },
  production: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },
}

// Email templates configuration
export const templateConfig = {
  templatesDir: path.join(__dirname, '../templates'),
  layouts: path.join(__dirname, '../templates/layouts'),
  defaultLayout: 'main',
  partialsDir: path.join(__dirname, '../templates/partials'),
}
```

### Email Templates

**Template Structure:**
```
templates/
├── layouts/
│   └── main.hbs
├── partials/
│   ├── header.hbs
│   └── footer.hbs
└── emails/
    ├── welcome.hbs
    ├── reservation-confirmation.hbs
    ├── reservation-approved.hbs
    ├── reservation-reminder.hbs
    └── password-reset.hbs
```

## File Storage Configuration

### Local Storage (Development)

**Local Upload Configuration:**
```typescript
// config/storage.ts
import multer from 'multer'
import path from 'path'

export const localStorageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_DEST || './uploads'
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`)
  },
})
```

### AWS S3 (Production)

**S3 Configuration:**
```typescript
// config/s3.ts
import AWS from 'aws-sdk'

export const s3Config = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_S3_REGION || 'us-east-1',
}

export const s3 = new AWS.S3(s3Config)

export const uploadConfig = {
  bucket: process.env.AWS_S3_BUCKET,
  acl: 'public-read',
  contentType: multer.AUTO_CONTENT_TYPE,
  key: (req: Request, file: Express.Multer.File, cb: Function) => {
    const filename = `${Date.now()}-${file.originalname}`
    cb(null, `uploads/${filename}`)
  },
}
```

## Security Configuration

### JWT Configuration

**Token Settings:**
```typescript
// config/auth.ts
export const jwtConfig = {
  secret: process.env.JWT_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  algorithm: 'HS256' as const,
  issuer: 'gear-pool-api',
  audience: 'gear-pool-client',
}

// Password configuration
export const passwordConfig = {
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
}
```

### CORS Configuration

**Cross-Origin Settings:**
```typescript
// config/cors.ts
export const corsConfig = {
  origin: (origin: string, callback: Function) => {
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173']
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Request-ID',
  ],
  exposedHeaders: ['X-Request-ID', 'X-Rate-Limit-Remaining'],
}
```

## Rate Limiting Configuration

### API Rate Limiting

**Rate Limit Settings:**
```typescript
// config/rateLimiting.ts
export const rateLimitConfig = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '15') * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX || '1000'),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests, please try again later',
  },
}

// Endpoint-specific limits
export const authRateLimit = {
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
}

export const uploadRateLimit = {
  windowMs: 60 * 1000,
  max: 5,
}
```

## Logging Configuration

### Winston Logger Setup

**Logging Configuration:**
```typescript
// config/logging.ts
import winston from 'winston'

const logLevel = process.env.LOG_LEVEL || 'info'

export const loggerConfig = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'gear-pool-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
})

if (process.env.NODE_ENV !== 'production') {
  loggerConfig.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}
```

## Docker Configuration

### Development Docker Setup

**Docker Compose (docker-compose.dev.yml):**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: gear_pool_dev
      POSTGRES_USER: gear_pool_user
      POSTGRES_PASSWORD: dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  mailhog:
    image: mailhog/mailhog
    ports:
      - "1025:1025"
      - "8025:8025"

volumes:
  postgres_data:
  redis_data:
```

### Production Docker Configuration

**Production Docker Compose:**
```yaml
version: '3.8'

services:
  frontend:
    image: gear-pool/frontend:latest
    environment:
      - NODE_ENV=production
    depends_on:
      - backend
    networks:
      - frontend-network

  backend:
    image: gear-pool/backend:latest
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
      - redis
    networks:
      - backend-network
      - frontend-network

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - backend-network

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - backend-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - frontend
      - backend
    networks:
      - frontend-network

networks:
  frontend-network:
  backend-network:

volumes:
  postgres_data:
  redis_data:
```

## Monitoring Configuration

### Application Monitoring

**Sentry Configuration:**
```typescript
// config/sentry.ts
import * as Sentry from '@sentry/node'

export const sentryConfig = {
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  beforeSend: (event) => {
    // Remove sensitive data
    if (event.request?.headers) {
      delete event.request.headers.authorization
      delete event.request.headers.cookie
    }
    return event
  },
}

if (process.env.SENTRY_DSN) {
  Sentry.init(sentryConfig)
}
```

**Health Check Configuration:**
```typescript
// config/health.ts
export const healthCheckConfig = {
  path: '/health',
  timeout: 5000,
  checks: {
    database: {
      name: 'PostgreSQL',
      check: async () => {
        await prisma.$queryRaw`SELECT 1`
        return { status: 'ok' }
      },
    },
    redis: {
      name: 'Redis',
      check: async () => {
        await redis.ping()
        return { status: 'ok' }
      },
    },
    storage: {
      name: 'File Storage',
      check: async () => {
        // Check storage accessibility
        return { status: 'ok' }
      },
    },
  },
}
```

## Configuration Validation

### Environment Validation

**Configuration Schema:**
```typescript
// config/validation.ts
import Joi from 'joi'

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  REDIS_URL: Joi.string().required(),
  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().default(587),
  CORS_ORIGIN: Joi.string().required(),
}).unknown()

export const validateEnvironment = () => {
  const { error, value } = envSchema.validate(process.env)
  
  if (error) {
    throw new Error(`Environment validation error: ${error.message}`)
  }
  
  return value
}
```

This configuration guide provides comprehensive setup instructions for all environments and services in the Equipment Rental System. 