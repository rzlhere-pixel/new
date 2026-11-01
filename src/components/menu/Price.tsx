import type { Item, Variant } from "@/data/menu.types";
import { SITE } from "@/config/site";
import { formatPrice } from "@/lib/format";
import { clsx as cn } from "clsx";

/** Price column for a single-price item, or for variants without labels ("16 / 24"). */
export function ItemPrice({ item, className }: { item: Item; className?: string }) {
  if (item.variants) {
    if (!item.variants.every((v) => v.label === null)) return null;
    const prices = item.variants.map((v) =>
      v.price === null ? v.priceNote : formatPrice(v.price),
    );
    return <span className={cn("price text-[17px]", className)}>{prices.join(" / ")}</span>;
  }
  if (item.price === null || item.price === undefined)
    return (
      <span className={cn("text-[14px] leading-[1.4] text-muted italic", className)}>
        {item.priceNote}
      </span>
    );
  return <span className={cn("price text-[17px]", className)}>{formatPrice(item.price)}</span>;
}

/** Read-only option chips under the name: "Single 5". */
export function VariantChips({ item }: { item: Item }) {
  const variants = item.variants;
  if (!variants || variants.every((v) => v.label === null)) return null;
  return (
    <ul className="mt-2 flex flex-wrap gap-1.5" aria-label={`${item.name} options`}>
      {variants.map((v, i) => (
        <li
          key={i}
          className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-chip px-3 text-[15px] leading-tight text-chip-fg"
        >
          {SITE.showItemNumbers && v.no && (
            <span className="text-[13px] text-gold-ink tabular-nums">{v.no}</span>
          )}
          <span>{v.label}</span>
          <VariantPrice v={v} />
        </li>
      ))}
    </ul>
  );
}

export function VariantPrice({ v }: { v: Variant }) {
  return v.price === null ? (
    <span className="text-[14px] text-muted italic">{v.priceNote}</span>
  ) : (
    <span className="price">{formatPrice(v.price)}</span>
  );
}

export function DietMarker({ diet }: { diet: Item["diet"] }) {
  if (!SITE.showDietMarkers || !diet) return null;
  const veg = diet === "veg";
  return (
    <span
      role="img"
      aria-label={veg ? "Vegetarian" : "Non-vegetarian"}
      className={cn(
        "inline-flex size-3.5 shrink-0 items-center justify-center rounded-[2px] border-[1.5px] bg-white",
        veg ? "border-veg" : "border-nonveg",
      )}
    >
      {veg ? (
        <span className="size-1.5 rounded-full bg-veg" />
      ) : (
        <span className="size-0 border-x-[4px] border-b-[6px] border-x-transparent border-b-nonveg" />
      )}
    </span>
  );
}
