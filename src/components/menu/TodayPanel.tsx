import { menu } from "@/data/menu";
import { formatPrice } from "@/lib/format";
import { itemAnchor, scrollToId } from "@/lib/scroll";
import { DAY_NAMES, formatClock, happyHourState, todaysItems, type DubaiNow } from "@/lib/time";
import { clsx as cn } from "clsx";
import { ItemPrice } from "./Price";

const happyHourGroup = menu.groups.find((g) => g.window);

export function TodayPanel({ now, onNavigate }: { now: DubaiNow; onNavigate: () => void }) {
  const today = todaysItems(menu, now);
  const hh = happyHourState(happyHourGroup, now);
  const w = happyHourGroup?.window;
  const hhTarget = happyHourGroup?.sections[0]?.id ?? happyHourGroup?.id ?? "";

  if (!today.length && hh === "off") return null;

  const go = (id: string, flash = false) => {
    onNavigate();
    // Let the list render if search was open.
    requestAnimationFrame(() => scrollToId(id, { flash }));
  };

  return (
    <section aria-labelledby="today-title" className="mx-auto max-w-[640px] px-5 pt-5">
      <div className="rounded-[20px] bg-panel px-5 py-4">
        {today.length > 0 && (
          <>
            <h2 id="today-title" className="display text-[28px] leading-[1.05] text-title">
              Today, {DAY_NAMES[now.day]}
            </h2>
            <ul className="mt-1">
              {today.map(({ item }) => (
                <li key={item.id}>
                  <a
                    href={`#${itemAnchor(item.id)}`}
                    onClick={(e) => {
                      e.preventDefault();
                      go(itemAnchor(item.id), true);
                    }}
                    className={cn(
                      "flex min-h-11 flex-col justify-center gap-1.5 py-2",
                      item.soldOut && "text-muted",
                    )}
                  >
                    <span className="flex items-baseline gap-3">
                      <span className="flex-1 font-medium">{item.name}</span>
                      <ItemPrice item={item} />
                    </span>
                    {item.variants && item.variants.some((v) => v.label) && (
                      <span className="flex flex-wrap gap-1.5">
                        {item.variants.map((v, i) => (
                          <span
                            key={i}
                            className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-white/70 px-3 text-[15px] leading-tight text-ink dark:bg-white/10 dark:text-fg"
                          >
                            {v.label}
                            <span className="price">
                              {v.price === null ? v.priceNote : formatPrice(v.price)}
                            </span>
                          </span>
                        ))}
                      </span>
                    )}
                    {item.soldOut && (
                      <span className="text-[14px] leading-[1.4]">Not available today</span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
        {hh !== "off" && w && (
          <p
            className={cn(
              "text-[17px] font-medium",
              today.length > 0 && "mt-2 border-t border-rule pt-3",
            )}
          >
            <a
              href={`#${hhTarget}`}
              onClick={(e) => {
                e.preventDefault();
                go(hhTarget);
              }}
              className="inline-flex min-h-11 items-center underline decoration-neon decoration-2 underline-offset-4"
            >
              {hh === "on"
                ? `Happy Hour combos on now until ${formatClock(w.to)}`
                : `Happy Hour combos ${formatClock(w.from)} to ${formatClock(w.to)} today`}
            </a>
          </p>
        )}
      </div>
    </section>
  );
}
