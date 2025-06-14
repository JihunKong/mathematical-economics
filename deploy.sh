#!/bin/bash

# 라이트세일 배포 스크립트
# 이 스크립트는 라이트세일 서버에서 실행됩니다

echo "🚀 Starting deployment process..."

# 1. Git pull
echo "📥 Pulling latest changes..."
git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ Git pull failed"
    exit 1
fi

# 2. Backend setup
echo "🔧 Setting up backend..."
cd backend

echo "📦 Installing backend dependencies..."
npm install

echo "🔄 Generating Prisma client..."
npx prisma generate

echo "🗄️ Running database migrations..."
npx prisma migrate deploy

echo "🏗️ Building backend..."
npm run build

# 3. Frontend setup
echo "🎨 Setting up frontend..."
cd ../frontend

echo "📦 Installing frontend dependencies..."
npm install

echo "🏗️ Building frontend..."
npm run build

# 4. Restart services
echo "🔄 Restarting services..."
cd ../backend

# Check if PM2 is being used
if command -v pm2 &> /dev/null; then
    echo "🔄 Restarting with PM2..."
    pm2 restart all
    pm2 save
else
    echo "⚠️ PM2 not found. Please restart your Node.js process manually."
fi

echo "✅ Deployment completed!"
echo "📊 Check logs with: pm2 logs"

# 5. Create admin account if needed
echo ""
echo "💡 To create admin account (first time only), run:"
echo "cd backend && npx ts-node scripts/createAdmin.ts"