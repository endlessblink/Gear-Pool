# Equipment Rental System - API Documentation

## Overview

The Equipment Rental System API provides a RESTful interface for managing equipment reservations, user authentication, and administrative functions. The API is designed with multi-tenant architecture, supporting department-level isolation and role-based access control.

## Base URL

```
Production: https://api.gear-pool.com/api/v1
Development: http://localhost:3000/api/v1
```

## Authentication

All API endpoints (except authentication routes) require a valid JWT token in the Authorization header:

```http
Authorization: Bearer <jwt_token>
```

### Token Structure
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "student|faculty|manager|admin",
  "tenantId": "department_id",
  "iat": 1640995200,
  "exp": 1641081600
}
```

## Multi-Tenant Routing

All API routes include the tenant (department) ID in the path:

```
/api/v1/tenants/{tenantId}/...
```

This ensures complete data isolation between departments.

## Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional error context",
    "timestamp": "2023-01-01T00:00:00Z",
    "requestId": "req_123456789"
  }
}
```

### HTTP Status Codes
- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., double booking)
- `422 Unprocessable Entity` - Validation errors
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

## Rate Limiting

API requests are rate-limited per user:
- **Standard users**: 100 requests per hour
- **Admin users**: 1000 requests per hour
- **Authentication endpoints**: 10 requests per hour

Rate limit headers are included in all responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "student@university.edu",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "student",
  "tenantId": "film_department",
  "studentId": "STU123456" // Optional for students
}
```

**Response (201):**
```json
{
  "user": {
    "id": "user_123",
    "email": "student@university.edu",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student",
    "tenantId": "film_department",
    "isEmailVerified": false,
    "createdAt": "2023-01-01T00:00:00Z"
  },
  "message": "Registration successful. Please check your email for verification."
}
```

### POST /auth/login
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "student@university.edu",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "user_123",
    "email": "student@university.edu",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student",
    "tenantId": "film_department",
    "permissions": ["read:equipment", "create:reservation"]
  },
  "expiresIn": 3600
}
```

### POST /auth/refresh
Refresh an expired JWT token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

### POST /auth/logout
Invalidate user token and refresh token.

### GET /auth/verify-email/{token}
Verify user email address.

### POST /auth/forgot-password
Initiate password reset process.

### POST /auth/reset-password
Reset user password with token.

## User Management

### GET /tenants/{tenantId}/users
Get all users in the tenant (requires admin/manager role).

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Results per page (default: 20, max: 100)
- `role` (string): Filter by role
- `search` (string): Search by name or email
- `sort` (string): Sort field (default: createdAt)
- `order` (string): Sort order (asc/desc, default: desc)

