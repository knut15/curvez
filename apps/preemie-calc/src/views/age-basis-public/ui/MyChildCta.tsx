"use client";

// F18-AC2: 프로필이 없으면 입력 화면, 있으면 F3 화면(/dashboard/age-basis).
// 프로필이 없을 때는 "?next="에 F3 화면 경로를 실어, 입력 화면이 저장 뒤 그리로 돌려보내게 한다.
// 크롤러와 새 탭 열기를 위해 실제 <a href> 를 쓴다(GuideCta 와 같은 이유).
// TEAM-03: 서버 스냅샷(getServerSnapshot)은 항상 프로필 "없음"이라, 실제로는 프로필이 있는
// 사용자가 하이드레이션 완료 전에 누르면 href 가 아직 "없음" 기준으로 계산돼 있다. 그 경로도
// InputView 가 next 로 F3 까지 돌려보내 최종 도착지는 맞지만, 화면이 잠깐 입력 화면을 거치는
// 것을 막기 위해 하이드레이션 전에는 클릭·키보드 활성화가 되지 않게 한다. 앵커 자체는
// 그대로 서버에서 렌더해 크롤러·새 탭 열기는 그대로 된다(hydrated 는 서버·최초 클라이언트
// 렌더에서 항상 false 로 같아 하이드레이션 경고가 나지 않는다).
import Link from "next/link";

import { useProfileStore } from "@/entities/child";
import { ICONS } from "@/shared/ui";

const ArrowRight = ICONS.ArrowRight;

const F3_HREF = "/dashboard/age-basis";

export function MyChildCta() {
  const { result, hydrated } = useProfileStore();
  // 저장소가 손상돼도 F3 화면이 에러 패널로 안내하므로 "없음"만 입력 화면으로 보낸다.
  const href = result.status === "empty" ? `/?next=${encodeURIComponent(F3_HREF)}` : F3_HREF;

  return (
    <Link
      href={href}
      aria-disabled={hydrated ? undefined : true}
      tabIndex={hydrated ? undefined : -1}
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
        pointerEvents: hydrated ? undefined : "none",
      }}
    >
      내 아이로 계산하기
      <ArrowRight aria-hidden="true" style={{ width: "var(--icon-size-md)", height: "var(--icon-size-md)" }} />
    </Link>
  );
}
