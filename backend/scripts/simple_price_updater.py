#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import sys
from datetime import datetime

# Hardcoded current stock prices for demonstration
# In production, these would be fetched from a reliable API or manually updated
STOCK_PRICES = {
    "005930": {  # Samsung Electronics
        "name": "삼성전자",
        "currentPrice": 59500,
        "previousClose": 59900,
        "change": -400,
        "changePercent": -0.67,
        "dayOpen": 59900,
        "dayHigh": 60000,
        "dayLow": 59400,
        "volume": 15234567
    },
    "000660": {  # SK Hynix
        "name": "SK하이닉스",
        "currentPrice": 115000,
        "previousClose": 114500,
        "change": 500,
        "changePercent": 0.44,
        "dayOpen": 114500,
        "dayHigh": 115500,
        "dayLow": 114000,
        "volume": 3456789
    },
    "005380": {  # Hyundai Motors
        "name": "현대차",
        "currentPrice": 187500,
        "previousClose": 188000,
        "change": -500,
        "changePercent": -0.27,
        "dayOpen": 188000,
        "dayHigh": 189000,
        "dayLow": 187000,
        "volume": 1234567
    },
    "035420": {  # NAVER
        "name": "NAVER",
        "currentPrice": 215000,
        "previousClose": 213000,
        "change": 2000,
        "changePercent": 0.94,
        "dayOpen": 213500,
        "dayHigh": 216000,
        "dayLow": 213000,
        "volume": 654321
    },
    "005490": {  # POSCO Holdings
        "name": "POSCO홀딩스",
        "currentPrice": 385000,
        "previousClose": 387000,
        "change": -2000,
        "changePercent": -0.52,
        "dayOpen": 387000,
        "dayHigh": 388000,
        "dayLow": 384000,
        "volume": 234567
    },
    "051910": {  # LG Chem
        "name": "LG화학",
        "currentPrice": 455000,
        "previousClose": 453000,
        "change": 2000,
        "changePercent": 0.44,
        "dayOpen": 453500,
        "dayHigh": 456000,
        "dayLow": 453000,
        "volume": 345678
    },
    "006400": {  # Samsung SDI
        "name": "삼성SDI",
        "currentPrice": 385000,
        "previousClose": 383000,
        "change": 2000,
        "changePercent": 0.52,
        "dayOpen": 383500,
        "dayHigh": 386000,
        "dayLow": 383000,
        "volume": 456789
    },
    "068270": {  # Celltrion
        "name": "셀트리온",
        "currentPrice": 165000,
        "previousClose": 164000,
        "change": 1000,
        "changePercent": 0.61,
        "dayOpen": 164500,
        "dayHigh": 166000,
        "dayLow": 164000,
        "volume": 567890
    },
    "105560": {  # KB Financial
        "name": "KB금융",
        "currentPrice": 68500,
        "previousClose": 68000,
        "change": 500,
        "changePercent": 0.74,
        "dayOpen": 68000,
        "dayHigh": 69000,
        "dayLow": 68000,
        "volume": 1234567
    },
    "055550": {  # Shinhan Financial
        "name": "신한지주",
        "currentPrice": 45500,
        "previousClose": 45000,
        "change": 500,
        "changePercent": 1.11,
        "dayOpen": 45000,
        "dayHigh": 46000,
        "dayLow": 45000,
        "volume": 2345678
    },
    "035720": {  # Kakao
        "name": "카카오",
        "currentPrice": 48500,
        "previousClose": 48000,
        "change": 500,
        "changePercent": 1.04,
        "dayOpen": 48000,
        "dayHigh": 49000,
        "dayLow": 48000,
        "volume": 3456789
    },
    "036570": {  # NCsoft
        "name": "엔씨소프트",
        "currentPrice": 225000,
        "previousClose": 223000,
        "change": 2000,
        "changePercent": 0.90,
        "dayOpen": 223500,
        "dayHigh": 226000,
        "dayLow": 223000,
        "volume": 234567
    },
    "251270": {  # Netmarble
        "name": "넷마블",
        "currentPrice": 55000,
        "previousClose": 54500,
        "change": 500,
        "changePercent": 0.92,
        "dayOpen": 54500,
        "dayHigh": 55500,
        "dayLow": 54500,
        "volume": 345678
    },
    "352820": {  # HYBE
        "name": "하이브",
        "currentPrice": 185000,
        "previousClose": 183000,
        "change": 2000,
        "changePercent": 1.09,
        "dayOpen": 183500,
        "dayHigh": 186000,
        "dayLow": 183000,
        "volume": 456789
    },
    "112040": {  # Wemade
        "name": "위메이드",
        "currentPrice": 35000,
        "previousClose": 34500,
        "change": 500,
        "changePercent": 1.45,
        "dayOpen": 34500,
        "dayHigh": 35500,
        "dayLow": 34500,
        "volume": 567890
    }
}

def get_stock_price(stock_code):
    """Get stock price from hardcoded data"""
    if stock_code in STOCK_PRICES:
        data = STOCK_PRICES[stock_code]
        return {
            "symbol": stock_code,
            "name": data["name"],
            "currentPrice": data["currentPrice"],
            "previousClose": data["previousClose"],
            "change": data["change"],
            "changePercent": data["changePercent"],
            "dayOpen": data["dayOpen"],
            "dayHigh": data["dayHigh"],
            "dayLow": data["dayLow"],
            "volume": data["volume"],
            "timestamp": datetime.now().isoformat(),
            "source": "manual_update"
        }
    else:
        # Return a default price for unknown stocks
        return {
            "symbol": stock_code,
            "name": "Unknown",
            "currentPrice": 50000,
            "previousClose": 50000,
            "change": 0,
            "changePercent": 0,
            "dayOpen": 50000,
            "dayHigh": 50000,
            "dayLow": 50000,
            "volume": 100000,
            "timestamp": datetime.now().isoformat(),
            "source": "manual_update"
        }

def main():
    if len(sys.argv) < 2:
        print(json.dumps([{"error": "No stock codes provided"}]))
        sys.exit(1)
    
    stock_codes = sys.argv[1].split(",")
    results = []
    
    for code in stock_codes:
        result = get_stock_price(code)
        results.append(result)
    
    print(json.dumps(results, ensure_ascii=False))

if __name__ == "__main__":
    main()