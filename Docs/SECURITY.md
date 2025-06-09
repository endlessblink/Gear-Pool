# Equipment Rental System - Security Documentation

## Security Overview

The Equipment Rental System implements a comprehensive security framework designed to protect sensitive educational data, ensure user privacy, and maintain system integrity. This document outlines our security architecture, practices, and guidelines for maintaining a secure environment.

## Security Principles

### Core Security Objectives

**Confidentiality:**
- Multi-tenant data isolation
- Role-based access control
- Encryption of sensitive data
- Secure communication channels

**Integrity:**
- Input validation and sanitization
- Audit logging and monitoring
- Data consistency checks
- Tamper-proof audit trails

**Availability:**
- DDoS protection and rate limiting
- Redundancy and failover mechanisms
- Regular security updates
- Performance monitoring

**Accountability:**
- Comprehensive audit logging
- User activity tracking
- Security incident documentation
- Compliance reporting

## Authentication Architecture

### JWT-Based Authentication

**Token Structure:**
```typescript
interface JWTPayload {
  sub: string           // User ID
  email: string         // User email
  role: UserRole        // User role
  tenantId: string      // Department/tenant ID
  permissions: string[] // Specific permissions
  iat: number          // Issued at
  exp: number          // Expires at
  jti: string          // JWT ID for revocation
}
```

**Token Management:**
```typescript
// Access token (short-lived)
const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
  expiresIn: '15m',
  algorithm: 'HS256',
  issuer: 'gear-pool-api',
  audience: 'gear-pool-client',
})

// Refresh token (long-lived)
const refreshToken = jwt.sign(
  { sub: user.id, type: 'refresh' },
  process.env.JWT_REFRESH_SECRET,
  {
    expiresIn: '7d',
    algorithm: 'HS256',
  }
)
```

### Password Security

**Password Requirements:**
```typescript
const passwordRequirements = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true,
  preventPersonalInfo: true,
}

// Password validation
export const validatePassword = (password: string, user: User): ValidationResult => {
  const checks = [
    checkLength(password),
    checkComplexity(password),
    checkCommonPasswords(password),
    checkPersonalInfo(password, user),
    checkPasswordHistory(password, user),
  ]
  
  return {
    isValid: checks.every(check => check.passed),
    errors: checks.filter(check => !check.passed).map(check => check.message),
  }
}
```

**Password Hashing:**
```typescript
import bcrypt from 'bcryptjs'

// Password hashing with configurable rounds
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12')

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, BCRYPT_ROUNDS)
}

export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword)
}
```

### Multi-Factor Authentication (MFA)

**TOTP Implementation:**
```typescript
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'

export class MFAService {
  static generateSecret(user: User): MFASecret {
    const secret = speakeasy.generateSecret({
      name: `${user.email} (Gear Pool)`,
      issuer: 'Gear Pool Equipment Rental',
      length: 32,
    })
    
    return {
      secret: secret.base32,
      qrCode: secret.otpauth_url,
    }
  }
  
  static async verifyToken(secret: string, token: string): Promise<boolean> {
    return speakeasy.totp.verify({
      secret,
      token,
      window: 2, // Allow 2 time steps of variance
      time: Date.now() / 1000,
    })
  }
  
  static generateBackupCodes(): string[] {
    return Array.from({ length: 10 }, () => 
      crypto.randomBytes(4).toString('hex').toUpperCase()
    )
  }
}
```

## Authorization Framework

### Role-Based Access Control (RBAC)

**User Roles Hierarchy:**
```typescript
enum UserRole {
  STUDENT = 'student',
  FACULTY = 'faculty',
  MANAGER = 'manager',
  ADMIN = 'admin',
}

// Role hierarchy (higher roles inherit lower role permissions)
const roleHierarchy = {
  [UserRole.ADMIN]: [UserRole.MANAGER, UserRole.FACULTY, UserRole.STUDENT],
  [UserRole.MANAGER]: [UserRole.FACULTY, UserRole.STUDENT],
  [UserRole.FACULTY]: [UserRole.STUDENT],
  [UserRole.STUDENT]: [],
}
```

