// F18. route: /guide/age-basis. 프로필이 없어도 읽는 기준표 — 훅이 없어 서버 컴포넌트로 둔다.
// 내 아이 값은 CTA 로 F3(/dashboard/age-basis)에 연결한다.
import { ageBasisItems, ageBasisMeta, type AgeBasisId, type AgeBasisItem } from "@/entities/age-basis";
import { InfoRow, PageHeader, ReferenceFooter } from "@/shared/ui";
import type { IconName } from "@/shared/ui";

import { MyChildCta } from "./MyChildCta";

// widgets/age-basis-list 와 같은 아이콘 매핑(index.md `## 아이콘 목록` basis 5종).
const ROW_ICON: Record<AgeBasisId, IconName> = {
  vaccination: "Syringe",
  "solid-food": "Utensils",
  "checkup-visit": "Stethoscope",
  "checkup-questionnaire": "ClipboardList",
  development: "ClipboardCheck",
};

function basisText(item: AgeBasisItem): string {
  if (item.basis === "chronological") return "출생 기준";
  if (item.basis === "corrected-until-checkup") return "교정 기준(24개월 검진까지)";
  return "교정 기준";
}

function sourceLabel(sourceId: string): string {
  const source = ageBasisMeta.sources.find((s) => s.id === sourceId);
  const dateText =
    ageBasisMeta.effectiveDate !== null ? `기준일 ${ageBasisMeta.effectiveDate}` : "기준일 확인 전";
  return `${source?.name ?? "출처 미상"} · ${dateText}`;
}

export function AgeBasisPublicView() {
  return (
    <main>
      <PageHeader variant="title-only" title="어느 나이를 쓰나" />
      <div className="pc-content-narrow pc-content-max pc-content-pad-x">
        <p style={{ margin: 0, fontSize: "var(--font-size-body)", color: "var(--color-text-muted)" }}>
          이른둥이는 항목마다 출생일과 예정일 중 다른 날을 기준으로 나이를 셉니다. 재태 37주 이상이면 모든 항목이
          생후 나이 그대로입니다.
        </p>
        <ul
          style={{
            margin: 0,
            marginTop: "var(--space-5)",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-3)",
          }}
        >
          {ageBasisItems.map((item) => (
            <InfoRow
              key={item.id}
              variant="basis"
              icon={ROW_ICON[item.id]}
              label={item.label}
              basis={basisText(item)}
              value={null}
              sourceLabel={sourceLabel(item.sourceId)}
            />
          ))}
        </ul>
        <div style={{ marginTop: "var(--space-6)" }}>
          <MyChildCta />
        </div>
        <ReferenceFooter
          sources={ageBasisMeta.sources.map((source) => ({
            title: source.name,
            effectiveDate: ageBasisMeta.effectiveDate,
          }))}
        />
      </div>
    </main>
  );
}
