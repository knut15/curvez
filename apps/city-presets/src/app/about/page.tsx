import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { PRESETS } from "@/shared/presets";

export const metadata: Metadata = {
  title: "열두 도시의 색 — city-presets",
  description:
    "도시 이름은 찍을 장소가 아니라 색의 이름이다. 열두 개가 새벽에서 밤으로, 겨울에서 겨울로 이어진다.",
};

/**
 * 읽는 화면. 도구(`/`)와 성격이 반대라 따로 둔다 — 저쪽은 글을 최소로 두고
 * 여기는 무엇을 파는지 말한다.
 *
 * 열두 칸의 비교는 정적이다. 경계를 끄는 것은 도구의 일이고, 여기서는 같은
 * 사진의 절반씩이 한눈에 보이기만 하면 된다.
 */
export default function About() {
  return (
    <div className="mx-auto w-full max-w-[430px] border-border sm:border-x">
      <header className="flex items-baseline justify-between px-5 py-3.5">
        <span className="text-[13px] font-medium tracking-tight">
          city-presets
        </span>
        <Link
          href="/"
          className="text-[13px] text-muted-foreground underline-offset-4 hover:underline"
        >
          도구
        </Link>
      </header>

      <section className="px-5 pt-8 pb-10">
        <h1 className="font-serif text-[32px] leading-[1.34] tracking-tight">
          도시 이름은
          <br />
          색의 이름이다
        </h1>
        <p className="mt-5 text-[15px] leading-[1.75] text-muted-foreground">
          삿포로는 삿포로에서 찍은 사진이 아니다. 어디서 찍었든 겨울 맑은 날의
          공기로 보이게 만드는 색이다. 열두 개가 새벽에서 밤으로, 겨울에서
          겨울로 이어진다.
        </p>
        <p className="mt-4 text-[15px] leading-[1.75] text-muted-foreground">
          사진 아래 찍히는 숫자는 실제 적용값이다. 지어낸 것이 아니고, 숨기지도
          않는다.
        </p>
      </section>

      <main>
        {PRESETS.map((preset, i) => (
          <figure key={preset.stem} className="border-t border-border pt-5">
            <figcaption className="mb-4 flex items-baseline gap-3 px-5">
              <span className="w-6 shrink-0 text-xs text-muted-foreground tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="font-serif text-2xl leading-none tracking-tight">
                {preset.name}
              </h2>
              <span className="ml-auto text-[13px] text-muted-foreground">
                {preset.mood}
              </span>
            </figcaption>

            <div className="relative aspect-[860/1152] bg-muted">
              <Image
                src={`/demo/${preset.stem}-before.webp`}
                alt={`${preset.mood} 원본 사진`}
                fill
                sizes="430px"
                priority={i === 0}
                className="object-cover"
              />
              <div className="absolute inset-0 [clip-path:inset(0_0_0_50%)]">
                <Image
                  src={`/demo/${preset.stem}-after.webp`}
                  alt={`${preset.name} 색을 입힌 같은 사진`}
                  fill
                  sizes="430px"
                  priority={i === 0}
                  className="object-cover"
                />
              </div>
              {/* 도구와 같은 이음매다. 뒤에 깔린 것의 밝기를 뒤집어 한 겹으로 선다 */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 opacity-60 backdrop-grayscale backdrop-invert"
              />
            </div>

            <p className="px-5 pt-4 pb-9 text-[13px] leading-relaxed text-muted-foreground">
              {preset.note}
            </p>
          </figure>
        ))}
      </main>

      <footer className="border-t border-border px-5 py-10">
        <Link
          href="/"
          className="flex h-12 w-full items-center justify-center rounded-md bg-primary text-[15px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          내 사진에 입혀 보기
        </Link>
      </footer>
    </div>
  );
}