**Permission Matrix:**
```typescript
interface PermissionMatrix {
  equipment: {
    view: UserRole[]
    create: UserRole[]
    update: UserRole[]
    delete: UserRole[]
  }
  reservations: {
    create: UserRole[]
    viewOwn: UserRole[]
    viewAll: UserRole[]
    approve: UserRole[]
    cancel: UserRole[]
    extend: UserRole[]
  }
  users: {
    viewOwn: UserRole[]
    viewAll: UserRole[]
    create: UserRole[]
    updateOwn: UserRole[]
    updateAll: UserRole[]
    delete: UserRole[]
  }
  reports: {
    viewBasic: UserRole[]
    viewAdvanced: UserRole[]
    export: UserRole[]
  }
}

const permissions: PermissionMatrix = {
  equipment: {
    view: [UserRole.STUDENT, UserRole.FACULTY, UserRole.MANAGER, UserRole.ADMIN],
    create: [UserRole.MANAGER, UserRole.ADMIN],
    update: [UserRole.MANAGER, UserRole.ADMIN],
    delete: [UserRole.ADMIN],
  },
  reservations: {
    create: [UserRole.STUDENT, UserRole.FACULTY, UserRole.MANAGER, UserRole.ADMIN],
    viewOwn: [UserRole.STUDENT, UserRole.FACULTY, UserRole.MANAGER, UserRole.ADMIN],
    viewAll: [UserRole.FACULTY, UserRole.MANAGER, UserRole.ADMIN],
    approve: [UserRole.FACULTY, UserRole.MANAGER, UserRole.ADMIN],
    cancel: [UserRole.MANAGER, UserRole.ADMIN],
    extend: [UserRole.FACULTY, UserRole.MANAGER, UserRole.ADMIN],
  },
  // ... other permissions
}
```

### Permission Middleware

**Authorization Middleware:**
```typescript
export const authorize = (
  resource: string,
  action: string,
  options: { allowOwner?: boolean } = {}
) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { user } = req
      const hasPermission = await checkPermission(user, resource, action)
      
      if (hasPermission) {
        return next()
      }
      
      // Check owner-specific permissions
      if (options.allowOwner) {
        const resourceId = req.params.id
        const isOwner = await checkOwnership(user.id, resource, resourceId)
        
        if (isOwner) {
          return next()
        }
      }
      
      throw new ForbiddenException('Insufficient permissions')
    } catch (error) {
      next(error)
    }
  }
}

// Usage example
router.get('/reservations', authorize('reservations', 'viewAll'))
router.get('/reservations/:id', authorize('reservations', 'viewOwn', { allowOwner: true }))
```

### Multi-Tenant Security

**Tenant Isolation:**
```typescript
// Tenant context middleware
export const tenantContext = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { user } = req
  
  // Set tenant context for database queries
  await prisma.$executeRaw`
    SELECT set_config('app.current_tenant', ${user.tenantId}, true)
  `
  
  req.tenantId = user.tenantId
  next()
}

// Row-level security policy
export const createTenantPolicy = async () => {
  await prisma.$executeRaw`
    CREATE POLICY tenant_isolation ON equipment
    FOR ALL TO application_role
    USING (tenant_id = current_setting('app.current_tenant')::uuid)
  `
}
```

## Input Validation and Sanitization

### Request Validation

**Schema Validation with Zod:**
```typescript
import { z } from 'zod'

// Equipment creation schema
export const createEquipmentSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(255, 'Name too long')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Invalid characters'),
  
  description: z.string()
    .max(1000, 'Description too long')
    .optional(),
  
  categoryId: z.string()
    .uuid('Invalid category ID'),
  
  serialNumber: z.string()
    .min(1, 'Serial number required')
    .max(100, 'Serial number too long'),
  
  dailyRate: z.number()
    .min(0, 'Rate must be positive')
    .max(10000, 'Rate too high'),
  
  specifications: z.record(z.string())
    .optional(),
    
  tags: z.array(z.string().max(50))
    .max(10, 'Too many tags')
    .optional(),
})

// Validation middleware
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: error.errors,
          },
        })
      }
      next(error)
    }
  }
}
```

### SQL Injection Prevention

