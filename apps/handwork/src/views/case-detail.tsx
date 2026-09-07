import Link from "next/link";

import type { CaseMeta } from "@/entities/case/model/types";

type Neighbor = { slug: string; title: string } | null;

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
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 md:py-16">
      <header className="mx-auto max-w-[68ch]">
        <h1 className="text-2xl font-semibold">{meta.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {meta.date} · {meta.role}
        </p>
        <ul role="list" className="mt-3 flex flex-wrap gap-2">
          {meta.tags.map((tag) => (
            <li
              key={tag}
              className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground"
            >
              {tag}
            </li>
          ))}
        </ul>
      </header>

      <article className="mx-auto mt-8 max-w-[68ch] leading-7 [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-8 [&_h3]:text-lg [&_h3]:font-medium [&_li]:my-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-4 [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-[var(--radius)] [&_pre]:bg-muted [&_pre]:p-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-5">
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
              className="text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground motion-reduce:transition-none"
            >
              ← {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/cases/${next.slug}`}
              className="ml-auto text-right text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground motion-reduce:transition-none"
            >
              {next.title} →
            </Link>
          ) : null}
        </nav>
      ) : null}
    </main>
  );
}
