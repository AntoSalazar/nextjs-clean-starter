# Deployment Guide

This guide covers deploying the application to production using Docker and Coolify.

## Prerequisites

- Docker & Docker Compose
- A server with at least 1GB RAM
- Domain name (optional, for HTTPS)
- PostgreSQL database (or use the bundled one)

## Quick Deployment with Docker Compose

### 1. Prepare Environment

```bash
# Copy and edit environment variables
cp .env.example .env.production

# Edit with production values
nano .env.production
```

Required production environment variables:

```env
NODE_ENV=production

# Strong random secret (generate with: openssl rand -base64 32)
JWT_SECRET=your-production-secret-here

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=strong-random-password
POSTGRES_DB=starter_kit
DATABASE_URL=postgresql://postgres:strong-random-password@postgres:5432/starter_kit

# Admin user
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=secure-admin-password
ADMIN_NAME=Admin

# Optional: Email
RESEND_API_KEY=re_xxxxx
EMAIL_FROM="App Name <noreply@yourdomain.com>"
```

### 2. Build and Deploy

```bash
# Build the production image
docker compose -f docker-compose.prod.yml build

# Start in detached mode
docker compose -f docker-compose.prod.yml up -d

# Check logs
docker compose -f docker-compose.prod.yml logs -f app
```

### 3. Verify Deployment

```bash
# Health check
curl http://localhost:3000/api/health

# Should return: {"status":"healthy","database":"connected",...}
```

## Coolify Deployment

[Coolify](https://coolify.io/) is a self-hosted Heroku/Netlify alternative.

### 1. Connect Repository

1. In Coolify dashboard, click "New Resource"
2. Select "Git Repository"
3. Connect your GitHub/GitLab account
4. Select this repository

### 2. Configure Build

Set the following in Coolify:

- **Build Pack**: Docker Compose
- **Docker Compose File**: `docker-compose.prod.yml`
- **Domain**: Your domain name

### 3. Set Environment Variables

Add all production environment variables in Coolify's UI.

### 4. Deploy

Click "Deploy" and Coolify will:
1. Build the Docker image
2. Start containers
3. Run migrations automatically
4. Seed the admin user

### 5. Enable HTTPS

Coolify automatically provisions Let's Encrypt certificates when you configure a domain.

## Manual Server Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin
```

### 2. Clone and Configure

```bash
# Clone repository
git clone https://github.com/your-repo/starter-kit.git
cd starter-kit

# Set up environment
cp .env.example .env.production
nano .env.production  # Edit with production values
```

### 3. Deploy

```bash
# Start services
docker compose -f docker-compose.prod.yml --env-file .env.production up -d

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

### 4. Reverse Proxy (Nginx)

If not using Coolify, set up Nginx:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. SSL with Certbot

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com
```

## Database Backup

### Automated Backups

Add to crontab:

```bash
# Backup every day at 2am
0 2 * * * docker exec starter-kit-postgres pg_dump -U postgres starter_kit > /backups/backup-$(date +%Y%m%d).sql
```

### Manual Backup

```bash
# Create backup
docker exec starter-kit-postgres pg_dump -U postgres starter_kit > backup.sql

# Restore backup
docker exec -i starter-kit-postgres psql -U postgres starter_kit < backup.sql
```

## Monitoring

### Health Check Endpoint

Monitor `/api/health` for:
- Database connectivity
- Application status

### Docker Stats

```bash
# View resource usage
docker stats
```

### Logs

```bash
# All logs
docker compose -f docker-compose.prod.yml logs -f

# App logs only
docker compose -f docker-compose.prod.yml logs -f app

# Last 100 lines
docker compose -f docker-compose.prod.yml logs --tail=100 app
```

## Updates

### Rolling Update

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build

# Migrations run automatically on startup
```

### Zero-Downtime Update (with Coolify)

Coolify handles rolling deployments automatically.

## Troubleshooting

### Database Connection Failed

```bash
# Check if postgres is running
docker compose -f docker-compose.prod.yml ps

# View postgres logs
docker compose -f docker-compose.prod.yml logs postgres

# Test connection
docker exec starter-kit-postgres pg_isready
```

### Migrations Failed

```bash
# Run migrations manually
docker compose -f docker-compose.prod.yml exec app bunx prisma migrate deploy
```

### Reset Everything

```bash
# Stop and remove all containers and volumes
docker compose -f docker-compose.prod.yml down -v

# Start fresh
docker compose -f docker-compose.prod.yml up -d
```

## Security Checklist

- [ ] Strong `JWT_SECRET` (32+ characters)
- [ ] Strong database password
- [ ] Strong admin password
- [ ] HTTPS enabled
- [ ] Firewall configured (only 80/443 exposed)
- [ ] Regular backups configured
- [ ] Log monitoring set up
