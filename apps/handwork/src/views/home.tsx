import Image from "next/image";
import Link from "next/link";

import { DiagonalStripes } from "@/shared/ui/motifs";
import { ThemeToggle } from "@/shared/ui/theme-toggle";

/**
 * 워드마크는 사진 위에 바로 얹는다.
 * 라이트: 하이키 이미지 위 검은 글씨 — 3:1 미달 픽셀 1.51%.
 * 다크: 같은 이미지에 70% 어둠 레이어를 덮고 민트 글씨 — 4.5:1 미달 픽셀 0.00%.
 *      60% 는 큰 글자(3:1)만 통과해서 캡션이 걸린다.
 */
export function HomeView() {
  return (
    <main className="relative h-dvh overflow-hidden">
      <Image
        src="/brand/hero-highkey.webp"
        alt="옅은 민트색 종이 조각이 화면을 가득 채우고, 오른쪽에서 손이 조각 하나를 제자리에 놓는 장면"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        className="absolute inset-0 hidden bg-[#101514]/70 dark:block"
        aria-hidden
      />

      <div className="relative flex h-full flex-col">
        <header
          className="flex items-center justify-between gap-4 bg-[#101514] px-5 py-3 text-[#e4e8e7] md:px-8"
          style={{ colorScheme: "dark" }}
        >
          <span className="font-mono text-[0.7rem] tracking-[0.22em] uppercase">
            handwork<sup className="ml-0.5 text-[0.6em]">®</sup>
          </span>
          <nav className="flex items-center gap-4">
            <Link
              href="/cases"
              className="font-mono text-[0.7rem] tracking-widest uppercase underline underline-offset-4 transition-colors duration-150 ease-out hover:text-[#5eead4] motion-reduce:transition-none"
            >
              케이스
            </Link>
            <ThemeToggle />
          </nav>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center text-[#101514] dark:text-[#5eead4]">
          <h1 className="font-[family-name:var(--font-display)] text-[clamp(3.5rem,15vw,11rem)] leading-[0.82] tracking-tight uppercase">
            handwork
          </h1>
          <DiagonalStripes
            className="mt-6 h-5 w-[min(18rem,60vw)]"
            aria-hidden
          />
          <p className="mt-5 font-mono text-[0.7rem] tracking-[0.28em] uppercase">
            frontend systems
          </p>
        </div>
      </div>
    </main>
  );
}
