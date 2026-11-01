import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import QRCode from "qrcode";
import { menu } from "@/data/menu";
import { SITE } from "@/config/site";
import { clsx as cn } from "clsx";

export const Route = createFileRoute("/qr")({
  head: () => ({
    meta: [
      { title: "Print the menu QR | Arous Al Wadi Restaurant" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: QrPage,
});

const QR_OPTIONS = {
  errorCorrectionLevel: "Q" as const,
  margin: 4, // quiet zone, in modules
  color: { dark: "#1F1A17ff", light: "#FFFFFFff" },
};

type Layout = "cards" | "poster";

function useMenuUrl() {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const base = (SITE.publicUrlOverride || window.location.origin).replace(/\/$/, "");
    setUrl(base + SITE.qrPath);
  }, []);
  return url;
}

function isPreview(url: string) {
  return /localhost|127\.0\.0\.1|lovableproject\.com|preview/i.test(url);
}

function download(href: string, name: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function QrPage() {
  const url = useMenuUrl();
  const [svg, setSvg] = useState("");
  const [layout, setLayout] = useState<Layout>("cards");

  useEffect(() => {
    if (!url) return;
    let alive = true;
    void QRCode.toString(url, { ...QR_OPTIONS, type: "svg" }).then((s) => alive && setSvg(s));
    return () => {
      alive = false;
    };
  }, [url]);

  const downloadSvg = () => {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const href = URL.createObjectURL(blob);
    download(href, "arous-alwadi-menu-qr.svg");
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  };
  const downloadPng = async () => {
    const href = await QRCode.toDataURL(url, { ...QR_OPTIONS, width: 2048 });
    download(href, "arous-alwadi-menu-qr.png");
  };

  return (
    <div className="min-h-svh bg-[#E9E4DE] text-ink print:bg-white">
      <div className="no-print mx-auto max-w-[840px] px-5 py-6">
        <h1 className="display text-[44px] leading-none text-brand-red">Print the menu QR</h1>
        {url && isPreview(url) && (
          <p
            role="alert"
            className="mt-4 rounded-[12px] bg-brand-red-deep px-4 py-3 font-medium text-white"
          >
            This QR points at a preview address. Open /qr on the published site before printing.
          </p>
        )}
        <p className="mt-4 text-[17px]">
          The code opens <span className="font-semibold break-all">{url || "…"}</span>
        </p>
        <fieldset className="mt-4 flex flex-wrap gap-2">
          <legend className="sr-only">Layout</legend>
          {(
            [
              ["cards", "Table cards (A6, 2 on A4)"],
              ["poster", "Poster (A4)"],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className={cn(
                "inline-flex min-h-11 cursor-pointer items-center rounded-full px-4 text-[15px] font-medium",
                layout === value ? "bg-neon text-facade" : "bg-white text-ink",
              )}
            >
              <input
                type="radio"
                name="layout"
                value={value}
                checked={layout === value}
                onChange={() => setLayout(value)}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </fieldset>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!svg}
            onClick={downloadSvg}
            className="inline-flex h-11 items-center rounded-full border-2 border-ink px-4 font-semibold"
          >
            Download QR (SVG)
          </button>
          <button
            type="button"
            disabled={!url}
            onClick={downloadPng}
            className="inline-flex h-11 items-center rounded-full border-2 border-ink px-4 font-semibold"
          >
            Download QR (PNG, 2048 px)
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-11 items-center rounded-full bg-brand-red-deep px-5 font-semibold text-white"
          >
            Print
          </button>
        </div>
      </div>

      <div className="overflow-x-auto pb-10 print:overflow-visible print:pb-0">
        {layout === "cards" ? (
          <Sheet>
            <div className="flex h-[148mm]">
              <TableCard svg={svg} url={url} />
              <TableCard svg={svg} url={url} dashed />
            </div>
            <p className="no-print border-t border-dashed border-[#BBB] pt-2 text-center text-[13px] text-[#5E5650]">
              Cut along the dashed lines
            </p>
          </Sheet>
        ) : (
          <Sheet>
            <Poster svg={svg} url={url} />
          </Sheet>
        )}
      </div>
    </div>
  );
}

function Sheet({ children }: { children: React.ReactNode }) {
  return (
    <div className="print-sheet mx-auto h-[297mm] w-[210mm] overflow-hidden bg-white shadow-[0_1px_8px_rgb(0_0_0/0.15)]">
      {children}
    </div>
  );
}

function Qr({ svg, className }: { svg: string; className: string }) {
  return svg ? (
    <div
      role="img"
      aria-label="QR code for the menu"
      className={cn("[&>svg]:block [&>svg]:size-full", className)}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  ) : (
    <div className={cn("bg-[#F3F0EC]", className)} />
  );
}

/*
 * Arabic and Malayalam lines: have a native speaker check both before printing.
 *   ar: امسح الرمز لعرض القائمة   ml: മെനു കാണാൻ സ്കാൻ ചെയ്യൂ
 */
function ScanLines({ big = false }: { big?: boolean }) {
  return (
    <div className="text-center">
      <p className={cn("display leading-none text-brand-red", big ? "text-[64px]" : "text-[32px]")}>
        Scan for the menu
      </p>
      <p
        lang="ar"
        dir="rtl"
        className={cn("mt-1 font-medium", big ? "text-[26px]" : "text-[15px]")}
      >
        امسح الرمز لعرض القائمة
      </p>
      <p
        lang="ml"
        className={cn(
          "font-medium [font-family:'Noto_Sans_Malayalam','Manjari',sans-serif]",
          big ? "text-[22px]" : "text-[13px]",
        )}
      >
        മെനു കാണാൻ സ്കാൻ ചെയ്യൂ
      </p>
    </div>
  );
}

function Contact({ url, big = false }: { url: string; big?: boolean }) {
  const r = menu.restaurant;
  return (
    <div className={cn("text-center", big ? "text-[18px]" : "text-[11px] leading-[1.35]")}>
      <p className="font-semibold break-all">{url.replace(/^https?:\/\//, "")}</p>
      <p className="mt-0.5 flex justify-center gap-x-[1.2em] tabular-nums">
        {r.phones.map((p) => (
          <span key={p.tel}>{p.display}</span>
        ))}
      </p>
      {r.freeHomeDelivery && (
        <p className="font-semibold text-brand-red-deep">Free home delivery</p>
      )}
    </div>
  );
}

function TableCard({ svg, url, dashed = false }: { svg: string; url: string; dashed?: boolean }) {
  return (
    <div
      className={cn(
        "flex h-[148mm] w-[105mm] flex-col items-center justify-between px-[8mm] py-[7mm]",
        dashed && "border-l border-dashed border-[#BBB]",
      )}
    >
      <img
        src="/brand/logo-stacked.png"
        alt="Arous Al Wadi Restaurant"
        className="h-auto w-[30mm]"
      />
      <ScanLines />
      <Qr svg={svg} className="size-[52mm]" />
      <Contact url={url} />
    </div>
  );
}

function Poster({ svg, url }: { svg: string; url: string }) {
  return (
    <div className="relative flex h-[297mm] w-[210mm] flex-col items-center justify-between px-[16mm] py-[14mm]">
      <img
        src="/brand/logo-stacked.png"
        alt="Arous Al Wadi Restaurant"
        className="h-auto w-[62mm]"
      />
      <ScanLines big />
      <Qr svg={svg} className="size-[105mm]" />
      <Contact url={url} big />
      <picture>
        <source srcSet="/food/bone-in-leg-480.avif" type="image/avif" />
        <img
          src="/food/bone-in-leg-480.webp"
          alt=""
          className="absolute top-[14mm] right-[14mm] size-[30mm] rounded-full object-cover"
        />
      </picture>
    </div>
  );
}
