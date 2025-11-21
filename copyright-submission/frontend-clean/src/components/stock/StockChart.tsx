import { useEffect, useState, useCallback, useMemo } from 'react'에러가 발생했습니다'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import stockService, { ChartData as ApiChartData, ChartPeriod } from '@/services/stockService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import clsx from 'clsx';
import toast from 'react-hot-toast'에러가 발생했습니다'1M'에러가 발생했습니다'line' | 'candle'>('line'에러가 발생했습니다'차트 데이터를 불러오는데 실패했습니다.');
      toast.error('차트 데이터를 불러올 수 없습니다.'에러가 발생했습니다'1D') {
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit'에러가 발생했습니다'0'에러가 발생했습니다'종가',
          data: chartData.map(d => d.close),
          borderColor: isPositive ? 'rgb(239, 68, 68)' : 'rgb(59, 130, 246)',
          backgroundColor: isPositive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'에러가 발생했습니다'거래량'에러가 발생했습니다'rgba(239, 68, 68, 0.5)' 
              : 'rgba(59, 130, 246, 0.5)'에러가 발생했습니다'rgba(239, 68, 68, 1)' 
              : 'rgba(59, 130, 246, 1)'에러가 발생했습니다'index'에러가 발생했습니다'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)'에러가 발생했습니다''에러가 발생했습니다'+' : ''}${changeAmount.toLocaleString()}원 (${isPositive ? '+' : ''에러가 발생했습니다'right' as const,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'에러가 발생했습니다'원'에러가 발생했습니다'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white'에러가 발생했습니다'right' as const,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'에러가 발생했습니다'M'에러가 발생했습니다'1D', label: '1일' },
    { value: '1W', label: '1주' },
    { value: '1M', label: '1개월' },
    { value: '3M', label: '3개월' },
    { value: '1Y', label: '1년'에러가 발생했습니다'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                    selectedPeriod === p.value
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {autoRefresh && (
              <div className="text-xs text-gray-500"에러가 발생했습니다"flex items-center gap-2">
            {loading && chartData.length > 0 && (
              <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"에러가 발생했습니다"p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              title="새로고침"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="에러가 발생했습니다" />
              </svg>
            </button>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="text-center py-12 text-gray-500"에러가 발생했습니다"border-t mt-4 mb-2" />
                <div style={{ height: height * 0.25 }}>
                  <Bar data={volumeChartData} options={volumeOptions} />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}