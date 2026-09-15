import Image from "next/image";
import Link from "next/link";

import { CardGlyph } from "@/shared/ui/card-glyph";

import type { LabSummary } from "../model/types";

/**
 * 실험 카드. `CaseCard` 와 같은 구성이고, **상태 배지 한 줄만 더** 갖는다.
 *
 * 배지를 그림 위에 두는 이유: 이 목록에서 먼저 읽어야 하는 것이 "얼마나 왔나" 다.
 * Works·Cases 가 그 자리에 날짜를 두는 것과 같은 자리이고, 여기서는 상태가 날짜보다 앞선다.
 *
 * 그림 자리의 규칙은 나머지 두 목록과 같다 — 등록된 썸네일이 있으면 그것을,
 * 없으면 slug 로 만든 그림을 넣고, 썸네일은 자르지 않는다.
 */
export function LabCard({ item }: { item: LabSummary }) {
  return (
    <Link
      href={`/labs/${item.slug}`}
      className="group flex flex-1 flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      <span className="flex items-center gap-2 text-[0.6875rem] tracking-[0.08em] text-muted-foreground uppercase">
        <span
          aria-hidden
          className={
            item.status === "진행 중"
              ? "size-1.5 rounded-full bg-brand-accent"
              : "size-1.5 rounded-full bg-muted-foreground"
          }
        />
        <span className="normal-case">{item.status}</span>
        <span aria-hidden>·</span>
        <span>{item.date}</span>
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
