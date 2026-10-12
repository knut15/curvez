"use client";

// F6. route: /dashboard/correction-period
import { gestationFromDates } from "@/entities/child";
import { CorrectionPeriodSection } from "@/widgets/correction-period-result";
import { DashboardSubpageShell } from "@/widgets/dashboard-subpage";

export function CorrectionPeriodView() {
  return (
    <DashboardSubpageShell title="교정연령 적용 종료 안내">
      {({ profile }) => {
        const gestation = gestationFromDates(profile.birthDate, profile.dueDate);
        return <CorrectionPeriodSection gestation={gestation} birthWeightGrams={profile.birthWeightGrams} />;
      }}
    </DashboardSubpageShell>
  );
}
