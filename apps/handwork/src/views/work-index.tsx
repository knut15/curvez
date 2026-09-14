import Link from "next/link";

import { WorkCard } from "@/entities/work/ui/work-card";
import type { WorkSummary } from "@/entities/work/model/types";

export function WorkIndexView({ works }: { works: WorkSummary[] }) {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 md:px-8 md:py-16">
      <h1 className="text-4xl font-bold tracking-[-0.02em]">Works</h1>
      <p className="mt-3 max-w-[65ch] leading-relaxed break-keep text-muted-foreground">
        직접 만들어 내보낸 것들입니다. 무엇을 만들었고 어떤 제약 안에서 무엇을
        골랐는지 적습니다.
      </p>

      {works.length === 0 ? (
        <div className="mt-8 border-t border-border pt-8 text-muted-foreground">
          아직 공개한 작업이 없습니다.{" "}
          <Link
            href="/"
            className="underline underline-offset-4 transition-colors duration-150 ease-out hover:text-brand-accent focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
          >
            홈으로
          </Link>
        </div>
      ) : (
        <ul role="list" className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {works.map((item) => (
            <li key={item.slug} className="flex">
              <WorkCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
