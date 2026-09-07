import Link from "next/link";

import { ThemeToggle } from "@/shared/ui/theme-toggle";

type Current = "home" | "cases" | "case";

const LINK =
  "rounded-md py-3 text-sm text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function SiteHeader({ current = "home" }: { current?: Current }) {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-4">
        <Link
          href="/"
          className={`${LINK} font-medium text-foreground`}
          aria-current={current === "home" ? "page" : undefined}
        >
          handwork
        </Link>
        <Link
          href="/cases"
          className={LINK}
          aria-current={current === "cases" ? "page" : undefined}
        >
          케이스
        </Link>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
