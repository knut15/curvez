"use client";

import { LabCard } from "@/entities/lab/ui/lab-card";
import { LabRow } from "@/entities/lab/ui/lab-row";
import type { LabSummary } from "@/entities/lab/model/types";
import { useViewMode } from "@/shared/lib/use-view-mode";
import { ViewToggle } from "@/shared/ui/view-toggle";
import { PageLede } from "@/shared/ui/page-lede";

/**
 * `CaseIndexView` 와 같은 구조다. 저장 키만 다르다 — Cases 를 리스트로 보는 사람이
 * Labs 도 리스트로 볼 거라는 근거가 없어 각자 기억한다.
 */
export function LabIndexView({ labs }: { labs: LabSummary[] }) {
  const [mode, setMode] = useViewMode("labs");

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 md:px-8 md:py-16">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-[-0.02em]">Labs</h1>
          <PageLede className="max-w-[60ch]">
            에이전트에게 일을 맡기려고 만든 규약과 도구입니다. 어떤 값으로
            정했는지, 아직 확인 못 한 건 무엇인지 남깁니다.
          </PageLede>
        </div>
        {labs.length > 0 ? (
          <div className="shrink-0 pt-2">
            <ViewToggle mode={mode} onChange={setMode} />
          </div>
        ) : null}
      </div>

      {labs.length === 0 ? (
        // 구분선은 "여기부터 목록 자리" 라는 표시다 — 문구 한 줄만 두면 설명 문단에 붙어 읽힌다.
        <p className="mt-8 border-t border-border pt-8 text-muted-foreground">
          아직 공개한 기록이 없습니다.
        </p>
      ) : mode === "card" ? (
        <ul
          role="list"
          className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4"
        >
          {labs.map((item) => (
            <li key={item.slug} className="flex">
              <LabCard item={item} />
            </li>
          ))}
        </ul>
      ) : (
        <ul
          role="list"
          className="mt-8 divide-y divide-border border-t border-b border-border"
        >
          {labs.map((item) => (
            <li key={item.slug}>
              <LabRow item={item} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