**Response (200):**
```json
{
  "users": [
    {
      "id": "user_123",
      "email": "student@university.edu",
      "firstName": "John",
      "lastName": "Doe",
      "role": "student",
      "isActive": true,
      "lastLoginAt": "2023-01-01T00:00:00Z",
      "createdAt": "2023-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### GET /tenants/{tenantId}/users/{userId}
Get specific user details.

### PUT /tenants/{tenantId}/users/{userId}
Update user information (requires appropriate permissions).

### DELETE /tenants/{tenantId}/users/{userId}
Deactivate user account (requires admin role).

## Equipment Management

### GET /tenants/{tenantId}/equipment
Get equipment catalog with filtering and search.

**Query Parameters:**
- `page` (integer): Page number
- `limit` (integer): Results per page
- `category` (string): Filter by category ID
- `availability` (string): Filter by availability (available/unavailable)
- `condition` (string): Filter by condition (excellent/good/fair/poor)
- `search` (string): Search in name and description
- `tags` (array): Filter by tags
- `minPrice` (number): Minimum rental price
- `maxPrice` (number): Maximum rental price

**Response (200):**
```json
{
  "equipment": [
    {
      "id": "eq_123",
      "name": "Canon EOS R5",
      "description": "Professional mirrorless camera",
      "category": {
        "id": "cat_cameras",
        "name": "Cameras"
      },
      "condition": "excellent",
      "rentalPrice": 75.00,
      "replacementCost": 3899.99,
      "barcode": "CAM001",
      "serialNumber": "R5123456",
      "images": [
        {
          "id": "img_123",
          "url": "https://cdn.gear-pool.com/images/canon-r5.jpg",
          "alt": "Canon EOS R5 front view",
          "isPrimary": true
        }
      ],
      "specifications": {
        "sensor": "45MP Full Frame",
        "video": "8K Raw",
        "mount": "RF"
      },
      "availability": {
        "isAvailable": true,
        "nextAvailableDate": null,
        "totalQuantity": 3,
        "availableQuantity": 2
      },
      "dependencies": [
        {
          "id": "dep_123",
          "dependentEquipment": {
            "id": "eq_456",
            "name": "Canon LP-E6NH Battery"
          },
          "type": "required",
          "quantityRequired": 2
        }
      ],
      "tags": ["camera", "full-frame", "video"],
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 87,
    "totalPages": 5
  },
  "filters": {
    "categories": [
      {"id": "cat_cameras", "name": "Cameras", "count": 25},
      {"id": "cat_lenses", "name": "Lenses", "count": 35}
    ],
    "conditions": [
      {"value": "excellent", "count": 45},
      {"value": "good", "count": 30}
    ]
  }
}
```

### GET /tenants/{tenantId}/equipment/{equipmentId}
Get detailed equipment information.

### POST /tenants/{tenantId}/equipment
Create new equipment item (requires manager/admin role).

**Request Body:**
```json
{
  "name": "Canon EOS R5",
  "description": "Professional mirrorless camera with 8K video",
  "categoryId": "cat_cameras",
  "condition": "excellent",
  "rentalPrice": 75.00,
  "replacementCost": 3899.99,
  "barcode": "CAM001",
  "serialNumber": "R5123456",
  "specifications": {
    "sensor": "45MP Full Frame",
    "video": "8K Raw",
    "mount": "RF"
  },
  "tags": ["camera", "full-frame", "video"],
  "dependencies": [
    {
      "dependentEquipmentId": "eq_456",
      "type": "required",
      "quantityRequired": 2
    }
  ]
}
```

### PUT /tenants/{tenantId}/equipment/{equipmentId}
Update equipment information.

### DELETE /tenants/{tenantId}/equipment/{equipmentId}
Remove equipment from catalog.

### GET /tenants/{tenantId}/equipment/{equipmentId}/availability
Check equipment availability for specific date range.

**Query Parameters:**
- `startDate` (ISO date): Start date for availability check
- `endDate` (ISO date): End date for availability check
- `quantity` (integer): Required quantity (default: 1)

**Response (200):**
```json
{
  "isAvailable": true,
  "conflicts": [],
  "availableQuantity": 2,
  "nextAvailableDate": null,
  "dependencyStatus": [
    {
      "equipmentId": "eq_456",
      "name": "Canon LP-E6NH Battery",
      "required": 2,
      "available": 5,
      "isAvailable": true
    }
  ]
}
```

## Equipment Categories

### GET /tenants/{tenantId}/categories
Get all equipment categories.

### POST /tenants/{tenantId}/categories
Create new category (requires manager/admin role).

### PUT /tenants/{tenantId}/categories/{categoryId}
Update category information.

### DELETE /tenants/{tenantId}/categories/{categoryId}
Delete category (must be empty).

## Reservation System

### GET /tenants/{tenantId}/reservations
Get reservations with filtering options.

**Query Parameters:**
- `userId` (string): Filter by user ID
- `status` (string): Filter by status (pending/approved/rejected/active/completed/cancelled)
- `startDate` (ISO date): Filter reservations starting after this date
- `endDate` (ISO date): Filter reservations ending before this date
- `equipmentId` (string): Filter by equipment ID

**Response (200):**
```json
{
  "reservations": [
    {
      "id": "res_123",
      "user": {
        "id": "user_123",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@university.edu"
      },
      "status": "approved",
      "startDate": "2023-01-15T09:00:00Z",
      "endDate": "2023-01-17T17:00:00Z",
      "purpose": "Documentary film project",
      "notes": "Need for weekend shoot",
      "equipment": [
        {
          "id": "res_item_456",
          "equipment": {
            "id": "eq_123",
            "name": "Canon EOS R5",
            "barcode": "CAM001"
          },
          "quantity": 1,
          "condition": "excellent"
        }
      ],
      "approvalWorkflow": {
        "approvedBy": {
          "id": "user_456",
          "firstName": "Prof",
          "lastName": "Smith"
        },
        "approvedAt": "2023-01-10T14:30:00Z",
        "approvalNotes": "Approved for advanced students"
      },
      "checkout": {
        "checkedOutAt": "2023-01-15T09:15:00Z",
        "checkedOutBy": {
          "id": "user_789",
          "firstName": "Equipment",
          "lastName": "Manager"
        }
      },
      "createdAt": "2023-01-10T10:00:00Z",
      "updatedAt": "2023-01-15T09:15:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### GET /tenants/{tenantId}/reservations/{reservationId}
Get detailed reservation information.

### POST /tenants/{tenantId}/reservations
Create new reservation request.

**Request Body:**
```json
{
  "startDate": "2023-01-15T09:00:00Z",
  "endDate": "2023-01-17T17:00:00Z",
  "purpose": "Documentary film project",
  "notes": "Need camera and lenses for weekend documentary shoot",
  "equipment": [
    {
      "equipmentId": "eq_123",
      "quantity": 1
    },
    {
      "equipmentId": "eq_456",
      "quantity": 2
    }
  ]
}
```

**Response (201):**
```json
{
  "reservation": {
    "id": "res_123",
    "status": "pending",
    "startDate": "2023-01-15T09:00:00Z",
    "endDate": "2023-01-17T17:00:00Z",
    "equipment": [
      {
        "equipmentId": "eq_123",
        "name": "Canon EOS R5",
        "quantity": 1
      }
    ],
    "estimatedTotal": 150.00,
    "requiresApproval": true
  },
  "message": "Reservation request submitted successfully. Awaiting approval."
}
```

### PUT /tenants/{tenantId}/reservations/{reservationId}
Update reservation (limited fields based on status).

### DELETE /tenants/{tenantId}/reservations/{reservationId}
Cancel reservation request.

### POST /tenants/{tenantId}/reservations/{reservationId}/approve
Approve reservation request (requires faculty/manager/admin role).

**Request Body:**
```json
{
  "approvalNotes": "Approved for advanced film project",
  "modifications": {
    "startDate": "2023-01-15T10:00:00Z", // Optional
    "endDate": "2023-01-17T16:00:00Z"     // Optional
  }
}
```

### POST /tenants/{tenantId}/reservations/{reservationId}/reject
Reject reservation request.

**Request Body:**
```json
{
  "rejectionReason": "Equipment not suitable for beginner students",
  "alternativeSuggestions": "Consider using Canon T7i instead"
}
```

### POST /tenants/{tenantId}/reservations/{reservationId}/checkout
Check out equipment for reservation.

**Request Body:**
```json
{
  "equipmentConditions": [
    {
      "equipmentId": "eq_123",
      "condition": "excellent",
      "notes": "Minor dust on lens, cleaned before checkout"
    }
  ],
  "checkoutNotes": "All equipment verified and in good condition"
}
```

### POST /tenants/{tenantId}/reservations/{reservationId}/checkin
Check in returned equipment.

**Request Body:**
```json
{
  "equipmentConditions": [
    {
      "equipmentId": "eq_123",
      "condition": "good",
      "notes": "Small scratch on body, functionality unaffected"
    }
  ],
  "checkinNotes": "Equipment returned in good condition",
  "damageReport": {
    "hasDamage": false,
    "description": "",
    "responsibleParty": "",
    "repairCost": 0
  }
}
```

## Calendar and Availability

### GET /tenants/{tenantId}/calendar
Get calendar view of reservations and equipment availability.

**Query Parameters:**
- `startDate` (ISO date): Calendar start date
- `endDate` (ISO date): Calendar end date
- `equipmentIds` (array): Filter by specific equipment
- `view` (string): Calendar view (day/week/month)

**Response (200):**
```json
{
  "events": [
    {
      "id": "res_123",
      "title": "Canon EOS R5 - John Doe",
      "start": "2023-01-15T09:00:00Z",
      "end": "2023-01-17T17:00:00Z",
      "type": "reservation",
      "status": "approved",
      "equipment": ["Canon EOS R5"],
      "user": "John Doe"
    }
  ],
  "availability": {
    "eq_123": {
      "2023-01-15": { "available": 1, "total": 3 },
      "2023-01-16": { "available": 1, "total": 3 },
      "2023-01-17": { "available": 1, "total": 3 }
    }
  }
}
```

## Analytics and Reporting

### GET /tenants/{tenantId}/analytics/equipment-usage
Get equipment usage statistics.

**Query Parameters:**
- `startDate` (ISO date): Report start date
- `endDate` (ISO date): Report end date
- `equipmentId` (string): Specific equipment filter
- `groupBy` (string): Group by (day/week/month)

### GET /tenants/{tenantId}/analytics/user-activity
Get user activity statistics.

### GET /tenants/{tenantId}/analytics/revenue
Get revenue and financial statistics.

### GET /tenants/{tenantId}/analytics/utilization
Get equipment utilization rates.

## Notification System

### GET /tenants/{tenantId}/notifications
Get user notifications.

### PUT /tenants/{tenantId}/notifications/{notificationId}/read
Mark notification as read.

### POST /tenants/{tenantId}/notifications/preferences
Update notification preferences.

## File Upload

### POST /tenants/{tenantId}/equipment/{equipmentId}/images
Upload equipment images.

**Request:** `multipart/form-data`
- `images[]`: Image files (max 5MB each, PNG/JPG/WEBP)

**Response (201):**
```json
{
  "images": [
    {
      "id": "img_123",
      "url": "https://cdn.gear-pool.com/images/eq_123_1.jpg",
      "filename": "canon-r5-front.jpg",
      "size": 2048576,
      "mimeType": "image/jpeg"
    }
  ]
}
```

## Audit Logs

### GET /tenants/{tenantId}/audit-logs
Get system audit logs (requires admin role).

**Query Parameters:**
- `userId` (string): Filter by user
- `action` (string): Filter by action type
- `resource` (string): Filter by resource type
- `startDate` (ISO date): Filter by date range
- `endDate` (ISO date): Filter by date range

## Webhook Endpoints

### POST /webhooks/notifications
Receive webhook notifications from external services.

### POST /webhooks/payments
Handle payment notifications (future enhancement).

## Health and Status

### GET /health
System health check.

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2023-01-01T00:00:00Z",
  "version": "1.0.0",
  "environment": "production",
  "checks": {
    "database": "healthy",
    "redis": "healthy",
    "email": "healthy"
  }
}
```

### GET /metrics
System metrics (requires admin role).

## SDK and Integration

The API provides official SDKs for popular languages:

- **JavaScript/TypeScript**: `@gear-pool/sdk-js`
- **Python**: `gear-pool-sdk`
- **Mobile**: React Native and Flutter SDKs

### JavaScript SDK Example
```javascript
import { GearPoolClient } from '@gear-pool/sdk-js';

const client = new GearPoolClient({
  baseURL: 'https://api.gear-pool.com/api/v1',
  tenantId: 'film_department',
  token: 'your_jwt_token'
});

// Get equipment catalog
const equipment = await client.equipment.list({
  category: 'cameras',
  availability: 'available'
});

// Create reservation
const reservation = await client.reservations.create({
  equipmentIds: ['eq_123'],
  startDate: '2023-01-15T09:00:00Z',
  endDate: '2023-01-17T17:00:00Z',
  purpose: 'Film project'
});
```

## Versioning

The API uses semantic versioning with the version included in the URL path:
- Current version: `v1`
- Deprecated versions supported for 12 months
- Breaking changes result in new major version

## Support

For API support and questions:
- Documentation: [https://docs.gear-pool.com](https://docs.gear-pool.com)
- GitHub Issues: [Repository Issues](https://github.com/gear-pool/api/issues)
- Email: api-support@gear-pool.com 