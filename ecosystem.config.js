/**
 * PM2 Ecosystem Configuration for KrishiRaksha
 * 
 * This file configures PM2 process manager for production deployment.
 * 
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 save
 *   pm2 startup
 * 
 * Documentation: https://pm2.keymetrics.io/docs/usage/application-declaration/
 */

module.exports = {
  apps: [
    {
      // Backend Node.js Server
      name: 'krishiraksha-backend',
      script: './backend/server.js',
      
      // Cluster mode for load balancing
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster',
      
      // Environment variables
      env: {
        NODE_ENV: 'development',
        PORT: 4000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      
      // Logging
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Auto-restart configuration
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',
      
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      
      // Watch mode (disable in production)
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'uploads', '.git'],
      
      // Advanced features
      instance_var: 'INSTANCE_ID',
      
      // Cron restart (optional - restart daily at 3 AM)
      // cron_restart: '0 3 * * *',
      
      // Source map support
      source_map_support: true,
      
      // Interpreter options
      node_args: '--max-old-space-size=2048'
    },
    
    {
      // Python ML Service
      name: 'krishiraksha-ml',
      script: 'api_service.py',
      interpreter: 'python3',
      
      // Single instance (ML model is memory intensive)
      instances: 1,
      exec_mode: 'fork',
      
      // Environment variables
      env: {
        PYTHONUNBUFFERED: '1',
        PYTHONPATH: '.'
      },
      
      // Logging
      error_file: './logs/ml-error.log',
      out_file: './logs/ml-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Auto-restart configuration
      autorestart: true,
      max_restarts: 5,
      min_uptime: '30s',
      max_memory_restart: '2G',
      
      // Graceful shutdown
      kill_timeout: 10000,
      
      // Watch mode
      watch: false,
      
      // Restart delay
      restart_delay: 5000
    }
  ],
  
  // Deployment configuration (optional)
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'git@github.com:username/krishiraksha.git',
      path: '/var/www/krishiraksha',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'apt-get install git'
    },
    staging: {
      user: 'deploy',
      host: 'staging-server-ip',
      ref: 'origin/develop',
      repo: 'git@github.com:username/krishiraksha.git',
      path: '/var/www/krishiraksha-staging',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env staging'
    }
  }
};
