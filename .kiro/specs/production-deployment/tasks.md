# Implementation Plan

- [ ] 1. Prepare deployment environment and install system dependencies
  - Install Node.js 18+ on production server
  - Install Python 3.10+ and pip
  - Install MongoDB and configure authentication
  - Install Nginx web server
  - Install PM2 process manager globally
  - Install certbot for SSL certificate management
  - Create application directory structure at `/var/www/krishiraksha`
  - _Requirements: 1.1, 1.2, 1.3, 5.1, 5.2_

- [ ] 2. Configure production environment variables and secrets
  - Create `.env` file from `.env.example` template
  - Set `NODE_ENV=production` and configure port
  - Configure MongoDB connection URI with authentication credentials
  - Set ML service and Ollama service URLs
  - Generate and set secure session and JWT secrets
  - Configure external API keys (Agromonitoring if available)
  - Set logging configuration (level, directory)
  - Validate all required environment variables are present
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 3. Setup and configure Nginx reverse proxy
  - Copy `config/nginx.conf` to `/etc/nginx/sites-available/krishiraksha`
  - Update `server_name` with production domain name
  - Update `root` path to point to React build directory
  - Update `proxy_pass` URLs for backend API
  - Configure SSL certificate paths (placeholder for now)
  - Enable site by creating symlink in `/etc/nginx/sites-enabled/`
  - Test Nginx configuration with `nginx -t`
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 4. Obtain and configure SSL certificates
  - Run certbot to obtain Let's Encrypt SSL certificate for domain
  - Update Nginx configuration with certificate paths
  - Configure automatic certificate renewal with certbot timer
  - Test HTTPS access and HTTP to HTTPS redirect
  - Verify SSL configuration with SSL Labs test
  - _Requirements: 2.1, 2.2, 2.4, 2.5_

- [ ] 5. Build and deploy frontend application
  - Install frontend dependencies with `cd frontend-react && npm install`
  - Build production React bundle with `npm run build`
  - Verify build output in `frontend-react/build` directory
  - Configure Nginx to serve static files from build directory
  - Test frontend loads correctly through Nginx
  - Verify React Router works with Nginx try_files configuration
  - _Requirements: 2.1, 2.3, 7.2_

- [ ] 6. Configure and optimize PM2 process manager
  - Review `ecosystem.config.js` configuration
  - Update environment variables in ecosystem config
  - Configure log file paths in ecosystem config
  - Set memory limits for backend (512MB) and ML service (2GB)
  - Configure cluster mode instances for backend
  - Set restart delay and max restart attempts
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 7. Deploy and start backend services with PM2
  - Install backend dependencies with `npm install`
  - Start services with `pm2 start ecosystem.config.js --env production`
  - Verify backend service is running with `pm2 status`
  - Check backend logs with `pm2 logs krishiraksha-backend`
  - Test backend health endpoint `/api/health`
  - Save PM2 process list with `pm2 save`
  - Configure PM2 to start on system boot with `pm2 startup`
  - _Requirements: 1.1, 1.2, 3.1, 3.2, 3.3_

- [ ] 8. Deploy and start ML service with PM2
  - Install Python dependencies with `pip3 install -r requirements_ml.txt`
  - Verify ML model files exist (efficientnet_plant_disease.pth, label_encoder.pkl, class_names.json)
  - Start ML service through PM2 (already configured in ecosystem.config.js)
  - Verify ML service is running with `pm2 status`
  - Check ML service logs with `pm2 logs krishiraksha-ml`
  - Test ML service health endpoint at `http://localhost:5000/health`
  - Test prediction endpoint with sample image
  - _Requirements: 1.1, 1.3, 3.2, 3.3_

- [ ] 9. Setup and configure Ollama service
  - Install Ollama following official installation guide
  - Start Ollama service with `ollama serve`
  - Pull required model with `ollama pull minimax-m2:cloud`
  - Verify Ollama is accessible at `http://localhost:11434`
  - Test Ollama API with sample generation request
  - Configure Ollama to start on system boot (systemd service)
  - _Requirements: 1.1, 1.3, 3.3_

