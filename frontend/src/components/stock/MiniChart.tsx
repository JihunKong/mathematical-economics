import { useEffect, useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import stockService, { ChartData, ChartPeriod } from '@/services/stockService';
import clsx from 'clsx';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

interface MiniChartProps {
  symbol: string;
  period?: ChartPeriod;
  height?: number;
  className?: string;
  showAxis?: boolean;
  lineColor?: string;
  fillColor?: string;
}

export default function MiniChart({
  symbol,
  period = '1D',
  height = 60,
  className = '',
  showAxis = false,
  lineColor,
  fillColor,
}: MiniChartProps) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, [symbol, period]);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const data = await stockService.getChartData(symbol, period);
      setChartData(data);
    } catch (error) {
      console.error('Failed to fetch mini chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const { lineChartData, isPositive } = useMemo(() => {
    if (!chartData.length) return { lineChartData: null, isPositive: true };

    const isPositive = chartData[chartData.length - 1].close >= chartData[0].close;
    const defaultLineColor = isPositive ? 'rgb(239, 68, 68)' : 'rgb(59, 130, 246)';
    const defaultFillColor = isPositive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)';

    return {
      lineChartData: {
        labels: chartData.map((_, index) => index.toString()),
        datasets: [
          {
            data: chartData.map(d => d.close),
            borderColor: lineColor || defaultLineColor,
            backgroundColor: fillColor || defaultFillColor,
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            borderWidth: 1.5,
          }
        ]
      },
      isPositive
    };
  }, [chartData, lineColor, fillColor]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false
      }
    },
    scales: {
      x: {
        display: showAxis,
        grid: {
          display: false
        }
      },
      y: {
        display: showAxis,
        grid: {
          display: false
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    elements: {
      line: {
        borderCapStyle: 'round' as const,
        borderJoinStyle: 'round' as const,
      }
    }
  }), [showAxis]);

  if (loading || !lineChartData) {
    return (
      <div className={clsx('bg-gray-100 animate-pulse rounded', className)} style={{ height }} />
    );
  }

  return (
    <div className={className} style={{ height }}>
      <Line data={lineChartData} options={chartOptions} />
    </div>
  );
}