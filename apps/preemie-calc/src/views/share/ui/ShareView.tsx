"use client";

// F7 받는 쪽. route: /share#b=YYYY-MM-DD&d=YYYY-MM-DD
// 스펙: .curvez/design/preemie-calc/screens/share.md
import { useRef, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import { useToday } from "@/shared/lib/calendar-date";
import {
  computeChildAges,
  decodeShareFragment,
  validateSharePayload,
  type SharePayload,
} from "@/entities/child";
import { formatAgeSummary } from "@/widgets/age-summary";
import { AgeSummaryCard } from "@/widgets/age-summary";
import { Button, PageHeader, ReferenceFooter, StatePanel } from "@/shared/ui";
import { siteName } from "@/shared/config/site";

function subscribeHash(): () => void {
  return () => {};
}

function getHashServerSnapshot(): undefined {
  // 아직 location.hash 를 읽기 전(<200ms, 표시하지 않는다).
  return undefined;
}

export function ShareView() {
  const router = useRouter();
  const today = useToday();
  // location.hash(외부 값) 읽기를 useSyncExternalStore 로 옮긴다. decodeShareFragment 는
  // 호출마다 새 객체를 만들어 매 렌더 새 참조를 돌려주면 무한 렌더 위험이 있어, 같은 hash
  // 문자열이면 이전 결과 참조를 그대로 재사용한다(인스턴스별 캐시라 다른 ShareView 와 안 섞인다).
  // null: 해독 실패.
  const hashCacheRef = useRef<{ hash: string; payload: SharePayload | null } | null>(null);
  const payload = useSyncExternalStore(
    subscribeHash,
    () => {
      const hash = window.location.hash;
      if (!hashCacheRef.current || hashCacheRef.current.hash !== hash) {
        hashCacheRef.current = { hash, payload: decodeShareFragment(hash) };
      }
      return hashCacheRef.current.payload;
    },
    getHashServerSnapshot,
  );

  let content: React.ReactNode = null;

  if (payload === null) {
    content = (
      <StatePanel
        variant="error"
        message="링크를 확인할 수 없습니다"
        actionLabel="계산기 열기"
        onAction={() => router.push("/")}
      />
    );
  } else if (payload !== undefined) {
    const errors = validateSharePayload(payload, today);
    if (errors.length > 0) {
      content = (
        <StatePanel
          variant="error"
          message="링크를 확인할 수 없습니다"
          actionLabel="계산기 열기"
          onAction={() => router.push("/")}
        />
      );
    } else {
      const ages = computeChildAges({ birthDate: payload.birthDate, dueDate: payload.dueDate }, today);
      const formatted = formatAgeSummary(ages);
      content = (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
          <AgeSummaryCard
            variant="share-preview"
            chronological={formatted.chronological}
            corrected={formatted.corrected}
            basisLine={formatted.basisLine}
            nextMonthDates={formatted.nextMonthDates}
          />
          <Button
            variant="secondary"
            fullWidth
            icon={{ name: "ArrowRight", position: "trailing" }}
            onClick={() => router.push("/")}
          >
            내 아이도 계산해보기
          </Button>
        </div>
      );
    }
  }

  return (
    <div className="pc-page-hero-bg">
      <main>
        <PageHeader variant="title-only" title={siteName.value} />
        <div
          className="pc-content-max pc-content-pad-x"
          style={{ paddingTop: "var(--space-5)", paddingBottom: "var(--space-5)" }}
        >
          {content}
          <ReferenceFooter variant="disclaimer-only" />
        </div>
      </main>
    </div>
  );
}