**Parameterized Queries:**
```typescript
// Safe database queries with Prisma
export class EquipmentRepository {
  async findByFilters(filters: EquipmentFilters) {
    return await prisma.equipment.findMany({
      where: {
        AND: [
          { tenantId: filters.tenantId },
          filters.categoryId ? { categoryId: filters.categoryId } : {},
          filters.search ? {
            OR: [
              { name: { contains: filters.search, mode: 'insensitive' } },
              { description: { contains: filters.search, mode: 'insensitive' } },
            ]
          } : {},
          filters.available !== undefined ? {
            reservations: {
              none: {
                AND: [
                  { status: { in: ['approved', 'active'] } },
                  {
                    OR: [
                      {
                        startDate: { lte: filters.endDate },
                        endDate: { gte: filters.startDate },
                      },
                    ],
                  },
                ],
              },
            },
          } : {},
        ],
      },
      include: {
        category: true,
        _count: { select: { reservations: true } },
      },
      orderBy: [
        { featured: 'desc' },
        { name: 'asc' },
      ],
    })
  }
}
```

### XSS Prevention

**Content Security Policy:**
```typescript
// CSP header configuration
export const cspMiddleware = helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: [
      "'self'",
      "'unsafe-inline'", // Required for Tailwind CSS
      "https://fonts.googleapis.com",
    ],
    scriptSrc: [
      "'self'",
      "'unsafe-eval'", // Required for React dev tools
    ],
    imgSrc: [
      "'self'",
      "data:",
      "https:",
      "blob:",
    ],
    fontSrc: [
      "'self'",
      "https://fonts.gstatic.com",
    ],
    connectSrc: [
      "'self'",
      process.env.API_BASE_URL,
    ],
    mediaSrc: ["'self'"],
    objectSrc: ["'none'"],
    frameSrc: ["'none'"],
  },
})
```

**Output Sanitization:**
```typescript
import DOMPurify from 'dompurify'

// Sanitize HTML content
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
    ALLOWED_ATTR: [],
  })
}

// Safe rendering component
export const SafeHTML: React.FC<{ content: string }> = ({ content }) => {
  const sanitizedContent = useMemo(() => sanitizeHtml(content), [content])
  
  return (
    <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
  )
}
```

## API Security

### Rate Limiting

**Advanced Rate Limiting:**
```typescript
import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'

// Redis-based rate limiting
const rateLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req) => {
    // Different limits based on user role
    const user = req.user as User
    const limits = {
      [UserRole.STUDENT]: 100,
      [UserRole.FACULTY]: 200,
      [UserRole.MANAGER]: 500,
      [UserRole.ADMIN]: 1000,
    }
    return limits[user.role] || 50
  },
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Endpoint-specific rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts per 15 minutes
  skipSuccessfulRequests: true,
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT',
      message: 'Too many login attempts, please try again later',
    },
  },
})

// Apply rate limiting
app.use('/api', rateLimiter)
app.use('/api/auth/login', authLimiter)
```

### CORS Configuration

**Secure CORS Setup:**
```typescript
import cors from 'cors'

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || []
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.includes(origin)) {
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
  maxAge: 86400, // 24 hours
}

app.use(cors(corsOptions))
```

### API Security Headers

**Comprehensive Security Headers:**
```typescript
import helmet from 'helmet'

app.use(helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.API_BASE_URL],
    },
  },
  
  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  
  // X-Frame-Options
  frameguard: { action: 'deny' },
  
  // X-Content-Type-Options
  noSniff: true,
  
  // Referrer Policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  
  // X-XSS-Protection
  xssFilter: true,
}))

// Additional custom headers
app.use((req, res, next) => {
  res.setHeader('X-API-Version', '1.0.0')
  res.setHeader('X-Request-ID', req.id)
  res.removeHeader('X-Powered-By')
  next()
})
```

## Data Protection

### Encryption

**Data Encryption at Rest:**
```typescript
import crypto from 'crypto'

export class EncryptionService {
  private static readonly algorithm = 'aes-256-gcm'
  private static readonly keyLength = 32
  private static readonly ivLength = 16
  private static readonly tagLength = 16
  
  static encrypt(data: string, key: Buffer): EncryptedData {
    const iv = crypto.randomBytes(this.ivLength)
    const cipher = crypto.createCipher(this.algorithm, key, iv)
    
    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const tag = cipher.getAuthTag()
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
    }
  }
  
  static decrypt(encryptedData: EncryptedData, key: Buffer): string {
    const { encrypted, iv, tag } = encryptedData
    const decipher = crypto.createDecipher(
      this.algorithm,
      key,
      Buffer.from(iv, 'hex')
    )
    
    decipher.setAuthTag(Buffer.from(tag, 'hex'))
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  }
  
  // Field-level encryption for sensitive data
  static encryptField(value: string): string {
    const key = Buffer.from(process.env.FIELD_ENCRYPTION_KEY, 'hex')
    const encrypted = this.encrypt(value, key)
    return JSON.stringify(encrypted)
  }
}
```

