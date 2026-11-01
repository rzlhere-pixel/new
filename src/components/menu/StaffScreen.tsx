import { useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { optionText, type ResolvedLine } from "@/lib/my-list";

type WakeLockSentinelLike = { release: () => Promise<void> };

/** Full-screen order card for the counter. Keeps the screen awake while open. */
export function StaffScreen({
  open,
  onOpenChange,
  lines,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  lines: ResolvedLine[];
}) {
  useEffect(() => {
    if (!open) return;
    let lock: WakeLockSentinelLike | undefined;
    let cancelled = false;
    const nav = navigator as Navigator & {
      wakeLock?: { request: (t: "screen") => Promise<WakeLockSentinelLike> };
    };
    const request = () =>
      nav.wakeLock
        ?.request("screen")
        .then((l) => {
          if (cancelled) void l.release();
          else lock = l;
        })
        .catch(() => {});
    void request();
    // The lock drops when the tab is hidden; take it again on return.
    const onVis = () => document.visibilityState === "visible" && void request();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVis);
      void lock?.release().catch(() => {});
    };
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Content
          aria-describedby={undefined}
          className="staff-in fixed inset-0 z-[60] flex flex-col bg-facade text-[#F3ECE3] outline-none"
        >
          <div className="mx-auto flex w-full max-w-[640px] min-h-0 flex-1 flex-col px-5 pt-[max(20px,env(safe-area-inset-top))]">
            <Dialog.Title className="display text-[32px] leading-[1.05] text-neon">
              Order
            </Dialog.Title>
            <ul className="mt-3 min-h-0 flex-1 overflow-y-auto">
              {lines.map((l) => {
                const opt = optionText(l);
                return (
                  <li
                    key={`${l.itemId}:${l.variant ?? ""}`}
                    className="flex items-baseline gap-3 border-b border-white/15 py-3 text-[24px] leading-[1.25]"
                  >
                    <span className="w-12 shrink-0 text-gold tabular-nums">{l.no ?? ""}</span>
                    <span className="min-w-0 flex-1 font-medium">
                      {l.item.name}
                      {opt && <span className="block text-[20px] text-[#D9CEC2]">{opt}</span>}
                    </span>
                    <span className="price shrink-0">× {l.qty}</span>
                  </li>
                );
              })}
            </ul>
            <div className="safe-bottom pt-4">
              <Dialog.Close className="press inline-flex h-14 w-full items-center justify-center rounded-full bg-neon text-[20px] font-semibold text-facade">
                Done
              </Dialog.Close>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
