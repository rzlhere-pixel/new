import { useState } from "react";
import { MapPin, MessageCircle, Phone } from "lucide-react";
import { menu } from "@/data/menu";
import { SITE } from "@/config/site";
import { listCount, useMyList } from "@/lib/my-list";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "./Sheet";
import { ListSheet } from "./ListSheet";

export function BottomBar() {
  const r = menu.restaurant;
  const [callOpen, setCallOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const list = useMyList();
  const count = listCount(list);

  return (
    <>
      {SITE.enableMyList && count > 0 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--bottom-bar-h)+env(safe-area-inset-bottom)+8px)] z-40 flex justify-center px-5">
          <button
            type="button"
            onClick={() => setListOpen(true)}
            aria-label={`Your list (${count})`}
            className="pill-in press pointer-events-auto inline-flex min-h-11 items-center rounded-full bg-facade px-5 text-[17px] font-medium text-white shadow-[0_2px_10px_rgb(31_26_23/0.35)] ring-1 ring-white/15"
          >
            <span>
              Your list (
              <span key={count} className="bump">
                {count}
              </span>
              )
            </span>
          </button>
        </div>
      )}

      <div className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg pt-3">
        <div className="mx-auto flex max-w-[640px] gap-3 px-5">
          <button
            type="button"
            onClick={() => setCallOpen(true)}
            className="press inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-brand-red-deep text-[17px] font-semibold text-white"
          >
            <Phone aria-hidden className="size-[18px]" />
            Call to order
          </button>
          <a
            href={r.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="press inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full border-2 border-fg/80 text-[17px] font-semibold text-fg"
          >
            <MapPin aria-hidden className="size-[18px]" />
            Directions
          </a>
        </div>
      </div>

      <Sheet open={callOpen} onOpenChange={setCallOpen}>
        <SheetContent aria-describedby="call-desc">
          <SheetHeader>
            <SheetTitle>Call to order</SheetTitle>
            <SheetDescription id="call-desc" className="text-[17px] text-fg">
              {r.freeHomeDelivery ? "Free home delivery" : "Order by phone"}
            </SheetDescription>
          </SheetHeader>
          <ul className="safe-bottom px-5 pb-4">
            {r.phones.map((p) => (
              <li key={p.tel} className="border-b border-line last:border-b-0">
                <a href={`tel:${p.tel}`} className="flex min-h-14 items-center gap-3 py-2">
                  <Phone aria-hidden className="size-5 text-brand-red-deep dark:text-neon" />
                  <span className="price text-[22px]">{p.display}</span>
                  <span className="ml-auto text-[14px] text-muted">{p.label}</span>
                </a>
              </li>
            ))}
            {r.whatsapp && (
              <li className="border-b border-line last:border-b-0">
                <a
                  href={`https://wa.me/${r.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-14 items-center gap-3 py-2"
                >
                  <MessageCircle
                    aria-hidden
                    className="size-5 text-brand-red-deep dark:text-neon"
                  />
                  <span className="text-[17px] font-medium">Message us on WhatsApp</span>
                </a>
              </li>
            )}
          </ul>
          {SITE.enableMyList && r.whatsapp && (
            <p className="safe-bottom -mt-2 px-5 pb-4 text-[14px] leading-[1.4] text-muted">
              Or tap + next to dishes, open Your list and choose Order for delivery.
            </p>
          )}
        </SheetContent>
      </Sheet>

      {SITE.enableMyList && <ListSheet open={listOpen} onOpenChange={setListOpen} />}
    </>
  );
}
