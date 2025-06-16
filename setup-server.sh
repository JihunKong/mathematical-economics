#!/bin/bash

# Server setup script for mathematical economics app
# Run this after SSH-ing into the server

echo "Starting server setup..."

# 1. Update system packages
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# 2. Install Docker
echo "Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
rm get-docker.sh

# 3. Install Docker Compose
echo "Installing Docker Compose..."
sudo apt install docker-compose -y

# 4. Clone repository
echo "Cloning repository..."
cd ~
git clone https://github.com/JihunKong/mathematical-economics.git
cd mathematical-economics

# 5. Create production environment files
echo "Creating .env.production files..."

# Backend .env.production
cat > backend/.env.production << 'EOF'
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://postgres:your_secure_password@db:5432/math_econ_prod

# Redis
REDIS_URL=redis://redis:6379

# JWT
JWT_SECRET=your_production_jwt_secret_here
JWT_EXPIRES_IN=7d

# KIS API (Korean Investment Securities)
KIS_APP_KEY=your_kis_app_key
KIS_APP_SECRET=your_kis_app_secret
KIS_BASE_URL=https://openapi.koreainvestment.com:9443
KIS_ACCOUNT_NO=your_account_number

# CORS
CORS_ORIGIN=http://3.36.116.11

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_admin_password
EOF

# Frontend .env.production
cat > frontend/.env.production << 'EOF'
VITE_API_URL=http://3.36.116.11/api
VITE_WS_URL=ws://3.36.116.11
VITE_APP_NAME=경제수학 모의주식 투자
EOF

echo "Please edit the .env.production files with your actual credentials!"
echo "Pausing for you to update the files..."
read -p "Press enter when you've updated the .env files..."

# 6. Build and run Docker containers
echo "Building and starting Docker containers..."
sudo docker-compose -f docker-compose.yml up -d --build

# 7. Wait for services to be ready
echo "Waiting for services to start..."
sleep 30

# 8. Import CSV data
echo "Importing CSV data..."
# Check if CSV files exist
if [ -f "data/stocks.csv" ] && [ -f "data/students.csv" ]; then
    # Import stocks data
    sudo docker exec -it mathematical-economics_backend_1 npm run import:stocks
    
    # Import students data
    sudo docker exec -it mathematical-economics_backend_1 npm run import:students
else
    echo "CSV files not found in data/ directory. Please add them and run import manually."
fi

# 9. Verify installation
echo "Verifying installation..."
echo "Checking Docker containers..."
sudo docker ps

echo "Checking backend health..."
curl -f http://localhost:3000/health || echo "Backend health check failed"

echo "Checking frontend..."
curl -f http://localhost:80 || echo "Frontend check failed"

# 10. Setup firewall (optional but recommended)
echo "Setting up firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

echo "Setup complete!"
echo "Access your application at: http://3.36.116.11"
echo ""
echo "Important next steps:"
echo "1. Update the .env.production files with your actual credentials"
echo "2. Set up SSL certificate for HTTPS (recommended)"
echo "3. Configure regular backups"
echo "4. Monitor logs: sudo docker-compose logs -f"