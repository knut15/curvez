// 스펙: .curvez/design/preemie-calc/components/UnconfirmedNotice.md
// 순수 프레젠테이션 (훅 없음). Settled<T>.status === "미확정" 일 때만 렌더링 여부를 부모가 결정한다.
import { ICONS } from "./icons";

export type UnconfirmedNoticeProps = {
  text?: string;
};

const AlertTriangle = ICONS.AlertTriangle;

export function UnconfirmedNotice({
  text = "이 값은 공식 원문 확인 전 잠정값입니다",
}: UnconfirmedNoticeProps) {
  return (
    <div
      role="note"
      style={{
        display: "flex",
        gap: "var(--space-2)",
        padding: "var(--space-3) var(--space-4)",
        background: "var(--color-notice-bg)",
        color: "var(--color-notice-text)",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--font-size-body)",
      }}
    >
      <AlertTriangle
        aria-hidden="true"
        style={{ width: "var(--icon-size-md)", height: "var(--icon-size-md)", flexShrink: 0 }}
      />
      <span>
        <strong>미확정</strong> · {text}
      </span>
    </div>
  );
}
