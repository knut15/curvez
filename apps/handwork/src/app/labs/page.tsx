import { listLabs } from "@/entities/lab/api/labs";
import { LabIndexView } from "@/views/lab-index";
import { SiteFooter } from "@/widgets/site-footer";
import { SiteHeader } from "@/widgets/site-header";

export const metadata = {
  title: "Labs — handwork",
  description: "스킬과 오케스트레이션을 만든 기록. 성과와 초안과 히스토리.",
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
