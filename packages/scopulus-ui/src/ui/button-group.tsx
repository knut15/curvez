/**
 * 붙어 선 버튼 여럿을 한 덩어리로 묶는다. 맞닿는 모서리를 없애고 테두리를 겹친다.
 *
 * 스펙은 `packages/scopulus-ui/design/components/ButtonGroup.md` 가 정본이다.
 *
 * **자식의 `className` 을 건드리지 않는다.** 모서리와 겹침을 묶음 쪽 선택자로 준다.
 * `[&>*:not(:first-child)]` 는 `:not()` 이 붙어 구체성이 클래스 둘이라, `Button` 자신의
 * `rounded-md`(클래스 하나)보다 우선순위가 높다. 바깥 두 모서리는 손대지 않으므로 `rounded-md` 가 남는다.
 *
 * **포커스 링이 이웃에 가리지 않게 `focus-visible` 인 자식의 `z-index` 를 올린다.**
 * `Button` 의 링은 `outline-offset-2` 라 버튼 밖 2px 에 그려지는데, `-ml-px` 로 겹쳐 선 옆
 * 버튼이 그 위를 덮는다. flex 자식은 `position` 없이도 `z-index` 가 먹는다.
 *
 * **세로 묶음을 만들지 않는다.** 없앨 모서리도 겹치는 방향도 전부 달라, 한 컴포넌트 안에
 * 규칙이 두 벌 생긴다. 필요해지면 그때 별도 컴포넌트로 연다.
 *
 * **`className` 을 열지 않는다.** 묶음의 폭은 자식이 정하고 자리는 부모가 정한다.
 */
type ButtonGroupProps = {
  /**
   * 묶음의 이름. **필수다.** `role="group"` 은 이름이 있어야 화면 낭독기가
   * "정렬, 그룹" 처럼 경계를 말한다. 이름이 없으면 버튼 셋이 그냥 이어 읽힌다.
   */
  label: string;
  /** `Button` 둘 이상. 하나면 묶을 것이 없다. */
  children: React.ReactNode;
};

export function ButtonGroup({ label, children }: ButtonGroupProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-stretch [&>*:not(:first-child)]:-ml-px [&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none [&>*:focus-visible]:z-10"
    >
      {children}
    </div>
  );
}
