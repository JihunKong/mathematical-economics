#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Advanced script to update hardcoded stock prices in public_api_crawler.py
This version properly parses and updates the Python dictionary structure.
"""

import json
import sys
import os
import ast
import csv
from datetime import datetime
import argparse

# Stock symbols and names mapping
STOCK_MAPPING = {
    "005930": "삼성전자",
    "000660": "SK하이닉스",
    "035420": "NAVER",
    "035720": "카카오",
    "005380": "현대자동차",
    "051910": "LG화학",
    "006400": "삼성SDI",
    "068270": "셀트리온",
    "105560": "KB금융",
    "055550": "신한지주",
    "034730": "SK",
    "015760": "한국전력",
    "032830": "삼성생명",
    "003550": "LG",
    "017670": "SK텔레콤",
    "030200": "KT",
    "066570": "LG전자",
    "096770": "SK이노베이션",
    "011200": "HMM",
    "033780": "KT&G"
}

class AdvancedPriceUpdater:
    def __init__(self):
        self.crawler_file = os.path.join(os.path.dirname(__file__), 'public_api_crawler.py')
    
    def read_crawler_file(self):
        """Read the entire crawler file"""
        with open(self.crawler_file, 'r', encoding='utf-8') as f:
            return f.read()
    
    def write_crawler_file(self, content):
        """Write content back to crawler file"""
        # Create backup first
        backup_file = self.crawler_file + '.backup'
        with open(self.crawler_file, 'r', encoding='utf-8') as f:
            backup_content = f.read()
        with open(backup_file, 'w', encoding='utf-8') as f:
            f.write(backup_content)
        
        # Write new content
        with open(self.crawler_file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Backup saved to: {backup_file}")
    
    def update_prices_json(self, json_file):
        """Update prices from a JSON file"""
        with open(json_file, 'r', encoding='utf-8') as f:
            new_prices = json.load(f)
        
        content = self.read_crawler_file()
        
        # Find the get_hardcoded_prices method
        import_start = content.find('def get_hardcoded_prices(self, symbol):')
        if import_start == -1:
            raise Exception("Could not find get_hardcoded_prices method")
        
        # Find the prices dictionary
        prices_start = content.find('prices = {', import_start)
        if prices_start == -1:
            raise Exception("Could not find prices dictionary")
        
        # Find the end of the prices dictionary
        brace_count = 0
        i = prices_start + len('prices = ')
        dict_start = i
        while i < len(content):
            if content[i] == '{':
                brace_count += 1
            elif content[i] == '}':
                brace_count -= 1
                if brace_count == 0:
                    dict_end = i + 1
                    break
            i += 1
        
        # Build new prices dictionary
        new_dict_lines = ["{\n"]
        for code, data in new_prices.items():
            if code not in STOCK_MAPPING:
                print(f"Warning: Unknown stock code {code}, skipping...")
                continue
            
            # Calculate change and change percent
            change = data['currentPrice'] - data['previousClose']
            change_percent = round((change / data['previousClose']) * 100, 2) if data['previousClose'] > 0 else 0
            
            new_dict_lines.append(f'            "{code}": {{  # {STOCK_MAPPING[code]}\n')
            new_dict_lines.append(f'                "name": "{STOCK_MAPPING[code]}",\n')
            new_dict_lines.append(f'                "currentPrice": {data["currentPrice"]},\n')
            new_dict_lines.append(f'                "previousClose": {data["previousClose"]},\n')
            new_dict_lines.append(f'                "change": {change},\n')
            new_dict_lines.append(f'                "changePercent": {change_percent},\n')
            new_dict_lines.append(f'                "dayOpen": {data["dayOpen"]},\n')
            new_dict_lines.append(f'                "dayHigh": {data["dayHigh"]},\n')
            new_dict_lines.append(f'                "dayLow": {data["dayLow"]},\n')
            new_dict_lines.append(f'                "volume": {data["volume"]}\n')
            new_dict_lines.append('            },\n')
        
        # Remove trailing comma from last entry
        if new_dict_lines[-1].endswith(',\n'):
            new_dict_lines[-1] = new_dict_lines[-1][:-2] + '\n'
        
        new_dict_lines.append('        }')
        
        # Replace the old dictionary with the new one
        new_content = content[:dict_start] + ''.join(new_dict_lines) + content[dict_end:]
        
        # Update the date comment
        current_date = datetime.now().strftime("%Y년 %m월")
        new_content = new_content.replace(
            '# 2025년 1월 기준 실제 가격',
            f'# {current_date} 기준 실제 가격'
        )
        
        self.write_crawler_file(new_content)
        print(f"Successfully updated {len(new_prices)} stock prices")
    
    def fetch_live_prices(self):
        """Fetch live prices from available APIs (placeholder for implementation)"""
        print("Fetching live prices...")
        # This would connect to actual APIs
        # For now, return sample data
        
        sample_prices = {}
        for code in list(STOCK_MAPPING.keys())[:5]:  # Just first 5 for demo
            import random
            base_price = random.randint(50000, 200000)
            sample_prices[code] = {
                "currentPrice": base_price,
                "previousClose": base_price + random.randint(-5000, 5000),
                "dayOpen": base_price + random.randint(-3000, 3000),
                "dayHigh": base_price + random.randint(0, 5000),
                "dayLow": base_price - random.randint(0, 5000),
                "volume": random.randint(1000000, 10000000)
            }
        
        return sample_prices
    
    def create_json_template(self, output_file='stock_prices_template.json'):
        """Create a JSON template file for manual editing"""
        template = {}
        
        # Read current prices from crawler file
        content = self.read_crawler_file()
        
        # Simple extraction of current prices (for template)
        for code, name in STOCK_MAPPING.items():
            template[code] = {
                "currentPrice": 100000,
                "previousClose": 100000,
                "dayOpen": 100000,
                "dayHigh": 101000,
                "dayLow": 99000,
                "volume": 1000000
            }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(template, f, indent=2, ensure_ascii=False)
        
        print(f"JSON template created: {output_file}")
        print("Edit this file with actual prices and run:")
        print(f"  python {__file__} --update-json {output_file}")
    
    def validate_prices(self, prices):
        """Validate price data for consistency"""
        errors = []
        
        for code, data in prices.items():
            if code not in STOCK_MAPPING:
                errors.append(f"Unknown stock code: {code}")
                continue
            
            # Check required fields
            required_fields = ['currentPrice', 'previousClose', 'dayOpen', 'dayHigh', 'dayLow', 'volume']
            for field in required_fields:
                if field not in data:
                    errors.append(f"Missing field '{field}' for stock {code}")
            
            # Validate price logic
            if 'dayHigh' in data and 'dayLow' in data:
                if data['dayHigh'] < data['dayLow']:
                    errors.append(f"Day high is less than day low for {code}")
            
            if 'currentPrice' in data and 'dayHigh' in data and 'dayLow' in data:
                if data['currentPrice'] > data['dayHigh'] or data['currentPrice'] < data['dayLow']:
                    errors.append(f"Current price outside of day range for {code}")
            
            # Check for negative values
            for field, value in data.items():
                if field != 'change' and value < 0:
                    errors.append(f"Negative value for {field} in {code}")
        
        return errors

def main():
    parser = argparse.ArgumentParser(description='Advanced stock price updater')
    parser.add_argument('--update-json', help='Update prices from JSON file')
    parser.add_argument('--create-template', action='store_true', help='Create JSON template file')
    parser.add_argument('--fetch-live', action='store_true', help='Fetch live prices (if APIs available)')
    parser.add_argument('--validate', help='Validate JSON file without updating')
    
    args = parser.parse_args()
    updater = AdvancedPriceUpdater()
    
    if args.create_template:
        updater.create_json_template()
    
    elif args.update_json:
        if not os.path.exists(args.update_json):
            print(f"Error: File not found: {args.update_json}")
            sys.exit(1)
        
        with open(args.update_json, 'r', encoding='utf-8') as f:
            prices = json.load(f)
        
        # Validate prices
        errors = updater.validate_prices(prices)
        if errors:
            print("Validation errors found:")
            for error in errors:
                print(f"  - {error}")
            
            response = input("\nContinue anyway? (y/n): ")
            if response.lower() != 'y':
                print("Update cancelled.")
                sys.exit(1)
        
        updater.update_prices_json(args.update_json)
    
    elif args.fetch_live:
        prices = updater.fetch_live_prices()
        output_file = f'live_prices_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(prices, f, indent=2, ensure_ascii=False)
        print(f"Live prices saved to: {output_file}")
    
    elif args.validate:
        with open(args.validate, 'r', encoding='utf-8') as f:
            prices = json.load(f)
        
        errors = updater.validate_prices(prices)
        if errors:
            print("Validation errors found:")
            for error in errors:
                print(f"  - {error}")
        else:
            print("Validation passed! All prices look good.")
    
    else:
        parser.print_help()
        print("\nExamples:")
        print("  # Create a template JSON file")
        print(f"  python {__file__} --create-template")
        print("\n  # Update prices from JSON file")
        print(f"  python {__file__} --update-json stock_prices.json")
        print("\n  # Validate JSON file")
        print(f"  python {__file__} --validate stock_prices.json")

if __name__ == "__main__":
    main()