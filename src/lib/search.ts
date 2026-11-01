import type { Group, Item, Menu, Section } from "@/data/menu.types";

/**
 * Spellings diners use for the same thing. The first word in each list is the
 * canonical form. Multi-word entries are matched as phrases.
 */
const SYNONYMS: string[][] = [
  ["biriyani", "biryani", "briyani", "biriani"],
  ["porotta", "parotta", "paratha", "barotta", "parota", "porota"],
  ["chilly", "chilli", "chili"],
  ["chapathi", "chappathi", "chapati", "chapatti"],
  ["omelette", "omlet", "omelet", "omlete"],
  ["idly", "idli"],
  ["samoosa", "samosa"],
  ["kheema", "keema"],
  ["manchurian", "manjurian"],
  ["schezwan", "szechuan", "schezuan", "szechwan"],
  ["chemmeen", "prawns", "prawn", "shrimp"],
  ["fish", "meen"],
  ["chicken", "kozhi"],
  ["mathi", "sardine", "sardines"],
  ["ayala", "mackerel"],
  ["neymeen", "king fish", "kingfish", "seer", "seer fish"],
  ["kappa", "tapioca"],
  ["kadala", "chickpea", "chickpeas", "chana"],
  ["cherupayar", "moong", "green gram"],
  ["ghee", "ney"],
  ["pazhampori", "pazham pori", "banana fry"],
  ["parippuvada", "parippu vada", "dal vada", "dal vadai"],
];

const PHRASES: [RegExp, string][] = [];
const WORDS = new Map<string, string>();
for (const [canonical, ...rest] of SYNONYMS) {
  for (const form of [canonical, ...rest]) {
    if (form.includes(" ")) PHRASES.push([new RegExp(`\\b${form}\\b`, "g"), canonical]);
    else WORDS.set(form, canonical);
  }
}

/** Lowercase, strip diacritics and punctuation, collapse spaces. */
export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

/** Normalised text with every synonym folded to its canonical word. */
export function canonical(s: string): string {
  let t = normalize(s);
  for (const [re, to] of PHRASES) t = t.replace(re, to);
  return t
    .split(" ")
    .map((w) => WORDS.get(w) ?? w)
    .join(" ");
}

export interface SearchHit {
  item: Item;
  section: Section;
  group: Group;
}

export interface SearchSectionResult {
  section: Section;
  group: Group;
  items: Item[];
}

interface IndexEntry extends SearchHit {
  words: string[];
  serials: Set<string>;
}

const indexCache = new WeakMap<Menu, IndexEntry[]>();

function buildIndex(menu: Menu): IndexEntry[] {
  const out: IndexEntry[] = [];
  for (const group of menu.groups)
    for (const section of group.sections)
      for (const item of section.items) {
        if (item.hidden) continue;
        const text = [
          item.name,
          item.options ?? "",
          ...(item.variants ?? []).map((v) => v.label ?? ""),
          section.title,
          section.title === group.title ? "" : group.title,
        ].join(" ");
        const words = new Set([...normalize(text).split(" "), ...canonical(text).split(" ")]);
        const serials = new Set<string>();
        if (item.no) serials.add(item.no);
        for (const v of item.variants ?? []) if (v.no) serials.add(v.no);
        out.push({ item, section, group, words: [...words].filter(Boolean), serials });
      }
  return out;
}

function tokenMatches(entry: IndexEntry, token: string): boolean {
  if (/^\d+$/.test(token)) {
    // Numbers: serial numbers from the printed menu, or a number in the name ("Chicken 65").
    return entry.serials.has(token) || entry.words.includes(token);
  }
  const canon = WORDS.get(token) ?? token;
  return entry.words.some((w) => w.startsWith(token) || w.startsWith(canon));
}

/** Items matching every word of the query, grouped by section, in menu order. */
export function search(menu: Menu, query: string): SearchSectionResult[] {
  const q = normalize(query);
  if (!q) return [];
  let idx = indexCache.get(menu);
  if (!idx) indexCache.set(menu, (idx = buildIndex(menu)));
  // Fold multi-word synonyms in the query ("king fish", "dal vada") before splitting.
  let folded = q;
  for (const [re, to] of PHRASES) folded = folded.replace(re, to);
  const tokens = folded.split(" ").filter(Boolean);

  const results: SearchSectionResult[] = [];
  for (const entry of idx) {
    if (!tokens.every((t) => tokenMatches(entry, t))) continue;
    const last = results[results.length - 1];
    if (last && last.section === entry.section) last.items.push(entry.item);
    else results.push({ section: entry.section, group: entry.group, items: [entry.item] });
  }
  return results;
}

/** Ranges in `text` to highlight for `query`: literal prefixes, or whole words that are synonyms. */
export function highlightRanges(text: string, query: string): [number, number][] {
  const tokens = normalize(query).split(" ").filter(Boolean);
  if (!tokens.length) return [];
  const ranges: [number, number][] = [];
  const re = /[\p{L}\p{N}]+/gu;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const word = normalize(m[0]);
    const canon = WORDS.get(word) ?? word;
    for (const t of tokens) {
      const tc = WORDS.get(t) ?? t;
      if (word.startsWith(t)) {
        ranges.push([m.index, m.index + Math.min(t.length, m[0].length)]);
        break;
      }
      if (canon === tc || canon.startsWith(tc)) {
        ranges.push([m.index, m.index + m[0].length]);
        break;
      }
    }
  }
  return ranges;
}
