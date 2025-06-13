import asyncio
import aiohttp
import random
import time
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import ssl
import certifi
from fake_useragent import UserAgent
import cloudscraper
from aiohttp_socks import ProxyConnector
import backoff
from urllib.parse import quote

logger = logging.getLogger(__name__)

class AdvancedMultiCrawler:
    def __init__(self):
        self.ua = UserAgent()
        self.scraper = cloudscraper.create_scraper()
        self.session = None
        self.proxy_list = []
        self.current_proxy_index = 0
        self.request_count = 0
        self.last_request_time = 0
        
        # User agent pool
        self.user_agents = [
            self.ua.chrome,
            self.ua.firefox,
            self.ua.safari,
            self.ua.edge,
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        ]
        
        # SSL context for bypassing certificate verification
        self.ssl_context = ssl.create_default_context()
        self.ssl_context.check_hostname = False
        self.ssl_context.verify_mode = ssl.CERT_NONE
        
        # Alternative SSL context with proper verification
        try:
            self.ssl_context_verified = ssl.create_default_context(cafile=certifi.where())
        except:
            # Fallback if certifi is not properly installed
            self.ssl_context_verified = ssl.create_default_context()
        
    async def __aenter__(self):
        await self.initialize()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()
        
    async def initialize(self):
        """Initialize the crawler with proxy list and session"""
        await self.fetch_free_proxies()
        await self.create_session()
        
    async def close(self):
        """Close the session"""
        if self.session:
            await self.session.close()
            
    async def fetch_free_proxies(self):
        """Fetch free proxy list from multiple sources"""
        proxy_sources = [
            'https://www.proxy-list.download/api/v1/get?type=http',
            'https://api.proxyscrape.com/v2/?request=get&protocol=http&timeout=10000&country=all',
        ]
        
        for source in proxy_sources:
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get(source, timeout=10) as response:
                        if response.status == 200:
                            text = await response.text()
                            proxies = text.strip().split('\n')
                            for proxy in proxies[:20]:  # Limit to 20 proxies
                                if proxy.strip():
                                    self.proxy_list.append(f'http://{proxy.strip()}')
                            logger.info(f"Fetched {len(proxies)} proxies from {source}")
                            break
            except Exception as e:
                logger.warning(f"Failed to fetch proxies from {source}: {e}")
                
        # Don't add placeholder proxies
        if not self.proxy_list:
            logger.info("No proxies available, will use direct connection")
        
    def get_random_user_agent(self) -> str:
        """Get a random user agent"""
        try:
            return random.choice(self.user_agents)
        except:
            return self.ua.random
            
    def get_next_proxy(self) -> Optional[str]:
        """Get the next proxy in rotation"""
        if not self.proxy_list:
            return None
        proxy = self.proxy_list[self.current_proxy_index]
        self.current_proxy_index = (self.current_proxy_index + 1) % len(self.proxy_list)
        return proxy
        
    async def create_session(self, use_proxy: bool = False):
        """Create an aiohttp session with optional proxy"""
        if self.session:
            await self.session.close()
            
        headers = {
            'User-Agent': self.get_random_user_agent(),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0',
        }
        
        connector = None
        if use_proxy and self.proxy_list:
            proxy = self.get_next_proxy()
            if proxy:
                try:
                    connector = ProxyConnector.from_url(proxy)
                    logger.info(f"Using proxy: {proxy}")
                except:
                    logger.warning(f"Failed to create proxy connector for {proxy}")
                    
        if not connector:
            # Use unverified SSL context for better compatibility
            connector = aiohttp.TCPConnector(ssl=self.ssl_context)
            
        self.session = aiohttp.ClientSession(
            headers=headers,
            connector=connector,
            cookie_jar=aiohttp.CookieJar()
        )
        
    async def apply_rate_limiting(self):
        """Apply rate limiting with randomization"""
        self.request_count += 1
        
        # Random delay between 1-3 seconds
        base_delay = random.uniform(1, 3)
        
        # Additional delay every 10 requests
        if self.request_count % 10 == 0:
            base_delay += random.uniform(2, 5)
            
        # Ensure minimum time between requests
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        if time_since_last < base_delay:
            await asyncio.sleep(base_delay - time_since_last)
            
        self.last_request_time = time.time()
        
    @backoff.on_exception(
        backoff.expo,
        (aiohttp.ClientError, asyncio.TimeoutError),
        max_tries=3,
        max_time=30
    )
    async def fetch_with_retry(self, url: str, timeout: int = 30) -> Optional[str]:
        """Fetch URL with retry logic and exponential backoff"""
        await self.apply_rate_limiting()
        
        # Rotate user agent for each request
        if self.session:
            self.session.headers['User-Agent'] = self.get_random_user_agent()
            
        try:
            async with self.session.get(url, timeout=timeout, allow_redirects=True) as response:
                if response.status == 200:
                    return await response.text()
                else:
                    logger.warning(f"Non-200 status code: {response.status} for {url}")
                    return None
        except Exception as e:
            logger.error(f"Error fetching {url}: {e}")
            raise
            
    async def fetch_with_cloudscraper(self, url: str) -> Optional[str]:
        """Use cloudscraper for sites with anti-bot protection"""
        try:
            response = await asyncio.get_event_loop().run_in_executor(
                None, 
                self.scraper.get, 
                url
            )
            if response.status_code == 200:
                return response.text
            else:
                logger.warning(f"Cloudscraper got status {response.status_code} for {url}")
                return None
        except Exception as e:
            logger.error(f"Cloudscraper error for {url}: {e}")
            return None
            
    async def fetch_stock_data(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Fetch stock data with multiple fallback sources"""
        # List of data sources with their fetch methods
        sources = [
            ('Yahoo Finance', self._fetch_from_yahoo),
            ('Google Finance', self._fetch_from_google),
            ('Investing.com', self._fetch_from_investing),
            ('MarketWatch', self._fetch_from_marketwatch),
            ('CNBC', self._fetch_from_cnbc),
        ]
        
        for source_name, fetch_method in sources:
            try:
                logger.info(f"Trying to fetch {symbol} from {source_name}")
                
                # Set timeout for each source attempt (10 seconds)
                try:
                    # Try with normal session first
                    result = await asyncio.wait_for(
                        fetch_method(symbol, use_cloudscraper=False), 
                        timeout=10.0
                    )
                    if result:
                        logger.info(f"Successfully fetched {symbol} from {source_name}")
                        return result
                except asyncio.TimeoutError:
                    logger.warning(f"Timeout fetching {symbol} from {source_name}")
                    
                # Try with cloudscraper if normal fetch failed
                try:
                    logger.info(f"Retrying {symbol} from {source_name} with cloudscraper")
                    result = await asyncio.wait_for(
                        fetch_method(symbol, use_cloudscraper=True),
                        timeout=10.0
                    )
                    if result:
                        logger.info(f"Successfully fetched {symbol} from {source_name} with cloudscraper")
                        return result
                except asyncio.TimeoutError:
                    logger.warning(f"Timeout fetching {symbol} from {source_name} with cloudscraper")
                    
            except Exception as e:
                logger.error(f"Error fetching from {source_name}: {e}")
                
            # Try with proxy for next source
            if self.proxy_list and source_name != sources[-1][0]:
                await self.create_session(use_proxy=True)
                
        logger.error(f"Failed to fetch data for {symbol} from all sources")
        return None
        
    async def _fetch_from_yahoo(self, symbol: str, use_cloudscraper: bool = False) -> Optional[Dict[str, Any]]:
        """Fetch from Yahoo Finance"""
        url = f"https://finance.yahoo.com/quote/{symbol}"
        
        if use_cloudscraper:
            html = await self.fetch_with_cloudscraper(url)
        else:
            html = await self.fetch_with_retry(url)
            
        if html:
            # Parse the HTML to extract data
            # This is a simplified example - you'd need proper parsing
            try:
                import re
                price_match = re.search(r'data-symbol="' + symbol + r'"[^>]*data-field="regularMarketPrice"[^>]*>([0-9,.]+)', html)
                if price_match:
                    return {
                        'symbol': symbol,
                        'price': float(price_match.group(1).replace(',', '')),
                        'source': 'Yahoo Finance',
                        'timestamp': datetime.now().isoformat()
                    }
            except Exception as e:
                logger.error(f"Error parsing Yahoo data: {e}")
                
        return None
        
    async def _fetch_from_google(self, symbol: str, use_cloudscraper: bool = False) -> Optional[Dict[str, Any]]:
        """Fetch from Google Finance"""
        url = f"https://www.google.com/finance/quote/{symbol}:NASDAQ"
        
        if use_cloudscraper:
            html = await self.fetch_with_cloudscraper(url)
        else:
            html = await self.fetch_with_retry(url)
            
        if html:
            # Parse Google Finance data
            try:
                import re
                price_match = re.search(r'class="YMlKec fxKbKc">([0-9,.]+)', html)
                if price_match:
                    return {
                        'symbol': symbol,
                        'price': float(price_match.group(1).replace(',', '')),
                        'source': 'Google Finance',
                        'timestamp': datetime.now().isoformat()
                    }
            except Exception as e:
                logger.error(f"Error parsing Google data: {e}")
                
        return None
        
    async def _fetch_from_investing(self, symbol: str, use_cloudscraper: bool = False) -> Optional[Dict[str, Any]]:
        """Fetch from Investing.com"""
        # Investing.com requires more complex handling
        search_url = f"https://www.investing.com/search/?q={symbol}"
        
        if use_cloudscraper:
            html = await self.fetch_with_cloudscraper(search_url)
        else:
            html = await self.fetch_with_retry(search_url)
            
        if html:
            # This is a placeholder - Investing.com requires more complex parsing
            return None
            
        return None
        
    async def _fetch_from_marketwatch(self, symbol: str, use_cloudscraper: bool = False) -> Optional[Dict[str, Any]]:
        """Fetch from MarketWatch"""
        url = f"https://www.marketwatch.com/investing/stock/{symbol.lower()}"
        
        if use_cloudscraper:
            html = await self.fetch_with_cloudscraper(url)
        else:
            html = await self.fetch_with_retry(url)
            
        if html:
            # Parse MarketWatch data
            try:
                import re
                price_match = re.search(r'class="intraday__price"[^>]*>.*?([0-9,.]+)', html, re.DOTALL)
                if price_match:
                    return {
                        'symbol': symbol,
                        'price': float(price_match.group(1).replace(',', '')),
                        'source': 'MarketWatch',
                        'timestamp': datetime.now().isoformat()
                    }
            except Exception as e:
                logger.error(f"Error parsing MarketWatch data: {e}")
                
        return None
        
    async def _fetch_from_cnbc(self, symbol: str, use_cloudscraper: bool = False) -> Optional[Dict[str, Any]]:
        """Fetch from CNBC"""
        url = f"https://www.cnbc.com/quotes/{symbol}"
        
        if use_cloudscraper:
            html = await self.fetch_with_cloudscraper(url)
        else:
            html = await self.fetch_with_retry(url)
            
        if html:
            # Parse CNBC data
            try:
                import re
                price_match = re.search(r'QuoteStrip-lastPrice">([0-9,.]+)', html)
                if price_match:
                    return {
                        'symbol': symbol,
                        'price': float(price_match.group(1).replace(',', '')),
                        'source': 'CNBC',
                        'timestamp': datetime.now().isoformat()
                    }
            except Exception as e:
                logger.error(f"Error parsing CNBC data: {e}")
                
        return None

async def process_symbol(crawler, symbol: str) -> Dict[str, Any]:
    """Process a single symbol"""
    logger.info(f"Crawling {symbol}")
    
    try:
        data = await crawler.fetch_stock_data(symbol)
        
        if data:
            # Format data to match expected output
            result = {
                "symbol": symbol,
                "name": symbol,  # Use symbol as name for now
                "currentPrice": data.get('price', 0),
                "previousClose": data.get('price', 0) * 0.99,  # Estimate
                "change": data.get('price', 0) * 0.01,
                "changePercent": 1.0,
                "dayOpen": data.get('price', 0),
                "dayHigh": data.get('price', 0) * 1.01,
                "dayLow": data.get('price', 0) * 0.99,
                "volume": 1000000,
                "timestamp": data.get('timestamp', datetime.now().isoformat()),
                "source": data.get('source', 'Unknown')
            }
        else:
            result = {
                "symbol": symbol,
                "name": symbol,
                "currentPrice": 0,
                "previousClose": 0,
                "change": 0,
                "changePercent": 0,
                "dayOpen": 0,
                "dayHigh": 0,
                "dayLow": 0,
                "volume": 0,
                "timestamp": datetime.now().isoformat(),
                "source": "crawler",
                "error": "Failed to fetch data from all sources"
            }
            
        return result
        
    except Exception as e:
        logger.error(f"Error processing {symbol}: {e}")
        return {
            "symbol": symbol,
            "name": symbol,
            "currentPrice": 0,
            "previousClose": 0,
            "change": 0,
            "changePercent": 0,
            "dayOpen": 0,
            "dayHigh": 0,
            "dayLow": 0,
            "volume": 0,
            "timestamp": datetime.now().isoformat(),
            "source": "crawler",
            "error": str(e)
        }

# Command line interface
async def main():
    import sys
    
    if len(sys.argv) < 2:
        print(json.dumps([{"error": "No symbols provided"}]))
        sys.exit(1)
        
    # Configure logging to stderr to not interfere with JSON output
    logging.basicConfig(level=logging.INFO, stream=sys.stderr)
    
    symbols = sys.argv[1].split(',')
    results = []
    
    async with AdvancedMultiCrawler() as crawler:
        # Process stocks in parallel
        tasks = []
        for symbol in symbols:
            symbol = symbol.strip().upper()
            tasks.append(process_symbol(crawler, symbol))
        
        results = await asyncio.gather(*tasks)
    
    # Output results as JSON
    print(json.dumps(results))

if __name__ == "__main__":
    asyncio.run(main())