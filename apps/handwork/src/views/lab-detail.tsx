import type { LabMeta } from "@/entities/lab/model/types";
import { PROSE } from "@scopulus/ui";

export function LabDetailView({
  meta,
  children,
}: {
  meta: LabMeta;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 md:px-8 md:py-16">
      <header className="mx-auto max-w-[68ch]">
        <h1 className="text-4xl leading-[1.15] font-bold tracking-[-0.02em] break-keep">
          {meta.title}
        </h1>
        {/* 모노로 두지 않는다. status 가 한글이라 Geist Mono 에 글자가 없어 폰트가 달라진다. */}
        <p className="mt-4 flex items-center gap-2 text-sm tracking-wide text-muted-foreground">
          <span
            aria-hidden
            className={
              meta.status === "진행 중"
                ? "size-1.5 rounded-full bg-brand-accent"
                : "size-1.5 rounded-full bg-muted-foreground"
            }
          />
          {meta.status} · {meta.date}
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

      <article className={`mt-10 max-w-[68ch] ${PROSE}`}>{children}</article>
    </main>
  );
}
