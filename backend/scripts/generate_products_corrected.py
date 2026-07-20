import pandas as pd
import json
import random
import re

# ==========================================================
# CONFIGURATION
# ==========================================================

CSV_PATH =  "Myntra_fashion_products.csv"

OUTPUT_JSON = "product_catalog_new.json"
OUTPUT_CSV = "product_catalog_new.csv"

TARGET_PRODUCTS = 5000

print("Loading dataset...")

df = pd.read_csv(CSV_PATH)

print("Original Products:", len(df))

# ==========================================================
# BASIC CLEANING
# ==========================================================

df = df.drop_duplicates(subset=["name"])

df = df.dropna(
    subset=[
        "name",
        "price",
        "brand",
        "description",
        "images",
        "gender"
    ]
)

print("After Cleaning:", len(df))

# ==========================================================
# REMOVE NON-WEARABLE PRODUCTS
# ==========================================================

REMOVE_KEYWORDS = [

    # Home Decor
    "lamp",
    "table lamp",
    "floor lamp",
    "ceiling lamp",
    "wall lamp",
    "shade",

    # Furniture
    "table",
    "chair",
    "sofa",
    "stool",
    "bench",
    "cabinet",

    # Bedding
    "bedsheet",
    "bed sheet",
    "bedspread",
    "comforter",
    "blanket",
    "quilt",
    "pillow",
    "pillow cover",
    "cushion",

    # Dining
    "plate",
    "bowl",
    "cup",
    "mug",
    "glass",
    "fork",
    "knife",
    "spoon",
    "tray",
    "placemat",
    "placemats",

    # Bathroom
    "bucket",
    "bath mat",
    "bath towel",

    # Home
    "curtain",
    "carpet",
    "rug",
    "wall decor",
    "home decor",
    "flower vase",
    "planter",

    # ---------- BEAUTY / FRAGRANCE ----------
"perfume",
"parfum",
"eau de parfum",
"eau de toilette",
"body mist",
"mist",
"deo",
"deodorant",
"fragrance",
"cologne",
"aftershave",
"lipstick",
"lip color",
"lip colour",
"lip balm",
"lip gloss",
"mascara",
"eyeliner",
"kajal",
"foundation",
"concealer",
"compact",
"powder",
"blush",
"highlighter",
"primer",
"nail polish",
"makeup",
"cosmetic",
"face wash",
"moisturizer",
"moisturiser",
"serum",
"shampoo",
"conditioner",
  # ---------- INNERWEAR ----------
"bra",
"bras",
"brief",
"briefs",
"bikini brief",
"hipster brief",
"lingerie",
"panty",
"panties",
"innerwear",
"underwear",
]

def wearable(text):

    t = text.lower()

    for word in REMOVE_KEYWORDS:
        if re.search(rf"\b{re.escape(word)}\b", t):
            return False

    return True

df = df[df["name"].apply(wearable)]

print("Wearable Products:", len(df))
# ==========================================================
# CATEGORY MAPPING
# ==========================================================

