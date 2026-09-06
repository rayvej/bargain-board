import json
from generate_universal_catalog import (
    deals, create_deal,
    MENS_APPAREL_SIZES, MENS_BOTTOMS_SIZES, WOMENS_APPAREL_SIZES, WOMENS_BOTTOMS_SIZES,
    COUPONS, IMAGES
)
from data_generator import new_deals
from append_tech_apparel import mens_apparel, womens_apparel

# ─── 6. LAPTOPS & COMPUTERS ───
laptops = [
    # Apple
    ("Apple MacBook Air 13.6\" (M2 Chip / 8GB RAM / 256GB SSD) - Midnight", "Apple", "Best Buy Canada", 1299.99, 1099.99, "https://www.bestbuy.ca/en-ca/search?search=Apple+MacBook+Air+M2", []),
    ("Apple MacBook Air 15.3\" (M3 Chip / 16GB RAM / 512GB SSD) - Starlight", "Apple", "Best Buy Canada", 1999.99, 1749.99, "https://www.bestbuy.ca/en-ca/search?search=Apple+MacBook+Air+15+M3", []),
    ("Apple MacBook Pro 14.2\" (M3 Pro Chip / 18GB RAM / 512GB SSD) - Space Black", "Apple", "Best Buy Canada", 2699.99, 2399.99, "https://www.bestbuy.ca/en-ca/search?search=Apple+MacBook+Pro+14+M3+Pro", []),
    ("Apple Mac Mini Desktop (M2 Chip / 8GB RAM / 512GB SSD)", "Apple", "Amazon Canada", 1049.99, 879.99, "https://www.amazon.ca/s?k=Apple+Mac+Mini+M2", []),

    # Dell
    ("Dell XPS 13 9315 Laptop (Intel Core i7-1250U / 16GB RAM / 512GB SSD)", "Dell", "Best Buy Canada", 1499.99, 1149.99, "https://www.bestbuy.ca/en-ca/search?search=Dell+XPS+13+Laptop", []),
    ("Dell XPS 15 9530 Laptop (Intel Core i7-13700H / 16GB / RTX 4050 / 512GB SSD)", "Dell", "Best Buy Canada", 2499.99, 1999.99, "https://www.bestbuy.ca/en-ca/search?search=Dell+XPS+15+Laptop", []),
    ("Dell Inspiron 15 3520 Laptop (Intel Core i5-1235U / 16GB RAM / 512GB SSD)", "Dell", "Best Buy Canada", 799.99, 579.99, "https://www.bestbuy.ca/en-ca/search?search=Dell+Inspiron+15+3520", []),
    ("Alienware m16 R2 16\" QHD+ 240Hz Gaming Laptop (Core Ultra 7 / RTX 4070)", "Dell", "Best Buy Canada", 2599.99, 2099.99, "https://www.bestbuy.ca/en-ca/search?search=Alienware+m16+R2+Gaming+Laptop", []),

    # Lenovo
    ("Lenovo ThinkPad X1 Carbon Gen 11 14\" Ultrabook (Intel Core i7 / 16GB / 512GB)", "Lenovo", "Best Buy Canada", 2199.99, 1599.99, "https://www.bestbuy.ca/en-ca/search?search=Lenovo+ThinkPad+X1+Carbon+Gen+11", []),
    ("Lenovo Legion Pro 5 16\" WQXGA 165Hz Gaming Laptop (Ryzen 7 / RTX 4070)", "Lenovo", "Canada Computers", 2149.99, 1699.99, "https://www.canadacomputers.com/search/results_details.php?keywords=Lenovo+Legion+Pro+5", []),
    ("Lenovo IdeaPad Slim 3 15.6\" FHD Touch Laptop (Ryzen 5 7520U / 8GB / 512GB)", "Lenovo", "Best Buy Canada", 699.99, 499.99, "https://www.bestbuy.ca/en-ca/search?search=Lenovo+IdeaPad+Slim+3", []),
    ("Lenovo Yoga 7i 2-in-1 16\" WUXGA Touch Laptop (Intel Core i7 / 16GB / 1TB)", "Lenovo", "Best Buy Canada", 1399.99, 1049.99, "https://www.bestbuy.ca/en-ca/search?search=Lenovo+Yoga+7i+16", []),

    # Asus
    ("ASUS ROG Zephyrus G14 14\" OLED 120Hz Gaming Laptop (Ryzen 9 / RTX 4060)", "ASUS", "Best Buy Canada", 2199.99, 1799.99, "https://www.bestbuy.ca/en-ca/search?search=ASUS+ROG+Zephyrus+G14", []),
    ("ASUS TUF Gaming A15 15.6\" 144Hz FHD Gaming Laptop (Ryzen 7 / RTX 4050)", "ASUS", "Canada Computers", 1299.99, 999.99, "https://www.canadacomputers.com/search/results_details.php?keywords=ASUS+TUF+Gaming+A15", []),
    ("ASUS Zenbook 14 OLED 14\" Touch Ultrabook (Intel Core Ultra 7 / 16GB / 1TB)", "ASUS", "Best Buy Canada", 1499.99, 1199.99, "https://www.bestbuy.ca/en-ca/search?search=ASUS+Zenbook+14+OLED", []),
    ("ASUS Vivobook 16 16\" FHD Laptop (Intel Core i5-1235U / 16GB / 512GB)", "ASUS", "Amazon Canada", 799.99, 599.99, "https://www.amazon.ca/s?k=ASUS+Vivobook+16", []),

    # HP
    ("HP Envy x360 2-in-1 15.6\" Touchscreen Laptop (AMD Ryzen 7 / 16GB / 512GB)", "HP", "Best Buy Canada", 1199.99, 849.99, "https://www.bestbuy.ca/en-ca/search?search=HP+Envy+x360+15", []),
    ("HP Pavilion 15.6\" FHD IPS Laptop (Intel Core i7-1355U / 16GB / 1TB SSD)", "HP", "Best Buy Canada", 1099.99, 799.99, "https://www.bestbuy.ca/en-ca/search?search=HP+Pavilion+15", []),
    ("HP Victus 15.6\" 144Hz Gaming Laptop (Intel Core i5-13420H / RTX 4050)", "HP", "Best Buy Canada", 1199.99, 899.99, "https://www.bestbuy.ca/en-ca/search?search=HP+Victus+15+Gaming+Laptop", []),
    ("HP OMEN Transcend 14\" 2.8K OLED Gaming Laptop (Intel Core Ultra 9 / RTX 4070)", "HP", "Best Buy Canada", 2499.99, 1999.99, "https://www.bestbuy.ca/en-ca/search?search=HP+OMEN+Transcend+14", []),

    # Acer
    ("Acer Nitro 5 15.6\" 144Hz Gaming Laptop (Intel Core i5-12450H / RTX 4050)", "Acer", "Best Buy Canada", 1149.99, 849.99, "https://www.bestbuy.ca/en-ca/search?search=Acer+Nitro+5+Gaming+Laptop", []),
    ("Acer Swift Go 14\" 2.8K OLED Ultrabook (Intel Core i7-13700H / 16GB / 512GB)", "Acer", "Amazon Canada", 1199.99, 899.99, "https://www.amazon.ca/s?k=Acer+Swift+Go+14+OLED", []),
    ("Acer Aspire 3 15.6\" FHD Slim Laptop (AMD Ryzen 3 7320U / 8GB / 256GB)", "Acer", "Amazon Canada", 549.99, 399.99, "https://www.amazon.ca/s?k=Acer+Aspire+3+15", [])
]

