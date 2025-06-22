#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
import sys
import re
import time
import random
from urllib.parse import quote

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
        
        # 랜덤 딜레이 (서버 부하 방지)
        time.sleep(random.uniform(0.3, 0.8))
        
        # 네이버 금융 페이지 요청
        url = f"https://finance.naver.com/item/sise.naver?code={symbol}"
        
        session = requests.Session()
        session.headers.update(headers)
        
        response = session.get(url, timeout=10)
        response.raise_for_status()
        
        html = response.text
        
        # 종목명 추출
        name_pattern = r'<title>([^(]+)\([^)]+\)[^<]*</title>'
        name_match = re.search(name_pattern, html)
        name = name_match.group(1).strip() if name_match else symbol
        
        # 현재가 추출
        price_pattern = r'<strong[^>]*class="tah p11"[^>]*id="_nowVal"[^>]*>([0-9,]+)</strong>'
        price_match = re.search(price_pattern, html)
        
        if not price_match:
            return None
            
        current_price = int(price_match.group(1).replace(',', ''))
        
        # 전일 대비 변동가 추출
        change_pattern = r'<strong[^>]*class="tah p11"[^>]*>\s*<span[^>]*>([+-]?[0-9,]+)</span>'
        change_match = re.search(change_pattern, html)
        change = 0
        if change_match:
            change_str = change_match.group(1).replace(',', '')
            if change_str.startswith('+'):
                change = int(change_str[1:])
            elif change_str.startswith('-'):
                change = -int(change_str[1:])
            else:
                change = int(change_str)
        
        previous_close = current_price - change
        
        # 변동률 추출
        change_percent_pattern = r'<strong[^>]*class="tah p11"[^>]*>\s*<span[^>]*>([+-]?[0-9.,]+)%</span>'
        change_percent_match = re.search(change_percent_pattern, html)
        change_percent = 0.0
        if change_percent_match:
            change_percent_str = change_percent_match.group(1).replace(',', '')
            if change_percent_str.startswith('+'):
                change_percent = float(change_percent_str[1:])
            elif change_percent_str.startswith('-'):
                change_percent = -float(change_percent_str[1:])
            else:
                change_percent = float(change_percent_str)
        
        # 시가, 고가, 저가 추출
        table_pattern = r'<table[^>]*class="no_info"[^>]*>(.*?)</table>'
        table_match = re.search(table_pattern, html, re.DOTALL)
        
        day_open = current_price
        day_high = current_price  
        day_low = current_price
        volume = 0
        
        if table_match:
            table_html = table_match.group(1)
            
            # 시가
            open_pattern = r'>시가</th>\s*<td[^>]*>([0-9,]+)</td>'
            open_match = re.search(open_pattern, table_html)
            if open_match:
                day_open = int(open_match.group(1).replace(',', ''))
            
            # 고가
            high_pattern = r'>고가</th>\s*<td[^>]*>([0-9,]+)</td>'
            high_match = re.search(high_pattern, table_html)
            if high_match:
                day_high = int(high_match.group(1).replace(',', ''))
            
            # 저가
            low_pattern = r'>저가</th>\s*<td[^>]*>([0-9,]+)</td>'
            low_match = re.search(low_pattern, table_html)
            if low_match:
                day_low = int(low_match.group(1).replace(',', ''))
            
            # 거래량
            volume_pattern = r'>거래량</th>\s*<td[^>]*>([0-9,]+)</td>'
            volume_match = re.search(volume_pattern, table_html)
            if volume_match:
                volume = int(volume_match.group(1).replace(',', ''))
        
        result = {
            "symbol": symbol,
            "name": name,
            "currentPrice": current_price,
            "previousClose": previous_close,
            "change": change,
            "changePercent": change_percent,
            "dayOpen": day_open,
            "dayHigh": day_high,
            "dayLow": day_low,
            "volume": volume,
            "source": "naver_requests",
            "timestamp": int(time.time()),
            "success": True
        }
        
        print(json.dumps(result, ensure_ascii=False))
        return result
        
    except Exception as e:
        error_result = {
            "symbol": symbol,
            "success": False,
            "error": str(e),
            "source": "naver_requests"
        }
        print(json.dumps(error_result, ensure_ascii=False))
        return None

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"success": False, "error": "Usage: python3 simple_requests_crawler.py <stock_symbol>"}, ensure_ascii=False))
        sys.exit(1)
    
    symbol = sys.argv[1]
    get_stock_price_naver(symbol)