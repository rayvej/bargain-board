import json
import urllib.parse
from generate_universal_catalog import (
    deals, create_deal,
    MENS_SHOE_SIZES, WOMENS_SHOE_SIZES, KIDS_SHOE_SIZES,
    MENS_APPAREL_SIZES, MENS_BOTTOMS_SIZES,
    WOMENS_APPAREL_SIZES, WOMENS_BOTTOMS_SIZES, KIDS_APPAREL_SIZES,
    COUPONS, IMAGES
)

extra_deals = []

# ─── EXTRA PHONES & TABLETS (25 deals) ───
phones_extra = [
    ("Apple iPhone 15 Plus 128GB (Blue)", "Apple", "Best Buy Canada", 1279.99, 1129.99, "https://www.bestbuy.ca/en-ca/search?search=Apple+iPhone+15+Plus", []),
    ("Apple iPhone 13 128GB (Midnight)", "Apple", "Best Buy Canada", 849.99, 699.99, "https://www.bestbuy.ca/en-ca/search?search=Apple+iPhone+13", []),
    ("Apple iPad 9th Gen 10.2\" 64GB Wi-Fi (Space Grey)", "Apple", "Amazon Canada", 449.99, 369.99, "https://www.amazon.ca/s?k=Apple+iPad+9th+Gen", []),
    ("Apple iPad Air 13\" M2 Chip 256GB Wi-Fi (Starlight)", "Apple", "Best Buy Canada", 1199.99, 1099.99, "https://www.bestbuy.ca/en-ca/search?search=Apple+iPad+Air+13+M2", []),
    ("Apple iPad Pro 13\" M4 Chip OLED 256GB (Space Black)", "Apple", "Best Buy Canada", 1799.99, 1649.99, "https://www.bestbuy.ca/en-ca/search?search=Apple+iPad+Pro+13+M4", []),
    
    ("Samsung Galaxy S23 FE 128GB 5G Smartphone (Graphite)", "Samsung", "Best Buy Canada", 869.99, 649.99, "https://www.bestbuy.ca/en-ca/search?search=Samsung+Galaxy+S23+FE", []),
    ("Samsung Galaxy A54 5G 128GB Smartphone (Awesome Graphite)", "Samsung", "Amazon Canada", 539.99, 399.99, "https://www.amazon.ca/s?k=Samsung+Galaxy+A54+5G", []),
    ("Samsung Galaxy A35 5G 128GB Smartphone (Awesome Navy)", "Samsung", "Best Buy Canada", 479.99, 369.99, "https://www.bestbuy.ca/en-ca/search?search=Samsung+Galaxy+A35", []),
    ("Samsung Galaxy Tab S9 FE 10.9\" 128GB Wi-Fi Android Tablet", "Samsung", "Best Buy Canada", 599.99, 449.99, "https://www.bestbuy.ca/en-ca/search?search=Samsung+Galaxy+Tab+S9+FE", []),
    ("Samsung Galaxy Tab S9+ 12.4\" 256GB AMOLED Android Tablet", "Samsung", "Best Buy Canada", 1349.99, 1099.99, "https://www.bestbuy.ca/en-ca/search?search=Samsung+Galaxy+Tab+S9+Plus", []),
    ("Samsung Galaxy Tab A9 8.7\" 64GB Wi-Fi Tablet (Silver)", "Samsung", "Amazon Canada", 199.99, 149.99, "https://www.amazon.ca/s?k=Samsung+Galaxy+Tab+A9", []),

    ("Google Pixel 7 Pro 128GB 5G Smartphone (Snow)", "Google", "Amazon Canada", 1179.99, 699.99, "https://www.amazon.ca/s?k=Google+Pixel+7+Pro", []),
    ("Google Pixel 6a 128GB 5G Smartphone (Sage)", "Google", "Amazon Canada", 499.99, 349.99, "https://www.amazon.ca/s?k=Google+Pixel+6a", []),
    ("OnePlus 12 512GB Unlocked Android Smartphone (Silky Black)", "OnePlus", "Amazon Canada", 1199.99, 999.99, "https://www.amazon.ca/s?k=OnePlus+12+5G", []),
    ("OnePlus 12R 128GB Unlocked Android Smartphone (Cool Blue)", "OnePlus", "Amazon Canada", 699.99, 549.99, "https://www.amazon.ca/s?k=OnePlus+12R", []),
    ("OnePlus Pad 11.6\" 144Hz 128GB Android Tablet (Halo Green)", "OnePlus", "Amazon Canada", 649.99, 499.99, "https://www.amazon.ca/s?k=OnePlus+Pad", []),

    ("Motorola Moto G Power 5G 128GB (Pale Lilac)", "Motorola", "Amazon Canada", 299.99, 219.99, "https://www.amazon.ca/s?k=Motorola+Moto+G+Power+5G", []),
    ("Motorola Edge 2024 256GB Unlocked Smartphone (Midnight Blue)", "Motorola", "Best Buy Canada", 699.99, 499.99, "https://www.bestbuy.ca/en-ca/search?search=Motorola+Edge+2024", [])
]

