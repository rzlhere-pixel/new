import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { menu } from "@/data/menu";
import { formatPrice } from "@/lib/format";
import { myList, optionText, resolveLines, useMyList } from "@/lib/my-list";
import { DeliveryForm } from "./DeliveryForm";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "./Sheet";
import { StaffScreen } from "./StaffScreen";

export function ListSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const lines = resolveLines(useMyList());
  const [staff, setStaff] = useState(false);
  const [step, setStep] = useState<"list" | "delivery">("list");
  const priced = lines.filter((l) => l.unitPrice !== null);
  const unpriced = lines.length - priced.length;
  const total = priced.reduce((s, l) => s + (l.unitPrice as number) * l.qty, 0);
  const wa = menu.restaurant.whatsapp;

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(o) => {
          onOpenChange(o);
          if (!o) setStep("list");
        }}
      >
        <SheetContent aria-describedby="list-desc">
          {step === "delivery" && wa && lines.length > 0 ? (
            <DeliveryForm lines={lines} whatsapp={wa} onBack={() => setStep("list")} />
          ) : (
            <>
              <SheetHeader>
                <SheetTitle>Your list</SheetTitle>
                <SheetDescription id="list-desc">
                  {wa
                    ? "Show it at the counter, or send it to us on WhatsApp for delivery."
                    : "A note to show when you order. Nothing is sent to the restaurant."}
                </SheetDescription>
              </SheetHeader>
              {lines.length === 0 ? (
                <p className="px-5 pt-2 pb-10 text-[17px]">
                  Your list is empty. Tap + next to a dish to add it.
                </p>
              ) : (
                <>
                  <ul className="min-h-0 flex-1 overflow-y-auto px-5">
                    {lines.map((l) => {
                      const opt = optionText(l);
                      const key = `${l.itemId}:${l.variant ?? ""}`;
                      const label = `${l.item.name}${opt ? `, ${opt}` : ""}`;
                      return (
                        <li
                          key={key}
                          className="flex items-center gap-3 border-b border-line py-2.5"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium">{l.item.name}</p>
                            <p className="text-[14px] leading-[1.4] text-muted">
                              {[
                                opt,
                                l.unitPrice !== null
                                  ? `AED ${formatPrice(l.unitPrice)} each`
                                  : (l.option?.priceNote ?? l.item.priceNote),
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <button
                              type="button"
                              aria-label={`One less ${label}`}
                              onClick={() => myList.setQty(l.itemId, l.variant, l.qty - 1)}
                              className="inline-flex size-11 items-center justify-center rounded-full bg-chip text-chip-fg"
                            >
                              <Minus aria-hidden className="size-4" />
                            </button>
                            <span
                              className="price w-9 text-center"
                              aria-label={`Quantity ${l.qty}`}
                            >
                              {l.qty}
                            </span>
                            <button
                              type="button"
                              aria-label={`One more ${label}`}
                              onClick={() => myList.setQty(l.itemId, l.variant, l.qty + 1)}
                              className="inline-flex size-11 items-center justify-center rounded-full bg-chip text-chip-fg"
                            >
                              <Plus aria-hidden className="size-4" />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  <SheetFooter>
                    <p className="flex items-baseline justify-between text-[17px]">
                      <span>Approx. total</span>
                      <span className="price">AED {formatPrice(total)}</span>
                    </p>
                    {unpriced > 0 && (
                      <p className="-mt-1 text-[14px] leading-[1.4] text-muted">
                        Leaves out {unpriced} {unpriced === 1 ? "dish" : "dishes"} priced by size.
                      </p>
                    )}
                    {wa && (
                      <button
                        type="button"
                        onClick={() => setStep("delivery")}
                        className="mt-1 inline-flex h-12 items-center justify-center rounded-full bg-brand-red-deep text-[17px] font-semibold text-white"
                      >
                        Order for delivery
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setStaff(true)}
                      className={
                        wa
                          ? "inline-flex h-12 items-center justify-center rounded-full border-2 border-fg/80 text-[17px] font-semibold"
                          : "mt-1 inline-flex h-12 items-center justify-center rounded-full bg-brand-red-deep text-[17px] font-semibold text-white"
                      }
                    >
                      Show to staff
                    </button>
                    <button
                      type="button"
                      onClick={() => myList.clear()}
                      className="inline-flex h-11 items-center justify-center text-[17px] font-medium text-muted underline underline-offset-4"
                    >
                      Clear list
                    </button>
                  </SheetFooter>
                </>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
      <StaffScreen open={staff} onOpenChange={setStaff} lines={lines} />
    </>
  );
}