- [ ] 10. Configure MongoDB database for production
  - Start MongoDB service with `systemctl start mongod`
  - Enable MongoDB to start on boot with `systemctl enable mongod`
  - Create production database and user with authentication
  - Configure MongoDB connection string in `.env` file
  - Test database connection from backend
  - Create indexes on frequently queried fields (userId, timestamp, predictionId)
  - _Requirements: 1.1, 1.2, 5.3_

- [ ] 11. Setup automated backup system
  - Create `backups` directory in application root
  - Copy `scripts/backup-database.sh` and make executable
  - Update backup script with production MongoDB URI
  - Test backup script manually
  - Create cron job for daily database backup at 2:00 AM
  - Create cron job for daily uploads backup at 3:00 AM
  - Configure backup retention to delete files older than 30 days
  - Test backup restoration procedure
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 12. Implement health monitoring and logging
  - Create `logs` directory with proper permissions
  - Configure PM2 log rotation in ecosystem.config.js
  - Verify backend logs are being written to `logs/backend-*.log`
  - Verify ML service logs are being written to `logs/ml-*.log`
  - Configure log rotation to compress logs older than 7 days
  - Configure log retention to delete logs older than 90 days
  - Test health check endpoint returns correct service status
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 13. Configure resource limits and monitoring
  - Verify PM2 memory limits are set (512MB backend, 2GB ML, 4GB Ollama)
  - Configure PM2 CPU core limits in ecosystem.config.js
  - Test PM2 restarts service when memory limit exceeded
  - Setup PM2 monitoring with `pm2 monit` command
  - Document how to view resource usage metrics
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 4.5_

- [ ] 14. Implement deployment and rollback scripts
  - Create `scripts/deploy-production.sh` for automated deployment
  - Add git pull, dependency installation, and build steps
  - Add PM2 reload command for zero-downtime deployment
  - Add Nginx configuration test and reload
  - Make deployment script executable
  - Create `scripts/rollback.sh` for quick rollback
  - Test deployment script in staging environment
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 15. Configure security headers and firewall
  - Verify Nginx security headers are configured (X-Frame-Options, CSP, HSTS)
  - Configure firewall to allow ports 80, 443, and 22 only
  - Block direct access to internal service ports (4000, 5000, 11434, 27017)
  - Configure rate limiting in Nginx for API endpoints
  - Set proper file permissions for application directory
  - Verify no sensitive files are publicly accessible
  - _Requirements: 2.1, 2.4, 5.2_

- [ ] 16. Setup external monitoring and alerts
  - Configure external uptime monitoring service (UptimeRobot or similar)
  - Setup monitoring for main domain HTTPS endpoint
  - Setup monitoring for `/health` endpoint
  - Configure alert notifications via email
  - Set alert threshold to 3 consecutive failures
  - Test alert notifications by stopping services
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 17. Perform production deployment verification
  - Verify all services are running with `pm2 status`
  - Test frontend loads correctly at production domain
  - Test image upload and disease prediction flow
  - Test chatbot functionality with Ollama
  - Test market prices and environmental data endpoints
  - Verify database operations are working
  - Check all service health endpoints return healthy status
  - Verify SSL certificate is valid and HTTPS works
  - Test HTTP to HTTPS redirect
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.4, 7.2_

- [ ]* 18. Create production documentation
  - Document server access credentials and locations
  - Document deployment procedure step-by-step
  - Document rollback procedure
  - Document backup and restore procedures
  - Document monitoring and alert configuration
  - Document troubleshooting common issues
  - Create runbook for on-call operations
  - _Requirements: 8.1, 8.2, 8.3_

- [ ]* 19. Perform load testing and optimization
  - Setup load testing tool (Apache Bench or Artillery)
  - Run load test with 100 concurrent users
  - Measure response times for critical endpoints
  - Verify 95% of requests complete within 2 seconds
  - Check for memory leaks during extended load test
  - Optimize slow endpoints if needed
  - Document load testing results
  - _Requirements: 4.5, 7.3, 10.1, 10.2, 10.3_

- [ ]* 20. Setup staging environment
  - Create staging subdomain configuration in Nginx
  - Configure separate database for staging
  - Update ecosystem.config.js with staging environment
  - Deploy application to staging
  - Verify staging environment mirrors production
  - Test deployment process in staging before production
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
