import { AppLink, Badge, Card, Separator } from "@scopulus/ui";

import { SiteFooter } from "@/widgets/site-footer";
import { SiteHeader } from "@/widgets/site-header";
import { listSlugs } from "@/shared/lib/mdx-collection";

/** 실측에서 나온 것과 받은 것의 개수. 두 근거를 섞지 않는다. */
const MEASURED = 9;

const TOKEN_SAMPLE = [
  { name: "--background", cls: "bg-background border border-border" },
  { name: "--card", cls: "bg-card border border-border" },
  { name: "--muted", cls: "bg-muted" },
  { name: "--primary", cls: "bg-primary" },
  { name: "--ring", cls: "bg-ring" },
  { name: "--destructive", cls: "bg-destructive" },
];

export default async function HomePage() {
  const total = (await listSlugs("components")).length;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-16 md:px-8 md:py-24">
        <p className="font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">
          scopulusUI · v0.1.0
        </p>
        <h1 className="mt-4 max-w-[18ch] text-5xl font-bold tracking-[-0.03em] break-keep md:text-6xl">
          세어서 만든 디자인 시스템
        </h1>
        <p className="mt-6 max-w-[58ch] text-lg leading-relaxed break-keep text-muted-foreground">
          컴포넌트 {MEASURED}종은 실제 화면에서 같은 클래스 문자열이 몇 번
          반복되는지 세어 뽑았습니다. 그 횟수와{" "}
          <code className="rounded-sm bg-muted px-1">파일:줄</code> 이 각 스펙에
          근거로 박혀 있습니다. 취향으로 정한 값이 없습니다.
        </p>

        {/* 버튼처럼 보이는 링크를 만들지 않는다. 이 시스템은 주소가 바뀌는 것을 `AppLink`,
            바뀌지 않는 것을 `Button` 으로 가른다 — `Button.md` 가 `variant="link"` 와
            `asChild` 를 뺀 이유가 그것이다. 여기는 이동이므로 링크로 보인다. */}
        <p className="mt-8 flex flex-wrap items-center gap-5 text-base">
          <AppLink href="/components">컴포넌트 {total}종 보기</AppLink>
          <AppLink href="/docs/getting-started">시작하기</AppLink>
        </p>

        <Separator />

        <section>
          <h2 className="text-sm font-medium tracking-tight">
            근거가 둘로 갈린다
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Card href="/components">
              <span className="flex items-center gap-2">
                <Badge variant="status" tone="active">
                  실측
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {MEASURED}종
                </span>
              </span>
              <span className="text-lg font-medium text-card-foreground">
                화면에서 세어 뽑은 것
              </span>
              <span className="text-sm text-muted-foreground">
                같은 클래스가 몇 번 반복됐는지가 이 컴포넌트가 존재하는
                이유입니다.
              </span>
            </Card>
            <Card href="/components">
              <span className="flex items-center gap-2">
                <Badge variant="status" tone="idle">
                  받은 것
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {total - MEASURED}종
                </span>
              </span>
              <span className="text-lg font-medium text-card-foreground">
                shadcn base-nova 에서
              </span>
              <span className="text-sm text-muted-foreground">
                실측 근거가 없습니다. 각 스펙에 사용처 0곳이라고 적혀 있습니다.
              </span>
            </Card>
          </div>
        </section>

        <Separator />

        <section>
          <h2 className="text-sm font-medium tracking-tight">토큰</h2>
          <p className="mt-2 max-w-[58ch] text-sm leading-relaxed break-keep text-muted-foreground">
            중립 스케일이 무채색이 아니라 브랜드 색조를 띱니다. 명도는 기본값과
            거의 같게 두고 채도만 얹었습니다.
          </p>
          <ul role="list" className="mt-5 flex flex-wrap gap-3">
            {TOKEN_SAMPLE.map((t) => (
              <li key={t.name} className="flex items-center gap-2">
                <span className={`size-8 rounded-md ${t.cls}`} aria-hidden />
                <code className="font-mono text-xs text-muted-foreground">
                  {t.name}
                </code>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
