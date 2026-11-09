# Temporary CSV brand-prefix stripper. Deleted after use.
# seed-catalog.ts builds displayName as brand + ' ' + name, so any CSV name
# that already starts with the brand gets doubled ("Fitbit Fitbit Versa 4").
import csv
import os

BASE = "/home/recoding/gsmhub/backend/data/catalog"
FILES = ["watches.csv", "earbuds.csv", "laptops.csv"]

for fn in FILES:
    path = os.path.join(BASE, fn)
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fields = reader.fieldnames
        rows = list(reader)

    before = len(rows)
    changed = []
    for r in rows:
        brand = (r.get("brand") or "").strip()
        name = (r.get("name") or "").strip()
        if brand and name.lower().startswith(brand.lower() + " "):
            r["name"] = name[len(brand) + 1:]
            changed.append((brand, name, r["name"]))

    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)

    print(f"{fn}: {before} rows, {len(changed)} stripped")
    for brand, old, new in changed:
        print(f"  [{brand}] {old!r} -> {new!r}")

# Post-check: no name should still start with its brand
print("--- post-check ---")
for fn in FILES:
    with open(os.path.join(BASE, fn), newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            brand = (r.get("brand") or "").strip()
            name = (r.get("name") or "").strip()
            if brand and name.lower().startswith(brand.lower() + " "):
                print(f"STILL DOUBLED in {fn}: {name!r}")
print("done")
