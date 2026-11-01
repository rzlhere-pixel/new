import { Fragment, useMemo } from "react";
import { menu } from "@/data/menu";
import { highlightRanges, search } from "@/lib/search";
import type { DubaiNow } from "@/lib/time";
import { ItemRow } from "./ItemRow";
import { SectionHeader } from "./MenuList";

function Highlight({ text, query }: { text: string; query: string }) {
  const ranges = highlightRanges(text, query);
  if (!ranges.length) return <>{text}</>;
  const parts: React.ReactNode[] = [];
  let at = 0;
  ranges.forEach(([s, e], i) => {
    if (s > at) parts.push(<Fragment key={`t${i}`}>{text.slice(at, s)}</Fragment>);
    parts.push(
      <mark key={`m${i}`} className="rounded-[3px] bg-ghee px-0.5 text-ink">
        {text.slice(s, e)}
      </mark>,
    );
    at = e;
  });
  if (at < text.length) parts.push(<Fragment key="end">{text.slice(at)}</Fragment>);
  return <>{parts}</>;
}

export function SearchResults({ query, now }: { query: string; now: DubaiNow }) {
  const results = useMemo(() => search(menu, query), [query]);
  const count = results.reduce((n, r) => n + r.items.length, 0);

  return (
    <div className="pb-6">
      <p role="status" className="pt-4 text-[14px] leading-[1.4] text-muted">
        {count === 0 ? "" : `${count} ${count === 1 ? "dish" : "dishes"} match "${query.trim()}"`}
      </p>
      {count === 0 ? (
        <p className="py-10 text-[17px]">
          No dishes match "{query.trim()}". Try another spelling, or a number from the printed menu.
        </p>
      ) : (
        results.map((r) => (
          <section key={r.section.id} aria-label={r.section.title} className="pt-4">
            <SectionHeader section={r.section} level={3} />
            <ul className="mt-2">
              {r.items.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  now={now}
                  renderName={(name) => <Highlight text={name} query={query} />}
                />
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
