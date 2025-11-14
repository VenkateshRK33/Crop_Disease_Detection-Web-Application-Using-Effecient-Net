# KrishiRaksha Production Deployment Checklist

## Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] Copy `.env.example` to `.env`
- [ ] Set `NODE_ENV=production`
- [ ] Update `MONGODB_URI` with production database
- [ ] Add valid `WEATHER_API_KEY` from OpenWeatherMap
- [ ] Generate and set strong `SESSION_SECRET` (use: `openssl rand -base64 32`)
- [ ] Update `CORS_ORIGIN` to production domain
- [ ] Set `REACT_APP_API_URL` to production API URL
- [ ] Review and set all optional environment variables
- [ ] Verify all API keys are valid and active

### 2. Dependencies
- [ ] Run `npm install` in root directory
- [ ] Run `npm install` in `frontend-react` directory
- [ ] Run `pip install -r requirements_ml.txt` for ML service
- [ ] Update all dependencies to latest stable versions
- [ ] Remove unused dependencies
- [ ] Audit for security vulnerabilities: `npm audit fix`

### 3. Database Setup
- [ ] MongoDB instance running (local or Atlas)
- [ ] Database user created with appropriate permissions
- [ ] Connection string tested and working
- [ ] Indexes created for optimal performance
- [ ] Backup strategy configured
- [ ] Data migration completed (if applicable)

### 4. API Keys & External Services
- [ ] OpenWeatherMap API key obtained and tested
- [ ] Ollama installed and model downloaded
- [ ] ML model files present and accessible
- [ ] All external API rate limits understood
- [ ] Fallback strategies for API failures implemented

### 5. Security
- [ ] SESSION_SECRET changed from default
- [ ] CORS configured for production domain only
- [ ] Rate limiting enabled
- [ ] File upload restrictions configured
- [ ] MongoDB authentication enabled
- [ ] Firewall rules configured
- [ ] SSL certificates obtained
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Input validation implemented

### 6. Build & Testing
- [ ] Frontend builds successfully: `npm run build`
- [ ] No console errors in production build
- [ ] All unit tests passing: `npm run test:all`
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Manual testing completed on all features
- [ ] Cross-browser testing completed
- [ ] Mobile responsiveness verified
- [ ] Performance testing completed
- [ ] Load testing completed

### 7. Code Quality
- [ ] Code linted and formatted
- [ ] No TODO or FIXME comments in critical paths
- [ ] Debug logging disabled in production
- [ ] Console.log statements removed or disabled
- [ ] Error handling implemented for all async operations
- [ ] Proper error messages for users
- [ ] Code reviewed by team

### 8. Documentation
- [ ] README.md updated with production info
- [ ] API documentation complete
- [ ] Deployment guide reviewed
- [ ] User guide updated
- [ ] Environment variables documented
- [ ] Troubleshooting guide available

## Deployment Steps

### 1. Server Preparation
- [ ] Server provisioned (cloud or on-premise)
- [ ] Operating system updated
- [ ] Node.js installed (v16+)
- [ ] Python installed (3.8+)
- [ ] MongoDB installed or Atlas configured
- [ ] Nginx/Apache installed
- [ ] PM2 installed globally
- [ ] Git installed
- [ ] Firewall configured (ports 80, 443, 22)

### 2. Code Deployment
- [ ] Repository cloned to server
- [ ] Correct branch checked out
- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] Build completed successfully
- [ ] File permissions set correctly
- [ ] Logs directory created

