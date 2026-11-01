import { forwardRef } from "react";
import { menu } from "@/data/menu";
import { formatClock, isOpen, type DubaiNow } from "@/lib/time";
import { clsx as cn } from "clsx";
import { Logo } from "./Picture";

export const HERO_ALT = "Arous Al Wadi Restaurant shop front at night, Al Nahda, Sharjah";

export const Hero = forwardRef<HTMLElement, { now: DubaiNow }>(function Hero({ now }, ref) {
  const r = menu.restaurant;
  const open = isOpen(now, r.hours.daily);
  return (
    <header
      ref={ref}
      className="relative h-[68svh] min-h-[480px] overflow-hidden bg-facade text-white md:h-[52vh] md:min-h-[420px]"
    >
      <h1 className="sr-only">Arous Al Wadi Restaurant menu</h1>
      <div className="hero-parallax absolute inset-0">
        <picture>
          <source
            media="(min-width: 768px)"
            type="image/avif"
            srcSet="/photos/storefront-front-960.avif 960w, /photos/storefront-front-1440.avif 1440w, /photos/storefront-front-1980.avif 1980w"
            sizes="100vw"
          />
          <source
            media="(min-width: 768px)"
            type="image/webp"
            srcSet="/photos/storefront-front-960.webp 960w, /photos/storefront-front-1440.webp 1440w, /photos/storefront-front-1980.webp 1980w"
            sizes="100vw"
          />
          <source
            type="image/avif"
            srcSet="/photos/storefront-corner-480.avif 480w, /photos/storefront-corner-720.avif 720w, /photos/storefront-corner-840.avif 840w"
            sizes="100vw"
          />
          <source
            type="image/webp"
            srcSet="/photos/storefront-corner-480.webp 480w, /photos/storefront-corner-720.webp 720w, /photos/storefront-corner-840.webp 840w"
            sizes="100vw"
          />
          <img
            src="/photos/storefront-corner.jpg"
            width={840}
            height={1260}
            alt={HERO_ALT}
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="hero-photo absolute inset-0 size-full object-cover object-[50%_35%] md:object-[50%_30%]"
          />
        </picture>
      </div>
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-b from-transparent via-facade/80 to-facade"
      />
      <div className="hero-copy absolute inset-x-0 bottom-0 mx-auto max-w-[640px] px-5 pb-6">
        <div className="rise" style={{ "--d": "420ms" } as React.CSSProperties}>
          <Logo
            name="logo-stacked-white-480"
            width={168}
            height={181}
            alt="Arous Al Wadi Restaurant"
            eager
            className="h-auto w-[168px]"
          />
        </div>
        <p
          lang="ar"
          dir="rtl"
          className="rise mt-3 text-left text-[20px] leading-[1.3] font-medium"
          style={{ "--d": "500ms" } as React.CSSProperties}
        >
          {r.nameAr}
        </p>
        <p
          className="rise mt-1 text-[17px] text-white/90"
          style={{ "--d": "560ms" } as React.CSSProperties}
        >
          {r.area}
        </p>
        <p
          className="rise mt-2 flex items-center gap-2 text-[17px] font-medium"
          style={{ "--d": "620ms" } as React.CSSProperties}
        >
          <span
            aria-hidden
            className={cn(
              "inline-block size-2.5 rounded-full",
              open ? "live-dot bg-neon" : "bg-white/50",
            )}
          />
          {open
            ? `Open now, closes at ${formatClock(r.hours.daily.close)}`
            : `Closed, opens at ${formatClock(r.hours.daily.open)}`}
        </p>
      </div>
    </header>
  );
});
