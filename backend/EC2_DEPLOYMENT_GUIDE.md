# EC2 Deployment Guide for Mathematical Economics Platform

## Table of Contents
1. [Pre-requisites](#pre-requisites)
2. [EC2 Instance Setup](#ec2-instance-setup)
3. [Docker Installation and Configuration](#docker-installation-and-configuration)
4. [SSL/HTTPS Setup with Nginx](#sslhttps-setup-with-nginx)
5. [Environment Variables Configuration](#environment-variables-configuration)
6. [Database Setup and Migration](#database-setup-and-migration)
7. [Crawler Configuration for Overseas Servers](#crawler-configuration-for-overseas-servers)
8. [Monitoring and Logging Setup](#monitoring-and-logging-setup)
9. [Deployment Process](#deployment-process)
10. [Troubleshooting Guide](#troubleshooting-guide)
11. [Maintenance and Updates](#maintenance-and-updates)

## Pre-requisites

### AWS Account Requirements
- AWS account with EC2 access
- IAM user with appropriate permissions
- Key pair for SSH access (your `mathematical-economics.pem`)

### Domain Requirements
- Registered domain name
- Access to DNS management
- SSL certificate (or use Let's Encrypt)

### Local Requirements
- SSH client
- Git installed
- Docker and Docker Compose (for testing)

## EC2 Instance Setup

### 1. Launch EC2 Instance

```bash
# Recommended instance specifications:
- Instance Type: t3.medium or higher (2 vCPU, 4GB RAM minimum)
- AMI: Ubuntu Server 22.04 LTS (64-bit x86)
- Storage: 30GB gp3 SSD minimum
- Security Group Configuration:
  - SSH (22): Your IP only
  - HTTP (80): 0.0.0.0/0
  - HTTPS (443): 0.0.0.0/0
  - Backend API (5000): Optional, for direct access
  - PostgreSQL (5432): Private subnet only
```

### 2. Initial Server Configuration

```bash
# Connect to your EC2 instance
ssh -i mathematical-economics.pem ubuntu@your-ec2-public-ip

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y \
    curl \
    wget \
    git \
    build-essential \
    python3-pip \
    python3-venv \
    nodejs \
    npm \
    postgresql-client \
    nginx \
    certbot \
    python3-certbot-nginx \
    htop \
    vim \
    ufw

# Configure timezone
sudo timedatectl set-timezone Asia/Seoul

# Create application user
sudo useradd -m -s /bin/bash appuser
sudo usermod -aG sudo appuser

# Set up firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## Docker Installation and Configuration

### 1. Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
sudo usermod -aG docker appuser

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version

# Enable Docker to start on boot
sudo systemctl enable docker
```

### 2. Configure Docker for Production

```bash
# Create Docker daemon configuration
sudo tee /etc/docker/daemon.json <<EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "metrics-addr": "127.0.0.1:9323",
  "experimental": true
}
EOF

# Restart Docker
sudo systemctl restart docker
```

## SSL/HTTPS Setup with Nginx

### 1. Configure Nginx as Reverse Proxy

```bash
# Create Nginx configuration
sudo tee /etc/nginx/sites-available/mathematical-economics <<EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL configuration will be added by Certbot
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Increase timeout for long-running requests
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Static files cache
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml;
    gzip_disable "MSIE [1-6]\.";
}
EOF

# Enable the site
sudo ln -s /etc/nginx/sites-available/mathematical-economics /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 2. Obtain SSL Certificate

```bash
# Install SSL certificate using Let's Encrypt
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Set up automatic renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Test renewal
sudo certbot renew --dry-run
```

## Environment Variables Configuration

### 1. Create Environment Files

```bash
# Create directory for environment files
mkdir -p ~/mathematical-economics/config

# Create production environment file
cat > ~/mathematical-economics/config/.env.production <<EOF
# Application
NODE_ENV=production
PORT=5000
API_URL=https://your-domain.com/api

# Database
DATABASE_URL=postgresql://appuser:your-secure-password@db:5432/mathematical_economics
POSTGRES_USER=appuser
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=mathematical_economics

# JWT
JWT_SECRET=your-very-long-random-string-here
JWT_EXPIRES_IN=7d

# Admin
ADMIN_EMAIL=admin@your-domain.com
ADMIN_PASSWORD=your-admin-password

# Stock Data Sources
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key
KIS_APP_KEY=your-kis-app-key
KIS_APP_SECRET=your-kis-app-secret

# Crawler Configuration
CRAWLER_USER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
CRAWLER_TIMEOUT=30000
USE_PROXY=true
PROXY_LIST=/app/config/proxies.txt

# Redis (for caching)
REDIS_URL=redis://redis:6379

# Monitoring
SENTRY_DSN=your-sentry-dsn-if-using
LOG_LEVEL=info

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EOF

# Set proper permissions
chmod 600 ~/mathematical-economics/config/.env.production
```

### 2. Create Docker Environment Override

```bash
# Create docker-compose.production.yml
cat > ~/mathematical-economics/docker-compose.production.yml <<EOF
version: '3.8'

services:
  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: \${POSTGRES_USER}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
      POSTGRES_DB: \${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    env_file:
      - ./config/.env.production
    ports:
      - "5000:5000"
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./backend/logs:/app/logs
      - ./config/proxies.txt:/app/config/proxies.txt:ro
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - VITE_API_URL=https://your-domain.com/api
    restart: always
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - app-network

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge
EOF
```

## Database Setup and Migration

### 1. Initialize Database

```bash
# Clone the repository
cd ~
git clone https://github.com/your-repo/mathematical-economics.git
cd mathematical-economics

# Copy environment files
cp ~/mathematical-economics/config/.env.production ./backend/.env

# Build and start only the database
docker-compose -f docker-compose.production.yml up -d db

# Wait for database to be ready
sleep 10

# Run migrations
docker-compose -f docker-compose.production.yml run --rm backend npm run prisma:migrate

# Seed initial data
docker-compose -f docker-compose.production.yml run --rm backend npm run prisma:seed

# Create admin user
docker-compose -f docker-compose.production.yml run --rm backend npm run create:admin
```

### 2. Backup Strategy

```bash
# Create backup script
cat > ~/backup-database.sh <<'EOF'
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="mathematical_economics"

mkdir -p $BACKUP_DIR

# Backup database
docker-compose -f ~/mathematical-economics/docker-compose.production.yml exec -T db \
  pg_dump -U appuser $DB_NAME | gzip > $BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: db_backup_$TIMESTAMP.sql.gz"
EOF

chmod +x ~/backup-database.sh

# Add to crontab for daily backups
(crontab -l 2>/dev/null; echo "0 2 * * * /home/ubuntu/backup-database.sh") | crontab -
```

## Crawler Configuration for Overseas Servers

### 1. Proxy Configuration

```bash
# Create proxy list for Korean stock data access
cat > ~/mathematical-economics/config/proxies.txt <<EOF
# Format: protocol://username:password@host:port
# Add your proxy servers here
socks5://user:pass@proxy1.example.com:1080
http://user:pass@proxy2.example.com:8080
EOF

# Set permissions
chmod 600 ~/mathematical-economics/config/proxies.txt
```

### 2. Enhanced Crawler Setup

```bash
# Install Python dependencies for crawlers
cd ~/mathematical-economics/backend
python3 -m venv venv
source venv/bin/activate
pip install -r scripts/requirements.txt

# Install additional packages for overseas access
pip install \
    cloudscraper \
    fake-useragent \
    pysocks \
    requests[socks] \
    selenium-wire

# Install Chrome for headless browsing
wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
sudo apt update
sudo apt install -y google-chrome-stable

# Install ChromeDriver
CHROME_VERSION=$(google-chrome --version | grep -oP '\d+\.\d+\.\d+')
wget https://chromedriver.storage.googleapis.com/LATEST_RELEASE_${CHROME_VERSION%%.*} -O chromedriver_version
CHROMEDRIVER_VERSION=$(cat chromedriver_version)
wget https://chromedriver.storage.googleapis.com/$CHROMEDRIVER_VERSION/chromedriver_linux64.zip
unzip chromedriver_linux64.zip
sudo mv chromedriver /usr/local/bin/
sudo chmod +x /usr/local/bin/chromedriver
```

### 3. Crawler Service Configuration

```bash
# Create systemd service for crawler
sudo tee /etc/systemd/system/stock-crawler.service <<EOF
[Unit]
Description=Stock Price Crawler Service
After=network.target docker.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/mathematical-economics/backend
Environment="PATH=/home/ubuntu/mathematical-economics/backend/venv/bin:/usr/local/bin:/usr/bin:/bin"
ExecStart=/home/ubuntu/mathematical-economics/backend/venv/bin/python scripts/crawler_service.py
Restart=always
RestartSec=30

[Install]
WantedBy=multi-user.target
EOF

# Create crawler service script
cat > ~/mathematical-economics/backend/scripts/crawler_service.py <<'EOF'
#!/usr/bin/env python3
import time
import schedule
import subprocess
import logging
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/home/ubuntu/mathematical-economics/backend/logs/crawler.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

def run_crawler():
    """Run the stock price crawler"""
    try:
        logger.info("Starting stock price update...")
        
        # Run the multi-source crawler
        result = subprocess.run([
            'python3', 
            '/home/ubuntu/mathematical-economics/backend/scripts/multi_finance_crawler.py'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            logger.info("Stock price update completed successfully")
        else:
            logger.error(f"Crawler failed: {result.stderr}")
            
    except Exception as e:
        logger.error(f"Error running crawler: {e}")

def main():
    logger.info("Crawler service started")
    
    # Schedule crawler runs
    # Run every 30 minutes during market hours (9:00 - 15:30 KST)
    for hour in range(9, 16):
        for minute in [0, 30]:
            if hour == 15 and minute == 30:
                continue
            schedule.every().day.at(f"{hour:02d}:{minute:02d}").do(run_crawler)
    
    # Run once at startup
    run_crawler()
    
    while True:
        schedule.run_pending()
        time.sleep(60)

if __name__ == "__main__":
    main()
EOF

# Enable and start the service
sudo systemctl enable stock-crawler.service
sudo systemctl start stock-crawler.service
```

## Monitoring and Logging Setup

### 1. Application Monitoring

```bash
# Install monitoring tools
sudo apt install -y prometheus node-exporter grafana

# Configure Prometheus
sudo tee /etc/prometheus/prometheus.yml <<EOF
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'node'
    static_configs:
      - targets: ['localhost:9100']
  
  - job_name: 'docker'
    static_configs:
      - targets: ['localhost:9323']
  
  - job_name: 'backend'
    static_configs:
      - targets: ['localhost:5000']
EOF

# Enable services
sudo systemctl enable prometheus node-exporter grafana-server
sudo systemctl start prometheus node-exporter grafana-server
```

### 2. Log Management

```bash
# Install log rotation
sudo apt install -y logrotate

# Configure log rotation for application logs
sudo tee /etc/logrotate.d/mathematical-economics <<EOF
/home/ubuntu/mathematical-economics/backend/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 ubuntu ubuntu
    sharedscripts
    postrotate
        docker-compose -f /home/ubuntu/mathematical-economics/docker-compose.production.yml restart backend
    endscript
}
EOF

# Create CloudWatch agent configuration (if using AWS CloudWatch)
cat > ~/amazon-cloudwatch-agent.json <<EOF
{
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/home/ubuntu/mathematical-economics/backend/logs/combined.log",
            "log_group_name": "/aws/ec2/mathematical-economics",
            "log_stream_name": "{instance_id}/backend"
          },
          {
            "file_path": "/var/log/nginx/access.log",
            "log_group_name": "/aws/ec2/mathematical-economics",
            "log_stream_name": "{instance_id}/nginx-access"
          }
        ]
      }
    }
  }
}
EOF
```

### 3. Health Checks

```bash
# Create health check script
cat > ~/health-check.sh <<'EOF'
#!/bin/bash

# Check Docker services
if ! docker-compose -f ~/mathematical-economics/docker-compose.production.yml ps | grep -q "Up"; then
    echo "Docker services are down!"
    docker-compose -f ~/mathematical-economics/docker-compose.production.yml up -d
fi

# Check Nginx
if ! systemctl is-active --quiet nginx; then
    echo "Nginx is down!"
    sudo systemctl start nginx
fi

# Check API endpoint
if ! curl -sf http://localhost:5000/health > /dev/null; then
    echo "Backend API is not responding!"
    docker-compose -f ~/mathematical-economics/docker-compose.production.yml restart backend
fi

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "Disk usage is above 80%!"
    # Clean up Docker
    docker system prune -af
fi
EOF

chmod +x ~/health-check.sh

# Add to crontab
(crontab -l 2>/dev/null; echo "*/5 * * * * /home/ubuntu/health-check.sh >> /home/ubuntu/health-check.log 2>&1") | crontab -
```

## Deployment Process

### 1. Initial Deployment

```bash
# Clone repository
cd ~
git clone https://github.com/your-repo/mathematical-economics.git
cd mathematical-economics

# Copy configuration files
cp ~/mathematical-economics/config/.env.production ./backend/.env
cp ~/mathematical-economics/config/proxies.txt ./config/

# Build and start all services
docker-compose -f docker-compose.production.yml build
docker-compose -f docker-compose.production.yml up -d

# Check logs
docker-compose -f docker-compose.production.yml logs -f
```

### 2. Update Deployment Script

```bash
# Create deployment script
cat > ~/deploy.sh <<'EOF'
#!/bin/bash
set -e

cd ~/mathematical-economics

# Pull latest changes
git pull origin main

# Backup database before deployment
~/backup-database.sh

# Build and deploy
docker-compose -f docker-compose.production.yml build
docker-compose -f docker-compose.production.yml up -d

# Run migrations
docker-compose -f docker-compose.production.yml run --rm backend npm run prisma:migrate

# Restart services
docker-compose -f docker-compose.production.yml restart

# Clean up
docker system prune -f

echo "Deployment completed successfully!"
EOF

chmod +x ~/deploy.sh
```

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. Docker Services Won't Start

```bash
# Check Docker logs
docker-compose -f docker-compose.production.yml logs

# Check system resources
free -h
df -h
htop

# Restart Docker
sudo systemctl restart docker

# Clean up Docker resources
docker system prune -af
docker volume prune -f
```

#### 2. Database Connection Issues

```bash
# Check database status
docker-compose -f docker-compose.production.yml exec db pg_isready

# Check database logs
docker-compose -f docker-compose.production.yml logs db

# Manually connect to database
docker-compose -f docker-compose.production.yml exec db psql -U appuser -d mathematical_economics

# Reset database if needed
docker-compose -f docker-compose.production.yml down -v
docker-compose -f docker-compose.production.yml up -d
```

#### 3. Crawler Not Working

```bash
# Check crawler logs
tail -f ~/mathematical-economics/backend/logs/crawler.log

# Test crawler manually
cd ~/mathematical-economics/backend
source venv/bin/activate
python scripts/public_api_crawler.py 005930

# Check proxy connectivity
curl -x socks5://user:pass@proxy:port https://finance.naver.com

# Update crawler dependencies
pip install -U -r scripts/requirements.txt
```

#### 4. SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Check Nginx configuration
sudo nginx -t
sudo systemctl reload nginx
```

#### 5. High Memory Usage

```bash
# Check memory usage by container
docker stats

# Limit container memory
# Add to docker-compose.production.yml:
# deploy:
#   resources:
#     limits:
#       memory: 2g

# Enable swap if needed
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Performance Optimization

#### 1. Database Optimization

```bash
# Connect to database
docker-compose -f docker-compose.production.yml exec db psql -U appuser -d mathematical_economics

-- Add indexes for common queries
CREATE INDEX idx_stock_prices_symbol_timestamp ON stock_prices(symbol, timestamp DESC);
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_transactions_portfolio_id ON transactions(portfolio_id);

-- Analyze tables
ANALYZE;
```

#### 2. Redis Caching

```bash
# Configure Redis for stock prices
# Add to backend code:
# Cache stock prices for 5 minutes
# Cache user portfolios for 1 minute
```

#### 3. CDN Setup (Optional)

```bash
# Configure CloudFront or similar CDN for static assets
# Update frontend build to use CDN URLs
```

## Maintenance and Updates

### Regular Maintenance Tasks

```bash
# Weekly tasks
- Review logs for errors
- Check disk usage
- Update security patches
- Review crawler performance

# Monthly tasks
- Update dependencies
- Review database performance
- Clean up old logs and backups
- Security audit

# Quarterly tasks
- Major version updates
- Performance review
- Disaster recovery test
```

### Security Best Practices

1. **Keep Systems Updated**
   ```bash
   sudo apt update && sudo apt upgrade -y
   docker-compose pull
   ```

2. **Monitor Access Logs**
   ```bash
   tail -f /var/log/nginx/access.log
   fail2ban-client status
   ```

3. **Regular Security Scans**
   ```bash
   # Install security tools
   sudo apt install -y lynis rkhunter
   
   # Run security audit
   sudo lynis audit system
   ```

4. **Backup Verification**
   ```bash
   # Test restore process monthly
   # Document restore procedures
   ```

## Conclusion

This guide provides a comprehensive approach to deploying the Mathematical Economics platform on EC2. Key points to remember:

1. Always test changes in a staging environment first
2. Monitor logs and metrics regularly
3. Keep backups current and test restore procedures
4. Document any custom configurations or changes
5. Maintain security updates and patches

For additional support or questions, refer to the project documentation or contact the development team.