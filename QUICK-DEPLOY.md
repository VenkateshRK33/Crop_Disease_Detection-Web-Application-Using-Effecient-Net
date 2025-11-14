# KrishiRaksha - Quick Deployment Guide

## 🚀 5-Minute Production Deployment

### Prerequisites
- Node.js 16+ installed
- Python 3.8+ installed
- MongoDB running (local or Atlas)
- Domain name (optional for local testing)

---

## Step 1: Configure Environment (2 minutes)

```bash
# Copy environment template
cp .env.example .env

# Edit .env and set these REQUIRED variables:
# NODE_ENV=production
# MONGODB_URI=your_mongodb_connection_string
# WEATHER_API_KEY=your_openweathermap_api_key
# SESSION_SECRET=generate_random_string_here
# CORS_ORIGIN=https://yourdomain.com
```

**Quick Commands**:
```bash
# Generate SESSION_SECRET
openssl rand -base64 32

# Or on Windows
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Step 2: Deploy (2 minutes)

### Linux/Mac
```bash
chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh
```

### Windows
```cmd
scripts\deploy-production.bat
```

### Manual
```bash
# Install dependencies
npm install
cd frontend-react && npm install && cd ..
pip install -r requirements_ml.txt

# Build frontend
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

---

## Step 3: Configure Web Server (1 minute)

### Nginx
```bash
# Copy config
sudo cp config/nginx.conf /etc/nginx/sites-available/krishiraksha

# Edit with your domain and paths
sudo nano /etc/nginx/sites-available/krishiraksha

# Enable site
sudo ln -s /etc/nginx/sites-available/krishiraksha /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com
```

### Apache
```bash
# Copy config
sudo cp config/apache.conf /etc/apache2/sites-available/krishiraksha.conf

# Edit with your domain and paths
sudo nano /etc/apache2/sites-available/krishiraksha.conf

# Enable modules and site
sudo a2enmod ssl rewrite proxy proxy_http headers deflate
sudo a2ensite krishiraksha
sudo apache2ctl configtest
sudo systemctl reload apache2

# Get SSL certificate
sudo certbot --apache -d yourdomain.com
```

---

## Step 4: Verify (30 seconds)

```bash
# Check services
pm2 status

# Test health
curl http://localhost:4000/health

# Run tests
node scripts/test-production.js

# Check logs
pm2 logs
```

---

## ✅ Done!

Your application is now running:
- **Backend**: http://localhost:4000
- **Frontend**: Served by Nginx/Apache
- **Health**: http://localhost:4000/health

---

## 🔧 Common Commands

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

# Backup database
./scripts/backup-database.sh
```

---

## 🆘 Troubleshooting

**Backend won't start?**
```bash
pm2 logs krishiraksha-backend
# Check MongoDB connection
# Verify .env variables
```

**Frontend blank page?**
```bash
# Check browser console
# Verify REACT_APP_API_URL in .env
# Check CORS_ORIGIN in backend
```

**Database connection failed?**
```bash
# Test connection
mongosh "$MONGODB_URI"
# Check IP whitelist (if using Atlas)
```

---

## 📚 Full Documentation

- **Detailed Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Checklist**: [PRODUCTION-CHECKLIST.md](PRODUCTION-CHECKLIST.md)
- **Complete Status**: [PRODUCTION-READY.md](PRODUCTION-READY.md)

---

**Need help?** See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.
