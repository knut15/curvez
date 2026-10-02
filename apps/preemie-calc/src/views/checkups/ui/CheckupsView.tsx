"use client";

// F4. route: /dashboard/checkups
import { computeChildAges } from "@/entities/child";
import { CheckupPlanSection } from "@/widgets/checkup-plan";
import { DashboardSubpageShell } from "@/widgets/dashboard-subpage";

export function CheckupsView() {
  return (
    <DashboardSubpageShell title="영유아검진 도우미">
      {({ profile, today }) => {
        const ages = computeChildAges({ birthDate: profile.birthDate, dueDate: profile.dueDate }, today);
        const correctedFrom = ages.correctionApplies ? profile.dueDate : null;
        return <CheckupPlanSection birthDate={profile.birthDate} correctedFrom={correctedFrom} today={today} />;
      }}
    </DashboardSubpageShell>
  );
}
