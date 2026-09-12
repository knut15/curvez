# component: Input

purpose: 한 줄짜리 글자를 받는다. 여러 줄이면 `Textarea`, 정해진 목록에서 고르는 것이면 `Select` 를 쓴다

## 근거 — shadcn base-nova 에서 받았다

### 1. 출처

| 항목      | 값                                                          |
| --------- | ----------------------------------------------------------- |
| 받은 명령 | `pnpm dlx shadcn@4 add input`                               |
| 스타일    | `base-nova`                                                 |
| 받은 날짜 | **2026-09-11**                                              |
| 소스      | [`../../src/ui/input.tsx`](../../src/ui/input.tsx)          |
| 기반      | `@base-ui/react/input` (`input.tsx:2`). **Radix 가 아니다** |
| 아이콘    | 없다                                                        |

**export 1개** (`input.tsx:19`)

| export  | 감싸는 것                                 | 태그      | 소스 줄       |
| ------- | ----------------------------------------- | --------- | ------------- |
| `Input` | `InputPrimitive` (`@base-ui/react/input`) | `<input>` | `input.tsx:5` |

**variant 축이 없다. size 축도 없다.** `input.tsx` 에 `cva` 가 없고 높이가 `h-8`(32px) 하나로
고정이다 (`input.tsx:11`).

### 2. handwork 사용처: 0곳

handwork 화면 어디에도 쓰인 적이 없다. **기존 9종의 `## 근거` 에 있는 `파일:줄` 이 이 문서에는
없다.** 값의 출처는 위의 받은 소스 하나다.

### 3. 왜 20종에 들어가는가

**폼 묶음을 덮는다.** 폼 5종(`Input` · `Textarea` · `Checkbox` · `Switch` · `Select`) 중
자유로운 글자를 한 줄로 받는 자리를 맡는다.

## props

| 이름         | 타입                            | 필수 | 기본값  | 의미                                                   |
| ------------ | ------------------------------- | ---- | ------- | ------------------------------------------------------ |
| type         | `string`                        | X    | `text`  | `<input>` 의 `type` 을 그대로 넘긴다 (`input.tsx:5,8`) |
| value        | `string`                        | X    | —       | 제어로 쓸 때의 값                                      |
| defaultValue | `string`                        | X    | —       | 비제어로 쓸 때의 처음 값                               |
| onChange     | `(e) => void`                   | X    | —       | 값이 바뀔 때                                           |
| placeholder  | `string`                        | X    | —       | 빈 상태의 안내 글자                                    |
| disabled     | `boolean`                       | X    | `false` | 입력 무시 + 면 채움 + 불투명도 50%                     |
| required     | `boolean`                       | X    | `false` | 폼 제출 시 필수                                        |
| aria-invalid | `boolean`                       | X    | `false` | 오류 표시. 아래 `## states` 참조                       |
| className    | `string`                        | X    | —       | 폭을 바꿀 때만 쓴다                                    |
| (그 밖)      | `React.ComponentProps<"input">` | X    | —       | `<input>` 의 속성을 그대로 받는다                      |

**`size` prop 을 두지 마라.**
**이유:** 받은 소스에 높이 단계가 하나다. 두 단계를 지어내면 어느 자리에 어느 높이를 쓰는지가
검증되지 않은 채 남는다. `Select` 는 `sm`/`default` 두 단계를 갖지만 그것은 받은 소스가 그렇다
(`select.tsx:34`) — **두 컴포넌트의 단계를 억지로 맞추지 마라.**

**`label` prop 을 두지 마라.**
**이유:** 라벨은 `<label htmlFor>` 로 바깥에서 묶는다. prop 으로 받으면 `id` 를 컴포넌트가
만들어야 하고, 그 `id` 를 바깥에서 참조할 수 없다.

**`error` · `errorMessage` prop 을 두지 마라.**
**이유:** 오류 표시는 `aria-invalid` 하나로 끝나고(`input.tsx:11`), 오류 글자는
`Alert variant="destructive"` 또는 필드 아래 `<p>` 가 맡는다. 한 컴포넌트가 상태와 문구를 둘 다
가지면 문구의 위치가 화면마다 달라진다.

### 받은 그대로의 값 (`input.tsx:11`)

| 축        | 값                                                           |
| --------- | ------------------------------------------------------------ |
| 높이      | `h-8` = 32px                                                 |
| 폭        | `w-full min-w-0`                                             |
| 반경      | `rounded-lg` = 10px (`--radius`)                             |
| 테두리    | `border border-input`                                        |
| 면        | 투명. 다크만 `--input` 알파 30%                              |
| 여백      | `px-2.5 py-1` = 좌우 10px · 세로 4px                         |
| 글자      | `text-base` → 768px 이상 `md:text-sm` (아래 `## responsive`) |
| 안내 글자 | fg=`--muted-foreground`                                      |
| 전이      | `transition-colors`                                          |