ALLOWED_TYPES = {

    # ---------------- TOP ----------------

    "t-shirt": ("top", "t-shirt"),
    "t shirt": ("top", "t-shirt"),
    "tee": ("top", "t-shirt"),
    "polo": ("top", "polo"),
    "shirt": ("top", "shirt"),
    "kurta": ("top", "kurta"),
    "kurti": ("top", "kurti"),
    "tunic": ("top", "tunic"),
    "blouse": ("top", "blouse"),
    "top": ("top", "top"),

    # ---------------- BOTTOM ----------------

    "jeans": ("bottom", "jeans"),
    "bootcut": ("bottom", "jeans"),
    "skinny jeans": ("bottom", "jeans"),
    "slim jeans": ("bottom", "jeans"),

    "trousers": ("bottom", "trousers"),
    "trouser": ("bottom", "trousers"),
    "pants": ("bottom", "pants"),
    "pant": ("bottom", "pants"),
    "chinos": ("bottom", "chinos"),
    "shorts": ("bottom", "shorts"),
    "leggings": ("bottom", "leggings"),
    "jeggings": ("bottom", "jeggings"),
    "palazzo": ("bottom", "palazzo"),
    "skirt": ("bottom", "skirt"),
    "cargo": ("bottom", "cargo"),
    "track pants": ("bottom", "track-pants"),
    "trackpants": ("bottom", "track-pants"),
    "tights": ("bottom", "tights"),
    "tight": ("bottom", "tights"),

    # ---------------- DRESS ----------------

    "dress": ("dress", "dress"),
    "gown": ("dress", "gown"),
    "saree": ("dress", "saree"),
    "lehenga": ("dress", "lehenga"),

    # ---------------- OUTERWEAR ----------------

    "hoodie": ("outerwear", "hoodie"),
    "jacket": ("outerwear", "jacket"),
    "blazer": ("outerwear", "blazer"),
    "cardigan": ("outerwear", "cardigan"),
    "sweater": ("outerwear", "sweater"),
    "sweatshirt": ("outerwear", "sweatshirt"),

    # ---------------- FOOTWEAR ----------------

    "sports shoes": ("footwear", "sports-shoes"),
    "running shoes": ("footwear", "running-shoes"),
    "walking shoes": ("footwear", "walking-shoes"),
    "casual shoes": ("footwear", "casual-shoes"),

    "sneakers": ("footwear", "sneakers"),
    "sneaker": ("footwear", "sneakers"),

    "shoes": ("footwear", "shoes"),
    "shoe": ("footwear", "shoes"),

    "heels": ("footwear", "heels"),
    "heel": ("footwear", "heels"),

    "sandals": ("footwear", "sandals"),
    "sandal": ("footwear", "sandals"),

    "comfort sandals": ("footwear", "sandals"),
    "fisherman sandals": ("footwear", "sandals"),

    "loafers": ("footwear", "loafers"),
    "loafer": ("footwear", "loafers"),

    "boots": ("footwear", "boots"),
    "boot": ("footwear", "boots"),

    "slip-on": ("footwear", "slip-on"),
    "slip on": ("footwear", "slip-on"),

    "slippers": ("footwear", "slippers"),
    "slipper": ("footwear", "slippers"),

    "flip flops": ("footwear", "flip-flops"),
    "flip-flops": ("footwear", "flip-flops"),

    "flats": ("footwear", "flats"),
    "clogs": ("footwear", "clogs"),
    "mules": ("footwear", "mules"),
    "derbys": ("footwear", "derbys"),
    "derby": ("footwear", "derbys"),
    "oxfords": ("footwear", "oxfords"),
    "oxford": ("footwear", "oxfords"),
    "mojaris": ("footwear", "mojaris"),
    "mojari": ("footwear", "mojaris"),

    # ---------------- BAG ----------------

    "backpack": ("bag", "backpack"),
    "handbag": ("bag", "handbag"),
    "tote": ("bag", "tote"),
    "satchel": ("bag", "satchel"),
    "duffle": ("bag", "duffle"),
    "bag": ("bag", "bag"),
    "wallet": ("bag", "wallet"),

    # ---------------- ACCESSORIES ----------------

    "watch": ("accessory", "watch"),
    "belt": ("accessory", "belt"),
    "cap": ("accessory", "cap"),
    "hat": ("accessory", "hat"),
    "scarf": ("accessory", "scarf"),
    "stole": ("accessory", "stole"),
    "shawl": ("accessory", "shawl"),
    "sunglasses": ("accessory", "sunglasses"),
    "earrings": ("accessory", "earrings"),
    "necklace": ("accessory", "necklace"),
    "bracelet": ("accessory", "bracelet"),
    "ring": ("accessory", "ring"),

    # # ---------- INNERWEAR ----------
    # "bra":             ("innerwear", "bra"),
    # "bras":            ("innerwear", "bra"),
    # "brief":           ("innerwear", "brief"),
    # "briefs":          ("innerwear", "brief"),
    # "bikini brief":    ("innerwear", "bikini brief"),
    # "hipster brief":   ("innerwear", "hipster brief"),
    # "lingerie":        ("innerwear", "lingerie"),
    # "panty":           ("innerwear", "panty"),
    # "panties":         ("innerwear", "panty"),
    # "innerwear":       ("innerwear", "innerwear"),
    # "underwear":       ("innerwear", "underwear"),

    # ---------- MORE HOME / NON-FASHION ----------
    # "storage jar": ("home", "storage jar"),
    # "storage jars": ("home", "storage jar"),
    # "kulladh": ("home", "kulladh"),
    # "kulladhs": ("home", "kulladh"),
    # "dry bin": ("home", "dry bin"),
    
    
}

