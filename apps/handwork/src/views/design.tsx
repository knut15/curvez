"use client";

import { useTokenValues } from "@/shared/lib/use-token-values";
import { PageLede } from "@/shared/ui/page-lede";

/**
 * 디자인 토큰을 화면으로 보여 주는 페이지.
 *
 * **값을 손으로 옮겨 적지 않는다.** 스와치는 `var(--토큰)` 으로 칠하고, 옆에 적히는 hex 는
 * `getComputedStyle` 로 그 자리에서 읽는다. 그래서 `globals.css` 를 고치면 이 페이지가
 * 따라 바뀌고, 문서만 옛 값을 들고 남는 일이 생기지 않는다.
 *
 * 정본은 여전히 `globals.css` 와 `design/tokens.md` 다. 이 화면은 그 값을 **눈으로 확인하는
 * 자리**이지 값을 정하는 자리가 아니다.
 */

const NEUTRAL = [
  ["--background", "페이지 배경"],
  ["--foreground", "본문 텍스트"],
  ["--card", "카드 배경"],
  ["--card-foreground", "카드 텍스트"],
  ["--muted", "태그 배경"],
  ["--muted-foreground", "보조 텍스트"],
  ["--accent", "마우스를 올렸을 때 배경"],
  ["--border", "구분선 · 테두리"],
  ["--primary", "주요 버튼 배경"],
  ["--primary-foreground", "주요 버튼 텍스트"],
] as const;

const BRAND = [
  ["--brand-accent", "링크 강조 · Cases 표시"],
  ["--brand-mark", "로고의 a · Works 표시"],
  ["--brand-canvas", "헤더 배경"],
  ["--brand-ink", "헤더 텍스트"],
] as const;

const TYPE = [
  {
    label: "워드마크",
    size: "clamp(3.25rem,10vw,6rem)",
    weight: 900,
    track: "-0.04em",
  },
  {
    label: "섹션 제목",
    size: "clamp(1.75rem,3.4vw,2.5rem)",
    weight: 510,
    track: "-0.022em",
  },
  { label: "주요 문구", size: "1.0625rem", weight: 510, track: "-0.015em" },
  { label: "본문", size: "1rem", weight: 400, track: "-0.01em" },
  { label: "라벨 · 버튼", size: "0.8125rem", weight: 510, track: "-0.01em" },
  { label: "카드 설명", size: "0.875rem", weight: 400, track: "-0.01em" },
] as const;

const RADIUS = [
  ["rounded-2xl", "16px", "카드 · 히어로 프레임"],
  ["rounded-lg", "8px", "미리보기 안의 작은 카드"],
  ["rounded-full", "캡슐형", "버튼 · 배지 · 상태 표시"],
  ["rounded", "4px", "태그 칩"],
] as const;

/** 렌더 화면에서 잰 값이다. 지어낸 수치가 아니다. */
const CONTRAST = [
  ["foreground / background", "19.93", "18.73", "AA 4.5"],
  ["muted-foreground / 배경", "5.05", "6.13", "AA 4.5"],
  ["muted-foreground / card", "4.88", "5.86", "AA 4.5"],
  ["card-foreground / card", "19.26", "17.90", "AA 4.5"],
  ["primary-foreground / 주 버튼", "19.93", "15.83", "AA 4.5"],
  ["brand-accent / card", "6.15", "12.88", "AA 4.5"],
  ["brand-mark / 배경", "3.45", "7.07", "자체 목표 3:1"],
] as const;

function Section({
  index,
  label,
  title,
  children,
  lead,
}: {
  index: string;
  label: string;
  title: string;
  lead?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border py-14 md:py-20">
      <p className="font-mono text-[0.6875rem] tracking-[0.14em] text-muted-foreground/70 uppercase">
        {index} — {label}
      </p>
      <h2 className="mt-4 max-w-[24ch] text-[clamp(1.5rem,3.4vw,2.25rem)] leading-[1.2] font-[510] tracking-[-0.022em] break-keep">
        {title}
      </h2>
      {lead ? (
        <p className="mt-4 max-w-[56ch] leading-relaxed break-keep text-muted-foreground">
          {lead}
        </p>
      ) : null}
      <div className="mt-9">{children}</div>
    </section>
  );
}