for title, brand, ret, orig, sale, url, coup in phones_extra:
    extra_deals.append(create_deal(
        title=title, brand=brand, retailer=ret, gender='all',
        category='electronics', subcategory='phones',
        sizes=[], orig=orig, sale=sale, url=url,
        img=IMAGES['phones'], coupons=coup
    ))

# ─── EXTRA SMART HOME (20 deals) ───
smarthome_extra = [
    ("Google Nest Protect Smoke & Carbon Monoxide Alarm (Battery)", "Google", "Best Buy Canada", 159.99, 129.99, "https://www.bestbuy.ca/en-ca/search?search=Google+Nest+Protect", []),
    ("Google Nest Hub 7\" Smart Display (2nd Gen) - Chalk", "Google", "Best Buy Canada", 129.99, 69.99, "https://www.bestbuy.ca/en-ca/search?search=Google+Nest+Hub+2nd+Gen", []),
    ("Google Nest Hub Max 10\" Smart Display with Camera (Chalk)", "Google", "Best Buy Canada", 299.99, 229.99, "https://www.bestbuy.ca/en-ca/search?search=Google+Nest+Hub+Max", []),
    ("Google Nest Cam Indoor Wired Security Camera (2nd Gen)", "Google", "Best Buy Canada", 129.99, 99.99, "https://www.bestbuy.ca/en-ca/search?search=Google+Nest+Cam+Indoor+Wired", []),

    ("Amazon Echo Show 5 (3rd Gen) Compact Smart Display - Charcoal", "Amazon", "Amazon Canada", 119.99, 74.99, "https://www.amazon.ca/s?k=Amazon+Echo+Show+5+3rd+Gen", []),
    ("Amazon Echo Show 10 (3rd Gen) HD Smart Display with Motion", "Amazon", "Amazon Canada", 329.99, 249.99, "https://www.amazon.ca/s?k=Amazon+Echo+Show+10", []),
    ("Amazon Echo Pop Compact Smart Speaker with Alexa (Glacier White)", "Amazon", "Amazon Canada", 54.99, 29.99, "https://www.amazon.ca/s?k=Amazon+Echo+Pop", []),
    ("Ring Stick Up Cam Battery HD Security Camera (White)", "Ring", "Amazon Canada", 129.99, 89.99, "https://www.amazon.ca/s?k=Ring+Stick+Up+Cam+Battery", []),
    ("Ring Indoor Cam (2nd Gen) Compact Plug-In Security Camera", "Ring", "Best Buy Canada", 79.99, 49.99, "https://www.bestbuy.ca/en-ca/search?search=Ring+Indoor+Cam+2nd+Gen", []),
    ("Ring Alarm 8-Piece Home Security Kit (2nd Gen)", "Ring", "Amazon Canada", 329.99, 239.99, "https://www.amazon.ca/s?k=Ring+Alarm+8+Piece+Kit", []),

    ("Philips Hue Smart Dimmer Switch with Remote", "Philips", "Amazon Canada", 34.99, 24.99, "https://www.amazon.ca/s?k=Philips+Hue+Smart+Dimmer+Switch", []),
    ("Philips Hue White & Color Ambiance BR30 Recessed LED Bulb 2-Pack", "Philips", "Best Buy Canada", 119.99, 89.99, "https://www.bestbuy.ca/en-ca/search?search=Philips+Hue+BR30+Bulbs", []),

    ("TP-Link Tapo 2K Outdoor Pan/Tilt Security Camera (C520WS)", "TP-Link", "Amazon Canada", 89.99, 62.99, "https://www.amazon.ca/s?k=TP+Link+Tapo+C520WS", []),
    ("TP-Link Kasa Smart Wi-Fi Dimmer Switch (HS220)", "TP-Link", "Amazon Canada", 29.99, 19.99, "https://www.amazon.ca/s?k=TP+Link+Kasa+Smart+Dimmer+Switch+HS220", []),
    ("TP-Link Kasa Smart Outdoor Wi-Fi Plug 2-Outlet (KP400)", "TP-Link", "Amazon Canada", 39.99, 26.99, "https://www.amazon.ca/s?k=TP+Link+Kasa+Outdoor+Plug", []),

    ("EufyCam 2C Pro 2-Camera 2K Wireless Security System", "Eufy", "Best Buy Canada", 399.99, 279.99, "https://www.bestbuy.ca/en-ca/search?search=EufyCam+2C+Pro+System", []),
    ("Eufy Security Smart Lock Touch & Wi-Fi Fingerprint Deadbolt", "Eufy", "Amazon Canada", 299.99, 199.99, "https://www.amazon.ca/s?k=Eufy+Smart+Lock+Touch+WiFi", [])
]