def category_and_subcategory(text):

    t = text.lower().strip()

    # =====================================================
    # 1. FULL-BODY GARMENTS — HIGHEST PRIORITY
    # =====================================================

    full_body_types = {
        "jumpsuit": ("dress", "jumpsuit"),
        "playsuit": ("dress", "playsuit"),
        "romper": ("dress", "romper"),
        "shirt dress": ("dress", "dress"),
        "maxi dress": ("dress", "maxi-dress"),
        "midi dress": ("dress", "midi-dress"),
        "mini dress": ("dress", "mini-dress"),
        "dress": ("dress", "dress"),
        "gown": ("dress", "gown"),
        "saree": ("dress", "saree"),
        "lehenga": ("dress", "lehenga"),
        "anarkali": ("dress", "anarkali"),
    }

    for keyword, value in full_body_types.items():
        if re.search(rf"\b{re.escape(keyword)}\b", t):
            return value

    # =====================================================
    # 2. OUTERWEAR
    # =====================================================

    outerwear_types = {
        "nehru jacket": ("outerwear", "nehru-jacket"),
        "bomber jacket": ("outerwear", "bomber-jacket"),
        "denim jacket": ("outerwear", "denim-jacket"),
        "leather jacket": ("outerwear", "leather-jacket"),
        "jacket": ("outerwear", "jacket"),
        "blazer": ("outerwear", "blazer"),
        "cardigan": ("outerwear", "cardigan"),
        "sweater": ("outerwear", "sweater"),
        "sweatshirt": ("outerwear", "sweatshirt"),
        "hoodie": ("outerwear", "hoodie"),
        "coat": ("outerwear", "coat"),
    }

    for keyword, value in outerwear_types.items():
        if re.search(rf"\b{re.escape(keyword)}\b", t):
            return value

    # =====================================================
    # 3. TOPS
    # =====================================================

    top_types = {
        "t-shirt": ("top", "t-shirt"),
        "t shirt": ("top", "t-shirt"),
        "tee": ("top", "t-shirt"),
        "polo": ("top", "polo"),
        "kurta": ("top", "kurta"),
        "kurti": ("top", "kurti"),
        "tunic": ("top", "tunic"),
        "blouse": ("top", "blouse"),
        "shirt": ("top", "shirt"),
        "top": ("top", "top"),
    }

    for keyword, value in top_types.items():
        if re.search(rf"\b{re.escape(keyword)}\b", t):
            return value

    # =====================================================
    # 4. BOTTOMS
    # =====================================================

    bottom_types = {
        "bootcut jeans": ("bottom", "jeans"),
        "skinny jeans": ("bottom", "jeans"),
        "slim jeans": ("bottom", "jeans"),
        "track pants": ("bottom", "track-pants"),
        "trackpants": ("bottom", "track-pants"),
        "cargo pants": ("bottom", "cargo"),
        "cargo": ("bottom", "cargo"),
        "wide leg trousers": ("bottom", "trousers"),
        "trousers": ("bottom", "trousers"),
        "trouser": ("bottom", "trousers"),
        "jeans": ("bottom", "jeans"),
        "chinos": ("bottom", "chinos"),
        "shorts": ("bottom", "shorts"),
        "leggings": ("bottom", "leggings"),
        "jeggings": ("bottom", "jeggings"),
        "palazzo": ("bottom", "palazzo"),
        "skirt": ("bottom", "skirt"),
        "pants": ("bottom", "pants"),
        "pant": ("bottom", "pants"),
        "tights": ("bottom", "tights"),
    }

    for keyword, value in bottom_types.items():
        if re.search(rf"\b{re.escape(keyword)}\b", t):
            return value

    # =====================================================
    # 5. FOOTWEAR
    # =====================================================

    footwear_types = {
        "sports shoes": ("footwear", "sports-shoes"),
        "running shoes": ("footwear", "running-shoes"),
        "walking shoes": ("footwear", "walking-shoes"),
        "casual shoes": ("footwear", "casual-shoes"),
        "flip flops": ("footwear", "flip-flops"),
        "flip-flops": ("footwear", "flip-flops"),
        "slip-on": ("footwear", "slip-on"),
        "slip on": ("footwear", "slip-on"),
        "sneakers": ("footwear", "sneakers"),
        "sneaker": ("footwear", "sneakers"),
        "loafers": ("footwear", "loafers"),
        "loafer": ("footwear", "loafers"),
        "sandals": ("footwear", "sandals"),
        "sandal": ("footwear", "sandals"),
        "heels": ("footwear", "heels"),
        "heel": ("footwear", "heels"),
        "boots": ("footwear", "boots"),
        "boot": ("footwear", "boots"),
        "slippers": ("footwear", "slippers"),
        "slipper": ("footwear", "slippers"),
        "flats": ("footwear", "flats"),
        "clogs": ("footwear", "clogs"),
        "mules": ("footwear", "mules"),
        "derbys": ("footwear", "derbys"),
        "derby": ("footwear", "derbys"),
        "oxfords": ("footwear", "oxfords"),
        "oxford": ("footwear", "oxfords"),
        "mojaris": ("footwear", "mojaris"),
        "mojari": ("footwear", "mojaris"),
        "shoes": ("footwear", "shoes"),
        "shoe": ("footwear", "shoes"),
    }

    for keyword, value in footwear_types.items():
        if re.search(rf"\b{re.escape(keyword)}\b", t):
            return value

    # =====================================================
    # 6. BAGS
    # =====================================================

    bag_types = {
        "crossbody bag": ("bag", "crossbody-bag"),
        "shoulder bag": ("bag", "shoulder-bag"),
        "sling bag": ("bag", "sling-bag"),
        "backpack": ("bag", "backpack"),
        "handbag": ("bag", "handbag"),
        "tote": ("bag", "tote"),
        "satchel": ("bag", "satchel"),
        "duffle": ("bag", "duffle"),
        "wallet": ("bag", "wallet"),
        "bag": ("bag", "bag"),
    }

    for keyword, value in bag_types.items():
        if re.search(rf"\b{re.escape(keyword)}\b", t):
            return value

    # =====================================================
    # 7. ACCESSORIES — LOWEST PRIORITY
    # =====================================================

    accessory_types = {
        "sunglasses": ("accessory", "sunglasses"),
        "earrings": ("accessory", "earrings"),
        "earring": ("accessory", "earrings"),
        "necklace": ("accessory", "necklace"),
        "bracelet": ("accessory", "bracelet"),
        "watch": ("accessory", "watch"),
        "belt": ("accessory", "belt"),
        "scarf": ("accessory", "scarf"),
        "stole": ("accessory", "stole"),
        "shawl": ("accessory", "shawl"),
        "cap": ("accessory", "cap"),
        "hat": ("accessory", "hat"),
        "ring": ("accessory", "ring"),
    }

    for keyword, value in accessory_types.items():
        if re.search(rf"\b{re.escape(keyword)}\b", t):
            return value

    return None, None

