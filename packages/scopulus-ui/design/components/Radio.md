# component: Radio

purpose: 여럿 중 하나만 고른다. 여러 개를 동시에 고르는 것이면 `Checkbox` 를 쓴다

## 근거 — daisyUI 와 shadcn/ui 에서 각각 한 조각씩 옮겼다

### 1. 출처

**이 컴포넌트는 화면에서 센 값이 아니다.** handwork 화면에 라디오가 쓰인 자리가 **0곳**이다.
`## 근거` 에 `파일:줄` 이 없는 것은 빠뜨린 것이 아니라 셀 화면이 없기 때문이다.

| 항목           | 값                                                                                       |
| -------------- | ---------------------------------------------------------------------------------------- |
| 구조 출처      | daisyUI `radio` — <https://daisyui.com/components/radio/>                                |
| 묶음 구조      | daisyUI `fieldset` — <https://daisyui.com/components/fieldset/>                          |
| 참고           | shadcn/ui `radio-group` — <https://ui.shadcn.com/docs/components/radio-group>            |
| 옮긴 것        | `input[type=radio]` 를 그대로 쓰는 방식(daisyUI), `<fieldset>` + `<legend>` 로 묶는 구조 |
| 옮기지 않은 것 | shadcn 의 `@base-ui/react` 기반 `RadioGroup`·`RadioGroupItem` 두 부품                    |
| 의존성         | 없다                                                                                     |
| 소스           | [`../../src/ui/radio.tsx`](../../src/ui/radio.tsx)                                       |

**export 2개**

| export       | 태그                               | 무엇                          |
| ------------ | ---------------------------------- | ----------------------------- |
| `RadioGroup` | `<fieldset>` + `<legend>`          | 묶음과 그 이름                |
| `Radio`      | `<label>` + `<input type="radio">` | 항목 하나. 라벨이 원을 감싼다 |

**variant 축이 없다. size 축도 없다.** `cva` 를 쓰지 않는다.

### 2. `input[type=radio]` 를 쓴다 — Base UI 를 쓰지 않는다

`Checkbox` 는 `@base-ui/react/checkbox` 위에 있고 `<button role="checkbox">` 로 렌더된다
(`checkbox.tsx:5`). **라디오는 그 방식을 따르지 않는다.**

**이유:** [`Checkbox.md`](Checkbox.md) 의 `a11y:role` 이 Base UI 를 쓰는 근거로 **부분 선택
(`indeterminate`)** 을 든다. 라디오에는 부분 선택이 없다. 남는 것은 비용뿐이다 —
네이티브 라디오는 같은 `name` 을 가진 것끼리 브라우저가 알아서 묶어 "3개 중 1번" 을 읽게 하고,
화살표 키로 묶음 안을 도는 동작도 공짜로 따라온다. 그것을 직접 만들면 상태와 키보드 처리가
생기고 `"use client"` 가 붙는다.

**결과: `"use client"` 가 없다.** 훅도 이벤트 핸들러도 이 파일에 없다.

### 3. 면과 점을 직접 그리지 않고 `accent-color` 를 쓴다

**결정: `accent-primary` 한 줄. `appearance-none` 을 쓰지 않는다.**

**고르지 않은 방법 둘과 그 이유.**

| 방법                                 | 왜 쓰지 않았나                                                                                                                         |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `appearance-none` + `::before` 로 점 | `<input>` 은 대체 요소라 가상 요소가 그려지는지가 엔진마다 다르다. 한쪽에서만 점이 사라지고 그 사실은 그 브라우저에서만 드러난다       |
| `appearance-none` + 배경 그라디언트  | `bg-[radial-gradient(...)]` 안에 색 이름이 문자열로 숨는다. [`../tokens.md`](../tokens.md) 가 "값이 구조로 남아야 한다" 를 이미 정했다 |

`accent-primary` 는 두 엔진이 각자 자기 라디오를 그리고 **켜진 색만 `--primary` 로 바꾼다.**
`Checkbox` 의 켜진 면(`data-checked:bg-primary`, `checkbox.tsx:10`)과 같은 토큰이라 같은 폼 안에서
켜진 것끼리 색이 맞는다.

