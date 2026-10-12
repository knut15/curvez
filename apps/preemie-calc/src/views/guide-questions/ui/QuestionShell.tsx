// F16. 질문형 가이드 한 쪽의 뼈대: 헤더 → h1(질문) → 본문 → 계산기 링크 → 출처·면책.
// 정적 페이지라 훅이 없어 서버 컴포넌트다. 본문(children)은 GuideQuestionView 가 채운다.
import type { ReactNode } from "react";

import {
  PageHeader,
  ReferenceFooter,
  type ReferenceFooterSource,
} from "@/shared/ui";
import { siteName } from "@/shared/config/site";

import { CalculatorLink } from "./CalculatorLink";

export type QuestionShellProps = {
  title: string;
  calculatorHref: string;
  sources: ReferenceFooterSource[];
  children: ReactNode;
};

export function QuestionShell({
  title,
  calculatorHref,
  sources,
  children,
}: QuestionShellProps) {
  return (
    <main>
      {/* 본문의 질문을 h1 로 두고 헤더 제목은 h2 로 내린다(페이지당 h1 하나, views/guide 와 같다). */}
      <PageHeader
        variant="title-only"
        title={siteName.value}
        headingLevel={2}
      />
      <div className="pc-content-guide pc-content-max pc-content-pad-x">
        <h1
          style={{
            margin: 0,
            fontSize: "var(--font-size-display)",
            color: "var(--color-text-primary)",
          }}
        >
          {title}
        </h1>
        <div
          style={{
            marginTop: "var(--space-4)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
            fontSize: "var(--font-size-body)",
            color: "var(--color-text-primary)",
          }}
        >
          {children}
        </div>
        <div style={{ marginTop: "var(--space-6)" }}>
          <CalculatorLink href={calculatorHref} />
        </div>
        <ReferenceFooter variant="full" sources={sources} />
      </div>
    </main>
  );
}
