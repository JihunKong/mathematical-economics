#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
import sys
from datetime import datetime
import yfinance as yf

def get_stock_from_yahoo(symbol):
    """Yahoo Finance에서 주식 정보 가져오기"""
    try:
        # 한국 주식은 .KS (KOSPI) 또는 .KQ (KOSDAQ) 접미사 필요
        ticker_symbol = f"{symbol}.KS"
        ticker = yf.Ticker(ticker_symbol)
        
        # 최신 정보 가져오기
        info = ticker.info
        history = ticker.history(period="1d")
        
        if history.empty:
            # KOSDAQ 시도
            ticker_symbol = f"{symbol}.KQ"
            ticker = yf.Ticker(ticker_symbol)
            info = ticker.info
            history = ticker.history(period="1d")
        
        if not history.empty:
            current_price = history['Close'].iloc[-1]
            open_price = history['Open'].iloc[-1]
            high_price = history['High'].iloc[-1]
            low_price = history['Low'].iloc[-1]
            volume = int(history['Volume'].iloc[-1])
            
            # 전일 종가 가져오기
            history_2d = ticker.history(period="2d")
            if len(history_2d) >= 2:
                previous_close = history_2d['Close'].iloc[-2]
            else:
                previous_close = current_price
            
            change = current_price - previous_close
            change_percent = (change / previous_close * 100) if previous_close > 0 else 0
            
            return {
                "symbol": symbol,
                "name": info.get('longName', symbol),
                "currentPrice": round(current_price),
                "previousClose": round(previous_close),
                "change": round(change),
                "changePercent": round(change_percent, 2),
                "dayOpen": round(open_price),
                "dayHigh": round(high_price),
                "dayLow": round(low_price),
                "volume": volume,
                "timestamp": datetime.now().isoformat(),
                "source": "yahoo_finance"
            }
    except Exception as e:
        print(f"Yahoo Finance error for {symbol}: {e}", file=sys.stderr)
    
    return None

def get_stock_from_investing(symbol):
    """Investing.com API 사용 (백업)"""
    try:
        # 주요 한국 주식 매핑
        symbol_map = {
            "005930": "samsung-electronics-co-ltd",  # 삼성전자
            "000660": "sk-hynix-inc",  # SK하이닉스
            "035420": "naver-corp",  # 네이버
            "005380": "hyundai-motor-co",  # 현대차
            "051910": "lg-chem-ltd",  # LG화학
            "006400": "samsung-sdi-co-ltd",  # 삼성SDI
            "035720": "kakao-corp",  # 카카오
            "068270": "celltrion-inc",  # 셀트리온
            "105560": "kb-financial-group",  # KB금융
            "055550": "shinhan-financial-group-co-ltd",  # 신한지주
        }
        
        if symbol not in symbol_map:
            return None
            
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        # Investing.com의 경우 직접 API가 없으므로 스킵
        return None
        
    except Exception as e:
        print(f"Investing.com error for {symbol}: {e}", file=sys.stderr)
        return None

def get_realtime_stock_price(symbol):
    """여러 소스에서 실시간 주식 가격 가져오기"""
    # Yahoo Finance 시도
    result = get_stock_from_yahoo(symbol)
    if result and result['currentPrice'] > 0:
        return result
    
    # 대체 소스 시도
    result = get_stock_from_investing(symbol)
    if result:
        return result
    
    # 모든 시도 실패 시 에러 반환
    return {
        "error": "Failed to fetch real-time price",
        "symbol": symbol,
        "timestamp": datetime.now().isoformat()
    }

def main():
    if len(sys.argv) < 2:
        print(json.dumps([{"error": "No stock codes provided"}]))
        sys.exit(1)
    
    stock_codes = sys.argv[1].split(",")
    results = []
    
    for code in stock_codes:
        result = get_realtime_stock_price(code)
        results.append(result)
    
    print(json.dumps(results, ensure_ascii=False))

if __name__ == "__main__":
    main()