for title, brand, ret, orig, sale, url, coup in laptops:
    new_deals.append(create_deal(
        title=title, brand=brand, retailer=ret, gender='all',
        category='electronics', subcategory='laptops',
        sizes=[], orig=orig, sale=sale, url=url,
        img=IMAGES['laptops'], coupons=coup
    ))

print(f"Added {len(laptops)} Laptop deals.")

# ─── 7. PHONES & TABLETS ───
phones = [
    # Apple
    ("Apple iPhone 15 Pro Max 256GB (Natural Titanium)", "Apple", "Best Buy Canada", 1749.99, 1549.99, "https://www.bestbuy.ca/en-ca/search?search=Apple+iPhone+15+Pro+Max", []),
    ("Apple iPhone 15 128GB (Black)", "Apple", "Best Buy Canada", 1129.99, 979.99, "https://www.bestbuy.ca/en-ca/search?search=Apple+iPhone+15", []),
    ("Apple iPhone 14 128GB (Midnight)", "Apple", "Best Buy Canada", 999.99, 799.99, "https://www.bestbuy.ca/en-ca/search?search=Apple+iPhone+14", []),
    ("Apple iPad 10.9\" 10th Gen 64GB Wi-Fi (Silver)", "Apple", "Best Buy Canada", 499.99, 429.99, "https://www.bestbuy.ca/en-ca/search?search=Apple+iPad+10th+Gen", []),
    ("Apple iPad Air 11\" M2 Chip 128GB Wi-Fi (Space Grey)", "Apple", "Best Buy Canada", 799.99, 729.99, "https://www.bestbuy.ca/en-ca/search?search=Apple+iPad+Air+11+M2", []),
    ("Apple iPad Pro 11\" M4 Chip Ultra Retina XDR 256GB (Silver)", "Apple", "Best Buy Canada", 1399.99, 1269.99, "https://www.bestbuy.ca/en-ca/search?search=Apple+iPad+Pro+11+M4", []),
    ("Apple iPad Mini 6th Gen 8.3\" 64GB Wi-Fi (Purple)", "Apple", "Amazon Canada", 679.99, 579.99, "https://www.amazon.ca/s?k=Apple+iPad+Mini+6th+Gen", []),

    # Samsung
    ("Samsung Galaxy S24 Ultra 256GB 5G Smartphone (Titanium Gray)", "Samsung", "Best Buy Canada", 1799.99, 1499.99, "https://www.bestbuy.ca/en-ca/search?search=Samsung+Galaxy+S24+Ultra", []),
    ("Samsung Galaxy S24+ 256GB 5G Smartphone (Onyx Black)", "Samsung", "Best Buy Canada", 1399.99, 1149.99, "https://www.bestbuy.ca/en-ca/search?search=Samsung+Galaxy+S24+Plus", []),
    ("Samsung Galaxy S24 128GB 5G Smartphone (Cobalt Violet)", "Samsung", "Best Buy Canada", 1099.99, 879.99, "https://www.bestbuy.ca/en-ca/search?search=Samsung+Galaxy+S24", []),
    ("Samsung Galaxy Z Flip 5 256GB Foldable Smartphone (Mint)", "Samsung", "Best Buy Canada", 1299.99, 949.99, "https://www.bestbuy.ca/en-ca/search?search=Samsung+Galaxy+Z+Flip+5", []),
    ("Samsung Galaxy Z Fold 5 256GB Foldable Smartphone (Phantom Black)", "Samsung", "Best Buy Canada", 2399.99, 1799.99, "https://www.bestbuy.ca/en-ca/search?search=Samsung+Galaxy+Z+Fold+5", []),
    ("Samsung Galaxy Tab S9 11\" 128GB Wi-Fi Android Tablet with S Pen", "Samsung", "Best Buy Canada", 1099.99, 849.99, "https://www.bestbuy.ca/en-ca/search?search=Samsung+Galaxy+Tab+S9", []),
    ("Samsung Galaxy Tab A9+ 11\" 64GB Wi-Fi Android Tablet (Graphite)", "Samsung", "Amazon Canada", 279.99, 219.99, "https://www.amazon.ca/s?k=Samsung+Galaxy+Tab+A9+Plus", []),

    # Google
    ("Google Pixel 8 Pro 128GB 5G Smartphone (Obsidian)", "Google", "Best Buy Canada", 1349.99, 999.99, "https://www.bestbuy.ca/en-ca/search?search=Google+Pixel+8+Pro", []),
    ("Google Pixel 8 128GB 5G Smartphone (Hazel)", "Google", "Best Buy Canada", 949.99, 699.99, "https://www.bestbuy.ca/en-ca/search?search=Google+Pixel+8", []),
    ("Google Pixel 8a 128GB 5G Smartphone (Bay Blue)", "Google", "Best Buy Canada", 679.99, 549.99, "https://www.bestbuy.ca/en-ca/search?search=Google+Pixel+8a", []),
    ("Google Pixel 7a 128GB 5G Smartphone (Charcoal)", "Google", "Amazon Canada", 599.99, 449.99, "https://www.amazon.ca/s?k=Google+Pixel+7a", []),
    ("Google Pixel Tablet 11\" 128GB with Charging Speaker Dock (Porcelain)", "Google", "Best Buy Canada", 699.99, 519.99, "https://www.bestbuy.ca/en-ca/search?search=Google+Pixel+Tablet", [])
]

