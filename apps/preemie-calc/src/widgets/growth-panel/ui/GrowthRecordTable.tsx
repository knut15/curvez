// 스펙: .curvez/design/preemie-calc/components/GrowthRecordTable.md
// PC-F8-AC3(추이 그래프)의 대체 표현 — 차트 라이브러리가 없어(지시서 FORBIDDEN) 표로
// 여러 기록을 나란히 비교한다. 그래프 자리 자체는 넣지 않는다.
import type { CalendarDate } from "@/shared/lib/calendar-date";
import { ICONS } from "@/shared/ui";

const AlertTriangle = ICONS.AlertTriangle;
const InfoIcon = ICONS.Info;

export type GrowthRecordRow = {
  id: string;
  measurementDate: CalendarDate;
  heightCm: number;
  weightKg: number;
  headCircumferenceCm: number;
  posture: "lying" | "standing";
  ageBasis: { kind: "chronological" | "corrected"; label: string };
  percentile: { height: number; weight: number; headCircumference: number } | null;
  percentileHidden: boolean;
  cautionNeeded: boolean;
};

export type GrowthRecordTableProps = {
  records: GrowthRecordRow[];
};

function postureLabel(posture: "lying" | "standing"): string {
  return posture === "lying" ? "누워서" : "서서";
}

export function GrowthRecordTable({ records }: GrowthRecordTableProps) {
  if (records.length === 0) return null;

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--font-size-body)" }}>
        <thead>
          <tr>
            {["측정일", "키", "몸무게", "머리둘레", "자세", "기준", "백분위"].map((label) => (
              <th
                key={label}
                scope="col"
                style={{
                  textAlign: "left",
                  padding: "var(--space-3)",
                  color: "var(--color-text-muted)",
                  fontSize: "var(--font-size-meta)",
                  borderBottom: "1px solid var(--color-border-subtle)",
                }}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((r) => {
            const label = r.percentileHidden
              ? `측정일 ${r.measurementDate}, 키 ${r.heightCm}cm, 몸무게 ${r.weightKg}kg, 머리둘레 ${r.headCircumferenceCm}cm, ${postureLabel(r.posture)} 측정, ${r.ageBasis.label}, 이 시기는 백분위를 표시하지 않습니다`
              : `측정일 ${r.measurementDate}, 키 ${r.heightCm}cm ${r.percentile?.height}백분위, 몸무게 ${r.weightKg}kg ${r.percentile?.weight}백분위, 머리둘레 ${r.headCircumferenceCm}cm ${r.percentile?.headCircumference}백분위, ${postureLabel(r.posture)} 측정, ${r.ageBasis.label}`;
            return (
              <tr key={r.id} aria-label={label} style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
                <td style={{ padding: "var(--space-3)" }}>{r.measurementDate}</td>
                <td style={{ padding: "var(--space-3)" }}>
                  {r.heightCm}cm{!r.percentileHidden ? `(${r.percentile?.height}%ile)` : ""}
                </td>
                <td style={{ padding: "var(--space-3)" }}>
                  {r.weightKg}kg{!r.percentileHidden ? `(${r.percentile?.weight}%ile)` : ""}
                </td>
                <td style={{ padding: "var(--space-3)" }}>
                  {r.headCircumferenceCm}cm{!r.percentileHidden ? `(${r.percentile?.headCircumference}%ile)` : ""}
                </td>
                <td style={{ padding: "var(--space-3)" }}>{postureLabel(r.posture)}</td>
                <td style={{ padding: "var(--space-3)" }}>{r.ageBasis.label}</td>
                <td style={{ padding: "var(--space-3)" }}>
                  {r.percentileHidden ? (
                    <span style={{ display: "flex", alignItems: "center", gap: "var(--space-1)", color: "var(--color-text-muted)" }}>
                      <InfoIcon aria-hidden="true" style={{ width: "var(--icon-size-sm)", height: "var(--icon-size-sm)" }} />
                      이 시기는 백분위를 표시하지 않습니다
                    </span>
                  ) : r.cautionNeeded ? (
                    <span style={{ display: "flex", alignItems: "center", gap: "var(--space-1)", color: "var(--color-accent-danger)" }}>
                      <AlertTriangle aria-hidden="true" style={{ width: "var(--icon-size-sm)", height: "var(--icon-size-sm)" }} />
                      소아청소년과 상담을 권합니다
                    </span>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
