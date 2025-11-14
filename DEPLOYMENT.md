# KrishiRaksha Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Building for Production](#building-for-production)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Database Setup](#database-setup)
7. [SSL/HTTPS Configuration](#ssl-https-configuration)
8. [Process Management with PM2](#process-management-with-pm2)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements
- **Operating System**: Linux (Ubuntu 20.04+ recommended), Windows Server, or macOS
- **Node.js**: v16.x or higher
- **Python**: 3.8 or higher
- **MongoDB**: 4.4 or higher
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Storage**: Minimum 10GB free space
- **Network**: Static IP or domain name

### Required Services
- MongoDB (local or MongoDB Atlas)
- Ollama (for AI chatbot)
- Python ML service
- Web server (Nginx or Apache) - optional but recommended

### API Keys Required
- **OpenWeatherMap API Key** (REQUIRED)
  - Sign up: https://openweathermap.org/api
  - Free tier: 1000 calls/day
  - Activation time: ~2 hours

---

## Environment Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd krishiraksha
```

### 2. Configure Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and update the following **REQUIRED** variables:

```bash
# Set to production
NODE_ENV=production

# Production MongoDB URI
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/krishiraksha-db

# Your OpenWeatherMap API key
WEATHER_API_KEY=your_actual_api_key_here

# Generate a strong secret (use: openssl rand -base64 32)
SESSION_SECRET=your_random_secret_here

# Your production domain
CORS_ORIGIN=https://yourdomain.com

# Production API URL
REACT_APP_API_URL=https://api.yourdomain.com
```

### 3. Install Dependencies

**Backend:**
```bash
npm install
```

**Frontend:**
```bash
cd frontend-react
npm install
cd ..
```

**ML Service:**
```bash
pip install -r requirements_ml.txt
```

---

## Building for Production

### 1. Build Frontend

```bash
cd frontend-react
npm run build
```

This creates an optimized production build in `frontend-react/build/`.

**Verify build:**
```bash
# Check build size
du -sh build/

# Test build locally
npx serve -s build -p 3000
```

**Expected output:**
- Build folder size: ~2-5 MB
- Main JS bundle: ~500KB-1MB (gzipped)
- No console errors when testing

### 2. Optimize Assets

**Image optimization:**
```bash
# Install image optimization tools
npm install -g imagemin-cli

# Optimize images
imagemin frontend-react/build/static/media/* --out-dir=frontend-react/build/static/media/
```

**Bundle analysis (optional):**
```bash
cd frontend-react
npm run build -- --stats
npx webpack-bundle-analyzer build/bundle-stats.json
```

### 3. Backend Preparation

**Test backend:**
```bash
# Set NODE_ENV temporarily
export NODE_ENV=production

# Start backend
node backend/server.js

# Verify it starts without errors
```

---

## Backend Deployment

### Option 1: Deploy with PM2 (Recommended)

**Install PM2:**
```bash
npm install -g pm2
```

**Create PM2 ecosystem file:**

Create `ecosystem.config.js` in project root:

```javascript
module.exports = {
  apps: [
    {
      name: 'krishiraksha-backend',
      script: './backend/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      watch: false
    },
    {
      name: 'krishiraksha-ml',
      script: 'python',
      args: 'api_service.py',
      interpreter: 'none',
      env: {
        PYTHONUNBUFFERED: '1'
      },
      error_file: './logs/ml-error.log',
      out_file: './logs/ml-out.log',
      autorestart: true,
      max_memory_restart: '2G'
    }
  ]
};
```

**Start services:**
```bash
# Create logs directory
mkdir -p logs

# Start all services
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the instructions printed by the command
```

**PM2 Commands:**
```bash
# View status
pm2 status

# View logs
pm2 logs

# Restart services
pm2 restart all

# Stop services
pm2 stop all

# Monitor resources
pm2 monit
```

### Option 2: Deploy with systemd

Create service file `/etc/systemd/system/krishiraksha.service`:

```ini
[Unit]
Description=KrishiRaksha Backend Service
After=network.target mongodb.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/krishiraksha
Environment=NODE_ENV=production
ExecStart=/usr/bin/node backend/server.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=krishiraksha

[Install]
WantedBy=multi-user.target
```

**Enable and start:**
```bash
sudo systemctl enable krishiraksha
sudo systemctl start krishiraksha
sudo systemctl status krishiraksha
```

---

## Frontend Deployment

### Option 1: Serve with Nginx (Recommended)

**Install Nginx:**
```bash
sudo apt update
sudo apt install nginx
```

**Configure Nginx:**

Create `/etc/nginx/sites-available/krishiraksha`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Frontend static files
    root /path/to/krishiraksha/frontend-react/build;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
    
    # Cache static assets
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://localhost:4000;
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
    
    # React Router support
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

**Enable site:**
```bash
sudo ln -s /etc/nginx/sites-available/krishiraksha /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Option 2: Serve with Apache

**Install Apache:**
```bash
sudo apt install apache2
```

**Configure Apache:**

Create `/etc/apache2/sites-available/krishiraksha.conf`:

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    Redirect permanent / https://yourdomain.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName yourdomain.com
    DocumentRoot /path/to/krishiraksha/frontend-react/build
    
    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key
    
    <Directory /path/to/krishiraksha/frontend-react/build>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # React Router support
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    # API proxy
    ProxyPass /api http://localhost:4000/api
    ProxyPassReverse /api http://localhost:4000/api
</VirtualHost>
```

**Enable site:**
```bash
sudo a2enmod ssl rewrite proxy proxy_http
sudo a2ensite krishiraksha
sudo systemctl reload apache2
```

---

## Database Setup

### Option 1: MongoDB Atlas (Cloud - Recommended)

1. **Create Account**: https://www.mongodb.com/cloud/atlas
2. **Create Cluster**:
   - Choose free tier (M0) or paid tier
   - Select region closest to your users
   - Wait for cluster creation (~5 minutes)

3. **Configure Security**:
   - Database Access: Create user with read/write permissions
   - Network Access: Add IP whitelist (0.0.0.0/0 for development, specific IPs for production)

4. **Get Connection String**:
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` and `<dbname>`
   - Add to `.env` as `MONGODB_URI`

### Option 2: Self-Hosted MongoDB

**Install MongoDB:**
```bash
# Ubuntu
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Secure MongoDB:**
```bash
# Connect to MongoDB
mongosh

# Create admin user
use admin
db.createUser({
  user: "admin",
  pwd: "strong_password_here",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})

# Create application user
use krishiraksha-db
db.createUser({
  user: "krishiraksha",
  pwd: "app_password_here",
  roles: ["readWrite"]
})
```

**Enable authentication:**

Edit `/etc/mongod.conf`:
```yaml
security:
  authorization: enabled
```

Restart MongoDB:
```bash
sudo systemctl restart mongod
```

**Update connection string:**
```bash
MONGODB_URI=mongodb://krishiraksha:app_password_here@localhost:27017/krishiraksha-db
```

---

## SSL/HTTPS Configuration

### Option 1: Let's Encrypt (Free SSL)

**Install Certbot:**
```bash
sudo apt install certbot python3-certbot-nginx
```

**Obtain certificate:**
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**Auto-renewal:**
```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot automatically sets up cron job for renewal
```

### Option 2: Commercial SSL Certificate

1. Purchase SSL certificate from provider
2. Download certificate files (.crt, .key, .ca-bundle)
3. Place in secure location (e.g., `/etc/ssl/certs/`)
4. Update Nginx/Apache configuration with paths
5. Set proper permissions:
```bash
sudo chmod 600 /etc/ssl/certs/private.key
sudo chmod 644 /etc/ssl/certs/certificate.crt
```

---

## Process Management with PM2

### Advanced PM2 Configuration

**Monitoring:**
```bash
# Real-time monitoring
pm2 monit

# Web-based monitoring (PM2 Plus)
pm2 link <secret> <public>
```

**Log Management:**
```bash
# View logs
pm2 logs

# Clear logs
pm2 flush

# Rotate logs
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

**Performance Tuning:**
```bash
# Adjust instances based on CPU cores
pm2 scale krishiraksha-backend 4

# Reload without downtime
pm2 reload all

# Graceful restart
pm2 gracefulReload all
```

---

## Monitoring & Maintenance

### Health Checks

**Backend health endpoint:**

Add to `backend/server.js`:
```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});
```

**Monitor with cron:**
```bash
# Add to crontab
*/5 * * * * curl -f http://localhost:4000/health || echo "Backend down" | mail -s "Alert" admin@yourdomain.com
```

### Database Backups

**Automated MongoDB backups:**

Create backup script `scripts/backup-db.sh`:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"
mkdir -p $BACKUP_DIR

mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/backup_$DATE"

# Keep only last 7 days
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +

echo "Backup completed: backup_$DATE"
```

**Schedule with cron:**
```bash
# Daily backup at 2 AM
0 2 * * * /path/to/scripts/backup-db.sh
```

### Log Monitoring

**Setup log rotation:**

Create `/etc/logrotate.d/krishiraksha`:
```
/path/to/krishiraksha/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

### Performance Monitoring

**Install monitoring tools:**
```bash
# System monitoring
sudo apt install htop iotop nethogs

# Node.js monitoring
npm install -g clinic
```

**Monitor resources:**
```bash
# CPU and memory
htop

# Disk I/O
iotop

# Network
nethogs

# PM2 monitoring
pm2 monit
```

---

## Troubleshooting

### Common Issues

**1. Backend won't start**
```bash
# Check logs
pm2 logs krishiraksha-backend

# Common causes:
# - Port already in use: lsof -i :4000
# - MongoDB connection failed: Check MONGODB_URI
# - Missing dependencies: npm install
```

**2. Frontend shows blank page**
```bash
# Check browser console for errors
# Common causes:
# - Wrong API URL: Check REACT_APP_API_URL
# - CORS issues: Check CORS_ORIGIN in backend
# - Build issues: Rebuild with npm run build
```

**3. MongoDB connection errors**
```bash
# Test connection
mongosh "$MONGODB_URI"

# Common causes:
# - Wrong credentials
# - IP not whitelisted (Atlas)
# - MongoDB service not running
```

**4. SSL certificate errors**
```bash
# Test SSL
openssl s_client -connect yourdomain.com:443

# Renew Let's Encrypt
sudo certbot renew

# Check certificate expiry
echo | openssl s_client -servername yourdomain.com -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
```

**5. High memory usage**
```bash
# Check PM2 processes
pm2 status

# Restart if needed
pm2 restart all

# Adjust max memory
pm2 start ecosystem.config.js --max-memory-restart 1G
```

### Debug Mode

**Enable debug logging:**
```bash
# In .env
DEBUG=true
LOG_LEVEL=debug

# Restart services
pm2 restart all
```

### Performance Issues

**Optimize database:**
```bash
# Create indexes
mongosh "$MONGODB_URI"
use krishiraksha-db
db.predictions.createIndex({ userId: 1, createdAt: -1 })
db.marketPrices.createIndex({ crop: 1, timestamp: -1 })
db.cropEvents.createIndex({ userId: 1, date: 1 })
```

**Enable caching:**
```bash
# In .env
WEATHER_CACHE_DURATION=30
MARKET_CACHE_DURATION=60
```

---

## Security Checklist

Before going live, verify:

- [ ] Changed SESSION_SECRET to random string
- [ ] Updated CORS_ORIGIN to production domain
- [ ] Enabled rate limiting
- [ ] MongoDB secured with authentication
- [ ] Using HTTPS (SSL certificates)
- [ ] Validated all API keys
- [ ] Restricted file upload types and sizes
- [ ] Firewall configured (only ports 80, 443, 22 open)
- [ ] Regular backups scheduled
- [ ] Monitoring and alerts configured
- [ ] Error logging enabled
- [ ] API documentation disabled in production
- [ ] Debug mode disabled
- [ ] Updated all dependencies to latest versions
- [ ] Removed unnecessary packages
- [ ] Set proper file permissions

---

## Post-Deployment

### 1. Verify Deployment

**Test all features:**
- [ ] Home page loads
- [ ] Navigation works
- [ ] Disease detection uploads and predicts
- [ ] Market prices display
- [ ] Environmental monitoring shows weather
- [ ] Harvest calculator computes results
- [ ] Crop calendar saves events
- [ ] Chatbot responds

**Test on multiple devices:**
- [ ] Desktop (Chrome, Firefox, Safari)
- [ ] Mobile (iOS Safari, Android Chrome)
- [ ] Tablet

### 2. Performance Testing

```bash
# Load testing with Apache Bench
ab -n 1000 -c 10 https://yourdomain.com/

# Or use Artillery
npm install -g artillery
artillery quick --count 10 --num 100 https://yourdomain.com/
```

### 3. Setup Monitoring

**Uptime monitoring:**
- UptimeRobot: https://uptimerobot.com
- Pingdom: https://www.pingdom.com

**Error tracking:**
- Sentry: https://sentry.io
- Rollbar: https://rollbar.com

### 4. Documentation

- Update README with production URL
- Document any custom configurations
- Create runbook for common operations
- Share credentials securely with team

---

## Support

For issues or questions:
- Email: support@krishiraksha.in
- Documentation: /docs
- GitHub Issues: <repository-url>/issues

---

**Last Updated**: November 2025
**Version**: 1.0.0
