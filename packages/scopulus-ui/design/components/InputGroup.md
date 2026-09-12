# component: InputGroup

purpose: 입력 앞뒤에 칸을 붙여 한 면으로 보이게 한다. 단위·접두·아이콘이 그 칸에 들어간다

## 근거 — shadcn/ui 의 마크업 구조만 옮겼다

### 1. 출처

**이 컴포넌트는 화면에서 센 값이 아니다.** handwork 화면에 입력 묶음이 쓰인 자리가 **0곳**이다.
`## 근거` 에 `파일:줄` 이 없는 것은 빠뜨린 것이 아니라 셀 화면이 없기 때문이다.

| 항목           | 값                                                                                   |
| -------------- | ------------------------------------------------------------------------------------ |
| 구조 출처      | shadcn/ui `input-group` — <https://ui.shadcn.com/docs/components/input-group>        |
| 옮긴 것        | 그룹이 테두리를 갖고 안쪽 컨트롤은 면만 맡는 구조, 애드온을 앞뒤에 두는 배치         |
| 옮기지 않은 것 | `align` 4단계(`block-start` · `block-end`), `InputGroupButton`, `InputGroupTextarea` |
| 의존성         | 없다. `cn` 만 쓴다 — 이미 있는 의존성이다                                            |
| 소스           | [`../../src/ui/input-group.tsx`](../../src/ui/input-group.tsx)                       |

**export 3개**

| export            | 태그      | 무엇                                    |
| ----------------- | --------- | --------------------------------------- |
| `InputGroup`      | `<div>`   | 테두리·반경·포커스 링을 갖는 바깥 면    |
| `InputGroupAddon` | `<span>`  | 입력 앞뒤의 칸. 글자나 아이콘만 담는다  |
| `InputGroupInput` | `<input>` | 테두리·반경·링이 없는 입력. 면만 맡는다 |

**variant 축이 없다.** `InputGroupAddon` 의 `side` 는 **축 하나**라 `cva` 를 쓰지 않고 삼항으로
가른다. 같은 방식을 `badge.tsx:27` 이 쓴다.

### 2. `Input` 을 넣지 않고 `InputGroupInput` 을 따로 둔다

**결정: 그룹 안에 들어가는 입력은 이 파일이 직접 렌더한다.**

`Input` 은 자기 테두리(`border border-input`)와 자기 링(`focus-visible:ring-3`)과 자기 반경
(`rounded-lg`)을 갖는다(`input.tsx:11`). 그대로 그룹에 넣으면 **테두리가 두 겹, 링이 두 겹**이 된다.

바깥에서 후손 선택자로 그것을 지우는 방법도 있다 —
`[&_input]:border-0 [&_input:focus-visible]:ring-0` 같은 것. **쓰지 않았다.**
**이유:** 그 방식이 성립하는 근거가 선택자 우선순위 계산이고, 그 계산의 한쪽 항이
**다른 파일의 클래스 문자열**이다. `input.tsx:11` 에 `dark:` 나 `aria-invalid:` 조각이 하나
더 붙는 순간 이 파일이 조용히 깨지고, 그 어긋남은 화면에서만 드러난다.

**대신 값을 손으로 맞췄다. `input.tsx:11` 이 바뀌면 이 파일도 함께 고친다.**

| 축        | `input.tsx:11`                            | 이 파일                                        |
| --------- | ----------------------------------------- | ---------------------------------------------- |
| 높이      | `h-8` = 32px                              | `InputGroup` 이 `h-8`                          |
| 반경      | `rounded-lg` = 10px                       | `InputGroup` 이 `rounded-lg`                   |
| 테두리    | `border border-input`                     | `InputGroup` 이 같은 값                        |
| 좌우 여백 | `px-2.5` = 10px                           | 입력·애드온 둘 다 `px-2.5`                     |
| 글자      | `text-base md:text-sm`                    | `InputGroupInput` 이 같은 값                   |
| 안내 글자 | `placeholder:text-muted-foreground`       | 같은 값                                        |
| 포커스 링 | `focus-visible:ring-3 ring-ring/50`       | 그룹이 `has-[input:focus-visible]:` 로 같은 값 |
| 오류      | `aria-invalid:ring-3 ring-destructive/20` | 그룹이 `has-[[aria-invalid=true]]:` 로 같은 값 |
| 다크 면   | `dark:bg-input/30`                        | `InputGroup` 이 같은 값                        |