**Database Field Encryption:**
```typescript
// Encrypted model fields
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string
  
  @Column()
  email: string
  
  @Column({ transformer: encryptionTransformer })
  socialSecurityNumber?: string
  
  @Column({ transformer: encryptionTransformer })
  phoneNumber?: string
}

// Encryption transformer
const encryptionTransformer = {
  to: (value: string) => value ? EncryptionService.encryptField(value) : null,
  from: (value: string) => value ? EncryptionService.decryptField(value) : null,
}
```

### Secure File Handling

**File Upload Security:**
```typescript
import multer from 'multer'
import path from 'path'

// Secure file upload configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1, // Single file upload
  },
  fileFilter: (req, file, cb) => {
    // Allowed file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp']
    
    const fileExtension = path.extname(file.originalname).toLowerCase()
    
    if (allowedTypes.includes(file.mimetype) && 
        allowedExtensions.includes(fileExtension)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type'), false)
    }
  },
})

// File processing with security checks
export const processFileUpload = async (file: Express.Multer.File): Promise<ProcessedFile> => {
  // Verify file signature
  const isValidFile = await verifyFileSignature(file.buffer, file.mimetype)
  if (!isValidFile) {
    throw new SecurityException('Invalid file signature')
  }
  
  // Scan for malware (if antivirus service available)
  const isSafe = await scanForMalware(file.buffer)
  if (!isSafe) {
    throw new SecurityException('File contains malware')
  }
  
  // Generate secure filename
  const secureFilename = generateSecureFilename(file.originalname)
  
  // Upload to secure storage
  const uploadResult = await uploadToSecureStorage(file.buffer, secureFilename)
  
  return {
    filename: secureFilename,
    originalName: file.originalname,
    size: file.size,
    mimeType: file.mimetype,
    url: uploadResult.url,
  }
}

// File signature verification
const fileSignatures = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
}

const verifyFileSignature = (buffer: Buffer, mimeType: string): boolean => {
  const signature = fileSignatures[mimeType]
  if (!signature) return false
  
  return signature.every((byte, index) => buffer[index] === byte)
}
```

## Audit Logging and Monitoring

### Comprehensive Audit Logging

**Audit Log Structure:**
```typescript
interface AuditLog {
  id: string
  timestamp: Date
  userId: string
  tenantId: string
  action: string
  resource: string
  resourceId?: string
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  ipAddress: string
  userAgent: string
  sessionId?: string
  result: 'success' | 'failure'
  errorMessage?: string
  metadata?: Record<string, any>
}

// Audit logging service
export class AuditService {
  static async log(entry: Partial<AuditLog>): Promise<void> {
    const auditEntry: AuditLog = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      result: 'success',
      ...entry,
    }
    
    // Store in database
    await prisma.auditLog.create({ data: auditEntry })
    
    // Send to external logging service
    if (process.env.AUDIT_LOG_WEBHOOK) {
      await this.sendToExternalLogger(auditEntry)
    }
  }
  
  private static async sendToExternalLogger(entry: AuditLog): Promise<void> {
    try {
      await fetch(process.env.AUDIT_LOG_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      })
    } catch (error) {
      console.error('Failed to send audit log to external service:', error)
    }
  }
}

// Audit middleware
export const auditMiddleware = (action: string, resource: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const startTime = Date.now()
    
    // Store original method for audit
    const originalSend = res.send
    res.send = function(data) {
      const duration = Date.now() - startTime
      
      // Log the audit entry
      AuditService.log({
        userId: req.user?.id,
        tenantId: req.user?.tenantId,
        action,
        resource,
        resourceId: req.params.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        result: res.statusCode < 400 ? 'success' : 'failure',
        metadata: {
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          duration,
        },
      })
      
      return originalSend.call(this, data)
    }
    
    next()
  }
}
```

### Security Monitoring

