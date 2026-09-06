import json
import urllib.parse
from generate_universal_catalog import (
    deals, create_deal,
    MENS_SHOE_SIZES, WOMENS_SHOE_SIZES, KIDS_SHOE_SIZES,
    MENS_APPAREL_SIZES, MENS_BOTTOMS_SIZES,
    WOMENS_APPAREL_SIZES, WOMENS_BOTTOMS_SIZES, KIDS_APPAREL_SIZES,
    COUPONS, IMAGES
)

new_deals = []

# ─── 1. WOMEN'S SHOES ───
womens_shoes = [
    # Nike
    ("Nike Women's Air Max 90 Sneakers (Summit White/Pink)", "Nike", "Nike Canada", 175.00, 119.99, "https://www.nike.com/ca/w?q=Women+Air+Max+90", COUPONS['nike']),
    ("Nike Women's Air Max 270 Shoes (Triple White)", "Nike", "Nike Canada", 215.00, 149.99, "https://www.nike.com/ca/w?q=Women+Air+Max+270", COUPONS['nike']),
    ("Nike Women's Pegasus 40 Road Running Shoes (Platinum)", "Nike", "Sport Chek", 180.00, 108.98, "https://www.sportchek.ca/en/search.html?q=Nike+Women+Pegasus+40", []),
    ("Nike Women's Pegasus 41 Running Shoes (Violet Frost)", "Nike", "Foot Locker Canada", 190.00, 134.99, "https://www.footlocker.ca/en/search?query=Nike+Women+Pegasus+41", []),
    ("Nike Women's Revolution 7 Running Shoes (Black/White)", "Nike", "The Shoe Company", 85.00, 59.99, "https://www.theshoecompany.ca/en/ca/search?query=Nike+Women+Revolution+7", []),
    ("Nike Women's Court Legacy Lift Platform Sneakers", "Nike", "The Shoe Company", 105.00, 74.99, "https://www.theshoecompany.ca/en/ca/search?query=Nike+Women+Court+Legacy+Lift", []),
    ("Nike Women's Dunk Low Next Nature (Sail/Oatmeal)", "Nike", "Nike Canada", 150.00, 112.99, "https://www.nike.com/ca/w?q=Women+Dunk+Low", COUPONS['nike']),
    ("Nike Women's Free Metcon 5 Training Shoes (Pale Ivory)", "Nike", "Sport Chek", 160.00, 115.98, "https://www.sportchek.ca/en/search.html?q=Nike+Women+Free+Metcon+5", []),
    ("Nike Women's Winflo 10 Road Running Shoes", "Nike", "Sport Chek", 135.00, 89.98, "https://www.sportchek.ca/en/search.html?q=Nike+Women+Winflo+10", []),
    ("Nike Women's Vomero 5 Sneakers (Photon Dust)", "Nike", "Foot Locker Canada", 210.00, 159.99, "https://www.footlocker.ca/en/search?query=Nike+Women+Vomero+5", []),
    ("Nike Women's InfinityRN 4 Road Running Shoes", "Nike", "Sport Chek", 210.00, 145.99, "https://www.sportchek.ca/en/search.html?q=Nike+Women+InfinityRN+4", []),
    ("Nike Women's Court Vision Alta Platform Sneakers", "Nike", "The Shoe Company", 110.00, 79.99, "https://www.theshoecompany.ca/en/ca/search?query=Nike+Women+Court+Vision+Alta", []),
    ("Nike Women's AL8 Lifestyle Sneakers (White/Grey)", "Nike", "Foot Locker Canada", 120.00, 84.99, "https://www.footlocker.ca/en/search?query=Nike+Women+AL8", []),
    ("Nike Women's Gamma Force Sneakers (White/Phantom)", "Nike", "The Shoe Company", 120.00, 82.99, "https://www.theshoecompany.ca/en/ca/search?query=Nike+Women+Gamma+Force", []),
    ("Nike Women's MC Trainer 2 Workout Shoes", "Nike", "The Shoe Company", 95.00, 64.99, "https://www.theshoecompany.ca/en/ca/search?query=Nike+Women+MC+Trainer", []),

    # Adidas
    ("Adidas Women's Ultraboost Light Running Shoes (Core Black)", "Adidas", "Adidas Canada", 260.00, 169.99, "https://www.adidas.ca/en/search?q=Women+Ultraboost+Light", COUPONS['adidas']),
    ("Adidas Women's Stan Smith Shoes (Cloud White/Green)", "Adidas", "Adidas Canada", 130.00, 84.99, "https://www.adidas.ca/en/search?q=Women+Stan+Smith", COUPONS['adidas']),
    ("Adidas Women's Samba OG Shoes (Cloud White/Black)", "Adidas", "Foot Locker Canada", 130.00, 99.99, "https://www.footlocker.ca/en/search?query=Adidas+Women+Samba+OG", []),
    ("Adidas Women's Grand Court 2.0 Sneakers (White/Rose Gold)", "Adidas", "The Shoe Company", 90.00, 59.99, "https://www.theshoecompany.ca/en/ca/search?query=Adidas+Women+Grand+Court+2.0", []),
    ("Adidas Women's Cloudfoam Pure 2.0 Running Shoes", "Adidas", "Amazon Canada", 95.00, 62.50, "https://www.amazon.ca/s?k=Adidas+Women+Cloudfoam+Pure+2.0", []),
    ("Adidas Women's Puremotion Adapt Slip-On Shoes", "Adidas", "The Shoe Company", 85.00, 54.99, "https://www.theshoecompany.ca/en/ca/search?query=Adidas+Women+Puremotion+Adapt", []),
    ("Adidas Women's NMD_R1 V3 Lifestyle Shoes", "Adidas", "Sport Chek", 200.00, 129.98, "https://www.sportchek.ca/en/search.html?q=Adidas+Women+NMD+R1", []),
    ("Adidas Women's Supernova 3 Road Running Shoes", "Adidas", "Sport Chek", 140.00, 89.98, "https://www.sportchek.ca/en/search.html?q=Adidas+Women+Supernova+3", []),
    ("Adidas Women's Gazelle Indoor Sneakers (Collegiate Green)", "Adidas", "Foot Locker Canada", 150.00, 114.99, "https://www.footlocker.ca/en/search?query=Adidas+Women+Gazelle", []),
    ("Adidas Women's Runfalcon 3.0 Running Shoes", "Adidas", "The Shoe Company", 80.00, 52.99, "https://www.theshoecompany.ca/en/ca/search?query=Adidas+Women+Runfalcon+3.0", []),

    # New Balance
    ("New Balance Women's 327 Lifestyle Sneakers (Sea Salt)", "New Balance", "The Shoe Company", 130.00, 89.99, "https://www.theshoecompany.ca/en/ca/search?query=New+Balance+Women+327", []),
    ("New Balance Women's 574 Core Sneakers (Grey/White)", "New Balance", "The Shoe Company", 115.00, 79.99, "https://www.theshoecompany.ca/en/ca/search?query=New+Balance+Women+574", []),
    ("New Balance Women's Fresh Foam X 1080v13 Running Shoes", "New Balance", "Sport Chek", 215.00, 159.98, "https://www.sportchek.ca/en/search.html?q=New+Balance+Women+1080v13", []),
    ("New Balance Women's 550 Retro Basketball Shoes (White/Green)", "New Balance", "Foot Locker Canada", 150.00, 109.99, "https://www.footlocker.ca/en/search?query=New+Balance+Women+550", []),
    ("New Balance Women's FuelCell Rebel v4 Running Shoes", "New Balance", "Sport Chek", 180.00, 129.98, "https://www.sportchek.ca/en/search.html?q=New+Balance+Women+FuelCell+Rebel", []),
    ("New Balance Women's 237 Lifestyle Retro Shoes", "New Balance", "The Shoe Company", 110.00, 74.99, "https://www.theshoecompany.ca/en/ca/search?query=New+Balance+Women+237", []),
    ("New Balance Women's Dynasoft Nergize v3 Cross Trainer", "New Balance", "Amazon Canada", 90.00, 59.99, "https://www.amazon.ca/s?k=New+Balance+Women+Dynasoft+Nergize+v3", []),
    ("New Balance Women's Fresh Foam Arishi v4 Running Shoes", "New Balance", "The Shoe Company", 95.00, 64.99, "https://www.theshoecompany.ca/en/ca/search?query=New+Balance+Women+Fresh+Foam+Arishi+v4", []),

    # Asics
    ("Asics Women's GEL-Kayano 30 Stability Running Shoes", "Asics", "Sport Chek", 220.00, 159.98, "https://www.sportchek.ca/en/search.html?q=Asics+Women+GEL+Kayano+30", []),
    ("Asics Women's GEL-Nimbus 26 Neutral Running Shoes", "Asics", "Sport Chek", 215.00, 164.98, "https://www.sportchek.ca/en/search.html?q=Asics+Women+GEL+Nimbus+26", []),
    ("Asics Women's GT-2000 12 Road Running Shoes", "Asics", "Sport Chek", 180.00, 129.98, "https://www.sportchek.ca/en/search.html?q=Asics+Women+GT+2000+12", []),
    ("Asics Women's GEL-Cumulus 25 Road Running Shoes", "Asics", "The Shoe Company", 180.00, 119.99, "https://www.theshoecompany.ca/en/ca/search?query=Asics+Women+GEL+Cumulus+25", []),
    ("Asics Women's Novablast 4 Performance Running Shoes", "Asics", "Sport Chek", 180.00, 134.98, "https://www.sportchek.ca/en/search.html?q=Asics+Women+Novablast+4", []),
    ("Asics Women's GEL-Contend 8 Running Shoes", "Asics", "The Shoe Company", 90.00, 59.99, "https://www.theshoecompany.ca/en/ca/search?query=Asics+Women+GEL+Contend+8", []),

    # Puma
    ("Puma Women's Carina 2.0 Leather Platform Sneakers", "Puma", "The Shoe Company", 85.00, 54.99, "https://www.theshoecompany.ca/en/ca/search?query=Puma+Women+Carina+2.0", []),
    ("Puma Women's Cali Star Low Top Retro Sneakers", "Puma", "Foot Locker Canada", 110.00, 72.99, "https://www.footlocker.ca/en/search?query=Puma+Women+Cali+Star", []),
    ("Puma Women's Mayze Classic Platform Sneakers", "Puma", "The Shoe Company", 120.00, 79.99, "https://www.theshoecompany.ca/en/ca/search?query=Puma+Women+Mayze+Classic", []),
    ("Puma Women's Softride Sophia Slip-On Walking Shoes", "Puma", "The Shoe Company", 85.00, 54.99, "https://www.theshoecompany.ca/en/ca/search?query=Puma+Women+Softride+Sophia", []),
    ("Puma Women's Smash v2 Leather Sneakers", "Puma", "Amazon Canada", 75.00, 48.99, "https://www.amazon.ca/s?k=Puma+Women+Smash+v2", []),

    # Skechers
    ("Skechers Women's D'Lites Fresh Start Chunky Sneakers", "Skechers", "The Shoe Company", 95.00, 64.99, "https://www.theshoecompany.ca/en/ca/search?query=Skechers+Women+D+Lites", []),
    ("Skechers Women's GO WALK Joy Slip-On Walking Shoes", "Skechers", "Amazon Canada", 85.00, 56.99, "https://www.amazon.ca/s?k=Skechers+Women+GO+WALK+Joy", []),
    ("Skechers Women's Uno Stand on Air Fashion Sneakers", "Skechers", "The Shoe Company", 105.00, 74.99, "https://www.theshoecompany.ca/en/ca/search?query=Skechers+Women+Uno+Stand+on+Air", []),
    ("Skechers Women's Summits Quick Getaway Slip-On", "Skechers", "The Shoe Company", 80.00, 52.99, "https://www.theshoecompany.ca/en/ca/search?query=Skechers+Women+Summits", []),
    ("Skechers Women's Hands Free Slip-ins Ultra Flex 3.0", "Skechers", "The Shoe Company", 120.00, 89.99, "https://www.theshoecompany.ca/en/ca/search?query=Skechers+Women+Slip+ins+Ultra+Flex", []),

    # Brooks
    ("Brooks Women's Ghost 15 Neutral Running Shoes", "Brooks", "Sport Chek", 170.00, 119.98, "https://www.sportchek.ca/en/search.html?q=Brooks+Women+Ghost+15", []),
    ("Brooks Women's Adrenaline GTS 23 Support Running Shoes", "Brooks", "Sport Chek", 180.00, 129.98, "https://www.sportchek.ca/en/search.html?q=Brooks+Women+Adrenaline+GTS+23", []),
    ("Brooks Women's Glycerin 20 Maximum Cushion Shoes", "Brooks", "Sport Chek", 200.00, 139.98, "https://www.sportchek.ca/en/search.html?q=Brooks+Women+Glycerin+20", []),
    ("Brooks Women's Launch 10 Lightweight Road Runners", "Brooks", "The Shoe Company", 140.00, 94.99, "https://www.theshoecompany.ca/en/ca/search?query=Brooks+Women+Launch+10", []),

    # Vans
    ("Vans Women's Old Skool Classic Canvas Sneakers", "Vans", "The Shoe Company", 90.00, 64.99, "https://www.theshoecompany.ca/en/ca/search?query=Vans+Women+Old+Skool", []),
    ("Vans Women's Classic Slip-On Checkerboard Shoes", "Vans", "Foot Locker Canada", 85.00, 59.99, "https://www.footlocker.ca/en/search?query=Vans+Women+Slip+On", []),
    ("Vans Women's Ward Platform Canvas Sneakers", "Vans", "The Shoe Company", 95.00, 68.99, "https://www.theshoecompany.ca/en/ca/search?query=Vans+Women+Ward+Platform", []),
    ("Vans Women's Sk8-Hi Tapered High Top Sneakers", "Vans", "Foot Locker Canada", 100.00, 69.99, "https://www.footlocker.ca/en/search?query=Vans+Women+Sk8+Hi", []),

    # Converse
    ("Converse Women's Chuck Taylor All Star Lift Platform Low Top", "Converse", "The Shoe Company", 95.00, 69.99, "https://www.theshoecompany.ca/en/ca/search?query=Converse+Women+Lift+Platform", []),
    ("Converse Women's Chuck 70 Vintage High Top Sneakers", "Converse", "Foot Locker Canada", 115.00, 79.99, "https://www.footlocker.ca/en/search?query=Converse+Women+Chuck+70", []),
    ("Converse Women's Run Star Hike High Top Platform", "Converse", "Foot Locker Canada", 140.00, 94.99, "https://www.footlocker.ca/en/search?query=Converse+Women+Run+Star+Hike", []),

    # Clarks
    ("Clarks Women's Cloudsteppers Breeze Sea Flip-Flops", "Clarks", "The Shoe Company", 65.00, 39.99, "https://www.theshoecompany.ca/en/ca/search?query=Clarks+Women+Cloudsteppers+Breeze+Sea", []),
    ("Clarks Women's Brinkley Jazz Sport Sandals", "Clarks", "The Shoe Company", 70.00, 44.99, "https://www.theshoecompany.ca/en/ca/search?query=Clarks+Women+Brinkley+Jazz", []),
    ("Clarks Women's Maye Walk Ankle Leather Boots", "Clarks", "The Shoe Company", 160.00, 99.99, "https://www.theshoecompany.ca/en/ca/search?query=Clarks+Women+Maye+Walk", [])
]