for title, brand, ret, orig, sale, url, coup in phones:
    new_deals.append(create_deal(
        title=title, brand=brand, retailer=ret, gender='all',
        category='electronics', subcategory='phones',
        sizes=[], orig=orig, sale=sale, url=url,
        img=IMAGES['phones'], coupons=coup
    ))

print(f"Added {len(phones)} Phone & Tablet deals.")

# ─── 8. HEADPHONES & AUDIO ───
headphones = [
    # Apple
    ("Apple AirPods Pro (2nd Generation with USB-C MagSafe Case)", "Apple", "Best Buy Canada", 329.99, 269.99, "https://www.bestbuy.ca/en-ca/search?search=Apple+AirPods+Pro+2nd+Gen", []),
    ("Apple AirPods (3rd Generation with Lightning Charging Case)", "Apple", "Best Buy Canada", 229.99, 189.99, "https://www.bestbuy.ca/en-ca/search?search=Apple+AirPods+3rd+Gen", []),
    ("Apple AirPods Max Wireless Over-Ear Active Noise Cancelling (Space Grey)", "Apple", "Amazon Canada", 779.99, 649.99, "https://www.amazon.ca/s?k=Apple+AirPods+Max", []),

    # Sony
    ("Sony WH-1000XM5 Wireless Noise Cancelling Over-Ear Headphones (Black)", "Sony", "Best Buy Canada", 499.99, 399.99, "https://www.bestbuy.ca/en-ca/search?search=Sony+WH+1000XM5", []),
    ("Sony WH-1000XM4 Wireless Noise Cancelling Over-Ear Headphones (Silver)", "Sony", "Best Buy Canada", 429.99, 328.00, "https://www.bestbuy.ca/en-ca/search?search=Sony+WH+1000XM4", []),
    ("Sony WF-1000XM5 True Wireless Noise Cancelling In-Ear Earbuds", "Sony", "Amazon Canada", 399.99, 319.99, "https://www.amazon.ca/s?k=Sony+WF+1000XM5", []),
    ("Sony LinkBuds S Truly Wireless Noise Cancelling Earbuds (White)", "Sony", "Best Buy Canada", 269.99, 179.99, "https://www.bestbuy.ca/en-ca/search?search=Sony+LinkBuds+S", []),
    ("Sony ULT WEAR Wireless Noise Cancelling Extra Bass Headphones", "Sony", "Best Buy Canada", 249.99, 198.00, "https://www.bestbuy.ca/en-ca/search?search=Sony+ULT+WEAR", []),

    # Bose
    ("Bose QuietComfort Ultra Wireless Noise Cancelling Headphones (Black)", "Bose", "Best Buy Canada", 549.99, 449.99, "https://www.bestbuy.ca/en-ca/search?search=Bose+QuietComfort+Ultra+Headphones", []),
    ("Bose QuietComfort 45 Bluetooth Wireless Noise Cancelling Headphones", "Bose", "Amazon Canada", 449.99, 349.99, "https://www.amazon.ca/s?k=Bose+QuietComfort+45", []),
    ("Bose QuietComfort Ultra True Wireless Noise Cancelling Earbuds", "Bose", "Best Buy Canada", 379.99, 299.99, "https://www.bestbuy.ca/en-ca/search?search=Bose+QuietComfort+Ultra+Earbuds", []),
    ("Bose SoundLink Flex Waterproof Bluetooth Portable Speaker", "Bose", "Amazon Canada", 199.99, 149.99, "https://www.amazon.ca/s?k=Bose+SoundLink+Flex", []),

    # JBL
    ("JBL Tune 760NC Wireless Over-Ear Active Noise Cancelling Headphones", "JBL", "Best Buy Canada", 179.99, 99.99, "https://www.bestbuy.ca/en-ca/search?search=JBL+Tune+760NC", []),
    ("JBL Flip 6 Waterproof Portable Bluetooth Speaker (Black)", "JBL", "Best Buy Canada", 169.99, 129.99, "https://www.bestbuy.ca/en-ca/search?search=JBL+Flip+6", []),
    ("JBL Charge 5 Portable Waterproof Bluetooth Speaker with Powerbank", "JBL", "Amazon Canada", 239.99, 179.99, "https://www.amazon.ca/s?k=JBL+Charge+5", []),

    # Sennheiser
    ("Sennheiser Momentum 4 Wireless Adaptive Noise Cancelling Headphones", "Sennheiser", "Best Buy Canada", 499.99, 369.99, "https://www.bestbuy.ca/en-ca/search?search=Sennheiser+Momentum+4", []),
    ("Sennheiser Accentum Wireless Over-Ear Noise Cancelling Headphones", "Sennheiser", "Amazon Canada", 249.99, 179.99, "https://www.amazon.ca/s?k=Sennheiser+Accentum+Wireless", []),
    ("Sennheiser HD 560S Over-Ear Open Back Audiophile Headphones", "Sennheiser", "Amazon Canada", 279.99, 199.99, "https://www.amazon.ca/s?k=Sennheiser+HD+560S", []),

    # Beats
    ("Beats Studio Pro Wireless Active Noise Cancelling Headphones (Navy)", "Beats", "Best Buy Canada", 469.99, 279.99, "https://www.bestbuy.ca/en-ca/search?search=Beats+Studio+Pro", []),
    ("Beats Fit Pro True Wireless Noise Cancelling Earbuds (Tidal Blue)", "Beats", "Best Buy Canada", 249.99, 189.99, "https://www.bestbuy.ca/en-ca/search?search=Beats+Fit+Pro", []),
    ("Beats Solo 4 Wireless On-Ear Bluetooth Headphones (Matte Black)", "Beats", "Best Buy Canada", 279.99, 199.99, "https://www.bestbuy.ca/en-ca/search?search=Beats+Solo+4", []),

    # Anker
    ("Anker Soundcore Space Q45 Adaptive Active Noise Cancelling Headphones", "Anker", "Amazon Canada", 199.99, 129.99, "https://www.amazon.ca/s?k=Anker+Soundcore+Space+Q45", []),
    ("Anker Soundcore Liberty 4 NC Wireless Noise Cancelling Earbuds", "Anker", "Amazon Canada", 129.99, 89.99, "https://www.amazon.ca/s?k=Anker+Soundcore+Liberty+4+NC", []),
    ("Anker Soundcore Motion+ 30W Bluetooth Speaker with Hi-Res Audio", "Anker", "Amazon Canada", 149.99, 99.99, "https://www.amazon.ca/s?k=Anker+Soundcore+Motion+Plus", [])
]

