#!/usr/bin/env python3
"""
Test script for advanced multi crawler
"""
import asyncio
import sys
import json
import time
from advanced_multi_crawler import AdvancedMultiCrawler

async def test_single_stock():
    """Test fetching a single stock"""
    print("\n=== Testing Single Stock Fetch ===")
    async with AdvancedMultiCrawler() as crawler:
        start_time = time.time()
        result = await crawler.fetch_stock_data('AAPL')
        end_time = time.time()
        
        if result:
            print(f"✓ Successfully fetched AAPL in {end_time - start_time:.2f} seconds")
            print(f"  Price: ${result['price']}")
            print(f"  Source: {result['source']}")
        else:
            print("✗ Failed to fetch AAPL")

async def test_multiple_stocks():
    """Test fetching multiple stocks in parallel"""
    print("\n=== Testing Multiple Stock Fetch ===")
    stocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA']
    
    async with AdvancedMultiCrawler() as crawler:
        start_time = time.time()
        
        # Fetch stocks in parallel
        tasks = [crawler.fetch_stock_data(symbol) for symbol in stocks]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        end_time = time.time()
        
        success_count = 0
        for symbol, result in zip(stocks, results):
            if isinstance(result, Exception):
                print(f"✗ {symbol}: Error - {result}")
            elif result:
                success_count += 1
                print(f"✓ {symbol}: ${result['price']} from {result['source']}")
            else:
                print(f"✗ {symbol}: Failed to fetch")
        
        print(f"\nFetched {success_count}/{len(stocks)} stocks in {end_time - start_time:.2f} seconds")
        print(f"Average time per stock: {(end_time - start_time) / len(stocks):.2f} seconds")

async def test_proxy_fallback():
    """Test proxy fallback mechanism"""
    print("\n=== Testing Proxy Fallback ===")
    async with AdvancedMultiCrawler() as crawler:
        # First request without proxy
        result1 = await crawler.fetch_stock_data('META')
        if result1:
            print(f"✓ First fetch succeeded: ${result1['price']} from {result1['source']}")
        
        # Create session with proxy to test fallback
        await crawler.create_session(use_proxy=True)
        result2 = await crawler.fetch_stock_data('NFLX')
        if result2:
            print(f"✓ Proxy fetch succeeded: ${result2['price']} from {result2['source']}")
        else:
            print("✗ Proxy fetch failed (expected if no valid proxies)")

async def test_error_handling():
    """Test error handling with invalid symbols"""
    print("\n=== Testing Error Handling ===")
    invalid_symbols = ['INVALID123', 'NOTEXIST']
    
    async with AdvancedMultiCrawler() as crawler:
        for symbol in invalid_symbols:
            result = await crawler.fetch_stock_data(symbol)
            if result:
                print(f"? {symbol}: Unexpectedly got result")
            else:
                print(f"✓ {symbol}: Correctly returned None for invalid symbol")

async def test_command_line_interface():
    """Test the command line interface"""
    print("\n=== Testing Command Line Interface ===")
    
    # Save original argv
    original_argv = sys.argv
    
    try:
        # Test with single stock
        sys.argv = ['advanced_multi_crawler.py', 'AAPL']
        from advanced_multi_crawler import main
        
        # Redirect stdout to capture output
        import io
        from contextlib import redirect_stdout
        
        f = io.StringIO()
        with redirect_stdout(f):
            await main()
        
        output = f.getvalue()
        try:
            results = json.loads(output)
            if results and results[0]['currentPrice'] > 0:
                print("✓ CLI single stock test passed")
            else:
                print("✗ CLI single stock test failed")
        except:
            print("✗ CLI output parsing failed")
            print(f"Output: {output}")
    
    finally:
        # Restore original argv
        sys.argv = original_argv

async def run_all_tests():
    """Run all tests"""
    print("Starting Advanced Multi Crawler Tests...")
    
    await test_single_stock()
    await test_multiple_stocks()
    await test_proxy_fallback()
    await test_error_handling()
    # Skip CLI test as it interferes with module imports
    # await test_command_line_interface()
    
    print("\n=== All Tests Completed ===")

if __name__ == "__main__":
    import logging
    logging.basicConfig(level=logging.WARNING)  # Reduce log noise during tests
    asyncio.run(run_all_tests())