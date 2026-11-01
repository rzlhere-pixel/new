import { useEffect, useRef, useState } from "react";
import { Check, Plus } from "lucide-react";
import type { Item } from "@/data/menu.types";
import { DISH_PHOTOS } from "@/data/dish-photos";
import { SITE } from "@/config/site";
import { myList } from "@/lib/my-list";
import { formatDays, type DubaiNow } from "@/lib/time";
import { itemAnchor } from "@/lib/scroll";
import { clsx as cn } from "clsx";
import { useMenuActions } from "./actions";
import { DietMarker, ItemPrice, VariantChips } from "./Price";

export function ItemRow({
  item,
  now,
  renderName,
}: {
  item: Item;
  now: DubaiNow;
  /** Search results pass a highlighter. */
  renderName?: (name: string) => React.ReactNode;
}) {
  const soldOut = !!item.soldOut;
  const photo = DISH_PHOTOS[item.id];
  const { showPhoto } = useMenuActions();
  const today = item.availableDays?.includes(now.day);

  return (
    <li
      id={itemAnchor(item.id)}
      className={cn(
        "anchor flex min-h-[52px] items-start gap-3 border-b border-line py-1 last:border-b-0",
        soldOut && "text-muted",
      )}
    >
      {photo && (
        <button
          type="button"
          onClick={() => showPhoto(item)}
          aria-label={`Photo of ${item.name}`}
          className="shrink-0"
        >
          <img
            src={photo}
            width={64}
            height={64}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-16 rounded-xl object-cover"
          />
        </button>
      )}
      <div className="min-w-0 flex-1 pt-[11px] pb-2">
        <div className="flex items-baseline gap-2">
          {SITE.showItemNumbers && item.no && (
            <span className="text-[14px] text-gold-ink tabular-nums">{item.no}</span>
          )}
          <DietMarker diet={item.diet} />
          <span className="font-medium">{renderName ? renderName(item.name) : item.name}</span>
        </div>
        {(item.options || item.availableDays) && (
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] leading-[1.4] text-muted">
            {item.availableDays && today && (
              <span className="rounded-full bg-neon px-2 py-0.5 font-medium text-facade">
                Today
              </span>
            )}
            {item.availableDays && <span>{formatDays(item.availableDays)}</span>}
            {item.options && <span>{item.options}</span>}
          </p>
        )}
        <VariantChips item={item} />
        {soldOut && (
          <p className="mt-1 text-[14px] leading-[1.4] font-medium">Not available today</p>
        )}
      </div>
      <ItemPrice item={item} className="pt-[11px] text-right" />
      {SITE.enableMyList && !soldOut ? <AddButton item={item} /> : <span className="w-2" />}
    </li>
  );
}

function AddButton({ item }: { item: Item }) {
  const { chooseOption } = useMenuActions();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const onClick = () => {
    if (item.variants && item.variants.length > 1) {
      chooseOption(item);
      return;
    }
    myList.add(item.id, item.variants ? 0 : undefined);
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1200);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Add ${item.name} to your list`}
      className="-mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-fg transition-colors active:bg-chip"
    >
      {added ? (
        <Check aria-hidden className="added-tick size-5 text-neon" strokeWidth={2.5} />
      ) : (
        <Plus aria-hidden className="size-5" strokeWidth={2} />
      )}
      <span className="sr-only" aria-live="polite">
        {added ? "Added" : ""}
      </span>
    </button>
  );
}
