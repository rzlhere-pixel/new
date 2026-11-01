import { SECTION_IMAGES } from "@/lib/images";
import { clsx as cn } from "clsx";

/** Brand logo: WebP with PNG fallback. Light and dark variants swap with the colour scheme. */
export function Logo({
  name,
  width,
  height,
  alt,
  className,
  eager = false,
  adaptive = false,
}: {
  /** File name in /brand without extension, e.g. "logo-stacked-480". */
  name: string;
  width: number;
  height: number;
  alt: string;
  className?: string;
  eager?: boolean;
  /** Use the "-white" version in dark mode. */
  adaptive?: boolean;
}) {
  const white = name.replace(/^([a-z]+(?:-[a-z]+)?)(-\d+)?$/, "$1-white$2");
  return (
    <picture>
      {adaptive && (
        <source
          media="(prefers-color-scheme: dark)"
          srcSet={`/brand/${white}.webp`}
          type="image/webp"
        />
      )}
      <source srcSet={`/brand/${name}.webp`} type="image/webp" />
      <img
        src={`/brand/${name}.png`}
        width={width}
        height={height}
        alt={alt}
        className={className}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
    </picture>
  );
}

/** Food artwork from the printed menus: AVIF, then WebP. Decorative only. */
export function SectionMark({ image }: { image: string }) {
  const art = SECTION_IMAGES[image];
  if (!art?.length) return null;
  if (art.length === 1) {
    const a = art[0];
    return (
      <picture className="shrink-0">
        <source srcSet={`${a.src}.avif`} type="image/avif" />
        <img
          src={`${a.src}.webp`}
          width={56}
          height={56}
          alt=""
          loading="lazy"
          decoding="async"
          className="size-14 rounded-full object-cover"
        />
      </picture>
    );
  }
  return (
    <span className="flex shrink-0 items-center" aria-hidden>
      {art.map((a, i) => (
        <picture key={a.src} className={cn(i > 0 && "-ml-3")}>
          <source srcSet={`${a.src}.avif`} type="image/avif" />
          <img
            src={`${a.src}.webp`}
            width={40}
            height={40}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-10 rounded-full"
          />
        </picture>
      ))}
    </span>
  );
}

/** The front shot, used in "Visit us" and as the wide hero. */
export function StorefrontFront({ className, alt }: { className?: string; alt: string }) {
  return (
    <picture>
      <source
        type="image/avif"
        srcSet="/photos/storefront-front-960.avif 960w, /photos/storefront-front-1440.avif 1440w, /photos/storefront-front-1980.avif 1980w"
        sizes="(min-width: 640px) 640px, 100vw"
      />
      <source
        type="image/webp"
        srcSet="/photos/storefront-front-960.webp 960w, /photos/storefront-front-1440.webp 1440w, /photos/storefront-front-1980.webp 1980w"
        sizes="(min-width: 640px) 640px, 100vw"
      />
      <img
        src="/photos/storefront-front.jpg"
        width={1980}
        height={745}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={className}
      />
    </picture>
  );
}
