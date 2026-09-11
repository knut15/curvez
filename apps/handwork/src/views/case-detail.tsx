import Link from "next/link";

import type { CaseMeta } from "@/entities/case/model/types";
import { PROSE } from "@/shared/ui/prose";

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
        {/* 모노로 두지 않는다. role 이 한글이라 Geist Mono 에 글자가 없어 폰트가 갈린다. */}
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
