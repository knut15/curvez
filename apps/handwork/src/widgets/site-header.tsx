import Link from "next/link";

import { ThemeToggle } from "@scopulus/ui";

type Current = "home" | "cases" | "case" | "labs";

/**
 * 모든 화면이 쓰는 단일 헤더. 홈과 서브가 같은 컴포넌트를 써야 좌우 간격이 달라지지 않는다.
 * 홈에서 테마가 바꾸는 것은 이 바뿐이다 — 사진과 워드마크는 고정이다.
 *
 * 세로 여백은 바(py-2.5)가 아니라 링크(py-2)가 만든다. 바에 몰아 주면 링크의 클릭 영역이
 * 글자 높이(11px)에 머물러 최소 타깃 24px 에 못 미친다.
 */
const LINK =
  "inline-flex items-center py-2 font-mono text-[0.7rem] tracking-widest uppercase underline underline-offset-4 transition-colors duration-150 ease-out hover:text-brand-accent focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none";

export function SiteHeader({ current = "home" }: { current?: Current }) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-brand-canvas px-5 py-2.5 text-brand-ink md:px-8">
      <span className="font-mono text-[0.7rem] tracking-[0.22em] uppercase">
        <Link
          href="/"
          aria-current={current === "home" ? "page" : undefined}
          className="inline-flex items-center py-2 transition-colors duration-150 ease-out hover:text-brand-accent focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
        >
          handwork<sup className="ml-0.5 text-[0.6em]">®</sup>
        </Link>
        {/* 375px 에서 로고+태그라인+링크 2개+토글이 한 줄에 들어가지 않는다.
            헤더는 어느 폭에서도 한 줄이어야 하므로 가장 덜 중요한 이것을 먼저 접는다. */}
        <span className="ml-3 hidden text-brand-ink/60 sm:inline">
          frontend systems
        </span>
      </span>
      <nav className="flex items-center gap-4">
        <Link
          href="/cases"
          aria-current={current === "cases" ? "page" : undefined}
          className={LINK}
        >
          Cases
        </Link>
        <Link
          href="/labs"
          aria-current={current === "labs" ? "page" : undefined}
          className={LINK}
        >
          Labs
        </Link>
        <ThemeToggle />
      </nav>
    </header>
  );
}