### 3. SSL/HTTPS Setup
- [ ] Domain name configured and pointing to server
- [ ] SSL certificate obtained (Let's Encrypt or commercial)
- [ ] Certificate installed in web server
- [ ] HTTPS redirect configured
- [ ] Certificate auto-renewal configured
- [ ] SSL tested with SSL Labs

### 4. Web Server Configuration
- [ ] Nginx/Apache configured
- [ ] Static files served correctly
- [ ] API proxy configured
- [ ] Gzip compression enabled
- [ ] Cache headers configured
- [ ] Security headers added
- [ ] React Router support configured
- [ ] Configuration tested
- [ ] Web server restarted

### 5. Process Management
- [ ] PM2 ecosystem file configured
- [ ] Backend service started with PM2
- [ ] ML service started with PM2
- [ ] PM2 configuration saved
- [ ] PM2 startup script configured
- [ ] Services auto-restart on failure
- [ ] Log rotation configured

### 6. Database Configuration
- [ ] Production database created
- [ ] Indexes created
- [ ] Initial data seeded (if needed)
- [ ] Backup configured
- [ ] Connection tested from application
- [ ] Performance optimized

## Post-Deployment Verification

### 1. Functionality Testing
- [ ] Home page loads correctly
- [ ] Navigation works on all pages
- [ ] Disease detection: Upload and prediction works
- [ ] Market prices: Data displays correctly
- [ ] Environmental monitoring: Weather data loads
- [ ] Harvest calculator: Calculations work
- [ ] Crop calendar: Events can be created/edited
- [ ] Chatbot: Responds to queries
- [ ] All forms submit successfully
- [ ] Error handling works correctly

### 2. Performance Testing
- [ ] Page load times acceptable (<3s)
- [ ] API response times acceptable (<1s)
- [ ] Images load quickly
- [ ] No memory leaks
- [ ] CPU usage normal
- [ ] Database queries optimized
- [ ] Caching working correctly

### 3. Security Testing
- [ ] HTTPS working correctly
- [ ] No mixed content warnings
- [ ] CORS working as expected
- [ ] Rate limiting functional
- [ ] File upload restrictions working
- [ ] SQL injection protection verified
- [ ] XSS protection verified
- [ ] CSRF protection verified

### 4. Cross-Platform Testing
- [ ] Desktop Chrome
- [ ] Desktop Firefox
- [ ] Desktop Safari
- [ ] Desktop Edge
- [ ] Mobile iOS Safari
- [ ] Mobile Android Chrome
- [ ] Tablet devices

### 5. Monitoring Setup
- [ ] Uptime monitoring configured
- [ ] Error tracking configured (Sentry)
- [ ] Log monitoring configured
- [ ] Performance monitoring configured
- [ ] Alert notifications configured
- [ ] Health check endpoint working
- [ ] PM2 monitoring active

## Maintenance & Operations

### 1. Backup Strategy
- [ ] Database backup scheduled (daily)
- [ ] Backup retention policy defined
- [ ] Backup restoration tested
- [ ] File uploads backed up
- [ ] Configuration files backed up
- [ ] Backup monitoring configured

### 2. Monitoring & Alerts
- [ ] Uptime alerts configured
- [ ] Error rate alerts configured
- [ ] Performance alerts configured
- [ ] Disk space alerts configured
- [ ] Memory usage alerts configured
- [ ] SSL expiry alerts configured

### 3. Logging
- [ ] Application logs configured
- [ ] Access logs configured
- [ ] Error logs configured
- [ ] Log rotation configured
- [ ] Log retention policy defined
- [ ] Log analysis tools configured

### 4. Documentation
- [ ] Deployment runbook created
- [ ] Incident response plan documented
- [ ] Rollback procedure documented
- [ ] Scaling procedure documented
- [ ] Team access documented
- [ ] Contact information updated

## Emergency Procedures

### Rollback Plan
1. Stop PM2 processes: `pm2 stop all`
2. Checkout previous version: `git checkout <previous-tag>`
3. Restore dependencies: `npm install`
4. Rebuild frontend: `npm run build`
5. Restart services: `pm2 restart all`
6. Verify functionality
7. Restore database backup if needed

### Quick Fixes
- **Backend down**: `pm2 restart krishiraksha-backend`
- **ML service down**: `pm2 restart krishiraksha-ml`
- **High memory**: `pm2 restart all`
- **Database connection lost**: Check MongoDB status, restart if needed
- **SSL expired**: Renew certificate: `sudo certbot renew`

## Sign-Off

- [ ] Technical lead approval
- [ ] QA team approval
- [ ] Product owner approval
- [ ] Security review completed
- [ ] Performance benchmarks met
- [ ] Documentation complete
- [ ] Team trained on operations
- [ ] Support team notified

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Version**: _______________
**Notes**: _______________

---

## Post-Launch (First 24 Hours)

- [ ] Monitor error rates
- [ ] Monitor performance metrics
- [ ] Monitor user feedback
- [ ] Check all alerts working
- [ ] Verify backups running
- [ ] Review logs for issues
- [ ] Team on standby for issues

## Post-Launch (First Week)

- [ ] Review performance trends
- [ ] Analyze user behavior
- [ ] Optimize based on real usage
- [ ] Address any reported issues
- [ ] Update documentation based on learnings
- [ ] Plan next iteration

---

**Last Updated**: November 2025
