import json
import urllib.parse
from generate_universal_catalog import (
    deals, create_deal,
    MENS_SHOE_SIZES, WOMENS_SHOE_SIZES, KIDS_SHOE_SIZES,
    MENS_APPAREL_SIZES, MENS_BOTTOMS_SIZES,
    WOMENS_APPAREL_SIZES, WOMENS_BOTTOMS_SIZES, KIDS_APPAREL_SIZES,
    COUPONS, IMAGES
)
from data_generator import new_deals

# ─── 4. MEN'S APPAREL ───
mens_apparel = [
    # Nike
    ("Nike Men's Club Fleece Pullover Hoodie (Dark Grey Heather)", "Nike", "Nike Canada", 80.00, 56.99, "https://www.nike.com/ca/w?q=Men+Club+Fleece+Hoodie", COUPONS['nike'], MENS_APPAREL_SIZES),
    ("Nike Men's Sportswear Club Fleece Joggers (Black)", "Nike", "Nike Canada", 75.00, 52.99, "https://www.nike.com/ca/w?q=Men+Club+Fleece+Joggers", COUPONS['nike'], MENS_BOTTOMS_SIZES),
    ("Nike Men's Dri-FIT Legend Short-Sleeve Training Tee", "Nike", "Sport Chek", 40.00, 27.98, "https://www.sportchek.ca/en/search.html?q=Nike+Men+Dri+FIT+Legend+Tee", [], MENS_APPAREL_SIZES),
    ("Nike Men's Windrunner Full-Zip Hooded Running Jacket", "Nike", "Sport Chek", 140.00, 94.98, "https://www.sportchek.ca/en/search.html?q=Nike+Men+Windrunner+Jacket", [], MENS_APPAREL_SIZES),
    ("Nike Men's Therma-FIT Pullover Fitness Hoodie", "Nike", "Sport Chek", 85.00, 59.98, "https://www.sportchek.ca/en/search.html?q=Nike+Men+Therma+FIT+Hoodie", [], MENS_APPAREL_SIZES),

    # Adidas
    ("Adidas Men's Essentials 3-Stripes Track Jacket", "Adidas", "Adidas Canada", 85.00, 54.99, "https://www.adidas.ca/en/search?q=Men+Essentials+3+Stripes+Track+Jacket", COUPONS['adidas'], MENS_APPAREL_SIZES),
    ("Adidas Men's Tiro 23 League Training Pants", "Adidas", "Sport Chek", 65.00, 44.98, "https://www.sportchek.ca/en/search.html?q=Adidas+Men+Tiro+23+Pants", [], MENS_BOTTOMS_SIZES),
    ("Adidas Men's Trefoil Graphic Fleece Hoodie", "Adidas", "Foot Locker Canada", 90.00, 62.99, "https://www.footlocker.ca/en/search?query=Adidas+Men+Trefoil+Hoodie", [], MENS_APPAREL_SIZES),
    ("Adidas Men's Adicolor Classics SST Track Top", "Adidas", "Adidas Canada", 100.00, 69.99, "https://www.adidas.ca/en/search?q=Men+Adicolor+SST+Track+Top", COUPONS['adidas'], MENS_APPAREL_SIZES),

    # Under Armour
    ("Under Armour Men's Tech 2.0 Short-Sleeve T-Shirt", "Under Armour", "Under Armour Canada", 35.00, 24.99, "https://www.underarmour.ca/en-ca/search?q=Men+Tech+2+0+Short+Sleeve", COUPONS['underarmour'], MENS_APPAREL_SIZES),
    ("Under Armour Men's Rival Fleece Pullover Hoodie", "Under Armour", "Sport Chek", 70.00, 48.98, "https://www.sportchek.ca/en/search.html?q=Under+Armour+Men+Rival+Fleece+Hoodie", [], MENS_APPAREL_SIZES),
    ("Under Armour Men's Sportstyle Pique Track Pants", "Under Armour", "Sport Chek", 65.00, 44.98, "https://www.sportchek.ca/en/search.html?q=Under+Armour+Men+Sportstyle+Pique+Pants", [], MENS_BOTTOMS_SIZES),

    # Levi's
    ("Levi's Men's 501 Original Fit Jeans (Dark Stonewash)", "Levi's", "The Bay", 108.00, 69.99, "https://www.thebay.com/search?q=Levis+Men+501+Original+Jeans", COUPONS['thebay'], MENS_BOTTOMS_SIZES),
    ("Levi's Men's 511 Slim Fit Flex Jeans (Native Cali)", "Levi's", "The Bay", 108.00, 69.99, "https://www.thebay.com/search?q=Levis+Men+511+Slim+Jeans", COUPONS['thebay'], MENS_BOTTOMS_SIZES),
    ("Levi's Men's 505 Regular Fit Jeans (Medium Stonewash)", "Levi's", "The Bay", 98.00, 64.99, "https://www.thebay.com/search?q=Levis+Men+505+Regular+Jeans", COUPONS['thebay'], MENS_BOTTOMS_SIZES),
    ("Levi's Men's Original Denim Trucker Jacket (Colusa)", "Levi's", "The Bay", 128.00, 84.99, "https://www.thebay.com/search?q=Levis+Men+Trucker+Jacket", COUPONS['thebay'], MENS_APPAREL_SIZES),

    # Gap Canada
    ("Gap Men's Vintage Soft Crewneck Sweatshirt", "Gap", "Gap Canada", 70.00, 41.99, "https://www.gapcanada.ca/browse/search.do?searchText=Men+Vintage+Soft+Crewneck", COUPONS['gap'], MENS_APPAREL_SIZES),
    ("Gap Men's Heavyweight Full-Zip Fleece Hoodie", "Gap", "Gap Canada", 80.00, 47.99, "https://www.gapcanada.ca/browse/search.do?searchText=Men+Heavyweight+Full+Zip+Hoodie", COUPONS['gap'], MENS_APPAREL_SIZES),
    ("Gap Men's Classic Khaki Straight Chino Pants", "Gap", "Gap Canada", 75.00, 44.99, "https://www.gapcanada.ca/browse/search.do?searchText=Men+Classic+Khaki+Pants", COUPONS['gap'], MENS_BOTTOMS_SIZES),
    ("Gap Men's Everyday 100% Cotton Crewneck T-Shirt 3-Pack", "Gap", "Gap Canada", 55.00, 32.99, "https://www.gapcanada.ca/browse/search.do?searchText=Men+Everyday+Cotton+T+Shirt", COUPONS['gap'], MENS_APPAREL_SIZES),

    # Old Navy Canada
    ("Old Navy Men's Dynamic Fleece Zip Hoodie", "Old Navy", "Old Navy Canada", 55.00, 34.99, "https://oldnavy.gapcanada.ca/browse/search.do?searchText=Men+Dynamic+Fleece+Zip+Hoodie", COUPONS['oldnavy'], MENS_APPAREL_SIZES),
    ("Old Navy Men's Relaxed Straight Built-In Flex Jeans", "Old Navy", "Old Navy Canada", 50.00, 32.99, "https://oldnavy.gapcanada.ca/browse/search.do?searchText=Men+Relaxed+Straight+Jeans", COUPONS['oldnavy'], MENS_BOTTOMS_SIZES),
    ("Old Navy Men's Classic Water-Resistant Frost-Free Puffer Jacket", "Old Navy", "Old Navy Canada", 85.00, 54.99, "https://oldnavy.gapcanada.ca/browse/search.do?searchText=Men+Frost+Free+Puffer+Jacket", COUPONS['oldnavy'], MENS_APPAREL_SIZES),

    # The North Face
    ("The North Face Men's Antora Waterproof Rain Jacket", "The North Face", "Sport Chek", 140.00, 97.98, "https://www.sportchek.ca/en/search.html?q=The+North+Face+Men+Antora+Jacket", [], MENS_APPAREL_SIZES),
    ("The North Face Men's Half Dome Pullover Hoodie", "The North Face", "Sport Chek", 80.00, 54.98, "https://www.sportchek.ca/en/search.html?q=The+North+Face+Men+Half+Dome+Hoodie", [], MENS_APPAREL_SIZES),
    ("The North Face Men's Gordon Lyons Full-Zip Fleece Sweater", "The North Face", "Sport Chek", 130.00, 89.98, "https://www.sportchek.ca/en/search.html?q=The+North+Face+Men+Gordon+Lyons+Fleece", [], MENS_APPAREL_SIZES),

    # Carhartt
    ("Carhartt Men's Midweight Hooded Sweatshirt (K121)", "Carhartt", "Amazon Canada", 75.00, 52.50, "https://www.amazon.ca/s?k=Carhartt+Men+Midweight+Hooded+Sweatshirt+K121", [], MENS_APPAREL_SIZES),
    ("Carhartt Men's Loose Fit Heavyweight Pocket Tee (K87)", "Carhartt", "Amazon Canada", 35.00, 24.50, "https://www.amazon.ca/s?k=Carhartt+Men+Heavyweight+Pocket+Tee+K87", [], MENS_APPAREL_SIZES),
    ("Carhartt Men's Rain Defender Paxton Heavyweight Hoodie", "Carhartt", "Sport Chek", 95.00, 69.98, "https://www.sportchek.ca/en/search.html?q=Carhartt+Men+Rain+Defender+Hoodie", [], MENS_APPAREL_SIZES),

    # Columbia
    ("Columbia Men's Steens Mountain 2.0 Full Zip Fleece Jacket", "Columbia", "Sport Chek", 65.00, 44.98, "https://www.sportchek.ca/en/search.html?q=Columbia+Men+Steens+Mountain+Fleece", [], MENS_APPAREL_SIZES),
    ("Columbia Men's Watertight II Waterproof Rain Jacket", "Columbia", "Sport Chek", 110.00, 74.98, "https://www.sportchek.ca/en/search.html?q=Columbia+Men+Watertight+II+Jacket", [], MENS_APPAREL_SIZES),

    # Lululemon
    ("Lululemon Men's Surge Joggers (29\" Inseam)", "Lululemon", "Lululemon Canada", 128.00, 89.00, "https://shop.lululemon.com/c/search/_/N-1z13y8x?Ntt=Men+Surge+Jogger", [], MENS_BOTTOMS_SIZES),
    ("Lululemon Men's Metal Vent Tech Short-Sleeve Shirt 2.0", "Lululemon", "Lululemon Canada", 78.00, 54.00, "https://shop.lululemon.com/c/search/_/N-1z13y8x?Ntt=Men+Metal+Vent+Tech+Shirt", [], MENS_APPAREL_SIZES),
    ("Lululemon Men's City Sweat Pullover French Terry Hoodie", "Lululemon", "Lululemon Canada", 138.00, 94.00, "https://shop.lululemon.com/c/search/_/N-1z13y8x?Ntt=Men+City+Sweat+Hoodie", [], MENS_APPAREL_SIZES)
]

