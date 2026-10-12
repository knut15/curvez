"use client";

// F3. route: /dashboard/age-basis
import { computeChildAges } from "@/entities/child";
import { AgeBasisSection } from "@/widgets/age-basis-list";
import { DashboardSubpageShell } from "@/widgets/dashboard-subpage";

export function AgeBasisView() {
  return (
    <DashboardSubpageShell title="어느 나이를 쓰나">
      {({ profile, today }) => {
        const ages = computeChildAges({ birthDate: profile.birthDate, dueDate: profile.dueDate }, today);
        return <AgeBasisSection chronological={ages.chronological} corrected={ages.corrected} />;
      }}
    </DashboardSubpageShell>
  );
}
