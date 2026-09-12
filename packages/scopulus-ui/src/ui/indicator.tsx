/**
 * 다른 요소의 모서리에 표시 하나를 얹는다. 얹는 것은 주로 `Badge` 다.
 *
 * 스펙은 `packages/scopulus-ui/design/components/Indicator.md` 가 정본이다.
 *
 * **표시가 감싼 상자 밖으로 나가지 않는다.** 절반을 걸치게 하면 부모의 `overflow-hidden`
 * 한 곳에서 잘리고, 그것을 막으려면 이것을 쓰는 모든 자리가 바깥 여백을 알아야 한다.
 * 그래서 바깥 여백을 주지 않는다 — 표시는 모서리 안쪽에 앉는다.
 *
 * **`children` 이 먼저고 표시가 나중이다.** 화면 낭독기가 감싼 것을 읽은 뒤 표시를 읽는다.
 * 순서를 뒤집으면 "3, 알림" 처럼 숫자가 먼저 나와 무엇의 3인지 알 수 없다.
 *
 * **감싸개에 `aria-label` 을 붙이지 마라.** 붙이면 같은 내용이 라벨로 한 번, 안의 글자로
 * 한 번 두 번 읽힌다. 이름은 감싼 것과 표시가 각자 이미 갖고 있다.
 */

/** 네 모서리뿐이다. 변의 가운데에 얹는 자리는 만들지 않는다. */
const POSITION = {
  "top-right": "top-0 right-0",
  "top-left": "top-0 left-0",
  "bottom-right": "right-0 bottom-0",
  "bottom-left": "bottom-0 left-0",
} as const;

type IndicatorProps = {
  position?: keyof typeof POSITION;
  /** 모서리에 얹을 것. `Badge` 나 짧은 글자 하나다. 누를 수 있는 것을 넣지 마라. */
  badge: React.ReactNode;
  /** 표시가 붙을 대상. 버튼·아바타·이미지처럼 상자 하나다. */
  children: React.ReactNode;
};

export function Indicator({
  position = "top-right",
  badge,
  children,
}: IndicatorProps) {
  return (
    <span className="relative inline-flex">
      {children}
      {/* 감싼 것이 버튼이면 그 모서리도 눌려야 한다. 표시가 포인터를 가로채지 않는다. */}
      <span className={`pointer-events-none absolute ${POSITION[position]}`}>
        {badge}
      </span>
    </span>
  );
}