for title, brand, ret, orig, sale, url, coup in womens_shoes:
    new_deals.append(create_deal(
        title=title, brand=brand, retailer=ret, gender='women',
        category='clothing', subcategory='shoes',
        sizes=WOMENS_SHOE_SIZES, orig=orig, sale=sale, url=url,
        img=IMAGES['womens_shoes'], coupons=coup
    ))

print(f"Added {len(womens_shoes)} Women's Shoe deals.")

# ─── 2. KIDS' SHOES ───
kids_shoes = [
    ("Nike Kids' Revolution 7 Running Shoes (Little Kid/Big Kid)", "Nike", "Sport Chek", 65.00, 44.98, "https://www.sportchek.ca/en/search.html?q=Nike+Kids+Revolution+7", []),
    ("Nike Kids' Court Borough Low 2 Sneakers", "Nike", "The Shoe Company", 60.00, 42.99, "https://www.theshoecompany.ca/en/ca/search?query=Nike+Kids+Court+Borough", []),
    ("Nike Kids' Air Max SC Casual Shoes", "Nike", "Foot Locker Canada", 80.00, 54.99, "https://www.footlocker.ca/en/search?query=Nike+Kids+Air+Max+SC", []),
    ("Nike Kids' Flex Runner 2 Slip-On Running Shoes", "Nike", "Sport Chek", 55.00, 38.98, "https://www.sportchek.ca/en/search.html?q=Nike+Kids+Flex+Runner", []),

    ("Adidas Kids' Grand Court 2.0 Elastic Lace Shoes", "Adidas", "The Shoe Company", 55.00, 36.99, "https://www.theshoecompany.ca/en/ca/search?query=Adidas+Kids+Grand+Court", []),
    ("Adidas Kids' Tensaur Sport 2.0 Hook-and-Loop Shoes", "Adidas", "The Shoe Company", 50.00, 34.99, "https://www.theshoecompany.ca/en/ca/search?query=Adidas+Kids+Tensaur", []),
    ("Adidas Kids' Racer TR21 Running Shoes", "Adidas", "Sport Chek", 65.00, 44.98, "https://www.sportchek.ca/en/search.html?q=Adidas+Kids+Racer+TR21", []),
    ("Adidas Kids' Advantage Lifestyle Court Sneakers", "Adidas", "Amazon Canada", 55.00, 37.50, "https://www.amazon.ca/s?k=Adidas+Kids+Advantage", []),

    ("New Balance Kids' 574 Bungee Lace Sneakers", "New Balance", "The Shoe Company", 70.00, 49.99, "https://www.theshoecompany.ca/en/ca/search?query=New+Balance+Kids+574", []),
    ("New Balance Kids' Rave Run v2 Running Shoes", "New Balance", "Sport Chek", 60.00, 41.98, "https://www.sportchek.ca/en/search.html?q=New+Balance+Kids+Rave+Run", []),
    ("New Balance Kids' Fresh Foam Roav Running Shoes", "New Balance", "The Shoe Company", 65.00, 44.99, "https://www.theshoecompany.ca/en/ca/search?query=New+Balance+Kids+Fresh+Foam+Roav", []),

    ("Skechers Kids' S-Lights Vortex Flash Light-Up Shoes", "Skechers", "The Shoe Company", 65.00, 44.99, "https://www.theshoecompany.ca/en/ca/search?query=Skechers+Kids+S+Lights", []),
    ("Skechers Kids' Skech-Air Element Casual Sneakers", "Skechers", "The Shoe Company", 60.00, 41.99, "https://www.theshoecompany.ca/en/ca/search?query=Skechers+Kids+Skech+Air", []),
    ("Skechers Kids' Microspec Max Running Shoes", "Skechers", "Amazon Canada", 55.00, 36.99, "https://www.amazon.ca/s?k=Skechers+Kids+Microspec", []),

    ("Vans Kids' Old Skool Elastic Lace Skate Shoes", "Vans", "The Shoe Company", 55.00, 38.99, "https://www.theshoecompany.ca/en/ca/search?query=Vans+Kids+Old+Skool", []),
    ("Vans Kids' Classic Slip-On Checkerboard Shoes", "Vans", "Foot Locker Canada", 50.00, 34.99, "https://www.footlocker.ca/en/search?query=Vans+Kids+Slip+On", []),
    ("Converse Kids' Chuck Taylor All Star Low Top", "Converse", "The Shoe Company", 50.00, 34.99, "https://www.theshoecompany.ca/en/ca/search?query=Converse+Kids+Chuck+Taylor", []),
    ("Converse Kids' Chuck Taylor All Star High Top", "Converse", "Foot Locker Canada", 55.00, 38.99, "https://www.footlocker.ca/en/search?query=Converse+Kids+Chuck+Taylor+High", [])
]

