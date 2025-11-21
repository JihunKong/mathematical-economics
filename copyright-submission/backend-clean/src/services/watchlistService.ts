import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger'에러가 발생했습니다'ALL'에러가 발생했습니다'asc' },
          { name: 'asc'에러가 발생했습니다'Error getting available stocks:', error);
      throw new Error('Failed to get available stocks');
    }
  }

  // Get user'에러가 발생했습니다'asc' }
      });

      return watchlist;
    } catch (error) {
      logger.error('Error getting user watchlist:', error);
      throw new Error('Failed to get user watchlist'에러가 발생했습니다'Error checking watchlist change permission:', error);
      return false;
    }
  }

  // Set user'에러가 발생했습니다'관심종목은 1개에서 10개까지 선택할 수 있습니다 📈'에러가 발생했습니다'관심종목은 하루에 한 번만 변경할 수 있습니다 📅 내일 다시 시도해주세요!'에러가 발생했습니다'선택한 주식 중 일부를 사용할 수 없습니다 🚫 다른 종목을 선택해주세요.'에러가 발생했습니다'Error setting user watchlist:'에러가 발생했습니다'관심종목이 가득 찼습니다 (최대 10개) 📦 기존 종목을 제거하고 추가해주세요.'에러가 발생했습니다'이미 관심종목에 추가된 주식입니다 ✅'에러가 발생했습니다'관심종목은 하루에 한 번만 변경할 수 있습니다 📅 내일 다시 시도해주세요!'에러가 발생했습니다'주식을 찾을 수 없거나 사용할 수 없습니다 🔍 다른 종목을 선택해주세요.'에러가 발생했습니다's last change time
        await tx.user.update({
          where: { id: userId },
          data: {
            hasSelectedWatchlist: true,
            lastWatchlistChange: new Date()
          }
        });

        // Mark stock as tracked
        await tx.stock.update({
          where: { id: stockId },
          data: { isTracked: true }
        });

        return watchlistItem;
      });

      logger.info(`User ${userId} added stock ${stockId} to watchlist`);
      return result;
    } catch (error) {
      logger.error('Error adding to watchlist:'에러가 발생했습니다'관심종목은 하루에 한 번만 변경할 수 있습니다 📅 내일 다시 시도해주세요!'에러가 발생했습니다'관심종목에 없는 주식입니다 🔍'에러가 발생했습니다'asc'에러가 발생했습니다's last change time
        await tx.user.update({
          where: { id: userId },
          data: {
            lastWatchlistChange: new Date()
          }
        });

        // Check if stock should still be tracked
        const stillWatched = await tx.watchlist.findFirst({
          where: { stockId }
        });

        if (!stillWatched) {
          await tx.stock.update({
            where: { id: stockId },
            data: { isTracked: false }
          });
        }

        return removed.count;
      });

      logger.info(`User ${userId} removed stock ${stockId} from watchlist`);
      return result;
    } catch (error) {
      logger.error('Error removing from watchlist:'에러가 발생했습니다'Error getting tracked stocks:', error);
      throw new Error('Failed to get tracked stocks'에러가 발생했습니다'market'에러가 발생했습니다'Error getting market stats:', error);
      throw new Error('Failed to get market statistics'에러가 발생했습니다'll get popular KOSPI stocks
      const stocks = await prisma.stock.findMany({
        where: {
          market: 'KOSPI',
          symbol: {
            in: [
              '005930', // Samsung Electronics
              '000660', // SK Hynix
              '373220', // LG Energy Solution
              '207940', // Samsung Biologics
              '005935', // Samsung Electronics (preferred)
              '005490', // POSCO
              '006400', // Samsung SDI
              '051910', // LG Chem
              '035420', // NAVER
              '000270'에러가 발생했습니다'Error getting top 10 stocks:'에러가 발생했습니다'Error getting random stocks:'에러가 발생했습니다'KOSPI',
          OR: [
            { sector: '전기전자' },
            { sector: '금융업' },
            { sector: '화학' },
            { sector: '운수장비'에러가 발생했습니다'asc'에러가 발생했습니다'Error getting KOSPI leaders:'에러가 발생했습니다'KOSDAQ',
          OR: [
            { sector: '제약' },
            { sector: '소프트웨어' },
            { sector: '게임' },
            { sector: '바이오'에러가 발생했습니다'asc'에러가 발생했습니다'Error getting KOSDAQ promising stocks:', error);
      throw error;
    }
  }

  // Transform stock data with latest price
  private transformStockData(stocks: any[]) {
    return stocks.map(stock => ({
      id: stock.id,
      symbol: stock.symbol,
      name: stock.name,
      market: stock.market,
      sector: stock.sector,
      currentPrice: stock.currentPrice || 0,
      change: stock.change || 0,
      changePercent: stock.changePercent || 0,
      lastPriceUpdate: stock.lastPriceUpdate
    }));
  }
}

export const watchlistService = new WatchlistService();