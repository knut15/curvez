import Link from "next/link";

import type { CaseSummary } from "../model/types";

/**
 * 카드 전체가 링크 하나다. 안에 별도 링크를 두지 않는다 —
 * 카드마다 탭이 여러 번 필요해지고 접근 이름도 달라진다.
 */
export function CaseCard({ item }: { item: CaseSummary }) {
  const shown = item.tags.slice(0, 3);
  const rest = item.tags.length - shown.length;

  return (
    <Link
      href={`/cases/${item.slug}`}
      className="flex flex-col gap-2 rounded-lg border border-border bg-card p-5 transition-colors duration-150 ease-out hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
    >
      <span className="line-clamp-2 text-lg font-medium text-card-foreground">
        {item.title}
      </span>
      <span className="line-clamp-3 text-sm text-muted-foreground">
        {item.summary}
      </span>
      <span className="mt-auto flex flex-wrap items-center gap-2 pt-2 text-xs text-muted-foreground">
        <span>{item.date}</span>
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
