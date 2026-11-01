# Build log: Arous Al Wadi QR menu

Built from `docs/BUILD_PROMPT.md` in a Claude Code cloud session on 1 Nov 2026.

## Phase 0: skills, plugins and MCP servers in this session

| name                                                                                                                                         | type          | use or skip    | phase  | reason                                                                                                                                                                                        |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | -------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `frontend-design`                                                                                                                            | skill         | not installed  | 5      | §6 is already the approved design. The critique pass was done by hand against §6 (see Phase 5 below).                                                                                         |
| superpowers (`writing-plans`, `test-driven-development`, `systematic-debugging`, `verification-before-completion`, `requesting-code-review`) | plugin skills | not installed  | 1, 11  | Followed the same practice by hand: task plan, unit tests for the pure libraries before the UI, QA script before sign-off.                                                                    |
| Playwright (pre-installed library, not an MCP server)                                                                                        | tool          | use            | 11     | Screenshots in `docs/qa/`, interaction checks (chip taps, list, staff screen, print media), data spot-check.                                                                                  |
| Lighthouse 12.8 (installed in the scratchpad, not in the repo)                                                                               | tool          | use            | 10, 11 | Mobile scores.                                                                                                                                                                                |
| Chrome DevTools / browser MCP, `webapp-testing`                                                                                              | MCP / skill   | not installed  | 11     | Playwright covered it.                                                                                                                                                                        |
| context7 or another docs MCP                                                                                                                 | MCP           | not installed  | 1      | Read the installed packages' own `package.json` exports and types instead.                                                                                                                    |
| `github`                                                                                                                                     | MCP server    | use            | 12     | Branch push and pull request. (`gh` CLI is not available in this environment.)                                                                                                                |
| `Lovable`                                                                                                                                    | MCP server    | use, read-only | 1      | Read the scaffold files of an existing TanStack Start project in the same workspace, because this repo had no `src/` (see audit). No messages sent to the Lovable agent, so no credits spent. |
| `claude-code-remote`                                                                                                                         | MCP server    | skip           | n/a    | Session management; not needed.                                                                                                                                                               |
| `Claude_Docs`                                                                                                                                | MCP server    | skip           | n/a    | Docs live in the repo as Markdown.                                                                                                                                                            |
| `code-review`                                                                                                                                | skill         | use            | 12     | Run on the final diff before the PR.                                                                                                                                                          |
| `security-review`                                                                                                                            | skill         | use            | 12     | Run on the final diff before the PR.                                                                                                                                                          |
| `simplify`                                                                                                                                   | skill         | skip           | n/a    | `code-review` covers it.                                                                                                                                                                      |
| `run`                                                                                                                                        | skill         | skip           | 11     | The QA server was started by hand (Nitro Node preset, see below).                                                                                                                             |
| `anthropic-skills:xlsx`                                                                                                                      | skill         | skip           | 11     | Spot-check needed one read of the sheet; `openpyxl` did it directly.                                                                                                                          |
| `artifact-design`, `artifact-capabilities`, `artifact-diagramming`, `dataviz`                                                                | skills        | skip           | n/a    | No artifact or chart is part of this build.                                                                                                                                                   |
| `docs`, `docx`, `pdf`, `pptx`, `google-workspace`                                                                                            | skills        | skip           | n/a    | No documents outside the repo.                                                                                                                                                                |
| `deep-research`, `skill-creator`, `setup-writing-style`, `import-memory`, `morning`, `file-organizer`                                        | skills        | skip           | n/a    | Not relevant.                                                                                                                                                                                 |
| `built-in-browser`, `chrome-browser`, `computer-use`                                                                                         | skills        | skip           | n/a    | Cloud session; headless Playwright used instead.                                                                                                                                              |
| `init`, `session-start-hook`, `update-config`, `keybindings-help`, `fewer-permission-prompts`, `loop`, `plugin-authoring`, `claude-api`      | skills        | skip           | n/a    | Not relevant. `CLAUDE.md` was written by hand to §13.                                                                                                                                         |
| Image skills                                                                                                                                 | n/a           | not needed     | n/a    | Assets are final (`docs/ASSETS.md`). Nothing was re-encoded.                                                                                                                                  |