# ==========================================================
# COLOR EXTRACTION
# ==========================================================

COLORS = [

    "black",
    "white",
    "blue",
    "navy",
    "grey",
    "gray",
    "red",
    "green",
    "olive",
    "yellow",
    "mustard",
    "orange",
    "pink",
    "purple",
    "lavender",
    "maroon",
    "brown",
    "beige",
    "cream",
    "gold",
    "silver",
    "peach",
    "coral",
    "khaki"

]

def extract_colors(name):

    text = name.lower()

    found = []

    for color in COLORS:

        if re.search(rf"\b{re.escape(color)}\b", text):
            found.append(color)

    if not found:
        found.append("multicolor")

    return sorted(list(set(found)))
# ==========================================================
# STYLE DETECTION
# ==========================================================

# ==========================================================
# STYLE DETECTION
# ==========================================================

def styles(text):

    t = text.lower()
    detected_styles = []

    # ------------------------------------------------------
    # ETHNIC
    # ------------------------------------------------------

    ethnic_keywords = [
        "kurta",
        "kurti",
        "saree",
        "lehenga",
        "ethnic",
        "anarkali",
        "dupatta",
        "bandhgala",
        "nehru jacket",
        "mojari",
        "mojaris",
        "churidar",
        "salwar",
        "patiala",
    ]

    if any(
        re.search(rf"\b{re.escape(keyword)}\b", t)
        for keyword in ethnic_keywords
    ):
        detected_styles.append("ethnic")

    # ------------------------------------------------------
    # PARTYWEAR
    # ------------------------------------------------------

    partywear_keywords = [
        "gown",
        "cocktail",
        "party wear",
        "partywear",
        "sequined",
        "sequinned",
        "sequin",
        "embellished",
        "shimmer",
        "glitter",
        "metallic",
    ]

    if any(
        re.search(rf"\b{re.escape(keyword)}\b", t)
        for keyword in partywear_keywords
    ):
        detected_styles.append("partywear")

    # ------------------------------------------------------
    # STREETWEAR
    # ------------------------------------------------------

    streetwear_keywords = [
        "hoodie",
        "oversized",
        "graphic",
        "cargo",
        "streetwear",
        "street style",
        "baggy",
    ]

    if any(
        re.search(rf"\b{re.escape(keyword)}\b", t)
        for keyword in streetwear_keywords
    ):
        detected_styles.append("streetwear")

    # ------------------------------------------------------
    # FORMAL
    # ------------------------------------------------------

    formal_keywords = [
        "formal",
        "business",
        "office",
        "bandhgala",
        "blazer",
        "suit",
        "tuxedo",
        "tailored",
    ]

    if any(
        re.search(rf"\b{re.escape(keyword)}\b", t)
        for keyword in formal_keywords
    ):
        detected_styles.append("formal")

    # ------------------------------------------------------
    # MINIMALIST
    # ------------------------------------------------------

    minimalist_keywords = [
        "solid",
        "plain",
        "minimal",
        "minimalist",
        "clean",
    ]

    if any(
        re.search(rf"\b{re.escape(keyword)}\b", t)
        for keyword in minimalist_keywords
    ):
        detected_styles.append("minimalist")

    # ------------------------------------------------------
    # CASUAL
    # ------------------------------------------------------

    casual_keywords = [
        "casual",
        "everyday",
        "relaxed",
    ]

    if any(
        re.search(rf"\b{re.escape(keyword)}\b", t)
        for keyword in casual_keywords
    ):
        detected_styles.append("casual")

    # ------------------------------------------------------
    # DEFAULT FALLBACK
    # ------------------------------------------------------

    if not detected_styles:
        detected_styles.append("versatile")

    return list(dict.fromkeys(detected_styles))
