# Equipment Rental System - Database Schema

## Overview

The Equipment Rental System uses a PostgreSQL database with a multi-tenant architecture that ensures complete data isolation between departments. The schema is designed for scalability, performance, and data integrity with comprehensive foreign key relationships and constraints.

## Architecture Principles

### Multi-Tenant Design
- **Tenant-per-row**: Each table includes a `tenant_id` to isolate data
- **Shared database, shared schema**: All tenants use the same tables with row-level security
- **Data isolation**: No cross-tenant data access through application logic and database constraints

### Security & Performance
- **Row-level security (RLS)**: PostgreSQL RLS policies enforce tenant isolation
- **Indexing strategy**: Composite indexes on tenant_id and frequently queried columns
- **Audit trails**: All tables include created_at, updated_at, and audit logging
- **Soft deletes**: Deleted records are marked as inactive rather than removed

## Core Tables

### Tenants (Departments)

```sql
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255), -- university domain
    contact_email VARCHAR(255) NOT NULL,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_domain ON tenants(domain);
```

**Example Data:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Film & Cinema Department",
  "slug": "film-department",
  "domain": "film.university.edu",
  "contact_email": "admin@film.university.edu",
  "settings": {
    "max_reservation_days": 7,
    "require_approval": true,
    "auto_checkin_hours": 24
  }
}
```

### Users

```sql
CREATE TYPE user_role AS ENUM ('student', 'faculty', 'manager', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    status user_status NOT NULL DEFAULT 'pending',
    student_id VARCHAR(50), -- University student ID
    phone VARCHAR(20),
    avatar_url TEXT,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE UNIQUE INDEX idx_users_email_tenant ON users(email, tenant_id);
CREATE INDEX idx_users_tenant_role ON users(tenant_id, role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_student_id_tenant ON users(student_id, tenant_id);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_tenant_isolation ON users
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

### Equipment Categories

```sql
CREATE TABLE equipment_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES equipment_categories(id),
    display_order INTEGER DEFAULT 0,
    icon VARCHAR(100), -- Icon name for UI
    color VARCHAR(7), -- Hex color code
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_categories_tenant ON equipment_categories(tenant_id);
CREATE INDEX idx_categories_parent ON equipment_categories(parent_id);
CREATE UNIQUE INDEX idx_categories_name_tenant ON equipment_categories(name, tenant_id) WHERE is_active = true;

-- RLS
ALTER TABLE equipment_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY categories_tenant_isolation ON equipment_categories
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

### Equipment Items

```sql
CREATE TYPE equipment_condition AS ENUM ('excellent', 'good', 'fair', 'poor', 'retired');
CREATE TYPE equipment_status AS ENUM ('available', 'checked_out', 'maintenance', 'retired', 'lost');

CREATE TABLE equipment_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES equipment_categories(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    model VARCHAR(255),
    manufacturer VARCHAR(255),
    serial_number VARCHAR(255),
    barcode VARCHAR(255),
    qr_code VARCHAR(255),
    condition equipment_condition NOT NULL DEFAULT 'good',
    status equipment_status NOT NULL DEFAULT 'available',
    purchase_date DATE,
    purchase_price DECIMAL(10,2),
    replacement_cost DECIMAL(10,2),
    rental_price_daily DECIMAL(8,2),
    rental_price_weekly DECIMAL(8,2),
    specifications JSONB DEFAULT '{}',
    notes TEXT,
    location VARCHAR(255), -- Storage location
    tags TEXT[], -- Array of tags for search
    images JSONB DEFAULT '[]', -- Array of image objects
    manual_url TEXT, -- Link to equipment manual
    warranty_expiry DATE,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    total_rentals INTEGER DEFAULT 0,
    total_rental_days INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_equipment_tenant ON equipment_items(tenant_id);
CREATE INDEX idx_equipment_category ON equipment_items(category_id);
CREATE INDEX idx_equipment_status ON equipment_items(status);
CREATE INDEX idx_equipment_condition ON equipment_items(condition);
CREATE UNIQUE INDEX idx_equipment_barcode_tenant ON equipment_items(barcode, tenant_id) WHERE barcode IS NOT NULL;
CREATE UNIQUE INDEX idx_equipment_serial_tenant ON equipment_items(serial_number, tenant_id) WHERE serial_number IS NOT NULL;
CREATE INDEX idx_equipment_tags ON equipment_items USING GIN(tags);
CREATE INDEX idx_equipment_specs ON equipment_items USING GIN(specifications);

-- Full-text search
CREATE INDEX idx_equipment_search ON equipment_items USING GIN(
    to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(model, ''))
);

-- RLS
ALTER TABLE equipment_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY equipment_tenant_isolation ON equipment_items
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

**Example Equipment JSON Fields:**
```json
{
  "specifications": {
    "sensor": "45MP Full Frame CMOS",
    "video": "8K Raw up to 30p",
    "mount": "Canon RF",
    "weight": "650g",
    "dimensions": "138.5 x 97.5 x 88.0mm",
    "battery": "LP-E6NH",
    "storage": "CFexpress Type B + SD"
  },
  "images": [
    {
      "id": "img_123",
      "url": "https://cdn.gear-pool.com/equipment/canon-r5-front.jpg",
      "alt": "Canon EOS R5 front view",
      "is_primary": true,
      "uploaded_at": "2023-01-01T00:00:00Z"
    }
  ]
}
```

### Equipment Dependencies

```sql
CREATE TYPE dependency_type AS ENUM ('required', 'optional', 'recommended');

CREATE TABLE equipment_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    parent_equipment_id UUID NOT NULL REFERENCES equipment_items(id) ON DELETE CASCADE,
    dependent_equipment_id UUID NOT NULL REFERENCES equipment_items(id) ON DELETE CASCADE,
    dependency_type dependency_type NOT NULL DEFAULT 'required',
    quantity_required INTEGER DEFAULT 1,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_dependencies_parent ON equipment_dependencies(parent_equipment_id);
CREATE INDEX idx_dependencies_dependent ON equipment_dependencies(dependent_equipment_id);
CREATE UNIQUE INDEX idx_dependencies_unique ON equipment_dependencies(parent_equipment_id, dependent_equipment_id) WHERE is_active = true;

-- Prevent self-referencing dependencies
ALTER TABLE equipment_dependencies ADD CONSTRAINT check_no_self_dependency 
    CHECK (parent_equipment_id != dependent_equipment_id);

-- RLS
ALTER TABLE equipment_dependencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY dependencies_tenant_isolation ON equipment_dependencies
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

### Reservations

```sql
CREATE TYPE reservation_status AS ENUM ('pending', 'approved', 'rejected', 'active', 'completed', 'cancelled', 'overdue');

CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status reservation_status NOT NULL DEFAULT 'pending',
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    purpose TEXT NOT NULL,
    notes TEXT,
    total_cost DECIMAL(10,2),
    
    -- Approval workflow
    requires_approval BOOLEAN DEFAULT true,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    approval_notes TEXT,
    rejected_by UUID REFERENCES users(id),
    rejected_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    -- Check-in/out tracking
    checked_out_at TIMESTAMP WITH TIME ZONE,
    checked_out_by UUID REFERENCES users(id),
    checkout_notes TEXT,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    checked_in_by UUID REFERENCES users(id),
    checkin_notes TEXT,
    
    -- Damage tracking
    damage_reported BOOLEAN DEFAULT false,
    damage_cost DECIMAL(10,2),
    damage_description TEXT,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_reservations_tenant ON reservations(tenant_id);
CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_dates ON reservations(start_date, end_date);
CREATE INDEX idx_reservations_approved_by ON reservations(approved_by);

-- Constraint: end_date must be after start_date
ALTER TABLE reservations ADD CONSTRAINT check_valid_date_range 
    CHECK (end_date > start_date);

-- RLS
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY reservations_tenant_isolation ON reservations
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

### Reservation Items (Many-to-Many)

```sql
CREATE TABLE reservation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    equipment_id UUID NOT NULL REFERENCES equipment_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    daily_rate DECIMAL(8,2), -- Rate at time of reservation
    total_cost DECIMAL(10,2),
    
    -- Condition tracking
    checkout_condition equipment_condition,
    checkin_condition equipment_condition,
    condition_notes TEXT,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_reservation_items_reservation ON reservation_items(reservation_id);
CREATE INDEX idx_reservation_items_equipment ON reservation_items(equipment_id);
CREATE UNIQUE INDEX idx_reservation_items_unique ON reservation_items(reservation_id, equipment_id) WHERE is_active = true;

-- Constraint: quantity must be positive
ALTER TABLE reservation_items ADD CONSTRAINT check_positive_quantity 
    CHECK (quantity > 0);

-- RLS
ALTER TABLE reservation_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY reservation_items_tenant_isolation ON reservation_items
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

## Supporting Tables

### Notifications

```sql
CREATE TYPE notification_type AS ENUM ('reservation_request', 'reservation_approved', 'reservation_rejected', 'equipment_due', 'equipment_overdue', 'system_alert');
CREATE TYPE notification_channel AS ENUM ('email', 'sms', 'push', 'in_app');

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    channel notification_channel NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}', -- Additional notification data
    is_read BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_type ON notifications(type);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notifications_tenant_isolation ON notifications
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

### Audit Logs

```sql
CREATE TYPE audit_action AS ENUM ('create', 'update', 'delete', 'login', 'logout', 'checkout', 'checkin', 'approve', 'reject');

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action audit_action NOT NULL,
    resource_type VARCHAR(100) NOT NULL, -- e.g., 'equipment', 'reservation'
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_logs_tenant_isolation ON audit_logs
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

### Sessions (JWT Blacklist)

```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_jti VARCHAR(255) NOT NULL UNIQUE, -- JWT ID
    refresh_token_hash VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_jti ON sessions(token_jti);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Cleanup expired sessions
CREATE INDEX idx_sessions_cleanup ON sessions(expires_at) WHERE is_revoked = false;
```

### Email Templates

```sql
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    html_body TEXT NOT NULL,
    text_body TEXT,
    variables JSONB DEFAULT '[]', -- Available template variables
    is_system BOOLEAN DEFAULT false, -- System templates vs tenant-specific
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System templates apply to all tenants, tenant templates override system ones
CREATE UNIQUE INDEX idx_email_templates_name_tenant ON email_templates(name, tenant_id) WHERE tenant_id IS NOT NULL;
CREATE UNIQUE INDEX idx_email_templates_name_system ON email_templates(name) WHERE is_system = true;
```

## Views and Functions

### Equipment Availability View

```sql
CREATE VIEW equipment_availability AS
SELECT 
    e.id,
    e.tenant_id,
    e.name,
    e.status,
    COUNT(ri.equipment_id) as total_reservations,
    COUNT(CASE WHEN r.status IN ('approved', 'active') 
               AND r.start_date <= CURRENT_TIMESTAMP 
               AND r.end_date >= CURRENT_TIMESTAMP 
          THEN 1 END) as current_reservations,
    CASE 
        WHEN e.status = 'available' AND 
             COUNT(CASE WHEN r.status IN ('approved', 'active') 
                        AND r.start_date <= CURRENT_TIMESTAMP 
                        AND r.end_date >= CURRENT_TIMESTAMP 
                   THEN 1 END) = 0 
        THEN true 
        ELSE false 
    END as is_available
FROM equipment_items e
LEFT JOIN reservation_items ri ON e.id = ri.equipment_id
LEFT JOIN reservations r ON ri.reservation_id = r.id
WHERE e.is_active = true
GROUP BY e.id, e.tenant_id, e.name, e.status;
```

### Conflict Detection Function

```sql
CREATE OR REPLACE FUNCTION check_equipment_conflicts(
    p_tenant_id UUID,
    p_equipment_id UUID,
    p_start_date TIMESTAMP WITH TIME ZONE,
    p_end_date TIMESTAMP WITH TIME ZONE,
    p_exclude_reservation_id UUID DEFAULT NULL
) RETURNS TABLE(
    conflict_reservation_id UUID,
    conflict_start_date TIMESTAMP WITH TIME ZONE,
    conflict_end_date TIMESTAMP WITH TIME ZONE,
    conflict_user_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.start_date,
        r.end_date,
        u.first_name || ' ' || u.last_name
    FROM reservations r
    JOIN reservation_items ri ON r.id = ri.reservation_id
    JOIN users u ON r.user_id = u.id
    WHERE r.tenant_id = p_tenant_id
      AND ri.equipment_id = p_equipment_id
      AND r.status IN ('approved', 'active')
      AND r.id != COALESCE(p_exclude_reservation_id, '00000000-0000-0000-0000-000000000000'::UUID)
      AND (
          (p_start_date >= r.start_date AND p_start_date < r.end_date) OR
          (p_end_date > r.start_date AND p_end_date <= r.end_date) OR
          (p_start_date <= r.start_date AND p_end_date >= r.end_date)
      );
END;
$$ LANGUAGE plpgsql;
```

## Triggers and Constraints

### Update Timestamp Trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_items_updated_at BEFORE UPDATE ON equipment_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Audit Log Trigger

```sql
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (tenant_id, user_id, action, resource_type, resource_id, new_values)
        VALUES (
            NEW.tenant_id,
            current_setting('app.current_user_id', true)::UUID,
            'create',
            TG_TABLE_NAME,
            NEW.id,
            row_to_json(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (tenant_id, user_id, action, resource_type, resource_id, old_values, new_values)
        VALUES (
            NEW.tenant_id,
            current_setting('app.current_user_id', true)::UUID,
            'update',
            TG_TABLE_NAME,
            NEW.id,
            row_to_json(OLD),
            row_to_json(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (tenant_id, user_id, action, resource_type, resource_id, old_values)
        VALUES (
            OLD.tenant_id,
            current_setting('app.current_user_id', true)::UUID,
            'delete',
            TG_TABLE_NAME,
            OLD.id,
            row_to_json(OLD)
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to key tables
CREATE TRIGGER audit_equipment_items AFTER INSERT OR UPDATE OR DELETE ON equipment_items
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_reservations AFTER INSERT OR UPDATE OR DELETE ON reservations
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

## Performance Optimization

### Partitioning Strategy

```sql
-- Partition audit_logs by month for better performance
CREATE TABLE audit_logs_template (LIKE audit_logs INCLUDING ALL);

-- Create monthly partitions
CREATE TABLE audit_logs_y2024m01 PARTITION OF audit_logs_template
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

### Key Indexes for Performance

```sql
-- Composite indexes for common queries
CREATE INDEX idx_reservations_user_status_dates ON reservations(user_id, status, start_date, end_date);
CREATE INDEX idx_equipment_tenant_category_status ON equipment_items(tenant_id, category_id, status);
CREATE INDEX idx_reservation_items_equipment_dates ON reservation_items(equipment_id) 
    INCLUDE (reservation_id) WHERE is_active = true;

-- Covering indexes for SELECT queries
CREATE INDEX idx_users_tenant_active_covering ON users(tenant_id, is_active) 
    INCLUDE (first_name, last_name, email, role);
```

### Database Configuration

```sql
-- Recommended PostgreSQL settings for equipment rental workload
-- In postgresql.conf:

-- Memory settings
shared_buffers = '256MB'
work_mem = '4MB'
maintenance_work_mem = '64MB'

-- Connection settings
max_connections = 200
max_prepared_transactions = 100

-- Write-ahead logging
wal_buffers = '16MB'
checkpoint_completion_target = 0.9

-- Query planner
random_page_cost = 1.1
effective_cache_size = '1GB'
```

## Data Migration Scripts

### Initial Seed Data

```sql
-- Insert default tenant
INSERT INTO tenants (name, slug, contact_email, settings) VALUES 
('Film Department', 'film-dept', 'admin@film.university.edu', 
 '{"max_reservation_days": 7, "require_approval": true}');

-- Insert default categories
INSERT INTO equipment_categories (tenant_id, name, description, icon) VALUES 
((SELECT id FROM tenants WHERE slug = 'film-dept'), 'Cameras', 'Digital cameras and accessories', 'camera'),
((SELECT id FROM tenants WHERE slug = 'film-dept'), 'Lenses', 'Camera lenses and filters', 'lens'),
((SELECT id FROM tenants WHERE slug = 'film-dept'), 'Audio', 'Microphones and audio equipment', 'mic'),
((SELECT id FROM tenants WHERE slug = 'film-dept'), 'Lighting', 'Lighting equipment and accessories', 'lightbulb'),
((SELECT id FROM tenants WHERE slug = 'film-dept'), 'Support', 'Tripods, rigs, and support equipment', 'tripod');

-- Insert admin user
INSERT INTO users (tenant_id, email, password_hash, first_name, last_name, role, status, email_verified_at) VALUES 
((SELECT id FROM tenants WHERE slug = 'film-dept'), 
 'admin@film.university.edu', 
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj7y6dYm8l6O', -- 'password123'
 'System', 'Administrator', 'admin', 'active', CURRENT_TIMESTAMP);
```

## Backup and Recovery

### Backup Strategy

```sql
-- Daily full backup
pg_dump --verbose --no-acl --no-owner --format=custom gear_pool_db > gear_pool_$(date +%Y%m%d).dump

-- Continuous WAL archiving for point-in-time recovery
archive_mode = on
archive_command = 'cp %p /backup/wal_archive/%f'
```

### Recovery Procedures

```sql
-- Point-in-time recovery
pg_basebackup -D /var/lib/postgresql/recovery -Ft -z -P
-- Restore to specific timestamp
recovery_target_time = '2024-01-15 14:30:00'
```

This database schema provides a robust foundation for the Equipment Rental System with proper multi-tenancy, security, performance optimization, and audit capabilities. The design supports all the features outlined in the project requirements while maintaining scalability and data integrity. 