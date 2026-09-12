/**
 * ScopulusUI 의 브랜드 마크.
 *
 * 이름은 IAU 행성 지형 명명 용어에서 왔다 — 행성 표면의 불규칙하고 들쭉날쭉한 절벽.
 * 화성과 금성 지도에 쓰이는 공식 분류명이다. 그래서 마크는 원이 아니라 각진 암체이고,
 * 붉은 크레이터가 그 지형의 자리를 표시한다.
 *
 * 색은 마크가 직접 갖는다. 라이브러리 토큰(`--foreground` …)을 쓰지 않는다 —
 * 브랜드 색은 앱의 것이고, 마크는 테마가 바뀌어도 같은 형태로 읽혀야 한다.
 * favicon 은 `src/app/icon.svg` 에 같은 도형이 따로 있다. 모양을 고치면 둘 다 고친다.
 */
const PLANET =
  "M14.49 1.68L19.42 4.08L25.00 5.28L26.70 10.78L29.49 15.53L29.44 21.43L24.41 24.70L20.75 29.06L14.70 28.33L8.85 28.38L6.13 22.65L2.33 17.92L2.16 12.03L6.93 7.84L10.91 3.39Z";

const CRATERS = [
  { cx: 22.2, cy: 9.4, r: 2.2 },
  { cx: 15.9, cy: 15.8, r: 1.5 },
  { cx: 16, cy: 24.6, r: 1.35 },
  { cx: 6.8, cy: 16.2, r: 1 },
  { cx: 18.5, cy: 10.9, r: 0.8 },
];

const SCOPULUS = [
  { cx: 10.4, cy: 10.9, r: 4.1 },
  { cx: 21.4, cy: 20.4, r: 3.2 },
  { cx: 10, cy: 21.2, r: 2 },
  { cx: 25, cy: 15.4, r: 1.15 },
  { cx: 14.6, cy: 6.2, r: 0.9 },
];

/**
 * `decorative` 는 마크가 글자 옆에 설 때 쓴다. 헤더처럼 이름이 바로 옆에 있으면
 * 마크가 이름을 한 번 더 읽어 "ScopulusUI ScopulusUI" 가 된다.
 */
export function ScopulusMark({
  className,
  decorative = false,
}: {
  className?: string;
  decorative?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      {...(decorative
        ? { "aria-hidden": true }
        : { role: "img", "aria-label": "ScopulusUI" })}
    >
      <path d={PLANET} className="fill-[#15171A] dark:fill-[#E9EDF0]" />
      {CRATERS.map((c) => (
        <circle
          key={`${c.cx}-${c.cy}`}
          {...c}
          className="fill-[#9AA1A6] dark:fill-[#5E666B]"
        />
      ))}
      {SCOPULUS.map((c) => (
        <circle
          key={`${c.cx}-${c.cy}`}
          {...c}
          className="fill-[#E8182E] dark:fill-[#DA1428]"
        />
      ))}
    </svg>
  );
}
