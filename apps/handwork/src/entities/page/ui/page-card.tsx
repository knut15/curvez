import Link from "next/link";

import type { PageSummary } from "../model/types";

/**
 * 전용 화면이 없는 메뉴의 카드. `LabCard` 와 같은 규칙이되 **있는 값만** 그린다.
 *
 * 새 메뉴의 글은 어떤 필드를 채울지 정해지지 않았다. 없는 값 자리에 `-` 를 채우면
 * 목록이 자리표시자로 가득 차므로, 비어 있으면 그 줄 자체를 그리지 않는다.
 */
export function PageCard({
  collection,
  item,
}: {
  collection: string;
  item: PageSummary;
}) {
  const tags = item.tags ?? [];
  const shown = tags.slice(0, 3);
  const rest = tags.length - shown.length;
  const meta = [item.date, item.role].filter(
    (part): part is string => typeof part === "string" && part !== "",
  );

  return (
    <Link
      href={`/${collection}/${item.slug}`}
      className="flex flex-1 flex-col gap-2 rounded-lg border border-border bg-card p-5 transition-colors duration-150 ease-out hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
    >
      {meta.length > 0 ? (
        <span className="font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">
          {meta.join(" · ")}
        </span>
      ) : null}

      <span className="line-clamp-2 text-lg font-medium text-card-foreground">
        {item.title}
      </span>

      {item.summary !== "" ? (
        <span className="line-clamp-3 text-sm leading-relaxed break-keep text-muted-foreground">
          {item.summary}
        </span>
      ) : null}

      {shown.length > 0 ? (
        <span className="mt-auto flex flex-wrap gap-1.5 pt-2">
          {shown.map((tag) => (
            <span
              key={tag}
              className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.7rem] text-muted-foreground"
            >
              {tag}
            </span>
          ))}
          {rest > 0 ? (
            <span className="px-1 py-0.5 font-mono text-[0.7rem] text-muted-foreground">
              +{rest}
            </span>
          ) : null}
        </span>
      ) : null}
    </Link>
  );
}
