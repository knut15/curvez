import { listLabs } from "@/entities/lab/api/labs";
import { LabIndexView } from "@/views/lab-index";
import { SiteFooter } from "@/widgets/site-footer";
import { SiteHeader } from "@/widgets/site-header";

export const metadata = {
  title: "Labs — aster",
  description: "에이전트에게 일을 맡기려고 만든 규약과 도구의 기록.",
};

export default async function LabsPage() {
  const labs = await listLabs();

  return (
    <>
      <SiteHeader current="labs" />
      <LabIndexView labs={labs} />
      <SiteFooter />
    </>
  );
}
