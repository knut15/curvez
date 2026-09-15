import Link from "next/link";

import type { LabSummary } from "../model/types";

/**
 * 리스트 보기의 한 줄. `CaseRow` 와 같은 규칙이고 상태 점 하나를 앞에 더 갖는다.
 *
 * 점을 맨 앞에 두는 이유는 카드와 같다 — 이 목록에서 먼저 읽어야 하는 것이 "얼마나 왔나" 다.
 * 다만 카드와 달리 낱말(`진행 중`)은 좁은 폭에서 감춘다. 점만으로는 뜻이 전해지지 않으므로
 * 점에 `title` 을 걸어 둔다.
 */
export function LabRow({ item }: { item: LabSummary }) {
  const running = item.status === "진행 중";

  return (
    <Link
      href={`/labs/${item.slug}`}
      className="flex items-baseline gap-3 rounded-md px-3 py-3.5 transition-colors duration-150 ease-out hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
    >
      <span
        aria-hidden
        title={item.status}
        className={`size-1.5 shrink-0 translate-y-[-1px] rounded-full ${
          running ? "bg-brand-accent" : "bg-muted-foreground"
        }`}
      />
      <span className="min-w-0 shrink-0 basis-[42%] truncate font-[510] tracking-[-0.015em] text-foreground">
        {item.title}
      </span>
      <span className="hidden min-w-0 flex-1 truncate text-sm text-muted-foreground sm:block">
        {item.summary}
      </span>
      <span className="ml-auto hidden shrink-0 text-[0.8125rem] text-muted-foreground md:block">
        {item.status}
      </span>
      <span className="shrink-0 text-[0.8125rem] text-muted-foreground max-md:ml-auto">
        {item.date}
      </span>
    </Link>
  );
}
