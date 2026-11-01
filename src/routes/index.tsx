import { useCallback, useDeferredValue, useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { menu } from "@/data/menu";
import type { Item } from "@/data/menu.types";
import { DISH_PHOTOS } from "@/data/dish-photos";
import { restaurantJsonLd } from "@/lib/jsonld";
import { useDubaiNow } from "@/lib/use-now";
import { Hero } from "@/components/menu/Hero";
import { TodayPanel } from "@/components/menu/TodayPanel";
import { StickyNav } from "@/components/menu/StickyNav";
import { MenuList } from "@/components/menu/MenuList";
import { SearchResults } from "@/components/menu/SearchResults";
import { BottomBar } from "@/components/menu/BottomBar";
import { VisitUs } from "@/components/menu/VisitUs";
import { OptionSheet, PhotoSheet } from "@/components/menu/OptionSheet";
import { MenuActionsContext } from "@/components/menu/actions";

interface MenuSearch {
  q?: string;
}

const HERO_MOBILE =
  "/photos/storefront-corner-480.avif 480w, /photos/storefront-corner-720.avif 720w, /photos/storefront-corner-840.avif 840w";
const HERO_WIDE =
  "/photos/storefront-front-960.avif 960w, /photos/storefront-front-1440.avif 1440w, /photos/storefront-front-1980.avif 1980w";

export const Route = createFileRoute("/")({
  // `?src=table` (from the QR code) is accepted and ignored.
  validateSearch: (search: Record<string, unknown>): MenuSearch =>
    typeof search.q === "string" && search.q.trim() ? { q: search.q } : {},
  head: () => ({
    links: [
      {
        rel: "preload",
        as: "image",
        type: "image/avif",
        imageSrcSet: HERO_MOBILE,
        imageSizes: "100vw",
        media: "(max-width: 767px)",
        fetchPriority: "high",
      },
      {
        rel: "preload",
        as: "image",
        type: "image/avif",
        imageSrcSet: HERO_WIDE,
        imageSizes: "100vw",
        media: "(min-width: 768px)",
        fetchPriority: "high",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(restaurantJsonLd(menu)),
      },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const { q = "" } = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const now = useDubaiNow();
  const heroRef = useRef<HTMLElement>(null);
  const [query, setQuery] = useState(q);
  const deferredQuery = useDeferredValue(query);
  const [optionItem, setOptionItem] = useState<Item | null>(null);
  const [photoItem, setPhotoItem] = useState<Item | null>(null);

  // Keep ?q= in the URL without adding history entries.
  useEffect(() => {
    const t = window.setTimeout(() => {
      const next = query.trim() ? query : undefined;
      if (next === (q || undefined)) return;
      void navigate({ search: next ? { q: next } : {}, replace: true, resetScroll: false });
    }, 250);
    return () => window.clearTimeout(t);
  }, [query, q, navigate]);

  // Deep link: /#section-id scrolls there once the page is ready.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const el = document.getElementById(id);
    if (el) requestAnimationFrame(() => el.scrollIntoView({ block: "start" }));
  }, []);

  const clearSearch = useCallback(() => setQuery(""), []);
  const searching = deferredQuery.trim().length > 0;

  return (
    <MenuActionsContext.Provider value={{ chooseOption: setOptionItem, showPhoto: setPhotoItem }}>
      <div id="top" />
      <Hero ref={heroRef} now={now} />
      <TodayPanel now={now} onNavigate={clearSearch} />
      <div className="h-5" />
      <StickyNav query={query} onQuery={setQuery} heroRef={heroRef} />
      <main className="mx-auto max-w-[640px] px-5">
        {searching ? <SearchResults query={deferredQuery} now={now} /> : <MenuList now={now} />}
      </main>
      <VisitUs />
      <BottomBar />
      <OptionSheet item={optionItem} onClose={() => setOptionItem(null)} />
      <PhotoSheet
        item={photoItem}
        src={photoItem ? DISH_PHOTOS[photoItem.id] : undefined}
        onClose={() => setPhotoItem(null)}
      />
    </MenuActionsContext.Provider>
  );
}