for title, brand, ret, orig, sale, url, coup, sz in mens_apparel:
    new_deals.append(create_deal(
        title=title, brand=brand, retailer=ret, gender='men',
        category='clothing', subcategory='mens',
        sizes=sz, orig=orig, sale=sale, url=url,
        img=IMAGES['mens'], coupons=coup
    ))

print(f"Added {len(mens_apparel)} Men's Apparel deals.")

# ─── 5. WOMEN'S APPAREL ───
womens_apparel = [
    # Lululemon
    ("Lululemon Women's Align High-Rise Pant 25\" Leggings", "Lululemon", "Lululemon Canada", 118.00, 79.00, "https://shop.lululemon.com/c/search/_/N-1z13y8x?Ntt=Women+Align+Pant+25", [], WOMENS_BOTTOMS_SIZES),
    ("Lululemon Women's Scuba Oversized Half-Zip Fleece Hoodie", "Lululemon", "Lululemon Canada", 148.00, 99.00, "https://shop.lululemon.com/c/search/_/N-1z13y8x?Ntt=Women+Scuba+Oversized+Half+Zip", [], WOMENS_APPAREL_SIZES),
    ("Lululemon Women's Define Jacket Luon (Black)", "Lululemon", "Lululemon Canada", 138.00, 94.00, "https://shop.lululemon.com/c/search/_/N-1z13y8x?Ntt=Women+Define+Jacket+Luon", [], WOMENS_APPAREL_SIZES),
    ("Lululemon Women's Wunder Train High-Rise Tight 25\"", "Lululemon", "Lululemon Canada", 128.00, 89.00, "https://shop.lululemon.com/c/search/_/N-1z13y8x?Ntt=Women+Wunder+Train+Tight", [], WOMENS_BOTTOMS_SIZES),
    ("Lululemon Women's Swiftly Tech Short-Sleeve 2.0 Shirt", "Lululemon", "Lululemon Canada", 68.00, 44.00, "https://shop.lululemon.com/c/search/_/N-1z13y8x?Ntt=Women+Swiftly+Tech+Shirt", [], WOMENS_APPAREL_SIZES),

    # Nike
    ("Nike Women's Sportswear Phoenix Fleece Oversized Hoodie", "Nike", "Nike Canada", 90.00, 62.99, "https://www.nike.com/ca/w?q=Women+Phoenix+Fleece+Hoodie", COUPONS['nike'], WOMENS_APPAREL_SIZES),
    ("Nike Women's Dri-FIT One High-Waisted 7/8 Leggings", "Nike", "Nike Canada", 75.00, 52.99, "https://www.nike.com/ca/w?q=Women+Dri+FIT+One+Leggings", COUPONS['nike'], WOMENS_BOTTOMS_SIZES),
    ("Nike Women's Indy Light-Support Padded Sports Bra", "Nike", "Sport Chek", 48.00, 32.98, "https://www.sportchek.ca/en/search.html?q=Nike+Women+Indy+Sports+Bra", [], WOMENS_APPAREL_SIZES),
    ("Nike Women's Club Fleece Mid-Rise Jogger Pants", "Nike", "Sport Chek", 75.00, 52.98, "https://www.sportchek.ca/en/search.html?q=Nike+Women+Club+Fleece+Pants", [], WOMENS_BOTTOMS_SIZES),

    # Adidas
    ("Adidas Women's Tiro 23 League Track Pants (Black/White)", "Adidas", "Adidas Canada", 65.00, 44.99, "https://www.adidas.ca/en/search?q=Women+Tiro+23+Pants", COUPONS['adidas'], WOMENS_BOTTOMS_SIZES),
    ("Adidas Women's Essentials 3-Stripes Full-Zip Fleece Hoodie", "Adidas", "Adidas Canada", 80.00, 51.99, "https://www.adidas.ca/en/search?q=Women+Essentials+3+Stripes+Hoodie", COUPONS['adidas'], WOMENS_APPAREL_SIZES),
    ("Adidas Women's Adicolor Classics Firebird Track Jacket", "Adidas", "Foot Locker Canada", 100.00, 69.99, "https://www.footlocker.ca/en/search?query=Adidas+Women+Firebird+Track+Jacket", [], WOMENS_APPAREL_SIZES),

    # Under Armour
    ("Under Armour Women's HeatGear High-Rise Leggings", "Under Armour", "Under Armour Canada", 65.00, 44.99, "https://www.underarmour.ca/en-ca/search?q=Women+HeatGear+High+Rise+Leggings", COUPONS['underarmour'], WOMENS_BOTTOMS_SIZES),
    ("Under Armour Women's Crossback Mid-Support Sports Bra", "Under Armour", "Sport Chek", 45.00, 29.98, "https://www.sportchek.ca/en/search.html?q=Under+Armour+Women+Crossback+Bra", [], WOMENS_APPAREL_SIZES),
    ("Under Armour Women's Armour Fleece Big Logo Hoodie", "Under Armour", "Sport Chek", 75.00, 52.98, "https://www.sportchek.ca/en/search.html?q=Under+Armour+Women+Fleece+Hoodie", [], WOMENS_APPAREL_SIZES),

    # Levi's
    ("Levi's Women's 721 High Rise Skinny Jeans (Bogota Games)", "Levi's", "The Bay", 108.00, 69.99, "https://www.thebay.com/search?q=Levis+Women+721+Skinny+Jeans", COUPONS['thebay'], WOMENS_BOTTOMS_SIZES),
    ("Levi's Women's 501 Original Cropped Jeans", "Levi's", "The Bay", 118.00, 74.99, "https://www.thebay.com/search?q=Levis+Women+501+Cropped+Jeans", COUPONS['thebay'], WOMENS_BOTTOMS_SIZES),
    ("Levi's Women's Ribcage Straight Ankle Jeans", "Levi's", "The Bay", 128.00, 84.99, "https://www.thebay.com/search?q=Levis+Women+Ribcage+Jeans", COUPONS['thebay'], WOMENS_BOTTOMS_SIZES),
    ("Levi's Women's Original Sherpa Trucker Jacket", "Levi's", "The Bay", 148.00, 99.99, "https://www.thebay.com/search?q=Levis+Women+Sherpa+Trucker+Jacket", COUPONS['thebay'], WOMENS_APPAREL_SIZES),

    # Gap Canada
    ("Gap Women's Vintage Soft Raglan Crewneck Sweatshirt", "Gap", "Gap Canada", 70.00, 41.99, "https://www.gapcanada.ca/browse/search.do?searchText=Women+Vintage+Soft+Sweatshirt", COUPONS['gap'], WOMENS_APPAREL_SIZES),
    ("Gap Women's High Rise Recycled Power Leggings", "Gap", "Gap Canada", 75.00, 44.99, "https://www.gapcanada.ca/browse/search.do?searchText=Women+High+Rise+Power+Leggings", COUPONS['gap'], WOMENS_BOTTOMS_SIZES),
    ("Gap Women's Cable-Knit Crewneck Cotton Sweater", "Gap", "Gap Canada", 80.00, 47.99, "https://www.gapcanada.ca/browse/search.do?searchText=Women+Cable+Knit+Sweater", COUPONS['gap'], WOMENS_APPAREL_SIZES),

    # Old Navy Canada
    ("Old Navy Women's High-Waisted PowerSoft 7/8 Leggings", "Old Navy", "Old Navy Canada", 50.00, 32.99, "https://oldnavy.gapcanada.ca/browse/search.do?searchText=Women+PowerSoft+Leggings", COUPONS['oldnavy'], WOMENS_BOTTOMS_SIZES),
    ("Old Navy Women's Cozy Oversized Turtleneck Sweater", "Old Navy", "Old Navy Canada", 55.00, 34.99, "https://oldnavy.gapcanada.ca/browse/search.do?searchText=Women+Oversized+Turtleneck+Sweater", COUPONS['oldnavy'], WOMENS_APPAREL_SIZES),
    ("Old Navy Women's Frost-Free Water-Resistant Puffer Jacket", "Old Navy", "Old Navy Canada", 85.00, 54.99, "https://oldnavy.gapcanada.ca/browse/search.do?searchText=Women+Frost+Free+Puffer+Jacket", COUPONS['oldnavy'], WOMENS_APPAREL_SIZES),

    # The North Face
    ("The North Face Women's Osito High-Pile Fleece Jacket", "The North Face", "Sport Chek", 130.00, 89.98, "https://www.sportchek.ca/en/search.html?q=The+North+Face+Women+Osito+Fleece", [], WOMENS_APPAREL_SIZES),
    ("The North Face Women's Antora Waterproof Rain Jacket", "The North Face", "Sport Chek", 140.00, 97.98, "https://www.sportchek.ca/en/search.html?q=The+North+Face+Women+Antora+Jacket", [], WOMENS_APPAREL_SIZES),

    # Columbia
    ("Columbia Women's Benton Springs Full Zip Fleece Jacket", "Columbia", "Sport Chek", 65.00, 44.98, "https://www.sportchek.ca/en/search.html?q=Columbia+Women+Benton+Springs+Fleece", [], WOMENS_APPAREL_SIZES),
    ("Columbia Women's Switchback III Waterproof Rain Jacket", "Columbia", "Sport Chek", 90.00, 59.98, "https://www.sportchek.ca/en/search.html?q=Columbia+Women+Switchback+III+Jacket", [], WOMENS_APPAREL_SIZES)
]

for title, brand, ret, orig, sale, url, coup, sz in womens_apparel:
    new_deals.append(create_deal(
        title=title, brand=brand, retailer=ret, gender='women',
        category='clothing', subcategory='womens',
        sizes=sz, orig=orig, sale=sale, url=url,
        img=IMAGES['womens'], coupons=coup
    ))

print(f"Added {len(womens_apparel)} Women's Apparel deals.")

print("Step 2 complete.")
