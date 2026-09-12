# component: Checkbox

purpose: 서로 독립된 항목을 켜고 끈다. 하나를 즉시 적용하는 설정이면 `Switch` 를 쓴다

## 근거 — shadcn base-nova 에서 받았다

### 1. 출처

| 항목      | 값                                                                  |
| --------- | ------------------------------------------------------------------- |
| 받은 명령 | `pnpm dlx shadcn@4 add checkbox`                                    |
| 스타일    | `base-nova`                                                         |
| 받은 날짜 | **2026-09-11**                                                      |
| 소스      | [`../../src/ui/checkbox.tsx`](../../src/ui/checkbox.tsx)            |
| 기반      | `@base-ui/react/checkbox` (`checkbox.tsx:1`). **Radix 가 아니다**   |
| 아이콘    | `lucide-react` 의 `CheckIcon` (`checkbox.tsx:3`, 쓰이는 자리 `:19`) |

**export 1개** (`checkbox.tsx:25`)

| export     | 감싸는 것                                                | 소스 줄          |
| ---------- | -------------------------------------------------------- | ---------------- |
| `Checkbox` | `CheckboxPrimitive.Root` + `CheckboxPrimitive.Indicator` | `checkbox.tsx:5` |

`Indicator` 는 따로 export 되지 않는다. `Checkbox` 안에 박혀 있다 (`checkbox.tsx:15-20`) —
**체크 표시를 다른 아이콘으로 바꿀 수 없다.**

**variant 축이 없다. size 축도 없다.** `checkbox.tsx` 에 `cva` 가 없고 크기가 `size-4` 하나로 고정이다
(`checkbox.tsx:10`).

### 2. handwork 사용처: 0곳

handwork 화면 어디에도 쓰인 적이 없다. **기존 9종의 `## 근거` 에 있는 `파일:줄` 이 이 문서에는
없다.** 값의 출처는 위의 받은 소스 하나다.

### 3. 왜 20종에 들어가는가

**폼 묶음을 덮는다.** 폼 묶음 5종(`Input` · `Textarea` · `Checkbox` · `Switch` · `Select`) 중
여러 개를 동시에 고르는 자리를 맡는다.

## props

| 이름            | 타입                         | 필수 | 기본값  | 의미                                 |
| --------------- | ---------------------------- | ---- | ------- | ------------------------------------ |
| checked         | `boolean`                    | X    | —       | 제어 컴포넌트로 쓸 때의 값           |
| defaultChecked  | `boolean`                    | X    | `false` | 비제어로 쓸 때의 처음 값             |
| indeterminate   | `boolean`                    | X    | `false` | 부분 선택. 체크 표시가 나오지 않는다 |
| onCheckedChange | `(checked: boolean) => void` | X    | —       | 값이 바뀔 때                         |
| disabled        | `boolean`                    | X    | `false` | 클릭 무시 + 불투명도 50%             |
| required        | `boolean`                    | X    | `false` | 폼 제출 시 필수                      |
| name            | `string`                     | X    | —       | 폼 필드 이름                         |
| className       | `string`                     | X    | —       | 자리를 앉힐 때만 쓴다                |

타입 원본은 `CheckboxPrimitive.Root.Props` 다 (`checkbox.tsx:5`). 위 표는 그중 이 프로젝트가 쓰는 것만
추렸다. **`className` 으로 크기·색을 덮어쓰지 마라 — 이유:** `cn` 이 충돌을 나중 값으로 정리하므로
조용히 적용된다. 값을 바꿀 때는 이 문서와 소스 두 곳을 함께 고친다.

### 받은 그대로의 값 (`checkbox.tsx:10`)

| 축        | 값                                                                   |
| --------- | -------------------------------------------------------------------- |
| 상자 크기 | `size-4` = 16x16                                                     |
| 반경      | `rounded-[4px]` = 4px                                                |
| 테두리    | `border border-input`                                                |
| 체크 표시 | `size-3.5` = 14x14 (`checkbox.tsx:17`)                               |
| 클릭 영역 | `after:-inset-x-3 after:-inset-y-2` → **40 x 32** (아래 a11y:target) |
| 전이      | `transition-colors`                                                  |

