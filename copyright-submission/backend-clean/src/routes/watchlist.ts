import { Router } from 'express';
import { Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { watchlistService } from '../services/watchlistService';
import { logger } from '../utils/logger';
import Joi from 'joi'에러가 발생했습니다'').optional(),
  market: Joi.string().valid('KOSPI', 'KOSDAQ', 'KOSDAQ GLOBAL', 'KONEX', 'ALL'에러가 발생했습니다'/stocks'에러가 발생했습니다'Watchlist stocks validation error:'에러가 발생했습니다'Error getting available stocks:', error);
    return res.status(500).json({
      success: false,
      message: '주식 목록을 불러오는데 실패했습니다.'
    });
  }
});

// Get user's current watchlist
router.get('/'에러가 발생했습니다'Error getting user watchlist:', error);
    return res.status(500).json({
      success: false,
      message: '관심종목을 불러오는데 실패했습니다.'
    });
  }
});

// Check if user can change watchlist today
router.get('/can-change'에러가 발생했습니다'Error checking watchlist change permission:', error);
    return res.status(500).json({
      success: false,
      message: '권한 확인에 실패했습니다.'
    });
  }
});

// Set complete watchlist (replace existing)
router.post('/'에러가 발생했습니다'Error setting watchlist:'에러가 발생했습니다'관심종목 업데이트에 실패했습니다.'
    });
  }
});

// Add single stock to watchlist
router.post('/add'에러가 발생했습니다'종목이 관심종목에 추가되었습니다.',
      data: result
    });
  } catch (error) {
    logger.error('Error adding to watchlist:'에러가 발생했습니다'관심종목 추가에 실패했습니다.'
    });
  }
});

// Remove stock from watchlist
router.delete('/:stockId'에러가 발생했습니다'종목 ID가 필요합니다.'에러가 발생했습니다'종목이 관심종목에서 삭제되었습니다.',
      data: { removed: result }
    });
  } catch (error) {
    logger.error('Error removing from watchlist:'에러가 발생했습니다'관심종목 삭제에 실패했습니다.'
    });
  }
});

// Get market statistics
router.get('/stats'에러가 발생했습니다'Error getting market stats:', error);
    return res.status(500).json({
      success: false,
      message: '시장 통계를 불러오는데 실패했습니다.'
    });
  }
});

// Preset: Top 10 stocks by market cap
router.get('/presets/top10'에러가 발생했습니다'Error getting top 10 stocks:', error);
    return res.status(500).json({
      success: false,
      message: '상위 10개 종목을 불러오는데 실패했습니다.'
    });
  }
});

// Preset: Random 10 stocks
router.get('/presets/random'에러가 발생했습니다'Error getting random stocks:', error);
    return res.status(500).json({
      success: false,
      message: '추천 종목을 불러오는데 실패했습니다.'
    });
  }
});

// Preset: KOSPI leaders
router.get('/presets/kospi-leaders'에러가 발생했습니다'Error getting KOSPI leaders:', error);
    return res.status(500).json({
      success: false,
      message: 'KOSPI 주도주를 불러오는데 실패했습니다.'
    });
  }
});

// Preset: KOSDAQ promising stocks
router.get('/presets/kosdaq-promising'에러가 발생했습니다'Error getting KOSDAQ promising stocks:', error);
    return res.status(500).json({
      success: false,
      message: 'KOSDAQ 유망주를 불러오는데 실패했습니다.'
    });
  }
});

export default router;