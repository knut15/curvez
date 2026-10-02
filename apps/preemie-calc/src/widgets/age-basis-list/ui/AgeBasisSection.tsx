// F3 "어느 나이를 쓰나" 안내. entities/age-basis 계산과 화면 표시를 묶는다.
import type { CalendarSpan } from "@/shared/lib/calendar-date";
import type { CorrectedAge } from "@/entities/child";
import { ageBasisRows, ageBasisMeta, type AgeBasisId, type AgeBasisRow } from "@/entities/age-basis";
import { InfoRow, ReferenceFooter } from "@/shared/ui";
import type { IconName } from "@/shared/ui";

export type AgeBasisSectionProps = {
  chronological: CalendarSpan;
  corrected: CorrectedAge;
};

// index.md `## 아이콘 목록` basis 5종 매핑.
const ROW_ICON: Record<AgeBasisId, IconName> = {
  vaccination: "Syringe",
  "solid-food": "Utensils",
  "checkup-visit": "Stethoscope",
  "checkup-questionnaire": "ClipboardList",
  development: "ClipboardCheck",
};

function basisText(row: AgeBasisRow): string {
  if (row.basis !== "corrected") return "출생 기준";
  if (row.id === "checkup-questionnaire") return "교정 기준(24개월 검진까지)";
  return "교정 기준";
}

function valueText(row: AgeBasisRow): string | null {
  if (!row.age) return null;
  const prefix = row.basis === "corrected" ? "교정" : "생후";
  return `${prefix} ${row.age.months}개월`;
}

function sourceLabel(sourceId: string): string {
  const source = ageBasisMeta.sources.find((s) => s.id === sourceId);
  const dateText =
    ageBasisMeta.effectiveDate !== null ? `기준일 ${ageBasisMeta.effectiveDate}` : "기준일 확인 전";
  return `${source?.name ?? "출처 미상"} · ${dateText}`;
}

export function AgeBasisSection({ chronological, corrected }: AgeBasisSectionProps) {
  const rows = ageBasisRows({ chronological, corrected });
  const showIntro = corrected.kind === "hidden";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      {showIntro ? (
        <p style={{ margin: 0, fontSize: "var(--font-size-body)", color: "var(--color-text-muted)" }}>
          재태 37주 이상이면 모든 항목이 생후 나이 그대로 적용됩니다.
        </p>
      ) : null}
      <ul style={{ margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        {rows.map((row) => (
          <InfoRow
            key={row.id}
            variant="basis"
            icon={ROW_ICON[row.id]}
            label={row.label}
            basis={basisText(row)}
            value={valueText(row)}
            sourceLabel={sourceLabel(row.sourceId)}
          />
        ))}
      </ul>
      <ReferenceFooter sources={[{ title: ageBasisMeta.title, effectiveDate: ageBasisMeta.effectiveDate }]} />
    </div>
  );
}
