#!/bin/bash

echo "🔧 EC2 Git Conflicts and YAML Fix"
echo "================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Run these commands on EC2:${NC}"
echo ""

echo -e "${YELLOW}1. Connect to EC2${NC}"
echo "ssh ubuntu@43.203.121.32"
echo ""

echo -e "${YELLOW}2. Navigate to project${NC}"
echo "cd /home/ubuntu/mathematical-economics"
echo ""

echo -e "${YELLOW}3. Check git status${NC}"
echo "git status"
echo ""

echo -e "${YELLOW}4. Reset local changes (this will discard local modifications)${NC}"
echo "git reset --hard HEAD"
echo "git clean -fd"
echo ""

echo -e "${YELLOW}5. Pull latest changes${NC}"
echo "git pull origin main"
echo ""

echo -e "${YELLOW}Alternative: If you want to keep local changes${NC}"
echo "# Stash local changes"
echo "git stash"
echo "# Pull latest"
echo "git pull origin main"
echo "# Apply stashed changes"
echo "git stash pop"
echo ""

echo -e "${YELLOW}6. Manually fix docker-compose.prod.yml if needed${NC}"
echo "# Edit the file"
echo "nano docker-compose.prod.yml"
echo ""
echo "# Find lines 71-73 and change from:"
echo "#      args:"
echo "#        VITE_API_URL: /api"
echo "#        VITE_SOCKET_URL: /"
echo ""
echo "# To:"
echo "#      args:"
echo "#        - VITE_API_URL=/api"
echo "#        - VITE_SOCKET_URL=/"
echo ""

echo -e "${YELLOW}7. After fixing, restart containers${NC}"
echo "sudo docker compose -f docker-compose.prod.yml down"
echo "sudo docker compose -f docker-compose.prod.yml up -d --build"
echo ""

echo -e "${YELLOW}8. Check container status${NC}"
echo "sudo docker compose -f docker-compose.prod.yml ps"
echo ""

echo -e "${YELLOW}9. Check logs if backend is unhealthy${NC}"
echo "sudo docker compose -f docker-compose.prod.yml logs --tail=50 backend"
echo ""

echo -e "${GREEN}✅ After fixing, continue with CSV import${NC}"