for title, brand, ret, orig, sale, url, coup in headphones:
    new_deals.append(create_deal(
        title=title, brand=brand, retailer=ret, gender='all',
        category='electronics', subcategory='headphones',
        sizes=[], orig=orig, sale=sale, url=url,
        img=IMAGES['headphones'], coupons=coup
    ))

print(f"Added {len(headphones)} Headphone deals.")

# ─── 9. TVS & MONITORS ───
tvs = [
    # Samsung
    ("Samsung 65\" Class S90C OLED 4K UHD Smart TV (QN65S90CAFXZC)", "Samsung", "Best Buy Canada", 2499.99, 1999.99, "https://www.bestbuy.ca/en-ca/search?search=Samsung+65+S90C+OLED", []),
    ("Samsung 55\" Class QN85C Neo QLED 4K UHD Smart TV (QN55QN85CAFXZC)", "Samsung", "Best Buy Canada", 1799.99, 1399.99, "https://www.bestbuy.ca/en-ca/search?search=Samsung+55+QN85C+Neo+QLED", []),
    ("Samsung 50\" Class CU7000 Crystal UHD 4K Smart TV", "Samsung", "Best Buy Canada", 599.99, 479.99, "https://www.bestbuy.ca/en-ca/search?search=Samsung+50+CU7000+Crystal+UHD", []),
    ("Samsung Odyssey G7 32\" Curved 240Hz 1ms QHD Gaming Monitor", "Samsung", "Amazon Canada", 899.99, 649.99, "https://www.amazon.ca/s?k=Samsung+Odyssey+G7+32+Gaming+Monitor", []),
    ("Samsung Odyssey Neo G9 49\" Curved Dual QHD 240Hz Mini-LED Monitor", "Samsung", "Best Buy Canada", 2499.99, 1799.99, "https://www.bestbuy.ca/en-ca/search?search=Samsung+Odyssey+Neo+G9", []),

    # LG
    ("LG 65\" Class C3 Series OLED evo 4K UHD Smart TV (OLED65C3PUA)", "LG", "Best Buy Canada", 2399.99, 1899.99, "https://www.bestbuy.ca/en-ca/search?search=LG+65+C3+OLED", []),
    ("LG 55\" Class B3 Series OLED 4K UHD Smart TV (OLED55B3PUA)", "LG", "Best Buy Canada", 1599.99, 1299.99, "https://www.bestbuy.ca/en-ca/search?search=LG+55+B3+OLED", []),
    ("LG 50\" Class UR8000 4K UHD HDR Smart TV", "LG", "Walmart Canada", 549.99, 429.98, "https://www.walmart.ca/search?q=LG+50+UR8000+4K+TV", []),
    ("LG UltraGear 27\" QHD 144Hz 1ms IPS Gaming Monitor (27GN800-B)", "LG", "Amazon Canada", 399.99, 279.99, "https://www.amazon.ca/s?k=LG+UltraGear+27GN800-B", []),
    ("LG UltraGear 34\" Curved UltraWide QHD 160Hz Gaming Monitor (34GP63A-B)", "LG", "Best Buy Canada", 549.99, 399.99, "https://www.bestbuy.ca/en-ca/search?search=LG+UltraGear+34+Curved+Monitor", []),

    # Sony
    ("Sony 65\" BRAVIA XR X90L Full Array LED 4K Smart Google TV", "Sony", "Best Buy Canada", 1699.99, 1399.99, "https://www.bestbuy.ca/en-ca/search?search=Sony+65+X90L+BRAVIA+XR", []),
    ("Sony 55\" BRAVIA XR A80L OLED 4K UHD Smart Google TV", "Sony", "Best Buy Canada", 2199.99, 1699.99, "https://www.bestbuy.ca/en-ca/search?search=Sony+55+A80L+BRAVIA+OLED", []),

    # TCL
    ("TCL 65\" Class Q7 QLED 4K Smart TV with Google TV (65Q750G-CA)", "TCL", "Best Buy Canada", 999.99, 749.99, "https://www.bestbuy.ca/en-ca/search?search=TCL+65+Q7+QLED", []),
    ("TCL 55\" Class QM8 Mini-LED QLED 4K Smart TV (55QM850G-CA)", "TCL", "Best Buy Canada", 1299.99, 999.99, "https://www.bestbuy.ca/en-ca/search?search=TCL+55+QM8+Mini+LED", []),

    # Hisense
    ("Hisense 65\" U78K Series Mini-LED ULED 4K Google TV", "Hisense", "Best Buy Canada", 1199.99, 899.99, "https://www.bestbuy.ca/en-ca/search?search=Hisense+65+U78K+Mini+LED", []),
    ("Hisense 55\" U68K Series Mini-LED 4K Google TV", "Hisense", "Amazon Canada", 699.99, 529.99, "https://www.amazon.ca/s?k=Hisense+55+U68K", []),

    # Dell & Asus Monitors
    ("Dell 27\" 4K UHD USB-C Hub Monitor (S2722QC)", "Dell", "Dell Canada", 499.99, 369.99, "https://www.dell.com/en-ca/search/S2722QC", []),
    ("Alienware 34\" Curved QD-OLED 165Hz Gaming Monitor (AW3423DWF)", "Dell", "Dell Canada", 1099.99, 899.99, "https://www.dell.com/en-ca/search/AW3423DWF", []),
    ("ASUS TUF Gaming 27\" 165Hz 1080p Curved Gaming Monitor (VG277Q1A)", "ASUS", "Canada Computers", 269.99, 189.99, "https://www.canadacomputers.com/search/results_details.php?keywords=ASUS+TUF+VG277Q1A", []),
    ("ASUS ProArt Display 27\" 1440p IPS Professional Monitor (PA278CV)", "ASUS", "Amazon Canada", 399.99, 299.99, "https://www.amazon.ca/s?k=ASUS+ProArt+PA278CV", [])
]

