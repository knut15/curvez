import { LabIndexView } from "@/views/lab-index";
import { SiteFooter } from "@/widgets/site-footer";
import { SiteHeader } from "@/widgets/site-header";

export const metadata = {
  title: "Labs — handwork",
  description: "검증 중인 실험과 만들다 만 도구.",
};

export default function LabsPage() {
  return (
    <>
      <SiteHeader current="labs" />
      <LabIndexView />
      <SiteFooter />
    </>
  );
}
