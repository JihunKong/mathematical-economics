#!/bin/bash

echo "=== Checking port usage ==="

echo -e "\n📍 Port 80 (HTTP):"
sudo lsof -i :80 || sudo netstat -tlnp | grep :80

echo -e "\n📍 Port 443 (HTTPS):"
sudo lsof -i :443 || sudo netstat -tlnp | grep :443

echo -e "\n📍 Port 3000:"
sudo lsof -i :3000 || sudo netstat -tlnp | grep :3000

echo -e "\n📍 Port 5000:"
sudo lsof -i :5000 || sudo netstat -tlnp | grep :5000

echo -e "\n🐳 Docker containers using ports:"
docker ps --format "table {{.Names}}\t{{.Ports}}"

echo -e "\n💡 To stop system nginx if running:"
echo "sudo systemctl stop nginx"
echo "sudo systemctl disable nginx"

echo -e "\n💡 To stop all Docker containers:"
echo "docker stop \$(docker ps -aq)"