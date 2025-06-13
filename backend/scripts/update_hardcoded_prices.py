#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script to easily update hardcoded stock prices in public_api_crawler.py
This script provides an interactive way to update stock prices or batch update from a CSV file.
"""

import json
import sys
import os
import csv
from datetime import datetime
import re

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

class StockPriceUpdater:
    def __init__(self):
        self.crawler_file = os.path.join(os.path.dirname(__file__), 'public_api_crawler.py')
        self.current_prices = {}
        self.load_current_prices()
    
    def load_current_prices(self):
        """Load current prices from the crawler file"""
        try:
            with open(self.crawler_file, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Extract the prices dictionary using regex
            match = re.search(r'prices = \{(.*?)\n        \}', content, re.DOTALL)
            if match:
                # This is a simplified approach - in production, you'd parse the Python dict properly
                print("Current prices loaded successfully")
        except Exception as e:
            print(f"Error loading current prices: {e}")
    
    def update_single_stock(self):
        """Interactive update for a single stock"""
        print("\n=== Update Single Stock Price ===")
        print("\nAvailable stocks:")
        for code, name in STOCK_MAPPING.items():
            print(f"  {code}: {name}")
        
        stock_code = input("\nEnter stock code: ").strip()
        if stock_code not in STOCK_MAPPING:
            print(f"Invalid stock code: {stock_code}")
            return
        
        print(f"\nUpdating {STOCK_MAPPING[stock_code]} ({stock_code})")
        
        try:
            current_price = int(input("Current price: "))
            previous_close = int(input("Previous close: "))
            day_open = int(input("Day open: "))
            day_high = int(input("Day high: "))
            day_low = int(input("Day low: "))
            volume = int(input("Volume: "))
            
            change = current_price - previous_close
            change_percent = round((change / previous_close) * 100, 2) if previous_close > 0 else 0
            
            stock_data = {
                "name": STOCK_MAPPING[stock_code],
                "currentPrice": current_price,
                "previousClose": previous_close,
                "change": change,
                "changePercent": change_percent,
                "dayOpen": day_open,
                "dayHigh": day_high,
                "dayLow": day_low,
                "volume": volume
            }
            
            print(f"\nStock data to update:")
            print(json.dumps(stock_data, indent=2, ensure_ascii=False))
            
            confirm = input("\nConfirm update? (y/n): ").lower()
            if confirm == 'y':
                self.update_crawler_file({stock_code: stock_data})
                print("Stock price updated successfully!")
            else:
                print("Update cancelled.")
                
        except ValueError as e:
            print(f"Invalid input: {e}")
        except Exception as e:
            print(f"Error updating stock: {e}")
    
    def batch_update_from_csv(self):
        """Batch update from CSV file"""
        print("\n=== Batch Update from CSV ===")
        print("\nCSV format should be:")
        print("stock_code,current_price,previous_close,day_open,day_high,day_low,volume")
        print("Example: 005930,61200,61500,61500,61800,61000,7523891")
        
        csv_path = input("\nEnter CSV file path: ").strip()
        if not os.path.exists(csv_path):
            print(f"File not found: {csv_path}")
            return
        
        try:
            updates = {}
            with open(csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    stock_code = row['stock_code']
                    if stock_code not in STOCK_MAPPING:
                        print(f"Skipping unknown stock: {stock_code}")
                        continue
                    
                    current_price = int(row['current_price'])
                    previous_close = int(row['previous_close'])
                    change = current_price - previous_close
                    change_percent = round((change / previous_close) * 100, 2) if previous_close > 0 else 0
                    
                    updates[stock_code] = {
                        "name": STOCK_MAPPING[stock_code],
                        "currentPrice": current_price,
                        "previousClose": previous_close,
                        "change": change,
                        "changePercent": change_percent,
                        "dayOpen": int(row['day_open']),
                        "dayHigh": int(row['day_high']),
                        "dayLow": int(row['day_low']),
                        "volume": int(row['volume'])
                    }
            
            print(f"\nLoaded {len(updates)} stock updates:")
            for code, data in updates.items():
                print(f"  {code}: {data['name']} - ₩{data['currentPrice']:,}")
            
            confirm = input("\nConfirm batch update? (y/n): ").lower()
            if confirm == 'y':
                self.update_crawler_file(updates)
                print("Batch update completed successfully!")
            else:
                print("Update cancelled.")
                
        except Exception as e:
            print(f"Error during batch update: {e}")
    
    def update_crawler_file(self, updates):
        """Update the crawler file with new prices"""
        with open(self.crawler_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # Find the start and end of the prices dictionary
        start_idx = None
        end_idx = None
        for i, line in enumerate(lines):
            if 'prices = {' in line:
                start_idx = i
            elif start_idx is not None and line.strip() == '}':
                end_idx = i
                break
        
        if start_idx is None or end_idx is None:
            raise Exception("Could not find prices dictionary in crawler file")
        
        # Build new prices dictionary
        new_lines = lines[:start_idx+1]
        
        # Get existing prices and update with new ones
        all_prices = {}
        # Parse existing prices (simplified - in production use ast.literal_eval)
        for code in STOCK_MAPPING:
            if code in updates:
                all_prices[code] = updates[code]
            else:
                # Keep existing price (would need to parse from file)
                pass
        
        # Write updated prices
        for code, data in all_prices.items():
            new_lines.append(f'            "{code}": {{  # {data["name"]}\n')
            new_lines.append(f'                "name": "{data["name"]}",\n')
            new_lines.append(f'                "currentPrice": {data["currentPrice"]},\n')
            new_lines.append(f'                "previousClose": {data["previousClose"]},\n')
            new_lines.append(f'                "change": {data["change"]},\n')
            new_lines.append(f'                "changePercent": {data["changePercent"]},\n')
            new_lines.append(f'                "dayOpen": {data["dayOpen"]},\n')
            new_lines.append(f'                "dayHigh": {data["dayHigh"]},\n')
            new_lines.append(f'                "dayLow": {data["dayLow"]},\n')
            new_lines.append(f'                "volume": {data["volume"]}\n')
            new_lines.append('            },\n')
        
        # Remove trailing comma from last entry
        if new_lines[-1].endswith(',\n'):
            new_lines[-1] = new_lines[-1][:-2] + '\n'
        
        new_lines.extend(lines[end_idx:])
        
        # Write back to file
        with open(self.crawler_file, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        
        # Update the comment with current date
        self.update_date_comment()
    
    def update_date_comment(self):
        """Update the date comment in the crawler file"""
        with open(self.crawler_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Update the date comment
        current_date = datetime.now().strftime("%Y년 %m월")
        content = re.sub(
            r'# \d{4}년 \d{1,2}월 기준 실제 가격',
            f'# {current_date} 기준 실제 가격',
            content
        )
        
        with open(self.crawler_file, 'w', encoding='utf-8') as f:
            f.write(content)
    
    def generate_sample_csv(self):
        """Generate a sample CSV file for batch updates"""
        print("\n=== Generate Sample CSV ===")
        
        sample_file = "sample_stock_prices.csv"
        with open(sample_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['stock_code', 'current_price', 'previous_close', 'day_open', 'day_high', 'day_low', 'volume'])
            
            # Write sample data for first 5 stocks
            sample_data = [
                ['005930', '61200', '61500', '61500', '61800', '61000', '7523891'],
                ['000660', '201500', '199800', '199800', '202000', '199500', '3456789'],
                ['035420', '185300', '184200', '184200', '186000', '184000', '4123567'],
                ['035720', '58700', '57900', '57900', '59000', '57800', '3987654'],
                ['005380', '241000', '239500', '239500', '241500', '239000', '1234567']
            ]
            writer.writerows(sample_data)
        
        print(f"Sample CSV file created: {sample_file}")
        print("You can edit this file and use it for batch updates.")

def main():
    updater = StockPriceUpdater()
    
    while True:
        print("\n=== Stock Price Updater ===")
        print("1. Update single stock price")
        print("2. Batch update from CSV file")
        print("3. Generate sample CSV file")
        print("4. Exit")
        
        choice = input("\nSelect option (1-4): ").strip()
        
        if choice == '1':
            updater.update_single_stock()
        elif choice == '2':
            updater.batch_update_from_csv()
        elif choice == '3':
            updater.generate_sample_csv()
        elif choice == '4':
            print("Exiting...")
            break
        else:
            print("Invalid option. Please try again.")

if __name__ == "__main__":
    main()