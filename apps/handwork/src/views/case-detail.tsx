import Image from "next/image";
import Link from "next/link";

import type { CaseMeta } from "@/entities/case/model/types";
import { PROSE } from "@scopulus/ui";

type Neighbor = { slug: string; title: string } | null;

// 본문·이웃 링크가 같은 상호작용 규칙을 쓴다. hover 는 브랜드 강조색 하나로 고정이다.
const LINK =
  "transition-colors duration-150 ease-out hover:text-brand-accent focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none";

export function CaseDetailView({
  meta,
  children,
  prev,
  next,
}: {
  meta: CaseMeta;
  children: React.ReactNode;
  prev: Neighbor;
  next: Neighbor;
}) {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 md:px-8 md:py-16">
      <header className="mx-auto max-w-[68ch]">
        <h1 className="text-4xl leading-[1.15] font-bold tracking-[-0.02em] break-keep">
          {meta.title}
        </h1>
        {/* 모노로 두지 않는다. role 이 한글이라 Geist Mono 에 글자가 없어 폰트가 달라진다. */}
        <p className="mt-4 text-sm tracking-wide text-muted-foreground">
          {meta.date} · {meta.role}
        </p>
        <ul role="list" className="mt-3 flex flex-wrap gap-2">
          {meta.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-sm bg-muted px-2 py-0.5 text-xs text-muted-foreground"
            >
              {tag}
            </li>
          ))}
        </ul>
      </header>

      {/* 제목 바가 걸리는 지점. 헤더가 이 눈금을 찾아 관찰한다. */}
      <div data-title-sentinel aria-hidden className="h-0" />

      {/*
        등록된 썸네일이 있으면 본문 앞에 한 장 놓는다. **없으면 아무것도 넣지 않는다** —
        목록 카드와 달리 여기서는 자동 생성 그림을 그리지 않는다. 목록은 칸이 비면
        줄이 어긋나지만 상세는 제목부터 본문까지 이어 읽는 글이고, 뜻 없는 그림 한 장이
        그 사이를 가로막는다. `WorkDetailView` 와 같은 규칙이다.

        눈금(sentinel) **뒤에** 둔다. 앞에 끼우면 그만큼 제목 바가 늦게 걸린다.
      */}
      {meta.thumbnail ? (
        <Image
          src={meta.thumbnail}
          alt=""
          width={1280}
          height={720}
          sizes="(min-width: 768px) 68ch, 100vw"
          className="mx-auto mt-8 aspect-[16/9] w-full max-w-[68ch] object-contain"
        />
      ) : null}

      <article className={`mx-auto mt-10 max-w-[68ch] ${PROSE}`}>
        {children}
      </article>

      {prev || next ? (
        <nav
          aria-label="다른 케이스"
          className="mx-auto mt-12 flex max-w-[68ch] justify-between gap-4 border-t border-border pt-6 text-sm"
        >
          {prev ? (
            <Link
              href={`/cases/${prev.slug}`}
              className={`text-muted-foreground ${LINK}`}
            >
              ← {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/cases/${next.slug}`}
              className={`ml-auto text-right text-muted-foreground ${LINK}`}
            >
              {next.title} →
            </Link>
          ) : null}
        </nav>
      ) : null}
    </main>
  );
}
