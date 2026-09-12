import Link from "next/link";
import { AppLink, ThemeToggle } from "@scopulus/ui";

import { ScopulusMark } from "./scopulus-mark";
import { RELEASE } from "@/shared/lib/release";

const NAV = [
  { href: "/docs/getting-started", label: "Docs" },
  { href: "/components", label: "Components" },
];

const REPO = "https://github.com/knut15/curvez";

/**
 * 세 칸이다 — 왼쪽 브랜드, 가운데 메뉴, 오른쪽 도구.
 *
 * **가운데 정렬을 `flex-1` 로 하지 않는다.** 양옆 칸의 폭이 달라서(브랜드가 도구보다 넓다)
 * 가운데 칸을 늘리면 메뉴가 화면 중앙에서 비켜 앉는다. 세 칸을 같은 폭으로 잡는 grid 라야
 * 가운데 칸의 중심이 화면 중심과 같아진다.
 *
 * 좁은 화면에서는 가운데 칸을 접고 두 칸으로 둔다. 세 칸을 유지하면 메뉴가 눌린다.
 */
export function SiteHeader({ current }: { current?: string }) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
      {/* 높이를 64px 로 고정한다. `Menu` 의 `MenuScroll` 이 이 값만큼 내려가 붙으므로
          내용에 따라 높이가 흔들리면 그쪽이 조용히 어긋난다. */}
      <div className="mx-auto grid h-16 w-full max-w-6xl grid-cols-[1fr_auto] items-center gap-6 px-5 md:grid-cols-3 md:px-8">
        {/* 마크와 이름이 한 링크다. 둘로 나누면 같은 곳으로 가는 초점 대상이 둘이 되고,
            화면 낭독기가 이름을 두 번 읽는다. 마크가 `decorative` 인 이유가 그것이다.
            버전은 링크 밖이다 — 누를 것이 아니다. */}
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-sm font-semibold tracking-tight transition-colors duration-150 ease-out hover:text-brand focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
          >
            <ScopulusMark className="size-5 shrink-0" decorative />
            Scopulus<span className="text-muted-foreground">UI</span>
          </Link>
          <span className="rounded-full bg-muted px-1.5 py-0.5 font-mono text-[0.65rem] tabular-nums text-muted-foreground">
            {RELEASE}
          </span>
        </div>

        <nav className="hidden items-center justify-center gap-5 text-sm md:flex">
          {NAV.map((item) => (
            <AppLink
              key={item.href}
              href={item.href}
              variant="bare"
              current={current === item.href}
            >
              <span className="inline-flex items-center py-2">
                {item.label}
              </span>
            </AppLink>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-1">
          <a
            href={REPO}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub 저장소 (새 탭)"
            className="flex size-10 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 ease-out hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
          >
            <GitHubIcon className="size-5" />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

/** GitHub 의 공식 마크. `lucide-react` 에 없어서 경로를 그대로 둔다. */
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}