**고칠 위치:** `../../src/ui/input-group.tsx` 의 세 클래스 문자열과 이 표.

### 3. 애드온에 버튼을 넣지 않는다

**결정: `InputGroupAddon` 은 글자와 아이콘만 담는다. 버튼을 넣지 않는다.**

**이유 둘.**

1. **초점 대상이 둘이 된다.** 포커스 링이 그룹 전체에 걸리는데, 입력과 버튼 둘 중 어느 것이
   잡혔는지를 그 링이 말하지 못한다. 그래서 그룹의 링을 `has-[input:focus-visible]:` 로
   **안쪽 `input` 에만** 묶어 두었다 — 버튼이 잡히면 그룹은 빛나지 않고 버튼 자신의
   `focus-visible:outline-2`(`button.tsx:30`)만 보인다. 그러나 그 순간 같은 화면에 링 두 모양이
   나오고, 그것을 [`Checkbox.md`](Checkbox.md) 의 `a11y:focus` 가 금지한다 —
   "한 화면에서 포커스 표시가 두 모양이면 키보드 사용자가 지금 어디에 있는지 배울 수 없다"
2. **`Button` 의 링이 잘린다.** 그룹은 애드온의 모서리를 자기 반경에 맞추려고
   `overflow-hidden` 을 쓴다. `outline-offset-2` 는 요소 바깥 2px 에 그려지므로 그 잘림에 걸린다.
   `overflow-hidden` 을 빼면 이번에는 애드온의 각진 모서리가 그룹의 둥근 모서리를 넘어간다

**입력 옆에 버튼이 필요하면 그룹 바깥에 둔다.** 그때 버튼은 `size="icon-sm"`(32x32)이어야
줄이 맞는다 — 근거는 [`Input.md`](Input.md) 의 "높이 32px 은 `size="default"` 40px 과 다르다".

**바꿀 때 고칠 위치:** 이 절, `../../src/ui/input-group.tsx` 의 `InputGroup` 클래스 문자열
(`overflow-hidden` 과 `has-[input:focus-visible]:`), 그리고 `InputGroupAddon`.

## props

### `InputGroup`

| 이름     | 타입              | 필수 | 기본값 | 의미                               |
| -------- | ----------------- | ---- | ------ | ---------------------------------- |
| children | `React.ReactNode` | O    | —      | 애드온과 `InputGroupInput` 의 나열 |

### `InputGroupAddon`

| 이름     | 타입               | 필수 | 기본값    | 의미                                                      |
| -------- | ------------------ | ---- | --------- | --------------------------------------------------------- |
| side     | `"start" \| "end"` | X    | `"start"` | 입력 앞인지 뒤인지. 가르는 선이 어느 쪽에 서는지를 정한다 |
| children | `React.ReactNode`  | O    | —         | 칸에 담을 글자나 아이콘                                   |

### `InputGroupInput`

| 이름         | 타입                            | 필수 | 기본값  | 의미                              |
| ------------ | ------------------------------- | ---- | ------- | --------------------------------- |
| id           | `string`                        | X    | —       | 라벨이 가리킬 `id`                |
| type         | `string`                        | X    | `text`  | `<input>` 의 `type`               |
| value        | `string`                        | X    | —       | 제어로 쓸 때의 값                 |
| defaultValue | `string`                        | X    | —       | 비제어로 쓸 때의 처음 값          |
| onChange     | `(e) => void`                   | X    | —       | 값이 바뀔 때                      |
| placeholder  | `string`                        | X    | —       | 빈 상태의 안내 글자               |
| disabled     | `boolean`                       | X    | `false` | 입력 무시 + 불투명도 50%          |
| required     | `boolean`                       | X    | `false` | 폼 제출 시 필수                   |
| aria-invalid | `boolean`                       | X    | `false` | 오류 표시. **그룹 전체**가 바뀐다 |
| (그 밖)      | `React.ComponentProps<"input">` | X    | —       | `className` 만 빼고 그대로 받는다 |

**`className` 을 셋 다 받지 않는다.**
**이유:** 그룹의 값은 한 벌뿐이고 폭은 `w-full` 로 부모가 정한다. 안쪽 입력에 `className` 을
열면 그룹이 지운 테두리·반경·링이 다시 살아나 두 겹이 되는 자리가 생긴다.

**`size` prop 을 두지 마라.** 근거는 [`Input.md`](Input.md) 의 같은 항목과 같다 — 받은 소스에
높이 단계가 하나다.