for title, brand, ret, orig, sale, url, coup in tvs:
    new_deals.append(create_deal(
        title=title, brand=brand, retailer=ret, gender='all',
        category='electronics', subcategory='tvs',
        sizes=[], orig=orig, sale=sale, url=url,
        img=IMAGES['tvs'], coupons=coup
    ))

print(f"Added {len(tvs)} TV & Monitor deals.")

# ─── 10. GAMING ───
gaming = [
    # PlayStation
    ("PlayStation 5 Slim Console (Disc Edition)", "PlayStation", "Best Buy Canada", 649.99, 579.99, "https://www.bestbuy.ca/en-ca/search?search=PlayStation+5+Slim+Console", []),
    ("PlayStation 5 DualSense Wireless Controller (Midnight Black)", "PlayStation", "Best Buy Canada", 89.99, 69.99, "https://www.bestbuy.ca/en-ca/search?search=PlayStation+5+DualSense+Midnight+Black", []),
    ("PlayStation PULSE 3D Wireless Headset (White)", "PlayStation", "Best Buy Canada", 129.99, 99.99, "https://www.bestbuy.ca/en-ca/search?search=PlayStation+PULSE+3D+Wireless+Headset", []),
    ("Marvel's Spider-Man 2 - PlayStation 5 Game", "PlayStation", "Best Buy Canada", 89.99, 59.99, "https://www.bestbuy.ca/en-ca/search?search=Spider+Man+2+PS5", []),
    ("God of War Ragnarok - PlayStation 5 Game", "PlayStation", "Walmart Canada", 89.99, 49.96, "https://www.walmart.ca/search?q=God+of+War+Ragnarok+PS5", []),

    # Nintendo
    ("Nintendo Switch - OLED Model (White Joy-Con)", "Nintendo", "Best Buy Canada", 449.99, 399.99, "https://www.bestbuy.ca/en-ca/search?search=Nintendo+Switch+OLED+White", []),
    ("Nintendo Switch Pro Controller", "Nintendo", "Amazon Canada", 89.99, 69.99, "https://www.amazon.ca/s?k=Nintendo+Switch+Pro+Controller", []),
    ("Mario Kart 8 Deluxe - Nintendo Switch Game", "Nintendo", "Walmart Canada", 79.99, 54.96, "https://www.walmart.ca/search?q=Mario+Kart+8+Deluxe+Switch", []),
    ("The Legend of Zelda: Tears of the Kingdom - Nintendo Switch Game", "Nintendo", "Best Buy Canada", 89.99, 64.99, "https://www.bestbuy.ca/en-ca/search?search=Zelda+Tears+of+the+Kingdom", []),
    ("Super Mario Bros. Wonder - Nintendo Switch Game", "Nintendo", "Best Buy Canada", 79.99, 59.99, "https://www.bestbuy.ca/en-ca/search?search=Super+Mario+Bros+Wonder", []),

    # Xbox
    ("Xbox Series X 1TB Video Game Console", "Xbox", "Best Buy Canada", 649.99, 549.99, "https://www.bestbuy.ca/en-ca/search?search=Xbox+Series+X+1TB+Console", []),
    ("Xbox Series S 512GB All-Digital Video Game Console", "Xbox", "Best Buy Canada", 379.99, 319.99, "https://www.bestbuy.ca/en-ca/search?search=Xbox+Series+S+Console", []),
    ("Xbox Wireless Controller (Carbon Black)", "Xbox", "Amazon Canada", 74.99, 54.99, "https://www.amazon.ca/s?k=Xbox+Wireless+Controller+Carbon+Black", []),

    # Peripherals
    ("Logitech G502 HERO High Performance Gaming Mouse", "Logitech", "Amazon Canada", 79.99, 49.99, "https://www.amazon.ca/s?k=Logitech+G502+HERO+Gaming+Mouse", []),
    ("Logitech G PRO X Wireless Mechanical Gaming Keyboard", "Logitech", "Best Buy Canada", 249.99, 179.99, "https://www.bestbuy.ca/en-ca/search?search=Logitech+G+PRO+X+Wireless+Keyboard", []),
    ("Razer BlackShark V2 Pro Wireless Esports Gaming Headset", "Razer", "Amazon Canada", 249.99, 179.99, "https://www.amazon.ca/s?k=Razer+BlackShark+V2+Pro", []),
    ("Razer DeathAdder V3 Pro Wireless Ergonomic Gaming Mouse", "Razer", "Best Buy Canada", 199.99, 149.99, "https://www.bestbuy.ca/en-ca/search?search=Razer+DeathAdder+V3+Pro", []),
    ("SteelSeries Arctis Nova 7 Wireless Multi-Platform Gaming Headset", "SteelSeries", "Best Buy Canada", 229.99, 169.99, "https://www.bestbuy.ca/en-ca/search?search=SteelSeries+Arctis+Nova+7", [])
]