**Intrusion Detection:**
```typescript
export class SecurityMonitor {
  // Monitor failed login attempts
  static async monitorFailedLogins(userId: string, ipAddress: string): Promise<void> {
    const key = `failed_logins:${userId}:${ipAddress}`
    const attempts = await redis.incr(key)
    
    if (attempts === 1) {
      await redis.expire(key, 900) // 15 minutes
    }
    
    if (attempts >= 5) {
      await this.triggerSecurityAlert({
        type: 'EXCESSIVE_FAILED_LOGINS',
        userId,
        ipAddress,
        attempts,
      })
      
      // Lock account temporarily
      await this.lockAccount(userId, 900) // 15 minutes
    }
  }
  
  // Monitor suspicious activity patterns
  static async monitorSuspiciousActivity(req: AuthenticatedRequest): Promise<void> {
    const patterns = [
      this.checkUnusualLoginTime(req.user.id),
      this.checkUnusualLocation(req.user.id, req.ip),
      this.checkMassDataAccess(req.user.id),
      this.checkPrivilegeEscalation(req.user.id, req.originalUrl),
    ]
    
    const suspiciousPatterns = await Promise.all(patterns)
    const alertCount = suspiciousPatterns.filter(Boolean).length
    
    if (alertCount >= 2) {
      await this.triggerSecurityAlert({
        type: 'SUSPICIOUS_ACTIVITY_PATTERN',
        userId: req.user.id,
        patterns: suspiciousPatterns.filter(Boolean),
      })
    }
  }
  
  private static async triggerSecurityAlert(alert: SecurityAlert): Promise<void> {
    // Log security alert
    await AuditService.log({
      action: 'SECURITY_ALERT',
      resource: 'security',
      result: 'success',
      metadata: alert,
    })
    
    // Send notification to security team
    await NotificationService.sendSecurityAlert(alert)
    
    // Store in security incidents database
    await prisma.securityIncident.create({
      data: {
        type: alert.type,
        severity: this.calculateSeverity(alert),
        details: alert,
        status: 'open',
      },
    })
  }
}
```

## Incident Response

### Security Incident Response Plan

**Incident Classification:**
```typescript
enum SecurityIncidentType {
  DATA_BREACH = 'data_breach',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  MALWARE_DETECTION = 'malware_detection',
  DDoS_ATTACK = 'ddos_attack',
  INSIDER_THREAT = 'insider_threat',
  SYSTEM_COMPROMISE = 'system_compromise',
}

enum SeverityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

interface SecurityIncident {
  id: string
  type: SecurityIncidentType
  severity: SeverityLevel
  status: 'open' | 'investigating' | 'resolved' | 'closed'
  description: string
  affectedSystems: string[]
  affectedUsers: string[]
  discoveredAt: Date
  resolvedAt?: Date
  responseActions: IncidentAction[]
}
```

**Automated Response Actions:**
```typescript
export class IncidentResponseService {
  static async handleSecurityIncident(incident: SecurityIncident): Promise<void> {
    // Immediate containment actions
    await this.executeContainmentActions(incident)
    
    // Notification chain
    await this.notifyStakeholders(incident)
    
    // Evidence collection
    await this.collectEvidence(incident)
    
    // Recovery actions
    await this.initiateRecovery(incident)
  }
  
  private static async executeContainmentActions(incident: SecurityIncident): Promise<void> {
    switch (incident.type) {
      case SecurityIncidentType.UNAUTHORIZED_ACCESS:
        await this.revokeCompromisedSessions(incident.affectedUsers)
        await this.enableAdditionalMFA(incident.affectedUsers)
        break
        
      case SecurityIncidentType.DATA_BREACH:
        await this.isolateAffectedSystems(incident.affectedSystems)
        await this.enableEmergencyAccessLogs()
        break
        
      case SecurityIncidentType.DDoS_ATTACK:
        await this.enableDDoSMitigation()
        await this.scaleDefensiveResources()
        break
    }
  }
  
  private static async revokeCompromisedSessions(userIds: string[]): Promise<void> {
    for (const userId of userIds) {
      // Revoke all active sessions
      await redis.del(`user_sessions:${userId}:*`)
      
      // Force password reset
      await prisma.user.update({
        where: { id: userId },
        data: { 
          forcePasswordReset: true,
          sessionRevoked: new Date(),
        },
      })
    }
  }
}
```

## Compliance and Privacy

### Data Privacy (GDPR/CCPA)

