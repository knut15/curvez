// 스펙: .curvez/design/preemie-calc/components/ReferenceFooter.md
// 순수 프레젠테이션 (훅 없음).
// effectiveDate 가 null 이면 원문 대조 전이다(architecture.md ④, ACC-04). 디자인 스펙에
// null 문구가 없어 architect 문구 "기준일 확인 전" 을 쓴다.
import { ICONS } from "./icons";

export type ReferenceFooterSource = { title: string; effectiveDate: string | null };

export type ReferenceFooterProps = {
  variant?: "full" | "disclaimer-only";
  sources?: ReferenceFooterSource[];
  extraNote?: string;
};

const Info = ICONS.Info;

export function ReferenceFooter({ variant = "full", sources, extraNote }: ReferenceFooterProps) {
  return (
    <footer
      style={{
        marginTop: "var(--space-6)",
        paddingTop: "var(--space-4)",
        borderTop: "1px solid var(--color-border-subtle)",
        background: "var(--color-bg-canvas)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
      }}
    >
      {extraNote ? (
        <p style={{ margin: 0, fontSize: "var(--font-size-meta)", color: "var(--color-text-muted)" }}>
          {extraNote}
        </p>
      ) : null}
      {variant === "full" && sources
        ? sources.map((source) => (
            <p
              key={source.title}
              style={{ margin: 0, fontSize: "var(--font-size-meta)", color: "var(--color-text-muted)" }}
            >
              {source.title} · {source.effectiveDate !== null ? `기준일 ${source.effectiveDate}` : "기준일 확인 전"}
            </p>
          ))
        : null}
      <p
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-1)",
          margin: 0,
          fontSize: "var(--font-size-meta)",
          color: "var(--color-text-muted)",
        }}
      >
        <Info aria-hidden="true" style={{ width: "var(--icon-size-sm)", height: "var(--icon-size-sm)" }} />
        참고용이며 진단을 대신하지 않음
      </p>
    </footer>
  );
}
