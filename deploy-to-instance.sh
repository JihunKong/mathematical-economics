#!/bin/bash

# Deploy to EC2 Instance Script
# This script copies files to EC2 and runs the deployment

set -e

INSTANCE_IP="43.200.26.83"
PEM_KEY="mathematical-economics-new.pem"
REMOTE_USER="ubuntu"
PROJECT_DIR="/home/ubuntu/mathematical-economics"

echo "============================================"
echo "  경제수학 모의주식 투자 앱 - EC2 배포"
echo "============================================"
echo ""
echo "📍 Target: $INSTANCE_IP"
echo "🔑 Key: $PEM_KEY"
echo ""

# Wait for SSH to be ready
echo "⏳ Waiting for SSH to be ready..."
for i in {1..30}; do
  if ssh -i $PEM_KEY -o StrictHostKeyChecking=no -o ConnectTimeout=5 $REMOTE_USER@$INSTANCE_IP "echo 'SSH Ready'" 2>/dev/null; then
    echo "✅ SSH is ready!"
    break
  fi
  echo "  Attempt $i/30: Waiting..."
  sleep 10
done

# Copy files to instance
echo ""
echo "📦 Copying files to instance..."
ssh -i $PEM_KEY $REMOTE_USER@$INSTANCE_IP "mkdir -p $PROJECT_DIR"

# Copy essential files
rsync -avz -e "ssh -i $PEM_KEY" \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.DS_Store' \
  --exclude 'copyright-submission' \
  --exclude 'backend/logs' \
  --exclude 'backend/dist' \
  --exclude 'frontend/dist' \
  --exclude 'backend.log' \
  --exclude 'data_*.csv' \
  --exclude '*.pem' \
  --exclude 'clean-code-for-copyright.js' \
  ./ $REMOTE_USER@$INSTANCE_IP:$PROJECT_DIR/

echo "✅ Files copied!"

# Create deployment script on remote
echo ""
echo "🚀 Running deployment on instance..."
ssh -i $PEM_KEY $REMOTE_USER@$INSTANCE_IP "bash -s" << 'ENDSSH'
#!/bin/bash
set -e

cd /home/ubuntu/mathematical-economics

echo "============================================"
echo "  Starting Deployment on EC2 Instance"
echo "============================================"
echo ""

# Update system
echo "📦 Updating system packages..."
sudo apt-get update -qq

# Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  sudo usermod -aG docker ubuntu
  rm get-docker.sh
  echo "✅ Docker installed"
else
  echo "ℹ️  Docker already installed"
fi

# Install Docker Compose
echo "🔧 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
  sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
  echo "✅ Docker Compose installed"
else
  echo "ℹ️  Docker Compose already installed"
fi

# Install Python3
echo "🐍 Installing Python3..."
sudo apt-get install -y python3 python3-pip

# Install Git
echo "📂 Installing Git..."
sudo apt-get install -y git

# Create swap file (2GB)
echo "💾 Creating swap file..."
if [ ! -f /swapfile ]; then
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  echo "✅ Swap file created"
else
  echo "ℹ️  Swap file already exists"
fi

# Generate JWT secret
echo "🔐 Generating JWT secret..."
JWT_SECRET=$(openssl rand -base64 32)
echo "JWT_SECRET=$JWT_SECRET"

# Setup environment variables
echo "⚙️  Setting up environment variables..."
cp .env.t3small .env.production
sed -i "s/<GENERATE_SECURE_KEY_HERE>/$JWT_SECRET/g" .env.production

# Create required directories
echo "📁 Creating required directories..."
mkdir -p certbot/conf certbot/www nginx/logs backend/logs backend/data frontend/dist

# Pull Docker images from Docker Hub
echo "📥 Pulling Docker images from Docker Hub..."
sudo docker pull jihunkong/math-economics-backend:latest
sudo docker pull jihunkong/math-economics-frontend:latest

# Extract frontend dist folder from image
echo "📦 Extracting frontend files..."
sudo docker create --name temp-frontend jihunkong/math-economics-frontend:latest
sudo docker cp temp-frontend:/app/dist/. ./frontend/dist/
sudo docker rm temp-frontend

echo "🚀 Starting Docker containers..."
sudo docker compose -f docker-compose.t3small.yml up -d

# Wait for database
echo "⏳ Waiting for database to be ready..."
sleep 30

# Run Prisma migrations
echo "🗄️  Running database migrations..."
sudo docker exec math-economics-backend npx prisma migrate deploy

# Run seed data to create teacher accounts and sample data
echo "👥 Running seed data..."
sudo docker exec math-economics-backend npm run prisma:seed

# Import curated stocks
echo "📊 Importing curated stocks..."
sudo docker exec math-economics-backend npm run import:curated

echo ""
echo "============================================"
echo "✅ Deployment completed successfully!"
echo "============================================"
echo ""
echo "📊 Container Status:"
sudo docker-compose -f docker-compose.t3small.yml ps
echo ""
echo "🌐 Access Points:"
echo "  - HTTP:  http://43.200.26.83"
echo "  - HTTPS: https://경제교실.com (after DNS and SSL setup)"
echo ""
echo "💡 Next Steps:"
echo "  1. Point 경제교실.com DNS to 43.200.26.83"
echo "  2. Wait for DNS propagation (5-30 minutes)"
echo "  3. Run SSL certificate setup"
echo ""

ENDSSH

echo ""
echo "============================================"
echo "✅ Remote deployment completed!"
echo "============================================"
echo ""
echo "🌐 Your app is now accessible at:"
echo "   http://43.200.26.83"
echo ""
echo "📝 Elastic IP: 43.200.26.83"
echo ""
echo "💡 Don't forget to:"
echo "   1. Point 경제교실.com to 43.200.26.83"
echo "   2. Setup SSL certificate after DNS propagation"
echo ""
