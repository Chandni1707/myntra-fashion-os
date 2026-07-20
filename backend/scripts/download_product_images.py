import json
import requests
from pathlib import Path
from tqdm import tqdm


CATALOG_PATH = "app/data/product_catalog_5000.json"
OUTPUT_DIR = "app/data/product_images"

OUTPUT_DIR = Path(OUTPUT_DIR)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

with open(CATALOG_PATH, "r", encoding="utf-8") as f:
    products = json.load(f)

success = 0
failed = 0

for product in tqdm(products):

    image_url = product["image_url"]
    product_id = product["product_id"]

    save_path = OUTPUT_DIR / f"{product_id}.jpg"

    if save_path.exists():
        success += 1
        continue

    try:

        r = requests.get(image_url, timeout=20)

        if r.status_code == 200:

            with open(save_path, "wb") as f:
                f.write(r.content)

            success += 1

        else:
            failed += 1

    except Exception:
        failed += 1

print()

print("Downloaded:", success)
print("Failed:", failed)