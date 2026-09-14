import Link from "next/link";

import type { WorkSummary } from "../model/types";

/**
 * 카드 전체가 링크 하나다. CaseCard 와 같은 규칙이고, 실물 주소 한 줄만 더 갖는다.
 * 주소를 날짜 옆에 두는 이유: 이 목록에서 먼저 읽어야 하는 것이 "어디서 볼 수 있나" 다.
 */
export function WorkCard({ item }: { item: WorkSummary }) {
  const shown = item.tags.slice(0, 3);
  const rest = item.tags.length - shown.length;
  const host = item.link ? new URL(item.link).host.replace(/^www\./, "") : null;

  return (
    <Link
      href={`/works/${item.slug}`}
      className="flex flex-1 flex-col gap-2 rounded-lg border border-border bg-card p-5 transition-colors duration-150 ease-out hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
    >
      <span className="flex items-center gap-2 font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">
        <span>{item.date}</span>
        {host ? (
          <>
            <span>·</span>
            <span className="normal-case">{host}</span>
          </>
        ) : null}
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
