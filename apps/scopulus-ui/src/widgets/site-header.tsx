import Link from "next/link";
import { AppLink, ThemeToggle } from "@scopulus/ui";

const NAV = [
  { href: "/docs/getting-started", label: "Docs" },
  { href: "/components", label: "Components" },
  { href: "/changelog", label: "Changelog" },
];

export function SiteHeader({ current }: { current?: string }) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-6 px-5 py-2.5 md:px-8">
        <Link
          href="/"
          className="font-mono text-sm font-semibold tracking-tight transition-colors duration-150 ease-out hover:text-brand focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
        >
          scopulus<span className="text-muted-foreground">UI</span>
        </Link>

        <nav className="flex flex-1 items-center gap-4 text-sm">
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

        <ThemeToggle />
      </div>
    </header>
  );
}
