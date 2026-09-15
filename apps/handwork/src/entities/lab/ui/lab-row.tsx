import Link from "next/link";

import type { LabSummary } from "../model/types";

/**
 * 리스트 보기의 한 줄. `CaseRow` 와 같은 규칙이고 상태 한 칸을 오른쪽에 더 갖는다.
 *
 * **상태는 낱말로만 둔다.** 앞에 점을 세우면 케이스 목록과 제목이 시작하는 축이 어긋나,
 * 두 화면을 오가며 볼 때 같은 형식의 목록으로 읽히지 않는다. 점은 카드 보기에 남아 있다 —
 * 거기서는 한 건씩 보므로 옆 목록과 줄을 맞출 대상이 없다.
 *
 * 좁은 폭에서는 낱말을 감춘다. 세 조각을 한 줄에 밀어 넣으면 전부 잘려 아무것도 안 읽힌다.
 */
export function LabRow({ item }: { item: LabSummary }) {
  return (
    <Link
      href={`/labs/${item.slug}`}
      className="flex items-baseline gap-4 rounded-md px-3 py-3.5 transition-colors duration-150 ease-out hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
    >
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
