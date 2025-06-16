#!/bin/bash

echo "🔍 Debugging Class Creation 500 Error..."

# 1. Check if admin user exists and get ID
echo "1️⃣ Checking admin user..."
sudo docker compose -f docker-compose.prod.yml exec postgres psql -U matheconomy -d economic_math_stock_db -c "SELECT id, email, role FROM \"User\" WHERE email='purusil55@gmail.com';"

# 2. Check Class table structure
echo "2️⃣ Checking Class table structure..."
sudo docker compose -f docker-compose.prod.yml exec postgres psql -U matheconomy -d economic_math_stock_db -c "\d \"Class\""

# 3. Test class creation directly in database
echo "3️⃣ Testing direct class creation..."
sudo docker compose -f docker-compose.prod.yml exec backend node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    // Get admin user
    const admin = await prisma.user.findUnique({
      where: { email: 'purusil55@gmail.com' }
    });
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      return;
    }
    
    console.log('✅ Admin found:', admin.id);
    
    // Try to create a class
    const testClass = await prisma.class.create({
      data: {
        name: 'Debug Test Class',
        code: 'TEST' + Date.now().toString().slice(-6),
        teacherId: admin.id,
        startDate: new Date()
      }
    });
    
    console.log('✅ Class created:', testClass);
    
  } catch (error) {
    console.error('❌ Error creating class:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.\$disconnect();
  }
})();
"

# 4. Check backend logs for specific errors
echo "4️⃣ Checking recent error logs..."
sudo docker compose -f docker-compose.prod.yml logs --tail=200 backend | grep -E "teacher/classes|500|Error:|error:" | tail -20

# 5. Check Prisma client generation
echo "5️⃣ Regenerating Prisma client..."
sudo docker compose -f docker-compose.prod.yml exec backend npx prisma generate

# 6. Test API endpoint with curl
echo "6️⃣ Testing API endpoint..."
# First get token
TOKEN=$(sudo docker compose -f docker-compose.prod.yml exec backend node -e "
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { id: 'test', email: 'purusil55@gmail.com', role: 'ADMIN' },
  process.env.JWT_SECRET || 'your-jwt-secret-key-here',
  { expiresIn: '7d' }
);
console.log(token);
" | tr -d '\r\n')

echo "Token: ${TOKEN:0:20}..."

# Test the API
curl -X POST http://localhost:5001/api/teacher/classes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"API Test Class","startDate":"2025-06-15T00:00:00.000Z"}' \
  -v