import { notFound } from "next/navigation";

import { listPages } from "@/entities/page/api/pages";
import { listMenus } from "@/shared/lib/menu";
import { PageIndexView } from "@/views/page-index";
import { SiteFooter } from "@/widgets/site-footer";
import { SiteHeader } from "@/widgets/site-header";

/**
 * 전용 화면이 없는 메뉴의 목록 (`/archive` 등).
 *
 * **works·cases·labs·design 은 여기로 오지 않는다.** Next 는 정적 세그먼트를
 * 동적 세그먼트보다 먼저 맞추므로, 폴더가 있는 메뉴는 자기 화면이 계속 받는다.
 */
/**
 * 전용 화면이 있어 이 동적 라우트를 타지 않는 메뉴.
 *
 * Next 는 정적 세그먼트를 먼저 맞추므로 이 값들을 빼지 않아도 **동작은 같다.**
 * 빼는 이유는 빌드다 — 넣어 두면 works 39편이 `/works/x` 와 `/[collection]/x`
 * 두 벌로 생성된다. 이 목록은 `src/app/` 에 실제로 있는 폴더와 짝이다.
 */
const DEDICATED = new Set(["works", "cases", "labs", "design"]);

export async function generateStaticParams() {
  const menus = await listMenus();
  const open = menus.filter((menu) => !DEDICATED.has(menu.slug));
  return open.map((menu) => ({ collection: menu.slug }));
}

export default async function CollectionPage({
  params,
}: PageProps<"/[collection]">) {
  const { collection } = await params;

  const menus = await listMenus();
  const menu = menus.find((entry) => entry.slug === collection);
  // 디렉터리가 없는 주소는 메뉴가 아니다
  if (menu === undefined) notFound();

  const items = await listPages(collection);

  return (
    <>
      <SiteHeader menus={menus} current={collection} />
      <PageIndexView
        label={menu.label}
        items={items}
        collection={collection}
      />
      <SiteFooter />
    </>
  );
}
