# Equipment Rental System - Deployment Guide

## Overview

This guide covers the complete deployment process for the Equipment Rental System, from local development setup to production deployment using Docker containers. The system is designed for easy deployment with single-command setup and automated scaling.

## Prerequisites

### System Requirements

**Minimum Requirements:**
- CPU: 2 cores
- RAM: 4GB
- Storage: 20GB SSD
- Network: 1Gbps connection

**Recommended Production Requirements:**
- CPU: 4+ cores
- RAM: 8GB+
- Storage: 100GB+ SSD
- Network: 10Gbps connection
- Load balancer support

### Software Dependencies

**Required Software:**
- Docker 24.0+
- Docker Compose 2.20+
- Git 2.30+
- Node.js 18+ (for local development)

**Optional but Recommended:**
- nginx (for reverse proxy)
- Certbot (for SSL certificates)
- Monitoring tools (Prometheus, Grafana)

## Environment Configuration

### Environment Variables

Create environment files for different deployment stages:

**`.env.development`**
```env
# Application
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
API_BASE_URL=http://localhost:3000/api/v1

# Database
DATABASE_URL=postgresql://gear_pool_user:dev_password@localhost:5432/gear_pool_dev
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=development_secret_key_change_in_production
JWT_REFRESH_SECRET=development_refresh_secret_change_in_production
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@gear-pool.dev

# File Upload
UPLOAD_MAX_SIZE=5MB
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/webp
STORAGE_PROVIDER=local
STORAGE_PATH=./uploads

# Security
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW=3600000
RATE_LIMIT_MAX=100

# Monitoring
LOG_LEVEL=debug
ENABLE_REQUEST_LOGGING=true
```

**`.env.production`**
```env
# Application
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://gear-pool.com
API_BASE_URL=https://api.gear-pool.com/api/v1

# Database
DATABASE_URL=postgresql://gear_pool_user:${DB_PASSWORD}@postgres:5432/gear_pool_prod
REDIS_URL=redis://redis:6379

# Authentication
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=${SENDGRID_API_KEY}
SMTP_FROM=noreply@gear-pool.com

# File Upload
UPLOAD_MAX_SIZE=5MB
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/webp
STORAGE_PROVIDER=s3
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
AWS_BUCKET_NAME=${AWS_BUCKET_NAME}
AWS_REGION=${AWS_REGION}

# Security
CORS_ORIGIN=https://gear-pool.com
RATE_LIMIT_WINDOW=3600000
RATE_LIMIT_MAX=1000

# Monitoring
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=false
SENTRY_DSN=${SENTRY_DSN}

# Backup
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=30
```

## Local Development Setup

### Quick Start

1. **Clone the repository:**
```bash
git clone https://github.com/your-org/gear-pool.git
cd gear-pool
```

2. **Install dependencies:**
```bash
# Frontend dependencies
npm install

# Backend dependencies (when available)
cd backend && npm install
```

3. **Start development services:**
```bash
# Start database and Redis
docker-compose -f docker-compose.dev.yml up -d postgres redis

# Start frontend development server
npm run dev

# Start backend development server (in separate terminal)
cd backend && npm run dev
```

4. **Initialize database:**
```bash
# Run database migrations
cd backend && npm run db:migrate

# Seed initial data
npm run db:seed
```

5. **Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api/v1
- API Documentation: http://localhost:3000/docs

### Development Docker Compose

**`docker-compose.dev.yml`**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: gear-pool-postgres-dev
    environment:
      POSTGRES_DB: gear_pool_dev
      POSTGRES_USER: gear_pool_user
      POSTGRES_PASSWORD: dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - gear-pool-dev

  redis:
    image: redis:7-alpine
    container_name: gear-pool-redis-dev
    ports:
      - "6379:6379"
    volumes:
      - redis_dev_data:/data
    networks:
      - gear-pool-dev

  mailhog:
    image: mailhog/mailhog
    container_name: gear-pool-mailhog-dev
    ports:
      - "1025:1025"  # SMTP
      - "8025:8025"  # Web UI
    networks:
      - gear-pool-dev

volumes:
  postgres_dev_data:
  redis_dev_data:

networks:
  gear-pool-dev:
    driver: bridge
```

## Production Deployment

### Docker Production Setup

**`docker-compose.prod.yml`**
```yaml
version: '3.8'

