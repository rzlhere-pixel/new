import { useEffect, useId, useMemo, useState } from "react";
import { ChevronLeft, Search } from "lucide-react";
import { clsx as cn } from "clsx";
import { menu } from "@/data/menu";
import {
  BUILDINGS,
  buildOrderMessage,
  buildingById,
  deliveryProblems,
  loadDetails,
  orderTotals,
  saveDetails,
  searchBuildings,
  whatsappUrl,
  type DeliveryDetails,
} from "@/lib/delivery";
import { formatPrice } from "@/lib/format";
import type { ResolvedLine } from "@/lib/my-list";
import { formatClock, isOpen } from "@/lib/time";
import { useDubaiNow } from "@/lib/use-now";
import { SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "./Sheet";

const input =
  "h-12 w-full rounded-[12px] border border-line bg-chip px-3.5 text-[17px] text-fg placeholder:text-muted focus:outline-none focus-visible:outline-2 focus-visible:outline-neon";

/** Delivery step of "Your list": where to deliver, then hand the order to WhatsApp. */
export function DeliveryForm({
  lines,
  whatsapp,
  onBack,
}: {
  lines: ResolvedLine[];
  whatsapp: string;
  onBack: () => void;
}) {
  const r = menu.restaurant;
  const now = useDubaiNow();
  const open = isOpen(now, r.hours.daily);
  const [d, setD] = useState<DeliveryDetails>(() => loadDetails());
  const [other, setOther] = useState(() => !!d.otherBuilding && !d.buildingId);
  const [query, setQuery] = useState("");
  const [tried, setTried] = useState(false);
  const ids = { flat: useId(), floor: useId(), name: useId(), notes: useId(), b: useId() };

  const set = (patch: Partial<DeliveryDetails>) => setD((prev) => ({ ...prev, ...patch }));
  const problems = deliveryProblems(d);
  const matches = useMemo(() => searchBuildings(query), [query]);
  const chosen = d.buildingId ? buildingById(d.buildingId) : undefined;
  const { total, unpriced } = orderTotals(lines);
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const href = whatsappUrl(whatsapp, buildOrderMessage(lines, d, r.name));

  // Keep the saved address in step with the form.
  useEffect(() => saveDetails(d), [d]);

  return (
    <>
      <SheetHeader>
        <button
          type="button"
          onClick={onBack}
          className="-ml-2 inline-flex h-11 w-fit items-center gap-1 pr-3 text-[15px] font-medium text-muted"
        >
          <ChevronLeft aria-hidden className="size-5" />
          Back to your list
        </button>
        <SheetTitle>Delivery details</SheetTitle>
        <SheetDescription>
          {r.freeHomeDelivery ? "Free home delivery in Al Nahda. " : ""}Your order goes to us on
          WhatsApp.
        </SheetDescription>
      </SheetHeader>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-2">
        {!open && (
          <p className="mb-3 rounded-[12px] bg-panel px-4 py-3 text-[15px] leading-[1.4]">
            We're closed now and open again at {formatClock(r.hours.daily.open)}. You can still send
            your order; we'll reply when we open.
          </p>
        )}

        <fieldset>
          <legend className="text-[15px] font-semibold">Building</legend>
          {chosen ? (
            <div className="mt-2 flex items-center gap-3 rounded-[12px] border-2 border-neon px-3.5 py-2">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{chosen.name}</p>
                <p className="text-[14px] leading-[1.4] text-muted">{chosen.street}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  set({ buildingId: "" });
                  setQuery("");
                }}
                className="press inline-flex h-11 items-center px-2 text-[15px] font-semibold underline underline-offset-4"
              >
                Change
              </button>
            </div>
          ) : other ? (
            <div className="mt-2">
              <label htmlFor={ids.b} className="sr-only">
                Building name and street
              </label>
              <input
                id={ids.b}
                value={d.otherBuilding}
                onChange={(e) => set({ otherBuilding: e.target.value })}
                placeholder="Building name and street"
                autoComplete="address-line1"
                aria-invalid={tried && problems.includes("building")}
                className={input}
              />
              <button
                type="button"
                onClick={() => {
                  setOther(false);
                  set({ otherBuilding: "" });
                }}
                className="press mt-1 inline-flex h-11 items-center text-[15px] font-medium text-muted underline underline-offset-4"
              >
                Pick from the list instead
              </button>
            </div>
          ) : (
            <div className="mt-2">
              <div className="relative">
                <label htmlFor={ids.b} className="sr-only">
                  Search your building
                </label>
                <Search
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-muted"
                />
                <input
                  id={ids.b}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search ${BUILDINGS.length} buildings`}
                  autoComplete="off"
                  aria-controls={`${ids.b}-list`}
                  aria-invalid={tried && problems.includes("building")}
                  className={cn(input, "pl-10 [&::-webkit-search-cancel-button]:hidden")}
                />
              </div>
              <ul
                id={`${ids.b}-list`}
                aria-label="Buildings"
                className="mt-2 max-h-[232px] overflow-y-auto rounded-[12px] border border-line"
              >
                {matches.map((b) => (
                  <li key={b.id} className="border-b border-line last:border-b-0">
                    <button
                      type="button"
                      onClick={() => set({ buildingId: b.id, otherBuilding: "" })}
                      className="flex min-h-12 w-full flex-col justify-center px-3.5 py-1.5 text-left"
                    >
                      <span className="font-medium">{b.name}</span>
                      <span className="text-[14px] leading-[1.4] text-muted">{b.street}</span>
                    </button>
                  </li>
                ))}
                {matches.length === 0 && (
                  <li className="px-3.5 py-3 text-[15px] text-muted">
                    No building matches "{query.trim()}".
                  </li>
                )}
              </ul>
              <button
                type="button"
                onClick={() => {
                  setOther(true);
                  set({ buildingId: "", otherBuilding: query.trim() });
                }}
                className="press mt-1 inline-flex h-11 items-center text-[15px] font-medium underline underline-offset-4"
              >
                My building isn't listed
              </button>
            </div>
          )}
          {tried && problems.includes("building") && (
            <p className="mt-1 text-[14px] font-medium text-brand-red-deep dark:text-neon">
              Choose your building, or type its name.
            </p>
          )}
        </fieldset>

        <div className="mt-4 flex gap-3">
          <div className="flex-[3]">
            <label htmlFor={ids.flat} className="text-[15px] font-semibold">
              Flat / office no.
            </label>
            <input
              id={ids.flat}
              value={d.flat}
              onChange={(e) => set({ flat: e.target.value })}
              inputMode="text"
              autoComplete="address-line2"
              aria-invalid={tried && problems.includes("flat")}
              className={cn(input, "mt-1")}
            />
          </div>
          <div className="flex-[2]">
            <label htmlFor={ids.floor} className="text-[15px] font-semibold">
              Floor <span className="font-normal text-muted">(optional)</span>
            </label>
            <input
              id={ids.floor}
              value={d.floor}
              onChange={(e) => set({ floor: e.target.value })}
              inputMode="numeric"
              className={cn(input, "mt-1")}
            />
          </div>
        </div>
        {tried && problems.includes("flat") && (
          <p className="mt-1 text-[14px] font-medium text-brand-red-deep dark:text-neon">
            Add your flat or office number.
          </p>
        )}

        <label htmlFor={ids.name} className="mt-4 block text-[15px] font-semibold">
          Name <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          id={ids.name}
          value={d.name}
          onChange={(e) => set({ name: e.target.value })}
          autoComplete="name"
          className={cn(input, "mt-1")}
        />

        <label htmlFor={ids.notes} className="mt-4 block text-[15px] font-semibold">
          Notes for the kitchen or rider <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea
          id={ids.notes}
          value={d.notes}
          onChange={(e) => set({ notes: e.target.value })}
          rows={2}
          className={cn(input, "mt-1 h-auto py-2.5")}
        />
      </div>

      <SheetFooter>
        <p className="flex items-baseline justify-between text-[17px]">
          <span>
            {count} {count === 1 ? "item" : "items"}, approx.
          </span>
          <span className="price">AED {formatPrice(total)}</span>
        </p>
        {unpriced > 0 && (
          <p className="-mt-1 text-[14px] leading-[1.4] text-muted">
            Plus {unpriced} {unpriced === 1 ? "dish" : "dishes"} priced by size; we'll confirm the
            price on WhatsApp.
          </p>
        )}
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={problems.length > 0}
          onClick={(e) => {
            setTried(true);
            if (problems.length) e.preventDefault();
          }}
          className={cn(
            "press mt-1 inline-flex h-12 items-center justify-center rounded-full bg-brand-red-deep text-[17px] font-semibold text-white",
            problems.length > 0 && "opacity-60",
          )}
        >
          Send order on WhatsApp
        </a>
        <p className="pb-1 text-center text-[14px] leading-[1.4] text-muted">
          WhatsApp opens with your order written out. Press send there to place it.
        </p>
      </SheetFooter>
    </>
  );
}
