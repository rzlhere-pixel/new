import { useEffect, useRef, useState } from "react";
import { Menu as MenuIcon, Search, X } from "lucide-react";
import { menu, visibleItems } from "@/data/menu";
import { CHIP_LABELS } from "@/config/site";
import { scrollToId } from "@/lib/scroll";
import { clsx as cn } from "clsx";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "./Sheet";
import { Logo } from "./Picture";

export const SECTIONS = menu.groups.flatMap((g) =>
  g.sections.filter((s) => visibleItems(s).length).map((s) => ({ section: s, group: g })),
);

export function StickyNav({
  query,
  onQuery,
  heroRef,
}: {
  query: string;
  onQuery: (q: string) => void;
  heroRef: React.RefObject<HTMLElement | null>;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const chipRowRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string>(SECTIONS[0]?.section.id ?? "");
  const [stuck, setStuck] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const searching = query.trim().length > 0;

  // Publish the bar height so anchors land below it (scroll-margin-top).
  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const set = () =>
      document.documentElement.style.setProperty("--sticky-h", `${el.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Show the compact logo once the hero has scrolled away.
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting), {
      rootMargin: "0px 0px 0px 0px",
    });
    io.observe(hero);
    return () => io.disconnect();
  }, [heroRef]);

  // Scroll-spy: the active chip follows the section whose top has reached a thin
  // band just under the sticky bar (the last one in that band wins).
  useEffect(() => {
    if (searching) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-spy]"));
    const inBand = new Set<string>();
    let io: IntersectionObserver | undefined;
    const observe = () => {
      io?.disconnect();
      inBand.clear();
      const barH = barRef.current?.offsetHeight ?? 112;
      const below = Math.max(0, window.innerHeight - barH - 48);
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) inBand.add(e.target.id);
            else inBand.delete(e.target.id);
          }
          const last = els.filter((el) => inBand.has(el.id)).pop();
          if (last) setActive(last.id);
        },
        { rootMargin: `-${barH}px 0px -${below}px 0px` },
      );
      els.forEach((el) => io!.observe(el));
    };
    observe();
    window.addEventListener("resize", observe);
    return () => {
      io?.disconnect();
      window.removeEventListener("resize", observe);
    };
  }, [searching]);

  // Keep the active chip in view without moving the page.
  useEffect(() => {
    const row = chipRowRef.current;
    const chip = row?.querySelector<HTMLElement>(`[data-chip="${active}"]`);
    if (!row || !chip) return;
    const left = chip.offsetLeft - row.clientWidth / 2 + chip.offsetWidth / 2;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    row.scrollTo({ left, behavior: reduce ? "auto" : "smooth" });
  }, [active]);

  const goTo = (id: string) => {
    if (searching) onQuery("");
    setActive(id);
    requestAnimationFrame(() => scrollToId(id));
  };

  return (
    <div ref={barRef} className="sticky top-0 z-30 border-b border-rule bg-bg">
      <div className="mx-auto max-w-[640px] px-5">
        <div className="flex items-center gap-2 pt-2">
          <div
            aria-hidden={!stuck}
            className={cn(
              "shrink-0 overflow-hidden transition-[width,opacity] duration-200",
              stuck ? "w-[75px] opacity-100" : "w-0 opacity-0",
            )}
          >
            <a
              href="#top"
              tabIndex={stuck ? 0 : -1}
              aria-label="Back to the top"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0 });
              }}
            >
              <Logo
                name="logo-horizontal"
                adaptive
                width={75}
                height={28}
                alt=""
                className="h-7 w-[75px]"
              />
            </a>
          </div>
          <form
            role="search"
            className="relative min-w-0 flex-1"
            onSubmit={(e) => {
              e.preventDefault();
              (document.activeElement as HTMLElement | null)?.blur();
            }}
          >
            <label htmlFor="menu-search" className="sr-only">
              Search dishes
            </label>
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-muted"
            />
            <input
              id="menu-search"
              type="search"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="Search dishes"
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") onQuery("");
              }}
              className="h-11 w-full appearance-none rounded-full border border-line bg-chip pr-11 pl-10 text-[17px] text-fg placeholder:text-muted focus:outline-none focus-visible:outline-2 focus-visible:outline-neon [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => onQuery("")}
                aria-label="Clear search"
                className="absolute top-0 right-0 inline-flex size-11 items-center justify-center rounded-full text-muted"
              >
                <X aria-hidden className="size-[18px]" />
              </button>
            )}
          </form>
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            aria-label="Open section list"
            className="-mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-fg"
          >
            <MenuIcon aria-hidden className="size-6" />
          </button>
        </div>
        <nav aria-label="Menu sections">
          <div ref={chipRowRef} className="chip-row -mx-5 flex gap-2 overflow-x-auto px-5 py-2">
            {SECTIONS.map(({ section }) => {
              const on = !searching && active === section.id;
              return (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  data-chip={section.id}
                  aria-current={on ? "true" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    goTo(section.id);
                  }}
                  className={cn(
                    "inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-[15px] font-medium whitespace-nowrap transition-colors",
                    on ? "bg-neon text-facade" : "bg-chip text-chip-fg",
                  )}
                >
                  {CHIP_LABELS[section.id] ?? section.title}
                </a>
              );
            })}
          </div>
        </nav>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent aria-describedby="sections-desc">
          <SheetHeader>
            <SheetTitle>Sections</SheetTitle>
            <SheetDescription id="sections-desc" className="sr-only">
              Jump to a part of the menu
            </SheetDescription>
          </SheetHeader>
          <nav aria-label="All sections" className="safe-bottom overflow-y-auto px-5 pb-4">
            {menu.groups.map((g) => {
              const secs = g.sections.filter((s) => visibleItems(s).length);
              if (!secs.length) return null;
              const single = secs.length === 1;
              return (
                <div key={g.id} className="border-b border-line py-2 last:border-b-0">
                  {!single && (
                    <p className="pt-1 text-[14px] leading-[1.4] font-medium text-muted">
                      {g.title}
                    </p>
                  )}
                  <ul>
                    {secs.map((s) => (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSheetOpen(false);
                            // Wait for the sheet to release the page before scrolling.
                            window.setTimeout(() => goTo(s.id), 320);
                          }}
                          className={cn(
                            "flex min-h-11 w-full items-center text-left text-[17px]",
                            single ? "font-medium" : "pl-3",
                          )}
                        >
                          {s.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