# ==========================================================
# SEMANTIC CONTEXT / OCCASION DETECTION
# ==========================================================

STYLE_OCCASIONS = {
    "casual": [
        "casual",
        "everyday",
        "college",
        "travel",
    ],

    "formal": [
        "professional",
        "office",
        "business",
        "interview",
        "formal-event",
    ],

    "ethnic": [
        "festive",
        "traditional",
        "celebration",
        "cultural-event",
    ],

    "partywear": [
        "party",
        "celebration",
        "social-event",
        "evening-event",
    ],

    "streetwear": [
        "college",
        "concert",
        "casual",
        "social-event",
    ],

    "minimalist": [
        "everyday",
        "professional",
        "casual",
    ],

    "versatile": [
        "everyday",
    ],
}


def occasions(style_list):

    detected_occasions = []

    for style in style_list:
        detected_occasions.extend(
            STYLE_OCCASIONS.get(style, [])
        )

    return list(
        dict.fromkeys(detected_occasions)
    )




# ==========================================================
# CATEGORY LIMITS
# ==========================================================

CATEGORY_LIMITS = {
     "top": 1200,
    "bottom": 900,
    "dress": 700,
    "outerwear": 500,
    "footwear": 800,
    "bag": 400,
    "accessory": 500,
}

category_count = {
    key: 0 for key in CATEGORY_LIMITS
}

