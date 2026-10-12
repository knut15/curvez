"use client";

// age-basis·checkups·copay-relief·correction-period 4개 화면이 공유하는 뼈대:
// 프로필 로딩 → 프로필 없으면 `/`로 → localStorage 손상 시 에러 패널 → 준비되면 children 렌더링.
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import type { CalendarDate } from "@/shared/lib/calendar-date";
import { useToday } from "@/shared/lib/calendar-date";
import { selectedProfileOf, useProfileStore, type ChildProfile } from "@/entities/child";
import { PageHeader, StatePanel } from "@/shared/ui";

export type DashboardSubpageShellProps = {
  title: string;
  children: (ctx: { profile: ChildProfile; today: CalendarDate }) => ReactNode;
};

export function DashboardSubpageShell({ title, children }: DashboardSubpageShellProps) {
  const router = useRouter();
  const today = useToday();
  const { result, hydrated } = useProfileStore();

  const shouldRedirectHome = hydrated && result.status === "empty";

  useEffect(() => {
    if (shouldRedirectHome) router.replace("/");
  }, [shouldRedirectHome, router]);

  const onBack = () => router.push("/dashboard");

  if (!hydrated || result.status === "empty") {
    return (
      <main>
        <PageHeader variant="back" title={title} onBack={onBack} />
      </main>
    );
  }

  if (result.status === "corrupted" || result.status === "unavailable") {
    // ERR-02: "형태가 맞지 않다"(corrupted)와 "저장소 자체를 못 읽는다"(unavailable)는
    // 서로 다른 사실이라 문구를 나눈다.
    const message =
      result.status === "unavailable" ? "저장 공간을 사용할 수 없습니다" : "안내를 불러오지 못했습니다";
    return (
      <main>
        <PageHeader variant="back" title={title} onBack={onBack} />
        <div className="pc-content-max pc-content-pad-x" style={{ paddingTop: "var(--space-6)", paddingBottom: "var(--space-6)" }}>
          <StatePanel variant="error" message={message} actionLabel="대시보드로" onAction={onBack} />
        </div>
      </main>
    );
  }

  const profile = selectedProfileOf(result.store);
  if (!profile) return null;

  return (
    <main>
      <PageHeader variant="back" title={title} onBack={onBack} />
      <div className="pc-content-narrow pc-content-max pc-content-pad-x">{children({ profile, today })}</div>
    </main>
  );
}
