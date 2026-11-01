# BUILD PROMPT: Arous Al Wadi QR Menu (Claude Code, Lovable repo, GitHub sync)

You are building the QR-code menu that diners at **Arous Al Wadi Restaurant** (Al Nahda, Sharjah) open by scanning a code on their table. The repo is a **Lovable project synced to GitHub**. Lovable must keep building it after you finish, and later changes will be made through GitHub. Mobile is the only screen that really matters; larger screens just must not break.

Read this whole file before you touch anything. Then work through the phases in order. Do not skip the inventory in Phase 0.

---

## 0. Phase 0: Skills, plugins and MCP inventory (required)

1. List every **skill**, **plugin** (including plugin skills, agents and commands) and **MCP server** in this session. Write the list to `docs/BUILD_LOG.md` as a table: `name | type | use or skip | phase | reason`.
2. Use **every one that applies**, at the phase where it applies. Do not invent tools that are not installed; if one below is missing, write "not installed" and carry on.
3. Expected mapping (use whichever of these exist):

| Capability | Use it for |
|---|---|
| `frontend-design` skill | **Do not start a new design.** §6 is the approved result of that skill. Use the skill only for its critique pass on your built screens (Phase 5). |
| Planning, TDD, debugging or verification skills (e.g. superpowers: `writing-plans`, `test-driven-development`, `systematic-debugging`, `verification-before-completion`, `requesting-code-review`) | Phase 1 plan; tests in §11 first; fixing failures; final check |
| Playwright / browser / Chrome DevTools MCP, or a `webapp-testing` skill | Mobile screenshots and interaction checks in §11, plus a Lighthouse run if available |
| Docs MCP (e.g. context7) | Check current APIs of whatever router, Vite, Tailwind and `qrcode` versions the repo really has |
| GitHub (`gh` CLI or GitHub MCP) | Branch, commits, PR (§12) |
| Lovable MCP (if connected) | Read the project and preview URL; confirm the sync after merge. Do **not** send Lovable agent messages that spend credits unless asked. |
| Review or security review skills or commands | Run on the final diff before the PR |
| Accessibility, SEO or performance skills | §9 and §10 |
| Image skills | **Not needed.** Assets are final (see `docs/ASSETS.md`). Do not re-encode them. |

---

## 1. Phase 1: Repo audit (do not change anything yet)

Find out and record in `docs/BUILD_LOG.md`:
- Framework and router: React Router (`react-router-dom`), TanStack Router or Start (`src/routes/`), or something else. **Use whatever is already there; do not migrate.**
- Package manager, from the lockfile (`bun.lockb`/`bun.lock`, `package-lock.json`, `pnpm-lock.yaml`). Use only that one and never add a second lockfile.
- Tailwind version: v3 (`tailwind.config.ts`) or v4 (`@theme` in CSS). Put tokens in the matching place.
- shadcn/ui components already present (`src/components/ui/*`) and `components.json`.
- The `vite.config.ts` plugins (keep `lovable-tagger` / `componentTagger` exactly as it is), path alias `@/*`, dev port.
- Whether `npm run build` passes on the untouched scaffold.

**Lovable compatibility rules (do not break):** keep Vite, `index.html` at the root, the existing entry file, the `@/` alias, the Tailwind and shadcn setup, `lovable-tagger`, and the existing scripts (`dev`, `build`, `preview`, `lint`). No SSR framework swap, no Next.js, no backend, no Supabase, no environment secrets. Static data only.

---

## 2. Files the human has already placed in the repo

Copied in from `arous-alwadi-menu-handoff/`. Check they are all there before you start; stop and report if any are missing.

```
public/brand/*            logos (see docs/ASSETS.md)
public/photos/*           retouched shop-front photos (AVIF/WebP/JPG)
public/food/*             small food artwork from the printed menus
public/icons/*            PWA icons
public/favicon.ico  public/favicon-32.png  public/apple-touch-icon.png  public/og-image.jpg
src/data/menu.json        THE menu: single source of truth
docs/MENU_DATA_NOTES.md   sources, corrections, items still to confirm
docs/ASSETS.md            what each asset is for, and its size limits
docs/source/WADI_Menu_Modified_2026_25092026.xlsx   original sheet (reference only)
tools/xlsx_to_menu_json.py  regenerates menu.json from a future revised sheet (reference only)
```

