import Link from "next/link";

import { CaseCard } from "@/entities/case/ui/case-card";
import type { CaseSummary } from "@/entities/case/model/types";

export function CaseIndexView({ cases }: { cases: CaseSummary[] }) {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 md:py-16">
      <h1 className="text-2xl font-semibold">케이스</h1>
      <p className="mt-2 text-muted-foreground">
        어떤 제약에서 무엇을 고르고 무엇을 버렸는지를 씁니다.
      </p>

      {cases.length === 0 ? (
        <p className="mt-8 text-muted-foreground">
          아직 공개한 케이스가 없습니다.{" "}
          <Link
            href="/"
            className="underline underline-offset-4 transition-colors duration-150 ease-out hover:text-foreground motion-reduce:transition-none"
          >
            홈으로
          </Link>
        </p>
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
