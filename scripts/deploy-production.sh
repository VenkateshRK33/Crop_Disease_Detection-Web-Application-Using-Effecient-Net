#!/bin/bash

###############################################################################
# KrishiRaksha Production Deployment Script
# 
# This script automates the deployment process for production environment
# 
# Usage: ./scripts/deploy-production.sh
###############################################################################

set -e  # Exit on error

echo "🚀 Starting KrishiRaksha Production Deployment..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "Please copy .env.example to .env and configure it"
    exit 1
fi

# Check if NODE_ENV is production
if ! grep -q "NODE_ENV=production" .env; then
    echo -e "${YELLOW}⚠️  Warning: NODE_ENV is not set to production${NC}"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📦 Step 1: Installing dependencies..."
npm install --production
cd frontend-react && npm install --production && cd ..
pip install -r requirements_ml.txt

echo ""
echo "🏗️  Step 2: Building frontend..."
cd frontend-react
npm run build
cd ..

echo ""
echo "🧪 Step 3: Running tests..."
npm run test:backend
npm run test:integration

echo ""
echo "📊 Step 4: Analyzing build..."
node scripts/optimize-build.js

echo ""
echo "🗂️  Step 5: Creating logs directory..."
mkdir -p logs

echo ""
echo "🔄 Step 6: Starting services with PM2..."
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save

echo ""
echo "⏰ Step 7: Setting up PM2 startup..."
pm2 startup

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Configure Nginx/Apache (see DEPLOYMENT.md)"
echo "  2. Set up SSL certificates"
echo "  3. Test all features"
echo "  4. Monitor logs: pm2 logs"
echo "  5. Check status: pm2 status"
echo ""
echo "🔗 Access your application:"
echo "  Backend: http://localhost:4000"
echo "  Frontend: Configure web server to serve frontend-react/build"
echo ""