for title, brand, ret, orig, sale, url, coup in gaming:
    new_deals.append(create_deal(
        title=title, brand=brand, retailer=ret, gender='all',
        category='electronics', subcategory='gaming',
        sizes=[], orig=orig, sale=sale, url=url,
        img=IMAGES['gaming'], coupons=coup
    ))

print(f"Added {len(gaming)} Gaming deals.")

# ─── 11. SMART HOME ───
smarthome = [
    ("Google Nest Learning Thermostat (3rd Gen Stainless Steel)", "Google", "Best Buy Canada", 329.99, 249.99, "https://www.bestbuy.ca/en-ca/search?search=Google+Nest+Learning+Thermostat", []),
    ("Google Nest Cam Outdoor or Indoor Battery-Powered Security Camera", "Google", "Best Buy Canada", 239.99, 179.99, "https://www.bestbuy.ca/en-ca/search?search=Google+Nest+Cam+Battery", []),
    ("Google Nest Video Doorbell (Wired 2nd Gen) - Snow", "Google", "Best Buy Canada", 239.99, 179.99, "https://www.bestbuy.ca/en-ca/search?search=Google+Nest+Doorbell+Wired", []),
    ("Google Nest Audio Smart Bluetooth Speaker (Chalk)", "Google", "Best Buy Canada", 129.99, 79.99, "https://www.bestbuy.ca/en-ca/search?search=Google+Nest+Audio+Speaker", []),

    ("Amazon Echo Show 8 (3rd Gen HD Smart Display with Spatial Audio)", "Amazon", "Amazon Canada", 199.99, 139.99, "https://www.amazon.ca/s?k=Amazon+Echo+Show+8+3rd+Gen", []),
    ("Amazon Echo Dot (5th Gen Smart Speaker with Alexa) - Charcoal", "Amazon", "Amazon Canada", 69.99, 44.99, "https://www.amazon.ca/s?k=Amazon+Echo+Dot+5th+Gen", []),
    ("Ring Video Doorbell Plus (Head-to-Toe HD+ Video / Two-Way Talk)", "Ring", "Amazon Canada", 199.99, 139.99, "https://www.amazon.ca/s?k=Ring+Video+Doorbell+Plus", []),
    ("Ring Floodlight Cam Wired Plus with Motion-Activated 1080p HD", "Ring", "Best Buy Canada", 259.99, 179.99, "https://www.bestbuy.ca/en-ca/search?search=Ring+Floodlight+Cam+Wired+Plus", []),
    ("Blink Outdoor 4 Wireless Smart Security Camera (3-Camera System)", "Blink", "Amazon Canada", 329.99, 199.99, "https://www.amazon.ca/s?k=Blink+Outdoor+4+3+Camera+System", []),

    ("Philips Hue White & Color Ambiance LED Smart Bulb Starter Kit (4 Bulbs + Bridge)", "Philips", "Best Buy Canada", 249.99, 179.99, "https://www.bestbuy.ca/en-ca/search?search=Philips+Hue+White+and+Color+Starter+Kit", []),
    ("Philips Hue Lightstrip Plus 2-Meter Base Kit", "Philips", "Amazon Canada", 119.99, 84.99, "https://www.amazon.ca/s?k=Philips+Hue+Lightstrip+Plus", []),

    ("TP-Link Kasa Smart Wi-Fi Plug Mini 4-Pack (EP10P4)", "TP-Link", "Amazon Canada", 49.99, 32.99, "https://www.amazon.ca/s?k=TP+Link+Kasa+Smart+Plug+Mini+4+Pack", []),
    ("TP-Link Kasa Smart Wi-Fi Light Switch (HS200)", "TP-Link", "Amazon Canada", 29.99, 19.99, "https://www.amazon.ca/s?k=TP+Link+Kasa+Smart+Light+Switch+HS200", []),

    ("Eufy SoloCam S220 Solar Security Camera Wireless Outdoor", "Eufy", "Amazon Canada", 169.99, 109.99, "https://www.amazon.ca/s?k=Eufy+SoloCam+S220+Solar", []),
    ("Eufy Video Doorbell 2K (Battery-Powered with HomeBase 2)", "Eufy", "Best Buy Canada", 259.99, 179.99, "https://www.bestbuy.ca/en-ca/search?search=Eufy+Video+Doorbell+2K", [])
]

