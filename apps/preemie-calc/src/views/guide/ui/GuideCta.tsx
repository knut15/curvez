// PC-F13-AC3: "각 페이지에 계산기로 가는 링크가 있고, 누르면 해당 주수가 미리 채워진 입력
// 화면이 열린다." guide 는 검색 결과로 들어오는 진입점이라 크롤러가 따라갈 수 있는 실제
// <a href> 여야 한다(components/Button.md 는 화면 이동에도 role=button 버튼을 쓰라고 하지만,
// 이 화면만 지시서에 따라 예외로 next/link 를 쓴다 — Button 의 시각 스타일은 그대로 유지한다).
// 훅도 이벤트 핸들러도 없어 서버 컴포넌트로 둔다(guide 트리 전체에 클라이언트 컴포넌트가 없다).
import Link from "next/link";

import { ICONS } from "@/shared/ui";

export type GuideCtaProps = { weeks: number };

const ArrowRight = ICONS.ArrowRight;

export function GuideCta({ weeks }: GuideCtaProps) {
  return (
    <Link
      href={`/?weeks=${weeks}`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-2)",
        height: 52, // Button size=lg
        minHeight: "var(--touch-target-min)",
        width: "100%",
        maxWidth: 320,
        padding: "0 var(--space-4)",
        borderRadius: "var(--radius-md)",
        background: "var(--color-accent-primary)",
        color: "var(--color-text-on-accent)",
        fontSize: "var(--font-size-button)",
        fontWeight: 600,
        textDecoration: "none",
      }}
    >
      이 주수로 계산기 열기
      <ArrowRight aria-hidden="true" style={{ width: "var(--icon-size-md)", height: "var(--icon-size-md)" }} />
    </Link>
  );
}
