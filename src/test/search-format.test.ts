import { describe, expect, it } from "vitest";
import raw from "@/data/menu.json";
import type { Menu } from "@/data/menu.types";
import { highlightRanges, normalize, search } from "@/lib/search";
import { formatPrice, formatSourceDate } from "@/lib/format";

const menu = raw as Menu;
const all = menu.groups.flatMap((g) => g.sections.flatMap((s) => s.items));
const found = (q: string) => search(menu, q).flatMap((r) => r.items.map((i) => i.name));

describe("search", () => {
  it('"briyani" finds every biriyani item', () => {
    const expected = all.filter((i) => /biriyani/i.test(i.name)).map((i) => i.name);
    expect(expected.length).toBeGreaterThan(5);
    expect(found("briyani")).toEqual(expect.arrayContaining(expected));
    expect(found("biryani")).toEqual(expect.arrayContaining(expected));
  });
  it('"parotta" finds porotta items', () => {
    const expected = all.filter((i) => /porotta/i.test(i.name)).map((i) => i.name);
    expect(found("parotta")).toEqual(expect.arrayContaining(expected));
    expect(found("paratha")).toEqual(expect.arrayContaining(expected));
  });
  it('"55" finds Mutton Dum Biriyani by its serial number', () => {
    expect(found("55")).toEqual(["Mutton Dum Biriyani"]);
  });
  it("finds a serial number that belongs to a variant", () => {
    expect(found("17")).toContain("Egg Curry");
  });
  it('"samosa" finds Samoosa', () => {
    expect(found("samosa")).toContain("Samoosa");
  });
  it("folds other synonyms", () => {
    expect(found("chili")).toEqual(expect.arrayContaining(found("chilly")));
    expect(found("idli")).toEqual(expect.arrayContaining(["Idly Set"]));
    expect(found("king fish").length).toBeGreaterThan(0);
  });
  it("searches option text and section titles", () => {
    expect(found("mackerel")).toEqual(expect.arrayContaining(["Fish Chatty Curry"]));
    expect(found("breakfast")).toContain("Masala Dosa");
  });
  it("normalises punctuation, case and spacing", () => {
    expect(normalize("  Porotta + Beef   CURRY! ")).toBe("porotta beef curry");
    expect(found("MASALA-dosa")).toContain("Masala Dosa");
  });
  it("returns nothing for an empty query and for nonsense", () => {
    expect(search(menu, "  ")).toEqual([]);
    expect(search(menu, "zzzz")).toEqual([]);
  });
  it("groups results by section in menu order", () => {
    const r = search(menu, "chicken");
    const ids = r.map((s) => s.section.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("highlights literal and synonym matches", () => {
    expect(highlightRanges("Kerala Porotta", "por")).toEqual([[7, 10]]);
    expect(highlightRanges("Mutton Dum Biriyani", "briyani")).toEqual([[11, 19]]);
  });
});

describe("formatPrice", () => {
  it("keeps whole numbers bare and uses two decimals otherwise", () => {
    expect(formatPrice(7)).toBe("7");
    expect(formatPrice(2.5)).toBe("2.50");
    expect(formatPrice(1.25)).toBe("1.25");
    expect(formatPrice(12.5)).toBe("12.50");
  });
  it("formats the source date", () => {
    expect(formatSourceDate("2026-09-25")).toBe("25 Sep 2026");
  });
});