**대신 잃는 것 하나 — 꺼진 상태의 원 테두리가 `--input` 이 아니라 브라우저 기본색이다.**
16px 상자에서 그 차이는 1px 선의 회색 단계 차이이고, 켜진 상태와 초점 링과 크기는 모두 맞는다.
꺼진 테두리까지 맞추려면 위 두 방법 중 하나로 돌아가야 하고 그 비용이 더 크다.

**바꿀 때 고칠 위치:** 이 절과 `../../src/ui/radio.tsx` 의 `<input>` 클래스 문자열.

### 4. 라벨이 원을 감싼다

`Radio` 는 `<label>` 안에 `<input>` 을 넣는다. `htmlFor` 를 쓰지 않는다.

**이유:** 라디오는 한 묶음에 여럿이라 항목마다 `id` 를 지어내야 하고, 그 `id` 를 바깥에서 쓸 일이
없다. 감싸면 `id` 없이도 글자를 눌러 고를 수 있고 클릭 영역이 줄 전체로 넓어진다.

**감싸는 방식을 쓰는 것은 이것 하나다.** 컨트롤이 하나짜리인 자리는
[`Field.md`](Field.md) + [`Label.md`](Label.md) 이 `htmlFor` 로 묶는다 — 그쪽은 `id` 를
설명·오류와도 이어야 해서 감싸는 방식으로는 되지 않는다.

## props

### `RadioGroup`

| 이름     | 타입              | 필수 | 기본값 | 의미                                       |
| -------- | ----------------- | ---- | ------ | ------------------------------------------ |
| legend   | `React.ReactNode` | O    | —      | 묶음의 이름. 화면 낭독기가 항목마다 읽는다 |
| children | `React.ReactNode` | O    | —      | `Radio` 들                                 |

### `Radio`

| 이름           | 타입                            | 필수 | 기본값  | 의미                                                    |
| -------------- | ------------------------------- | ---- | ------- | ------------------------------------------------------- |
| name           | `string`                        | O\*  | —       | 묶음 이름. **같은 값을 가진 것끼리 하나만 켜진다**      |
| value          | `string`                        | O\*  | —       | 폼이 보내는 값                                          |
| children       | `React.ReactNode`               | O    | —       | 항목 글자                                               |
| checked        | `boolean`                       | X    | —       | 제어로 쓸 때의 값                                       |
| defaultChecked | `boolean`                       | X    | `false` | 비제어로 쓸 때의 처음 값                                |
| onChange       | `(e) => void`                   | X    | —       | 값이 바뀔 때                                            |
| disabled       | `boolean`                       | X    | `false` | 클릭 무시 + 라벨까지 불투명도 50%                       |
| required       | `boolean`                       | X    | `false` | 폼 제출 시 필수                                         |
| aria-invalid   | `boolean`                       | X    | `false` | 오류 표시. 아래 `## states` 참조                        |
| (그 밖)        | `React.ComponentProps<"input">` | X    | —       | `className` · `type` · `children` 만 빼고 그대로 받는다 |

\* 타입 위로는 선택이다(`React.ComponentProps<"input">` 를 그대로 쓴다). **`name` 없이 쓰면
묶이지 않아 전부 따로 켜진다.** 타입으로 막지 않는 이유는 제어 컴포넌트로 쓸 때 `name` 대신
`checked` + `onChange` 로만 다루는 쓰임이 있어서다.

**`RadioGroup` 에 `name` 을 두지 마라.**
**이유:** 그러면 `RadioGroup` 이 children 에 `name` 을 내려보내야 하고, 그 일은
`cloneElement` 나 컨텍스트로만 된다. 앞은 조용히 깨지고 뒤는 `"use client"` 를 부른다.
같은 판단을 [`Field.md`](Field.md) 의 `### 3` 이 적고 있다.

**`className` 을 둘 다 받지 않는다.**
**이유:** 크기·색은 한 벌뿐이고 항목 사이 간격은 `RadioGroup` 이 `gap-2` 로 정한다.

**`Radio` 를 하나만 쓰지 마라.**
**이유:** 라디오는 한 번 켜면 끌 수 없다. 하나뿐이면 사용자가 되돌릴 방법이 없다.
켜고 끄는 하나짜리는 [`Checkbox.md`](Checkbox.md) 나 [`Switch.md`](Switch.md) 다.

### 받은 그대로의 값

