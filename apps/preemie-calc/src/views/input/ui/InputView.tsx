"use client";

// F1. route: `/` · `/?weeks=<24~36>` · `/?new=1` · `/?next=<내부 경로>`
// BND-01: 쿼리는 이 컴포넌트(클라이언트)에서 읽는다. app/page.tsx 는 정적으로 두고
// Suspense 로 감싼다(useSearchParams 는 정적 렌더링 중 Suspense 경계가 필요하다).
// PC-F16-EX1·PC-F18-AC2: 계산기 링크가 프로필 없이 이 화면을 거칠 때 "next"에 원래 목적지를
// 담아 보낸다. 열린 리다이렉트를 막기 위해 normalizeReturnPath 가 정규화한 값만 쓴다.
// 스펙: .curvez/design/preemie-calc/screens/input.md
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useProfileStore } from "@/entities/child";
import { ProfileForm } from "@/features/profile-form";
import { normalizeReturnPath } from "@/shared/lib/return-path";
import { IconBadge, PageHeader } from "@/shared/ui";
import { siteName } from "@/shared/config/site";

const MIN_WEEKS = 24;
const MAX_WEEKS = 36;
const DEFAULT_RETURN_TO = "/dashboard";

function parseWeeksParam(raw: string | null): number | null {
  if (raw === null) return null;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < MIN_WEEKS || n > MAX_WEEKS) return null;
  return n;
}

function parseReturnTo(raw: string | null): string {
  if (raw === null) return DEFAULT_RETURN_TO;
  return normalizeReturnPath(raw) ?? DEFAULT_RETURN_TO;
}

export function InputView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const weeksParam = searchParams.get("weeks");
  const isNew = searchParams.get("new") === "1";
  const returnTo = parseReturnTo(searchParams.get("next"));
  const { result, hydrated } = useProfileStore();

  const shouldRedirectToDashboard = hydrated && !isNew && result.status === "ok";

  useEffect(() => {
    if (shouldRedirectToDashboard) {
      router.replace(returnTo);
    }
  }, [shouldRedirectToDashboard, router, returnTo]);

  const showForm = hydrated && !shouldRedirectToDashboard;

  return (
    <div className="pc-page-hero-bg">
      <main>
        <PageHeader variant="title-only" title={siteName.value} />
        <div
          className="pc-content-max pc-content-pad-x"
          style={{
            paddingTop: "var(--space-6)",
            paddingBottom: "var(--space-6)",
          }}
        >
          <div
            style={{
              background: "var(--color-bg-surface)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--elevation-card)",
              padding: "var(--space-6)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "var(--space-5)" }}>
              <IconBadge icon="Baby" tone="primary" size="hero" />
            </div>
            {showForm ? <ProfileForm initialWeeks={parseWeeksParam(weeksParam)} returnTo={returnTo} /> : null}
          </div>
        </div>
      </main>
    </div>
  );
}