If Lovable's scaffold already has `public/favicon.ico` or `public/placeholder.svg`, the handoff favicon wins. Delete `placeholder.svg` if nothing uses it.

---

## 3. Data contract (`src/data/menu.json`)

Create `src/data/menu.types.ts` and a zod schema in `src/data/menu.schema.ts` that match this **exactly** (add `zod` if it is not installed):

```ts
export type Day = 'sun'|'mon'|'tue'|'wed'|'thu'|'fri'|'sat';
export type Diet = 'veg'|'non-veg'|null;
export interface Variant { label: string|null; price: number|null; priceNote?: string; no?: string }
export interface Item {
  id: string; no?: string; name: string; source: string;
  price?: number|null; priceNote?: string;          // single-price items
  variants?: Variant[];                              // multi-option items (no item-level price)
  options?: string;                                  // e.g. "Ayala or King Fish": a choice, not a price change
  availableDays?: Day[];                             // daily specials and Kallil Chutta Chicken
  confirm?: string;                                  // still to be confirmed with the restaurant; never shown in the UI
  diet: Diet;
  soldOut?: boolean; hidden?: boolean;               // optional, for staff edits through GitHub
}
export interface Section { id: string; title: string; image?: string; items: Item[] }
export interface Group {
  id: string; title: string; note?: string; source?: string;
  window?: { days: Day[]; from: string; to: string }; // Happy Hour only
  sections: Section[];
}
export interface Menu { meta: {...}; restaurant: {...}; groups: Group[] } // type meta and restaurant exactly as they are in the JSON
```

Rules:
- **Import the JSON at build time** (`import menu from '@/data/menu.json'`) and validate it once in a dev-only check and in tests. No fetching and no runtime network.
- **No prices, dish names or copy about dishes anywhere in components.** Everything comes from `menu.json`.
- **Do not add, remove, rename or reprice anything** in `menu.json`. The figures were checked against the sheet (0 mismatches, 252 of 252 serial numbers). Items left out on purpose, and the reasons, are in `docs/MENU_DATA_NOTES.md`.
- `source` and `confirm` are internal and are never rendered.
- `hidden: true`: not rendered at all. `soldOut: true`: rendered muted, with "Not available today" and no Add button.
- Price format: whole numbers with no decimals (`7`); anything else with two decimals (`2.50`, `1.25`, `12.50`). Write "AED" once per section header, not on every row. `price: null` with `priceNote` shows the note ("As per size") in muted italics. A variant with `label: null` (Rappayi Chicken Fry) shows its prices joined by " / ".
- Section images map in `src/lib/images.ts`: `biryani-handi → /food/biryani-handi-620`, `kizhi-porotta → /food/kizhi-porotta-267`, `fried-rice → cluster of /food/{fried-rice,noodles,schezwan-noodles,schezwan-fried-rice}-128`. Serve with `<picture>`: AVIF, then WebP.

---

## 4. Config: `src/config/site.ts`

```ts
export const SITE = {
  showDietMarkers: false,   // turn on only after the restaurant confirms the veg/non-veg tags (MENU_DATA_NOTES §8)
  showItemNumbers: false,   // serial numbers on list rows; always shown on the "Show to staff" screen
  enableMyList: true,
  qrPath: '/?src=table',    // the QR encodes window.location.origin + qrPath
  publicUrlOverride: '',    // set only if the QR must point at a custom domain
} as const;
```

---

## 5. Time logic: `src/lib/time.ts` (pure functions with unit tests)

