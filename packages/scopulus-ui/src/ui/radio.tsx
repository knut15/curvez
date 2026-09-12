/**
 * 여럿 중 하나만 고른다. 하나만 쓰는 일이 없으므로 **그룹이 기본**이다.
 *
 * 스펙은 `packages/scopulus-ui/design/components/Radio.md` 가 정본이다.
 *
 * `<fieldset>` + `<legend>` 로 묶는다. **`<div>` 에 라벨만 붙이지 마라 — 이유:** 같은 `name`
 * 을 가진 네이티브 라디오가 `<fieldset>` 안에 있어야 화면 낭독기가 "3개 중 1번" 을 읽는다.
 * 묶음의 이름은 `<legend>` 가 준다.
 *
 * **면과 점을 직접 그리지 않고 `accent-color` 한 줄로 끝낸다.** `appearance-none` 뒤에
 * 점을 `::before` 로 그리는 방식은 `<input>` 이 대체 요소라 엔진마다 그려지는지가 다르고,
 * 배경 그라디언트로 그리면 토큰 이름이 임의값 문자열 안으로 숨는다. `accent-primary` 는
 * 두 브라우저 모두 자기 라디오를 그리고 켜진 색만 `--primary` 로 바꾼다 —
 * `Checkbox` 의 켜진 면과 같은 토큰이다.
 *
 * **대신 꺼진 상태의 원 테두리는 `--input` 이 아니라 브라우저 기본색이다.** 그 차이는
 * 스펙의 `## states` 에 적었다.
 *
 * `className` 을 받지 않는다. 크기·색은 한 벌뿐이고 세로 간격은 `RadioGroup` 이 정한다.
 */
export function RadioGroup({
  legend,
  children,
}: {
  /** 묶음의 이름. 화면 낭독기가 항목마다 이것을 먼저 읽는다. */
  legend: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <fieldset data-slot="radio-group" className="min-w-0">
      <legend className="text-sm leading-none font-medium">{legend}</legend>
      {/* 항목 사이 8px 은 `tokens.md` 의 "카드 안 요소 사이" 와 같은 값이다. */}
      <div className="mt-2 flex flex-col gap-2">{children}</div>
    </fieldset>
  );
}

/**
 * 그룹 안의 항목 하나. 라벨이 원을 **감싼다** — `id` 없이도 글자를 눌러 고를 수 있다.
 *
 * 감싸는 방식을 쓰는 것은 라디오뿐이다. 이유: 라디오는 한 그룹에 여럿이라 항목마다 `id` 를
 * 지어내야 하고, 그 `id` 를 바깥에서 쓸 일이 없다. 하나짜리 컨트롤은 `Field` + `Label` 이
 * `htmlFor` 로 묶는다.
 */
export function Radio({
  children,
  ...props
}: Omit<React.ComponentProps<"input">, "className" | "children" | "type"> & {
  children: React.ReactNode;
}) {
  return (
    <label className="flex w-fit items-center gap-2 text-sm has-disabled:cursor-not-allowed has-disabled:opacity-50">
      <input
        type="radio"
        data-slot="radio"
        // 크기 16px · 링 조각은 `checkbox.tsx:10` 과 같은 값이다. 반경만 원이다.
        className="size-4 shrink-0 rounded-full accent-primary transition-colors duration-150 ease-out outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed aria-invalid:ring-3 aria-invalid:ring-destructive/20 motion-reduce:transition-none dark:aria-invalid:ring-destructive/40"
        {...props}
      />
      {children}
    </label>
  );
}
