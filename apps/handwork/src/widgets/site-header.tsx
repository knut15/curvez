import Link from "next/link";

import { ThemeToggle } from "@/shared/ui/theme-toggle";

type Current = "home" | "cases" | "case" | "labs";

/**
 * 모든 화면이 쓰는 단일 헤더. 홈과 서브가 같은 컴포넌트를 써야 좌우 간격이 갈리지 않는다.
 * 홈에서 테마가 바꾸는 것은 이 바뿐이다 — 사진과 워드마크는 고정이다.
 */
const LINK =
  "font-mono text-[0.7rem] tracking-widest uppercase underline underline-offset-4 transition-colors duration-150 ease-out hover:text-brand-accent motion-reduce:transition-none";

export function SiteHeader({ current = "home" }: { current?: Current }) {
  return (
    <header className="flex items-center justify-between gap-4 bg-brand-canvas px-5 py-3 text-brand-ink md:px-8">
      <span className="font-mono text-[0.7rem] tracking-[0.22em] uppercase">
        <Link
          href="/"
          aria-current={current === "home" ? "page" : undefined}
          className="transition-colors duration-150 ease-out hover:text-brand-accent motion-reduce:transition-none"
        >
          handwork<sup className="ml-0.5 text-[0.6em]">®</sup>
        </Link>
        <span className="ml-3 text-brand-ink/60">frontend systems</span>
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