for title, brand, ret, orig, sale, url, coup in kids_shoes:
    new_deals.append(create_deal(
        title=title, brand=brand, retailer=ret, gender='kids',
        category='clothing', subcategory='shoes',
        sizes=KIDS_SHOE_SIZES, orig=orig, sale=sale, url=url,
        img=IMAGES['kids_shoes'], coupons=coup
    ))

print(f"Added {len(kids_shoes)} Kids' Shoe deals.")

# ─── 3. MEN'S FOOTWEAR (EXPANDED BRANDS) ───
mens_shoes_expansion = [
    # Adidas
    ("Adidas Men's Ultraboost Light Running Shoes (Core Black)", "Adidas", "Adidas Canada", 260.00, 169.99, "https://www.adidas.ca/en/search?q=Men+Ultraboost+Light", COUPONS['adidas']),
    ("Adidas Men's Samba OG Shoes (Cloud White/Black/Gum)", "Adidas", "Foot Locker Canada", 130.00, 99.99, "https://www.footlocker.ca/en/search?query=Adidas+Men+Samba+OG", []),
    ("Adidas Men's Gazelle Shoes (Core Black/White)", "Adidas", "Foot Locker Canada", 130.00, 94.99, "https://www.footlocker.ca/en/search?query=Adidas+Men+Gazelle", []),
    ("Adidas Men's Stan Smith Shoes (Cloud White)", "Adidas", "Adidas Canada", 130.00, 84.99, "https://www.adidas.ca/en/search?q=Men+Stan+Smith", COUPONS['adidas']),
    ("Adidas Men's Supernova Rise Road Running Shoes", "Adidas", "Sport Chek", 180.00, 124.98, "https://www.sportchek.ca/en/search.html?q=Adidas+Men+Supernova+Rise", []),
    ("Adidas Men's NMD_R1 V3 Lifestyle Shoes", "Adidas", "Sport Chek", 200.00, 134.98, "https://www.sportchek.ca/en/search.html?q=Adidas+Men+NMD+R1", []),
    ("Adidas Men's Forum Low Retro Basketball Sneakers", "Adidas", "The Shoe Company", 120.00, 79.99, "https://www.theshoecompany.ca/en/ca/search?query=Adidas+Men+Forum+Low", []),

    # New Balance
    ("New Balance Men's 990v6 Made in USA Running Shoes", "New Balance", "Sport Chek", 270.00, 199.98, "https://www.sportchek.ca/en/search.html?q=New+Balance+Men+990v6", []),
    ("New Balance Men's 1906R Lifestyle Sneakers", "New Balance", "Foot Locker Canada", 200.00, 149.99, "https://www.footlocker.ca/en/search?query=New+Balance+Men+1906R", []),
    ("New Balance Men's 2002R Retro Running Shoes", "New Balance", "Foot Locker Canada", 180.00, 134.99, "https://www.footlocker.ca/en/search?query=New+Balance+Men+2002R", []),
    ("New Balance Men's 574 Core Sneakers (Navy/White)", "New Balance", "The Shoe Company", 115.00, 79.99, "https://www.theshoecompany.ca/en/ca/search?query=New+Balance+Men+574", []),
    ("New Balance Men's Fresh Foam X 1080v13 Running Shoes", "New Balance", "Sport Chek", 215.00, 159.98, "https://www.sportchek.ca/en/search.html?q=New+Balance+Men+1080v13", []),
    ("New Balance Men's 550 Basketball Shoes (White/Grey)", "New Balance", "Foot Locker Canada", 150.00, 109.99, "https://www.footlocker.ca/en/search?query=New+Balance+Men+550", []),

    # Asics
    ("Asics Men's GEL-Kayano 30 Stability Running Shoes", "Asics", "Sport Chek", 220.00, 159.98, "https://www.sportchek.ca/en/search.html?q=Asics+Men+GEL+Kayano+30", []),
    ("Asics Men's GEL-Nimbus 26 Road Running Shoes", "Asics", "Sport Chek", 215.00, 164.98, "https://www.sportchek.ca/en/search.html?q=Asics+Men+GEL+Nimbus+26", []),
    ("Asics Men's Novablast 4 Performance Running Shoes", "Asics", "Sport Chek", 180.00, 134.98, "https://www.sportchek.ca/en/search.html?q=Asics+Men+Novablast+4", []),
    ("Asics Men's GT-2000 12 Running Shoes", "Asics", "Sport Chek", 180.00, 129.98, "https://www.sportchek.ca/en/search.html?q=Asics+Men+GT+2000+12", []),
    ("Asics Men's GEL-Cumulus 25 Running Shoes", "Asics", "The Shoe Company", 180.00, 119.99, "https://www.theshoecompany.ca/en/ca/search?query=Asics+Men+GEL+Cumulus+25", []),

    # Puma
    ("Puma Men's Suede Classic XXI Sneakers (Black/White)", "Puma", "The Shoe Company", 95.00, 64.99, "https://www.theshoecompany.ca/en/ca/search?query=Puma+Men+Suede+Classic", []),
    ("Puma Men's Rebound V6 High Top Basketball Shoes", "Puma", "The Shoe Company", 90.00, 59.99, "https://www.theshoecompany.ca/en/ca/search?query=Puma+Men+Rebound+V6", []),
    ("Puma Men's Softride Enzo Evo Running Shoes", "Puma", "The Shoe Company", 85.00, 54.99, "https://www.theshoecompany.ca/en/ca/search?query=Puma+Men+Softride+Enzo", []),

    # Brooks
    ("Brooks Men's Ghost 15 Neutral Running Shoes", "Brooks", "Sport Chek", 170.00, 119.98, "https://www.sportchek.ca/en/search.html?q=Brooks+Men+Ghost+15", []),
    ("Brooks Men's Adrenaline GTS 23 Running Shoes", "Brooks", "Sport Chek", 180.00, 129.98, "https://www.sportchek.ca/en/search.html?q=Brooks+Men+Adrenaline+GTS+23", []),
    ("Brooks Men's Glycerin 20 Maximum Cushion Shoes", "Brooks", "Sport Chek", 200.00, 139.98, "https://www.sportchek.ca/en/search.html?q=Brooks+Men+Glycerin+20", []),

    # Vans
    ("Vans Men's Old Skool Core Classics Skate Shoes", "Vans", "The Shoe Company", 90.00, 64.99, "https://www.theshoecompany.ca/en/ca/search?query=Vans+Men+Old+Skool", []),
    ("Vans Men's Sk8-Hi Classic High Top Sneakers", "Vans", "Foot Locker Canada", 100.00, 69.99, "https://www.footlocker.ca/en/search?query=Vans+Men+Sk8+Hi", []),
    ("Vans Men's Classic Slip-On Shoes (Black/White)", "Vans", "The Shoe Company", 85.00, 59.99, "https://www.theshoecompany.ca/en/ca/search?query=Vans+Men+Slip+On", []),

    # Converse
    ("Converse Men's Chuck 70 Vintage High Top (Black)", "Converse", "Foot Locker Canada", 115.00, 79.99, "https://www.footlocker.ca/en/search?query=Converse+Men+Chuck+70", []),
    ("Converse Men's Chuck Taylor All Star Low Top", "Converse", "The Shoe Company", 80.00, 54.99, "https://www.theshoecompany.ca/en/ca/search?query=Converse+Men+Chuck+Taylor", []),

    # Timberland
    ("Timberland Men's 6-Inch Premium Waterproof Boots (Wheat Nubuck)", "Timberland", "Foot Locker Canada", 230.00, 169.99, "https://www.footlocker.ca/en/search?query=Timberland+Men+6+Inch+Premium", []),
    ("Timberland Men's White Ledge Mid Waterproof Hiking Boots", "Timberland", "The Shoe Company", 160.00, 114.99, "https://www.theshoecompany.ca/en/ca/search?query=Timberland+Men+White+Ledge", []),
    ("Timberland Men's Davis Square Chukka Sneakers", "Timberland", "The Shoe Company", 120.00, 84.99, "https://www.theshoecompany.ca/en/ca/search?query=Timberland+Men+Davis+Square", [])
]

for title, brand, ret, orig, sale, url, coup in mens_shoes_expansion:
    new_deals.append(create_deal(
        title=title, brand=brand, retailer=ret, gender='men',
        category='clothing', subcategory='shoes',
        sizes=MENS_SHOE_SIZES, orig=orig, sale=sale, url=url,
        img=IMAGES['shoes'], coupons=coup
    ))

print(f"Added {len(mens_shoes_expansion)} Men's Shoe deals.")

print("Step 1 complete.")
