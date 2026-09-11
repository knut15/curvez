import { AppLink, Badge, Card, PageShell, PageTitle } from "@scopulus/ui";

import { SiteFooter } from "@/widgets/site-footer";
import { SiteHeader } from "@/widgets/site-header";
import { listComponents } from "@/shared/lib/components";

export const metadata = {
  title: "Components — scopulusUI",
  description: "컴포넌트 목록. 실측에서 나온 것과 받은 것을 갈라 싣는다.",
};

export default async function ComponentsPage() {
  const items = await listComponents();

  return (
    <>
      <SiteHeader current="/components" />
      <PageShell>
        <PageTitle
          description={
            <>
              근거가 둘로 갈립니다. <strong>실측</strong>은 실제 화면에서 같은
              클래스가 몇 번 반복됐는지를 세어 뽑은 것이고,{" "}
              <strong>받은 것</strong>은 shadcn base-nova 에서 가져와 토큰만
              맞춘 것입니다. 뒤쪽은 아직 화면에 쓰인 적이 없습니다.
            </>
          }
        >
          Components
        </PageTitle>

        <ul role="list" className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((item) => (
            <li key={item.slug} className="flex">
              <Card href={`/components/${item.slug}`}>
                <span className="flex items-center gap-2">
                  <Badge
                    variant="status"
                    tone={item.origin === "measured" ? "active" : "idle"}
                  >
                    {item.origin === "measured" ? "실측" : "받은 것"}
                  </Badge>
                  {item.evidence ? (
                    <span className="text-xs text-muted-foreground">
                      {item.evidence}
                    </span>
                  ) : null}
                </span>
                <span className="text-lg font-medium text-card-foreground">
                  {item.name}
                </span>
                <span className="line-clamp-2 text-sm text-muted-foreground">
                  {item.summary}
                </span>
              </Card>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-sm text-muted-foreground">
          값의 정본은{" "}
          <code className="rounded-sm bg-muted px-1">
            packages/scopulus-ui/design/
          </code>{" "}
          입니다. 이 사이트는 그 값을 보여주는 곳이지 정하는 곳이 아닙니다 —{" "}
          <AppLink href="/docs/tokens">토큰</AppLink>도 마찬가지입니다.
        </p>
      </PageShell>
      <SiteFooter />
    </>
  );
}
