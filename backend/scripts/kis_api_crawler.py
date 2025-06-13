#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
import sys
import time
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class KISAPICrawler:
    def __init__(self):
        self.app_key = os.getenv('KIS_APP_KEY')
        self.app_secret = os.getenv('KIS_APP_SECRET')
        self.access_token = None
        self.base_url = "https://openapi.koreainvestment.com:9443"
        
    def get_access_token(self):
        """Get access token from KIS API"""
        if not self.app_key or not self.app_secret:
            return None
            
        url = f"{self.base_url}/oauth2/tokenP"
        data = {
            "grant_type": "client_credentials",
            "appkey": self.app_key,
            "appsecret": self.app_secret
        }
        
        try:
            response = requests.post(url, json=data)
            if response.status_code == 200:
                self.access_token = response.json().get("access_token")
                return self.access_token
        except Exception as e:
            print(f"Failed to get access token: {e}", file=sys.stderr)
        return None
        
    def get_stock_price(self, stock_code):
        """Get stock price from KIS API"""
        if not self.access_token:
            self.get_access_token()
            
        if not self.access_token:
            return {"error": "No access token", "symbol": stock_code}
            
        url = f"{self.base_url}/uapi/domestic-stock/v1/quotations/inquire-price"
        
        headers = {
            "content-type": "application/json",
            "authorization": f"Bearer {self.access_token}",
            "appkey": self.app_key,
            "appsecret": self.app_secret,
            "tr_id": "FHKST01010100"
        }
        
        params = {
            "fid_cond_mrkt_div_code": "J",
            "fid_input_iscd": stock_code
        }
        
        try:
            response = requests.get(url, headers=headers, params=params)
            if response.status_code == 200:
                data = response.json()
                output = data.get("output", {})
                
                return {
                    "symbol": stock_code,
                    "name": output.get("prdt_abrv_name", "Unknown"),
                    "currentPrice": int(output.get("stck_prpr", 0)),
                    "previousClose": int(output.get("stck_sdpr", 0)),
                    "change": int(output.get("prdy_vrss", 0)),
                    "changePercent": float(output.get("prdy_ctrt", 0)),
                    "dayOpen": int(output.get("stck_oprc", 0)),
                    "dayHigh": int(output.get("stck_hgpr", 0)),
                    "dayLow": int(output.get("stck_lwpr", 0)),
                    "volume": int(output.get("acml_vol", 0)),
                    "timestamp": datetime.now().isoformat(),
                    "source": "kis_api"
                }
            else:
                return {
                    "error": f"API error: {response.status_code}",
                    "symbol": stock_code,
                    "message": response.text
                }
        except Exception as e:
            return {
                "error": str(e),
                "symbol": stock_code
            }

def main():
    if len(sys.argv) < 2:
        print(json.dumps([{"error": "No stock codes provided"}]))
        sys.exit(1)
    
    stock_codes = sys.argv[1].split(",")
    crawler = KISAPICrawler()
    results = []
    
    for i, code in enumerate(stock_codes):
        print(f"Crawling {code}... ({i+1}/{len(stock_codes)})", file=sys.stderr)
        result = crawler.get_stock_price(code)
        results.append(result)
        
        # Small delay to avoid rate limiting
        if i < len(stock_codes) - 1:
            time.sleep(0.5)
    
    print(json.dumps(results, ensure_ascii=False))

if __name__ == "__main__":
    main()