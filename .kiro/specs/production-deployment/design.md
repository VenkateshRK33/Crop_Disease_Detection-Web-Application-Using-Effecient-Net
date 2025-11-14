# Production Deployment Design Document

## Overview

This design document outlines the architecture and implementation strategy for deploying the Plant Disease Detection application (KrishiRaksha) to a production hosting environment. The system consists of three core services: a React frontend, a Node.js backend API, and a Python ML service, along with supporting infrastructure including MongoDB database, Ollama LLM service, and Nginx reverse proxy.

The deployment architecture prioritizes high availability, security, automated recovery, and operational monitoring while maintaining cost-effectiveness for agricultural technology deployment.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Internet                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTPS (443)
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   Nginx Reverse Proxy                        │
│  - SSL Termination                                           │
│  - Static File Serving                                       │
│  - Request Routing                                           │
│  - Load Balancing                                            │
└─────┬──────────────┬──────────────────┬─────────────────────┘
      │              │                  │
      │ /api/*       │ /                │ /uploads/*
      │              │                  │
┌─────▼──────┐  ┌───▼──────────┐  ┌────▼────────┐
│  Backend   │  │   Frontend   │  │   Static    │
│  API       │  │   (React)    │  │   Files     │
│  (Node.js) │  │   Build      │  │             │
│  Port 4000 │  │              │  │             │
└─────┬──────┘  └──────────────┘  └─────────────┘
      │
      ├──────────┬──────────┬──────────┐
      │          │          │          │
┌─────▼──────┐ ┌▼────────┐ ┌▼────────┐ ┌▼────────┐
│  MongoDB   │ │ ML API  │ │ Ollama  │ │ File    │
│  Database  │ │ (Python)│ │ Service │ │ Storage │
│  Port 27017│ │ Port    │ │ Port    │ │         │
│            │ │ 5000    │ │ 11434   │ │         │
└────────────┘ └─────────┘ └─────────┘ └─────────┘
```

### Process Management

All Node.js and Python services are managed by PM2 (Process Manager 2) which provides:
- Automatic service restart on crashes
- Cluster mode for Node.js backend (multi-core utilization)
- Log management and rotation
- Resource monitoring
- Zero-downtime deployments

### Service Communication

- **Frontend → Backend**: HTTPS requests through Nginx proxy
- **Backend → ML Service**: HTTP REST API calls (internal network)
- **Backend → Ollama**: HTTP API calls (internal network)
- **Backend → MongoDB**: MongoDB wire protocol (internal network)
- **All Services → File System**: Shared uploads directory

## Components and Interfaces

### 1. Nginx Reverse Proxy

**Purpose**: Entry point for all HTTP/HTTPS traffic, SSL termination, static file serving, and request routing.

**Configuration**:
- Listen on ports 80 (HTTP) and 443 (HTTPS)
- Redirect all HTTP to HTTPS
- Serve React build files from `/frontend-react/build`
- Proxy `/api/*` requests to backend on port 4000
- Serve uploaded images from `/uploads` directory
- Enable gzip compression for text assets
- Set security headers (CSP, HSTS, X-Frame-Options)

**SSL/TLS**:
- Use Let's Encrypt for free SSL certificates
- Automated renewal via certbot
- TLS 1.2 and 1.3 only
- Strong cipher suites

**Performance Optimizations**:
- Static asset caching (1 year for immutable assets)
- Gzip compression for text content
- HTTP/2 support
- Connection keep-alive

### 2. Backend API Server (Node.js)

**Purpose**: Core application logic, API endpoints, service orchestration, and database operations.

**Current Configuration** (from ecosystem.config.js):
- Cluster mode with max CPU cores
- Port 4000
- Auto-restart on crashes
- Max memory: 1GB per instance
- Graceful shutdown with 5s timeout

**Key Endpoints**:
- `GET /health` - Health check for monitoring
- `GET /api/health` - Detailed service health status
- `POST /api/analyze` - Image upload and disease detection
- `GET /api/chat/stream/:conversationId` - Streaming chat responses
- `GET /api/predictions/:userId` - User prediction history
- `GET /api/market-prices/:crop` - Market price data
- `GET /api/environment/current` - Environmental monitoring

**Dependencies**:
- MongoDB for data persistence
- ML Service for disease predictions
- Ollama for chatbot responses
- File system for image storage

**Error Handling**:
- Graceful degradation when services unavailable
- Comprehensive error logging
- User-friendly error messages
- Automatic retry logic for transient failures

### 3. ML Service (Python/FastAPI)

**Purpose**: Plant disease detection using EfficientNet-B3 deep learning model.

**Current Configuration** (from ecosystem.config.js):
- Single instance (memory intensive)
- Port 5000
- Max memory: 2GB
- Python 3 interpreter
- Auto-restart with 5s delay

**Model Details**:
- Architecture: EfficientNet-B3 (timm library)
- Input: 224x224 RGB images
- Output: Disease classification with confidence scores
- Preprocessing: ImageNet normalization

**API Endpoints**:
- `GET /health` - Service health check
- `POST /predict` - Single image prediction
- `POST /predict/batch` - Batch prediction (max 10 images)
- `GET /classes` - List all disease classes

**Performance Considerations**:
- Model loaded once at startup
- GPU support if available (CUDA)
- Image preprocessing optimization
- Batch prediction for efficiency

### 4. Ollama LLM Service

**Purpose**: Local language model for agricultural chatbot functionality.

**Configuration**:
- Model: minimax-m2:cloud (configurable)
- Port: 11434
- API: REST with streaming support
- Timeout: 30 seconds for responses

**Integration**:
- Backend calls Ollama API for chat responses
- Streaming responses for better UX
- Context-aware prompts with disease information
- Fallback messages when unavailable

**Resource Requirements**:
- Memory: 4-8GB depending on model
- CPU: Multi-core recommended
- Disk: Model storage (~4GB per model)

### 5. MongoDB Database

**Purpose**: Persistent storage for application data.

**Collections**:
- `users` - User profiles and authentication
- `predictions` - Disease detection history
- `conversations` - Chat conversation history
- `marketprices` - Crop market price data
- `harvestcalculations` - Harvest planning data
- `cropevents` - Crop calendar events

**Configuration**:
- Port: 27017 (default)
- Authentication: Username/password
- Connection pooling
- Indexes on frequently queried fields

**Backup Strategy**:
- Daily automated backups at 2:00 AM
- Retention: 30 days
- Backup location: Separate storage volume
- Backup verification after each run

### 6. File Storage

**Purpose**: Store uploaded plant images and generated assets.

**Structure**:
```
uploads/
├── [timestamp]-[random].jpg  (uploaded images)
└── ...
```

**Configuration**:
- Location: `/uploads` directory
- Max file size: 10MB
- Allowed formats: JPG, JPEG, PNG, WEBP
- Cleanup: Delete after ML processing
- Backup: Daily backup at 3:00 AM

**Security**:
- Validate file types
- Sanitize filenames
- Limit upload size
- Serve through Nginx with proper headers

## Data Models

### Environment Variables

Production environment requires the following configuration:

```bash
# Node.js Backend
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://yourdomain.com

# Database
MONGODB_URI=mongodb://username:password@localhost:27017/krishiraksha
MONGODB_DB_NAME=krishiraksha

# ML Service
ML_API_URL=http://localhost:5000

# Ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=minimax-m2:cloud

# External APIs (optional)
AGRO_API_KEY=your_agromonitoring_key

# Security
SESSION_SECRET=random_secure_string
JWT_SECRET=random_secure_string

# Logging
LOG_LEVEL=info
LOG_DIR=./logs
```

### Configuration Files

**PM2 Ecosystem** (`ecosystem.config.js`):
- Already configured for both backend and ML service
- Cluster mode for backend
- Fork mode for ML service
- Log rotation and management
- Environment-specific settings

**Nginx Configuration** (`config/nginx.conf`):
- Template provided
- Requires customization for domain and SSL paths
- Includes security headers and caching rules

### Deployment Directory Structure

```
/var/www/krishiraksha/
├── backend/
│   ├── server.js
│   ├── config/
│   ├── models/
│   └── utils/
├── frontend-react/
│   └── build/          (production build)
├── uploads/            (user uploads)
├── logs/               (application logs)
│   ├── backend-error.log
│   ├── backend-out.log
│   ├── ml-error.log
│   └── ml-out.log
├── backups/            (database backups)
├── api_service.py
├── ecosystem.config.js
├── package.json
├── .env                (environment variables)
└── node_modules/
```

## Error Handling

### Service Failure Scenarios

**1. ML Service Unavailable**:
- Backend catches connection errors
- Returns 503 with user-friendly message
- Logs error with timestamp
- PM2 automatically restarts service
- Health check reports degraded status

**2. Ollama Service Unavailable**:
- Backend detects health check failure
- Returns fallback message to user
- Continues with other functionality
- Health check reports degraded status

**3. MongoDB Connection Lost**:
- Backend uses connection pooling with auto-reconnect
- Graceful degradation for non-critical features
- Error logging for debugging
- Health check reports database status

**4. Backend Crash**:
- PM2 detects process exit
- Automatic restart within 10 seconds
- Cluster mode ensures other instances handle requests
- Error logged to file
- Alert after 5 crashes in 60 seconds

**5. Nginx Failure**:
- Systemd automatically restarts nginx
- Configuration tested before reload
- Fallback to previous config on error

### Error Logging Strategy

**Log Levels**:
- ERROR: Service failures, crashes, critical issues
- WARN: Degraded performance, timeouts, retries
- INFO: Normal operations, requests, responses
- DEBUG: Detailed debugging information (dev only)

**Log Rotation**:
- Daily rotation at midnight
- Compress logs older than 7 days
- Retain logs for 90 days
- Separate logs per service

**Log Aggregation**:
- All logs in `/var/www/krishiraksha/logs/`
- Structured JSON format for parsing
- Include timestamps, request IDs, user IDs
- PM2 log management

### Monitoring and Alerts

**Health Checks**:
- `/health` endpoint for basic status
- `/api/health` for detailed service status
- External monitoring service pings every 5 minutes
- Alert on 3 consecutive failures

**Metrics to Monitor**:
- Service uptime and availability
- Response times (p50, p95, p99)
- Error rates by endpoint
- CPU and memory usage per service
- Database connection pool status
- Disk space usage
- SSL certificate expiration

**Alert Channels**:
- Email for critical alerts
- SMS for service down alerts
- Dashboard for real-time monitoring

## Testing Strategy

### Pre-Deployment Testing

**1. Local Testing**:
- Run all services locally with production config
- Test all API endpoints
- Verify ML model predictions
- Test chatbot functionality
- Check database operations

**2. Staging Environment**:
- Deploy to staging subdomain
- Run automated test suite
- Manual testing of critical flows
- Performance testing under load
- Security scanning

**3. Integration Testing**:
- Test service communication
- Verify error handling
- Test graceful degradation
- Verify backup and restore
- Test SSL configuration

### Post-Deployment Verification

**1. Smoke Tests**:
- Health check endpoints return 200
- Frontend loads correctly
- Image upload and prediction works
- Chatbot responds
- Database queries succeed

**2. Monitoring Setup**:
- Verify logs are being written
- Check PM2 status
- Confirm health checks running
- Test alert notifications

**3. Performance Validation**:
- Response times within SLA
- No memory leaks
- CPU usage normal
- Database queries optimized

### Automated Testing

**Backend Tests** (Jest):
```bash
npm run test:backend      # Unit tests
npm run test:integration  # Integration tests
```

**E2E Tests** (Jest):
```bash
npm run test:e2e          # End-to-end tests
```

**Frontend Tests** (React Testing Library):
```bash
cd frontend-react && npm test
```

### Load Testing

**Tools**: Apache Bench, Artillery, or k6

**Test Scenarios**:
- 100 concurrent users
- Image upload and prediction
- Chat interactions
- API endpoint stress testing
- Database query performance

**Success Criteria**:
- 95% of requests < 2 seconds
- 0% error rate under normal load
- Graceful degradation under high load
- No memory leaks over 24 hours

## Security Considerations

### SSL/TLS Configuration

- TLS 1.2 and 1.3 only
- Strong cipher suites (ECDHE, AES-GCM)
- HSTS header with 1-year max-age
- SSL stapling enabled
- Automated certificate renewal

### Application Security

**Input Validation**:
- File type validation for uploads
- File size limits (10MB)
- Sanitize user inputs
- Validate MongoDB ObjectIds
- Rate limiting on API endpoints

**Authentication & Authorization**:
- User authentication (if implemented)
- API key validation for external services
- Session management
- CORS configuration for frontend domain

**Security Headers**:
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Content-Security-Policy
- Referrer-Policy

**Data Protection**:
- Environment variables for secrets
- No credentials in version control
- Encrypted database connections
- Secure file permissions
- Regular security updates

### Network Security

**Firewall Rules**:
- Allow: 80 (HTTP), 443 (HTTPS), 22 (SSH)
- Block: Direct access to 4000, 5000, 11434, 27017
- Internal services only accessible from localhost

**DDoS Protection**:
- Rate limiting in Nginx
- Connection limits
- Request size limits
- Cloudflare or similar CDN (optional)

## Deployment Process

### Initial Setup

**1. Server Preparation**:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python 3.10+
sudo apt install -y python3 python3-pip python3-venv

# Install MongoDB
# Follow official MongoDB installation guide

# Install Nginx
sudo apt install -y nginx

# Install PM2 globally
sudo npm install -g pm2

# Install certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

**2. Application Setup**:
```bash
# Clone repository
cd /var/www
sudo git clone <repository-url> krishiraksha
cd krishiraksha

# Install dependencies
npm install
cd frontend-react && npm install && cd ..
pip3 install -r requirements_ml.txt

# Build frontend
npm run build

# Create directories
mkdir -p logs uploads backups

# Set permissions
sudo chown -R www-data:www-data /var/www/krishiraksha
```

**3. Configuration**:
```bash
# Copy environment file
cp .env.example .env
nano .env  # Edit with production values

# Configure Nginx
sudo cp config/nginx.conf /etc/nginx/sites-available/krishiraksha
sudo nano /etc/nginx/sites-available/krishiraksha  # Update domain and paths
sudo ln -s /etc/nginx/sites-available/krishiraksha /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Setup SSL
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**4. Start Services**:
```bash
# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Start Ollama
# Follow Ollama installation guide
ollama serve &
ollama pull minimax-m2:cloud

# Start application with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup  # Follow instructions to enable on boot
```

### Deployment Script

Create `scripts/deploy-production.sh`:
```bash
#!/bin/bash
set -e

echo "Starting deployment..."

# Pull latest code
git pull origin main

# Install dependencies
npm install
cd frontend-react && npm install && cd ..
pip3 install -r requirements_ml.txt

# Build frontend
npm run build

# Run tests
npm run test:backend

# Reload PM2 processes (zero-downtime)
pm2 reload ecosystem.config.js --env production

# Reload Nginx
sudo nginx -t && sudo systemctl reload nginx

echo "Deployment complete!"
```

### Rollback Procedure

```bash
#!/bin/bash
# scripts/rollback.sh

# Revert to previous git commit
git reset --hard HEAD~1

# Reinstall dependencies
npm install

# Rebuild frontend
npm run build

# Reload services
pm2 reload ecosystem.config.js --env production
```

### Backup and Restore

**Automated Backup Script** (`scripts/backup-database.sh`):
```bash
#!/bin/bash
BACKUP_DIR="/var/www/krishiraksha/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup MongoDB
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/mongo_$DATE"

# Backup uploads
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" /var/www/krishiraksha/uploads

# Remove backups older than 30 days
find "$BACKUP_DIR" -type f -mtime +30 -delete

echo "Backup completed: $DATE"
```

**Cron Job** (run daily at 2 AM):
```bash
0 2 * * * /var/www/krishiraksha/scripts/backup-database.sh >> /var/www/krishiraksha/logs/backup.log 2>&1
```

## Performance Optimization

### Backend Optimization

- Cluster mode for multi-core utilization
- Connection pooling for MongoDB
- Response caching for static data
- Gzip compression for API responses
- Efficient database queries with indexes

### Frontend Optimization

- Code splitting and lazy loading
- Image optimization and lazy loading
- Service worker for offline support
- CDN for static assets (optional)
- Minification and tree shaking

### ML Service Optimization

- Model loaded once at startup
- GPU acceleration if available
- Image preprocessing optimization
- Batch prediction support
- Response caching for common predictions

### Database Optimization

- Indexes on frequently queried fields
- Connection pooling
- Query optimization
- Regular maintenance and compaction
- Sharding for horizontal scaling (future)

## Scalability Considerations

### Horizontal Scaling

**Backend**:
- PM2 cluster mode already enables multi-core usage
- Can deploy multiple servers behind load balancer
- Stateless design enables easy scaling

**ML Service**:
- Can deploy multiple instances
- Load balancer distributes prediction requests
- Consider GPU instances for better performance

**Database**:
- MongoDB replica set for high availability
- Sharding for large datasets
- Read replicas for read-heavy workloads

### Vertical Scaling

**Current Resource Requirements**:
- Backend: 512MB RAM per instance
- ML Service: 2GB RAM (4GB with GPU)
- Ollama: 4-8GB RAM depending on model
- MongoDB: 2GB RAM minimum
- Total: 8-16GB RAM recommended

**Scaling Up**:
- Increase server resources as needed
- Monitor resource usage and bottlenecks
- Optimize before scaling

### CDN Integration

- Cloudflare or AWS CloudFront
- Cache static assets globally
- DDoS protection
- SSL/TLS termination
- Reduced server load

## Maintenance and Operations

### Regular Maintenance Tasks

**Daily**:
- Check service health status
- Review error logs
- Monitor disk space
- Verify backups completed

**Weekly**:
- Review performance metrics
- Check SSL certificate expiration
- Update dependencies (security patches)
- Review and rotate logs

**Monthly**:
- Full system backup
- Security audit
- Performance optimization review
- Capacity planning review

### Monitoring Dashboard

**Metrics to Display**:
- Service uptime (%)
- Request rate (req/min)
- Response times (avg, p95, p99)
- Error rate (%)
- CPU usage per service
- Memory usage per service
- Disk space usage
- Database query performance

**Tools**:
- PM2 built-in monitoring: `pm2 monit`
- Custom dashboard with Grafana (optional)
- Cloud monitoring services (optional)

### Log Management

**Log Locations**:
- Backend: `logs/backend-out.log`, `logs/backend-error.log`
- ML Service: `logs/ml-out.log`, `logs/ml-error.log`
- Nginx: `/var/log/nginx/krishiraksha-*.log`
- MongoDB: `/var/log/mongodb/mongod.log`

**Log Analysis**:
```bash
# View PM2 logs
pm2 logs

# View recent errors
tail -f logs/backend-error.log

# Search for specific errors
grep "ERROR" logs/*.log

# Analyze request patterns
awk '{print $1}' /var/log/nginx/krishiraksha-access.log | sort | uniq -c | sort -rn
```

### Update Procedure

**Application Updates**:
1. Test in staging environment
2. Create backup
3. Pull latest code
4. Install dependencies
5. Run tests
6. Build frontend
7. Reload PM2 (zero-downtime)
8. Verify deployment
9. Monitor for issues

**System Updates**:
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js (if needed)
# Update Python packages
pip3 install --upgrade -r requirements_ml.txt

# Restart services
pm2 restart all
```

## Disaster Recovery

### Backup Strategy

**What to Backup**:
- MongoDB database (daily)
- Uploaded images (daily)
- Application code (git repository)
- Configuration files (.env, nginx.conf)
- SSL certificates

**Backup Storage**:
- Local: `/var/www/krishiraksha/backups`
- Remote: Cloud storage (S3, Google Cloud Storage)
- Retention: 30 days local, 90 days remote

### Recovery Procedures

**Database Recovery**:
```bash
# Restore from backup
mongorestore --uri="$MONGODB_URI" /path/to/backup/mongo_YYYYMMDD_HHMMSS
```

**Full System Recovery**:
1. Provision new server
2. Install all dependencies
3. Clone repository
4. Restore database from backup
5. Restore uploaded files
6. Configure environment variables
7. Setup SSL certificates
8. Start services
9. Verify functionality

**Recovery Time Objective (RTO)**: 4 hours
**Recovery Point Objective (RPO)**: 24 hours

## Cost Optimization

### Resource Efficiency

- Use PM2 cluster mode instead of multiple servers
- Optimize database queries to reduce CPU usage
- Implement caching to reduce API calls
- Use CDN for static assets
- Right-size server resources

### Hosting Options

**Budget Option** ($20-50/month):
- Single VPS (4GB RAM, 2 CPU cores)
- DigitalOcean, Linode, or Vultr
- Suitable for moderate traffic

**Recommended Option** ($50-100/month):
- VPS (8GB RAM, 4 CPU cores)
- Managed MongoDB (optional)
- CDN integration
- Suitable for production traffic

**Enterprise Option** ($200+/month):
- Multiple servers with load balancer
- Managed database cluster
- CDN with DDoS protection
- 24/7 monitoring and support

### Free Tier Services

- Let's Encrypt: Free SSL certificates
- Cloudflare: Free CDN and DDoS protection
- MongoDB Atlas: Free tier (512MB)
- GitHub Actions: Free CI/CD
- UptimeRobot: Free uptime monitoring

## Conclusion

This design provides a robust, scalable, and maintainable production deployment architecture for the Plant Disease Detection application. The use of industry-standard tools (PM2, Nginx, MongoDB) and best practices (SSL, monitoring, backups) ensures high availability and reliability.

Key strengths of this design:
- Automated service recovery with PM2
- Zero-downtime deployments
- Comprehensive monitoring and logging
- Security-first approach
- Cost-effective resource utilization
- Clear operational procedures

The architecture is designed to start small and scale as needed, making it suitable for both initial launch and future growth.
