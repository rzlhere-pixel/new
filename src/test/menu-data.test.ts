import { describe, expect, it } from "vitest";
import raw from "@/data/menu.json";
import { MenuSchema, DaySchema } from "@/data/menu.schema";
import type { Menu } from "@/data/menu.types";

const menu = raw as Menu;
const items = menu.groups.flatMap((g) => g.sections.flatMap((s) => s.items));

describe("menu.json", () => {
  it("passes the zod schema", () => {
    const r = MenuSchema.safeParse(raw);
    expect(r.success ? [] : r.error.issues).toEqual([]);
  });

  it("has exactly 218 items", () => {
    expect(items).toHaveLength(218);
  });

  it("has 252 unique serial numbers across items and variants", () => {
    const nos = items.flatMap((i) => [
      ...(i.no ? [i.no] : []),
      ...(i.variants ?? []).flatMap((v) => (v.no ? [v.no] : [])),
    ]);
    expect(nos).toHaveLength(252);
    expect(new Set(nos).size).toBe(252);
  });

  it("has unique item ids, section ids and group ids", () => {
    const ids = items.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    const sections = menu.groups.flatMap((g) => g.sections.map((s) => s.id));
    expect(new Set(sections).size).toBe(sections.length);
    expect(sections).toHaveLength(18);
    const groups = menu.groups.map((g) => g.id);
    expect(new Set(groups).size).toBe(groups.length);
  });

  it("has a positive price, or null with a priceNote, everywhere", () => {
    const prices = items.flatMap((i) =>
      i.variants
        ? i.variants.map((v) => ({ price: v.price, note: v.priceNote, id: i.id }))
        : [{ price: i.price, note: i.priceNote, id: i.id }],
    );
    for (const p of prices) {
      if (p.price === null) expect(p.note, p.id).toBeTruthy();
      else {
        expect(typeof p.price, p.id).toBe("number");
        expect(p.price as number, p.id).toBeGreaterThan(0);
      }
    }
  });

  it("only uses valid days", () => {
    for (const i of items)
      for (const d of i.availableDays ?? []) expect(DaySchema.safeParse(d).success).toBe(true);
  });
});