- Restaurant time is always **Asia/Dubai**, whatever timezone the phone is set to. Use `Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })`. Write `dubaiNow(date = new Date()) → { day: Day, minutes: number }`.
- `isOpen(now)`: open daily from `restaurant.hours.daily.open` to `close`, where `"24:00"` means midnight.
- `todaysItems(menu, now)`: items whose `availableDays` include today. That means the Wadi Daily Special plus Kallil Chutta Chicken (Normal on Thu and Sat, Pepper on Fri and Sun).
- `happyHourState(group, now)`: `'on'` (Mon to Fri, 16:00 to 19:00), `'later-today'`, or `'off'`.
- Re-check every 60 s while the page is visible (`visibilitychange`).

---

## 6. Design system (approved; this is the `frontend-design` result, so build it as written)

**Subject:** a Kerala thattukada-style restaurant behind a black slatted shop front with orange neon letters. **Audience:** diners at the table, one-handed, under bright indoor light, on mid-range Android phones with patchy signal; also people calling for delivery. **Job:** find a dish and its price in seconds.

**The one bold moment:** the real night photo of the shop front, where the sign "switches on". Everything below it stays quiet, white and disciplined.

### Colour tokens (CSS variables, light theme first)
| Token | Hex | Source and use |
|---|---|---|
| `--facade` | `#1F1A17` | Black slatted shop front. Hero base, footer, "Show to staff" screen |
| `--neon` | `#F57716` | Pot orange and the sign glow. Active chip, today highlight, focus ring |
| `--brand-red` | `#EC1D27` | Wordmark red. Section titles and the primary button. **Never** for body text |
| `--gold` | `#CA9619` | Logo underline. Hairline rules (at 35% opacity), item numbers |
| `--ghee` | `#FFF2CC` | The printed menus' butter-yellow panels. Today panel, Happy Hour panel |
| `--paper` | `#FFFFFF` | Menu background |
| `--ink` | `#2A2420` | Body text (AA on paper and ghee) |
| `--muted` | `#6E645C` | Secondary text (check AA at 14 px) |
| `--veg` `#1E7B34` / `--nonveg` `#8A2B1E` | | FSSAI-style markers: green square with dot, brown-red triangle |

Dark theme (`prefers-color-scheme: dark`): background `--facade`, text `#F3ECE3`, ghee panels `#33290F`, rules gold at 30%, red stays for titles only if it passes AA; otherwise use `--neon`.

### Type
- **Display:** *Big Shoulders Display* (signage-born condensed face that echoes the "AL WADI RESTAURANT" channel letters), 800, Title Case. Group titles 44/1.0, section titles 32/1.05, letter-spacing 0.01em. **Never all caps, and never smaller than 24 px.**
- **Text:** *Readex Pro* (Latin and Arabic, built for readability; also renders مطعم عروس الوادي). Body and dish names 17/1.35, weight 500 for names and 400 elsewhere; prices 17, weight 600, `font-variant-numeric: tabular-nums` (check the font supports `tnum`; if it does not, keep prices right-aligned and drop the requirement); small text 14/1.4.
- Self-host with `@fontsource-variable/readex-pro` (or `@fontsource/readex-pro` 400/500/600) and `@fontsource/big-shoulders-display` 800 (or the variable package). `font-display: swap`. Preload only the Latin files used above the fold.

