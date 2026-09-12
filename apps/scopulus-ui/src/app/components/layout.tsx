import { ComponentsNav } from "@/widgets/components-nav";
import { SiteFooter } from "@/widgets/site-footer";
import { SiteHeader } from "@/widgets/site-header";
import { CATEGORIES, listComponents } from "@/shared/lib/components";

/**
 * `/components` 와 `/components/<slug>` 가 같이 쓰는 껍데기.
 *
 * **왼쪽 목록이 여기 있는 것이 요점이다.** 페이지마다 두면 라우트를 옮길 때 다시 마운트되고
 * 목록의 스크롤이 맨 위로 돌아간다. 레이아웃은 자식 라우트 사이를 옮겨도 DOM 이 유지된다.
 *
 * `PageShell` 을 쓰지 않는다. 그 컴포넌트는 한 단 화면의 폭과 여백을 갖고 `className` 을
 * 받지 않는다. 여기는 왼쪽 목록이 붙은 두 단이다.
 */
export default async function ComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const items = await listComponents();
  // 묶음까지 여기서 나눈다. 목록은 클라이언트 컴포넌트라 `node:fs` 를 끌고 오는 모듈을
  // import 할 수 없다.
  const groups = CATEGORIES.map((c) => ({
    id: c.id,
    label: c.label,
    items: items
      .filter((i) => i.category === c.id)
      .map((i) => ({ href: `/components/${i.slug}`, label: i.name })),
  })).filter((g) => g.items.length > 0);

  return (
    <>
      <SiteHeader current="/components" />
      <main className="mx-auto flex w-full max-w-6xl flex-1 gap-10 px-5 py-10 md:px-8 md:py-16">
        <ComponentsNav groups={groups} />
        <div className="min-w-0 flex-1">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}
