import Link from "next/link";

import type { WorkSummary } from "../model/types";
import { WorkGlyph } from "./work-glyph";

/**
 * 작업 카드. 위에서부터 **날짜 → 그림 → 제목 → 설명 → 태그** 순이다.
 *
 * 날짜를 그림 위에 두는 이유: 작업 목록에서 먼저 읽히는 것이 "언제 만든 것인가" 다.
 * 스무 건이 한 화면에 늘어서면 제목보다 시기가 먼저 눈에 들어와야 순서가 잡힌다.
 *
 * **면을 두르지 않는다.** Cases·Labs 의 카드는 테두리를 가진 상자인데, 여기서는 그림이
 * 이미 자기 면을 갖고 있어 상자를 한 번 더 두르면 액자 속 액자가 된다. 대신 그림에만
 * 테두리를 주고 글자는 그 아래에 그대로 놓는다.
 *
 * **주소는 목록에 두지 않는다.** 대부분 같은 호스트라 가려 주는 것이 거의 없고, 태그 줄
 * 끝에 붙이면 태그가 길 때 혼자 다음 줄로 떨어져 카드마다 높이가 달라진다. 주소는
 * 상세 화면이 갖는다.
 */
export function WorkCard({ item }: { item: WorkSummary }) {
  return (
    <Link
      href={`/works/${item.slug}`}
      className="group flex flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      <span className="flex items-baseline gap-2 text-[0.6875rem] tracking-[0.08em] text-muted-foreground uppercase">
        {item.date}
        <span aria-hidden>·</span>
        <span className="normal-case">{item.role}</span>
      </span>

      <span className="mt-2.5 block overflow-hidden rounded-xl border border-border bg-card text-muted-foreground transition-colors duration-150 ease-out group-hover:bg-accent motion-reduce:transition-none">
        <WorkGlyph seed={item.slug} />
      </span>

      <span className="mt-4 block text-[1.0625rem] leading-snug font-[510] tracking-[-0.015em] break-keep text-foreground">
        {item.title}
      </span>

      <span className="mt-2 line-clamp-3 block text-[0.8125rem] leading-relaxed break-keep text-muted-foreground">
        {item.summary}
      </span>

      <span className="mt-3 flex flex-wrap items-center gap-1.5 text-[0.6875rem] text-muted-foreground">
        {item.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="rounded bg-muted px-1.5 py-0.5">
            {tag}
          </span>
        ))}
      </span>
    </Link>
  );
}