### Layout (mobile 360 to 430 px, 20 px side gutters, 4 px spacing grid)
```
┌──────────────────────────────┐
│  storefront-corner photo     │ 68svh, object-position 50% 35%
│  (neon "switches on" once)   │
│  ░░ gradient to --facade ░░  │
│  [logo-stacked-white 168px]  │
│  مطعم عروس الوادي             │ ← Arabic name, lang=ar dir=rtl
│  Al Nahda, Sharjah           │
│  ● Open now, closes midnight │
├──────────────────────────────┤
│ ghee panel: Today, Sunday    │ todaysItems(); variants as chips
│ Chatti Choru  [Fish 17]…     │
│ Happy Hour: on until 7 PM    │ only when 'on' or 'later-today'
├──────────────────────────────┤ ← sticky from here (top: 0), white, hairline bottom
│ [ Search dishes        ] [≡] │ ≡ opens the section index sheet
│ (Breakfast)(Tea & Snacks)…   │ scroll-spy chips, horizontal scroll, snap
├──────────────────────────────┤
│ Breakfast            AED     │ group title; when a group has one section, show only one title
│ Masala Dosa              7   │ row: name left, price right, 52 px min height
│ Egg Curry                    │
│  [Single 5] [Double 7]       │ variant chips under the name
│ ───────── gold hairline ──── │
│ Dinner                       │
│  Starters            AED     │
│  …                           │
├──────────────────────────────┤
│ Visit us: storefront-front   │ address, hours, map, phones, email, free delivery
│ Prices updated 25 Sep 2026   │ from meta.sourceDate
└──────────────────────────────┘
 ┌────────────────────────────┐ fixed bottom bar, safe-area aware
 │ [Call to order] [Directions]│ + "Your list (3)" pill above when the list is not empty
 └────────────────────────────┘
```
- Content left-aligned; prices right-aligned. Max content width 640 px, centred on wide screens. At 768 px and wider the hero switches to `storefront-front` (2.66:1, 52vh).
- After the hero scrolls away, the sticky bar shows `logo-horizontal` at 28 px high on its left edge (a fade, nothing fancier).
- Corners differ by level: chips are full pills, ghee panels 20 px (like the printed menus), section images round, list rows have **no** card styling (rows plus hairlines, not a grid of cards).
- Section marks: a 56 px round image on the right of the section title, only for sections that have `image`. The fried rice section shows the 4 plates overlapping at 40 px each.

### Motion (one moment plus feedback)
- On load only: the hero image goes from `brightness(.55) saturate(.6)` to `1, 1` over 700 ms with ease-out, a 120 ms flicker step at 30%, then the logo fades in over 300 ms. With `prefers-reduced-motion`: no animation at all.
- Everything else moves only when the user acts: chip scroll-into-view, bottom sheets (shadcn `Drawer`/`Sheet`), an "Added" tick on the Add button (200 ms). **No** fade-up on sections, **no** parallax, **no** hover lifts.

### Things that must not appear (generic AI design tells)
All-caps eyebrow labels, middle-dot meta strings (`A · B · C`), monospace data labels, `→` on buttons, gradient washes behind content, identical rounded cards with grey shadows, one radius everywhere, a cream `#F4F1EA` background, a terracotta accent, emoji in UI, stock or AI food photos, invented taglines ("Authentic taste since…"), dish descriptions, star ratings or reviews.

---

## 7. Features (build all of them)

7.1 **Hero**: the `<picture>` with `fetchpriority="high"`, explicit width and height, alt "Arous Al Wadi Restaurant shop front at night, Al Nahda, Sharjah". The H1 is visually hidden: "Arous Al Wadi Restaurant menu". The logo `<img>` alt is "Arous Al Wadi Restaurant". The open/closed line comes from `isOpen()`: "Open now, closes at midnight" or "Closed, opens at 6 AM".

7.2 **Today panel**: title "Today, {Weekday}". List `todaysItems()` with prices or variant chips. Friday has no Wadi Daily Special, so it shows only Kallil Chutta Chicken (Pepper). If the list is empty, hide the panel. Tapping an item scrolls to it in the menu and flashes its row (neon outline, 600 ms).

7.3 **Happy Hour**: when `'on'`, show "Happy Hour combos on now until 7 PM" with a link to `#combos`. When `'later-today'`, show "Happy Hour combos 4 PM to 7 PM today". Hide otherwise. Inside the menu, the Happy Hour group always shows its `note`.

7.4 **Sticky search and chips**:
- One chip per section (18 in total). Labels: Breakfast, Tea & Snacks, Lunch, Daily Specials, Fish, Chinese & Soups, Fried Rice & Noodles, Starters, Chicken, Beef, Mutton, Veg, Bread, Thattikoottu, Mallus Thattikoottu, Combos, Porotta Wraps, Drinks. These are short labels for the chips only; section headings use `title`.
- Scroll-spy with `IntersectionObserver`. The active chip is filled with `--neon` (white text) and scrolled into view. Tapping a chip scrolls with the sticky-bar offset applied (`scroll-margin-top`).
- The ≡ button opens a bottom sheet titled "Sections" that lists groups and their sections.