**`rounded-[4px]` 는 [`../tokens.md`](../tokens.md) 의 반경 3단계(`rounded-lg` 10px ·
`rounded-md` 8px · `rounded-sm` 6px) 밖이다.** 같은 문서가 "스케일 밖의 `rounded`(4px)를 쓰지 않는다"
를 이미 정했다. **`rounded-sm`(6px)으로 맞춘다. 이유:** 16px 상자에 10px·8px 반경은 원에 가까워져
`Switch` 와 구분되지 않는다. 3단계 중 가장 작은 `rounded-sm` 이 그 자리다.
**고칠 위치:** `../../src/ui/checkbox.tsx:10` 한 곳.

**`--input` 은 [`../tokens.md`](../tokens.md) 의 색 표 14행에 없다.** 값은
`../../src/tokens.css:80`(라이트) · `:115`(다크)에 있다. 라이트는 `--border` 와 같은 값이고, 다크는
흰색 알파 15% 로 `--border` 의 10% 보다 진하다. **새 토큰을 만들지 마라 — 이유:** 이미 CSS 에
있는 이름이다. 색 표에 없는 것은 표 쪽의 빠짐이고, 그것을 메우는 것은
[`../tokens.md`](../tokens.md) 의 작업이다.

## states

| state         | 트리거         | 시각 변화                                                                                                                                                                                                                     |
| ------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| default       | —              | 꺼짐: 면 투명(다크는 `--input` 알파 30%), 테두리 `--input`, `size-4`, 체크 표시 없음. 켜짐: 면·테두리 `--primary`, 체크 표시 `--primary-foreground` (`checkbox.tsx:10`)                                                       |
| hover         | 없다           | `checkbox.tsx` 에 `hover:` 가 0건이다. **hover 면을 만들지 마라 — 이유:** 실제 클릭 영역이 상자보다 넓어(40x32) 면을 칠하면 눌리는 곳과 칠해지는 곳이 어긋난다                                                                |
| focus-visible | 키보드 포커스  | `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50` — 테두리가 `--ring` 이 되고 그 바깥에 3px 링이 알파 50% 로 깔린다 (`checkbox.tsx:10`). 아래 a11y:focus 참조                                       |
| pressed       | 없다           | `active:` 가 0건이다. **`active:scale-97` 을 붙이지 마라 — 이유:** [`../tokens.md`](../tokens.md) 가 그 값을 아이콘 버튼 하나로 못박았고, 16px 상자를 97% 로 줄이면 화면에서 읽히지 않는다                                    |
| disabled      | `disabled`     | `disabled:cursor-not-allowed disabled:opacity-50`. 감싼 라벨이 비활성이면 `group-has-disabled/field:opacity-50` 로 함께 흐려진다. 대비 하한 **3:1**(WCAG 1.4.11)                                                              |
| loading       | 없다           | 스스로 비동기 동작을 하지 않는다. 저장 중을 보여야 하면 `disabled` 를 주고 표시는 부르는 쪽이 한다 — **스피너를 상자 안에 넣지 마라. 이유:** 16px 안에서 체크 표시와 구분되지 않는다                                          |
| empty         | 없다           | 값이 `true`·`false`·부분 선택 셋뿐이라 빈 값이 없다. 라벨이 비면 상자를 렌더하지 마라 — 이유: 무엇을 켜는지 모르는 상자가 남는다                                                                                              |
| error         | `aria-invalid` | `aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20`. 켜진 상태에서는 테두리가 `--primary` 로 되돌아간다(`aria-invalid:aria-checked:border-primary`) — 켜는 것으로 오류가 풀리는 자리라서다 |

**`transition-colors` 에 `motion-reduce:transition-none` 이 빠져 있다** (`checkbox.tsx:10`).
[`../tokens.md`](../tokens.md) 가 "전이를 넣으면 `motion-reduce:transition-none` 을 같은 줄에 넣는다"
를 화면에 나온 8:8 로 정했다. **같은 줄에 넣는다. 이유:** 나중에 붙이려면 전이가 있는 줄을 전부 다시 찾아야
하고, 빠진 곳은 화면에서만 드러난다. **고칠 위치:** `../../src/ui/checkbox.tsx:10`.

## a11y

