#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
from bs4 import BeautifulSoup
import json
import sys
import time
import random
from datetime import datetime
from urllib.parse import quote
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

class MultiFinanceCrawler:
    def __init__(self):
        self.session = requests.Session()
        # Rotate user agents
        self.user_agents = [
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0'
        ]
        
        # Add SSL adapter for better compatibility
        import ssl
        from requests.adapters import HTTPAdapter
        from urllib3.poolmanager import PoolManager
        
        class SSLAdapter(HTTPAdapter):
            def init_poolmanager(self, *args, **kwargs):
                ctx = ssl.create_default_context()
                ctx.check_hostname = False
                ctx.verify_mode = ssl.CERT_NONE
                kwargs['ssl_context'] = ctx
                return super().init_poolmanager(*args, **kwargs)
        
        # Configure session with SSL adapter
        self.session.mount('https://', SSLAdapter())
        
        # Add retry adapter
        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
    
    def parse_number(self, text):
        """Parse number from various formats"""
        if not text:
            return 0
        try:
            # Remove currency symbols and special characters
            cleaned = text.replace('₩', '').replace('$', '').replace(',', '').replace(' ', '')
            cleaned = cleaned.replace('원', '').replace('KRW', '').strip()
            
            # Handle negative numbers
            if '▼' in text or '-' in cleaned:
                cleaned = cleaned.replace('▼', '').replace('-', '')
                return -float(cleaned)
            elif '▲' in text or '+' in cleaned:
                cleaned = cleaned.replace('▲', '').replace('+', '')
                return float(cleaned)
            
            return float(cleaned)
        except:
            return 0
    
    def crawl_google_finance(self, symbol):
        """Google Finance 크롤링"""
        try:
            # Google Finance uses different symbols for Korean stocks
            google_symbol = f"KRX:{symbol}"
            url = f"https://www.google.com/finance/quote/{google_symbol}"
            
            response = self.session.get(url, headers=self.headers, timeout=10)
            if response.status_code != 200:
                return None
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Current price
            price_elem = soup.select_one('[class*="YMlKec fxKbKc"]')
            if not price_elem:
                return None
            
            current_price = self.parse_number(price_elem.text)
            
            # Previous close - find in the stats section
            previous_close = current_price  # Default
            stats_section = soup.select('[class*="P6K39c"]')
            for stat in stats_section:
                label = stat.select_one('[class*="mfs7Fc"]')
                if label and '이전 종가' in label.text:
                    value = stat.select_one('[class*="P6K39c"]')
                    if value:
                        previous_close = self.parse_number(value.text)
                        break
            
            # Change and change percent
            change_elem = soup.select_one('[class*="JwB6zf"]')
            change = 0
            change_percent = 0
            if change_elem:
                change_parts = change_elem.text.split('(')
                if len(change_parts) >= 1:
                    change = self.parse_number(change_parts[0])
                if len(change_parts) >= 2:
                    change_percent = self.parse_number(change_parts[1].replace('%', '').replace(')', ''))
            
            # Company name
            name_elem = soup.select_one('[class*="zzDege"]')
            company_name = name_elem.text if name_elem else symbol
            
            return {
                "symbol": symbol,
                "name": company_name,
                "currentPrice": int(current_price),
                "previousClose": int(previous_close),
                "change": int(change),
                "changePercent": round(change_percent, 2),
                "dayOpen": int(current_price),  # Google doesn't show open
                "dayHigh": int(current_price),  # Google doesn't show high
                "dayLow": int(current_price),   # Google doesn't show low
                "volume": 0,
                "timestamp": datetime.now().isoformat(),
                "source": "google_finance"
            }
            
        except Exception as e:
            print(f"Google Finance error for {symbol}: {e}", file=sys.stderr)
            return None
    
    def crawl_yahoo_finance(self, symbol):
        """Yahoo Finance 크롤링"""
        try:
            # Yahoo Finance uses .KS for KOSPI, .KQ for KOSDAQ
            yahoo_symbol = f"{symbol}.KS"
            url = f"https://finance.yahoo.com/quote/{yahoo_symbol}"
            
            response = self.session.get(url, headers=self.headers, timeout=10)
            if response.status_code != 200:
                # Try KOSDAQ
                yahoo_symbol = f"{symbol}.KQ"
                url = f"https://finance.yahoo.com/quote/{yahoo_symbol}"
                response = self.session.get(url, headers=self.headers, timeout=10)
            
            if response.status_code != 200:
                return None
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Find price in the header
            price_elem = soup.select_one('[data-symbol="' + yahoo_symbol + '"][data-field="regularMarketPrice"]')
            if not price_elem:
                # Alternative selector
                price_elem = soup.select_one('fin-streamer[data-field="regularMarketPrice"]')
            
            if not price_elem:
                return None
            
            current_price = self.parse_number(price_elem.text)
            
            # Previous close
            prev_close_elem = soup.select_one('[data-test="PREV_CLOSE-value"]')
            previous_close = self.parse_number(prev_close_elem.text) if prev_close_elem else current_price
            
            # Change and percent
            change_elem = soup.select_one('[data-field="regularMarketChange"]')
            change = self.parse_number(change_elem.text) if change_elem else 0
            
            change_percent_elem = soup.select_one('[data-field="regularMarketChangePercent"]')
            change_percent = self.parse_number(change_percent_elem.text.replace('%', '')) if change_percent_elem else 0
            
            # Additional stats
            open_elem = soup.select_one('[data-test="OPEN-value"]')
            day_open = self.parse_number(open_elem.text) if open_elem else current_price
            
            range_elem = soup.select_one('[data-test="DAYS_RANGE-value"]')
            day_low = current_price
            day_high = current_price
            if range_elem and ' - ' in range_elem.text:
                low, high = range_elem.text.split(' - ')
                day_low = self.parse_number(low)
                day_high = self.parse_number(high)
            
            volume_elem = soup.select_one('[data-test="TD_VOLUME-value"]')
            volume = int(self.parse_number(volume_elem.text)) if volume_elem else 0
            
            # Company name
            name_elem = soup.select_one('h1')
            company_name = name_elem.text.split('(')[0].strip() if name_elem else symbol
            
            return {
                "symbol": symbol,
                "name": company_name,
                "currentPrice": int(current_price),
                "previousClose": int(previous_close),
                "change": int(change),
                "changePercent": round(change_percent, 2),
                "dayOpen": int(day_open),
                "dayHigh": int(day_high),
                "dayLow": int(day_low),
                "volume": volume,
                "timestamp": datetime.now().isoformat(),
                "source": "yahoo_finance"
            }
            
        except Exception as e:
            print(f"Yahoo Finance error for {symbol}: {e}", file=sys.stderr)
            return None
    
    def crawl_investing_com(self, symbol):
        """Investing.com 크롤링"""
        try:
            # Investing.com uses different URLs for each stock
            # This is a mapping for major Korean stocks
            symbol_mapping = {
                "005930": "samsung-electronics-co-ltd",  # 삼성전자
                "000660": "sk-hynix-inc",  # SK하이닉스
                "035420": "naver-corp",  # 네이버
                "005380": "hyundai-motor-co",  # 현대차
                "051910": "lg-chem-ltd",  # LG화학
                "006400": "samsung-sdi-co-ltd",  # 삼성SDI
                "035720": "kakao-corp",  # 카카오
                "068270": "celltrion-inc",  # 셀트리온
                "105560": "kb-financial-group-inc",  # KB금융
                "055550": "shinhan-financial-group-co-ltd",  # 신한지주
            }
            
            if symbol not in symbol_mapping:
                return None
            
            url = f"https://www.investing.com/equities/{symbol_mapping[symbol]}"
            
            response = self.session.get(url, headers=self.headers, timeout=10)
            if response.status_code != 200:
                return None
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Current price
            price_elem = soup.select_one('[data-test="instrument-price-last"]')
            if not price_elem:
                return None
            
            current_price = self.parse_number(price_elem.text)
            
            # Change and percent
            change_elem = soup.select_one('[data-test="instrument-price-change"]')
            change = self.parse_number(change_elem.text) if change_elem else 0
            
            change_percent_elem = soup.select_one('[data-test="instrument-price-change-percent"]')
            change_percent = self.parse_number(change_percent_elem.text.replace('%', '').replace('(', '').replace(')', '')) if change_percent_elem else 0
            
            # Previous close
            previous_close = current_price - change
            
            # Additional data from the overview table
            overview_data = {}
            overview_items = soup.select('.key-info_dd__123BAk')
            overview_labels = soup.select('.key-info_dt__3A7C8')
            
            for label, value in zip(overview_labels, overview_items):
                label_text = label.text.strip()
                value_text = value.text.strip()
                
                if '일일 변동폭' in label_text and ' - ' in value_text:
                    low, high = value_text.split(' - ')
                    overview_data['dayLow'] = self.parse_number(low)
                    overview_data['dayHigh'] = self.parse_number(high)
                elif '시가' in label_text:
                    overview_data['dayOpen'] = self.parse_number(value_text)
                elif '거래량' in label_text:
                    overview_data['volume'] = int(self.parse_number(value_text))
            
            # Company name
            name_elem = soup.select_one('h1')
            company_name = name_elem.text.strip() if name_elem else symbol
            
            return {
                "symbol": symbol,
                "name": company_name,
                "currentPrice": int(current_price),
                "previousClose": int(previous_close),
                "change": int(change),
                "changePercent": round(change_percent, 2),
                "dayOpen": int(overview_data.get('dayOpen', current_price)),
                "dayHigh": int(overview_data.get('dayHigh', current_price)),
                "dayLow": int(overview_data.get('dayLow', current_price)),
                "volume": overview_data.get('volume', 0),
                "timestamp": datetime.now().isoformat(),
                "source": "investing_com"
            }
            
        except Exception as e:
            print(f"Investing.com error for {symbol}: {e}", file=sys.stderr)
            return None
    
    def crawl_naver_finance_api(self, symbol):
        """네이버 금융 API 사용 (더 안정적)"""
        try:
            # 네이버 증권 API 엔드포인트
            url = f"https://polling.finance.naver.com/api/realtime/domestic/stock/{symbol}"
            
            headers = self.headers.copy()
            headers['Referer'] = f'https://finance.naver.com/item/main.naver?code={symbol}'
            
            response = self.session.get(url, headers=headers, timeout=10)
            if response.status_code != 200:
                return None
            
            data = response.json()
            if not data or 'datas' not in data or not data['datas']:
                return None
            
            stock_data = data['datas'][0]
            
            return {
                "symbol": symbol,
                "name": stock_data.get('nm', 'Unknown'),
                "currentPrice": int(stock_data.get('nv', 0)),
                "previousClose": int(stock_data.get('pcv', 0)),
                "change": int(stock_data.get('cv', 0)),
                "changePercent": float(stock_data.get('cr', 0)),
                "dayOpen": int(stock_data.get('ov', 0)),
                "dayHigh": int(stock_data.get('hv', 0)),
                "dayLow": int(stock_data.get('lv', 0)),
                "volume": int(stock_data.get('aq', 0)),
                "timestamp": datetime.now().isoformat(),
                "source": "naver_finance_api"
            }
            
        except Exception as e:
            print(f"Naver Finance API error for {symbol}: {e}", file=sys.stderr)
            return None
    
    def crawl_stock(self, symbol):
        """Try multiple sources with fallback"""
        # Try Naver API first (most reliable for Korean stocks)
        result = self.crawl_naver_finance_api(symbol)
        if result and result['currentPrice'] > 0:
            return result
        
        # Random delay to avoid being blocked
        time.sleep(random.uniform(0.5, 1.5))
        
        # Try Google Finance
        result = self.crawl_google_finance(symbol)
        if result and result['currentPrice'] > 0:
            return result
        
        time.sleep(random.uniform(0.5, 1.5))
        
        # Try Yahoo Finance
        result = self.crawl_yahoo_finance(symbol)
        if result and result['currentPrice'] > 0:
            return result
        
        time.sleep(random.uniform(0.5, 1.5))
        
        # Try Investing.com
        result = self.crawl_investing_com(symbol)
        if result and result['currentPrice'] > 0:
            return result
        
        # All failed
        return {
            "error": "Failed to fetch from all sources",
            "symbol": symbol,
            "timestamp": datetime.now().isoformat()
        }

def main():
    if len(sys.argv) < 2:
        print(json.dumps([{"error": "No stock codes provided"}]))
        sys.exit(1)
    
    stock_codes = sys.argv[1].split(",")
    crawler = MultiFinanceCrawler()
    results = []
    
    for i, code in enumerate(stock_codes):
        print(f"Crawling {code}... ({i+1}/{len(stock_codes)})", file=sys.stderr)
        result = crawler.crawl_stock(code)
        results.append(result)
        
        # Delay between requests
        if i < len(stock_codes) - 1:
            time.sleep(random.uniform(1, 2))
    
    print(json.dumps(results, ensure_ascii=False))

if __name__ == "__main__":
    main()