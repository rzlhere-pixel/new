# Editing the menu

You don't need to be a developer to change the menu. Every dish, price and opening detail lives in one file: **`src/data/menu.json`**. Change it on github.com, commit to `main`, and Lovable picks up the change and rebuilds the site by itself (publish from Lovable if your site doesn't update on its own).

## How to edit a file on github.com

1. Open the repository on github.com.
2. Click into `src`, then `data`, then `menu.json`.
3. Click the **pencil** icon (Edit this file) at the top right of the file.
4. Make your change. Use **Ctrl+F** (Cmd+F on a Mac) to find the dish by name.
5. Click **Commit changes…**, write a short note (for example "Masala Dosa now 8"), leave **Commit directly to the main branch** selected, and click **Commit changes**.

If you break the file (for example a missing comma), GitHub may show a red warning; Lovable's build will also fail and the old menu stays online. Undo your change and try again.

> Tip: keep the quotes, commas and brackets exactly as they are. Only change the text between quotes, or the numbers.

## Change a price

Find the dish and change the number after `"price":`.

```json
{ "id": "masala-dosa", "no": "1", "name": "Masala Dosa", "price": 7, "diet": "veg", ... }
```

- Write plain numbers with a dot for decimals: `7`, `2.5`, `12.5`, `1.25`. No "AED", no quotes, no comma.
- The site shows `7` as **7** and `2.5` as **2.50** by itself.
- For dishes with options (Single / Double, Chicken / Beef…), the prices are inside `"variants"`. Change the `"price"` of the option you need.
- "As per size" dishes have `"price": null` and `"priceNote": "As per size"`. Leave those as they are unless the restaurant sets a fixed price.

## A dish is sold out today, or no longer served

Add one of these inside the dish's `{ … }`, after `"diet": …` for example:

- `"soldOut": true`: the dish stays on the menu, greyed out, with "Not available today" and no Add button.
- `"hidden": true`: the dish disappears from the menu completely.

```json
{ "id": "kheema", "no": "21", "name": "Kheema", "price": 7, "diet": "non-veg", "soldOut": true, ... }
```

Remember to remove it (or set it to `false`) when the dish is back.

## Add a dish

1. Find a dish in the same section that looks like the new one (single price, or with options).
2. Copy its whole `{ … }` block, including the comma between blocks.
3. Paste it where you want it in the list and change:
   - `"id"`: lowercase words joined by hyphens, **unique** in the whole file (for example `"chicken-kondattam"`).
   - `"no"`: the serial number from the printed menu, **unique** in the whole file.
   - `"name"` and `"price"` (or the `"variants"`).
   - `"source"`: write the name as it appears in the restaurant's sheet.
   - `"diet"`: `"veg"`, `"non-veg"`, or `null` if unsure.
4. Don't add descriptions, spice levels or ingredients; the menu shows names and prices only.

The automatic tests check that every `id` and `no` is unique. If you are not sure, ask a developer to run `bun run test`.

## Turn on the veg / non-veg markers

Only after the restaurant has checked the `"diet"` values. Open **`src/config/site.ts`** and change:

```ts
showDietMarkers: false,
```

to `true`. The same file has `showItemNumbers` (show the serial number on every row) and `enableMyList` (the "Your list" feature).

## WhatsApp orders and the delivery buildings

Delivery orders are sent as a WhatsApp message to the number in `"whatsapp"` near the top of `src/data/menu.json` (now `"971506539192"`, that is 050 653 9192). Customers add dishes, open **Your list**, tap **Order for delivery**, pick their building, add the flat number, and WhatsApp opens with the order written out. Nothing is sent until they press send in WhatsApp; there is no online payment.

- **Change the number:** write it in international format, digits only, in quotes: `"whatsapp": "9715XXXXXXXX",`.
- **Turn delivery ordering off:** set it to `"whatsapp": null,`. The Order for delivery button and the WhatsApp row disappear.

The building list is **`src/data/delivery-buildings.json`** (76 buildings from `docs/source/Al_Nahda_Highlighted_Area_Building_Register.xlsx`, the area drawn in `docs/source/delivery-area-map.jpg`). Each building looks like this:

```json
{ "id": "al-kawther-tower", "name": "Al Kawther Tower", "street": "Bukhara Street" },
```

- **Add a building:** copy a line, change `name` and `street`, and give it a unique `id` (lowercase words joined by hyphens). Keep the list in A to Z order by name.
- **Remove a building:** delete its line (and the comma before it if it was the last one).
- Customers whose building is missing can tap **My building isn't listed** and type it.

## Change Happy Hour

In `src/data/menu.json`, find the group with `"id": "happy-hour"`:

```json
"note": "4:00 PM to 7:00 PM, weekdays only",
"window": { "days": ["mon", "tue", "wed", "thu", "fri"], "from": "16:00", "to": "19:00" },
```

- `days` uses `sun mon tue wed thu fri sat`.
- `from` and `to` are 24-hour times in UAE time.
- Update `note` to match; it is shown above the combos.

## Daily specials

Each daily special has `"availableDays"`, for example `["sun"]`. Change the days the same way as Happy Hour. The "Today" panel at the top picks them up automatically.

## Opening hours, phones, address

All in the `"restaurant"` block near the top of `src/data/menu.json`. `"close": "24:00"` means midnight.

## Add a real dish photo

Only real photos taken at the restaurant (no stock or AI images).

1. Make it square, 800 px or larger, saved as `.webp`.
2. Upload it on github.com to `public/food/dish/` (Add file → Upload files) and name it after the dish id, for example `mutton-dum-biriyani.webp`.
3. Open `src/data/dish-photos.ts` and add a line inside the `{ }`:

```ts
export const DISH_PHOTOS: Record<string, string> = {
  "mutton-dum-biriyani": "/food/dish/mutton-dum-biriyani.webp",
};
```

A small round photo then appears on that dish's row; tapping it opens a larger view.

## Print the QR code

1. Open **`https://<your published site>/qr`**. Use the **published** address, not the Lovable preview. The page shows a red warning if you are on a preview address.
2. Choose **Table cards (A6, 2 on A4)** or **Poster (A4)**.
3. Click **Print** (set margins to None and scale to 100% if your printer asks), or download the QR as SVG or PNG for a print shop.
4. Have a native speaker check the Arabic and Malayalam lines before printing a big batch.

## Changing the Excel sheet instead

If the restaurant sends a new version of the sheet with the same layout, a developer can rebuild `menu.json` with `tools/xlsx_to_menu_json.py`. Check `docs/MENU_DATA_NOTES.md` first: some names were corrected on purpose.