## Phase 1: repo audit

| Item                     | Finding                                                                                                                                                                                                                                                              |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repo state               | One commit ("Add files via upload") with root config only: `package.json`, `bun.lock`, `vite.config.ts`, `tsconfig.json`, `components.json`, `eslint.config.js`, `bunfig.toml`, `.env`. **No `src/` directory and no `index.html`.**                                 |
| Framework and router     | **TanStack Start** (`@tanstack/react-start` 1.167, `@tanstack/react-router` 1.168, file routes in `src/routes/`), React 19, Vite 8. Not React Router. Kept as is.                                                                                                    |
| Vite config              | `@lovable.dev/vite-tanstack-config` 2.6.2, which already includes `tanstackStart`, React, Tailwind, tsconfig paths, Nitro (Cloudflare `cloudflare-module` preset for builds) and `componentTagger` (lovable-tagger, dev only). `vite.config.ts` was **not changed**. |
| Package manager          | **bun** (`bun.lock`, `bunfig.toml` with a 24 h minimum release age). No other lockfile was added.                                                                                                                                                                    |
| Tailwind                 | **v4** (`tailwindcss` 4.2, `@tailwindcss/vite`), tokens with `@theme` in `src/styles.css` (the file `components.json` points at).                                                                                                                                    |
| shadcn/ui                | `components.json` present (new-york, lucide), but **no `src/components/ui/*` files** existed.                                                                                                                                                                        |
| Path alias               | `@/*` → `./src/*` (tsconfig). Dev port and host come from the Lovable config.                                                                                                                                                                                        |
| Scripts                  | `dev`, `build`, `build:dev`, `preview`, `lint`, `format` kept. Added `test` (`vitest run`).                                                                                                                                                                          |
| Untouched scaffold build | Could not pass: there was no `src/`, so there was nothing to build.                                                                                                                                                                                                  |
| Supabase                 | `@supabase/supabase-js` and a `.env` with Supabase keys came with the scaffold. Left in place and **not used** anywhere (no backend, per §1).                                                                                                                        |

### Scaffold files created (copied from Lovable's TanStack Start template)

Because `src/` was missing, the Lovable template files were read (read-only) from another TanStack Start project in the same Lovable workspace and recreated: `src/router.tsx`, `src/server.ts`, `src/routes/__root.tsx`, `src/lib/error-capture.ts`, `src/lib/error-page.ts`, `src/lib/lovable-error-reporting.ts`, `src/lib/utils.ts`, `src/routes/README.md`. `src/routeTree.gen.ts` is generated by the router plugin on build and committed, as Lovable does.

### Environment notes (this session only, nothing committed)

- `bun.lock` pins 10 packages to Lovable's private npm mirror (`europe-*-npm.pkg.dev`), which this cloud session cannot reach. The same versions with **the same integrity hashes** were installed from registry.npmjs.org for local work, and the mirror URLs were put back in `bun.lock` before committing. `bun install --frozen-lockfile` passes on the committed lockfile.
- `vite preview` cannot serve the Cloudflare build, so local QA used `NITRO_PRESET=node-server bun run build` (an environment variable only, no config change) and a small gzip proxy to stand in for Cloudflare's compression.

## Decisions and deviations

