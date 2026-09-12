/**
 * 입력의 이름. `<label>` 하나를 낸다.
 *
 * 스펙은 `packages/scopulus-ui/design/components/Label.md` 가 정본이다.
 *
 * **`htmlFor` 가 필수다.** 컨트롤을 감싸는 쓰임을 열지 않는다 — 이유: 감싸는 방식과
 * `htmlFor` 방식을 둘 다 허용하면 `Field` 가 만든 `id` 를 쓰지 않는 라벨이 생기고,
 * 그때 무엇이 컨트롤의 이름인지 판정할 근거가 사라진다. 컨트롤을 감싸는 라벨이 필요한 곳은
 * `Radio` 하나이고 그것은 자기 라벨을 스스로 갖는다.
 *
 * **필수 표시(`*`)를 내지 않는다.** [`Input.md`](../../design/components/Input.md) 의
 * `a11y:label` 이 "별표 하나만 쓰지 마라" 를 이미 정했다 — 별표는 화면 낭독기가 "별" 로
 * 읽거나 아예 건너뛰어 필수라는 뜻이 전달되지 않는다. 필수는 라벨 글자로 적는다.
 *
 * `className` 을 받지 않는다. 라벨의 값은 한 벌뿐이고 위치는 부모(`Field`)가 정한다.
 */
export function Label({
  htmlFor,
  children,
}: {
  /** 이름을 붙일 컨트롤의 `id`. */
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      // `group-has-disabled/field` 는 `Field` 가 붙인 `group/field` 를 본다.
      // 같은 조각을 `checkbox.tsx:10` 이 이미 쓰고 있다 — 두 곳이 같은 이름을 봐야 한 벌로 흐려진다.
      className="text-sm leading-none font-medium select-none group-has-disabled/field:opacity-50"
    >
      {children}
    </label>
  );
}
