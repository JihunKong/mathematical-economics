import api from './api'에러가 발생했습니다'1D' | '1W' | '1M' | '3M' | '1Y'에러가 발생했습니다'/stocks/prices/multiple'에러가 발생했습니다'종가',
          data: data.map(item => item.close),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)'에러가 발생했습니다'거래량',
          data: data.map(item => item.volume),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
  }

  // 가격 변동률 계산
  calculatePriceChange(currentPrice: number, previousClose: number) {
    const changeAmount = currentPrice - previousClose;
    const changePercent = (changeAmount / previousClose) * 100;
    return {
      changeAmount,
      changePercent,
      isPositive: changeAmount > 0,
    };
  }

  // 이동평균 계산
  calculateMovingAverage(data: ChartData[], period: number) {
    const result = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data
        .slice(i - period + 1, i + 1)
        .reduce((acc, item) => acc + item.close, 0);
      result.push({
        timestamp: data[i].timestamp,
        value: sum / period,
      });
    }
    return result;
  }
}

export default new StockService();