7.5 **Search** (`src/lib/search.ts`, pure, tested):
- Searches `name`, variant labels, `options`, section title, and serial numbers (typing "55" finds Mutton Dum Biriyani).
- Normalise: lowercase, strip punctuation and diacritics, collapse spaces.
- Treat these as the same word: biryani/biriyani/briyani; porotta/parotta/paratha/barotta; chilli/chilly/chili; chapathi/chappathi/chapati; omelette/omlet/omelet; idly/idli; samoosa/samosa; kheema/keema; manchurian/manjurian; schezwan/szechuan/schezuan; prawns/chemmeen; fish/meen; chicken/kozhi; mathi/sardine; ayala/mackerel; king fish/neymeen/seer; kappa/tapioca; kadala/chickpea; cherupayar/moong/green gram; ghee/ney; pazham pori/banana fry; parippu vada/dal vada.
- Results replace the list while the query is not empty, grouped by section, with match highlighting. Empty state: "No dishes match "{q}". Try another spelling, or a number from the printed menu." Keep the query in `?q=` without adding history entries. Esc and the clear button reset it.

7.6 **Menu list**: rows as in §6. Variant chips are read-only labels with price ("Single 5"), not buttons. `options` shows as small muted text ("Ayala or King Fish"). `availableDays` shows a small tag: "Sundays", "Thu and Sat", and "Today" (neon) when it matches today. Diet markers only when `SITE.showDietMarkers`. `soldOut` and `hidden` as in §3.

7.7 **Your list** (when `SITE.enableMyList`):
- A 44 px "Add" icon button on every row. For an item with variants, a small sheet asks for the option.
- The list is stored in `localStorage` (key `aaw:list:v1`). Wrap every read and write in try/catch so the app still works without storage.
- The bottom pill reads "Your list (n)" and opens a sheet with quantity steppers, "Approx. total AED X" (leaving out items without a price, with a note saying so), "Clear list" and "Show to staff".
- **Show to staff** is a full-screen `--facade` page: each line is serial number + name + option + quantity in 24 px type, the screen stays awake (`navigator.wakeLock` if available) and has a large "Done" button.
- When `restaurant.whatsapp` is set, also show "Send on WhatsApp" with the list as plain text through `https://wa.me/<number>?text=`. It is hidden while the value is null.

7.8 **Bottom bar**: "Call to order" opens a sheet listing both numbers as `tel:` links plus "Free home delivery". "Directions" opens `restaurant.mapsUrl` in a new tab. Respect the safe area with `env(safe-area-inset-bottom)`, and pad the page bottom so the last row is never covered.

7.9 **Visit us** (footer): the `storefront-front` picture, the address, "Open daily 6 AM to midnight", a "Get directions" button, both phones, the email as a `mailto:` link, "Free home delivery", "Prices updated 25 Sep 2026" and "Prices in AED".

7.10 **`/qr` print page** (not linked in the UI, `noindex`):
- Builds the QR as SVG with the `qrcode` package: error correction Q, quiet zone of 4 modules, modules in `--facade` on white. It encodes `(SITE.publicUrlOverride || window.location.origin) + SITE.qrPath`.
- Two layouts with print CSS: **A6 table card**, 2-up on A4 (`@page { size: A4; margin: 0 }`), and **A4 poster**. Each has `logo-stacked`, "Scan for the menu" plus the Arabic line "امسح الرمز لعرض القائمة" and the Malayalam line "മെനു കാണാൻ സ്കാൻ ചെയ്യൂ" (add a code comment: have a native speaker check both before printing), the QR printed at 40 mm or more, the URL in text, phones and "Free home delivery". Optional decoration: `bone-in-leg-480` as a small round image on the poster only.
- Buttons for "Download QR (SVG)", "Download QR (PNG, 2048 px)" and "Print". Show a red warning banner when the origin contains `localhost`, `lovableproject.com` or `preview`: "This QR points at a preview address. Open /qr on the published site before printing."

7.11 **Dish photos later** (feature off by default): `src/data/dish-photos.ts` exports `Record<itemId, string>`, empty for now. When an item has an entry, show a 64 px rounded thumbnail on its row that opens a viewer sheet. Do not add any photos now.

