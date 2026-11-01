import type { Item } from "@/data/menu.types";
import { SITE } from "@/config/site";
import { formatPrice } from "@/lib/format";
import { myList } from "@/lib/my-list";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "./Sheet";

/** Asks which option to add, for dishes with variants. */
export function OptionSheet({ item, onClose }: { item: Item | null; onClose: () => void }) {
  return (
    <Sheet open={!!item} onOpenChange={(o) => !o && onClose()}>
      <SheetContent aria-describedby="option-desc">
        {item && (
          <>
            <SheetHeader>
              <SheetTitle>{item.name}</SheetTitle>
              <SheetDescription id="option-desc">
                Choose an option to add to your list
              </SheetDescription>
            </SheetHeader>
            <ul className="safe-bottom px-5 pb-4">
              {item.variants?.map((v, i) => (
                <li key={i} className="border-b border-line last:border-b-0">
                  <button
                    type="button"
                    onClick={() => {
                      myList.add(item.id, i);
                      onClose();
                    }}
                    className="flex min-h-14 w-full items-center gap-3 text-left text-[17px]"
                  >
                    {SITE.showItemNumbers && v.no && (
                      <span className="text-[14px] text-gold-ink tabular-nums">{v.no}</span>
                    )}
                    <span className="flex-1 font-medium">{v.label ?? `Option ${i + 1}`}</span>
                    {v.price === null ? (
                      <span className="text-[14px] text-muted italic">{v.priceNote}</span>
                    ) : (
                      <span className="price">AED {formatPrice(v.price)}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

/** Viewer for real dish photos (§7.11). Unused until DISH_PHOTOS has entries. */
export function PhotoSheet({
  item,
  src,
  onClose,
}: {
  item: Item | null;
  src?: string;
  onClose: () => void;
}) {
  return (
    <Sheet open={!!item && !!src} onOpenChange={(o) => !o && onClose()}>
      <SheetContent aria-describedby={undefined}>
        {item && src && (
          <>
            <SheetHeader>
              <SheetTitle>{item.name}</SheetTitle>
            </SheetHeader>
            <div className="safe-bottom px-5 pb-4">
              <img
                src={src}
                alt={item.name}
                width={800}
                height={800}
                className="aspect-square w-full rounded-[20px] object-cover"
              />
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
