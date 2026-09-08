import Link from "next/link";

import { SiteFooter } from "@/widgets/site-footer";
import { SiteHeader } from "@/widgets/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 md:px-8 md:py-16">
        <h1 className="text-4xl font-bold tracking-[-0.02em]">
          찾을 수 없는 케이스입니다.
        </h1>
        <p className="mt-3 text-muted-foreground">
          <Link
            href="/cases"
            className="underline underline-offset-4 transition-colors duration-150 ease-out hover:text-brand-accent focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
          >
            케이스 목록으로
          </Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
