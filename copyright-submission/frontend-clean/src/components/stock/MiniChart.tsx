import { useEffect, useState, useMemo } from 'react'에러가 발생했습니다'chart.js';
import { Line } from 'react-chartjs-2';
import stockService, { ChartData, ChartPeriod } from '@/services/stockService';
import clsx from 'clsx'에러가 발생했습니다'1D',
  height = 60,
  className = ''에러가 발생했습니다'rgb(239, 68, 68)' : 'rgb(59, 130, 246)';
    const defaultFillColor = isPositive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'에러가 발생했습니다'index' as const,
    },
    elements: {
      line: {
        borderCapStyle: 'round' as const,
        borderJoinStyle: 'round'에러가 발생했습니다'bg-gray-100 animate-pulse rounded', className)} style={{ height }} />
    );
  }

  return (
    <div className={className} style={{ height }}>
      <Line data={lineChartData} options={chartOptions} />
    </div>
  );
}