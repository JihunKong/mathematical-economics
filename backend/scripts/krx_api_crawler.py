#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
import sys
from datetime import datetime

class KRXAPICrawler:
    def __init__(self):
        self.session = requests.Session()
        # KRX API는 더 개방적입니다
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Origin': 'http://data.krx.co.kr',
            'Referer': 'http://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd?menuId=MDC0201020502',
        }
    
    def get_stock_data(self, symbol):
        """Get stock data from KRX API"""
        try:
            # KRX uses a different endpoint
            url = "http://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd"
            
            # Current date for query
            today = datetime.now().strftime('%Y%m%d')
            
            # Form data for the request
            data = {
                'bld': 'dbms/MDC/STAT/standard/MDCSTAT01501',
                'locale': 'ko_KR',
                'tboxisuCd_finder_stkisu0_0': f'{symbol}/주식',
                'isuCd': f'KR7{symbol}003',
                'isuCd2': f'KR7{symbol}003',
                'codeNmisuCd_finder_stkisu0_0': '삼성전자/005930',
                'param1isuCd_finder_stkisu0_0': '',
                'strtDd': today,
                'endDd': today,
                'share': '1',
                'money': '1',
                'csvxls_isNo': 'false',
            }
            
            response = self.session.post(url, headers=self.headers, data=data, timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                
                if result.get('OutBlock_1') and len(result['OutBlock_1']) > 0:
                    stock_data = result['OutBlock_1'][0]
                    
                    # Parse the data
                    current_price = int(stock_data.get('TDD_CLSPRC', '0').replace(',', ''))
                    prev_close = int(stock_data.get('TDD_OPNPRC', '0').replace(',', ''))
                    
                    return {
                        "symbol": symbol,
                        "name": stock_data.get('ISU_ABBRV', 'Unknown'),
                        "currentPrice": current_price,
                        "previousClose": prev_close,
                        "change": current_price - prev_close,
                        "changePercent": ((current_price - prev_close) / prev_close * 100) if prev_close > 0 else 0,
                        "dayOpen": int(stock_data.get('TDD_OPNPRC', '0').replace(',', '')),
                        "dayHigh": int(stock_data.get('TDD_HGPRC', '0').replace(',', '')),
                        "dayLow": int(stock_data.get('TDD_LWPRC', '0').replace(',', '')),
                        "volume": int(stock_data.get('ACC_TRDVOL', '0').replace(',', '')),
                        "timestamp": datetime.now().isoformat(),
                        "source": "krx_api"
                    }
            
            return None
            
        except Exception as e:
            print(f"KRX API error: {e}", file=sys.stderr)
            return None
    
    def get_simple_price(self, symbol):
        """Try simpler KRX endpoint"""
        try:
            # Alternative endpoint
            url = "http://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd"
            
            data = {
                'bld': 'dbms/MDC/STAT/standard/MDCSTAT01901',
                'locale': 'ko_KR',
                'isuCd': f'KR7{symbol}003',
                'strtDd': datetime.now().strftime('%Y%m%d'),
                'endDd': datetime.now().strftime('%Y%m%d'),
            }
            
            response = self.session.post(url, headers=self.headers, data=data, timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('output') and len(result['output']) > 0:
                    item = result['output'][0]
                    
                    return {
                        "symbol": symbol,
                        "name": item.get('ISU_NM', 'Unknown'),
                        "currentPrice": int(float(item.get('TDD_CLSPRC', '0').replace(',', ''))),
                        "previousClose": int(float(item.get('PRVDD_CLSPRC', '0').replace(',', ''))),
                        "change": int(float(item.get('FLUC_TP_CD', '0').replace(',', ''))),
                        "changePercent": float(item.get('FLUC_RT', '0').replace(',', '')),
                        "dayOpen": int(float(item.get('TDD_OPNPRC', '0').replace(',', ''))),
                        "dayHigh": int(float(item.get('TDD_HGPRC', '0').replace(',', ''))),
                        "dayLow": int(float(item.get('TDD_LWPRC', '0').replace(',', ''))),
                        "volume": int(float(item.get('ACC_TRDVOL', '0').replace(',', ''))),
                        "timestamp": datetime.now().isoformat(),
                        "source": "krx_simple_api"
                    }
                    
        except Exception as e:
            print(f"Simple KRX API error: {e}", file=sys.stderr)
            
        return None

def main():
    if len(sys.argv) < 2:
        print(json.dumps([{"error": "No stock codes provided"}]))
        sys.exit(1)
    
    stock_codes = sys.argv[1].split(",")
    crawler = KRXAPICrawler()
    results = []
    
    for code in stock_codes:
        # Try KRX API
        result = crawler.get_stock_data(code)
        
        # If failed, try simpler endpoint
        if not result:
            result = crawler.get_simple_price(code)
        
        # If still failed, return error
        if not result:
            result = {
                "error": "Failed to fetch from KRX",
                "symbol": code,
                "timestamp": datetime.now().isoformat()
            }
        
        results.append(result)
    
    print(json.dumps(results, ensure_ascii=False))

if __name__ == "__main__":
    main()