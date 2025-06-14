import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import stockService, { ChartData as ApiChartData, ChartPeriod } from '@/services/stockService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import clsx from 'clsx';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface StockChartProps {
  symbol: string;
  period?: ChartPeriod;
  height?: number;
  showVolume?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export default function StockChart({ 
  symbol, 
  period = '1M', 
  height = 400,
  showVolume = true,
  autoRefresh = false,
  refreshInterval = 60000 // 1분
}: StockChartProps) {
  const [chartData, setChartData] = useState<ApiChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>(period);
  const [chartType, setChartType] = useState<'line' | 'candle'>('line');
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());

  const fetchChartData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await stockService.getChartData(symbol, selectedPeriod);
      setChartData(data);
      setLastUpdateTime(new Date());
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
      setError('차트 데이터를 불러오는데 실패했습니다.');
      toast.error('차트 데이터를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [symbol, selectedPeriod]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  // 자동 새로고침
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchChartData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchChartData]);

  const formatDate = useCallback((dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
    
    // 기간에 따라 다른 포맷 사용
    if (selectedPeriod === '1D') {
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays <= 7) {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    } else if (diffDays <= 90) {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    } else {
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
  }, [selectedPeriod]);

  // 차트 데이터 메모이제이션
  const lineChartData = useMemo(() => {
    if (!chartData.length) return { labels: [], datasets: [] };

    const isPositive = chartData.length > 1 && 
      chartData[chartData.length - 1].close >= chartData[0].close;

    return {
      labels: chartData.map(d => formatDate(d.timestamp)),
      datasets: [
        {
          label: '종가',
          data: chartData.map(d => d.close),
          borderColor: isPositive ? 'rgb(239, 68, 68)' : 'rgb(59, 130, 246)',
          backgroundColor: isPositive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.1,
          pointRadius: 0,
          pointHoverRadius: 4,
        }
      ]
    };
  }, [chartData, formatDate]);

  const volumeChartData = useMemo(() => {
    if (!chartData.length) return { labels: [], datasets: [] };

    return {
      labels: chartData.map(d => formatDate(d.timestamp)),
      datasets: [
        {
          label: '거래량',
          data: chartData.map(d => d.volume),
          backgroundColor: chartData.map((d, i) => 
            i > 0 && d.close >= chartData[i - 1].close 
              ? 'rgba(239, 68, 68, 0.5)' 
              : 'rgba(59, 130, 246, 0.5)'
          ),
          borderColor: chartData.map((d, i) => 
            i > 0 && d.close >= chartData[i - 1].close 
              ? 'rgba(239, 68, 68, 1)' 
              : 'rgba(59, 130, 246, 1)'
          ),
          borderWidth: 1,
        }
      ]
    };
  }, [chartData, formatDate]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: function(context: any) {
            return formatDate(chartData[context[0].dataIndex]?.timestamp || '');
          },
          label: function(context: any) {
            const data = chartData[context.dataIndex];
            if (!data) return [];
            
            const changeAmount = data.close - data.open;
            const changePercent = ((changeAmount / data.open) * 100).toFixed(2);
            const isPositive = changeAmount >= 0;
            
            return [
              `시가: ${data.open.toLocaleString()}원`,
              `고가: ${data.high.toLocaleString()}원`,
              `저가: ${data.low.toLocaleString()}원`,
              `종가: ${data.close.toLocaleString()}원`,
              `변동: ${isPositive ? '+' : ''}${changeAmount.toLocaleString()}원 (${isPositive ? '+' : ''}${changePercent}%)`,
              `거래량: ${data.volume.toLocaleString()}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxTicksLimit: 10,
          autoSkip: true,
        }
      },
      y: {
        position: 'right' as const,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: function(value: any) {
            return value.toLocaleString() + '원';
          }
        }
      }
    }
  }), [chartData, formatDate]);

  const volumeOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        callbacks: {
          label: function(context: any) {
            return `거래량: ${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          display: false
        }
      },
      y: {
        position: 'right' as const,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: function(value: any) {
            return (value / 1000000).toFixed(0) + 'M';
          }
        }
      }
    }
  }), []);

  const periods: { value: ChartPeriod; label: string }[] = [
    { value: '1D', label: '1일' },
    { value: '1W', label: '1주' },
    { value: '1M', label: '1개월' },
    { value: '3M', label: '3개월' },
    { value: '1Y', label: '1년' }
  ];

  if (loading && !chartData.length) {
    return (
      <div className="bg-white rounded-lg shadow p-4" style={{ height: height + 100 }}>
        <div className="flex items-center justify-center h-full">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={fetchChartData}
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {periods.map(p => (
                <button
                  key={p.value}
                  onClick={() => setSelectedPeriod(p.value)}
                  className={clsx(
                    'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
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
              <div className="text-xs text-gray-500">
                마지막 업데이트: {lastUpdateTime.toLocaleTimeString()}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {loading && chartData.length > 0 && (
              <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            )}
            <button
              onClick={fetchChartData}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              title="새로고침"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            차트 데이터가 없습니다.
          </div>
        ) : (
          <>
            <div style={{ height: showVolume ? height * 0.7 : height }}>
              <Line data={lineChartData} options={chartOptions} />
            </div>

            {showVolume && (
              <>
                <div className="border-t mt-4 mb-2" />
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