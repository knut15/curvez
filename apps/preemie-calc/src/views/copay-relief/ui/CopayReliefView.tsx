"use client";

// F5. route: /dashboard/copay-relief
import { gestationFromDates } from "@/entities/child";
import { CopayReliefSection } from "@/widgets/copay-relief-result";
import { DashboardSubpageShell } from "@/widgets/dashboard-subpage";

export function CopayReliefView() {
  return (
    <DashboardSubpageShell title="본인부담 경감 종료일">
      {({ profile }) => {
        const gestation = gestationFromDates(profile.birthDate, profile.dueDate);
        return <CopayReliefSection birthDate={profile.birthDate} gestation={gestation} />;
      }}
    </DashboardSubpageShell>
  );
}
