import { LabCard } from "@/entities/lab/ui/lab-card";
import type { LabSummary } from "@/entities/lab/model/types";

export function LabIndexView({ labs }: { labs: LabSummary[] }) {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 md:px-8 md:py-16">
      <h1 className="text-4xl font-bold tracking-[-0.02em]">Labs</h1>
      <p className="mt-3 max-w-[60ch] leading-relaxed break-keep text-muted-foreground">
        만든 것의 기록. 스킬과 오케스트레이션을 어떻게 짰고 무엇이 남았는지,
        성과와 초안과 히스토리를 둡니다. 케이스가 &quot;하나의 판단&quot;이라면
        여기는 &quot;만드는 과정&quot;입니다.
      </p>

      {labs.length === 0 ? (
        // 구분선은 "여기부터 목록 자리" 라는 표시다 — 문구 한 줄만 두면 설명 문단에 붙어 읽힌다.
        <p className="mt-8 border-t border-border pt-8 text-muted-foreground">
          아직 공개한 기록이 없습니다.
        </p>
      ) : (
        <ul role="list" className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {labs.map((item) => (
            <li key={item.slug} className="flex">
              <LabCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
