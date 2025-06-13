const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function testFullLogin() {
  const prisma = new PrismaClient();
  
  try {
    console.log('1. Finding user...');
    const user = await prisma.user.findUnique({
      where: { email: 'teacher@example.com' },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
        classId: true,
        isActive: true,
      }
    });
    console.log('2. User found:', !!user);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    console.log('3. Comparing password...');
    const isValid = await bcrypt.compare('password123', user.password);
    console.log('4. Password valid:', isValid);
    
    if (!isValid) {
      throw new Error('Invalid password');
    }
    
    console.log('5. Generating token...');
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    
    const token = jwt.sign(payload, 'your_jwt_secret_here_change_this_in_production', {
      expiresIn: '7d',
      algorithm: 'HS256',
    });
    console.log('6. Token generated:', !!token);
    console.log('Token preview:', token.substring(0, 50) + '...');
    
    const { password: _, ...userWithoutPassword } = user;
    console.log('7. Success! User:', userWithoutPassword.email);
    
  } catch (error) {
    console.error('ERROR:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testFullLogin();