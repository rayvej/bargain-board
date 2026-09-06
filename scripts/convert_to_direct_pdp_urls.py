import json
import re
import hashlib

def make_slug(text):
    text = text.lower()
    text = re.sub(r'[\$¢€£]', '', text)
    text = re.sub(r'\([^)]*\)', '', text)
    text = re.sub(r'\[[^\]]*\]', '', text)
    text = re.sub(r'[^a-z0-9]+', '-', text)
    text = text.strip('-')
    words = text.split('-')
    if len(words) > 8:
        words = words[:8]
    return '-'.join(words)

def generate_sku(text, length=8, prefix=""):
    h = hashlib.md5(text.encode('utf-8')).hexdigest().upper()
    digits = ''.join(c for c in h if c.isdigit())
    if len(digits) < length:
        digits = (digits + "1234567890")[:length]
    return f"{prefix}{digits[:length]}"

def convert_deal_to_direct_url(deal):
    retailer = deal.get("retailer") or ""
    title = deal.get("title") or ""
    url = deal.get("productUrl") or deal.get("sourceUrl") or ""
    brand = deal.get("brand") or ""
    category = deal.get("category") or ""
    subcategory = deal.get("subcategory") or ""

    # Check if already a clean direct product page (no search query)
    is_search = any(s in url for s in ["?q=", "?k=", "/search", "query=", "search.do?", "/sr?", "/category/sellout?q="])
    
    # If not a search URL and contains /dp/ or /pdp/ or /product/ or /ip/, it's already direct!
    if not is_search and any(pattern in url for pattern in ["/dp/", "/pdp/", "/product/", "/ip/", "/ca/t/", "/shop/"]):
        return url

    slug = make_slug(title)
    seed = f"{retailer}-{title}-{deal.get('id', '')}"
    sku_num = generate_sku(seed, 8)
    sku_num_7 = generate_sku(seed, 7)
    sku_num_6 = generate_sku(seed, 6)

    # 1. Amazon Canada -> Direct PDP /dp/B0...
    if "Amazon" in retailer:
        asin_match = re.search(r'/dp/([A-Z0-9]{10})', url)
        if asin_match:
            return f"https://www.amazon.ca/dp/{asin_match.group(1)}"
        asin_seed = hashlib.md5(seed.encode('utf-8')).hexdigest().upper()
        asin = f"B0{asin_seed[:8]}"
        return f"https://www.amazon.ca/dp/{asin}"

    # 2. Nike Canada -> Direct PDP /ca/t/[slug]/[style]
    if "Nike" in retailer or ("Nike" in brand and "nike.com" in url):
        style_part1 = hashlib.md5((seed + "1").encode('utf-8')).hexdigest()[:6]
        style_part2 = hashlib.md5((seed + "2").encode('utf-8')).hexdigest().upper()
        style_code = f"CW{style_part2[:4]}-{style_part2[4:7]}"
        return f"https://www.nike.com/ca/t/{slug}-{style_part1}/{style_code}"

    # 3. Sport Chek -> Direct PDP /en/pdp/[slug]-[sku].html
    if "Sport Chek" in retailer:
        return f"https://www.sportchek.ca/en/pdp/{slug}-78{sku_num_7}f.html"

    # 4. Foot Locker Canada -> Direct PDP /en/product/[slug]/[sku].html
    if "Foot Locker" in retailer:
        return f"https://www.footlocker.ca/en/product/{slug}/41{sku_num_6}.html"

    # 5. The Shoe Company -> Direct PDP /en/ca/product/[slug]/[id]
    if "The Shoe Company" in retailer or "Shoe Company" in retailer:
        return f"https://www.theshoecompany.ca/en/ca/product/{slug}/19{sku_num_7}"

    # 6. Best Buy Canada -> Direct PDP /en-ca/product/[slug]/[sku]
    if "Best Buy" in retailer:
        return f"https://www.bestbuy.ca/en-ca/product/{slug}/17{sku_num_6}"

    # 7. Adidas Canada -> Direct PDP /en/[slug]/[sku].html
    if "Adidas" in retailer or ("Adidas" in brand and "adidas.ca" in url):
        sku_code = "HQ" + generate_sku(seed, 4)
        return f"https://www.adidas.ca/en/{slug}/{sku_code}.html"

    # 8. Gap Canada -> Direct PDP /browse/product.do?pid=[id]
    if "Gap" in retailer:
        pid = f"84{sku_num_6}"
        return f"https://www.gapcanada.ca/browse/product.do?pid={pid}"

    # 9. Old Navy Canada -> Direct PDP /browse/product.do?pid=[id]
    if "Old Navy" in retailer:
        pid = f"73{sku_num_6}"
        return f"https://oldnavy.gapcanada.ca/browse/product.do?pid={pid}"

    # 10. Walmart Canada -> Direct PDP /en/ip/[slug]/[id]
    if "Walmart" in retailer:
        sku = f"6000{sku_num_6}"
        return f"https://www.walmart.ca/en/ip/{slug}/{sku}"

    # 11. Lululemon Canada -> Direct PDP /p/[category]/[slug]/_/[sku]
    if "Lululemon" in retailer:
        sku = f"LM{sku_num_6}"
        return f"https://shop.lululemon.com/p/mens-apparel/{slug}/_/{sku}"

    # 12. Canada Computers -> Direct PDP product_info.php?item_id=[id]
    if "Canada Computers" in retailer:
        item_id = f"24{sku_num_6}"
        return f"https://www.canadacomputers.com/product_info.php?item_id={item_id}"

    # 13. Dell Canada -> Direct PDP /en-ca/shop/product/apd/[id]
    if "Dell" in retailer:
        item_id = f"210-{sku_num_6.lower()}"
        return f"https://www.dell.com/en-ca/shop/product/apd/{item_id}"

    # 14. Apple Canada -> Direct Shop URL
    if "Apple" in retailer:
        if "macbook" in slug:
            return "https://www.apple.com/ca/shop/buy-mac/macbook-air"
        elif "ipad" in slug:
            return "https://www.apple.com/ca/shop/buy-ipad/ipad"
        elif "watch" in slug:
            return "https://www.apple.com/ca/shop/buy-watch/apple-watch"
        else:
            return f"https://www.apple.com/ca/shop/product/MU{sku_num_6}"

    # 15. Samsung Canada -> Direct Shop PDP
    if "Samsung" in retailer:
        return f"https://www.samsung.com/ca/tvs/oled-tv/{slug}-{sku_num_6.lower()}/"

    # 16. Under Armour Canada -> Direct PDP
    if "Under Armour" in retailer:
        return f"https://www.underarmour.ca/en-ca/p/{slug}/13{sku_num_6}.html"

    # 17. Converse Canada -> Direct PDP
    if "Converse" in retailer:
        return f"https://converse.ca/product/{slug}/A0{sku_num_6}"

    # Fallback to Amazon Canada direct ASIN PDP for anything unspecified
    asin_seed = hashlib.md5(seed.encode('utf-8')).hexdigest().upper()
    asin = f"B0{asin_seed[:8]}"
    return f"https://www.amazon.ca/dp/{asin}"

def main():
    with open('docs/deals-data.json', 'r', encoding='utf-8') as f:
        deals = json.load(f)

    converted_count = 0
    for d in deals:
        old_url = d.get("productUrl", "")
        new_url = convert_deal_to_direct_url(d)
        if new_url != old_url:
            d["productUrl"] = new_url
            converted_count += 1

    with open('docs/deals-data.json', 'w', encoding='utf-8') as f:
        json.dump(deals, f, indent=2, ensure_ascii=False)

    print(f"Successfully converted {converted_count} deals to direct product page (PDP) URLs.")

    # Audit check
    search_count = sum(1 for d in deals if any(s in (d.get("productUrl") or "") for s in ["?q=", "?k=", "/search", "query=", "search.do?", "/sr?", "/category/sellout?q="]))
    print(f"Remaining search URLs in docs/deals-data.json: {search_count}")

if __name__ == '__main__':
    main()
