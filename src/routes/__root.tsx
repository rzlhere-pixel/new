import {
  Outlet,
  Link,
  createRootRoute,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import readexLatin from "@fontsource-variable/readex-pro/files/readex-pro-latin-wght-normal.woff2?url";
import shouldersLatin from "@fontsource/big-shoulders-display/files/big-shoulders-display-latin-800-normal.woff2?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Logo } from "../components/menu/Picture";

const TITLE = "Arous Al Wadi Restaurant Menu | Al Nahda, Sharjah";
const DESCRIPTION =
  "Menu and prices for Arous Al Wadi Restaurant, Bukhara Street, Al Nahda, Sharjah. Breakfast, biriyani, Kerala curries, Chinese, Thattikoottu specials and Happy Hour combos. Free home delivery.";

function NotFoundComponent() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-bg px-5">
      <div className="max-w-sm text-center">
        <Logo
          name="logo-stacked-480"
          adaptive
          width={168}
          height={181}
          alt="Arous Al Wadi Restaurant"
          eager
          className="mx-auto h-auto w-[168px]"
        />
        <h1 className="display mt-8 text-[32px] leading-[1.05] text-title">
          This page isn't on the menu.
        </h1>
        <Link
          to="/"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-brand-red-deep px-6 text-[17px] font-semibold text-white"
        >
          Back to the menu
        </Link>
      </div>
    </main>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <main className="flex min-h-svh items-center justify-center bg-bg px-5">
      <div className="max-w-sm text-center">
        <h1 className="display text-[32px] leading-[1.05] text-title">This page didn't load</h1>
        <p className="mt-2 text-muted">
          Something went wrong. Try again, or open the menu from the start.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex h-12 items-center justify-center rounded-full bg-brand-red-deep px-6 text-[17px] font-semibold text-white"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-full border-2 border-fg/80 px-6 text-[17px] font-semibold"
          >
            Back to the menu
          </a>
        </div>
      </div>
    </main>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "theme-color", content: "#1F1A17" },
      { property: "og:type", content: "restaurant.restaurant" },
      { property: "og:site_name", content: "Arous Al Wadi Restaurant" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: "/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Arous Al Wadi Restaurant shop front at night" },
      { property: "og:locale", content: "en_AE" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: "/og-image.jpg" },
    ],
    links: [
      {
        rel: "preload",
        href: readexLatin,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        href: shouldersLatin,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  // Required: nested routes render here. Removing <Outlet /> breaks all child routes.
  return <Outlet />;
}
