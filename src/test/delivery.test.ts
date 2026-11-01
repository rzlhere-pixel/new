import { describe, expect, it } from "vitest";
import data from "@/data/delivery-buildings.json";
import {
  BUILDINGS,
  EMPTY_DETAILS,
  buildOrderMessage,
  deliveryProblems,
  orderTotals,
  searchBuildings,
  whatsappUrl,
} from "@/lib/delivery";
import { resolveLines } from "@/lib/my-list";
import raw from "@/data/menu.json";
import type { Menu } from "@/data/menu.types";

const menu = raw as Menu;

describe("delivery buildings", () => {
  it("has the 76 buildings from the register, with unique ids and names", () => {
    expect(BUILDINGS).toHaveLength(76);
    expect(new Set(BUILDINGS.map((b) => b.id)).size).toBe(76);
    expect(new Set(BUILDINGS.map((b) => b.name)).size).toBe(76);
    for (const b of data.buildings) {
      expect(b.id).toMatch(/^[a-z0-9-]+$/);
      expect(b.name.trim()).toBe(b.name);
      expect(b.street).toBeTruthy();
    }
  });
  it("is sorted A to Z", () => {
    const names = BUILDINGS.map((b) => b.name.toLowerCase());
    expect(names).toEqual([...names].sort());
  });
  it("finds buildings by part of the name or street, ignoring case and punctuation", () => {
    expect(searchBuildings("kawther").map((b) => b.name)).toEqual(["Al Kawther Tower"]);
    expect(searchBuildings("ALI omran").map((b) => b.name)).toEqual(["Ali Omran Building"]);
    expect(searchBuildings("zubaidi b").map((b) => b.name)).toEqual([
      "Zubaidi Building - Block A",
      "Zubaidi Building - Block B",
    ]);
    expect(searchBuildings("samarqand").length).toBe(26);
    expect(searchBuildings("").length).toBe(76);
    expect(searchBuildings("nowhere tower")).toEqual([]);
  });
});

describe("delivery order message", () => {
  const lines = resolveLines([
    { itemId: "masala-dosa", qty: 2 },
    { itemId: "egg-curry", variant: 1, qty: 1 },
    { itemId: "angamali-fish-curry", qty: 1 },
  ]);

  it("needs a building and a flat number", () => {
    expect(deliveryProblems(EMPTY_DETAILS)).toEqual(["building", "flat"]);
    expect(
      deliveryProblems({ ...EMPTY_DETAILS, buildingId: "al-kawther-tower", flat: "1204" }),
    ).toEqual([]);
    expect(deliveryProblems({ ...EMPTY_DETAILS, otherBuilding: "  ", flat: "1" })).toEqual([
      "building",
    ]);
    expect(deliveryProblems({ ...EMPTY_DETAILS, otherBuilding: "Blue Tower", flat: "1" })).toEqual(
      [],
    );
  });

  it("totals priced lines and counts the ones priced by size", () => {
    expect(orderTotals(lines)).toEqual({ total: 21, unpriced: 1 });
  });

  it("writes a plain-text order with serial numbers, options and the address", () => {
    const text = buildOrderMessage(
      lines,
      {
        ...EMPTY_DETAILS,
        buildingId: "al-kawther-tower",
        flat: "1204",
        floor: "12",
        name: "Razal",
        notes: "Less spicy",
      },
      menu.restaurant.name,
    );
    expect(text).toBe(
      [
        "Delivery order for Arous Al Wadi Restaurant",
        "",
        "2 x 1. Masala Dosa",
        "1 x 17. Egg Curry (Double)",
        "1 x 81. Angamali Fish Curry",
        "",
        "Approx. total: AED 21 (plus 1 priced by size)",
        "",
        "Deliver to:",
        "Al Kawther Tower, Bukhara Street",
        "Flat / office 1204, floor 12",
        "Name: Razal",
        "Notes: Less spicy",
      ].join("\n"),
    );
  });

  it("uses the typed building when it is not in the list, and skips empty fields", () => {
    const text = buildOrderMessage(
      lines.slice(0, 1),
      { ...EMPTY_DETAILS, otherBuilding: "Blue Tower, Al Nahda", flat: "5" },
      "R",
    );
    expect(text.split("\n").slice(-3)).toEqual([
      "Deliver to:",
      "Blue Tower, Al Nahda",
      "Flat / office 5",
    ]);
  });

  it("builds a wa.me link with the text encoded", () => {
    expect(whatsappUrl("971506539192", "1 x Tea & Coffee?")).toBe(
      "https://wa.me/971506539192?text=1%20x%20Tea%20%26%20Coffee%3F",
    );
  });

  it("points at the restaurant's WhatsApp number", () => {
    expect(menu.restaurant.whatsapp).toBe("971506539192");
  });
});
