"use client";

import Link from "next/link";

import { CaseCard } from "@/entities/case/ui/case-card";
import { CaseRow } from "@/entities/case/ui/case-row";
import type { CaseSummary } from "@/entities/case/model/types";
import { useViewMode } from "@/shared/lib/use-view-mode";
import { ViewToggle } from "@/shared/ui/view-toggle";
import { PageLede } from "@/shared/ui/page-lede";

/**
 * **클라이언트 컴포넌트다.** 보기 방식이 상태이고 그 선택을 브라우저에 남긴다.
 * 목록 자체는 서버가 이미 다 넘겨 준 배열이라, 여기서 다시 불러오는 것은 없다.
 */
export function CaseIndexView({ cases }: { cases: CaseSummary[] }) {
  const [mode, setMode] = useViewMode("cases");

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 md:px-8 md:py-16">
      {/* 제목과 토글을 한 줄에 둔다. 토글이 목록 바로 위에 붙으면 무엇을 바꾸는
          버튼인지는 분명해지지만, 설명 문단과 목록 사이가 벌어져 둘이 끊긴다. */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-[-0.02em]">케이스</h1>
          <PageLede className="max-w-[65ch]">
            앱을 만들며 해결한 문제와 새로 배운 내용을 정리합니다. 기술의 동작 원리와
            적용 방법, 그 방식을 선택한 이유를 함께 살펴봅니다.
          </PageLede>
        </div>
        {cases.length > 0 ? (
          <div className="shrink-0 pt-2">
            <ViewToggle mode={mode} onChange={setMode} />
          </div>
        ) : null}
      </div>

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
      ) : mode === "card" ? (
        <ul
          role="list"
          className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4"
        >
          {cases.map((item) => (
            <li key={item.slug} className="flex">
              <CaseCard item={item} />
            </li>
          ))}
        </ul>
      ) : (
        // 줄 사이를 선으로 가른다. 카드처럼 면을 주면 리스트가 아니라 좁은 카드가 된다.
        <ul
          role="list"
          className="mt-8 divide-y divide-border border-t border-b border-border"
        >
          {cases.map((item) => (
            <li key={item.slug}>
              <CaseRow item={item} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
