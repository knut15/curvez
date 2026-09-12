/**
 * 블록과 블록 사이에 가로줄 하나를 긋고 위아래 여백을 함께 갖는다.
 *
 * 스펙은 `packages/scopulus-ui/design/components/Separator.md` 가 정본이다.
 *
 * `<hr>` 이다. `<div className="border-t">` 로 그리지 마라 — 구조 정보가 시각에만 남아
 * 스크린리더가 덩어리의 경계를 알지 못한다. 같은 이유로 `aria-hidden` 을 붙이지 마라.
 * 이 선은 장식이 아니라 "여기서 한 덩어리가 끝난다" 는 정보다.
 *
 * 값을 받지 않는다. 화면에는 32/32 · 48/24 · 0/32 셋이 있었지만 의미가 같아서 하나로 통일했다.
 * 푸터의 `border-t` 는 이것으로 바꾸지 않는다 — 그 선은 `<footer>` 자신의 테두리다.
 */
export function Separator() {
  return <hr className="my-8 border-t border-border" />;
}
