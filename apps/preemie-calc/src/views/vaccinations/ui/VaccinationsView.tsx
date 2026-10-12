"use client";

// F10. route: /dashboard/vaccinations
import { computeChildAges } from "@/entities/child";
import { VaccinationPlanSection } from "@/widgets/vaccination-plan";
import { DashboardSubpageShell } from "@/widgets/dashboard-subpage";

export function VaccinationsView() {
  return (
    <DashboardSubpageShell title="예방접종 일정">
      {({ profile, today }) => {
        const ages = computeChildAges({ birthDate: profile.birthDate, dueDate: profile.dueDate }, today);
        const correctedFrom = ages.correctionApplies ? profile.dueDate : null;
        return (
          <VaccinationPlanSection
            childId={profile.id}
            birthDate={profile.birthDate}
            correctedFrom={correctedFrom}
            today={today}
          />
        );
      }}
    </DashboardSubpageShell>
  );
}