**`align` 을 4단계로 늘리지 마라.** shadcn 은 `block-start` · `block-end` 로 입력 위아래에도
칸을 붙인다. **이유:** 위아래 칸은 높이를 32px 에 고정할 수 없어 `h-8` 이 깨지고,
그 높이는 화면에 0번 나온 값이다.

## states

| state         | 트리거                          | 시각 변화                                                                                                                                                                                                           |
| ------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| default       | —                               | 그룹: 면 투명(다크는 `--input` 알파 30%), 테두리 `--input`, `rounded-lg`, `h-8`. 애드온: 면 `--muted`, 글자 `--muted-foreground` `text-sm`, 안쪽 모서리에 1px 선                                                    |
| hover         | 없음                            | `hover:` 가 0건이다. **hover 면을 만들지 마라 — 이유:** 근거는 [`Input.md`](Input.md) 의 같은 행과 같다. 글자를 넣을 수 있다는 것은 커서가 이미 말한다                                                              |
| focus-visible | 안쪽 `input` 에 초점            | `has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/50` — **링이 그룹 전체에 걸린다.** 애드온까지 한 면으로 빛난다                                          |
| pressed       | 없음                            | 누름 상태가 없다. 누르면 초점이 들어가고 그 표시는 focus-visible 이 맡는다                                                                                                                                          |
| disabled      | `InputGroupInput` 의 `disabled` | 그룹 면이 `--input` 알파 50%(다크 80%)로 채워지고 커서가 `not-allowed` 가 된다. **입력 글자만 `opacity-50` 이고 애드온은 흐려지지 않는다** — 아래 이유 참조                                                         |
| loading       | 없음                            | 스스로 비동기 동작을 하지 않는다. 저장 중은 `disabled` 를 주고 표시는 부르는 쪽이 한다 — **32px 높이의 칸에 스피너를 넣지 마라.** 근거는 [`Input.md`](Input.md) 의 같은 행                                          |
| empty         | 값이 빈 문자열                  | 안내 글자가 `--muted-foreground` 로 보인다. 애드온은 그대로 남는다 — **애드온을 안내 글자 대신 쓰지 마라. 이유:** 애드온은 값의 일부가 아니라 고정된 접두·단위다                                                    |
| error         | `aria-invalid`                  | `has-[[aria-invalid=true]]:border-destructive has-[[aria-invalid=true]]:ring-3 has-[[aria-invalid=true]]:ring-destructive/20`. 다크는 테두리 알파 50% · 링 알파 40%. **속성은 안쪽 입력에 주고 표시는 그룹이 한다** |

**애드온을 `opacity-50` 으로 함께 흐리지 않는다.**
처음에는 그룹 전체에 `has-[input:disabled]:opacity-50` 을 주었다. **스토리의 axe 검사가 잡았다** —
`--muted-foreground` 가 `--muted` 위에서 대비 **1.97** 로 떨어져 `color-contrast` 위반이 났다
(`input-group.stories.tsx` 의 `Disabled`).
**이유:** 고칠 수 없는 것과 읽을 수 없는 것은 다르다. `₩` 나 `https://` 는 값이 잠긴 뒤에도
사용자가 읽어야 하는 정보다. 비활성 표시는 면(`--input/50`)과 커서와 `disabled` 속성 셋이 맡는다.
**고칠 위치:** `../../src/ui/input-group.tsx` 의 `InputGroup` 과 `InputGroupInput` 두 클래스 문자열.

**전이는 `transition-colors duration-150 ease-out motion-reduce:transition-none` 네 조각을
같은 줄에 넣었다.** [`../tokens.md`](../tokens.md) 의 `### 전이` 가 정한 한 벌이다.
`input.tsx:11` 에는 그 넷 중 `transition-colors` 하나뿐이고 [`Input.md`](Input.md) 이 그것을
고칠 위치로 적어 두었다 — **이 파일은 처음부터 네 조각을 갖는다.**

## a11y

