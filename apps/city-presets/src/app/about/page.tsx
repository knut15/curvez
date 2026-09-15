import type { Metadata } from "next";
import Image from "next/image";
import { AppLink } from "@scopulus/ui";

import about from "../../../content/about.json";
import { PRESETS } from "@/shared/presets";
import { Brand } from "@/widgets/brand";

export const metadata: Metadata = {
  title: about.metaTitle,
  description: about.metaDescription,
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
      <header className="flex items-center justify-between px-5 py-2">
        <Brand />
        <AppLink href="/" variant="cta-quiet">
          필터 적용
        </AppLink>
      </header>

      <section className="px-5 pt-8 pb-10">
        {/*
          제목과 문단은 `content/about.json` 이 정본이다. CMS 가 그 파일을 고친다.
          제목의 줄바꿈은 데이터에 `\n` 으로 들어 있다 — 어디서 줄을 나눌지가
          이 화면에서는 뜻의 일부라 코드가 정하지 않는다.
        */}
        <h1 className="font-serif text-[32px] leading-[1.34] tracking-tight whitespace-pre-line">
          {about.title}
        </h1>
        {about.paragraphs.map((text, i) => (
          <p
            key={text}
            className={`text-[15px] leading-[1.75] text-muted-foreground ${i === 0 ? "mt-5" : "mt-4"}`}
          >
            {text}
          </p>
        ))}
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
                src={preset.before}
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

      {/* `grid` 로 두면 그리드 항목이 트랙 폭까지 늘어난다. `AppLink` 는
          `className` 을 받지 않아 밖에서 크기를 못 주는데, 부모의 배치로는 준다 */}
      <footer className="grid border-t border-border px-5 py-10">
        <AppLink href="/" variant="cta">
          내 사진에 적용하기
        </AppLink>
      </footer>
    </div>
  );
}
