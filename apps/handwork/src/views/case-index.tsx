import Link from "next/link";

import { CaseCard } from "@/entities/case/ui/case-card";
import type { CaseSummary } from "@/entities/case/model/types";

export function CaseIndexView({ cases }: { cases: CaseSummary[] }) {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 md:px-8 md:py-16">
      <h1 className="text-4xl font-bold tracking-[-0.02em]">케이스</h1>
      <p className="mt-3 max-w-[65ch] leading-relaxed break-keep text-muted-foreground">
        일하다 마주친 것을 원리까지 내려가 봅니다. 왜 그렇게 동작하는지와,
        그래서 설정을 어떻게 두는지까지 적습니다.
      </p>

      {cases.length === 0 ? (
        <div className="mt-8 border-t border-border pt-8 text-muted-foreground">
          아직 공개한 케이스가 없습니다.{" "}
          <Link
            href="/"
            className="underline underline-offset-4 transition-colors duration-150 ease-out hover:text-brand-accent focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
          >
            홈으로
          </Link>
        </div>
      ) : (
        <ul role="list" className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {cases.map((item) => (
            <li key={item.slug} className="flex">
              <CaseCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
