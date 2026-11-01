# Routes

TanStack Start uses **file-based routing**. Every `.tsx` file in this directory
defines a route. Do **not** create `src/pages/` or `app/layout.tsx`. The only
root layout is `src/routes/__root.tsx`.

| File         | URL                                                         |
| ------------ | ----------------------------------------------------------- |
| `index.tsx`  | `/` the menu                                                |
| `qr.tsx`     | `/qr` printable QR cards and poster (not linked, `noindex`) |
| `__root.tsx` | app shell, head tags and the 404 page; keep `<Outlet />`    |

`routeTree.gen.ts` is auto-generated. Don't edit it by hand.