7.12 **404 page**: logo, "This page isn't on the menu.", and a "Back to the menu" button.

---

## 8. Routing and URLs
- `/` is the menu, `/qr` the print page, and anything else the 404 page. Use the router that is already in the repo.
- Deep links: `/#section-id` scrolls to that section on load; `/?q=porotta` opens the search; `?src=table` is accepted and ignored.

## 9. SEO, sharing, app install
- `<html lang="en">`. Title: "Arous Al Wadi Restaurant Menu | Al Nahda, Sharjah". Description: "Menu and prices for Arous Al Wadi Restaurant, Bukhara Street, Al Nahda, Sharjah. Breakfast, biriyani, Kerala curries, Chinese, Thattikoottu specials and Happy Hour combos. Free home delivery."
- OG and Twitter tags pointing at `/og-image.jpg` (1200 × 630), `theme-color` `#1F1A17`.
- JSON-LD `Restaurant`: name, `alternateName` (the Arabic name), address (Bukhara Street, Al Nahda, Sharjah, AE), geo, telephone, email, `openingHoursSpecification` (Mo to Su 06:00 to 23:59), `servesCuisine` ["Kerala", "South Indian", "Indo-Chinese"], `priceRange` "AED 1–45", and `hasMenu` → `Menu` → `MenuSection` → `MenuItem` with `offers` in AED for priced items. Generate it from `menu.json`; never write it by hand.
- `manifest.webmanifest`: name "Arous Al Wadi Menu", short_name "Al Wadi Menu", `display: standalone`, background `#1F1A17`, theme `#1F1A17`, icons from `/icons/` (including the maskable one). **No service worker**, so Lovable's preview is not affected by caching.
- `robots.txt` allows `/` and disallows `/qr`.

## 10. Performance and accessibility budgets (mobile, Moto G Power class on slow 4G)
- LCP 2.0 s or less (the hero AVIF is the LCP; preload it with `imagesrcset`), CLS 0.02 or less, INP 150 ms or less. JS 120 kB gzipped or less for `/`.
- Lighthouse mobile scores: Performance 95+, Accessibility 100, Best Practices 100, SEO 100.
- Only the hero image is eager; everything else uses `loading="lazy"` and `decoding="async"`. Do not use `background-image` for the hero.
- Touch targets at least 44 × 44 px; visible `:focus-visible` ring (2 px `--neon` plus a 2 px offset); every colour pair passes WCAG AA; Arabic in `lang="ar" dir="rtl"`. Sheets trap focus and close on Esc; aria labels on the icon buttons ("Add Masala Dosa to your list", "Open section list").
- Works with JavaScript slow or blocked long enough that the menu text is in the first render (the data is bundled, so render it synchronously; no loading spinner for the menu).

## 11. Tests and QA (tests first where a skill supports TDD)
**Unit tests (vitest; add it if it is missing):**
- `menu.json` passes the zod schema. Exactly **218 items**; **252 unique serial numbers** across items and variants; unique `id`s; every price is a positive number, or null with a `priceNote`; every `availableDays` value is valid.
- `dubaiNow()` at fixed UTC instants: Sunday 08:00 Dubai, Friday 23:59, the midnight rollover.
- `isOpen()` at 05:59 and 06:00, and `"24:00"` handling.
- `todaysItems()` for all 7 days. Friday returns only Kallil Chutta Chicken (Pepper); Thursday returns Ghee Rice with Beef Ularth and Kallil Chutta Chicken (Normal).
- `happyHourState()`: Monday 15:59, 16:00, 18:59 and 19:00; Saturday 17:00 is `'off'`.
- `search()`: "briyani" finds every biriyani item; "parotta" finds porotta items; "55" finds Mutton Dum Biriyani; "samosa" finds Samoosa.
- Price formatting: 7 → "7", 2.5 → "2.50", 1.25 → "1.25".

