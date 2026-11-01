import { useEffect, useState } from "react";
import { dubaiNow, type DubaiNow } from "@/lib/time";

/**
 * Restaurant time, re-checked every 60 s while the page is visible and again
 * whenever the tab becomes visible. The first value is computed during render so
 * the server-rendered HTML already carries today's specials.
 */
export function useDubaiNow(): DubaiNow {
  const [now, setNow] = useState<DubaiNow>(() => dubaiNow());

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    const tick = () =>
      setNow((prev) => {
        const next = dubaiNow();
        return prev.day === next.day && prev.minutes === next.minutes ? prev : next;
      });
    const start = () => {
      stop();
      tick();
      timer = setInterval(tick, 60_000);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = undefined;
    };
    const onVisibility = () => (document.visibilityState === "visible" ? start() : stop());
    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return now;
}
