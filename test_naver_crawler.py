#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
import sys
import re
from urllib.parse import quote
import time
import random

def get_stock_price_naver(symbol):
    """네이버 금융에서 주식 가격 조회 (requests 기반)"""
    try:
        # User-Agent 로테이션
        user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]
        
        headers = {
            'User-Agent': random.choice(user_agents),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'ko-KR,ko;q=0.8,en-US;q=0.5,en;q=0.3',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0'
        }
        
        # 랜덤 딜레이
        time.sleep(random.uniform(0.5, 1.5))
        
        # 네이버 금융 페이지 요청
        url = f"https://finance.naver.com/item/sise.naver?code={symbol}"
        
        session = requests.Session()
        session.headers.update(headers)
        
        response = session.get(url, timeout=10)
        response.raise_for_status()
        
        # HTML에서 가격 정보 추출
        html = response.text
        
        # 현재가 추출
        price_pattern = r'<strong[^>]*class="tah p11"[^>]*id="_nowVal"[^>]*>([0-9,]+)</strong>'
        price_match = re.search(price_pattern, html)
        
        if not price_match:
            print(f"ERROR: Could not find price for {symbol}")
            return None
            
        current_price = int(price_match.group(1).replace(',', ''))
        
        # 전일 대비 추출
        change_pattern = r'<strong[^>]*class="tah p11"[^>]*>([+-]?[0-9,]+)</strong>'
        change_matches = re.findall(change_pattern, html)
        
        change = 0
        if len(change_matches) > 1:
            change = int(change_matches[1].replace(',', ''))
        
        # 거래량 추출 (선택사항)
        volume_pattern = r'거래량.*?<td[^>]*>([0-9,]+)</td>'
        volume_match = re.search(volume_pattern, html)
        volume = 0
        if volume_match:
            volume = int(volume_match.group(1).replace(',', ''))
        
        result = {
            "symbol": symbol,
            "currentPrice": current_price,
            "previousClose": current_price - change,
            "change": change,
            "changePercent": round((change / (current_price - change)) * 100, 2) if current_price - change > 0 else 0,
            "volume": volume,
            "source": "naver_requests",
            "timestamp": int(time.time())
        }
        
        print(json.dumps(result, ensure_ascii=False))
        return result
        
    except requests.exceptions.RequestException as e:
        print(f"ERROR: Network error for {symbol}: {e}")
        return None
    except Exception as e:
        print(f"ERROR: Parsing error for {symbol}: {e}")
        return None

def test_yahoo_finance(symbol):
    """Yahoo Finance API 테스트 (한국 주식)"""
    try:
        # Yahoo Finance에서 한국 주식은 .KS 또는 .KQ 접미사 필요
        yahoo_symbol = f"{symbol}.KS"  # KOSPI
        
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{yahoo_symbol}"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if 'chart' in data and 'result' in data['chart']:
                result = data['chart']['result'][0]
                meta = result['meta']
                
                print(f"Yahoo Finance - {symbol}: {meta.get('regularMarketPrice', 'N/A')}")
                return True
        else:
            # KOSDAQ 시도
            yahoo_symbol = f"{symbol}.KQ"
            url = f"https://query1.finance.yahoo.com/v8/finance/chart/{yahoo_symbol}"
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if 'chart' in data and 'result' in data['chart']:
                    result = data['chart']['result'][0]
                    meta = result['meta']
                    print(f"Yahoo Finance KOSDAQ - {symbol}: {meta.get('regularMarketPrice', 'N/A')}")
                    return True
                    
        print(f"Yahoo Finance - {symbol}: Not found")
        return False
        
    except Exception as e:
        print(f"Yahoo Finance Error for {symbol}: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 test_naver_crawler.py <stock_symbol>")
        sys.exit(1)
    
    symbol = sys.argv[1]
    
    print(f"Testing crawling methods for symbol: {symbol}")
    print("=" * 50)
    
    # 1. 네이버 금융 테스트
    print("1. Testing Naver Finance (requests)...")
    naver_result = get_stock_price_naver(symbol)
    
    print("\n" + "=" * 50)
    
    # 2. Yahoo Finance 테스트
    print("2. Testing Yahoo Finance API...")
    yahoo_result = test_yahoo_finance(symbol)
    
    print("\n" + "=" * 50)
    print("Test completed!")