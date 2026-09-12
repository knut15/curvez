/**
 * 끝을 아는 진행을 0~100 퍼센트 막대로 보인다. 끝을 모르는 기다림은 `Loading` 이 맡는다.
 *
 * 스펙은 `packages/scopulus-ui/design/components/Progress.md` 가 정본이다.
 *
 * **`<progress>` 가 아니라 `<div role="progressbar">` 다.** `<progress>` 의 홈과 채운 부분은
 * 엔진마다 다른 의사 요소(`::-webkit-progress-bar` · `::-webkit-progress-value` ·
 * `::-moz-progress-bar`)로만 잡힌다. 그 자리에 Tailwind 유틸리티가 닿지 않아 토큰 색을 주려면
 * 임의 선택자를 직접 써야 하고, 라이트·다크 두 벌을 손으로 맞추게 된다. 그래서 요소를 바꿨다.
 *
 * **값이 없는 상태(indeterminate)를 만들지 않는다.** 그 자리는 `Loading` 이 맡는다.
 * 두 곳에 두면 같은 사실을 도는 고리와 흐르는 막대 둘로 말하게 되고, 어느 것이 의도인지
 * 화면에서 판정할 수 없다.
 *
 * **`className` 을 열지 않는다.** 막대는 `w-full` 이고 폭은 부모가 정한다.
 */
type ProgressProps = {
  /** 0~100. 범위를 벗어난 값은 양끝으로 잘린다. */
  value: number;
  /**
   * 화면 낭독기가 읽는 이름. **필수다.**
   * `role="progressbar"` 는 이름이 없으면 무엇이 얼마나 진행됐는지 말할 수 없다.
   */
  label: string;
};

export function Progress({ value, label }: ProgressProps) {
  // 바깥에서 오는 값이라 100 을 넘거나 음수가 되는 일이 실제로 있다.
  // 자르지 않으면 `aria-valuenow` 가 범위 밖 값을 그대로 읽는다.
  const pct = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-2 w-full overflow-hidden rounded-full bg-muted"
    >
      {/*
        폭이 데이터에서 온다. 퍼센트마다 클래스를 만들 수 없어 이 한 값만 인라인 style 이다.
        폭 대신 `translateX` 로 미는 이유는 `rounded-full` 때문이다 — 폭을 줄이면 양끝의
        반원이 함께 눌려 막대가 짧을수록 모서리가 달라진다.
      */}
      <div
        className="h-full w-full rounded-full bg-primary transition-transform duration-150 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(-${100 - pct}%)` }}
      />
    </div>
  );
}
