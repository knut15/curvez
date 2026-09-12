/**
 * 연속된 값에서 하나를 집는다. 정확한 숫자를 받아야 하면 `Input` 을 쓴다.
 *
 * 스펙은 `packages/scopulus-ui/design/components/Range.md` 가 정본이다.
 *
 * **트랙과 손잡이를 직접 그리지 않고 `accent-color` 한 줄로 끝낸다.**
 * `::-webkit-slider-thumb` 와 `::-moz-range-thumb` 를 둘 다 쓰는 방법도 있지만, 그 둘은
 * Tailwind 유틸리티로 표현되지 않아 임의값 문자열이 되고 토큰 이름이 그 안으로 숨는다.
 * 두 벌을 손으로 맞춰야 하므로 한쪽만 고쳐지는 자리가 생기고, 그 어긋남은 그 엔진에서만
 * 드러난다. `accent-primary` 는 두 엔진이 각자 자기 슬라이더를 그리고 채운 색만
 * `--primary` 로 바꾼다 — `Checkbox` · `Switch` 의 켜진 면과 같은 토큰이다.
 *
 * **대신 트랙 두께와 손잡이 크기는 엔진 기본값이라 우리가 정하지 않는다.** 그 사실은
 * 스펙의 `## states` 와 `a11y:target` 에 적었다.
 *
 * `className` 을 받지 않는다. 폭은 `w-full` 로 부모가 정한다.
 */
export function Range(props: Omit<React.ComponentProps<"input">, "className">) {
  return (
    <input
      type="range"
      data-slot="range"
      // 높이 32px 과 반경 10px 은 `input.tsx:11` 과 같은 값이다 — 같은 폼에서 줄이 맞아야 한다.
      // 링 조각도 폼 묶음과 같은 `ring-3` 한 벌이다.
      className="h-8 w-full cursor-pointer rounded-lg accent-primary outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40"
      {...props}
    />
  );
}
