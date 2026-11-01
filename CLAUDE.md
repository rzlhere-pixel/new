# CLAUDE.md: standing rules for this repo

QR-code menu for **Arous Al Wadi Restaurant** (Al Nahda, Sharjah). Diners open it on their phones at the table. Lovable project, synced to GitHub on `main`. Mobile first; larger screens must not break.

Read `AGENTS.md` too: never force-push or rewrite pushed history on the Lovable-connected branch.

## Data

- **All menu content lives in `src/data/menu.json`**: dishes, prices, serial numbers, day rules, Happy Hour, restaurant details. Never put a dish name, price or copy about dishes in a component.
- Never add, remove, rename or reprice anything in `menu.json` unless the human asks for that exact change. Never add the printed-menu items listed as left out in `docs/MENU_DATA_NOTES.md`.
- `source` and `confirm` are internal. Never render them.
- `hidden: true` → not rendered. `soldOut: true` → muted, "Not available today", no Add button.
- `menu.json` is in `.prettierignore`; keep it that way.
- Types: `src/data/menu.types.ts`. Schema: `src/data/menu.schema.ts` (zod, tests and dev only).
- Never invent descriptions, ingredients, spice levels, allergens, ratings, taglines or a WhatsApp number.

## Assets

- `public/brand`, `public/photos`, `public/food`, `public/icons`, favicons and `og-image.jpg` are final. Never re-encode, upscale, recolour, crop or regenerate them. CSS `object-fit`/`object-position` is fine.
- Food artwork is from the printed menus, not photos of specific dishes. Use it only as small section marks.
- Real dish photos go in `public/food/dish/<item-id>.webp` and are listed in `src/data/dish-photos.ts`.

## Lovable compatibility

- Stack: TanStack Start + TanStack Router (file routes in `src/routes/`), React 19, Vite 8, Tailwind v4 (`@theme` in `src/styles.css`), bun.
- Keep `vite.config.ts` as is (`@lovable.dev/vite-tanstack-config` already adds React, Tailwind, tsconfig paths, Nitro and lovable-tagger; adding them again breaks the build).
- Keep `src/routes/__root.tsx` (shell, head tags, 404) with its `<Outlet />`, `src/router.tsx`, `src/server.ts`, the `@/` alias, and the `dev`/`build`/`preview`/`lint`/`test` scripts.
- `src/routeTree.gen.ts` is generated; don't edit it.
- No backend, no Supabase usage, no auth, no payments, no online ordering, no service worker, no analytics, no cookie banner. Static data only.
- Use bun only; never add another lockfile. `bun.lock` pins some packages to Lovable's npm mirror; keep those URLs.

## Design tokens (BUILD_PROMPT §6)

| Token                           | Hex                               | Use                                                                              |
| ------------------------------- | --------------------------------- | -------------------------------------------------------------------------------- |
| `--facade`                      | `#1F1A17`                         | Hero base, footer, staff screen, dark background                                 |
| `--neon`                        | `#F57716`                         | Active chip (with `--facade` text), Today tag, focus ring                        |
| `--brand-red`                   | `#EC1D27`                         | Titles only (large text)                                                         |
| `--brand-red-deep`              | `#C8161F`                         | Buttons with white text (AA)                                                     |
| `--gold`                        | `#CA9619`                         | Hairlines at 35% (30% dark); `--gold-ink` `#8A6A12` for small gold text on white |
| `--ghee`                        | `#FFF2CC`                         | Today / Happy Hour panel (dark: `#33290F`)                                       |
| `--paper` / `--ink` / `--muted` | `#FFFFFF` / `#2A2420` / `#6E645C` | Background, body text, secondary text                                            |
| `--veg` / `--nonveg`            | `#1E7B34` / `#8A2B1E`             | Diet markers (off until confirmed)                                               |

- Type: Big Shoulders Display 800 for titles (Title Case, never all caps, never under 24 px); Readex Pro for text (17 px body, 14 px small, prices 600 tabular).
- One motion moment: the hero "sign switches on" at load. Everything else moves only when the user acts. Respect `prefers-reduced-motion`.
- Do not add: all-caps eyebrow labels, middle-dot meta strings, monospace labels, `→` on buttons, gradient washes behind content, card grids with grey shadows, one radius everywhere, cream backgrounds, terracotta, emoji, stock/AI photos, taglines, reviews.
- Touch targets ≥ 44 px; every colour pair passes WCAG AA.

## Before pushing

```bash
bun run test     # vitest: data contract, time, search, formatting
bun run lint
bun run build
```

All three must pass. Restaurant time is always Asia/Dubai (`src/lib/time.ts`).
