"use client";

// F16 AC6·EX1. 각 쪽 아래의 "계산기로 가는 링크". 검색으로 들어온 방문자를 크롤러도 따라갈 수 있는
// 실제 <a href> 로 보내려고 next/link 를 쓴다. 시각 스타일은 views/guide 의 GuideCta 와 같다
// (같은 층 슬라이스끼리는 import 하지 않아 값을 그대로 옮겼다).
// PC-F16-EX1: 프로필이 없으면 입력 화면을 거쳐 그 화면으로 간다 — "?next="에 원래 목적지를 실어
// 입력 화면이 저장 뒤 그리로 돌려보내게 한다.
import Link from "next/link";

import { useProfileStore } from "@/entities/child";
import { ICONS } from "@/shared/ui";

export type CalculatorLinkProps = { href: string };

const ArrowRight = ICONS.ArrowRight;

export function CalculatorLink({ href }: CalculatorLinkProps) {
  const { result } = useProfileStore();
  const targetHref = result.status === "empty" ? `/?next=${encodeURIComponent(href)}` : href;

  return (
    <Link
      href={targetHref}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-2)",
        height: 52,
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
      내 아이로 계산하기
      <ArrowRight
        aria-hidden="true"
        style={{ width: "var(--icon-size-md)", height: "var(--icon-size-md)" }}
      />
    </Link>
  );
}
