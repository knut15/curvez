import { DocsNav } from "@/widgets/docs-nav";
import { SiteFooter } from "@/widgets/site-footer";
import { SiteHeader } from "@/widgets/site-header";

/**
 * `/docs/*` 와 `/changelog` 가 같이 쓰는 껍데기. 컴포넌트 화면과 같은 두 단이다.
 *
 * **라우트 그룹(`(docs)`)이다.** 괄호 이름은 주소에 들어가지 않으므로 `/docs/tokens` 와
 * `/changelog` 가 그대로 남는다. 형제 라우트 둘이 한 레이아웃을 쓰게 하는 방법이 이것뿐이다.
 *
 * **왼쪽 목록이 레이아웃에 있는 것이 요점이다.** 페이지마다 두면 라우트를 옮길 때 다시
 * 마운트되고 목록의 스크롤이 맨 위로 돌아간다.
 *
 * `PageShell` 을 쓰지 않는다. 그것은 한 단 화면의 폭과 여백을 갖고 `className` 을 받지 않는다.
 */
export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader current="/docs/getting-started" />
      <main className="mx-auto flex w-full max-w-6xl flex-1 gap-10 px-5 py-10 md:px-8 md:py-16">
        <DocsNav />
        <div className="min-w-0 flex-1">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}