function Swatches({
  items,
}: {
  items: readonly (readonly [string, string])[];
}) {
  const values = useTokenValues(items.map(([name]) => name));

  return (
    <ul role="list" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map(([name, use], i) => (
        <li
          key={name}
          className="flex items-center gap-4 rounded-xl border border-border bg-card p-3"
        >
          {/* 스와치는 토큰을 직접 칠한다. 테마를 바꾸면 여기도 같이 바뀐다. */}
          <span
            aria-hidden
            className="size-11 shrink-0 rounded-lg border border-border"
            style={{ background: `var(${name})` }}
          />
          <span className="min-w-0">
            <span className="block truncate font-mono text-[0.75rem] text-card-foreground">
              {name}
            </span>
            <span className="mt-0.5 block text-[0.8125rem] text-muted-foreground">
              {use}
            </span>
          </span>
          <span className="ml-auto shrink-0 font-mono text-[0.75rem] text-muted-foreground tabular-nums">
            {values[i] || "—"}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function DesignView() {
  const [headerH, headerCompact] = useTokenValues([
    "--header-height",
    "--header-height-compact",
  ]);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 md:px-8 md:py-16">
      <h1 className="text-4xl font-bold tracking-[-0.02em]">
        Aster 디자인 가이드
      </h1>
      {/* 설명문 아래 32px 을 띄운다. 다른 목록 화면은 `mt-8` 뒤에 선이 오는데, 이 화면은
          첫 `Section` 의 `border-t` 가 곧바로 붙어 선이 설명문에 닿아 있었다. */}
      <PageLede className="mb-8 max-w-[58ch]">
        Aster에서 사용하는 색상, 글꼴, 모서리 둥글기와 헤더 높이를 정리했습니다.
        라이트·다크 테마의 색상 대비도 함께 확인할 수 있습니다.
      </PageLede>

      <Section
        index="01"
        label="Color"
        title="기본 색상과 브랜드 색상"
        lead="배경과 카드에는 밝기가 다른 회색을 사용합니다. 청록색과 코랄색은 브랜드와 콘텐츠 영역을 표시하는 데 사용합니다. 아래 색상은 현재 테마에 맞춰 표시됩니다."
      >
        <p className="mb-3 text-[0.8125rem] font-[510] text-muted-foreground">
          기본 색상
        </p>
        <Swatches items={NEUTRAL} />

        <p className="mt-8 mb-3 text-[0.8125rem] font-[510] text-muted-foreground">
          브랜드 색상
        </p>
        <Swatches items={BRAND} />
      </Section>

      <Section
        index="02"
        label="Typography"
        title="글꼴 크기와 굵기, 자간"
        lead="주요 글꼴은 Pretendard입니다. 제목, 본문, 버튼 등 용도에 따라 크기와 굵기, 자간을 다르게 적용합니다. 아래 예시에서 각 스타일을 비교할 수 있습니다."
      >
        <ul
          role="list"
          className="divide-y divide-border border-y border-border"
        >
          {TYPE.map((t) => (
            <li
              key={t.label}
              className="flex items-baseline gap-4 py-4 max-sm:flex-col max-sm:items-start max-sm:gap-1"
            >
              <span className="w-24 shrink-0 text-[0.8125rem] text-muted-foreground">
                {t.label}
              </span>
              <span
                className="min-w-0 flex-1 truncate text-foreground"
                style={{
                  fontSize: t.size,
                  fontWeight: t.weight,
                  letterSpacing: t.track,
                }}
              >
                질문하고, 실험하고, 반복한다
              </span>
              <span className="shrink-0 font-mono text-[0.6875rem] text-muted-foreground">
                {t.weight} · {t.track}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        index="03"
        label="Shape"
        title="카드와 버튼의 모서리 둥글기"
        lead="카드와 히어로 프레임은 16px, 작은 카드는 8px, 태그는 4px로 모서리를 둥글게 처리합니다. 버튼과 배지는 양 끝을 완전히 둥글게 만듭니다."
      >
        <ul role="list" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {RADIUS.map(([cls, px, use]) => (
            <li
              key={cls}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
            >
              <span
                aria-hidden
                className={`h-12 w-full border border-border bg-muted ${cls}`}
              />
              <span className="font-mono text-[0.75rem] text-card-foreground">
                {cls}
              </span>
              <span className="text-[0.8125rem] text-muted-foreground">
                {px} · {use}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        index="04"
        label="Dimension"
        title="스크롤 상태에 따른 헤더 높이"
        lead="기본 헤더와 글 제목 바가 표시될 때의 축소 헤더에 서로 다른 높이를 적용합니다. 제목 바는 헤더 높이에 맞춰 바로 아래에 배치합니다."
      >
        <ul
          role="list"
          className="divide-y divide-border border-y border-border"
        >
          {[
            ["--header-height", headerH, "기본 상태"],
            ["--header-height-compact", headerCompact, "글 제목 바 표시 중"],
          ].map(([name, value, when]) => (
            <li key={name} className="flex items-baseline gap-4 py-4">
              <span className="font-mono text-[0.75rem] text-foreground">
                {name}
              </span>
              <span className="text-[0.8125rem] text-muted-foreground">
                {when}
              </span>
              <span className="ml-auto font-mono text-[0.75rem] text-muted-foreground tabular-nums">
                {value || "—"}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        index="05"
        label="Contrast"
        title="라이트·다크 테마의 색상 대비"
        lead="텍스트와 배경의 색상 대비를 테마별로 비교한 표입니다. 일반 텍스트의 비교 기준은 4.5:1이며, 로고에 사용하는 코랄색은 자체 목표인 3:1과 비교했습니다."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-[0.8125rem]">
            <thead className="text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-2.5 pr-4 font-[510]">색상 조합</th>
                <th className="py-2.5 pr-4 text-right font-[510] tabular-nums">
                  라이트
                </th>
                <th className="py-2.5 pr-4 text-right font-[510] tabular-nums">
                  다크
                </th>
                <th className="py-2.5 font-[510]">기준</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {CONTRAST.map(([pair, light, dark, std]) => (
                <tr key={pair}>
                  <td className="py-2.5 pr-4 font-mono text-[0.75rem] text-foreground">
                    {pair}
                  </td>
                  <td className="py-2.5 pr-4 text-right tabular-nums text-muted-foreground">
                    {light}
                  </td>
                  <td className="py-2.5 pr-4 text-right tabular-nums text-muted-foreground">
                    {dark}
                  </td>
                  <td className="py-2.5 text-muted-foreground">{std}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-[0.8125rem] text-muted-foreground">
          2026년 9월 14일의 색상값으로 계산한 결과입니다. 이 표는 자동으로
          갱신되지 않으므로 색상을 변경하면 대비를 다시 확인해야 합니다.
        </p>
      </Section>
    </main>
  );
}