| What                     | Prompt said                 | Done                                                          | Why                                                                                                                                                    |
| ------------------------ | --------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `index.html` at the root | Keep it                     | Not applicable                                                | TanStack Start renders the HTML shell from `src/routes/__root.tsx`; there is no `index.html` in this stack.                                            |
| `src/start.ts`           | (template has one)          | Left out                                                      | The installed `@tanstack/react-start` does not export `createCsrfMiddleware`, and this app has no server functions, so Start's defaults apply.         |
| Branch                   | `feat/qr-menu`              | `claude/new-session-14hlhz`                                   | This session is required to develop and push on that branch.                                                                                           |
| PR command               | `gh pr create`              | GitHub MCP                                                    | `gh` is not available in this environment.                                                                                                             |
| Bottom sheets            | shadcn `Drawer`/`Sheet`     | Own `Sheet` on Radix Dialog (`src/components/menu/Sheet.tsx`) | `vaul` (Drawer) added ~12 kB gzipped to `/`. Radix Dialog gives the same focus trap, Esc and focus return, and was already needed for "Show to staff". |
| Active chip              | Filled `--neon`, white text | `--neon` fill, `--facade` text                                | White on `#F57716` is 2.8:1 and fails AA. `--facade` on neon is 6.2:1.                                                                                 |
| Primary button red       | `--brand-red`               | `--brand-red-deep` `#C8161F` for buttons with white text      | White on `#EC1D27` is 4.4:1 (fails AA at 17 px). `#C8161F` is 5.9:1. `--brand-red` is still used for titles (large text, passes).                      |
| Gold item numbers        | `--gold`                    | `--gold-ink` `#8A6A12` on light backgrounds                   | `#CA9619` on white is 2.7:1. Gold stays for hairlines and on the dark staff screen (6.5:1).                                                            |
| Muted text in dark mode  | (not given)                 | `#B5A99C`                                                     | 7.5:1 on the facade.                                                                                                                                   |
| Search results headings  | Section titles 32           | 32 (level 3) for every result section                         | Long titles at 44 px wrapped to 3 lines on a 360 px phone.                                                                                             |
| Prettier on `menu.json`  | n/a                         | `src/data/menu.json` added to `.prettierignore`               | So a `bun run format` can never touch the data file.                                                                                                   |
| Sticky bar               | white                       | `--bg` (white in light, facade in dark)                       | Follows the dark theme.                                                                                                                                |
| `og:image` URL           | `/og-image.jpg`             | Relative `/og-image.jpg`                                      | The published domain is not known yet. WhatsApp and most scrapers resolve it; set an absolute URL once the domain is fixed.                            |

## Phase 5: critique pass (by hand, against §6)

Checked the screenshots in `docs/qa/` against §6. Fixed:

1. List rows were 68 px tall; tightened to the 52 px minimum.
2. Scroll-spy marked the previous section after a chip tap (Mutton showed "Beef"). Now uses a thin band under the sticky bar and picks the last section in it. Verified for 5 sections at all 5 sizes.
3. Phone numbers ran together on the QR card (spaces collapsed). Now spaced as separate items.
4. Long section titles in search wrapped to 3 lines at 44 px; search uses 32 px.
5. The Arabic name in "Visit us" was right-aligned away from the column; now left-aligned like the hero.
6. Removed a translucent blur on the sticky bar (plain `--bg`).

Checked and left as is: no all-caps labels, no middle-dot strings, no monospace, no arrows on buttons, no card grid, no cream background, no emoji, no stock photos, no taglines, no dish descriptions.

## Phase 11: tests and QA

- **Unit tests:** `bun run test`, 3 files, 37 tests, all pass (menu data contract, time logic, search, price formatting).
- **Lint and types:** `bun run lint` clean, `tsc --noEmit` clean.
- **Build:** `bun run build` passes (Cloudflare preset).
- **Browser QA** (`docs/qa/`, 5 sizes × light and dark, 12 shots each, plus `qa-report.json`):
  - No horizontal scroll at any size (including 360).
  - After a chip tap, the section title is always below the sticky bar (checked for Fried Rice & Noodles, Mutton, Combos, Drinks, Breakfast).
  - The bottom bar never covers the last content.
  - Console: no errors apart from the deliberate 404 request on `/does-not-exist`.
  - Your list: Masala Dosa × 2, Egg Curry (Double), Pothi Biriyani (Mutton) → "Approx. total AED 42"; staff screen shows 1, 17 and 64 as serial numbers.

### Data spot-check (on screen vs `docs/source/WADI_Menu_Modified_2026_25092026.xlsx`)

