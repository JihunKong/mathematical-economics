#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import json
import sys
import time
import random
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class SeleniumStockCrawler:
    def __init__(self):
        # Chrome options for headless mode
        self.chrome_options = Options()
        self.chrome_options.add_argument('--headless')  # Run in background
        self.chrome_options.add_argument('--no-sandbox')
        self.chrome_options.add_argument('--disable-dev-shm-usage')
        self.chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        self.chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        self.chrome_options.add_experimental_option('useAutomationExtension', False)
        self.chrome_options.add_argument('--disable-gpu')
        self.chrome_options.add_argument('--window-size=1920,1080')
        
        # User agent rotation
        user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ]
        self.chrome_options.add_argument(f'user-agent={random.choice(user_agents)}')
        
        self.driver = None
        
    def start_driver(self):
        """Start Chrome WebDriver"""
        try:
            # Try different ways to initialize the driver
            try:
                # First try with Service (newer approach)
                from webdriver_manager.chrome import ChromeDriverManager
                service = Service(ChromeDriverManager().install())
                self.driver = webdriver.Chrome(service=service, options=self.chrome_options)
            except:
                # Fallback to default
                self.driver = webdriver.Chrome(options=self.chrome_options)
                
            # Execute script to hide webdriver
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            logger.info("Chrome WebDriver started successfully")
        except Exception as e:
            logger.error(f"Failed to start Chrome WebDriver: {e}")
            raise
    
    def close_driver(self):
        """Close Chrome WebDriver"""
        if self.driver:
            self.driver.quit()
            
    def parse_number(self, text):
        """Parse Korean number format"""
        if not text:
            return 0
        try:
            # Remove commas and convert
            return int(text.replace(',', '').replace(' ', '').replace('원', ''))
        except:
            return 0
            
    def crawl_naver_with_selenium(self, stock_code):
        """Crawl stock data using Selenium"""
        try:
            if not self.driver:
                self.start_driver()
                
            # Navigate to stock page
            url = f"https://finance.naver.com/item/main.naver?code={stock_code}"
            logger.info(f"Navigating to {url}")
            self.driver.get(url)
            
            # Wait for page to load
            wait = WebDriverWait(self.driver, 10)
            
            # Get stock name
            try:
                stock_name_element = wait.until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, ".wrap_company h2 a"))
                )
                stock_name = stock_name_element.text.strip()
            except:
                stock_name = "Unknown"
                
            # Get current price - try multiple selectors
            current_price = 0
            price_selectors = [
                "p.no_today .blind",
                "div.today .blind",
                "dl.blind dd:nth-of-type(4)"
            ]
            
            for selector in price_selectors:
                try:
                    price_element = self.driver.find_element(By.CSS_SELECTOR, selector)
                    price_text = price_element.text
                    current_price = self.parse_number(price_text)
                    if current_price > 0:
                        logger.info(f"Found current price: {current_price}")
                        break
                except:
                    continue
                    
            # If still no price, try JavaScript execution
            if current_price == 0:
                try:
                    price_value = self.driver.execute_script(
                        "return document.querySelector('p.no_today .blind')?.textContent || "
                        "document.querySelector('div.today .blind')?.textContent || '0'"
                    )
                    current_price = self.parse_number(price_value)
                except:
                    pass
                    
            # Get additional info from table
            previous_close = 0
            day_open = 0
            day_high = 0
            day_low = 0
            volume = 0
            
            try:
                # Previous close
                prev_element = self.driver.find_element(By.CSS_SELECTOR, "table.no_info tr:first-child td.first .blind")
                previous_close = self.parse_number(prev_element.text)
                
                # Day open
                open_element = self.driver.find_element(By.CSS_SELECTOR, "table.no_info tr:nth-child(2) td.first .blind")
                day_open = self.parse_number(open_element.text)
                
                # Day high
                high_element = self.driver.find_element(By.CSS_SELECTOR, "table.no_info tr:first-child td:nth-child(2) .blind")
                day_high = self.parse_number(high_element.text)
                
                # Day low
                low_element = self.driver.find_element(By.CSS_SELECTOR, "table.no_info tr:nth-child(2) td:nth-child(2) .blind")
                day_low = self.parse_number(low_element.text)
                
                # Volume
                volume_element = self.driver.find_element(By.CSS_SELECTOR, "table.no_info tr:nth-child(3) td.first .blind")
                volume = self.parse_number(volume_element.text)
            except Exception as e:
                logger.warning(f"Failed to get some additional data: {e}")
                
            # Calculate change
            change = current_price - previous_close if current_price and previous_close else 0
            change_percent = (change / previous_close * 100) if previous_close > 0 else 0
            
            return {
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
                "source": "selenium_naver_crawler"
            }
            
        except TimeoutException:
            logger.error(f"Timeout while crawling {stock_code}")
            return {
                "error": "Page load timeout",
                "symbol": stock_code,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error crawling {stock_code}: {e}")
            return {
                "error": str(e),
                "symbol": stock_code,
                "timestamp": datetime.now().isoformat()
            }
            
    def crawl_daum_api(self, stock_code):
        """Try Daum Finance API as alternative"""
        try:
            # Daum Finance API endpoint
            api_url = f"https://finance.daum.net/api/quotes/A{stock_code}"
            
            # Use requests session with proper headers
            import requests
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://finance.daum.net/',
                'Accept': 'application/json',
            }
            
            response = requests.get(api_url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                return {
                    "symbol": stock_code,
                    "name": data.get('name', 'Unknown'),
                    "currentPrice": int(data.get('tradePrice', 0)),
                    "previousClose": int(data.get('prevClosingPrice', 0)),
                    "change": int(data.get('change', 0)),
                    "changePercent": float(data.get('changeRate', 0) * 100),
                    "dayOpen": int(data.get('openingPrice', 0)),
                    "dayHigh": int(data.get('highPrice', 0)),
                    "dayLow": int(data.get('lowPrice', 0)),
                    "volume": int(data.get('accTradeVolume', 0)),
                    "timestamp": datetime.now().isoformat(),
                    "source": "daum_api"
                }
        except Exception as e:
            logger.error(f"Daum API failed for {stock_code}: {e}")
            return None

def main():
    if len(sys.argv) < 2:
        print(json.dumps([{"error": "No stock codes provided"}]))
        sys.exit(1)
    
    stock_codes = sys.argv[1].split(",")
    crawler = SeleniumStockCrawler()
    results = []
    
    try:
        for i, code in enumerate(stock_codes):
            logger.info(f"Crawling {code}... ({i+1}/{len(stock_codes)})")
            
            # Try Daum API first (faster and more reliable)
            result = crawler.crawl_daum_api(code)
            
            # If Daum fails, try Selenium on Naver
            if not result or result.get('currentPrice', 0) == 0:
                result = crawler.crawl_naver_with_selenium(code)
            
            results.append(result)
            
            # Random delay between requests
            if i < len(stock_codes) - 1:
                delay = random.uniform(1, 3)
                logger.info(f"Waiting {delay:.1f} seconds before next request...")
                time.sleep(delay)
                
    finally:
        crawler.close_driver()
    
    print(json.dumps(results, ensure_ascii=False))

if __name__ == "__main__":
    main()