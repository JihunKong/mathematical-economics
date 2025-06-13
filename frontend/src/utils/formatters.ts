export const formatNumber = (num: number | string | null | undefined): string => {
  if (num === null || num === undefined) return '0';
  
  const number = typeof num === 'string' ? parseFloat(num) : num;
  
  if (isNaN(number)) return '0';
  
  return new Intl.NumberFormat('ko-KR').format(number);
};

export const formatCurrency = (amount: number | string | null | undefined): string => {
  if (amount === null || amount === undefined) return '₩0';
  
  const number = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(number)) return '₩0';
  
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

export const formatPercent = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) return '0%';
  
  const number = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(number)) return '0%';
  
  return `${number >= 0 ? '+' : ''}${number.toFixed(2)}%`;
};

export const formatVolume = (volume: number | string | bigint | null | undefined): string => {
  if (volume === null || volume === undefined) return '0';
  
  let number: number;
  
  if (typeof volume === 'bigint') {
    number = Number(volume);
  } else if (typeof volume === 'string') {
    number = parseFloat(volume);
  } else {
    number = volume;
  }
  
  if (isNaN(number)) return '0';
  
  if (number >= 1000000000) {
    return `${(number / 1000000000).toFixed(1)}B`;
  } else if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1)}M`;
  } else if (number >= 1000) {
    return `${(number / 1000).toFixed(1)}K`;
  }
  
  return formatNumber(number);
};

export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(dateObj);
};

export const formatDateTime = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};