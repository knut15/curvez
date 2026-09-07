import Link from "next/link";

import { SiteFooter } from "@/widgets/site-footer";
import { SiteHeader } from "@/widgets/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 md:py-16">
        <h1 className="text-2xl font-semibold">찾을 수 없는 케이스입니다.</h1>
        <p className="mt-4">
          <Link
            href="/cases"
            className="text-muted-foreground underline underline-offset-4 transition-colors duration-150 ease-out hover:text-foreground motion-reduce:transition-none"
          >
            케이스 목록으로
          </Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
