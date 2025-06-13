#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import asyncio
from playwright.async_api import async_playwright
import json
import sys
import time
import random
from datetime import datetime
import logging
import aiohttp

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class PlaywrightStockCrawler:
    def __init__(self):
        self.browser = None
        self.context = None
        
    async def start_browser(self):
        """Start Playwright browser with stealth mode"""
        playwright = await async_playwright().start()
        
        # Use Chromium with stealth settings
        self.browser = await playwright.chromium.launch(
            headless=True,
            args=[
                '--disable-blink-features=AutomationControlled',
                '--disable-dev-shm-usage',
                '--no-sandbox',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process',
                '--disable-site-isolation-trials'
            ]
        )
        
        # Create context with anti-detection measures
        self.context = await self.browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            locale='ko-KR',
            timezone_id='Asia/Seoul',
            permissions=['geolocation'],
            geolocation={'latitude': 37.5665, 'longitude': 126.9780},
            ignore_https_errors=True
        )
        
        # Add stealth scripts
        await self.context.add_init_script("""
            // Overwrite the navigator.webdriver property
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });
            
            // Mock chrome object
            window.chrome = {
                runtime: {}
            };
            
            // Mock permissions
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (parameters) => (
                parameters.name === 'notifications' ?
                    Promise.resolve({ state: Notification.permission }) :
                    originalQuery(parameters)
            );
        """)
        
    async def close_browser(self):
        """Close browser"""
        if self.context:
            await self.context.close()
        if self.browser:
            await self.browser.close()
            
    def parse_number(self, text):
        """Parse Korean number format"""
        if not text:
            return 0
        try:
            # Remove commas and convert
            return int(text.replace(',', '').replace(' ', '').replace('원', ''))
        except:
            return 0
            
    async def crawl_with_api_first(self, stock_code):
        """Try KRX API first (official Korea Exchange API)"""
        try:
            # KRX provides official stock data
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
                'Accept-Language': 'ko-KR,ko;q=0.9',
                'Origin': 'http://data.krx.co.kr',
                'Referer': 'http://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd?menuId=MDC0201',
            }
            
            # KRX data endpoint
            url = 'http://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd'
            
            data = {
                'bld': 'dbms/MDC/STAT/standard/MDCSTAT01501',
                'locale': 'ko_KR',
                'isuCd': f'KR7{stock_code}002',
                'isuCd2': f'KR7{stock_code}002',
                'strtDd': datetime.now().strftime('%Y%m%d'),
                'endDd': datetime.now().strftime('%Y%m%d'),
                'adjStkPrc_check': 'Y',
                'adjStkPrc': '2',
                'share': '1',
                'money': '1',
                'csvxls_isNo': 'false',
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, headers=headers, data=data) as response:
                    if response.status == 200:
                        result = await response.json()
                        if result.get('OutBlock_1'):
                            data = result['OutBlock_1'][0]
                            
                            current_price = int(data.get('TDD_CLSPRC', '0').replace(',', ''))
                            previous_close = int(data.get('TDD_OPNPRC', '0').replace(',', ''))
                            change = int(data.get('CMPPREVDD_PRC', '0').replace(',', ''))
                            change_percent = float(data.get('FLUC_RT', '0').replace(',', ''))
                            
                            return {
                                "symbol": stock_code,
                                "name": data.get('ISU_ABBRV', 'Unknown'),
                                "currentPrice": current_price,
                                "previousClose": previous_close,
                                "change": change,
                                "changePercent": change_percent,
                                "dayOpen": int(data.get('TDD_OPNPRC', '0').replace(',', '')),
                                "dayHigh": int(data.get('TDD_HGPRC', '0').replace(',', '')),
                                "dayLow": int(data.get('TDD_LWPRC', '0').replace(',', '')),
                                "volume": int(data.get('ACC_TRDVOL', '0').replace(',', '')),
                                "timestamp": datetime.now().isoformat(),
                                "source": "krx_api"
                            }
        except Exception as e:
            logger.error(f"KRX API failed for {stock_code}: {e}")
            
        return None
        
    async def crawl_finance_page(self, stock_code):
        """Crawl using multiple finance sites with fallback"""
        page = None
        try:
            page = await self.context.new_page()
            
            # Try multiple finance sites
            sites = [
                {
                    'name': 'investing.com',
                    'url': f'https://kr.investing.com/search/?q={stock_code}',
                    'selectors': {
                        'price': '[data-test="instrument-price-last"]',
                        'change': '[data-test="instrument-price-change"]',
                        'change_percent': '[data-test="instrument-price-change-percent"]'
                    }
                },
                {
                    'name': 'finance.yahoo.com',
                    'url': f'https://finance.yahoo.com/quote/{stock_code}.KS',
                    'selectors': {
                        'price': '[data-field="regularMarketPrice"]',
                        'previous_close': '[data-field="regularMarketPreviousClose"]',
                        'open': '[data-field="regularMarketOpen"]',
                        'high': '[data-field="regularMarketDayHigh"]',
                        'low': '[data-field="regularMarketDayLow"]',
                        'volume': '[data-field="regularMarketVolume"]'
                    }
                }
            ]
            
            for site in sites:
                try:
                    logger.info(f"Trying {site['name']} for {stock_code}")
                    await page.goto(site['url'], wait_until='networkidle', timeout=30000)
                    
                    # Wait a bit for dynamic content
                    await page.wait_for_timeout(2000)
                    
                    # Extract data based on site
                    if site['name'] == 'investing.com':
                        # Search and click on first result
                        search_results = await page.query_selector_all('.js-inner-all-results-quote-item')
                        if search_results:
                            await search_results[0].click()
                            await page.wait_for_timeout(2000)
                            
                            price_elem = await page.query_selector(site['selectors']['price'])
                            if price_elem:
                                price_text = await price_elem.inner_text()
                                current_price = self.parse_number(price_text)
                                
                                if current_price > 0:
                                    return {
                                        "symbol": stock_code,
                                        "name": "Unknown",
                                        "currentPrice": current_price,
                                        "previousClose": 0,
                                        "change": 0,
                                        "changePercent": 0,
                                        "dayOpen": 0,
                                        "dayHigh": 0,
                                        "dayLow": 0,
                                        "volume": 0,
                                        "timestamp": datetime.now().isoformat(),
                                        "source": site['name']
                                    }
                                    
                except Exception as e:
                    logger.warning(f"Failed to crawl from {site['name']}: {e}")
                    continue
                    
        except Exception as e:
            logger.error(f"Page crawling failed for {stock_code}: {e}")
        finally:
            if page:
                await page.close()
                
        return None
        
    async def crawl_stock(self, stock_code):
        """Main crawl method with fallback strategy"""
        # Try KRX API first
        result = await self.crawl_with_api_first(stock_code)
        
        if result and result.get('currentPrice', 0) > 0:
            return result
            
        # Try web crawling as fallback
        if not self.browser:
            await self.start_browser()
            
        result = await self.crawl_finance_page(stock_code)
        
        if result:
            return result
            
        # Return error if all methods fail
        return {
            "error": "All crawling methods failed",
            "symbol": stock_code,
            "timestamp": datetime.now().isoformat()
        }

async def main():
    if len(sys.argv) < 2:
        print(json.dumps([{"error": "No stock codes provided"}]))
        sys.exit(1)
    
    stock_codes = sys.argv[1].split(",")
    crawler = PlaywrightStockCrawler()
    results = []
    
    try:
        for i, code in enumerate(stock_codes):
            logger.info(f"Crawling {code}... ({i+1}/{len(stock_codes)})")
            
            result = await crawler.crawl_stock(code)
            results.append(result)
            
            # Random delay between requests
            if i < len(stock_codes) - 1:
                delay = random.uniform(0.5, 1.5)
                await asyncio.sleep(delay)
                
    finally:
        await crawler.close_browser()
    
    print(json.dumps(results, ensure_ascii=False))

if __name__ == "__main__":
    asyncio.run(main())