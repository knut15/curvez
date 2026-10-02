// 스펙: .curvez/design/preemie-calc/components/AgeSummaryCard.md
// 순수 프레젠테이션(포맷팅은 ../lib/format 이 끝낸다). 훅이 없어 "use client" 가 필요 없다.
// 값 하나만 보여주는 화면(경감 구간, 교정연령 종료)은 shared/ui 의 ValueCard 를 쓴다
// (PLC-02, variant=single 제거).
import { IconBadge } from "@/shared/ui";
import { nowrapChunks } from "../lib/nowrap-chunks";

export type AgeSummaryCardProps = {
  variant?: "default" | "share-preview";
  chronological: { value: string; label: string };
  corrected: { kind: "hidden" | "before-due" | "after-due"; value: string; subValue?: string } | null;
  basisLine: string;
  nextMonthDates?: { chronological: string; corrected: string | null };
};

const cardStyle: React.CSSProperties = {
  background: "var(--color-bg-surface)",
  borderRadius: "var(--radius-lg)",
  boxShadow: "var(--elevation-card)",
  padding: "var(--space-4)",
};

const columnStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-2)",
  padding: "var(--space-4)",
  borderRadius: "var(--radius-md)",
};

export function AgeSummaryCard({ chronological, corrected, basisLine, nextMonthDates }: AgeSummaryCardProps) {
  return (
    <div style={cardStyle} role="group" aria-label="오늘 기준 나이">
      <div className="pc-age-summary-columns">
        <div style={{ ...columnStyle, background: "var(--gradient-card-primary-soft)" }}>
          <IconBadge icon="CalendarDays" tone="primary" size="lg" />
          {/* 2026-09-29 재리뷰(DSG-02 수정): 라벨을 별도 헤딩 요소로 먼저 그리지 않는다.
              "{라벨} {값}" 을 하나의 문구로 그린다(ACC-02, 이 규칙은 5차 라운드에도 유지). */}
          <p style={{ margin: 0, fontSize: "var(--font-size-body-lg)", color: "var(--color-text-primary)" }}>
            {chronological.label} {nowrapChunks(chronological.value)}
          </p>
        </div>
        {corrected ? (
          <div style={{ ...columnStyle, background: "var(--gradient-card-corrected-soft)" }}>
            <IconBadge icon="Sparkles" tone="corrected" size="lg" />
            <p style={{ margin: 0, fontSize: "var(--font-size-body-lg)", color: "var(--color-text-primary)" }}>
              교정 {nowrapChunks(corrected.value)}
            </p>
            {corrected.subValue ? (
              <p style={{ margin: 0, fontSize: "var(--font-size-meta)", color: "var(--color-text-muted)" }}>
                {nowrapChunks(corrected.subValue)}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
      {!corrected ? (
        <p style={{ margin: "var(--space-2) 0 0", fontSize: "var(--font-size-meta)", color: "var(--color-text-muted)" }}>
          교정 나이는 재태 37주 이상이라 표시하지 않습니다
        </p>
      ) : null}
      <p style={{ margin: "var(--space-4) 0 0", fontSize: "var(--font-size-meta)", color: "var(--color-text-muted)" }}>
        {basisLine}
      </p>
      {nextMonthDates ? (
        <p style={{ margin: "var(--space-2) 0 0", fontSize: "var(--font-size-meta)", color: "var(--color-text-muted)" }}>
          {nowrapChunks(
            nextMonthDates.chronological +
              (nextMonthDates.corrected ? ` · ${nextMonthDates.corrected}` : ""),
          )}
        </p>
      ) : null}
    </div>
  );
}
