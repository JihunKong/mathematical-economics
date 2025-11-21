#!/bin/bash

# One-Click Deployment Script for t3.small EC2 Instance
# Domain: 경제교실.com
# Optimized for 5 concurrent users with 60 curated stocks

set -e  # Exit on error

echo "================================================================="
echo "   경제수학 모의주식 투자 앱 - EC2 배포 스크립트"
echo "   Optimized for t3.small (2GB RAM, 2 vCPU)"
echo "================================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}❌ Please run as root (use sudo)${NC}"
  exit 1
fi

# 1. System Update
echo -e "${GREEN}📦 Step 1: Updating system packages...${NC}"
apt-get update
apt-get upgrade -y

# 2. Install Docker
echo -e "${GREEN}🐳 Step 2: Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com -o get-docker.sh
  sh get-docker.sh
  usermod -aG docker ubuntu
  rm get-docker.sh
  echo -e "${GREEN}✅ Docker installed${NC}"
else
  echo -e "${YELLOW}ℹ️  Docker already installed${NC}"
fi

# 3. Install Docker Compose
echo -e "${GREEN}🔧 Step 3: Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
  curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  chmod +x /usr/local/bin/docker-compose
  echo -e "${GREEN}✅ Docker Compose installed${NC}"
else
  echo -e "${YELLOW}ℹ️  Docker Compose already installed${NC}"
fi

# 4. Install Python3 and pip
echo -e "${GREEN}🐍 Step 4: Installing Python3...${NC}"
apt-get install -y python3 python3-pip python3-venv

# 5. Install Git
echo -e "${GREEN}📂 Step 5: Installing Git...${NC}"
apt-get install -y git

# 6. Create swap file (2GB) for safety
echo -e "${GREEN}💾 Step 6: Creating 2GB swap file...${NC}"
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
  echo -e "${GREEN}✅ Swap file created${NC}"
else
  echo -e "${YELLOW}ℹ️  Swap file already exists${NC}"
fi

# 7. Clone repository
echo -e "${GREEN}📥 Step 7: Cloning repository...${NC}"
cd /home/ubuntu
if [ -d "mathematical-economics" ]; then
  echo -e "${YELLOW}ℹ️  Repository already exists, pulling latest changes...${NC}"
  cd mathematical-economics
  git pull
else
  # Replace with your actual repository URL
  echo -e "${RED}⚠️  Please enter your Git repository URL:${NC}"
  read -p "Repository URL: " REPO_URL
  git clone "$REPO_URL" mathematical-economics
  cd mathematical-economics
fi

# 8. Generate JWT secret
echo -e "${GREEN}🔐 Step 8: Generating JWT secret...${NC}"
JWT_SECRET=$(openssl rand -base64 32)
echo "JWT_SECRET generated: $JWT_SECRET"

# 9. Copy environment file
echo -e "${GREEN}⚙️  Step 9: Setting up environment variables...${NC}"
cp .env.t3small .env.production
sed -i "s/<GENERATE_SECURE_KEY_HERE>/$JWT_SECRET/g" .env.production
echo -e "${GREEN}✅ Environment variables configured${NC}"

# 10. Create required directories
echo -e "${GREEN}📁 Step 10: Creating required directories...${NC}"
mkdir -p certbot/conf certbot/www nginx/logs backend/logs

# 11. Build and start containers
echo -e "${GREEN}🚀 Step 11: Building and starting Docker containers...${NC}"
docker-compose -f docker-compose.t3small.yml build
docker-compose -f docker-compose.t3small.yml up -d

# 12. Wait for database to be ready
echo -e "${GREEN}⏳ Step 12: Waiting for database to be ready...${NC}"
sleep 20

# 13. Run database migrations
echo -e "${GREEN}🗄️  Step 13: Running database migrations...${NC}"
docker exec math-economics-backend npx prisma migrate deploy

# 14. Import curated stocks
echo -e "${GREEN}📊 Step 14: Importing 60 curated stocks...${NC}"
docker exec math-economics-backend npm run import:curated

# 15. Clean up database
echo -e "${GREEN}🧹 Step 15: Cleaning up database...${NC}"
docker exec math-economics-backend npm run cleanup:db

# 16. SSL Certificate Setup
echo -e "${GREEN}🔒 Step 16: Setting up SSL certificate...${NC}"
echo -e "${YELLOW}⚠️  SSL certificate setup requires manual steps:${NC}"
echo ""
echo "1. First, point your domain (경제교실.com) to this server's Elastic IP"
echo "2. Then run the following command:"
echo ""
echo "   docker run -it --rm -v \$(pwd)/certbot/conf:/etc/letsencrypt -v \$(pwd)/certbot/www:/var/www/certbot certbot/certbot certonly --webroot -w /var/www/certbot -d xn--289aykm66cwye.com -d www.xn--289aykm66cwye.com --email your-email@example.com --agree-tos --no-eff-email"
echo ""
echo "3. After getting the certificate, restart nginx:"
echo "   docker-compose -f docker-compose.t3small.yml restart nginx"
echo ""

# 17. Display status
echo ""
echo "================================================================="
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo "================================================================="
echo ""
echo "📊 System Status:"
docker-compose -f docker-compose.t3small.yml ps
echo ""
echo "🌐 Access Points:"
echo "  - HTTP:  http://$(curl -s ifconfig.me)"
echo "  - HTTPS: https://경제교실.com (after SSL setup)"
echo ""
echo "🔍 Useful Commands:"
echo "  - View logs:       docker-compose -f docker-compose.t3small.yml logs -f"
echo "  - Restart:         docker-compose -f docker-compose.t3small.yml restart"
echo "  - Stop:            docker-compose -f docker-compose.t3small.yml down"
echo "  - Database shell:  docker exec -it math-economics-postgres psql -U mathuser -d mathematical_economics"
echo ""
echo "📈 Monitoring:"
echo "  - Health check:    curl http://localhost/health"
echo "  - Backend logs:    docker logs math-economics-backend -f"
echo "  - Nginx logs:      docker logs math-economics-nginx -f"
echo ""
echo "💡 Next Steps:"
echo "  1. Connect Elastic IP to this instance"
echo "  2. Point 경제교실.com to the Elastic IP"
echo "  3. Run SSL certificate setup (see instructions above)"
echo "  4. Create admin/teacher accounts"
echo "  5. Test the application"
echo ""
echo "================================================================="
