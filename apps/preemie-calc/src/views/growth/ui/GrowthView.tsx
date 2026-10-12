"use client";

// F8. route: /dashboard/growth
import { computeChildAges } from "@/entities/child";
import { GrowthPanelSection } from "@/widgets/growth-panel";
import { DashboardSubpageShell } from "@/widgets/dashboard-subpage";

export function GrowthView() {
  return (
    <DashboardSubpageShell title="성장 기록">
      {({ profile, today }) => {
        const ages = computeChildAges({ birthDate: profile.birthDate, dueDate: profile.dueDate }, today);
        const correctedFrom = ages.correctionApplies ? profile.dueDate : null;
        return (
          <GrowthPanelSection
            childId={profile.id}
            sex={profile.sex}
            birthDate={profile.birthDate}
            correctedFrom={correctedFrom}
            today={today}
          />
        );
      }}
    </DashboardSubpageShell>
  );
}
