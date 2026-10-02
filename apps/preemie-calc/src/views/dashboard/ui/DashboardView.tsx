"use client";

// F2 대시보드. route: /dashboard
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useToday } from "@/shared/lib/calendar-date";
import { childDisplayName, computeChildAges, selectedProfileOf, useProfileStore } from "@/entities/child";
import { ChildSwitcherTabs } from "@/features/switch-child";
import { ClearAllDataDialog } from "@/features/clear-all-data";
import { EditProfileDialog } from "@/features/edit-profile";
import { ShareResultAction } from "@/features/share-result";
import { AgeSummaryCard, formatAgeSummary } from "@/widgets/age-summary";
import { PageHeader, ReferenceFooter, StatePanel } from "@/shared/ui";
import { siteName } from "@/shared/config/site";

import { QuickLinks } from "./QuickLinks";

export function DashboardView() {
  const router = useRouter();
  const today = useToday();
  const { result, hydrated, refresh } = useProfileStore();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const shouldRedirectHome = hydrated && result.status === "empty";

  useEffect(() => {
    if (shouldRedirectHome) router.replace("/");
  }, [shouldRedirectHome, router]);

  if (!hydrated || result.status === "empty") {
    return (
      <main>
        <PageHeader variant="title-only" title={siteName.value} />
      </main>
    );
  }

  if (result.status === "corrupted" || result.status === "unavailable") {
    // ERR-02: "형태가 맞지 않다"(corrupted)와 "저장소 자체를 못 읽는다"(unavailable)는
    // 서로 다른 사실이라 문구를 나눈다.
    const message =
      result.status === "unavailable" ? "저장 공간을 사용할 수 없습니다" : "정보를 불러오지 못했습니다";
    return (
      <main>
        <PageHeader variant="title-only" title={siteName.value} />
        <div className="pc-content-max pc-content-pad-x" style={{ paddingTop: "var(--space-6)", paddingBottom: "var(--space-6)" }}>
          <StatePanel variant="error" message={message} actionLabel="처음으로" onAction={() => router.push("/")} />
        </div>
      </main>
    );
  }

  const { store } = result;
  const profile = selectedProfileOf(store);
  if (!profile) {
    // isValidStore + length 검사로 이 분기에는 닿지 않는다(방어적 코드).
    return null;
  }

  const ages = computeChildAges({ birthDate: profile.birthDate, dueDate: profile.dueDate }, today);
  const formatted = formatAgeSummary(ages);

  return (
    <main>
      <PageHeader
        variant="dashboard"
        title={siteName.value}
        onEditProfile={() => setEditOpen(true)}
        onDeleteAll={() => setDeleteOpen(true)}
      />
      <ChildSwitcherTabs
        options={store.profiles.map((p, i) => ({ id: p.id, label: childDisplayName(p, i) }))}
        selectedId={profile.id}
        onSelect={refresh}
      />
      <div className="pc-dashboard-content pc-content-max pc-content-pad-x">
        <AgeSummaryCard
          chronological={formatted.chronological}
          corrected={formatted.corrected}
          basisLine={formatted.basisLine}
          nextMonthDates={formatted.nextMonthDates}
        />
        <QuickLinks gestationTotalDays={ages.gestationAtBirth.totalDays} />
        <ShareResultAction
          birthDate={profile.birthDate}
          dueDate={profile.dueDate}
          today={today}
          chronological={formatted.chronological}
          corrected={formatted.corrected}
        />
        <ReferenceFooter variant="disclaimer-only" />
      </div>
      <EditProfileDialog
        open={editOpen}
        profile={profile}
        onSaved={() => {
          refresh();
          setEditOpen(false);
        }}
        onCancel={() => setEditOpen(false)}
      />
      <ClearAllDataDialog open={deleteOpen} onCancel={() => setDeleteOpen(false)} />
    </main>
  );
}