| 축            | 값                                                                      |
| ------------- | ----------------------------------------------------------------------- |
| 원 크기       | `size-4` = 16x16 (`checkbox.tsx:10` 과 같다)                            |
| 반경          | `rounded-full` — 원이다                                                 |
| 켜진 색       | `accent-primary` = `--primary`                                          |
| 항목 간격     | `gap-2` = 8px                                                           |
| 라벨 간격     | `gap-2` = 8px                                                           |
| legend → 항목 | `mt-2` = 8px                                                            |
| 전이          | `transition-colors duration-150 ease-out motion-reduce:transition-none` |

## states

| state         | 트리거         | 시각 변화                                                                                                                                                                                                                   |
| ------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| default       | —              | 꺼짐: 빈 원, 테두리는 브라우저 기본색(위 `### 3`). 켜짐: `--primary` 로 채워지고 가운데 점이 생긴다. `size-4`                                                                                                               |
| hover         | 없음           | `hover:` 가 0건이다. **hover 면을 만들지 마라 — 이유:** 실제 클릭 영역이 라벨 줄 전체라 원에만 면을 칠하면 눌리는 곳과 칠해지는 곳이 어긋난다. 같은 판단을 [`Checkbox.md`](Checkbox.md) 가 적고 있다                        |
| focus-visible | 키보드 초점    | `focus-visible:ring-3 focus-visible:ring-ring/50` — 원 바깥에 3px 링이 알파 50% 로 깔린다. **네이티브 라디오에도 그림자 링이 실제로 그려지는지 `radio.stories.tsx` 의 `Focused` 가 `getComputedStyle` 로 확인한다**         |
| pressed       | 없음           | `active:` 가 0건이다. **`active:scale-97` 을 붙이지 마라 — 이유:** [`../tokens.md`](../tokens.md) 가 그 값을 아이콘 버튼 하나로 못박았고, 16px 원을 97% 로 줄이면 화면에서 읽히지 않는다                                    |
| disabled      | `disabled`     | `disabled:cursor-not-allowed` + 라벨의 `has-disabled:opacity-50` 으로 **원과 글자가 함께** 흐려진다. 대비 하한 **3:1**(WCAG 1.4.11)                                                                                         |
| loading       | 없음           | 스스로 비동기 동작을 하지 않는다. 저장 중은 `disabled` 를 주고 표시는 부르는 쪽이 한다 — **16px 원 안에 스피너를 넣지 마라.** 근거는 [`Checkbox.md`](Checkbox.md) 의 같은 행                                                |
| empty         | 없음           | 묶음에 아무것도 켜지지 않은 상태가 정상 출발점이다. `defaultChecked` 를 주지 않으면 그 상태다. **`children` 이 빈 항목을 렌더하지 마라 — 이유:** 무엇을 고르는지 모르는 원이 남는다                                         |
| error         | `aria-invalid` | `aria-invalid:ring-3 aria-invalid:ring-destructive/20`(다크는 알파 40%). **묶음 전체의 오류라 항목마다 `aria-invalid` 를 준다** — 하나에만 주면 그 항목이 잘못이라고 말하게 된다. 오류 문구는 `<legend>` 아래 `<p>` 가 낸다 |

**켜진 상태에서 오류 색으로 바꾸지 않는다.** `Checkbox` 는 `aria-invalid:aria-checked:border-primary`
로 되돌린다(`checkbox.tsx:10`). 라디오는 `accent-color` 가 켜진 색을 그리므로 오류 상태에서도
`--primary` 로 남고 링만 `--destructive` 가 된다. **그 차이를 맞추려 하지 마라 — 이유:**
`accent-color` 를 상태별로 바꾸면 켜진 항목이 붉어져 "이것이 잘못된 답" 으로 읽힌다.
잘못된 것은 고르지 않은 것이다.

## a11y

