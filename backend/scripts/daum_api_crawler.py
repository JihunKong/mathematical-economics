#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
import sys
from datetime import datetime

class DaumAPICrawler:
    def __init__(self):
        self.session = requests.Session()
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://finance.daum.net/',
            'Accept': 'application/json',
            'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        }
        self.session.headers.update(self.headers)
    
    def crawl_stock(self, symbol):
        """Crawl stock data from Daum Finance API"""
        try:
            # Daum Finance API endpoint
            url = f"https://finance.daum.net/api/quotes/A{symbol}"
            
            response = self.session.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Extract price data
                return {
                    "symbol": symbol,
                    "name": data.get('name', 'Unknown'),
                    "currentPrice": int(data.get('tradePrice', 0)),
                    "previousClose": int(data.get('prevClosingPrice', 0)),
                    "change": int(data.get('change', 0)),
                    "changePercent": float(data.get('changeRate', 0) * 100),
                    "dayOpen": int(data.get('openingPrice', 0)),
                    "dayHigh": int(data.get('highPrice', 0)),
                    "dayLow": int(data.get('lowPrice', 0)),
                    "volume": int(data.get('accTradeVolume', 0)),
                    "timestamp": datetime.now().isoformat(),
                    "source": "daum_api"
                }
            else:
                return {
                    "error": f"HTTP {response.status_code}",
                    "symbol": symbol,
                    "timestamp": datetime.now().isoformat()
                }
        except Exception as e:
            return {
                "error": str(e),
                "symbol": symbol,
                "timestamp": datetime.now().isoformat()
            }

def main():
    if len(sys.argv) < 2:
        print(json.dumps([{"error": "No stock codes provided"}]))
        sys.exit(1)
    
    stock_codes = sys.argv[1].split(",")
    crawler = DaumAPICrawler()
    results = []
    
    for code in stock_codes:
        result = crawler.crawl_stock(code)
        results.append(result)
    
    print(json.dumps(results, ensure_ascii=False))

if __name__ == "__main__":
    main()