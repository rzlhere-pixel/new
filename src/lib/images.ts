/** Section marks: menu.json `image` key → artwork in /public/food (served as AVIF, then WebP). */
export interface SectionArt {
  /** Path without extension. */
  src: string;
  size: number;
}

export const SECTION_IMAGES: Record<string, SectionArt[]> = {
  "biryani-handi": [{ src: "/food/biryani-handi-620", size: 620 }],
  "kizhi-porotta": [{ src: "/food/kizhi-porotta-267", size: 267 }],
  "fried-rice": [
    { src: "/food/fried-rice-128", size: 128 },
    { src: "/food/noodles-128", size: 128 },
    { src: "/food/schezwan-noodles-128", size: 128 },
    { src: "/food/schezwan-fried-rice-128", size: 128 },
  ],
};