for title, brand, ret, orig, sale, url, coup in smarthome:
    new_deals.append(create_deal(
        title=title, brand=brand, retailer=ret, gender='all',
        category='electronics', subcategory='smarthome',
        sizes=[], orig=orig, sale=sale, url=url,
        img=IMAGES['smarthome'], coupons=coup
    ))

print(f"Added {len(smarthome)} Smart Home deals.")

# ─── 12. ACCESSORIES ───
accessories = [
    # Backpacks
    ("Herschel Little America Classic 25L Backpack (Navy/Tan Synthetic Leather)", "Herschel", "The Bay", 140.00, 94.99, "https://www.thebay.com/search?q=Herschel+Little+America+Backpack", COUPONS['thebay']),
    ("Fjallraven Kanken Classic 16L Everyday Backpack (Ox Red)", "Fjallraven", "Sport Chek", 115.00, 79.98, "https://www.sportchek.ca/en/search.html?q=Fjallraven+Kanken+Classic+Backpack", []),
    ("Nike Heritage Crossbody Bag (Black/White)", "Nike", "Nike Canada", 35.00, 24.99, "https://www.nike.com/ca/w?q=Nike+Heritage+Crossbody+Bag", COUPONS['nike']),
    ("Carhartt Legacy Standard Work Backpack with Padded Laptop Sleeve", "Carhartt", "Amazon Canada", 100.00, 69.99, "https://www.amazon.ca/s?k=Carhartt+Legacy+Standard+Work+Backpack", []),
    ("The North Face Borealis 28L Everyday Commuter Backpack", "The North Face", "Sport Chek", 130.00, 89.98, "https://www.sportchek.ca/en/search.html?q=The+North+Face+Borealis+Backpack", []),

    # Watches
    ("Casio G-Shock Classic Tough Solar Digital Watch (DW5600)", "Casio", "Amazon Canada", 140.00, 94.99, "https://www.amazon.ca/s?k=Casio+G+Shock+DW5600", []),
    ("Fossil Grant Chronograph Brown Leather Watch (FS4813)", "Fossil", "The Bay", 195.00, 119.99, "https://www.thebay.com/search?q=Fossil+Grant+Chronograph+Watch", COUPONS['thebay']),
    ("Timex Weekender 38mm Slip-Thru Strap Casual Watch", "Timex", "Amazon Canada", 65.00, 44.99, "https://www.amazon.ca/s?k=Timex+Weekender+38mm", []),
    ("Citizen Eco-Drive Promaster Diver 200m Watch (BN0150-28E)", "Citizen", "The Bay", 395.00, 269.99, "https://www.thebay.com/search?q=Citizen+Eco+Drive+Promaster+Diver", COUPONS['thebay']),

    # Sunglasses
    ("Ray-Ban Classic Aviator Sunglasses (RB3025 Gold Frame / Green Lens)", "Ray-Ban", "The Bay", 244.00, 169.99, "https://www.thebay.com/search?q=Ray+Ban+Classic+Aviator+RB3025", COUPONS['thebay']),
    ("Oakley Holbrook Sunglasses (Matte Black Frame / Prizm Sapphire Lens)", "Oakley", "Sport Chek", 215.00, 149.98, "https://www.sportchek.ca/en/search.html?q=Oakley+Holbrook+Sunglasses", []),
    ("Ray-Ban Original Wayfarer Classic Sunglasses (RB2140 Black)", "Ray-Ban", "The Bay", 230.00, 159.99, "https://www.thebay.com/search?q=Ray+Ban+Original+Wayfarer+RB2140", COUPONS['thebay']),

    # Headwear & Wallets
    ("Carhartt Knit Cuffed Beanie (A18 Coal Heather)", "Carhartt", "Sport Chek", 28.00, 19.98, "https://www.sportchek.ca/en/search.html?q=Carhartt+A18+Knit+Cuffed+Beanie", []),
    ("Nike Club Metal Swoosh Adjustable Curved Bill Cap", "Nike", "The Shoe Company", 32.00, 21.99, "https://www.theshoecompany.ca/en/ca/search?query=Nike+Club+Metal+Swoosh+Cap", []),
    ("Timberland Men's Blix Leather Passcase Billfold Wallet (Brown)", "Timberland", "Amazon Canada", 45.00, 29.99, "https://www.amazon.ca/s?k=Timberland+Men+Leather+Passcase+Wallet", []),
    ("Bellroy Slim Sleeve Premium Leather Bifold Wallet (Black)", "Bellroy", "Amazon Canada", 109.00, 79.99, "https://www.amazon.ca/s?k=Bellroy+Slim+Sleeve+Wallet", [])
]

