import { useEffect, useState } from 'react';
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
import api from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import clsx from 'clsx';

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

interface ChartData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface StockChartProps {
  symbol: string;
  period?: '1week' | '1month' | '3months' | '6months' | '1year';
  height?: number;
  showVolume?: boolean;
}

export default function StockChart({ 
  symbol, 
  period = '1month', 
  height = 400,
  showVolume = true 
}: StockChartProps) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [chartType, setChartType] = useState<'line' | 'candle'>('line');

  useEffect(() => {
    fetchChartData();
  }, [symbol, selectedPeriod]);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/real-stocks/${symbol}/chart`, {
        params: { period: selectedPeriod }
      });
      setChartData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const lineChartData = {
    labels: chartData.map(d => formatDate(d.date)),
    datasets: [
      {
        label: '종가',
        data: chartData.map(d => d.close),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.1
      }
    ]
  };

  const volumeChartData = {
    labels: chartData.map(d => formatDate(d.date)),
    datasets: [
      {
        label: '거래량',
        data: chartData.map(d => d.volume),
        backgroundColor: chartData.map((d, i) => 
          i > 0 && d.close >= chartData[i - 1].close 
            ? 'rgba(239, 68, 68, 0.5)' 
            : 'rgba(59, 130, 246, 0.5)'
        )
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            const data = chartData[context.dataIndex];
            if (!data) return '';
            
            return [
              `시가: ${data.open.toLocaleString()}원`,
              `고가: ${data.high.toLocaleString()}원`,
              `저가: ${data.low.toLocaleString()}원`,
              `종가: ${data.close.toLocaleString()}원`,
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
        }
      },
      y: {
        position: 'right' as const,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    }
  };

  const volumeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        position: 'right' as const,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    }
  };

  const periods = [
    { value: '1week', label: '1주일' },
    { value: '1month', label: '1개월' },
    { value: '3months', label: '3개월' },
    { value: '6months', label: '6개월' },
    { value: '1year', label: '1년' }
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          {periods.map(p => (
            <button
              key={p.value}
              onClick={() => setSelectedPeriod(p.value as any)}
              className={clsx(
                'px-3 py-1 text-sm rounded-md transition-colors',
                selectedPeriod === p.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setChartType('line')}
            className={clsx(
              'px-3 py-1 text-sm rounded-md transition-colors',
              chartType === 'line'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            라인
          </button>
          <button
            onClick={() => setChartType('candle')}
            className={clsx(
              'px-3 py-1 text-sm rounded-md transition-colors',
              chartType === 'candle'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
            disabled
          >
            캔들
          </button>
        </div>
      </div>

      <div style={{ height: showVolume ? height * 0.7 : height }}>
        <Line data={lineChartData} options={chartOptions} />
      </div>

      {showVolume && (
        <div style={{ height: height * 0.3, marginTop: '1rem' }}>
          <Bar data={volumeChartData} options={volumeOptions} />
        </div>
      )}
    </div>
  );
}