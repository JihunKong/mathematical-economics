import { PrismaClient } from '@prisma/client';
import { logger } from '../src/utils/logger';

const prisma = new PrismaClient();

async function migrateDatabase() {
  try {
    logger.info('Starting database migration...');

    // Check if columns already exist
    const result = await prisma.$queryRaw<any[]>`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Stock' 
      AND column_name IN ('nameEn', 'shortName')
    `;

    const existingColumns = result.map(r => r.column_name);
    logger.info(`Existing columns: ${existingColumns.join(', ')}`);

    // Add missing columns
    if (!existingColumns.includes('nameEn')) {
      logger.info('Adding nameEn column...');
      await prisma.$executeRaw`ALTER TABLE "Stock" ADD COLUMN "nameEn" TEXT`;
      logger.info('nameEn column added successfully');
    }

    if (!existingColumns.includes('shortName')) {
      logger.info('Adding shortName column...');
      await prisma.$executeRaw`ALTER TABLE "Stock" ADD COLUMN "shortName" TEXT`;
      logger.info('shortName column added successfully');
    }

    // Update existing stocks with default values
    logger.info('Updating existing stocks with default values...');
    const stocks = await prisma.stock.findMany({
      where: {
        OR: [
          { nameEn: null },
          { shortName: null }
        ]
      }
    });

    for (const stock of stocks) {
      await prisma.stock.update({
        where: { id: stock.id },
        data: {
          nameEn: stock.nameEn || stock.name, // Use Korean name as fallback
          shortName: stock.shortName || stock.name.substring(0, 10) // First 10 chars as short name
        }
      });
    }

    logger.info(`Updated ${stocks.length} stocks with default values`);
    logger.info('Database migration completed successfully');

  } catch (error) {
    logger.error('Database migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateDatabase().catch(error => {
  console.error('Migration error:', error);
  process.exit(1);
});