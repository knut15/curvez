import Link from "next/link";

import type { LabSummary } from "../model/types";

/**
 * 카드 전체가 링크 하나다. CaseCard 와 같은 규칙이고, 상태 배지 한 줄만 더 갖는다.
 * 배지를 제목 위에 두는 이유: 이 목록에서 먼저 읽어야 하는 것이 "얼마나 왔나" 다.
 */
export function LabCard({ item }: { item: LabSummary }) {
  const shown = item.tags.slice(0, 3);
  const rest = item.tags.length - shown.length;

  return (
    <Link
      href={`/labs/${item.slug}`}
      className="flex flex-col gap-2 rounded-lg border border-border bg-card p-5 transition-colors duration-150 ease-out hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
    >
      <span className="flex items-center gap-2 font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">
        <span
          aria-hidden
          className={
            item.status === "진행 중"
              ? "size-1.5 rounded-full bg-brand-accent"
              : "size-1.5 rounded-full bg-muted-foreground"
          }
        />
        <span className="font-sans tracking-normal normal-case">
          {item.status}
        </span>
        <span>·</span>
        <span>{item.date}</span>
      </span>
      <span className="line-clamp-2 text-lg font-medium text-card-foreground">
        {item.title}
      </span>
      <span className="line-clamp-3 text-sm text-muted-foreground">
        {item.summary}
      </span>
      <span className="mt-auto flex flex-wrap items-center gap-2 pt-2 text-xs text-muted-foreground">
        {shown.map((tag) => (
          <span key={tag} className="rounded-sm bg-muted px-2 py-0.5">
            {tag}
          </span>
        ))}
        {rest > 0 ? <span>+{rest}</span> : null}
      </span>
    </Link>
  );
}
