# Asset manifest

Every file is final and web-optimised. Do not re-encode, upscale, recolour, regenerate or "enhance" any of them in code or with AI tools.

## Brand (`public/brand/`), transparent PNG + WebP

Rebuilt from the vector-quality layers inside `al_wadi__1.pdf` (2744 × 3811 px source), not from screenshots. Brand colours were sampled from these layers.

| File | Use |
|---|---|
| `logo-stacked-white-480.webp` | Hero, over the dark photo gradient |
| `logo-stacked-480.webp` | Light backgrounds: QR print page, footer, 404 |
| `logo-horizontal(-white).webp` (643 × 240) | Compact sticky header after the hero scrolls away |
| `logo-icon(-white)-360.webp` | Pot with steam and the Malayalam line തട്ടിക്കൂട്ട് |
| `potmark(-white)-300.webp` | Pot and steam only, for small marks and loaders |
| `wordmark(-white)-800.webp` | "AROUS / AL WADI RESTAURANT" only |
| Full-size versions without a width suffix | Print (QR table tent and poster) |

Brand colours (exact pixel values from the logo):
- Wordmark red `#EC1D27`
- Steam and Malayalam red `#EC1D2F`
- Pot orange `#F57716`
- Underline gold `#CA9619`

## App icons

| File | Notes |
|---|---|
| `public/favicon.ico` (16, 32, 48), `public/favicon-32.png` | White pot and lid on brand red; strokes thickened so it reads at 16 px |
| `public/apple-touch-icon.png` (180) | White pot and steam on brand red, like the round sign on the shop front |
| `public/icons/icon-192.png`, `icon-512.png` | Web app manifest |
| `public/icons/icon-maskable-512.png` | Maskable icon, artwork inside the 80% safe zone |

## Photos (`public/photos/`): real shop-front photos, retouched

Edits: crop, light denoise, shadow lift that protects the neon highlights, gentle local contrast, vibrance, sharpening after resize. Nothing was added or removed except a passer-by's face, which was blurred. Every photo has AVIF + WebP at each width, plus a JPG fallback at the largest width.

| Base name | Widths | Ratio | Source and crop | Use |
|---|---|---|---|---|
| `storefront-corner` | 480, 720, 840 | 2:3 | Corner shot. Bin and blurred van removed by the crop | **Mobile hero** (`object-position: 50% 35%`) |
| `storefront-front` | 960, 1440, 1980 | 2.66:1 | Front shot, cropped below the neighbour's TO LET banner; passer-by's face blurred | Hero at 768 px and wider, plus the "Visit us" band |
| `storefront-reflection` | 480, 580 | 4:5 | Reflection shot. Neighbour's "34" sign, TO LET banner and black bar removed; the source's heavy yellow filter toned down | Optional second image in "Visit us" |
| `public/og-image.jpg` | 1200 × 630 | 1.9:1 | Front shot, same retouch | Open Graph and WhatsApp link preview |

Not used: the evening front shot (`535d0747`). It shows the same view as the front shot at lower resolution, and three readable number plates.

## Food artwork (`public/food/`): cut from the restaurant's existing printed menus

These are the food pictures already used in the flyer and A4 menus. They are **artwork, not photos of this kitchen's plates**, so they are only used as small section marks and are never labelled as a specific dish.

| File | Max display size (CSS px) | Assigned to |
|---|---|---|
| `biryani-handi-620` | 300 | `lunch` section mark |
| `bone-in-leg-480` | 240 | Spare (QR print tent decoration) |
| `kizhi-porotta-267` | 120 | `thattikoottu-special` section mark |
| `fried-rice-128`, `noodles-128`, `schezwan-fried-rice-128`, `schezwan-noodles-128` | 64 (round, transparent) | `fried-rice-noodles` section mark (show the four as a small cluster) |

Real photos of dishes can be added later as `public/food/dish/<item-id>.webp` (square, 800 px or larger). The app shows them when the file is listed in `src/data/dish-photos.ts`; see BUILD_PROMPT §7.11.
