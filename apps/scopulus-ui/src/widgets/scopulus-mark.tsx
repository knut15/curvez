/**
 * scopulusUI 의 브랜드 마크.
 *
 * 이름은 IAU 행성 지형 명명 용어에서 왔다 — 행성 표면의 불규칙하고 들쭉날쭉한 절벽.
 * 화성과 금성 지도에 쓰이는 공식 분류명이다. 그래서 마크는 크레이터가 팬 행성이고,
 * 붉은 크레이터 하나가 그 지형의 자리를 표시한다.
 *
 * 색은 마크가 직접 갖는다. 라이브러리 토큰(`--foreground` …)을 쓰지 않는다 —
 * 브랜드 색은 앱의 것이고, 마크는 테마가 바뀌어도 같은 형태로 읽혀야 한다.
 * favicon 은 `src/app/icon.svg` 에 같은 도형이 따로 있다. 모양을 고치면 둘 다 고친다.
 */
export function ScopulusMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-label="scopulusUI"
    >
      <circle
        cx="16"
        cy="16"
        r="13.5"
        className="fill-[#15171A] dark:fill-[#E9EDF0]"
      />
      <circle
        cx="10.2"
        cy="10.5"
        r="4.4"
        className="fill-[#E8182E] dark:fill-[#DA1428]"
      />
      <circle
        cx="21.6"
        cy="20.2"
        r="3.2"
        className="fill-[#9AA1A6] dark:fill-[#5E666B]"
      />
      <circle
        cx="22.6"
        cy="9.2"
        r="2.2"
        className="fill-[#9AA1A6] dark:fill-[#5E666B]"
      />
      <circle
        cx="10.4"
        cy="21.4"
        r="2"
        className="fill-[#9AA1A6] dark:fill-[#5E666B]"
      />
    </svg>
  );
}
