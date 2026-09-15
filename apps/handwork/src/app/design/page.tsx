import { DesignView } from "@/views/design";
import { SiteFooter } from "@/widgets/site-footer";
import { listMenus } from "@/shared/lib/menu";
import { SiteHeader } from "@/widgets/site-header";

export const metadata = {
  title: "Aster 디자인 가이드",
  description:
    "Aster의 색상, 글꼴, 모서리 둥글기, 헤더 높이와 라이트·다크 테마의 색상 대비를 정리한 디자인 가이드입니다.",
};

export default async function DesignPage() {
  const menus = await listMenus();
  return (
    <>
      <SiteHeader menus={menus} current="design" />
      <DesignView />
      <SiteFooter />
    </>
  );
}
