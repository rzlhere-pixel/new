import type { Menu } from "@/data/menu.types";

/** schema.org Restaurant with its full menu, generated from menu.json (never hand-written). */
export function restaurantJsonLd(menu: Menu, origin = "") {
  const r = menu.restaurant;
  const offer = (price: number) => ({
    "@type": "Offer",
    price: price.toFixed(2),
    priceCurrency: menu.meta.currency,
  });
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: r.name,
    alternateName: r.nameAr,
    ...(origin && { url: origin, image: `${origin}/og-image.jpg` }),
    address: {
      "@type": "PostalAddress",
      streetAddress: "Bukhara Street",
      addressLocality: "Al Nahda",
      addressRegion: "Sharjah",
      addressCountry: "AE",
    },
    geo: { "@type": "GeoCoordinates", latitude: r.geo.lat, longitude: r.geo.lng },
    hasMap: r.mapsUrl,
    telephone: r.phones.map((p) => p.tel),
    email: r.email,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: `${r.hours.daily.open}:00`,
        closes: r.hours.daily.close === "24:00" ? "23:59:59" : `${r.hours.daily.close}:00`,
      },
    ],
    servesCuisine: ["Kerala", "South Indian", "Indo-Chinese"],
    priceRange: "AED 1–45",
    acceptsReservations: false,
    hasMenu: {
      "@type": "Menu",
      name: `${r.name} menu`,
      inLanguage: "en",
      hasMenuSection: menu.groups.flatMap((g) =>
        g.sections.map((s) => ({
          "@type": "MenuSection",
          name: s.title === g.title ? s.title : `${g.title}: ${s.title}`,
          hasMenuItem: s.items
            .filter((i) => !i.hidden)
            .map((i) => {
              const prices = i.variants
                ? i.variants.filter((v) => v.price !== null).map((v) => offer(v.price as number))
                : typeof i.price === "number"
                  ? [offer(i.price)]
                  : [];
              return {
                "@type": "MenuItem",
                name: i.name,
                ...(prices.length === 1 && { offers: prices[0] }),
                ...(prices.length > 1 && { offers: prices }),
              };
            }),
        })),
      ),
    },
  };
}
