# Stock Price Update Scripts

This directory contains scripts to manage and update hardcoded stock prices in the `public_api_crawler.py` file.

## Overview

When deploying to EC2 servers (especially overseas), accessing Korean stock market data can be challenging due to:
- Geographic restrictions
- API rate limits
- Network blocking
- Authentication requirements

As a fallback mechanism, we maintain hardcoded prices that can be easily updated.

## Available Scripts

### 1. `update_hardcoded_prices.py` - Interactive Price Updater

Simple interactive script for updating stock prices.

**Features:**
- Update single stock prices interactively
- Batch update from CSV file
- Generate sample CSV template

**Usage:**
```bash
python update_hardcoded_prices.py
```

**Menu Options:**
1. **Update single stock price**: Enter stock details one by one
2. **Batch update from CSV**: Update multiple stocks from a CSV file
3. **Generate sample CSV**: Create a template CSV file

**CSV Format:**
```csv
stock_code,current_price,previous_close,day_open,day_high,day_low,volume
005930,61200,61500,61500,61800,61000,7523891
000660,201500,199800,199800,202000,199500,3456789
```

### 2. `update_prices_advanced.py` - Advanced JSON-based Updater

More robust script that properly parses Python dictionaries and supports JSON input.

**Features:**
- Update from JSON files
- Validate price data
- Create backups before updating
- Price consistency checks

**Usage:**

Create a template:
```bash
python update_prices_advanced.py --create-template
```

Update from JSON:
```bash
python update_prices_advanced.py --update-json stock_prices.json
```

Validate JSON file:
```bash
python update_prices_advanced.py --validate stock_prices.json
```

**JSON Format:**
```json
{
  "005930": {
    "currentPrice": 61200,
    "previousClose": 61500,
    "dayOpen": 61500,
    "dayHigh": 61800,
    "dayLow": 61000,
    "volume": 7523891
  },
  "000660": {
    "currentPrice": 201500,
    "previousClose": 199800,
    "dayOpen": 199800,
    "dayHigh": 202000,
    "dayLow": 199500,
    "volume": 3456789
  }
}
```

## Supported Stocks

The following stocks are currently supported:

| Code | Company Name |
|------|--------------|
| 005930 | 삼성전자 |
| 000660 | SK하이닉스 |
| 035420 | NAVER |
| 035720 | 카카오 |
| 005380 | 현대자동차 |
| 051910 | LG화학 |
| 006400 | 삼성SDI |
| 068270 | 셀트리온 |
| 105560 | KB금융 |
| 055550 | 신한지주 |
| 034730 | SK |
| 015760 | 한국전력 |
| 032830 | 삼성생명 |
| 003550 | LG |
| 017670 | SK텔레콤 |
| 030200 | KT |
| 066570 | LG전자 |
| 096770 | SK이노베이션 |
| 011200 | HMM |
| 033780 | KT&G |

## Best Practices

### 1. Regular Updates
- Update prices at least once a week
- More frequent updates during volatile market conditions
- Always update before important demos or presentations

### 2. Data Sources
Recommended sources for accurate prices:
- [NAVER Finance](https://finance.naver.com)
- [Daum Finance](https://finance.daum.net)
- [KRX](http://www.krx.co.kr)
- Yahoo Finance (with .KS suffix)

### 3. Validation
Always validate price data:
- Current price should be between day high and low
- Day high ≥ Day low
- Volume should be positive
- Change = Current Price - Previous Close
- Change Percent = (Change / Previous Close) × 100

### 4. Backup
The advanced script automatically creates backups:
- Backup location: `public_api_crawler.py.backup`
- Keep at least 3 recent backups
- Test restore procedure periodically

## Automation

### Using Cron (Linux/Mac)
```bash
# Update daily at 4 PM KST (after market close)
0 16 * * * cd /path/to/backend/scripts && python update_prices_advanced.py --update-json daily_prices.json
```

### Using GitHub Actions
Create `.github/workflows/update-prices.yml`:
```yaml
name: Update Stock Prices
on:
  schedule:
    - cron: '0 7 * * *'  # 4 PM KST
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Python
        uses: actions/setup-python@v2
      - name: Fetch and update prices
        run: |
          cd backend/scripts
          python fetch_prices.py  # Your price fetching script
          python update_prices_advanced.py --update-json fetched_prices.json
      - name: Commit changes
        run: |
          git config --global user.name 'Price Bot'
          git config --global user.email 'bot@example.com'
          git add -A
          git commit -m "Update stock prices [skip ci]"
          git push
```

## Troubleshooting

### Common Issues

1. **Script can't find public_api_crawler.py**
   - Ensure you're running from the scripts directory
   - Check file permissions

2. **JSON validation fails**
   - Verify all required fields are present
   - Check for negative values (except change)
   - Ensure price logic is consistent

3. **Backup restoration needed**
   ```bash
   cp public_api_crawler.py.backup public_api_crawler.py
   ```

4. **Permission denied**
   ```bash
   chmod +x update_*.py
   ```

## Future Enhancements

1. **API Integration**
   - Direct integration with Korean stock APIs
   - Automatic price fetching with proxy support

2. **Web Interface**
   - Simple web UI for price updates
   - Real-time preview of changes

3. **Price History**
   - Track historical hardcoded prices
   - Generate price movement reports

4. **Notification System**
   - Alert when prices are stale
   - Notify on significant market movements

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review script logs
3. Ensure Python 3.6+ is installed
4. Verify all dependencies are available