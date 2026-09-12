/**
 * 가로세로 비를 고정한 상자. 안에 들어온 것이 그 비를 따른다.
 *
 * 스펙은 `packages/scopulus-ui/design/components/AspectRatio.md` 가 정본이다.
 *
 * **Tailwind 의 `aspect-*` 로 된다. 임의값도 인라인 style 도 쓰지 않는다.**
 * 4.3.3 에서 `aspect-4/3` 같은 분수 표기가 그대로 유틸리티가 되므로 비마다 클래스가 하나씩 있다.
 *
 * **그래서 비를 숫자로 받지 않는다.** `aspect-${w}/${h}` 를 만들면 Tailwind 가 소스를 훑을 때
 * 그 문자열을 찾지 못해 클래스가 생성되지 않고, 화면에서 비가 통째로 사라진다.
 * 아래 네 개만 받고, 다섯 번째가 필요하면 여기와 스펙의 같은 표 두 곳을 고친다.
 *
 * **안의 요소를 채우는 일은 하지 않는다.** 자식에 `size-full` 과 `object-cover` 를 준다 —
 * 여기서 강제하면 채우면 안 되는 자식까지 늘어난다.
 *
 * **`className` 을 열지 않는다.** 이 컴포넌트가 정하는 값은 비 하나뿐이고,
 * 모서리·테두리·잘라내기는 안에 들어오는 것이 갖는다.
 */

/** `--radius` 처럼 스케일을 못박는다. 값이 아니라 이름으로 고른다. */
const RATIO = {
  square: "aspect-square",
  video: "aspect-video",
  "4/3": "aspect-4/3",
  "3/2": "aspect-3/2",
} as const;

type AspectRatioProps = {
  ratio?: keyof typeof RATIO;
  children: React.ReactNode;
};

export function AspectRatio({ ratio = "video", children }: AspectRatioProps) {
  return <div className={`w-full ${RATIO[ratio]}`}>{children}</div>;
}
