// F17. route: /guide. 질문형 가이드 6쪽과 "어느 나이를 쓰나" 공개판, 주수·개월 조합 페이지로 가는 입구.
// 정적 페이지다. 질문 목록은 app/guide/page.tsx 가 넘긴다(같은 층 view 끼리는 import 하지 않는다).
import Link from "next/link";

import { COMBO_MONTHS, COMBO_WEEKS } from "@/entities/child";
import { PageHeader, ReferenceFooter } from "@/shared/ui";
import { siteName } from "@/shared/config/site";

import { ComboPicker } from "./ComboPicker";

export type GuideIndexQuestion = { slug: string; title: string };
export type GuideIndexViewProps = { questions: readonly GuideIndexQuestion[] };

const sectionTitle: React.CSSProperties = {
  margin: 0,
  fontSize: "var(--font-size-title)",
  color: "var(--color-text-primary)",
};

const linkStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  minHeight: "var(--touch-target-min)",
  color: "var(--color-accent-primary)",
  fontSize: "var(--font-size-body)",
};

export function GuideIndexView({ questions }: GuideIndexViewProps) {
  return (
    <main>
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
          이른둥이 가이드
        </h1>
        <p
          style={{
            marginTop: "var(--space-4)",
            fontSize: "var(--font-size-body)",
            color: "var(--color-text-primary)",
          }}
        >
          아이 정보를 넣지 않고 읽을 수 있는 글입니다. 궁금한 질문을 고르세요.
        </p>

        <section
          aria-labelledby="guide-questions"
          style={{ marginTop: "var(--space-6)" }}
        >
          <h2 id="guide-questions" style={sectionTitle}>
            자주 묻는 질문
          </h2>
          <ul
            style={{
              margin: "var(--space-2) 0 0",
              padding: 0,
              listStyle: "none",
            }}
          >
            {questions.map((question) => (
              <li key={question.slug}>
                <Link
                  href={`/guide/questions/${question.slug}`}
                  style={linkStyle}
                >
                  {question.title}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/guide/age-basis" style={linkStyle}>
                어느 나이를 쓰나 (출생 나이·교정 나이 기준표)
              </Link>
            </li>
          </ul>
        </section>

        <section
          aria-labelledby="guide-combo"
          style={{ marginTop: "var(--space-6)" }}
        >
          <h2 id="guide-combo" style={sectionTitle}>
            출생 주수와 생후 개월로 찾기
          </h2>
          <p
            style={{
              margin: "var(--space-2) 0 var(--space-3)",
              fontSize: "var(--font-size-body)",
              color: "var(--color-text-primary)",
            }}
          >
            우리 아이와 같은 조합의 교정 나이와 검진 안내를 볼 수 있습니다.
          </p>
          <ComboPicker weeks={COMBO_WEEKS} months={COMBO_MONTHS} />
        </section>

        <ReferenceFooter variant="disclaimer-only" />
      </div>
    </main>
  );
}
