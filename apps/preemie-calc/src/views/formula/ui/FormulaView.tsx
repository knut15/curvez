"use client";

// F15. route: /dashboard/formula
import { computeChildAges } from "@/entities/child";
import { FormulaPanelSection } from "@/widgets/formula-panel";
import { DashboardSubpageShell } from "@/widgets/dashboard-subpage";

export function FormulaView() {
  return (
    <DashboardSubpageShell title="분유량 참고">
      {({ profile, today }) => {
        const ages = computeChildAges({ birthDate: profile.birthDate, dueDate: profile.dueDate }, today);
        return <FormulaPanelSection childId={profile.id} ages={ages} />;
      }}
    </DashboardSubpageShell>
  );
}
