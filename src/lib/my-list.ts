import { useSyncExternalStore } from "react";
import { allItems } from "@/data/menu";
import type { Item, Variant } from "@/data/menu.types";
import { formatPrice } from "@/lib/format";

/** "Your list": a note for ordering at the counter. Not an online order. */
export interface ListLine {
  itemId: string;
  /** Index into item.variants, when the item has options. */
  variant?: number;
  qty: number;
}

const KEY = "aaw:list:v1";
const EMPTY: ListLine[] = [];
let lines: ListLine[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

const itemsById = new Map(allItems().map((r) => [r.item.id, r.item]));

function isLine(x: unknown): x is ListLine {
  if (!x || typeof x !== "object") return false;
  const l = x as ListLine;
  return (
    typeof l.itemId === "string" &&
    typeof l.qty === "number" &&
    l.qty > 0 &&
    (l.variant === undefined || typeof l.variant === "number")
  );
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) {
      // Drop lines for dishes that were removed, hidden or re-optioned since they were saved.
      lines = parsed.filter(isLine).filter((l) => {
        const item = itemsById.get(l.itemId);
        if (!item) return false;
        return l.variant === undefined ? !item.variants : !!item.variants?.[l.variant];
      });
    }
  } catch {
    lines = EMPTY;
  }
}

function save() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    // Storage blocked or full: the list still works for this visit.
  }
}

function set(next: ListLine[]) {
  lines = next;
  save();
  for (const l of listeners) l();
}

function subscribe(cb: () => void) {
  load();
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    loaded = false;
    load();
    cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useMyList(): ListLine[] {
  return useSyncExternalStore(
    subscribe,
    () => {
      load();
      return lines;
    },
    () => EMPTY,
  );
}

const same = (a: ListLine, itemId: string, variant?: number) =>
  a.itemId === itemId && a.variant === variant;

export const myList = {
  add(itemId: string, variant?: number) {
    load();
    const existing = lines.find((l) => same(l, itemId, variant));
    set(
      existing
        ? lines.map((l) => (l === existing ? { ...l, qty: l.qty + 1 } : l))
        : [...lines, { itemId, variant, qty: 1 }],
    );
  },
  setQty(itemId: string, variant: number | undefined, qty: number) {
    load();
    set(
      qty <= 0
        ? lines.filter((l) => !same(l, itemId, variant))
        : lines.map((l) => (same(l, itemId, variant) ? { ...l, qty } : l)),
    );
  },
  clear() {
    set(EMPTY);
  },
};

export interface ResolvedLine extends ListLine {
  item: Item;
  option?: Variant;
  unitPrice: number | null;
  /** Serial number from the printed menu. */
  no?: string;
}

export function resolveLines(list: ListLine[]): ResolvedLine[] {
  const out: ResolvedLine[] = [];
  for (const l of list) {
    const item = itemsById.get(l.itemId);
    if (!item) continue;
    const option = l.variant !== undefined ? item.variants?.[l.variant] : undefined;
    out.push({
      ...l,
      item,
      option,
      unitPrice: option ? option.price : (item.price ?? null),
      no: option?.no ?? item.no,
    });
  }
  return out;
}

export function listCount(list: ListLine[]): number {
  return list.reduce((n, l) => n + l.qty, 0);
}

export function optionText(l: ResolvedLine): string | undefined {
  if (!l.option) return undefined;
  return l.option.label ?? (l.option.price !== null ? formatPrice(l.option.price) : undefined);
}