services:
  # Frontend
  frontend:
    build:
      context: .
      dockerfile: docker/Dockerfile.frontend
    container_name: gear-pool-frontend
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/ssl/private:ro
      - frontend_assets:/usr/share/nginx/html
    depends_on:
      - backend
    networks:
      - gear-pool-prod

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: ../docker/Dockerfile.backend
    container_name: gear-pool-backend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    ports:
      - "3000:3000"
    volumes:
      - backend_uploads:/app/uploads
      - backend_logs:/app/logs
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - gear-pool-prod
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Database
  postgres:
    image: postgres:15-alpine
    container_name: gear-pool-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: gear_pool_prod
      POSTGRES_USER: gear_pool_user
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - postgres_backups:/backups
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - gear-pool-prod
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U gear_pool_user -d gear_pool_prod"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: gear-pool-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - gear-pool-prod
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

  # Background Jobs (Optional)
  worker:
    build:
      context: ./backend
      dockerfile: ../docker/Dockerfile.backend
    container_name: gear-pool-worker
    restart: unless-stopped
    command: npm run worker
    environment:
      - NODE_ENV=production
      - WORKER_MODE=true
    env_file:
      - .env.production
    depends_on:
      - postgres
      - redis
    networks:
      - gear-pool-prod

  # Backup Service
  backup:
    build:
      context: ./docker
      dockerfile: Dockerfile.backup
    container_name: gear-pool-backup
    restart: unless-stopped
    environment:
      - POSTGRES_DB=gear_pool_prod
      - POSTGRES_USER=gear_pool_user
      - POSTGRES_PASSWORD_FILE=/run/secrets/db_password
    secrets:
      - db_password
    volumes:
      - postgres_backups:/backups
      - ./scripts/backup.sh:/usr/local/bin/backup.sh:ro
    depends_on:
      - postgres
    networks:
      - gear-pool-prod
    command: crond -f

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  postgres_backups:
    driver: local
  backend_uploads:
    driver: local
  backend_logs:
    driver: local
  frontend_assets:
    driver: local

networks:
  gear-pool-prod:
    driver: bridge

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

### Docker Images

**`docker/Dockerfile.frontend`**
```dockerfile
# Multi-stage build for React frontend
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production nginx image
FROM nginx:1.25-alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
```

**`docker/Dockerfile.backend`**
```dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    curl \
    postgresql-client \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

EXPOSE 3000

CMD ["npm", "start"]
```

### Nginx Configuration

**`docker/nginx.conf`**
```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log notice;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 5M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private must-revalidate;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    # Upstream backend
    upstream backend {
        server gear-pool-backend:3000;
    }

    # HTTPS redirect
    server {
        listen 80;
        server_name gear-pool.com www.gear-pool.com;
        return 301 https://$server_name$request_uri;
    }

    # Main server block
    server {
        listen 443 ssl http2;
        server_name gear-pool.com www.gear-pool.com;
        root /usr/share/nginx/html;
        index index.html;

        # SSL configuration
        ssl_certificate /etc/ssl/private/gear-pool.com.crt;
        ssl_certificate_key /etc/ssl/private/gear-pool.com.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # API proxy
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 300s;
            proxy_connect_timeout 75s;
        }

        # Auth endpoints with stricter rate limiting
        location /api/auth/login {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static files with caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Frontend routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

## Deployment Commands

### Single Command Deployment

```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# Development deployment
docker-compose -f docker-compose.dev.yml up -d
```

### Step-by-Step Deployment

1. **Prepare environment:**
```bash
# Create secrets directory
mkdir -p secrets

# Generate secure passwords
openssl rand -base64 32 > secrets/db_password.txt
openssl rand -base64 32 > secrets/jwt_secret.txt
openssl rand -base64 32 > secrets/jwt_refresh_secret.txt

