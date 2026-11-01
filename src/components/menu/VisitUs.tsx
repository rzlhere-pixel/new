import { Mail, MapPin, Phone } from "lucide-react";
import { menu } from "@/data/menu";
import { formatSourceDate } from "@/lib/format";
import { formatClock } from "@/lib/time";
import { StorefrontFront } from "./Picture";

export function VisitUs() {
  const r = menu.restaurant;
  const { open, close } = r.hours.daily;
  return (
    <footer
      aria-labelledby="visit-title"
      className="bg-facade pb-[calc(var(--bottom-bar-h)+env(safe-area-inset-bottom)+72px)] text-[#F3ECE3]"
    >
      <div className="mx-auto max-w-[640px]">
        <StorefrontFront
          alt="Arous Al Wadi Restaurant shop front on Bukhara Street"
          className="aspect-[2.66/1] h-auto w-full object-cover"
        />
        <div className="reveal px-5 pt-6">
          <h2 id="visit-title" className="display text-[44px] leading-none text-neon">
            Visit us
          </h2>
          <address className="mt-3 text-[17px] not-italic">
            <span className="block font-medium">{r.name}</span>
            <span lang="ar" dir="rtl" className="block text-left">
              {r.nameAr}
            </span>
            <span className="block">{r.address}</span>
          </address>
          <p className="mt-3">
            Open daily {formatClock(open)} to {formatClock(close)}
          </p>
          {r.freeHomeDelivery && <p className="mt-1 font-medium">Free home delivery</p>}
          <a
            href={r.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="press mt-4 inline-flex h-12 items-center gap-2 rounded-full bg-neon px-6 text-[17px] font-semibold text-facade"
          >
            <MapPin aria-hidden className="size-[18px]" />
            Get directions
          </a>
          <ul className="mt-5 border-t border-gold/30">
            {r.phones.map((p) => (
              <li key={p.tel} className="border-b border-gold/30">
                <a href={`tel:${p.tel}`} className="flex min-h-12 items-center gap-3">
                  <Phone aria-hidden className="size-[18px] text-neon" />
                  <span className="price">{p.display}</span>
                  <span className="ml-auto text-[14px] text-[#B5A99C]">{p.label}</span>
                </a>
              </li>
            ))}
            <li className="border-b border-gold/30">
              <a href={`mailto:${r.email}`} className="flex min-h-12 items-center gap-3 break-all">
                <Mail aria-hidden className="size-[18px] shrink-0 text-neon" />
                {r.email}
              </a>
            </li>
          </ul>
          <p className="mt-5 text-[14px] leading-[1.4] text-[#B5A99C]">
            Prices updated {formatSourceDate(menu.meta.sourceDate)}
            <br />
            Prices in AED
          </p>
        </div>
      </div>
    </footer>
  );
}
