import Image from "next/image";
import Link from "next/link";

import { CardGlyph } from "@/shared/ui/card-glyph";

import type { CaseSummary } from "../model/types";

/**
 * 케이스 카드. 위에서부터 **날짜 → 그림 → 제목 → 설명 → 태그** 순이고,
 * `WorkCard` 와 같은 구성이다 — 세 목록이 같은 규칙으로 읽혀야 메뉴를 옮겨 다닐 때
 * 눈이 다시 적응하지 않는다.
 *
 * **면을 두르지 않는다.** 전에는 테두리를 가진 상자였는데, 그림이 들어오면서 그 그림이
 * 이미 자기 면을 갖게 됐다 — 상자를 한 번 더 두르면 액자 속 액자가 된다.
 * 대신 그림에만 테두리를 주고 글자는 그 아래에 놓는다.
 *
 * 그림 자리에는 **등록된 썸네일이 있으면 그것을, 없으면 slug 로 만든 그림을** 넣는다.
 * 썸네일은 **자르지 않는다**(`object-contain`) — 틀은 16:9 인데 올라오는 것은 화면
 * 갈무리라 세로로 길기도 하다. 남는 자리는 카드 바탕이 채우고 틀 크기는 그대로다.
 *
 * 카드 전체가 링크 하나다. 안에 별도 링크를 두지 않는다 —
 * 카드마다 탭이 여러 번 필요해지고 접근 이름도 달라진다.
 */
export function CaseCard({ item }: { item: CaseSummary }) {
  return (
    <Link
      href={`/cases/${item.slug}`}
      className="group flex flex-1 flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      <span className="flex items-baseline gap-2 text-[0.6875rem] tracking-[0.08em] text-muted-foreground uppercase">
        {item.date}
        <span aria-hidden>·</span>
        <span className="normal-case">{item.role}</span>
      </span>

      <span className="mt-2.5 block overflow-hidden rounded-xl border border-border bg-card text-muted-foreground transition-colors duration-150 ease-out group-hover:bg-accent motion-reduce:transition-none">
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt=""
            width={320}
            height={180}
            sizes="(min-width: 768px) 320px, 100vw"
            className="aspect-[16/9] h-full w-full object-contain"
          />
        ) : (
          <CardGlyph seed={item.slug} />
        )}
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
