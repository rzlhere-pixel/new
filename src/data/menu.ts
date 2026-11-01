import raw from "@/data/menu.json";
import type { Group, Item, Menu, Section } from "@/data/menu.types";

/** The menu, bundled at build time. Edit src/data/menu.json, never this file. */
export const menu = raw as Menu;

if (import.meta.env.DEV) {
  // Dev-only check; zod stays out of the production bundle.
  void import("@/data/menu.schema").then(({ MenuSchema }) => {
    const result = MenuSchema.safeParse(raw);
    if (!result.success) console.warn("menu.json does not match the schema", result.error.issues);
  });
}

export interface ItemRef {
  item: Item;
  section: Section;
  group: Group;
}

/** Every item that is not hidden, in menu order. */
export function allItems(m: Menu = menu): ItemRef[] {
  const out: ItemRef[] = [];
  for (const group of m.groups)
    for (const section of group.sections)
      for (const item of section.items) if (!item.hidden) out.push({ item, section, group });
  return out;
}

export function visibleItems(section: Section): Item[] {
  return section.items.filter((i) => !i.hidden);
}
