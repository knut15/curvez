import Link from "next/link";

import type { CaseSummary } from "../model/types";

/**
 * 리스트 보기의 한 줄. `CaseCard` 와 같은 글을 가리키지만 담는 것이 다르다.
 *
 * 카드는 한 건을 훑어보는 자리라 요약을 세 줄까지 보여 준다. 리스트는 **여러 건을 위아래로
 * 비교하는 자리**라, 줄 높이가 항목마다 달라지면 눈이 걸린다. 그래서 제목과 요약을 한 줄씩만
 * 두고 넘치는 것은 자른다.
 *
 * 날짜를 오른쪽 끝에 세로로 정렬한다. 같은 자리에 있어야 위아래로 훑으면서 시기를 읽는다.
 * 좁은 폭에서는 요약을 감춘다 — 세 조각을 한 줄에 밀어 넣으면 전부 잘려 아무것도 안 읽힌다.
 */
export function CaseRow({ item }: { item: CaseSummary }) {
  return (
    <Link
      href={`/cases/${item.slug}`}
      className="flex items-baseline gap-4 rounded-md px-3 py-3.5 transition-colors duration-150 ease-out hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
    >
      <span className="min-w-0 shrink-0 basis-[42%] truncate font-[510] tracking-[-0.015em] text-foreground">
        {item.title}
      </span>
      <span className="hidden min-w-0 flex-1 truncate text-sm text-muted-foreground sm:block">
        {item.summary}
      </span>
      <span className="ml-auto shrink-0 text-[0.8125rem] text-muted-foreground">
        {item.date}
      </span>
    </Link>
  );
}
