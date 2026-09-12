import Link from "next/link";
import { AppLink, Separator } from "@scopulus/ui";

import { ComponentPreview } from "@/widgets/component-preview";
import { SiteFooter } from "@/widgets/site-footer";
import { ScopulusRock } from "@/widgets/scopulus-rock";
import { SiteHeader } from "@/widgets/site-header";
import { listComponents } from "@/shared/lib/components";
import { RELEASE } from "@/shared/lib/release";

/**
 * 랜딩에 세우는 컴포넌트. 묶음마다 하나씩 골라 무엇을 주는지 한눈에 보이게 한다.
 *
 * 목록을 여기서 정한다. `listComponents()` 앞에서 여덟을 자르면 알파벳순 앞쪽만 나와
 * Actions 와 Data display 만 보인다.
 */
const FEATURED = [
  "button",
  "card",
  "badge",
  "switch",
  "input",
  "alert",
  "steps",
  "avatar",
];

/** 설치에 필요한 줄 전부. 더 있으면 `/docs/getting-started` 가 아니라 여기가 틀린 것이다. */
const INSTALL = `// package.json
"@scopulus/ui": "workspace:*"

/* globals.css */
@import "@scopulus/ui/tokens.css";
@source "../../../../packages/scopulus-ui/src";`;

const TOKEN_SAMPLE = [
  { name: "--background", cls: "bg-background border border-border" },
  { name: "--card", cls: "bg-card border border-border" },
  { name: "--muted", cls: "bg-muted" },
  { name: "--primary", cls: "bg-primary" },
  { name: "--ring", cls: "bg-ring" },
  { name: "--destructive", cls: "bg-destructive" },
];

export default async function HomePage() {
  const all = await listComponents();
  const featured = FEATURED.map((slug) => {
    const found = all.find((c) => c.slug === slug);
    // 조용히 빼지 않는다. 슬러그가 바뀌면 랜딩에서 카드가 사라지고 아무도 모른다.
    if (!found) throw new Error(`FEATURED 에 없는 슬러그: ${slug}`);
    return found;
  });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-16 md:px-8 md:py-24">
        {/* 행성은 글 옆에 선다. 좁은 화면에서는 아래로 내려가되 사라지지 않는다 —
            브랜드 이름이 행성 지형에서 온 것이라 이 도형이 이름을 설명한다. */}
        <div className="grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_auto] md:gap-12">
          <div>
            <p className="font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">
              ScopulusUI · {RELEASE}
            </p>
            {/* 제목은 이름이다. 무엇을 지키는지는 바로 아래 문단이 말한다. */}
            {/* 두 줄로 고정한다. `max-w` 로 접으면 화면 폭에 따라 줄 나뉘는 자리가
                달라져 어떤 폭에서는 "ScopulusUI Design" / "System" 으로 끊긴다. */}
            <h1 className="mt-4 text-5xl font-bold tracking-[-0.03em] break-keep md:text-6xl">
              ScopulusUI
              <br />
              Design System
            </h1>
            <p className="mt-6 max-w-[58ch] text-lg leading-relaxed break-keep text-muted-foreground">
              ScopulusUI is a design system built on Tailwind CSS.
            </p>

            {/* 요소는 `<a>` 로 두고 모양만 `Button` 의 클래스를 입는다. 이동이므로 새 탭 열기와
                주소 복사가 살아 있어야 하고, `role="button"` 을 붙이면 그것이 막힌다. */}
            <p className="mt-8 flex flex-wrap items-center gap-3 text-base">
              <AppLink href="/components" variant="cta">
                View Components
              </AppLink>
              <AppLink href="/docs/getting-started" variant="cta-quiet">
                Get Started
              </AppLink>
            </p>
          </div>

          <ScopulusRock className="order-first mx-auto size-[min(62vw,17rem)] md:order-none md:mx-0 md:size-[clamp(15rem,26vw,20rem)]" />
        </div>

        <Separator />

        <section>
          <h2 className="text-base font-bold tracking-wider text-muted-foreground uppercase">
            Install
          </h2>
          <pre className="mt-4 overflow-x-auto rounded-lg border border-border bg-muted p-4 text-xs leading-relaxed">
            <code>{INSTALL}</code>
          </pre>
          <p className="mt-3 text-sm text-muted-foreground">
            <AppLink href="/docs/getting-started">시작하기</AppLink> 에 다크
            모드와 서체 설정이 있습니다.
          </p>
        </section>

        <Separator />

        <section>
          <h2 className="text-base font-bold tracking-wider text-muted-foreground uppercase">
            Components
          </h2>
          <ul
            role="list"
            className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4"
          >
            {featured.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/components/${item.slug}`}
                  className="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <ComponentPreview slug={item.slug} />
                  <span className="mt-3 block font-medium group-hover:text-ring">
                    {item.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm">
            <AppLink href="/components">
              컴포넌트 {all.length}종 전부 보기 →
            </AppLink>
          </p>
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