for title, brand, ret, orig, sale, url, coup in smarthome_extra:
    extra_deals.append(create_deal(
        title=title, brand=brand, retailer=ret, gender='all',
        category='electronics', subcategory='smarthome',
        sizes=[], orig=orig, sale=sale, url=url,
        img=IMAGES['smarthome'], coupons=coup
    ))

# ─── EXTRA WOMEN'S APPAREL (30 deals) ───
womens_apparel_extra = [
    ("Lululemon Women's Dance Studio Mid-Rise Jogger (Regular)", "Lululemon", "Lululemon Canada", 118.00, 79.00, "https://shop.lululemon.com/c/search/_/N-1z13y8x?Ntt=Women+Dance+Studio+Jogger", [], WOMENS_BOTTOMS_SIZES),
    ("Lululemon Women's Softstreme Perfectly Oversized Cropped Crew", "Lululemon", "Lululemon Canada", 128.00, 84.00, "https://shop.lululemon.com/c/search/_/N-1z13y8x?Ntt=Women+Softstreme+Cropped+Crew", [], WOMENS_APPAREL_SIZES),
    ("Lululemon Women's Groove Super-High-Rise Flared Pant Nulu", "Lululemon", "Lululemon Canada", 128.00, 89.00, "https://shop.lululemon.com/c/search/_/N-1z13y8x?Ntt=Women+Groove+Flared+Pant", [], WOMENS_BOTTOMS_SIZES),
    ("Lululemon Women's Like a Cloud Ribbed Bra Longline (B/C Cup)", "Lululemon", "Lululemon Canada", 74.00, 49.00, "https://shop.lululemon.com/c/search/_/N-1z13y8x?Ntt=Women+Like+a+Cloud+Bra", [], WOMENS_APPAREL_SIZES),
    ("Lululemon Women's All Yours Cotton T-Shirt", "Lululemon", "Lululemon Canada", 58.00, 39.00, "https://shop.lululemon.com/c/search/_/N-1z13y8x?Ntt=Women+All+Yours+T+Shirt", [], WOMENS_APPAREL_SIZES),

    ("Nike Women's Sportswear Club Fleece Full-Zip Hoodie", "Nike", "Nike Canada", 85.00, 59.99, "https://www.nike.com/ca/w?q=Women+Club+Fleece+Full+Zip", COUPONS['nike'], WOMENS_APPAREL_SIZES),
    ("Nike Women's Sportswear Tech Fleece Windrunner Full-Zip", "Nike", "Sport Chek", 160.00, 114.98, "https://www.sportchek.ca/en/search.html?q=Nike+Women+Tech+Fleece+Windrunner", [], WOMENS_APPAREL_SIZES),
    ("Nike Women's Dri-FIT Swoosh Medium-Support Sports Bra", "Nike", "Sport Chek", 48.00, 32.98, "https://www.sportchek.ca/en/search.html?q=Nike+Women+Swoosh+Sports+Bra", [], WOMENS_APPAREL_SIZES),
    ("Nike Women's One Dri-FIT Mid-Rise 7\" Biker Shorts", "Nike", "The Shoe Company", 55.00, 37.99, "https://www.theshoecompany.ca/en/ca/search?query=Nike+Women+Biker+Shorts", [], WOMENS_BOTTOMS_SIZES),

    ("Adidas Women's Essentials Linear Full-Zip French Terry Hoodie", "Adidas", "Adidas Canada", 80.00, 51.99, "https://www.adidas.ca/en/search?q=Women+Linear+Full+Zip+Hoodie", COUPONS['adidas'], WOMENS_APPAREL_SIZES),
    ("Adidas Women's Optime Training 7/8 Leggings", "Adidas", "Adidas Canada", 75.00, 48.99, "https://www.adidas.ca/en/search?q=Women+Optime+Leggings", COUPONS['adidas'], WOMENS_BOTTOMS_SIZES),
    ("Adidas Women's Loungewear Essentials 3-Stripes Leggings", "Adidas", "The Shoe Company", 50.00, 34.99, "https://www.theshoecompany.ca/en/ca/search?query=Adidas+Women+Essentials+3+Stripes+Leggings", [], WOMENS_BOTTOMS_SIZES),

    ("Under Armour Women's Tech Twist V-Neck T-Shirt", "Under Armour", "Under Armour Canada", 35.00, 24.99, "https://www.underarmour.ca/en-ca/search?q=Women+Tech+Twist+V+Neck", COUPONS['underarmour'], WOMENS_APPAREL_SIZES),
    ("Under Armour Women's Motion Ankle Leggings", "Under Armour", "Sport Chek", 65.00, 44.98, "https://www.sportchek.ca/en/search.html?q=Under+Armour+Women+Motion+Leggings", [], WOMENS_BOTTOMS_SIZES),
    ("Under Armour Women's Rival Fleece Logo Hoodie", "Under Armour", "Sport Chek", 70.00, 48.98, "https://www.sportchek.ca/en/search.html?q=Under+Armour+Women+Rival+Fleece+Hoodie", [], WOMENS_APPAREL_SIZES),

    ("Levi's Women's Wedgie Straight Fit Jeans (Bridge Falls)", "Levi's", "The Bay", 118.00, 74.99, "https://www.thebay.com/search?q=Levis+Women+Wedgie+Straight+Jeans", COUPONS['thebay'], WOMENS_BOTTOMS_SIZES),
    ("Levi's Women's 311 Shaping Skinny Jeans (Soft Black)", "Levi's", "The Bay", 98.00, 62.99, "https://www.thebay.com/search?q=Levis+Women+311+Shaping+Skinny", COUPONS['thebay'], WOMENS_BOTTOMS_SIZES),
    ("Levi's Women's Graphic Standard Cotton Crewneck T-Shirt", "Levi's", "The Bay", 38.00, 24.99, "https://www.thebay.com/search?q=Levis+Women+Graphic+T+Shirt", COUPONS['thebay'], WOMENS_APPAREL_SIZES),

    ("Gap Women's 100% Organic Cotton Big Shirt (Poplin)", "Gap", "Gap Canada", 75.00, 44.99, "https://www.gapcanada.ca/browse/search.do?searchText=Women+Organic+Cotton+Big+Shirt", COUPONS['gap'], WOMENS_APPAREL_SIZES),
    ("Gap Women's High Rise Girlfriend Jeans with Washwell", "Gap", "Gap Canada", 85.00, 50.99, "https://www.gapcanada.ca/browse/search.do?searchText=Women+Girlfriend+Jeans", COUPONS['gap'], WOMENS_BOTTOMS_SIZES),
    ("Gap Women's Modern Ribbed Tank Top", "Gap", "Gap Canada", 30.00, 17.99, "https://www.gapcanada.ca/browse/search.do?searchText=Women+Modern+Ribbed+Tank", COUPONS['gap'], WOMENS_APPAREL_SIZES),

    ("Old Navy Women's Sleeveless Rib-Knit Midi Shift Dress", "Old Navy", "Old Navy Canada", 45.00, 29.99, "https://oldnavy.gapcanada.ca/browse/search.do?searchText=Women+Rib+Knit+Midi+Dress", COUPONS['oldnavy'], WOMENS_APPAREL_SIZES),
    ("Old Navy Women's Oversized Boyfriend Flannel Shirt", "Old Navy", "Old Navy Canada", 45.00, 29.99, "https://oldnavy.gapcanada.ca/browse/search.do?searchText=Women+Boyfriend+Flannel+Shirt", COUPONS['oldnavy'], WOMENS_APPAREL_SIZES),
    ("Old Navy Women's Mid-Rise Wow Bootcut Jeans", "Old Navy", "Old Navy Canada", 45.00, 29.99, "https://oldnavy.gapcanada.ca/browse/search.do?searchText=Women+Wow+Bootcut+Jeans", COUPONS['oldnavy'], WOMENS_BOTTOMS_SIZES),

    ("The North Face Women's Canyonlands Full-Zip Fleece Jacket", "The North Face", "Sport Chek", 120.00, 82.98, "https://www.sportchek.ca/en/search.html?q=The+North+Face+Women+Canyonlands+Fleece", [], WOMENS_APPAREL_SIZES),
    ("The North Face Women's ThermoBall Eco Hooded Parka", "The North Face", "Sport Chek", 350.00, 244.98, "https://www.sportchek.ca/en/search.html?q=The+North+Face+Women+ThermoBall+Eco+Parka", [], WOMENS_APPAREL_SIZES),

    ("Columbia Women's Arcadia II Waterproof Breathable Rain Jacket", "Columbia", "Sport Chek", 110.00, 74.98, "https://www.sportchek.ca/en/search.html?q=Columbia+Women+Arcadia+II+Jacket", [], WOMENS_APPAREL_SIZES),
    ("Columbia Women's Fire Side II Sherpa Full Zip Jacket", "Columbia", "Sport Chek", 110.00, 74.98, "https://www.sportchek.ca/en/search.html?q=Columbia+Women+Fire+Side+II+Sherpa", [], WOMENS_APPAREL_SIZES)
]

