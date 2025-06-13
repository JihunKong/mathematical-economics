#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
from bs4 import BeautifulSoup
import json
import sys
import time
import random
from datetime import datetime
from urllib.parse import urlencode

class AdvancedStockCrawler:
    def __init__(self):
        # 세션 생성 (쿠키 유지)
        self.session = requests.Session()
        
        # 다양한 User-Agent 목록
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
        ]
        
        # 기본 헤더 설정
        self.base_headers = {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Pragma': 'no-cache',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
        }
        
    def get_random_headers(self):
        """랜덤 헤더 생성"""
        headers = self.base_headers.copy()
        headers['User-Agent'] = random.choice(self.user_agents)
        return headers
    
    def get_with_retry(self, url, max_retries=3, initial_delay=1):
        """재시도 로직을 포함한 GET 요청"""
        for attempt in range(max_retries):
            try:
                # 요청 전 랜덤 딜레이
                delay = initial_delay * (2 ** attempt) + random.uniform(0.5, 1.5)
                time.sleep(delay)
                
                # 요청 실행
                response = self.session.get(
                    url, 
                    headers=self.get_random_headers(),
                    timeout=30,
                    allow_redirects=True
                )
                
                if response.status_code == 200:
                    return response
                else:
                    print(f"Status code: {response.status_code}, retrying...")
                    
            except requests.exceptions.RequestException as e:
                print(f"Request error on attempt {attempt + 1}: {str(e)}")
                
                if attempt == max_retries - 1:
                    raise
        
        return None
    
    def parse_number(self, text):
        """숫자 파싱 (쉼표 제거 및 정수 변환)"""
        if not text:
            return 0
        try:
            return int(text.replace(',', '').replace(' ', ''))
        except:
            return 0
    
    def crawl_naver_stock(self, stock_code):
        """네이버 증권에서 주식 정보를 크롤링"""
        try:
            # 메인 페이지 먼저 방문 (세션 쿠키 획득)
            main_url = "https://finance.naver.com"
            self.get_with_retry(main_url)
            
            # 잠시 대기
            time.sleep(random.uniform(1, 2))
            
            # 종목 페이지 접근
            stock_url = f"https://finance.naver.com/item/main.naver?code={stock_code}"
            response = self.get_with_retry(stock_url)
            
            if not response:
                return {"error": "Failed to fetch page", "symbol": stock_code}
            
            # HTML 파싱
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # 종목명
            stock_name = soup.select_one('.wrap_company h2 a')
            stock_name = stock_name.text.strip() if stock_name else "Unknown"
            
            # 현재가 - 여러 셀렉터 시도
            current_price = None
            price_selectors = [
                'p.no_today .blind',
                'div.today .blind',
                'strong.tah:contains("현재가") + em .blind',
                'dl.blind dd:nth-of-type(4)'  # 스크린리더용 데이터
            ]
            
            for selector in price_selectors:
                element = soup.select_one(selector)
                if element:
                    current_price = self.parse_number(element.text)
                    if current_price > 0:
                        break
            
            if not current_price:
                # JavaScript로 렌더링되는 경우 대비 - JSON-LD 데이터 확인
                scripts = soup.find_all('script', type='application/ld+json')
                for script in scripts:
                    try:
                        data = json.loads(script.string)
                        if 'price' in str(data):
                            # 데이터 구조에 따라 파싱 로직 추가
                            pass
                    except:
                        pass
            
            # 테이블에서 추가 정보 추출
            info_table = soup.select_one('table.no_info')
            previous_close = 0
            day_open = 0
            day_high = 0
            day_low = 0
            volume = 0
            
            if info_table:
                # 전일 종가
                prev_elem = info_table.select_one('tr:first-child td.first .blind')
                if prev_elem:
                    previous_close = self.parse_number(prev_elem.text)
                
                # 시가
                open_elem = info_table.select_one('tr:nth-child(2) td.first .blind')
                if open_elem:
                    day_open = self.parse_number(open_elem.text)
                
                # 고가
                high_elem = info_table.select_one('tr:first-child td:nth-child(2) .blind')
                if high_elem:
                    day_high = self.parse_number(high_elem.text)
                
                # 저가
                low_elem = info_table.select_one('tr:nth-child(2) td:nth-child(2) .blind')
                if low_elem:
                    day_low = self.parse_number(low_elem.text)
            
            # 거래량
            volume_elem = soup.select_one('tr:contains("거래량") td .blind')
            if volume_elem:
                volume = self.parse_number(volume_elem.text)
            
            # 전일 대비 계산
            change = current_price - previous_close if current_price and previous_close else 0
            change_percent = (change / previous_close * 100) if previous_close > 0 else 0
            
            return {
                "symbol": stock_code,
                "name": stock_name,
                "currentPrice": current_price or 0,
                "previousClose": previous_close,
                "change": change,
                "changePercent": round(change_percent, 2),
                "dayOpen": day_open,
                "dayHigh": day_high,
                "dayLow": day_low,
                "volume": volume,
                "timestamp": datetime.now().isoformat(),
                "source": "advanced_naver_crawler"
            }
            
        except Exception as e:
            return {
                "error": str(e),
                "symbol": stock_code,
                "timestamp": datetime.now().isoformat()
            }
    
    def crawl_naver_sise_api(self, stock_code):
        """네이버 시세 API 직접 호출 (대안)"""
        try:
            # 네이버 증권 API 엔드포인트
            api_url = "https://api.finance.naver.com/service/itemSummary.nhn"
            params = {
                'itemcode': stock_code
            }
            
            headers = self.get_random_headers()
            headers['Referer'] = f'https://finance.naver.com/item/main.naver?code={stock_code}'
            headers['X-Requested-With'] = 'XMLHttpRequest'
            
            response = self.session.get(api_url, params=params, headers=headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                
                return {
                    "symbol": stock_code,
                    "name": data.get('itemname', 'Unknown'),
                    "currentPrice": int(data.get('now', 0)),
                    "previousClose": int(data.get('close', 0)),
                    "change": int(data.get('diff', 0)),
                    "changePercent": float(data.get('rate', 0)),
                    "dayOpen": int(data.get('open', 0)),
                    "dayHigh": int(data.get('high', 0)),
                    "dayLow": int(data.get('low', 0)),
                    "volume": int(data.get('quant', 0)),
                    "timestamp": datetime.now().isoformat(),
                    "source": "naver_api"
                }
        except Exception as e:
            print(f"API call failed: {str(e)}")
            return None

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No stock codes provided"}))
        sys.exit(1)
    
    stock_codes = sys.argv[1].split(",")
    crawler = AdvancedStockCrawler()
    results = []
    
    for i, code in enumerate(stock_codes):
        print(f"Crawling {code}... ({i+1}/{len(stock_codes)})", file=sys.stderr)
        
        # 먼저 API 시도
        result = crawler.crawl_naver_sise_api(code)
        
        # API 실패시 웹 크롤링
        if not result or result.get('currentPrice', 0) == 0:
            result = crawler.crawl_naver_stock(code)
        
        results.append(result)
        
        # 다음 요청 전 대기 (1-3초 랜덤)
        if i < len(stock_codes) - 1:
            time.sleep(random.uniform(1, 3))
    
    print(json.dumps(results, ensure_ascii=False))

if __name__ == "__main__":
    main()