- a11y:label — `<label htmlFor>` 가 **필수**다. 애드온을 라벨 대신 쓰지 마라 — **이유:** 애드온은 `<span>` 이라 접근 가능한 이름을 만들지 않고, 화면 낭독기는 그것을 입력과 무관한 글자로 읽는다. 아이콘만 담은 애드온에는 `aria-hidden` 을 준다 — 이유: 아이콘은 뜻을 말하지 못하고, 이름은 라벨이 이미 준다. 애드온 글자가 값의 뜻을 바꾸는 경우(`시간`, `/ 월`)에는 그 뜻을 라벨 글자에도 적는다 — 화면 낭독기가 입력에 닿았을 때 읽는 것은 라벨뿐이다
- a11y:focus — 초점 대상이 **1개**(안쪽 `input`)다. 애드온은 `<span>` 이라 초점을 받지 않는다. **초점 대상이 둘이 되는 경우(버튼 애드온)를 만들지 않는다** — 근거와 대안은 위 `### 3` 에 있다. 링은 `ring-3` 한 벌이고 [`Checkbox.md`](Checkbox.md) 의 `a11y:focus` 가 정한 "폼 5종은 `ring-3`" 을 따른다
- a11y:contrast — 애드온 fg=`--muted-foreground` / bg=`--muted` 라이트 **4.91** · 다크 **6.51** ([`../tokens.md`](../tokens.md) `## 대비 검증` 의 "칩 글자/칩 배경" 대비값, 4.5:1 통과). 입력 글자 fg=`--foreground` / bg=`--background` 라이트 15.82 · 다크 16.13. **테두리 `--input` / bg=`--background` 쌍과 오류 테두리 `--destructive` / bg=`--background` 쌍은 미측정이다** — 테두리는 글자가 아니라 하한이 **3:1**(WCAG 1.4.11)이고 다크의 `--input` 은 알파라 고정 쌍으로 계산되지 않는다. 근거는 [`Input.md`](Input.md) 의 같은 항목과 같다
- a11y:target — 그룹 높이 32px · 폭 `w-full`. 24x24 최소를 넘는다. 애드온은 클릭 대상이 아니다 — **애드온을 눌러도 입력에 초점이 가지 않는다.** 그렇게 만들려면 애드온이 `<label>` 이어야 하고 그러면 라벨이 둘이 된다. 그룹을 세로로 쌓을 때 간격 8px 이상을 둔다
- a11y:role — 그룹은 역할이 없다(`<div>`). 안쪽 입력이 `textbox`(또는 `type` 에 따른 암묵 역할)를 갖는다. **`role="group"` 을 주지 마라 — 이유:** 컨트롤이 하나뿐인 묶음에 묶음 역할을 주면 들어가고 나오는 소리만 늘어난다. **`role` 을 입력에 지정하지 마라** — 근거는 [`Input.md`](Input.md) 의 같은 항목과 같다. 숫자는 `type="text" inputMode="numeric"` 으로 받는다

## responsive

- 브레이크포인트 분기는 **1건**이다 — `InputGroupInput` 의 `text-base md:text-sm`.
  768px 미만 16px, 이상 14px. **이 분기를 지우지 마라. 이유:** iOS Safari 는 글자 크기가 16px
  미만인 입력 필드에 초점이 가면 화면을 확대한다. 근거는 [`Input.md`](Input.md) 의 `## responsive`
- 애드온 글자는 모든 폭에서 `text-sm`(14px)이다. 애드온은 초점을 받지 않아 위 확대 문제가 없다
- 그룹 폭은 `w-full min-w-0`. 입력도 `flex-1 min-w-0` 이라 긴 값을 넣어도 애드온을 밀어내지 않는다.
  **`min-w-0` 을 지우지 마라. 이유:** flex 자식의 기본 `min-width` 는 `auto` 라, 없으면 값이
  길어질 때 입력이 그룹을 넘어간다
- **애드온 글자를 길게 쓰지 마라.** 애드온은 `shrink-0` 이라 줄어들지 않는다.
  375px 화면에서 그룹 폭은 335px 이고(375 − `px-5` 20px×2), 앞뒤 애드온이 각 60px 을 먹으면
  값에 쓸 폭이 195px 밖에 남지 않는다. 두 자에서 다섯 자 사이로 둔다
- 그룹을 가로로 두 개 놓지 마라. 근거는 [`Input.md`](Input.md) 의 같은 항목과 같다
- `lg` 이상을 넣지 마라. 페이지 폭이 `max-w-5xl`(1024px)에서 멈춘다

## 상호작용

- focus-visible / disabled / error 정의. hover 와 pressed 는 없다
- **초점 링이 그룹 전체에 걸린다**(`has-[input:focus-visible]:`). 안쪽 입력이 잡혔을 때만 켜진다
- 애드온은 초점도 hover 도 받지 않는다. 누를 수 있는 것을 애드온에 넣지 않는다 — 근거는 위 `### 3`
