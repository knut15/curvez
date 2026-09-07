import Link from "next/link";

import { CaseCard } from "@/entities/case/ui/case-card";
import type { CaseSummary } from "@/entities/case/model/types";

const GITHUB = "https://github.com/knut15";

export function HomeView({ cases }: { cases: CaseSummary[] }) {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4">
      <section className="py-10 md:py-16">
        <h1 className="text-3xl leading-tight font-semibold text-balance md:text-4xl">
          여러 서비스가 가져다 쓰는 프론트엔드 시스템을 만듭니다.
        </h1>
        <p className="mt-4 max-w-[60ch] text-muted-foreground">
          무엇을 만들었는지가 아니라, 어떤 제약에서 무엇을 고르고 무엇을
          버렸는지를 씁니다.
        </p>
        <p className="mt-6">
          <a
            href={GITHUB}
            className="text-sm underline underline-offset-4 transition-colors duration-150 ease-out hover:text-muted-foreground motion-reduce:transition-none"
          >
            GitHub
          </a>
        </p>
      </section>

      {cases.length > 0 ? (
        <section className="pb-10 md:pb-16">
          <h2 className="text-2xl font-semibold">케이스</h2>
          <ul
            role="list"
            className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3"
          >
            {cases.map((item) => (
              <li key={item.slug} className="flex">
                <CaseCard item={item} />
              </li>
            ))}
          </ul>
          <p className="mt-6">
            <Link
              href="/cases"
              className="text-sm text-muted-foreground underline underline-offset-4 transition-colors duration-150 ease-out hover:text-foreground motion-reduce:transition-none"
            >
              전체 보기
            </Link>
          </p>
        </section>
      ) : null}
    </main>
  );
}
