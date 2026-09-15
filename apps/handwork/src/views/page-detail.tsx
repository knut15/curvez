import type { ReactNode } from "react";

import type { PageMeta } from "@/entities/page/model/types";

/**
 * 전용 화면이 없는 메뉴의 글 본문.
 *
 * 메타 줄과 본문뿐이다. Lab 의 상태 배지나 Case 의 결론 블록처럼 그 메뉴에만
 * 있는 요소는 두지 않는다 — 새 메뉴가 무엇을 강조해야 하는지는 아직 모른다.
 */
export function PageDetailView({
  meta,
  children,
}: {
  meta: PageMeta;
  children: ReactNode;
}) {
  const head = [meta.date, meta.role].filter(
    (part): part is string => typeof part === "string" && part !== "",
  );
  const tags = meta.tags ?? [];

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 md:px-8 md:py-16">
      <header className="border-b border-border pb-8">
        {head.length > 0 ? (
          <p className="font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">
            {head.join(" · ")}
          </p>
        ) : null}

        <h1 className="mt-3 text-3xl font-bold tracking-[-0.02em] break-keep md:text-4xl">
          {meta.title}
        </h1>

        {meta.summary !== "" ? (
          <p className="mt-4 leading-relaxed break-keep text-muted-foreground">
            {meta.summary}
          </p>
        ) : null}

        {tags.length > 0 ? (
          <ul className="mt-5 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <li
                key={tag}
                className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.7rem] text-muted-foreground"
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : null}

        {meta.link !== undefined && meta.link !== "" ? (
          <a
            href={meta.link}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-block text-sm underline underline-offset-4"
          >
            바로 가기 ↗
          </a>
        ) : null}
      </header>

      <div className="prose prose-neutral dark:prose-invert mt-10 max-w-none break-keep">
        {children}
      </div>
    </main>
  );
}