**높이 32px 은 [`Button.md`](Button.md) 의 `size="default"` 40px 과 다르다.**
**입력과 버튼을 한 줄에 나란히 놓지 마라. 이유:** 밑선이 8px 어긋난다. 한 줄에 놓아야 하면
버튼을 `size="icon-sm"`(32x32)으로 내린다 — 그 값은 [`Dialog.md`](Dialog.md) 가 이미 쓰고 있다.

**`--input` 은 [`../tokens.md`](../tokens.md) 의 색 표 14행에 없다.** 값은
`../../src/tokens.css:80`(라이트) · `:115`(다크)에 있다. **새 토큰을 만들지 마라 — 이유:** 이미 CSS 에
있는 이름이다. 색 표에 없는 것은 표 쪽의 빠짐이다.

**파일 선택 입력(`type="file"`)의 값도 받은 소스에 있다** — `file:inline-flex file:h-6
file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground`
(`input.tsx:11`). **이 프로젝트에 파일 업로드가 0곳이다. 그 값을 검증된 것으로 적지 마라.**

## states

| state         | 트리거             | 시각 변화                                                                                                                                                                     |
| ------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| default       | —                  | 면 투명(다크는 `--input` 알파 30%), 테두리 `--input`, `rounded-lg`, `h-8`, `px-2.5 py-1`. 글자 fg=`--foreground` 상속                                                         |
| hover         | 없다               | `input.tsx` 에 `hover:` 가 0건이다. **hover 면을 만들지 마라 — 이유:** 입력 필드는 포인터가 지나가는 것과 글자를 넣을 수 있다는 것이 다른 사실이고, 후자는 커서가 이미 말한다 |
| focus-visible | 키보드·클릭 포커스 | `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50` — 테두리가 `--ring` 이 되고 그 바깥에 3px 링이 알파 50% 로 깔린다. 아래 a11y:focus 참조           |
| pressed       | 없다               | 누름 상태가 없다. 누르면 포커스가 들어가고 그 표시는 focus-visible 이 맡는다                                                                                                  |
| disabled      | `disabled`         | `disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50`. 다크는 `dark:disabled:bg-input/80`. 대비 하한 **3:1**(WCAG 1.4.11)       |
| loading       | 없다               | 스스로 비동기 동작을 하지 않는다. 저장 중을 보여야 하면 `disabled` 를 주고 표시는 부르는 쪽이 한다 — **필드 안에 스피너를 넣지 마라. 이유:** 32px 높이에서 글자와 겹친다      |
| empty         | 값이 빈 문자열     | 안내 글자(`placeholder`)가 fg=`--muted-foreground` 로 보인다. **안내 글자를 라벨 대신 쓰지 마라 — 이유:** 글자를 넣는 순간 사라져, 무엇을 넣는 칸인지 다시 확인할 수 없다     |
| error         | `aria-invalid`     | `aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20`. 다크는 테두리가 `--destructive` 알파 50%, 링이 알파 40% 다 (`input.tsx:11`)           |

**`transition-colors` 에 `motion-reduce:transition-none` 이 빠져 있다** (`input.tsx:11`).
[`../tokens.md`](../tokens.md) 가 "전이를 넣으면 `motion-reduce:transition-none` 을 같은 줄에 넣는다"
를 화면에 나온 8:8 로 정했다. **같은 줄에 넣는다. 이유:** 나중에 붙이려면 전이가 있는 줄을 전부 다시 찾아야
하고, 빠진 곳은 화면에서만 드러난다. **고칠 위치:** `../../src/ui/input.tsx:11`.

**`duration` 과 `ease` 가 없다** (`input.tsx:11`). [`../tokens.md`](../tokens.md) 가
`duration-150 ease-out` 을 화면에 나온 9곳으로 정했다. **`duration-150 ease-out` 을 붙인다. 이유:**
값이 없으면 브라우저 기본값이 쓰이고, 같은 화면의 다른 요소와 속도가 달라진다.

## a11y

