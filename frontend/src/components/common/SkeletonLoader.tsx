import clsx from 'clsx';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export default function SkeletonLoader({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}: SkeletonLoaderProps) {
  const baseClasses = 'bg-gray-200';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg',
  };
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };
  
  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || '20px',
  };
  
  return (
    <div
      className={clsx(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
    />
  );
}

// Card skeleton
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={clsx('bg-white p-6 rounded-lg shadow', className)}>
      <SkeletonLoader variant="text" height={16} width="40%" className="mb-2" />
      <SkeletonLoader variant="text" height={32} width="60%" />
    </div>
  );
}

// Table row skeleton
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-6 py-4">
          <SkeletonLoader variant="text" height={16} />
        </td>
      ))}
    </tr>
  );
}

// Chart skeleton
export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <SkeletonLoader variant="text" height={20} width="30%" className="mb-4" />
      <SkeletonLoader variant="rectangular" height={height} />
    </div>
  );
}

// Dashboard summary skeleton
export function DashboardSummarySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {Array.from({ length: 4 }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}

// Stock list skeleton
export function StockListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center justify-between p-2">
          <div className="flex-1">
            <SkeletonLoader variant="text" height={16} width="60%" className="mb-1" />
            <SkeletonLoader variant="text" height={14} width="30%" />
          </div>
          <div className="text-right">
            <SkeletonLoader variant="text" height={16} width={80} className="mb-1 ml-auto" />
            <SkeletonLoader variant="text" height={14} width={60} className="ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}