**Browser QA (Playwright or browser MCP):** screenshots saved to `docs/qa/` at **360×780, 390×844, 430×932**, 768×1024 and 1280×800, in light and dark: the hero, the sticky bar after scrolling, the Today panel, the Fried Rice & Noodles section, search for "porotta", the open list sheet, the "Show to staff" screen and `/qr` in print preview. Check: no horizontal scroll at 360; the sticky bar never covers a section title after a chip tap; the bottom bar never covers the last row; no console errors.

**Phase 5 critique:** run the `frontend-design` skill's critique on the screenshots. Fix anything that drifts from §6, then take the screenshots again.

**Data spot-check by hand (write the results in BUILD_LOG):** compare these on screen with `docs/source/*.xlsx`: Masala Dosa 7, Egg Curry 5/7, Omelette 2.50/5, Chapathi (Special) 1.25, Pothi Biriyani Mutton 21, Chatti Choru 17/15/16 on Sunday, Mixed Fried Rice 20/22, Wayanadan Pothin Kaal 45, Ghee Rice Combo 12.50, Soft Drink Chottu 1.50.

## 12. Git workflow (Lovable syncs the default branch)
1. `git checkout -b feat/qr-menu`.
2. Small commits in Conventional Commits style: `chore: audit and tooling`, `feat(data): menu types, schema, tests`, `feat(ui): design tokens and fonts`, `feat(menu): hero, today, sticky nav, list`, `feat(search)`, `feat(list)`, `feat(qr): print page`, `feat(seo): meta, json-ld, manifest`, `test: e2e screenshots`, `docs: editing guide`.
3. Before every push: `build`, `lint` and the tests must all pass. No lockfile churn from a different package manager.
4. Push and open a PR to the default branch with `gh pr create`. In the description: a summary, screenshots (390 px), the Lighthouse scores and the open questions from MENU_DATA_NOTES "Confirm with the restaurant".
5. **Do not merge.** The human merges. Then Lovable pulls `main` automatically. Tell the human not to edit in the Lovable editor while the PR is open, to avoid conflicts.

## 13. Docs to write for future edits through GitHub
- `docs/EDITING.md`, written for a non-developer. It covers: change a price (edit `src/data/menu.json`, keep the number format), mark an item `"soldOut": true` or `"hidden": true`, add a dish (copy the shape of an existing one and give it a unique `id` and `no`), turn on diet markers (`src/config/site.ts`), add a WhatsApp number (`restaurant.whatsapp` as `"9715XXXXXXXX"`), change Happy Hour, add a dish photo (§7.11), and print the QR from `/qr` on the **published** URL. Also how to edit on github.com in the browser: open the file, click the pencil, commit to main, and Lovable updates.
- `CLAUDE.md` at the repo root with the standing rules for future AI sessions: data only in `menu.json`; never edit assets; keep Lovable compatibility (§1); the design tokens (§6); run the tests before pushing.

## 14. Do NOT
- Change any price, name, serial number, day rule or Happy Hour time in `menu.json`, or add the left-out printed-menu items.
- Invent dish descriptions, spice levels, ingredients, allergens, calories, taglines, reviews, ratings, opening years or a WhatsApp number.
- Use stock, AI-generated or Google Maps photos, or treat the food artwork as photos of specific dishes.
- Upscale, recolour, re-encode or crop the supplied images in code (CSS `object-fit`/`object-position` is fine).
- Add a backend, auth, payments, online ordering, a service worker, analytics scripts or cookie banners.
- Switch frameworks, routers, package managers or Tailwind versions, or remove `lovable-tagger`.
- Render `source` or `confirm`.
- Use any of the design tells listed at the end of §6.

## 15. Definition of done and final report
Done means: all of §7 works; the §11 tests pass; the screenshots are in `docs/qa/`; the budgets in §10 are met (or you explain exactly which one missed and why); the PR is open; `docs/BUILD_LOG.md` has the skills table, audit, decisions and spot-checks; `docs/EDITING.md` and `CLAUDE.md` exist.

Reply with: the PR link; a 5-line summary; test results; Lighthouse scores; skills and plugins used (and the ones skipped, with reasons); every deviation from this prompt with its reason; and the restaurant questions still open.