- a11y:label — 라벨이 **필수**다. `<label>` 로 감싸거나 `htmlFor` 로 묶는다. **`aria-label` 로 대신하지 마라 — 이유:** 보이는 글자가 없으면 라벨을 눌러 켜는 동작이 사라지고, 16px 상자만 눌러야 한다. 부분 선택(`indeterminate`)은 Base UI 가 `aria-checked="mixed"` 를 붙인다 — 그 뜻을 글자로 다시 쓰지 마라
- a11y:focus — 포커스 순서는 DOM 순서와 같고, `disabled` 상자는 포커스를 받지 않는다. **받은 소스의 포커스 표시는 `focus-visible:ring-3` 이고, [`../tokens.md`](../tokens.md) 가 정한 네 조각(`outline-2` · `outline-offset-2` · `outline-ring` · 인라인 링크에만 `rounded-sm`)과 다르다.** 두 방식을 섞지 마라 — 이유: 한 화면에서 포커스 표시가 두 모양이면 키보드 사용자가 지금 어디에 있는지 배울 수 없다. **폼 5종(`Input` · `Textarea` · `Checkbox` · `Switch` · `Select`)은 `ring-3` 한 벌로 통일하고, 그 밖의 20종은 `outline-2` 한 벌을 쓴다** — 이유: 폼 요소는 테두리를 이미 가졌고 `outline` 은 그 테두리 바깥에 또 하나의 선을 그어 두 겹으로 읽힌다. **고칠 위치:** 이 항목과 폼 5종 소스의 `focus-visible:` 조각
- a11y:contrast — 켜짐 fg=`--primary-foreground` / bg=`--primary` 라이트 15.82 · 다크 16.13 ([`../tokens.md`](../tokens.md) `## 대비 검증` 의 "CTA 라벨/CTA 배경" 대비값, 4.5:1 통과). **꺼짐 상태의 테두리 `--input` / bg=`--background` 쌍은 미측정이다** — 테두리는 글자가 아니라 하한이 **3:1**(WCAG 1.4.11)이고, 다크의 `--input` 은 알파라 배경에 따라 실제 색이 달라져 고정 쌍으로 계산되지 않는다. 구현 뒤 렌더 화면에서 `getComputedStyle` 로 재서 [`../tokens.md`](../tokens.md) 에 한 줄을 추가한다
- a11y:target — 상자는 16x16 이지만 실제 클릭 영역은 `after:absolute after:-inset-x-3 after:-inset-y-2` (`checkbox.tsx:10`)가 넓힌다 — **가로 16 + 12x2 = 40px, 세로 16 + 8x2 = 32px.** 24x24 최소를 넘는다. **`after:` 조각을 지우지 마라 — 이유:** 지우는 순간 클릭 영역이 16x16 이 되어 기준 아래로 떨어진다. 상자 둘을 세로로 나란히 놓을 때 **간격을 8px 이상 둔다** — 32px 영역이 겹치지 않게 하려면 그만큼이 필요하다
- a11y:role — `checkbox` 다. Base UI 가 `<button role="checkbox">` 로 렌더하고 `aria-checked` 를 관리한다. **`<input type="checkbox">` 로 바꾸지 마라 — 이유:** 부분 선택 상태를 DOM 속성으로만 다룰 수 있게 되어 React 상태와 어긋날 자리가 생긴다. 여러 상자를 묶을 때는 부모에 `role="group"` 과 `aria-labelledby` 를 준다

## responsive

- 모든 폭에서 같은 크기다. `checkbox.tsx` 에 브레이크포인트 분기가 **0건**이다. **분기를 넣지 마라 — 이유:** 16px 상자에 40x32 클릭 영역은 375px 화면에서도 24x24 최소를 넘는다
- 라벨과 나란히 놓을 때 `flex items-center gap-2`(8px)를 쓴다. [`../tokens.md`](../tokens.md) 의 "카드 안 요소 사이 8px" 과 같은 값이다
- 라벨이 두 줄이 되면 `items-center` 를 `items-start` 로 바꾸고 상자에 `mt-0.5`(2px)를 준다 — 이유: 가운데 정렬은 상자를 두 줄의 한가운데로 내려 첫 줄과 밑선이 어긋난다
- 상자 목록은 세로로 쌓는다. 가로 배치를 하지 마라 — 이유: 375px 에서 라벨이 줄바꿈되면 어느 라벨이 어느 상자의 것인지 판정할 수 없다

## 상호작용

- focus-visible / disabled 정의. hover 와 pressed 는 없다
