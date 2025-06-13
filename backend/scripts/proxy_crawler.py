#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
import sys
import time
import random
from datetime import datetime
from bs4 import BeautifulSoup
import cloudscraper

class ProxyCrawler:
    def __init__(self):
        # cloudscraper는 Cloudflare 방어를 우회할 수 있습니다
        self.scraper = cloudscraper.create_scraper(
            browser={
                'browser': 'chrome',
                'platform': 'windows',
                'mobile': False
            }
        )
        
    def crawl_yahoo_finance(self, symbol):
        """Yahoo Finance international version (less blocking)"""
        try:
            # Use yahoo finance international
            url = f"https://finance.yahoo.com/quote/{symbol}.KS"
            
            response = self.scraper.get(url, timeout=15)
            
            if response.status_code == 200:
                # Try to extract from JSON data in page
                text = response.text
                
                # Look for price data in JSON
                import re
                price_match = re.search(r'"regularMarketPrice":{"raw":(\d+\.?\d*)', text)
                prev_close_match = re.search(r'"regularMarketPreviousClose":{"raw":(\d+\.?\d*)', text)
                
                if price_match and prev_close_match:
                    current_price = float(price_match.group(1))
                    previous_close = float(prev_close_match.group(1))
                    
                    # Extract more data
                    open_match = re.search(r'"regularMarketOpen":{"raw":(\d+\.?\d*)', text)
                    high_match = re.search(r'"regularMarketDayHigh":{"raw":(\d+\.?\d*)', text)
                    low_match = re.search(r'"regularMarketDayLow":{"raw":(\d+\.?\d*)', text)
                    volume_match = re.search(r'"regularMarketVolume":{"raw":(\d+)', text)
                    
                    return {
                        "symbol": symbol,
                        "name": "Stock",
                        "currentPrice": int(current_price),
                        "previousClose": int(previous_close),
                        "change": int(current_price - previous_close),
                        "changePercent": round((current_price - previous_close) / previous_close * 100, 2),
                        "dayOpen": int(float(open_match.group(1))) if open_match else int(current_price),
                        "dayHigh": int(float(high_match.group(1))) if high_match else int(current_price),
                        "dayLow": int(float(low_match.group(1))) if low_match else int(current_price),
                        "volume": int(volume_match.group(1)) if volume_match else 0,
                        "timestamp": datetime.now().isoformat(),
                        "source": "yahoo_finance_intl"
                    }
                    
        except Exception as e:
            print(f"Yahoo Finance error for {symbol}: {e}", file=sys.stderr)
            
        return None
    
    def crawl_investing_api(self, symbol):
        """Try Investing.com mobile API"""
        try:
            # Symbol mapping for major Korean stocks
            symbol_to_pair_id = {
                "005930": "44465",  # Samsung Electronics
                "000660": "44553",  # SK Hynix
                "035420": "13569",  # NAVER
                "005380": "252",    # Hyundai Motor
                "035720": "44644",  # Kakao
            }
            
            if symbol not in symbol_to_pair_id:
                return None
                
            pair_id = symbol_to_pair_id[symbol]
            
            # Mobile API endpoint
            url = f"https://api.investing.com/api/financialdata/{pair_id}/real-time"
            
            headers = {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
                'Accept': 'application/json',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.investing.com/',
            }
            
            response = self.scraper.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                return {
                    "symbol": symbol,
                    "name": data.get('name', 'Unknown'),
                    "currentPrice": int(float(data.get('last', 0))),
                    "previousClose": int(float(data.get('prev_close', 0))),
                    "change": int(float(data.get('change', 0))),
                    "changePercent": float(data.get('change_percent', 0)),
                    "dayOpen": int(float(data.get('open', 0))),
                    "dayHigh": int(float(data.get('high', 0))),
                    "dayLow": int(float(data.get('low', 0))),
                    "volume": int(float(data.get('volume', 0))),
                    "timestamp": datetime.now().isoformat(),
                    "source": "investing_api"
                }
                
        except Exception as e:
            print(f"Investing API error for {symbol}: {e}", file=sys.stderr)
            
        return None
    
    def crawl_stock(self, symbol):
        """Try multiple sources"""
        # Try Yahoo Finance first
        result = self.crawl_yahoo_finance(symbol)
        if result and result['currentPrice'] > 0:
            return result
            
        # Try Investing.com API
        result = self.crawl_investing_api(symbol)
        if result and result['currentPrice'] > 0:
            return result
            
        # All failed
        return {
            "error": "All sources failed",
            "symbol": symbol,
            "timestamp": datetime.now().isoformat()
        }

def main():
    if len(sys.argv) < 2:
        print(json.dumps([{"error": "No stock codes provided"}]))
        sys.exit(1)
    
    stock_codes = sys.argv[1].split(",")
    crawler = ProxyCrawler()
    results = []
    
    for i, code in enumerate(stock_codes):
        result = crawler.crawl_stock(code)
        results.append(result)
        
        # Delay between requests
        if i < len(stock_codes) - 1:
            time.sleep(random.uniform(1, 2))
    
    print(json.dumps(results, ensure_ascii=False))

if __name__ == "__main__":
    main()