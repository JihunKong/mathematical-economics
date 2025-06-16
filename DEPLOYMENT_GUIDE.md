# Deployment Guide for Mathematical Economics App

## Prerequisites
- Server IP: 3.36.116.11
- SSH Key: `/Users/jihunkong/Downloads/LightsailDefaultKey-ap-northeast-2 (9).pem`
- Username: ubuntu

## Troubleshooting Connection Issues

If you cannot connect via SSH, check:

1. **AWS Lightsail Console**:
   - Ensure instance is running
   - Verify the public IP address
   - Check networking → Firewall rules → Ensure port 22 is open

2. **Try connecting from Lightsail console**:
   - Use the browser-based SSH client in Lightsail console as a backup

## Manual Setup Steps

### 1. Connect to Server
```bash
ssh -i "/Users/jihunkong/Downloads/LightsailDefaultKey-ap-northeast-2 (9).pem" ubuntu@3.36.116.11
```

### 2. Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 3. Install Docker
```bash
# Download and run Docker installation script
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Log out and back in, or run:
newgrp docker

# Verify Docker installation
docker --version
```

### 4. Install Docker Compose
```bash
sudo apt install docker-compose -y
docker-compose --version
```

### 5. Clone Repository
```bash
cd ~
git clone https://github.com/JihunKong/mathematical-economics.git
cd mathematical-economics
```

### 6. Create Environment Files

Create `backend/.env.production`:
```bash
nano backend/.env.production
```

Add the following content (update with your actual values):
```env
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://postgres:your_secure_password@db:5432/math_econ_prod

# Redis
REDIS_URL=redis://redis:6379

# JWT
JWT_SECRET=your_production_jwt_secret_here
JWT_EXPIRES_IN=7d

# KIS API
KIS_APP_KEY=your_kis_app_key
KIS_APP_SECRET=your_kis_app_secret
KIS_BASE_URL=https://openapi.koreainvestment.com:9443
KIS_ACCOUNT_NO=your_account_number

# CORS
CORS_ORIGIN=http://3.36.116.11

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_admin_password
```

Create `frontend/.env.production`:
```bash
nano frontend/.env.production
```

Add:
```env
VITE_API_URL=http://3.36.116.11/api
VITE_WS_URL=ws://3.36.116.11
VITE_APP_NAME=경제수학 모의주식 투자
```

### 7. Build and Run Docker Containers
```bash
# Build and start all services
sudo docker-compose up -d --build

# Check container status
sudo docker ps

# View logs
sudo docker-compose logs -f
```

### 8. Import Data

First, upload your CSV files to the server:
```bash
# From your local machine
scp -i "/Users/jihunkong/Downloads/LightsailDefaultKey-ap-northeast-2 (9).pem" \
    /path/to/stocks.csv ubuntu@3.36.116.11:~/mathematical-economics/data/

scp -i "/Users/jihunkong/Downloads/LightsailDefaultKey-ap-northeast-2 (9).pem" \
    /path/to/students.csv ubuntu@3.36.116.11:~/mathematical-economics/data/
```

Then import the data:
```bash
# Import stocks
sudo docker exec -it mathematical-economics_backend_1 npm run import:stocks

# Import students
sudo docker exec -it mathematical-economics_backend_1 npm run import:students
```

### 9. Verify Installation
```bash
# Check backend health
curl http://localhost:3000/health

# Check if frontend is accessible
curl http://localhost:80

# From outside (your local machine)
curl http://3.36.116.11
```

### 10. Configure Firewall
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
sudo ufw status
```

## Post-Installation

### Monitor Application
```bash
# View all logs
sudo docker-compose logs -f

# View specific service logs
sudo docker-compose logs -f backend
sudo docker-compose logs -f frontend
sudo docker-compose logs -f db
```

### Useful Commands
```bash
# Stop all containers
sudo docker-compose down

# Restart all containers
sudo docker-compose restart

# Rebuild and restart
sudo docker-compose up -d --build

# Access backend container
sudo docker exec -it mathematical-economics_backend_1 bash

# Access database
sudo docker exec -it mathematical-economics_db_1 psql -U postgres
```

### Troubleshooting

1. **Port 80 in use**:
   ```bash
   sudo lsof -i :80
   sudo systemctl stop apache2  # if Apache is running
   ```

2. **Database connection issues**:
   ```bash
   # Check if database is running
   sudo docker-compose ps db
   
   # Check database logs
   sudo docker-compose logs db
   ```

3. **Frontend not loading**:
   - Check nginx logs: `sudo docker-compose logs nginx`
   - Verify frontend build: `sudo docker exec -it mathematical-economics_frontend_1 ls /usr/share/nginx/html`

## Security Recommendations

1. **Change default passwords** in .env.production
2. **Set up SSL certificate** using Let's Encrypt
3. **Regular backups**:
   ```bash
   # Backup database
   sudo docker exec mathematical-economics_db_1 pg_dump -U postgres math_econ_prod > backup.sql
   ```
4. **Monitor server resources**:
   ```bash
   htop
   df -h
   ```

## Next Steps

1. Access your application at: http://3.36.116.11
2. Log in with admin credentials
3. Test all features
4. Set up monitoring and alerts
5. Configure automated backups