- a11y:label — **묶음과 항목 둘 다 이름이 필요하다.** 묶음 이름은 `<legend>` 가, 항목 이름은 감싼 `<label>` 의 글자가 준다. **`<div>` 에 라벨만 붙이지 마라 — 이유:** 같은 `name` 의 네이티브 라디오가 `<fieldset>` 안에 있어야 화면 낭독기가 항목마다 묶음 이름과 "3개 중 몇 번" 을 함께 읽는다. **`aria-label` 로 항목 이름을 대신하지 마라 — 이유:** 보이는 글자가 없으면 글자를 눌러 고르는 동작이 사라지고 16px 원만 눌러야 한다. 근거는 [`Checkbox.md`](Checkbox.md) 의 같은 항목
- a11y:focus — 초점 대상은 **묶음당 1개**다. 네이티브 라디오는 켜진 항목(없으면 첫 항목)만 탭 순서에 들어가고, 묶음 안에서는 화살표 키로 옮긴다. **그 동작을 직접 만들지 마라 — 이유:** 브라우저가 이미 한다. `tabindex` 를 주면 항목 수만큼 탭을 눌러야 묶음을 지나게 된다. 링은 `ring-3` 한 벌이고 [`Checkbox.md`](Checkbox.md) 의 "폼 5종은 `ring-3`" 을 따른다. `disabled` 항목은 초점을 받지 않는다
- a11y:contrast — 항목 글자 fg=`--foreground` / bg=`--background` 라이트 15.82 · 다크 16.13, `<legend>` 도 같은 쌍이다 ([`../tokens.md`](../tokens.md) `## 대비 검증` 의 대비값, 4.5:1 통과). **켜진 원의 면 `--primary` / bg=`--background` 쌍과 꺼진 원의 테두리는 미측정이다** — 원은 글자가 아니라 하한이 **3:1**(WCAG 1.4.11)이고, 꺼진 테두리는 브라우저 기본색이라 우리 토큰으로 계산되지 않는다. 구현 뒤 렌더 화면에서 `getComputedStyle` 로 재서 [`../tokens.md`](../tokens.md) 에 한 줄을 추가한다
- a11y:target — 원은 16x16 이지만 **실제 클릭 영역은 라벨 줄 전체**다(`<label>` 이 원을 감싼다). `w-fit` 이라 글자 끝까지이고 그보다 넓지 않다 — 이유: `w-full` 로 두면 옆 항목의 빈 자리를 눌러도 켜진다. 세로 높이는 `text-sm`(14px) 한 줄에 원 16px 이라 **16px** 이고 24x24 최소에 미치지 못한다. **항목 사이 `gap-2`(8px)를 지우지 마라 — 이유:** 8px 간격이 있어야 이웃 항목을 잘못 누르지 않는다. 항목을 세로로만 쌓는 것도 같은 이유다
- a11y:role — `radio` (`<input type="radio">` 의 암묵 역할)이고 묶음은 `<fieldset>` + `<legend>` 로 `group` 이 된다. **`role="radiogroup"` 을 주지 마라 — 이유:** `<fieldset>` 이 이미 묶음이고, 두 역할이 겹치면 화면 낭독기가 묶음에 두 번 들어간다. **`role` 을 항목에 지정하지 마라** — 암묵 역할이 이미 맞다

## responsive

- 브레이크포인트 분기가 **0건**이다. 모든 폭에서 원 16px · 글자 14px · 간격 8px 이다.
  **분기를 넣지 마라 — 이유:** 375px 화면에서도 클릭 영역이 라벨 줄 전체라 좁아지지 않는다
- **항목을 가로로 놓지 마라.** 근거는 [`Checkbox.md`](Checkbox.md) 의 같은 항목과 같다 —
  375px 에서 라벨이 줄바꿈되면 어느 라벨이 어느 원의 것인지 판정할 수 없다
- 항목 글자가 길어 두 줄이 되면 `items-center` 가 원을 두 줄의 한가운데로 내린다.
  **두 줄짜리 항목을 만들지 마라 — 이유:** 라디오 항목은 고르는 값의 이름이지 설명이 아니다.
  설명이 필요하면 `<legend>` 아래에 한 번만 적는다
- `<legend>` 는 `<fieldset>` 폭을 넘으면 감싼다. `min-w-0` 이 있어 flex 안에서도 줄어든다
- `lg` 이상을 넣지 마라. 페이지 폭이 `max-w-5xl`(1024px)에서 멈춘다

## 상호작용

- focus-visible / disabled / error 정의. hover 와 pressed 는 없다
- **라벨 글자를 눌러도 고를 수 있다**(`<label>` 이 원을 감싼다). `radio.stories.tsx` 의
  `ClickLabel` 이 그것을 확인한다
- 묶음 안 이동은 화살표 키다. 브라우저가 하고 우리가 코드를 쓰지 않는다
