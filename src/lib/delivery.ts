import data from "@/data/delivery-buildings.json";
import { formatPrice } from "@/lib/format";
import { normalize } from "@/lib/search";
import { optionText, type ResolvedLine } from "@/lib/my-list";

export interface Building {
  id: string;
  name: string;
  street: string;
}

/** Buildings in the delivery area, A to Z. Edit src/data/delivery-buildings.json. */
export const BUILDINGS: Building[] = data.buildings;

const byId = new Map(BUILDINGS.map((b) => [b.id, b]));
export const buildingById = (id: string) => byId.get(id);

/** Buildings whose name or street contains every word typed, in list order. */
export function searchBuildings(query: string, list: Building[] = BUILDINGS): Building[] {
  const words = normalize(query).split(" ").filter(Boolean);
  if (!words.length) return list;
  return list.filter((b) => {
    const hay = normalize(`${b.name} ${b.street}`);
    return words.every((w) => hay.includes(w));
  });
}

export interface DeliveryDetails {
  /** A building id from the list, or "" when the customer typed their own. */
  buildingId: string;
  /** Free text when the building is not in the list. */
  otherBuilding: string;
  flat: string;
  floor: string;
  name: string;
  notes: string;
}

export const EMPTY_DETAILS: DeliveryDetails = {
  buildingId: "",
  otherBuilding: "",
  flat: "",
  floor: "",
  name: "",
  notes: "",
};

export function buildingLabel(d: DeliveryDetails): string {
  const b = d.buildingId ? buildingById(d.buildingId) : undefined;
  if (b) return `${b.name}, ${b.street}`;
  return d.otherBuilding.trim();
}

export type DeliveryProblem = "building" | "flat";

export function deliveryProblems(d: DeliveryDetails): DeliveryProblem[] {
  const out: DeliveryProblem[] = [];
  if (!buildingLabel(d)) out.push("building");
  if (!d.flat.trim()) out.push("flat");
  return out;
}

export interface OrderTotals {
  total: number;
  /** Number of lines left out of the total because they are priced by size. */
  unpriced: number;
}

export function orderTotals(lines: ResolvedLine[]): OrderTotals {
  let total = 0;
  let unpriced = 0;
  for (const l of lines) {
    if (l.unitPrice === null) unpriced++;
    else total += l.unitPrice * l.qty;
  }
  return { total: Math.round(total * 100) / 100, unpriced };
}

/** Plain-text order for WhatsApp. Serial numbers match the printed menu. */
export function buildOrderMessage(
  lines: ResolvedLine[],
  d: DeliveryDetails,
  restaurantName: string,
): string {
  const { total, unpriced } = orderTotals(lines);
  const items = lines.map((l) => {
    const opt = optionText(l);
    return `${l.qty} x ${l.no ? `${l.no}. ` : ""}${l.item.name}${opt ? ` (${opt})` : ""}`;
  });
  const flat = [`Flat / office ${d.flat.trim()}`, d.floor.trim() && `floor ${d.floor.trim()}`]
    .filter(Boolean)
    .join(", ");
  return [
    `Delivery order for ${restaurantName}`,
    "",
    ...items,
    "",
    `Approx. total: AED ${formatPrice(total)}${unpriced ? ` (plus ${unpriced} priced by size)` : ""}`,
    "",
    "Deliver to:",
    buildingLabel(d),
    flat,
    ...(d.name.trim() ? [`Name: ${d.name.trim()}`] : []),
    ...(d.notes.trim() ? [`Notes: ${d.notes.trim()}`] : []),
  ].join("\n");
}

export function whatsappUrl(number: string, text: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

const KEY = "aaw:delivery:v1";

/** The last address used on this phone, so regulars don't retype it. */
export function loadDetails(): DeliveryDetails {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY_DETAILS;
    const parsed = JSON.parse(raw) as Partial<Record<keyof DeliveryDetails, unknown>>;
    const str = (v: unknown) => (typeof v === "string" ? v.slice(0, 200) : "");
    const d: DeliveryDetails = {
      buildingId: str(parsed.buildingId),
      otherBuilding: str(parsed.otherBuilding),
      flat: str(parsed.flat),
      floor: str(parsed.floor),
      name: str(parsed.name),
      notes: "",
    };
    // A building removed from the list since last time: start the choice again.
    if (d.buildingId && !buildingById(d.buildingId)) d.buildingId = "";
    return d;
  } catch {
    return EMPTY_DETAILS;
  }
}

export function saveDetails(d: DeliveryDetails) {
  try {
    // Notes are for one order only.
    window.localStorage.setItem(KEY, JSON.stringify({ ...d, notes: "" }));
  } catch {
    // Storage blocked: the form still works for this visit.
  }
}