products = []
# ==========================================================
# FIT DETECTION
# ==========================================================

def fit(text):

    t = text.lower()

    if "oversized" in t:
        return "oversized"

    if "relaxed" in t:
        return "relaxed"

    if "slim" in t:
        return "slim"

    if "skinny" in t:
        return "slim"

    if "regular" in t:
        return "regular"

    return "regular"

# ==========================================================
# GENERATE PRODUCTS
# ==========================================================

for row in df.itertuples(index=False):

    text = f"{row.name} {row.description}"

    category, subcategory = category_and_subcategory(str(row.name))

    if category is None:
        continue

    # Skip if category already full
    if category_count[category] >= CATEGORY_LIMITS[category]:
        continue

    style_list = styles(text)

    image_url = ""

    if pd.notna(row.images):
        image_url = str(row.images).split(" ~ ")[0].strip()

    product = {

        "product_id": f"P{len(products)+1:03d}",

        "name": row.name,

        "category": category,

        "subcategory": subcategory,

        "gender": row.gender,

        "price": int(row.price),

        "colors": extract_colors(row.name),

        "styles": style_list,

        "fit": fit(str(row.name)) if category in ["top", "bottom", "dress", "outerwear"] else None,

        "occasions": occasions(style_list),

        "image_url": image_url,

        "brand": row.brand,

        "delivery_days": random.randint(2,7)

    }

    products.append(product)

    category_count[category] += 1

# ==========================================================
# SUMMARY
# ==========================================================

# ==========================================================
# SECOND PASS TO REACH 500 PRODUCTS
# ==========================================================

used_names = {p["name"] for p in products}

if len(products) < TARGET_PRODUCTS:

    for row in df.itertuples(index=False):

        if len(products) >= TARGET_PRODUCTS:
            break

        if row.name in used_names:
            continue

        text = f"{row.name} {row.description}"

        category, subcategory = category_and_subcategory(str(row.name))

        if category is None:
            continue

        style_list = styles(text)

        image_url = ""

        if pd.notna(row.images):
            image_url = str(row.images).split(" ~ ")[0].strip()

        product = {

            "product_id": f"P{len(products)+1:03d}",

            "name": row.name,

            "category": category,

            "subcategory": subcategory,

            "gender": row.gender,

            "price": int(row.price),

            "colors": extract_colors(row.name),

            "styles": style_list,

            "fit": fit(str(row.name)) if category in ["top", "bottom", "dress", "outerwear"] else None,

            "occasions": occasions(style_list),

            "image_url": image_url,

            "brand": row.brand,

            "delivery_days": random.randint(2, 7)

        }

        products.append(product)
        used_names.add(row.name)

print("\nWearable Products Found:", len(products))

products = products[:TARGET_PRODUCTS]
# ==========================================================
# SAVE JSON
# ==========================================================

with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
    json.dump(
        products,
        f,
        indent=4,
        ensure_ascii=False
    )

# ==========================================================
# SAVE CSV
# ==========================================================

pd.DataFrame(products).to_csv(
    OUTPUT_CSV,
    index=False
)

# ==========================================================
# FINAL REPORT
# ==========================================================

print("\n======================================")
print("PRODUCT CATALOGUE GENERATED")
print("======================================")

print(f"Total Products : {len(products)}")

print("\nCategory Distribution\n")

category_summary = {}

for p in products:
    category_summary[p["category"]] = category_summary.get(
        p["category"],
        0
    ) + 1

for category in sorted(category_summary):
    print(f"{category:12} : {category_summary[category]}")

print("\nStyle Distribution\n")

style_summary = {}

for p in products:

    for s in p["styles"]:

        style_summary[s] = style_summary.get(
            s,
            0
        ) + 1

for style in sorted(style_summary):
    print(f"{style:12} : {style_summary[style]}")

print("\nSample Product\n")

print(
    json.dumps(
        products[0],
        indent=4
    )
)

print("\nFiles Created")
print("✓", OUTPUT_JSON)
print("✓", OUTPUT_CSV)

print("\nDone!")