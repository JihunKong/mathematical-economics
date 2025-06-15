#!/bin/bash

# Quick fix script to create teacher account directly on EC2

echo "Creating teacher account on EC2..."

# Docker exec command to run inside the backend container
docker exec -it math-econ-backend npx ts-node -e "
const { PrismaClient, UserRole } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTeacher() {
  try {
    const email = 'teacher@matheconomics.com';
    const password = 'Teacher123!';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const existing = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existing) {
      console.log('Teacher already exists');
      return;
    }
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: '김선생님',
        role: UserRole.TEACHER,
        isActive: true,
        initialCapital: 0,
        currentCash: 0
      }
    });
    
    await prisma.portfolio.create({
      data: {
        userId: user.id,
        totalValue: 0,
        totalCost: 0,
        totalProfitLoss: 0,
        totalProfitLossPercent: 0
      }
    });
    
    console.log('Teacher created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.\$disconnect();
  }
}

createTeacher();
"

echo "Done!"