| Item                  | Sheet         | On screen                                    | Match |
| --------------------- | ------------- | -------------------------------------------- | ----- |
| Masala Dosa           | 7             | 7                                            | yes   |
| Egg Curry             | 5.00 / 7.00   | Single 5, Double 7                           | yes   |
| Omelette              | 2.50 / 5.00   | Single 2.50, Double 5                        | yes   |
| Chapathi SP           | 1.25          | Chapathi (Special) 1.25                      | yes   |
| Pothibiriyani Mutton  | 21            | Pothi Biriyani, Mutton 21                    | yes   |
| Chatti Choru (Sunday) | 17 / 15 / 16  | Fish 17, Chicken 15, Beef 16, tagged Sundays | yes   |
| Fried Rice Mixed      | 20.00 / 22.00 | Mixed Fried Rice, Normal 20, Schezwan 22     | yes   |
| Wayanadan Pothin Kaal | 45            | 45                                           | yes   |
| Ghee Rice Combo       | 12.5          | 12.50                                        | yes   |
| Soft Drinks Chottu    | 1.5           | Soft Drink, Chottu 1.50                      | yes   |

### Lighthouse (mobile, simulated Moto G Power on slow 4G, gzip on)

| Page  | Performance | Accessibility                                      | Best Practices | SEO                      |
| ----- | ----------- | -------------------------------------------------- | -------------- | ------------------------ |
| `/`   | 92          | 100                                                | 100            | 100                      |
| `/qr` | 91          | 100 after fixing one low-contrast note (96 before) | 100            | 66 (intended: `noindex`) |

`/`: LCP 3.0 to 3.1 s across runs, FCP 2.0 s, CLS 0, TBT 20 to 60 ms.

### Budgets missed, and why

- **LCP 3.0 to 3.1 s (budget 2.0 s) and Performance 92 (budget 95).** The hero AVIF is preloaded, discoverable, `fetchpriority="high"` and not lazy; the time goes on bandwidth under slow-4G simulation, where the 68 kB hero image shares the line with ~130 kB of JavaScript. Removing the font preloads made no difference (tested). Making the image smaller would mean re-encoding the supplied assets, which §14 forbids.
- **JS 133 kB gzipped for `/` (budget 120 kB).** React 19 plus TanStack Start and Router is ~110 kB before any app code; the menu data is ~9 kB of that and the rest is the UI. Already removed `vaul` and `tailwind-merge` from the page (saved ~27 kB). Getting under 120 kB would need a framework change, which §1 and §14 forbid.
- **`/qr` CLS 0.13.** Comes from the preview-address warning banner appearing after the origin is read in the browser. It only shows on preview addresses, and the page is a staff tool.

## Addendum, 1 Nov 2026: WhatsApp delivery orders

Requested by the owner after the first PR: customers in the delivery area pick their building and send the order to the restaurant's WhatsApp.

- `restaurant.whatsapp` set to `971506539192` (050 653 9192), confirmed by the owner. This is the only change to `menu.json`.
- `src/data/delivery-buildings.json`: the 76 buildings from `docs/source/Al_Nahda_Highlighted_Area_Building_Register.xlsx`, sorted A to Z, with their street. Street labels shortened where the register gave two ("Bukhara Street / Al Nahda Street" → "Bukhara Street"; "Al Nahda / near Nahda Roundabout" → "Near Al Nahda Roundabout"). The register itself says every row still "needs precise boundary check", so "My building isn't listed" lets customers type theirs.
- Your list → **Order for delivery** → building search (or free text), flat / office number (required), floor, name and notes (optional) → **Send order on WhatsApp** opens `wa.me` with the order written out (serial numbers, options, quantities, approximate total, address). The customer presses send in WhatsApp; the site posts nothing. When the restaurant is closed, a note says so.
- The address (not the notes) is remembered on the phone (`localStorage` key `aaw:delivery:v1`, wrapped in try/catch).
- "Call to order" sheet gained a "Message us on WhatsApp" row.
- Deviation from §14 ("no online ordering"): the owner asked for this. It stays a WhatsApp message with no backend and no payment.
- JS for `/` is now about 136 kB gzipped (was 133 kB): the building list and the delivery form.
- Tests: `src/test/delivery.test.ts` (building data, search, validation, message text, link). Screenshots `docs/qa/390x844-*-13/14/15-*.jpg`.
