# Advanced Multi-Source Stock Crawler

## Overview
The advanced multi-source crawler (`advanced_multi_crawler.py`) is a robust web scraping solution designed to work reliably on EC2 servers and other overseas hosting environments. It implements multiple anti-blocking techniques and fallback strategies to ensure consistent data retrieval.

## Key Features

### 1. Multiple Data Sources
- **Primary Sources**: Yahoo Finance, Google Finance, CNBC, MarketWatch, Investing.com
- **Automatic Fallback**: If one source fails, it automatically tries the next
- **Parallel Processing**: Fetches multiple stocks simultaneously for better performance

### 2. Anti-Blocking Techniques
- **User Agent Rotation**: Uses a pool of real browser user agents
- **Request Rate Limiting**: Implements delays between requests with randomization
- **Session Persistence**: Maintains cookies across requests
- **SSL Certificate Handling**: Can bypass SSL verification when necessary
- **Cloudscraper Integration**: Uses cloudscraper library to bypass anti-bot protection

### 3. Proxy Support
- **Free Proxy Rotation**: Automatically fetches and rotates through free proxies
- **Fallback to Direct**: If proxies fail, falls back to direct connection
- **Proxy Sources**: Multiple free proxy APIs for better availability

### 4. Error Handling
- **Retry Logic**: Exponential backoff for failed requests (up to 3 retries)
- **Timeout Handling**: 10-second timeout per source to prevent hanging
- **Graceful Degradation**: Returns partial results if some stocks fail

## Installation

1. Install Python dependencies:
```bash
cd /Users/jihunkong/mathematical-economics/backend/scripts
pip3 install -r requirements.txt
```

Required packages:
- aiohttp (async HTTP client)
- aiohttp-socks (proxy support)
- fake-useragent (user agent rotation)
- cloudscraper (anti-bot bypass)
- certifi (SSL certificates)
- backoff (retry logic)

## Usage

### Command Line
```bash
# Single stock
python3 advanced_multi_crawler.py AAPL

# Multiple stocks
python3 advanced_multi_crawler.py AAPL,MSFT,GOOGL
```

### Integration with Backend
The crawler is automatically integrated with the backend through `crawlerStockService.ts`. It's set as the primary crawler with `public_api_crawler.py` as a fallback.

## How It Works

1. **Initialization**
   - Fetches free proxy list from multiple sources
   - Sets up user agent pool
   - Creates SSL contexts for both verified and unverified connections

2. **Stock Data Fetching**
   - Tries each data source in order (Yahoo → Google → CNBC → MarketWatch → Investing.com)
   - For each source:
     - First attempts with regular HTTP client
     - If that fails, retries with cloudscraper
     - Implements 10-second timeout per attempt
   - If all sources fail with direct connection, tries with proxy rotation

3. **Data Processing**
   - Parses HTML to extract stock prices
   - Formats data to match backend expectations
   - Returns standardized JSON output

## Performance

- **Single Stock**: ~3-5 seconds average
- **Multiple Stocks**: Processed in parallel, typically 5-10 seconds for 5 stocks
- **Timeout Protection**: Maximum 10 seconds per source attempt

## Error Handling

The crawler handles various error scenarios:
- Network connectivity issues
- SSL certificate errors
- Anti-bot protection
- Invalid stock symbols
- Rate limiting

Each error is logged but doesn't stop the entire process, allowing partial results to be returned.

## Testing

Run the test suite:
```bash
python3 test_advanced_crawler.py
```

Or test the backend integration:
```bash
npx ts-node scripts/test_crawler_integration.ts
```

## Deployment Considerations

For EC2 or overseas servers:
1. The crawler automatically handles IP blocking issues common with overseas IPs
2. Free proxy rotation helps bypass geographic restrictions
3. Multiple fallback sources ensure data availability
4. SSL bypass options handle certificate issues on different networks

## Troubleshooting

1. **SSL Certificate Errors**: The crawler automatically falls back to unverified SSL
2. **Proxy Connection Failed**: Will automatically use direct connection
3. **All Sources Failed**: Falls back to `public_api_crawler.py` which uses hardcoded prices
4. **Timeout Issues**: Each source has a 10-second timeout to prevent hanging

## Future Improvements

1. Add more data sources (Bloomberg, Reuters, etc.)
2. Implement premium proxy support
3. Add caching layer to reduce requests
4. Implement more sophisticated anti-detection techniques
5. Add real-time WebSocket connections for live data