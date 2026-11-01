# Menu data notes

`src/data/menu.json` is the single source of truth for every dish, price, variant and day rule shown in the app.

## Where it came from

| Field | Source |
|---|---|
| Dishes, prices, serial numbers, day rules, Happy Hour timing | `WADI_Menu_Modified_2026_25092026.xlsx`, sheet `MENU 2026`, columns A to E (rows 3 to 260) |
| Restaurant name (English) | Logo artwork: "AROUS AL WADI RESTAURANT" |
| Restaurant name (Arabic) | Shop sign: مطعم عروس الوادي |
| Malayalam line in logo | Logo artwork: തട്ടിക്കൂട്ട് (Thattikoottu), the same word the sheet uses for the two "Thattikoottu Special" sections |
| Phones, email, Free Home Delivery | Printed menus and flyer: 06 5363600, 0506539192, alwadi.nms@gmail.com |
| Street address, map pin, opening hours | Google Maps listing for the restaurant (Bukhara Street, Al Nahda, Sharjah; 25.3016037, 55.3795801; daily 6:00 AM to 12:00 AM) |
| Directions link | Google Maps link supplied by Razal |

Not used: Talabat columns F to H (listing flag and the +28% delivery-app markup). They are internal pricing, not dine-in prices.

## Verification done

- All 252 serial numbers in the sheet appear in `menu.json`, each exactly once.
- Every price was checked by script against the sheet: 0 mismatches.
- 218 menu entries after combining rows that are the same dish in different options (see below).

## Name corrections applied (spelling only, meaning unchanged)

Every item keeps the exact sheet text in its `source` field, so any change below can be reverted.

| Sheet text | Shown as | Why |
|---|---|---|
| Saambar | Sambar | Typo |
| POROTTA WRAP - EGG OMLETE | Porotta Wrap, Egg Omelette | Typo; sheet spells it "Omelette" in row 23 |
| PANEER MANJURIAN | Paneer Manchurian | Matches Chicken, Gobi and Veg Manchurian |
| BINDI MASALA | Bhindi Masala | Typo |
| WEDNSDAY | Wednesday | Typo |
| POTHIBIRIYANI ... | Pothi Biriyani ... | Matches printed menus |
| ALEPPY CHICKEN CURRY | Alleppey Chicken Curry | Matches printed menus ("Aleppey") and the common spelling |
| NEY PATHIL | Ney Pathal | Both printed menus say "Ney Pathal" |
| CHILLI GOBI SMALL/BIG | Chilly Gobi | Sheet uses "Chilly" in Chicken Chilly, Beef Chilly and Chilly Gobi Dry |
| CUTLET - BEEF/CKN, SAMOOSA - VEG/CKN | Chicken | "CKN" abbreviation |
| KARI VEPPILA CHICKEN | Kariveppila Chicken | Matches printed menus |
| LASSI SWEET | Sweet Lassi | Word order |
| FRIED RICE CHICKEN (NORMAL / SCHEZWAN) and the other 8 fried rice / noodle rows | Chicken Fried Rice, with Normal and Schezwan prices | Natural word order; both prices kept |

Not changed on purpose: Biriyani, Porotta, Chatty / Chatti, Peralan, Ularthiyathu, Kaandhari, Angamali, Burji, Samoosa and every other Kerala transliteration the restaurant uses. "Thattikoottu" stays as in the sheet because the Malayalam in the logo reads തട്ടിക്കൂട്ട്.

## Rows combined into one dish with options

Prices and serial numbers stay attached to each option.

- Vada Set: 3 pcs 6, 2 pcs 5 (24, 25)
- Pothi Biriyani: Chicken 16, Beef 19, Mutton 21, Fish 20 (62 to 65)
- Ilayil Pollichath: King Fish as per size, Mathi 3 pcs 12, Sherry as per size (88 to 90)
- Hot & Sour Soup: Mutton 12, Chicken 10, Vegetable 9 (100 to 102)
- Manchow Soup: Mutton 12, Chicken 10 (103, 104)
- Kizhi Thattu Dosa, Pothi Porotta, Kizhi Porotta: Chicken 16, Beef 18 each
- Kappa Biriyani: Chicken 15, Beef 17; Chicken Nadan Fry: Half 18, Full 32
- Kothu Porotta: Chicken 15, Beef 16, Egg 10, Veg 12
- Porotta Wrap: Chicken 4.50, Beef 4.50, Egg Omelette 3.50, Boiled Egg 3.50
- Soft Drink: Can 3, Chottu 1.50

Rows split into separate items: Black Tea / Lime Tea, Coffee / Special Coffee, Horlicks / Boost.

## Confirm with the restaurant before go-live

1. **Rappayi Chicken Fry (140)**: two prices, 16 and 24, with no labels. Shown as "16 / 24" until labels are confirmed.
2. **"SP" in Chapathi SP (206) and SP Coffee (49)**: read as "Special".
3. **Happy Hour "WEEK DAYS ONLY"**: set to Monday to Friday, 4:00 PM to 7:00 PM (UAE work week). Change `groups[happy-hour].window.days` if the restaurant means otherwise.
4. **Friday**: the sheet has no Wadi Daily Special for Friday. The app shows only Kallil Chutta Chicken (Pepper) as today's item on Fridays.
5. **Fish Chatty Curry (83) and Fish Mango Curry (84)**: one price for both Ayala and King Fish, as in the sheet.
6. **Opening hours**: from Google Maps (daily 6:00 AM to midnight).
7. **WhatsApp**: 050 653 9192 is a mobile number, but nothing says it takes WhatsApp orders. `restaurant.whatsapp` is `null`, so WhatsApp buttons stay hidden until a number is set.
8. **Veg / non-veg markers**: `diet` is filled in only where the dish name says it (chicken, beef, fish, egg, paneer, gobi, dal and similar) or the dish is a standard plain veg staple (dosa, idly, appam). Everything else is `null`. The app keeps the markers off until `SHOW_DIET_MARKERS` is set to `true` after the restaurant checks them.

## In printed menus but not in the September 2026 sheet (left out)

The sheet is newer than the printed A4 menus, so the following are left out. Add them to `menu.json` only if the restaurant confirms they are still served.

| Printed item | Printed price | Sheet |
|---|---|---|
| Curd Rice | 20.00 | Not listed |
| Chemmeen Chuttulli | 18.00 | Not listed |
| Squid Roast / Squid Vattichathu | 16.00 | Not listed (Squid Dry Fry 15 and Squid Pepper Masala 16 are) |
| Beef Nadan Curry | 18.00 | Not listed |
| Beef Stew | 18.00 | Not listed |
| Chicken Varattiyathu | 18.00 | Not listed |
| Black Coffee | 1.50 | Not listed (Coffee 2, Special Coffee 3) |

## Printed prices that differ from the sheet (sheet price used)

| Item | Printed | Sheet |
|---|---|---|
| Beef 25 | 18 | 16 |
| Chilly Gobi Fry / Dry | 16 | 15 |
| Schezwan Fried Rice, Beef | 22 | 20 |
| Schezwan Fried Rice, Mix | 25 | 22 |
| Chappathi | 1.50 | Chapathi (Special) 1.25 |
| Veg Manchurian (dark menu) | 8 | 14 |
| Veg Kurma (dark menu) | 15 | 10 |
| Chicken Lollipop | Dry / "Saucy" | Dry / Gravy |