# Set proper permissions
chmod 600 secrets/*
```

2. **Build images:**
```bash
# Build all images
docker-compose -f docker-compose.prod.yml build

# Build specific service
docker-compose -f docker-compose.prod.yml build backend
```

3. **Start infrastructure services:**
```bash
# Start database and Redis first
docker-compose -f docker-compose.prod.yml up -d postgres redis

# Wait for services to be healthy
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U gear_pool_user
```

4. **Run database migrations:**
```bash
# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npm run db:migrate

# Seed initial data
docker-compose -f docker-compose.prod.yml exec backend npm run db:seed
```

5. **Start application services:**
```bash
# Start backend
docker-compose -f docker-compose.prod.yml up -d backend worker

# Start frontend
docker-compose -f docker-compose.prod.yml up -d frontend
```

6. **Verify deployment:**
```bash
# Check all services
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Test health endpoints
curl https://gear-pool.com/health
curl https://gear-pool.com/api/health
```

## SSL Certificate Setup

### Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d gear-pool.com -d www.gear-pool.com

# Auto-renewal setup
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Manual SSL Setup

```bash
# Generate certificate (for testing)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/gear-pool.com.key \
  -out ssl/gear-pool.com.crt \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=gear-pool.com"
```

## Monitoring and Logging

### Log Management

```bash
# View application logs
docker-compose -f docker-compose.prod.yml logs -f backend

# View nginx logs
docker-compose -f docker-compose.prod.yml logs -f frontend

# View database logs
docker-compose -f docker-compose.prod.yml logs -f postgres
```

### Health Monitoring

```bash
# Check service health
docker-compose -f docker-compose.prod.yml exec backend curl -f http://localhost:3000/health

# Monitor resource usage
docker stats
```

### Prometheus Monitoring (Optional)

**`docker-compose.monitoring.yml`**
```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: gear-pool-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    networks:
      - gear-pool-prod

  grafana:
    image: grafana/grafana:latest
    container_name: gear-pool-grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
    networks:
      - gear-pool-prod

volumes:
  prometheus_data:
  grafana_data:

networks:
  gear-pool-prod:
    external: true
```

## Backup and Recovery

### Automated Backup Script

**`scripts/backup.sh`**
```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/backups"
DB_NAME="gear_pool_prod"
DB_USER="gear_pool_user"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
echo "Starting database backup..."
pg_dump -h postgres -U $DB_USER -d $DB_NAME --no-password > "$BACKUP_DIR/db_backup_$DATE.sql"

# Compress backup
gzip "$BACKUP_DIR/db_backup_$DATE.sql"

# Upload backup (optional)
if [ ! -z "$AWS_BUCKET" ]; then
    aws s3 cp "$BACKUP_DIR/db_backup_$DATE.sql.gz" "s3://$AWS_BUCKET/backups/"
fi

# Clean old backups
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: db_backup_$DATE.sql.gz"
```

### Recovery Procedures

```bash
# Restore from backup
docker-compose -f docker-compose.prod.yml exec postgres psql -U gear_pool_user -d gear_pool_prod < backup_file.sql

# Point-in-time recovery
docker-compose -f docker-compose.prod.yml stop backend
docker-compose -f docker-compose.prod.yml exec postgres pg_basebackup -D /var/lib/postgresql/recovery
```

## Scaling and Load Balancing

### Horizontal Scaling

```yaml
# Scale backend services
version: '3.8'
services:
  backend:
    # ... existing configuration
    deploy:
      replicas: 3
      restart_policy:
        condition: on-failure
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

  # Load balancer
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/load-balancer.conf:/etc/nginx/nginx.conf
```

### Database Scaling

```yaml
# Read replicas
services:
  postgres-primary:
    image: postgres:15-alpine
    environment:
      POSTGRES_REPLICATION_MODE: master
      POSTGRES_REPLICATION_USER: replicator
      POSTGRES_REPLICATION_PASSWORD: replica_password

  postgres-replica:
    image: postgres:15-alpine
    environment:
      POSTGRES_REPLICATION_MODE: slave
      POSTGRES_REPLICATION_USER: replicator
      POSTGRES_REPLICATION_PASSWORD: replica_password
      POSTGRES_MASTER_HOST: postgres-primary
```

## Troubleshooting

### Common Issues

**1. Database Connection Issues:**
```bash
# Check database status
docker-compose -f docker-compose.prod.yml exec postgres pg_isready

# Check connectivity
docker-compose -f docker-compose.prod.yml exec backend nc -zv postgres 5432
```

**2. Memory Issues:**
```bash
# Check memory usage
docker stats --no-stream

# Increase memory limits in docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
```

**3. SSL Certificate Issues:**
```bash
# Check certificate expiry
openssl x509 -in ssl/gear-pool.com.crt -text -noout | grep "Not After"

# Renew Let's Encrypt certificate
sudo certbot renew
```

### Performance Optimization

```bash
# Enable nginx caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Database optimization
# In postgresql.conf:
shared_buffers = 256MB
max_connections = 200
work_mem = 4MB
```

## Security Checklist

- [ ] Environment variables secured
- [ ] Database passwords rotated
- [ ] SSL certificates configured
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] File upload restrictions in place
- [ ] Database backups encrypted
- [ ] Log files secured
- [ ] Network access restricted
- [ ] Security updates applied

## Maintenance

### Regular Maintenance Tasks

```bash
# Weekly tasks
docker system prune -f
docker volume prune -f

# Monthly tasks
sudo apt update && sudo apt upgrade
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d --force-recreate

# Database maintenance
docker-compose -f docker-compose.prod.yml exec postgres vacuumdb -U gear_pool_user -d gear_pool_prod --analyze
```

This deployment guide provides comprehensive instructions for deploying the Equipment Rental System in various environments with proper security, monitoring, and maintenance procedures. 