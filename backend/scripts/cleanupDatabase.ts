import { PrismaClient } from '@prisma/client';
import { logger } from '../src/utils/logger';

const prisma = new PrismaClient();

/**
 * Database Cleanup Script for t3.small Optimization
 *
 * This script:
 * 1. Removes non-curated stocks (stocks without educationalPriority)
 * 2. Cleans up old price history (older than 3 days)
 * 3. Removes orphaned data (watchlists, holdings for deleted stocks)
 * 4. Vacuums the database to reclaim space
 */

async function cleanupDatabase() {
  console.log('🧹 Starting database cleanup for t3.small optimization...\n');

  try {
    // 1. Count current data
    const stats = await gatherStats();
    console.log('📊 Current Database Statistics:');
    console.log(`  Total stocks: ${stats.stocks}`);
    console.log(`  Curated stocks (with educationalPriority): ${stats.curatedStocks}`);
    console.log(`  Non-curated stocks: ${stats.stocks - stats.curatedStocks}`);
    console.log(`  Price history records: ${stats.priceHistory}`);
    console.log(`  Daily price records: ${stats.dailyPriceHistory}`);
    console.log(`  Holdings: ${stats.holdings}`);
    console.log(`  Watchlist items: ${stats.watchlist}`);
    console.log(`  Transactions: ${stats.transactions}\n`);

    // 2. Remove non-curated stocks
    console.log('🗑️  Step 1: Removing non-curated stocks...');
    const deletedStocks = await prisma.stock.deleteMany({
      where: {
        educationalPriority: null
      }
    });
    console.log(`  ✅ Removed ${deletedStocks.count} non-curated stocks\n`);

    // 3. Clean up old price history (older than 3 days)
    console.log('🗑️  Step 2: Cleaning up old price history...');
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const deletedPriceHistory = await prisma.stockPriceHistory.deleteMany({
      where: {
        timestamp: {
          lt: threeDaysAgo
        }
      }
    });
    console.log(`  ✅ Removed ${deletedPriceHistory.count} old price history records (older than 3 days)\n`);

    // 4. Clean up old daily price records
    console.log('🗑️  Step 3: Cleaning up old daily price records...');
    const deletedDailyHistory = await prisma.priceHistory.deleteMany({
      where: {
        date: {
          lt: threeDaysAgo
        }
      }
    });
    console.log(`  ✅ Removed ${deletedDailyHistory.count} old daily price records\n`);

    // 5. Remove orphaned watchlist items (for deleted stocks)
    console.log('🗑️  Step 4: Removing orphaned watchlist items...');
    const validStocks = await prisma.stock.findMany({ select: { id: true } });
    const validStockIds = validStocks.map(s => s.id);

    const deletedWatchlist = await prisma.watchlist.deleteMany({
      where: {
        stockId: {
          notIn: validStockIds
        }
      }
    });
    console.log(`  ✅ Removed ${deletedWatchlist.count} orphaned watchlist items\n`);

    // 6. Remove orphaned holdings (for deleted stocks)
    console.log('🗑️  Step 5: Removing orphaned holdings...');
    const deletedHoldings = await prisma.holding.deleteMany({
      where: {
        stockId: {
          notIn: validStockIds
        }
      }
    });
    console.log(`  ✅ Removed ${deletedHoldings.count} orphaned holdings\n`);

    // 7. Update all users' hasSelectedWatchlist flag if they have no watchlist
    console.log('🔄 Step 6: Updating user watchlist flags...');
    const usersWithoutWatchlist = await prisma.user.findMany({
      where: {
        watchlist: {
          none: {}
        },
        hasSelectedWatchlist: true
      }
    });

    if (usersWithoutWatchlist.length > 0) {
      await prisma.user.updateMany({
        where: {
          id: {
            in: usersWithoutWatchlist.map(u => u.id)
          }
        },
        data: {
          hasSelectedWatchlist: false
        }
      });
      console.log(`  ✅ Updated ${usersWithoutWatchlist.length} users' watchlist flags\n`);
    } else {
      console.log(`  ℹ️  No users need watchlist flag updates\n`);
    }

    // 8. Final statistics
    const finalStats = await gatherStats();
    console.log('=' + '='.repeat(59));
    console.log('📊 Cleanup Summary:');
    console.log('=' + '='.repeat(59));
    console.log(`  Stocks: ${stats.stocks} → ${finalStats.stocks} (${stats.stocks - finalStats.stocks} removed)`);
    console.log(`  Price History: ${stats.priceHistory} → ${finalStats.priceHistory} (${stats.priceHistory - finalStats.priceHistory} removed)`);
    console.log(`  Daily Price History: ${stats.dailyPriceHistory} → ${finalStats.dailyPriceHistory} (${stats.dailyPriceHistory - finalStats.dailyPriceHistory} removed)`);
    console.log(`  Holdings: ${stats.holdings} → ${finalStats.holdings} (${stats.holdings - finalStats.holdings} removed)`);
    console.log(`  Watchlist: ${stats.watchlist} → ${finalStats.watchlist} (${stats.watchlist - finalStats.watchlist} removed)`);
    console.log('=' + '='.repeat(59));

    // 9. Database space savings estimation
    const recordsRemoved =
      deletedStocks.count +
      deletedPriceHistory.count +
      deletedDailyHistory.count +
      deletedWatchlist.count +
      deletedHoldings.count;

    const estimatedMBSaved = (recordsRemoved * 0.001).toFixed(2); // Rough estimate: 1KB per record
    console.log(`\n💾 Estimated space saved: ~${estimatedMBSaved} MB`);
    console.log(`📉 Total records removed: ${recordsRemoved}\n`);

    console.log('✨ Database cleanup completed successfully!');
    console.log('💡 Tip: Run VACUUM ANALYZE on PostgreSQL to reclaim disk space:\n');
    console.log('   docker exec -it math-economics-postgres psql -U mathuser -d mathematical_economics -c "VACUUM ANALYZE;"\n');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

async function gatherStats() {
  const [
    stocks,
    curatedStocks,
    priceHistory,
    dailyPriceHistory,
    holdings,
    watchlist,
    transactions
  ] = await Promise.all([
    prisma.stock.count(),
    prisma.stock.count({ where: { educationalPriority: { not: null } } }),
    prisma.stockPriceHistory.count(),
    prisma.priceHistory.count(),
    prisma.holding.count(),
    prisma.watchlist.count(),
    prisma.transaction.count()
  ]);

  return {
    stocks,
    curatedStocks,
    priceHistory,
    dailyPriceHistory,
    holdings,
    watchlist,
    transactions
  };
}

// Run cleanup
cleanupDatabase()
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