for title, brand, ret, orig, sale, url, coup, sz in womens_apparel_extra:
    extra_deals.append(create_deal(
        title=title, brand=brand, retailer=ret, gender='women',
        category='clothing', subcategory='womens',
        sizes=sz, orig=orig, sale=sale, url=url,
        img=IMAGES['womens'], coupons=coup
    ))

# ─── EXTRA MEN'S APPAREL (25 deals) ───
mens_apparel_extra = [
    ("Nike Men's Sportswear Tech Fleece Full-Zip Windrunner Hoodie", "Nike", "Sport Chek", 160.00, 114.98, "https://www.sportchek.ca/en/search.html?q=Nike+Men+Tech+Fleece+Windrunner", [], MENS_APPAREL_SIZES),
    ("Nike Men's Sportswear Tech Fleece Slim Joggers", "Nike", "Sport Chek", 145.00, 104.98, "https://www.sportchek.ca/en/search.html?q=Nike+Men+Tech+Fleece+Joggers", [], MENS_BOTTOMS_SIZES),
    ("Nike Men's Dri-FIT Academy 23 Track Pants", "Nike", "Nike Canada", 60.00, 42.99, "https://www.nike.com/ca/w?q=Men+Academy+23+Pants", COUPONS['nike'], MENS_BOTTOMS_SIZES),
    ("Nike Men's Dri-FIT Ready Short-Sleeve Fitness Top", "Nike", "Sport Chek", 52.00, 36.98, "https://www.sportchek.ca/en/search.html?q=Nike+Men+Dri+FIT+Ready+Top", [], MENS_APPAREL_SIZES),

    ("Adidas Men's Tiro 23 League Full-Zip Warm-Up Jacket", "Adidas", "Adidas Canada", 80.00, 51.99, "https://www.adidas.ca/en/search?q=Men+Tiro+23+Jacket", COUPONS['adidas'], MENS_APPAREL_SIZES),
    ("Adidas Men's Adicolor Classics 3-Stripes Sweatpants", "Adidas", "Adidas Canada", 85.00, 54.99, "https://www.adidas.ca/en/search?q=Men+Adicolor+3+Stripes+Sweatpants", COUPONS['adidas'], MENS_BOTTOMS_SIZES),
    ("Adidas Men's Designed for Training Aeroready Tee", "Adidas", "Sport Chek", 45.00, 29.98, "https://www.sportchek.ca/en/search.html?q=Adidas+Men+Designed+for+Training+Tee", [], MENS_APPAREL_SIZES),

    ("Under Armour Men's ColdGear Infrared Baselayer Mock Neck", "Under Armour", "Under Armour Canada", 75.00, 52.99, "https://www.underarmour.ca/en-ca/search?q=Men+ColdGear+Infrared+Mock", COUPONS['underarmour'], MENS_APPAREL_SIZES),
    ("Under Armour Men's Armour Fleece 1/2 Zip Pullover", "Under Armour", "Sport Chek", 65.00, 44.98, "https://www.sportchek.ca/en/search.html?q=Under+Armour+Men+Armour+Fleece+Pullover", [], MENS_APPAREL_SIZES),
    ("Under Armour Men's Tech Graphic Shorts", "Under Armour", "The Shoe Company", 35.00, 24.99, "https://www.theshoecompany.ca/en/ca/search?query=Under+Armour+Men+Tech+Shorts", [], MENS_BOTTOMS_SIZES),

    ("Levi's Men's 512 Slim Taper Fit Flex Jeans", "Levi's", "The Bay", 108.00, 69.99, "https://www.thebay.com/search?q=Levis+Men+512+Slim+Taper", COUPONS['thebay'], MENS_BOTTOMS_SIZES),
    ("Levi's Men's 541 Athletic Taper Fit Jeans", "Levi's", "The Bay", 108.00, 69.99, "https://www.thebay.com/search?q=Levis+Men+541+Athletic+Jeans", COUPONS['thebay'], MENS_BOTTOMS_SIZES),
    ("Levi's Men's Classic Western Denim Long Sleeve Shirt", "Levi's", "The Bay", 88.00, 57.99, "https://www.thebay.com/search?q=Levis+Men+Western+Denim+Shirt", COUPONS['thebay'], MENS_APPAREL_SIZES),

    ("Carhartt Men's Loose Fit Heavyweight Long-Sleeve Pocket Tee", "Carhartt", "Amazon Canada", 40.00, 28.50, "https://www.amazon.ca/s?k=Carhartt+Men+Long+Sleeve+Pocket+Tee", [], MENS_APPAREL_SIZES),
    ("Carhartt Men's Duck Bib Unlined Overalls (R01)", "Carhartt", "Amazon Canada", 120.00, 89.99, "https://www.amazon.ca/s?k=Carhartt+Men+Duck+Bib+Overalls", [], MENS_BOTTOMS_SIZES),
    ("Carhartt Men's Washed Duck Insulated Active Jac (J130)", "Carhartt", "Sport Chek", 175.00, 129.98, "https://www.sportchek.ca/en/search.html?q=Carhartt+Men+Active+Jac+J130", [], MENS_APPAREL_SIZES),

    ("The North Face Men's McMurdo Down Parka", "The North Face", "Sport Chek", 460.00, 329.98, "https://www.sportchek.ca/en/search.html?q=The+North+Face+Men+McMurdo+Parka", [], MENS_APPAREL_SIZES),
    ("The North Face Men's Apex Bionic 3 Softshell Jacket", "The North Face", "Sport Chek", 200.00, 139.98, "https://www.sportchek.ca/en/search.html?q=The+North+Face+Men+Apex+Bionic+Jacket", [], MENS_APPAREL_SIZES),

    ("Columbia Men's Glennaker Lake Packable Rain Jacket", "Columbia", "Amazon Canada", 75.00, 49.99, "https://www.amazon.ca/s?k=Columbia+Men+Glennaker+Lake+Jacket", [], MENS_APPAREL_SIZES),
    ("Columbia Men's Silver Ridge Utility Cargo Hiking Pants", "Columbia", "Sport Chek", 85.00, 59.98, "https://www.sportchek.ca/en/search.html?q=Columbia+Men+Silver+Ridge+Pants", [], MENS_BOTTOMS_SIZES),

    ("Lululemon Men's License to Train 7\" Linerless Workout Shorts", "Lululemon", "Lululemon Canada", 88.00, 59.00, "https://shop.lululemon.com/c/search/_/N-1z13y8x?Ntt=Men+License+to+Train+Shorts", [], MENS_BOTTOMS_SIZES),
    ("Lululemon Men's Pace Breaker 7\" Linerless Athletic Shorts", "Lululemon", "Lululemon Canada", 78.00, 54.00, "https://shop.lululemon.com/c/search/_/N-1z13y8x?Ntt=Men+Pace+Breaker+Shorts", [], MENS_BOTTOMS_SIZES)
]