for title, brand, ret, orig, sale, url, coup in accessories:
    new_deals.append(create_deal(
        title=title, brand=brand, retailer=ret, gender='unisex',
        category='clothing', subcategory='accessories',
        sizes=[], orig=orig, sale=sale, url=url,
        img=IMAGES['accessories'], coupons=coup
    ))

print(f"Added {len(accessories)} Accessory deals.")

# ─── 13. ACTIVEWEAR ───
activewear = [
    # Men's
    ("Under Armour Men's HeatGear Armour Compression Shorts", "Under Armour", "Under Armour Canada", 40.00, 27.99, "https://www.underarmour.ca/en-ca/search?q=Men+HeatGear+Armour+Compression+Shorts", COUPONS['underarmour'], MENS_BOTTOMS_SIZES),
    ("Nike Men's Dri-FIT Challenger 7\" Brief-Lined Running Shorts", "Nike", "Sport Chek", 55.00, 37.98, "https://www.sportchek.ca/en/search.html?q=Nike+Men+Challenger+7+Shorts", [], MENS_BOTTOMS_SIZES),
    ("Nike Men's Pro Dri-FIT Tight Long Sleeve Fitness Top", "Nike", "Nike Canada", 48.00, 32.99, "https://www.nike.com/ca/w?q=Men+Pro+Dri+FIT+Tight+Top", COUPONS['nike'], MENS_APPAREL_SIZES),
    ("Adidas Men's Own The Run Running Shorts with Pockets", "Adidas", "Adidas Canada", 50.00, 32.99, "https://www.adidas.ca/en/search?q=Men+Own+The+Run+Shorts", COUPONS['adidas'], MENS_BOTTOMS_SIZES),
    ("Gymshark Men's Arrival 5\" Lightweight Athletic Shorts", "Gymshark", "Sport Chek", 40.00, 26.98, "https://www.sportchek.ca/en/search.html?q=Gymshark+Men+Arrival+Shorts", [], MENS_BOTTOMS_SIZES),

    # Women's
    ("Lululemon Women's Fast and Free High-Rise Tight 25\" Nulux", "Lululemon", "Lululemon Canada", 138.00, 99.00, "https://shop.lululemon.com/c/search/_/N-1z13y8x?Ntt=Women+Fast+and+Free+Tight", [], WOMENS_BOTTOMS_SIZES),
    ("Nike Women's Swoosh Medium-Support Non-Padded Sports Bra", "Nike", "Sport Chek", 45.00, 29.98, "https://www.sportchek.ca/en/search.html?q=Nike+Women+Swoosh+Sports+Bra", [], WOMENS_APPAREL_SIZES),
    ("Under Armour Women's Fly-By 2.0 Running Shorts", "Under Armour", "Sport Chek", 35.00, 22.98, "https://www.sportchek.ca/en/search.html?q=Under+Armour+Women+Fly+By+Shorts", [], WOMENS_BOTTOMS_SIZES),
    ("Gymshark Women's Vital Seamless 2.0 High-Waisted Leggings", "Gymshark", "Sport Chek", 70.00, 48.98, "https://www.sportchek.ca/en/search.html?q=Gymshark+Women+Vital+Seamless+Leggings", [], WOMENS_BOTTOMS_SIZES),
    ("Adidas Women's Techfit 7/8 Length High-Rise Training Tights", "Adidas", "Adidas Canada", 65.00, 42.99, "https://www.adidas.ca/en/search?q=Women+Techfit+7+8+Tights", COUPONS['adidas'], WOMENS_BOTTOMS_SIZES)
]

for title, brand, ret, orig, sale, url, coup, sz in activewear:
    new_deals.append(create_deal(
        title=title, brand=brand, retailer=ret,
        gender='women' if 'Women' in title else 'men',
        category='clothing', subcategory='activewear',
        sizes=sz, orig=orig, sale=sale, url=url,
        img=IMAGES['activewear'], coupons=coup
    ))

print(f"Added {len(activewear)} Activewear deals.")

# Merge and deduplicate by id
existing_ids = {d['id'] for d in deals}
added_count = 0
for nd in new_deals:
    if nd['id'] not in existing_ids:
        deals.append(nd)
        existing_ids.add(nd['id'])
        added_count += 1

print(f"\nFinal catalog deal count: {len(deals)} (Added {added_count} brand new verified deals!)")

# Write back to docs/deals-data.json
with open('docs/deals-data.json', 'w', encoding='utf-8') as f:
    json.dump(deals, f, indent=2, ensure_ascii=False)

print("Saved updated catalog to docs/deals-data.json.")