**Data Subject Rights:**
```typescript
export class DataPrivacyService {
  // Right to access personal data
  static async exportUserData(userId: string): Promise<UserDataExport> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        reservations: true,
        auditLogs: true,
        preferences: true,
      },
    })
    
    return {
      personalData: this.sanitizePersonalData(user),
      reservationHistory: user.reservations,
      activityLogs: user.auditLogs,
      preferences: user.preferences,
      exportedAt: new Date(),
    }
  }
  
  // Right to be forgotten
  static async deleteUserData(userId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Anonymize audit logs (keep for legal compliance)
      await tx.auditLog.updateMany({
        where: { userId },
        data: { userId: 'anonymous' },
      })
      
      // Delete reservations (if allowed by business rules)
      await tx.reservation.deleteMany({
        where: { userId, status: 'completed' },
      })
      
      // Delete user account
      await tx.user.delete({ where: { id: userId } })
    })
  }
  
  // Data portability
  static async generateDataPortabilityReport(userId: string): Promise<Buffer> {
    const userData = await this.exportUserData(userId)
    const jsonData = JSON.stringify(userData, null, 2)
    
    // Create encrypted archive
    const archive = await this.createEncryptedArchive(jsonData)
    return archive
  }
}
```

### Compliance Reporting

**Automated Compliance Reports:**
```typescript
export class ComplianceReportingService {
  // Generate GDPR compliance report
  static async generateGDPRReport(period: DateRange): Promise<GDPRReport> {
    const dataProcessingActivities = await this.getDataProcessingActivities(period)
    const dataSubjectRequests = await this.getDataSubjectRequests(period)
    const securityIncidents = await this.getSecurityIncidents(period)
    
    return {
      reportPeriod: period,
      dataProcessingActivities,
      dataSubjectRequests,
      securityIncidents,
      complianceScore: this.calculateComplianceScore(),
      recommendations: this.generateRecommendations(),
      generatedAt: new Date(),
    }
  }
  
  // SOC 2 Type II compliance
  static async generateSOC2Report(): Promise<SOC2Report> {
    const controls = await this.evaluateSOC2Controls()
    const exceptions = await this.identifyControlExceptions()
    
    return {
      trustServicesCriteria: {
        security: controls.security,
        availability: controls.availability,
        confidentiality: controls.confidentiality,
        processingIntegrity: controls.processingIntegrity,
        privacy: controls.privacy,
      },
      exceptions,
      remediation: this.generateRemediationPlan(exceptions),
    }
  }
}
```

## Security Best Practices

### Development Security Guidelines

**Secure Coding Checklist:**

1. **Input Validation:**
   - [ ] All user inputs validated and sanitized
   - [ ] SQL injection prevention implemented
   - [ ] XSS protection in place
   - [ ] File upload restrictions configured

2. **Authentication & Authorization:**
   - [ ] Strong password requirements enforced
   - [ ] JWT tokens properly secured
   - [ ] Session management implemented
   - [ ] MFA available for privileged accounts

3. **Data Protection:**
   - [ ] Sensitive data encrypted at rest
   - [ ] TLS/HTTPS enforced for all communications
   - [ ] PII handling compliant with regulations
   - [ ] Data retention policies implemented

4. **Error Handling:**
   - [ ] Error messages don't leak sensitive information
   - [ ] Proper logging without exposing secrets
   - [ ] Graceful error handling implemented
   - [ ] Security monitoring alerts configured

### Deployment Security

**Production Security Checklist:**

1. **Infrastructure:**
   - [ ] Security patches applied
   - [ ] Firewall rules configured
   - [ ] Network segmentation implemented
   - [ ] Monitoring and logging enabled

2. **Application:**
   - [ ] Security headers configured
   - [ ] Rate limiting enabled
   - [ ] CORS properly configured
   - [ ] Secrets management implemented

3. **Database:**
   - [ ] Database access restricted
   - [ ] Backup encryption enabled
   - [ ] Audit logging configured
   - [ ] Regular security updates applied

4. **Monitoring:**
   - [ ] Security event monitoring
   - [ ] Intrusion detection system
   - [ ] Log aggregation and analysis
   - [ ] Incident response procedures

This security documentation provides comprehensive guidelines for maintaining the security posture of the Equipment Rental System. Regular security reviews and updates to these practices are essential for maintaining protection against evolving threats. 