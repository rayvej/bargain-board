import json
import hashlib
import re
from datetime import datetime

DEALS_PATH = 'docs/deals-data.json'

with open(DEALS_PATH, 'r', encoding='utf-8') as f:
    existing_deals = json.load(f)

print(f"Loaded {len(existing_deals)} existing deals.")

# 1. Clean misattributed items
cleaned_deals = []
for d in existing_deals:
    t = d.get('title', '').lower()
    if 'bbq' in t or 'cleaner' in t or 'battery' in t or 'batteries' in t:
        if d.get('brand') in ['New Balance', 'Asics']:
            # Fix or discard
            continue
    cleaned_deals.append(d)

print(f"Cleaned deals: {len(cleaned_deals)} remaining.")

# Standard size runs
MENS_SHOE_SIZES = ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12", "13"]
WOMENS_SHOE_SIZES = ["5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "11"]
KIDS_SHOE_SIZES = ["1Y", "2Y", "3Y", "4Y", "5Y", "6Y", "7Y"]
MENS_APPAREL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"]
MENS_BOTTOMS_SIZES = ["28", "30", "32", "34", "36", "38", "S", "M", "L", "XL", "XXL"]
WOMENS_APPAREL_SIZES = ["XS", "S", "M", "L", "XL"]
WOMENS_BOTTOMS_SIZES = ["26", "27", "28", "29", "30", "31", "32", "XS", "S", "M", "L", "XL"]
KIDS_APPAREL_SIZES = ["XS", "S", "M", "L", "XL"]

# 2. Enrich existing apparel & footwear with proper size arrays
for d in cleaned_deals:
    cat = d.get('category', '')
    subcat = d.get('subcategory', '')
    gender = d.get('gender', '')
    title = d.get('title', '').lower()
    sizes = d.get('sizes', [])

    is_footwear = subcat == 'shoes' or any(w in title for w in ['shoes', 'sneakers', 'boots', 'runners'])
    is_apparel = cat == 'clothing' and not is_footwear
    is_bottom = any(w in title for w in ['jeans', 'pants', 'joggers', 'tights', 'shorts', 'leggings', 'chino', 'trouser'])

    if is_footwear:
        if not sizes or sizes == ['All'] or len(sizes) <= 2:
            if gender == 'women' or any(w in title for w in ['women', 'womens', "women's", 'ladies']):
                d['sizes'] = WOMENS_SHOE_SIZES
                d['gender'] = 'women'
            elif gender == 'kids' or any(w in title for w in ['kids', 'boys', 'girls', 'youth', 'toddler']):
                d['sizes'] = KIDS_SHOE_SIZES
                d['gender'] = 'kids'
            else:
                d['sizes'] = MENS_SHOE_SIZES
                d['gender'] = 'men'
    elif is_apparel:
        if not sizes or sizes == ['All'] or len(sizes) <= 1:
            if gender == 'women' or any(w in title for w in ['women', 'womens', "women's", 'ladies', 'dress', 'skirt', 'bra']):
                d['sizes'] = WOMENS_BOTTOMS_SIZES if is_bottom else WOMENS_APPAREL_SIZES
                d['gender'] = 'women'
            elif gender == 'kids':
                d['sizes'] = KIDS_APPAREL_SIZES
            else:
                d['sizes'] = MENS_BOTTOMS_SIZES if is_bottom else MENS_APPAREL_SIZES
                d['gender'] = 'men'

print("Updated existing items with standard size runs.")
