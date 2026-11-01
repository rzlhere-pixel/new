export type Day = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";
export type Diet = "veg" | "non-veg" | null;

export interface Variant {
  label: string | null;
  price: number | null;
  priceNote?: string;
  no?: string;
}

export interface Item {
  id: string;
  no?: string;
  name: string;
  /** Exact sheet text. Internal: never rendered. */
  source: string;
  /** Single-price items. */
  price?: number | null;
  priceNote?: string;
  /** Multi-option items (no item-level price). */
  variants?: Variant[];
  /** A choice that does not change the price, e.g. "Ayala or King Fish". */
  options?: string;
  /** Daily specials and Kallil Chutta Chicken. */
  availableDays?: Day[];
  /** Still to be confirmed with the restaurant. Internal: never rendered. */
  confirm?: string;
  diet: Diet;
  /** Staff edits through GitHub. */
  soldOut?: boolean;
  hidden?: boolean;
}

export interface Section {
  id: string;
  title: string;
  image?: string;
  items: Item[];
}

export interface Group {
  id: string;
  title: string;
  note?: string;
  source?: string;
  /** Happy Hour only. */
  window?: { days: Day[]; from: string; to: string };
  sections: Section[];
}

export interface MenuMeta {
  source: string;
  sourceDate: string;
  currency: string;
  timezone: string;
  excluded: string;
}

export interface Phone {
  label: string;
  display: string;
  tel: string;
}

export interface Restaurant {
  name: string;
  nameAr: string;
  logoTaglineMl: string;
  area: string;
  address: string;
  geo: { lat: number; lng: number };
  mapsUrl: string;
  hours: { daily: { open: string; close: string }; source: string };
  phones: Phone[];
  whatsapp: string | null;
  email: string;
  freeHomeDelivery: boolean;
}

export interface Menu {
  meta: MenuMeta;
  restaurant: Restaurant;
  groups: Group[];
}
