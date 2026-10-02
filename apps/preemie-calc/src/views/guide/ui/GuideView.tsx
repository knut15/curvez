// F13. route: /guide/[weeks]/[months]. 정적 빌드 페이지 — 훅이 없어 서버 컴포넌트로 둔다.
// 스펙: .curvez/design/preemie-calc/screens/guide.md
import { IconBadge, PageHeader, ReferenceFooter } from "@/shared/ui";
import { siteName } from "@/shared/config/site";
import { buildGuideContent } from "@/widgets/guide-content";

import { GuideCta } from "./GuideCta";

export type GuideViewProps = { weeks: number; months: number };

export function GuideView({ weeks, months }: GuideViewProps) {
  const content = buildGuideContent(weeks, months);

  return (
    <main>
      {/* 이 페이지는 SEO 조합 제목(아래)을 h1 로 둔다. 헤더 제목은 h2 로 내려 페이지당 h1 하나를 지킨다. */}
      <PageHeader variant="title-only" title={siteName.value} headingLevel={2} />
      <div className="pc-content-guide pc-content-max pc-content-pad-x">
        <h1 style={{ margin: 0, fontSize: "var(--font-size-display)", color: "var(--color-text-primary)" }}>
          {content.heading}
        </h1>
        <p
          style={{
            marginTop: "var(--space-4)",
            fontSize: "var(--font-size-body)",
            color: "var(--color-text-primary)",
          }}
        >
          {content.description}
        </p>
        <p
          style={{
            marginTop: "var(--space-4)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            fontSize: "var(--font-size-body)",
            color: "var(--color-text-primary)",
          }}
        >
          <IconBadge icon="Stethoscope" tone="primary" size="sm" />
          {content.checkupSummary}
        </p>
        <div style={{ marginTop: "var(--space-6)" }}>
          <GuideCta weeks={weeks} />
        </div>
        <ReferenceFooter variant="disclaimer-only" />
      </div>
    </main>
  );
}
