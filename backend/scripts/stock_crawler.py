#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
from bs4 import BeautifulSoup
import json
import sys
import time
from datetime import datetime

def crawl_naver_stock(stock_code):
    """네이버 증권에서 주식 정보를 크롤링합니다."""
    try:
        # 네이버 증권 페이지 URL
        url = f"https://finance.naver.com/item/main.naver?code={stock_code}"
        
        # 헤더 설정 (봇 차단 방지)
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # 웹 페이지 소스코드 가져오기
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        # HTML 파싱
        soup = BeautifulSoup(response.content, "html.parser")
        
        # 종목명
        stock_name = soup.find("div", {"class": "wrap_company"})
        if stock_name:
            stock_name = stock_name.find("h2").text.strip()
        else:
            stock_name = "Unknown"
        
        # 현재가
        current_price = soup.find("p", {"class": "no_today"})
        if current_price:
            current_price = current_price.find("span", {"class": "blind"}).text.strip()
            current_price = int(current_price.replace(",", ""))
        else:
            current_price = 0
        
        # 전일 종가
        table = soup.find("table", {"class": "no_info"})
        previous_close = 0
        if table:
            first_td = table.find("td", {"class": "first"})
            if first_td:
                previous_close_span = first_td.find("span", {"class": "blind"})
                if previous_close_span:
                    previous_close = int(previous_close_span.text.replace(",", ""))
        
        # 시가, 고가, 저가
        day_open = 0
        day_high = 0
        day_low = 0
        
        if table:
            all_tds = table.find_all("td")
            for i, td in enumerate(all_tds):
                blind_span = td.find("span", {"class": "blind"})
                if blind_span:
                    value = int(blind_span.text.replace(",", ""))
                    if i == 0:  # 전일
                        previous_close = value
                    elif i == 1:  # 시가
                        day_open = value
                    elif i == 2:  # 고가
                        day_high = value
                    elif i == 3:  # 저가
                        day_low = value
        
        # 거래량
        volume = 0
        volume_td = soup.find("td", {"class": "pgRR"})
        if volume_td:
            volume_span = volume_td.find("span", {"class": "blind"})
            if volume_span:
                volume = int(volume_span.text.replace(",", ""))
        
        # 전일 대비
        change = current_price - previous_close
        change_percent = 0
        if previous_close > 0:
            change_percent = (change / previous_close) * 100
        
        # 결과 반환
        result = {
            "symbol": stock_code,
            "name": stock_name,
            "currentPrice": current_price,
            "previousClose": previous_close,
            "change": change,
            "changePercent": round(change_percent, 2),
            "dayOpen": day_open,
            "dayHigh": day_high,
            "dayLow": day_low,
            "volume": volume,
            "timestamp": datetime.now().isoformat(),
            "source": "naver_crawler"
        }
        
        return result
        
    except Exception as e:
        return {
            "error": str(e),
            "symbol": stock_code,
            "timestamp": datetime.now().isoformat()
        }

def crawl_multiple_stocks(stock_codes):
    """여러 종목을 크롤링합니다."""
    results = []
    
    for code in stock_codes:
        result = crawl_naver_stock(code)
        results.append(result)
        
        # 요청 간 딜레이 (서버 부하 방지)
        time.sleep(0.5)
    
    return results

if __name__ == "__main__":
    # 명령행 인자로 종목 코드 받기
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No stock codes provided"}))
        sys.exit(1)
    
    stock_codes = sys.argv[1].split(",")
    
    # 크롤링 실행
    results = crawl_multiple_stocks(stock_codes)
    
    # JSON 형태로 출력
    print(json.dumps(results, ensure_ascii=False))