- a11y:label — `<label htmlFor>` 가 **필수**다. **`placeholder` 로 대신하지 마라 — 이유:** 글자를 넣으면 사라지고, 스크린리더가 안내 글자를 이름으로 읽을지 설명으로 읽을지 브라우저마다 다르다. 라벨을 화면에 보이지 않게 해야 하면 `sr-only` 를 쓴다 — `aria-label` 은 음성 조작에서 말할 대상이 화면에 없게 만든다. `required` 를 준 필드는 라벨 글자에 필수임을 적는다 — 별표 하나만 쓰지 마라
- a11y:focus — 포커스 순서는 DOM 순서와 같고, `disabled` 필드는 포커스를 받지 않는다. **받은 소스의 포커스 표시는 `focus-visible:ring-3` 이고, [`../tokens.md`](../tokens.md) 가 정한 네 조각(`outline-2` · `outline-offset-2` · `outline-ring` · 인라인 링크에만 `rounded-sm`)과 다르다.** 두 방식을 섞지 마라 — 이유: 한 화면에서 포커스 표시가 두 모양이면 키보드 사용자가 지금 어디에 있는지 배울 수 없다. **폼 5종은 `ring-3` 한 벌로 통일하고 그 밖의 20종은 `outline-2` 한 벌을 쓴다** — 이유: 폼 요소는 테두리를 이미 가졌고 `outline` 은 그 테두리 바깥에 또 하나의 선을 그어 두 겹으로 읽힌다. 같은 판단을 [`Checkbox.md`](Checkbox.md) 의 a11y:focus 가 적고 있다. **고칠 위치:** 이 항목과 폼 5종 소스의 `focus-visible:` 조각
- a11y:contrast — 글자 fg=`--foreground` / bg=`--background` 라이트 15.82 · 다크 16.13, 안내 글자 fg=`--muted-foreground` / bg=`--background` 라이트 5.28 · 다크 7.97 ([`../tokens.md`](../tokens.md) `## 대비 검증` 의 대비값, 4.5:1 통과). **테두리 `--input` / bg=`--background` 쌍과 오류 테두리 `--destructive` / bg=`--background` 쌍은 미측정이다** — 테두리는 글자가 아니라 하한이 **3:1**(WCAG 1.4.11)이고, 다크의 `--input` 은 알파라 고정 쌍으로 계산되지 않는다. 구현 뒤 렌더 화면에서 `getComputedStyle` 로 재서 [`../tokens.md`](../tokens.md) 에 한 줄을 추가한다
- a11y:target — 높이 32px · 폭 `w-full`. 24x24 최소를 넘는다. **`h-8` 을 더 낮추지 마라 — 이유:** 24px 아래로 내려가면 기준을 만족하지 못하고, 32px 은 이미 하한에서 8px 여유뿐이다. 필드를 세로로 쌓을 때 간격 8px 이상을 둔다 — [`../tokens.md`](../tokens.md) 의 "카드 안 요소 사이 8px" 과 같은 값이다
- a11y:role — `textbox` (`<input type="text">` 의 암묵 역할). **`role` 을 지정하지 마라 — 이유:** `type` 에 따라 암묵 역할이 달라지는데(`search` 는 `searchbox`, `email`·`tel`·`url` 은 `textbox`) 하나로 고정하면 실제 동작과 읽히는 역할이 달라진다. **`type="number"` 를 쓰지 마라 — 이유:** 스크롤로 값이 바뀌고 브라우저마다 증감 단추의 크기가 달라 24x24 를 판정할 수 없다. 숫자는 `type="text" inputMode="numeric"` 으로 받는다

## responsive

- 브레이크포인트 분기는 **1건**이다 — `text-base md:text-sm` (`input.tsx:11`). 768px 미만은 16px, 768px 이상은 14px 이다. **이 분기를 지우지 마라. 이유:** iOS Safari 는 글자 크기가 16px 미만인 입력 필드에 포커스가 가면 화면을 확대한다. 확대된 화면은 사용자가 손으로 되돌려야 한다. `md` 는 [`../tokens.md`](../tokens.md) 의 화면에 15번 나온 브레이크포인트다
- 폭이 `w-full min-w-0` 이다 (`input.tsx:11`). 폭은 부모가 정한다. `min-w-0` 이 있어 flex 안에서 줄어든다 — **그 조각을 지우지 마라. 이유:** flex 자식의 기본 `min-width` 는 `auto` 라, 없으면 긴 값을 넣었을 때 필드가 부모를 밀어낸다
- 높이 32px · 좌우 여백 10px 이 모든 폭에서 같다. **375px 에서 필드 폭은 335px 이다** (375 - 화면 좌우 `px-5` 20px x2). 안쪽 여백을 빼면 글자에 쓸 수 있는 폭이 315px 이다
- 필드를 가로로 두 개 놓지 마라. **이유:** 375px 에서 각 필드가 160px 이 되고, 그 폭에 16px 글자를 넣으면 열 자 남짓에서 잘린다. 두 필드가 꼭 한 줄이어야 하면 `md:` 이상에서만 가른다
- `lg` 이상 브레이크포인트를 넣지 마라. **이유:** 페이지 폭이 `max-w-5xl`(1024px)에서 멈춘다

## 상호작용

- focus-visible / disabled / error 정의. hover 와 pressed 는 없다