for title, brand, ret, orig, sale, url, coup, sz in mens_apparel_extra:
    extra_deals.append(create_deal(
        title=title, brand=brand, retailer=ret, gender='men',
        category='clothing', subcategory='mens',
        sizes=sz, orig=orig, sale=sale, url=url,
        img=IMAGES['mens'], coupons=coup
    ))

# ─── EXTRA KIDS' DEALS (15 deals) ───
kids_extra = [
    ("Nike Kids' Sportswear Club Fleece Pullover Hoodie", "Nike", "Sport Chek", 55.00, 38.98, "https://www.sportchek.ca/en/search.html?q=Nike+Kids+Club+Fleece+Hoodie", [], KIDS_APPAREL_SIZES),
    ("Nike Kids' Dri-FIT Academy Soccer Training Pants", "Nike", "Sport Chek", 50.00, 34.98, "https://www.sportchek.ca/en/search.html?q=Nike+Kids+Academy+Pants", [], KIDS_APPAREL_SIZES),
    ("Adidas Kids' Tiro 23 League Soccer Pants", "Adidas", "The Shoe Company", 50.00, 34.99, "https://www.theshoecompany.ca/en/ca/search?query=Adidas+Kids+Tiro+Pants", [], KIDS_APPAREL_SIZES),
    ("Adidas Kids' Essentials 3-Stripes Track Top", "Adidas", "Sport Chek", 55.00, 37.98, "https://www.sportchek.ca/en/search.html?q=Adidas+Kids+Track+Top", [], KIDS_APPAREL_SIZES),
    ("Under Armour Kids' Tech Big Logo Short Sleeve T-Shirt", "Under Armour", "Sport Chek", 28.00, 18.98, "https://www.sportchek.ca/en/search.html?q=Under+Armour+Kids+Tech+Tee", [], KIDS_APPAREL_SIZES),
    ("Under Armour Kids' Pennant 2.0 Full-Zip Track Jacket", "Under Armour", "Sport Chek", 60.00, 41.98, "https://www.sportchek.ca/en/search.html?q=Under+Armour+Kids+Pennant+Jacket", [], KIDS_APPAREL_SIZES),
    ("Gap Kids' 100% Organic Cotton Arch Logo Hoodie", "Gap", "Gap Canada", 50.00, 29.99, "https://www.gapcanada.ca/browse/search.do?searchText=Kids+Arch+Logo+Hoodie", COUPONS['gap'], KIDS_APPAREL_SIZES),
    ("Old Navy Kids' Dynamic Fleece Jogger Pants", "Old Navy", "Old Navy Canada", 35.00, 22.99, "https://oldnavy.gapcanada.ca/browse/search.do?searchText=Kids+Dynamic+Fleece+Joggers", COUPONS['oldnavy'], KIDS_APPAREL_SIZES)
]

for title, brand, ret, orig, sale, url, coup, sz in kids_extra:
    extra_deals.append(create_deal(
        title=title, brand=brand, retailer=ret, gender='kids',
        category='clothing', subcategory='mens',
        sizes=sz, orig=orig, sale=sale, url=url,
        img=IMAGES['kids_shoes'], coupons=coup
    ))

# Merge extra_deals
with open('docs/deals-data.json', 'r', encoding='utf-8') as f:
    current_deals = json.load(f)

current_ids = {d['id'] for d in current_deals}
added_extra = 0
for ed in extra_deals:
    if ed['id'] not in current_ids:
        current_deals.append(ed)
        current_ids.add(ed['id'])
        added_extra += 1

print(f"\nExpanded catalog total: {len(current_deals)} deals! (Added {added_extra} additional items)")

with open('docs/deals-data.json', 'w', encoding='utf-8') as f:
    json.dump(current_deals, f, indent=2, ensure_ascii=False)

print("Saved fully enriched catalog to docs/deals-data.json.")
