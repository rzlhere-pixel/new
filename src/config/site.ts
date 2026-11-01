export const SITE = {
  showDietMarkers: false, // turn on only after the restaurant confirms the veg/non-veg tags (MENU_DATA_NOTES §8)
  showItemNumbers: false, // serial numbers on list rows; always shown on the "Show to staff" screen
  enableMyList: true,
  qrPath: "/?src=table", // the QR encodes window.location.origin + qrPath
  publicUrlOverride: "", // set only if the QR must point at a custom domain
} as const;

/**
 * Short labels for the section chips only (section headings use `title` from menu.json).
 * A section that is missing here falls back to its title.
 */
export const CHIP_LABELS: Record<string, string> = {
  breakfast: "Breakfast",
  "tea-snacks": "Tea & Snacks",
  lunch: "Lunch",
  "wadi-daily-specials": "Daily Specials",
  "fish-specials": "Fish",
  "chinese-soups": "Chinese & Soups",
  "fried-rice-noodles": "Fried Rice & Noodles",
  starters: "Starters",
  chicken: "Chicken",
  beef: "Beef",
  mutton: "Mutton",
  veg: "Veg",
  bread: "Bread",
  "thattikoottu-special": "Thattikoottu",
  "mallus-thattikoottu-special": "Mallus Thattikoottu",
  combos: "Combos",
  "porotta-wraps": "Porotta Wraps",
  "drinks-juices": "Drinks",
};
