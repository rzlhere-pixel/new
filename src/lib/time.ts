import type { Day, Group, Item, Menu, Section } from "@/data/menu.types";

export interface DubaiNow {
  day: Day;
  /** Minutes since local midnight in Asia/Dubai, 0 to 1439. */
  minutes: number;
}

export const DAYS: readonly Day[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export const DAY_NAMES: Record<Day, string> = {
  sun: "Sunday",
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
};

const WEEKDAY: Record<string, Day> = {
  Sun: "sun",
  Mon: "mon",
  Tue: "tue",
  Wed: "wed",
  Thu: "thu",
  Fri: "fri",
  Sat: "sat",
};

let formatter: Intl.DateTimeFormat | undefined;

/** Restaurant time is always Asia/Dubai, whatever timezone the phone is set to. */
export function dubaiNow(date: Date = new Date()): DubaiNow {
  formatter ??= new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dubai",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  let weekday = "";
  let hour = 0;
  let minute = 0;
  for (const part of formatter.formatToParts(date)) {
    if (part.type === "weekday") weekday = part.value;
    else if (part.type === "hour") hour = Number(part.value) % 24;
    else if (part.type === "minute") minute = Number(part.value);
  }
  return { day: WEEKDAY[weekday.slice(0, 3)] ?? "sun", minutes: hour * 60 + minute };
}

/** "06:00" → 360. "24:00" means midnight at the end of the day → 1440. */
export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function isOpen(now: DubaiNow, hours: { open: string; close: string }): boolean {
  const open = toMinutes(hours.open);
  const close = toMinutes(hours.close);
  if (close > open) return now.minutes >= open && now.minutes < close;
  // Overnight hours, e.g. 18:00 to 02:00.
  return now.minutes >= open || now.minutes < close;
}

export interface TodayEntry {
  item: Item;
  section: Section;
}

/** Items whose availableDays include today (hidden items left out). */
export function todaysItems(menu: Menu, now: DubaiNow): TodayEntry[] {
  const out: TodayEntry[] = [];
  for (const group of menu.groups)
    for (const section of group.sections)
      for (const item of section.items)
        if (!item.hidden && item.availableDays?.includes(now.day)) out.push({ item, section });
  return out;
}

export type HappyHourState = "on" | "later-today" | "off";

export function happyHourState(group: Group | undefined, now: DubaiNow): HappyHourState {
  const w = group?.window;
  if (!w || !w.days.includes(now.day)) return "off";
  if (now.minutes < toMinutes(w.from)) return "later-today";
  if (now.minutes < toMinutes(w.to)) return "on";
  return "off";
}

/** "16:00" → "4 PM", "06:30" → "6:30 AM", "24:00" → "midnight". */
export function formatClock(hhmm: string): string {
  const total = toMinutes(hhmm);
  if (total === 0 || total === 1440) return "midnight";
  if (total === 720) return "noon";
  const h = Math.floor(total / 60);
  const m = total % 60;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}${m ? `:${String(m).padStart(2, "0")}` : ""} ${h < 12 ? "AM" : "PM"}`;
}

/** "Sundays", "Thu and Sat", "Mon to Fri". */
export function formatDays(days: readonly Day[]): string {
  if (days.length === 1) return `${DAY_NAMES[days[0]]}s`;
  const short = (d: Day) => DAY_NAMES[d].slice(0, 3);
  const idx = days.map((d) => DAYS.indexOf(d));
  const consecutive = idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
  if (consecutive && days.length > 2) return `${short(days[0])} to ${short(days[days.length - 1])}`;
  if (days.length === 2) return `${short(days[0])} and ${short(days[1])}`;
  return `${days.slice(0, -1).map(short).join(", ")} and ${short(days[days.length - 1])}`;
}
