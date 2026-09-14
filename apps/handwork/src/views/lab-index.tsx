import { LabCard } from "@/entities/lab/ui/lab-card";
import type { LabSummary } from "@/entities/lab/model/types";

export function LabIndexView({ labs }: { labs: LabSummary[] }) {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 md:px-8 md:py-16">
      <h1 className="text-4xl font-bold tracking-[-0.02em]">Labs</h1>
      <p className="mt-3 max-w-[60ch] leading-relaxed break-keep text-muted-foreground">
        에이전트에게 일을 맡기려고 만든 규약과 도구의 기록입니다. 무엇을 값으로
        굳혔고 무엇이 아직 확인되지 않았는지까지 적습니다.
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
