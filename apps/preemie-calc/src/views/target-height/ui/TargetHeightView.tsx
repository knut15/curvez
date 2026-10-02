"use client";

// F14. route: /dashboard/target-height
import { TargetHeightPanelSection } from "@/widgets/target-height-panel";
import { DashboardSubpageShell } from "@/widgets/dashboard-subpage";

export function TargetHeightView() {
  return (
    <DashboardSubpageShell title="목표키 참고">
      {({ profile }) => <TargetHeightPanelSection sex={profile.sex} />}
    </DashboardSubpageShell>
  );
}
