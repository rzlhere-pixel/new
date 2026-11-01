import type { Group, Section } from "@/data/menu.types";
import { menu, visibleItems } from "@/data/menu";
import type { DubaiNow } from "@/lib/time";
import { clsx as cn } from "clsx";
import { ItemRow } from "./ItemRow";
import { SectionMark } from "./Picture";

export function SectionHeader({
  section,
  level,
  title,
}: {
  section: Section;
  level: 2 | 3;
  title?: string;
}) {
  const H = level === 2 ? "h2" : "h3";
  return (
    <div className="reveal flex items-end gap-3">
      <H
        className={cn(
          "display min-w-0 text-title",
          level === 2 ? "text-[44px] leading-none" : "text-[32px] leading-[1.05]",
        )}
      >
        {title ?? section.title}
      </H>
      {section.image && (
        <span className="mb-0.5">
          <SectionMark image={section.image} />
        </span>
      )}
      <span className="ml-auto pb-1 text-[14px] leading-[1.4] font-medium text-muted">AED</span>
    </div>
  );
}

function SectionBlock({ section, level, now }: { section: Section; level: 2 | 3; now: DubaiNow }) {
  const items = visibleItems(section);
  if (!items.length) return null;
  return (
    <section id={section.id} aria-label={section.title} className="anchor pt-6" data-spy>
      <SectionHeader section={section} level={level} />
      <ul className="mt-2">
        {items.map((item) => (
          <ItemRow key={item.id} item={item} now={now} />
        ))}
      </ul>
    </section>
  );
}

function GroupBlock({ group, now }: { group: Group; now: DubaiNow }) {
  const sections = group.sections.filter((s) => visibleItems(s).length);
  if (!sections.length) return null;
  const single = sections.length === 1;
  return (
    <div
      id={single ? undefined : group.id}
      className="anchor border-t border-rule pt-4 pb-6 first:border-t-0"
    >
      {!single && (
        <h2 className="reveal display pt-4 text-[44px] leading-none text-title">{group.title}</h2>
      )}
      {group.note && (
        <p className={cn("text-[17px] font-medium", single ? "pt-4" : "mt-2")}>{group.note}</p>
      )}
      {sections.map((s) => (
        <SectionBlock key={s.id} section={s} level={single ? 2 : 3} now={now} />
      ))}
    </div>
  );
}

export function MenuList({ now }: { now: DubaiNow }) {
  return (
    <div>
      {menu.groups.map((g) => (
        <GroupBlock key={g.id} group={g} now={now} />
      ))}
    </div>
  );
}
