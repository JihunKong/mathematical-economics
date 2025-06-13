export interface StockData {
  symbol: string;
  name: string;
  market: string;
  sector?: string;
  currentPrice: number;
  previousClose: number;
  dayOpen?: number;
  dayHigh?: number;
  dayLow?: number;
  volume?: bigint;
  marketCap?: bigint;
  per?: number;
  eps?: number;
  change: number;
  changePercent: number;
}

export interface ChartData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: bigint;
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  market: string;
}

export interface PriceUpdate {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: bigint;
  timestamp: Date;
}