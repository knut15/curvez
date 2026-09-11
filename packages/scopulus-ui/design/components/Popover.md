# component: Popover

purpose: 트리거 곁에 덧창을 띄우고 뒤의 조작은 막지 않는다. 뒤를 막고 답을 받아야 하면 `Dialog`, 글자 한 줄만 보여 주면 `Tooltip` 이다

## 근거 — shadcn base-nova 에서 받았다

### 1. 출처

| 항목      | 값                                                              |
| --------- | --------------------------------------------------------------- |
| 받은 명령 | `pnpm dlx shadcn@4 add popover`                                 |
| 스타일    | `base-nova`                                                     |
| 받은 날짜 | **2026-09-11**                                                  |
| 소스      | [`../../src/ui/popover.tsx`](../../src/ui/popover.tsx)          |
| 기반      | `@base-ui/react/popover` (`popover.tsx:2`). **Radix 가 아니다** |
| 아이콘    | 없다                                                            |

**export 6개** (`popover.tsx:80-87`)

| export               | 감싸는 Base UI 프리미티브      | 태그       | 소스 줄          |
| -------------------- | ------------------------------ | ---------- | ---------------- |
| `Popover`            | `PopoverPrimitive.Root`        | (없다)     | `popover.tsx:5`  |
| `PopoverTrigger`     | `PopoverPrimitive.Trigger`     | `<button>` | `popover.tsx:9`  |
| `PopoverContent`     | `PopoverPrimitive.Popup`       | `<div>`    | `popover.tsx:13` |
| `PopoverHeader`      | (없다 — 순수 `<div>`)          | `<div>`    | `popover.tsx:47` |
| `PopoverTitle`       | `PopoverPrimitive.Title`       | `<h2>`     | `popover.tsx:57` |
| `PopoverDescription` | `PopoverPrimitive.Description` | `<p>`      | `popover.tsx:67` |

**`Portal` 과 `Positioner` 는 export 되지 않는다.** `PopoverContent` 안에 박혀 있다
(`popover.tsx:26-33`) — 띄우는 자리와 겹침 순서를 바깥에서 바꿀 수 없다.

**variant 축이 없다. size 축도 없다.** `popover.tsx` 에 `cva` 가 없고 폭이 `w-72`(288px) 하나로
고정이다 (`popover.tsx:37`).

### 2. handwork 사용처: 0곳

handwork 화면 어디에도 쓰인 적이 없다. **기존 9종의 `## 근거` 에 있는 `파일:줄` 실측이 이 문서에는
없다.** 값의 출처는 위의 받은 소스 하나다.

### 3. 왜 20종에 들어가는가

**오버레이 묶음을 덮는다.** 오버레이 3종(`Dialog` · `Tooltip` · `Popover`) 중
뒤를 막지 않고 곁에 붙는 자리를 맡는다.

## props

### Popover (루트)

| 이름         | 타입                      | 필수 | 기본값  | 의미                                |
| ------------ | ------------------------- | ---- | ------- | ----------------------------------- |
| open         | `boolean`                 | X    | —       | 제어로 쓸 때의 열림 여부            |
| defaultOpen  | `boolean`                 | X    | `false` | 비제어로 쓸 때의 처음 값            |
| onOpenChange | `(open: boolean) => void` | X    | —       | 열고 닫힐 때                        |
| children     | `React.ReactNode`         | O    | —       | `PopoverTrigger` + `PopoverContent` |

### PopoverContent

| 이름        | 타입                                                                     | 필수 | 기본값       | 의미                                         |
| ----------- | ------------------------------------------------------------------------ | ---- | ------------ | -------------------------------------------- |
| side        | `top` \| `bottom` \| `left` \| `right` \| `inline-start` \| `inline-end` | X    | **`bottom`** | 트리거의 어느 쪽에 뜨는가 (`popover.tsx:17`) |
| sideOffset  | `number`                                                                 | X    | **`4`**      | 트리거와의 간격 px (`popover.tsx:18`)        |
| align       | `start` \| `center` \| `end`                                             | X    | **`center`** | 그 축에서의 정렬 (`popover.tsx:15`)          |
| alignOffset | `number`                                                                 | X    | **`0`**      | 정렬 축의 어긋남 px (`popover.tsx:16`)       |
| className   | `string`                                                                 | X    | —            | 폭을 바꿀 때만 쓴다                          |
| children    | `React.ReactNode`                                                        | O    | —            | `PopoverHeader` + 본문                       |

네 값은 `PopoverPrimitive.Positioner.Props` 에서 뽑아 다시 노출한 것이다 (`popover.tsx:20-24`).

**`sideOffset` 을 4 보다 크게 두지 마라.**
**이유:** 트리거와 덧창 사이가 벌어지면 포인터가 그 틈을 지날 때 덧창이 닫히고, 사용자는 무엇 때문에
닫혔는지 알 수 없다. 4px 은 [`../tokens.md`](../tokens.md) 의 간격 12단계 중 `1` 스텝이다.

**`modal` prop 을 열지 마라.**
**이유:** 뒤를 막는 것은 `Dialog` 가 맡는다. 같은 일을 두 컴포넌트가 하면 어느 것을 쓸지가
매번 판단 대상이 된다. 같은 판단을 [`Dialog.md`](Dialog.md) 의 `## props` 가 적고 있다.

### 조각별 값

| export               | 값                                                                                                                                            | 소스 줄          |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `PopoverContent`     | `w-72`(288px) · `rounded-lg` · bg=`--popover` · fg=`--popover-foreground` · `p-2.5` · `gap-2.5` · `text-sm` · `shadow-md` · `ring-1` · `z-50` | `popover.tsx:37` |
| `PopoverHeader`      | `flex flex-col gap-0.5 text-sm`                                                                                                               | `popover.tsx:51` |
| `PopoverTitle`       | `font-medium`                                                                                                                                 | `popover.tsx:61` |
| `PopoverDescription` | fg=`--muted-foreground`                                                                                                                       | `popover.tsx:74` |

**`shadow-md` 가 [`../tokens.md`](../tokens.md) 와 어긋난다.** 그 문서의 `## 고도(elevation)` 절이
"쓰지 않는다. 그림자 토큰을 만들지 않는다" 를 실측 0건으로 정했다. **같은 절이 되돌릴 조건도
적어 두었다 — "그림자가 필요해지는 조건은 하나다 — 화면 위에 떠서 아래를 가리는 요소가 생길 때."
`Popover` 가 그 조건이다.**

**`shadow-md` 를 그대로 둔다.**
**이유:** 덧창은 아래의 글자를 가리므로 어디까지가 덧창인지 경계가 필요하고, 받은 소스가 그것을
그림자와 `ring-1` 두 가지로 그린다. 다만 다크에서는 검은 그림자가 배경에 묻혀 보이지 않고
`ring-1 ring-foreground/10` 만 남는다 — 그 판단도 같은 절이 이미 적었다.
**[`../tokens.md`](../tokens.md) 의 `## 고도` 절을 다시 열어 이 컴포넌트를 적어야 한다.**
**고칠 위치:** `../tokens.md` 의 `## 고도(elevation)` 절과 `../../src/tokens.css` 의
`@theme inline` 블록. 그 작업은 이 문서의 범위가 아니다.

**`duration-100` 은 [`../tokens.md`](../tokens.md) 의 `duration-150`(실측 9건)과 다르다.**
**`duration-150` 으로 맞춘다. 이유:** 모션 값이 `--ease-out` 하나로 못박혀 있는데 시간만 두 값이면
어느 것이 의도인지 판정할 수 없다. **고칠 위치:** `../../src/ui/popover.tsx:37`.

**`--popover` 와 `--popover-foreground` 는 [`../tokens.md`](../tokens.md) 의 색 표 14행에 없다.**
값은 `../../src/tokens.css:68-69`(라이트) · `:103-104`(다크)에 있고, `--card` · `--card-foreground` 와
**같은 값이다**. **새 토큰을 만들지 마라 — 이유:** 이미 CSS 에 있는 이름이다.

## states

| state         | 트리거        | 시각 변화                                                                                                                                                                                                  |
| ------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| default       | 닫힘          | 아무것도 렌더되지 않는다. `PopoverPrimitive.Portal` 이 열릴 때만 DOM 에 붙는다 (`popover.tsx:26`)                                                                                                          |
| hover         | 없다          | 덧창 면에는 `hover:` 가 0건이다. **덧창 면에 hover 를 만들지 마라 — 이유:** 덧창은 포인터가 머무는 곳이지 누르는 곳이 아니다. 누를 것은 안에 놓인 `Button` 이고 그 값은 [`Button.md`](Button.md) 가 정한다 |
| focus-visible | 키보드 포커스 | 덧창 자체는 `outline-hidden` 이다 (`popover.tsx:37`). 열릴 때 포커스가 덧창 안으로 들어가지만 링을 그리지 않는다 — 링은 안의 버튼·입력이 각자 그린다                                                       |
| pressed       | 없다          | 덧창 면은 누를 수 없다. 누름은 안의 `Button` 이 갖는다                                                                                                                                                     |
| disabled      | 없다          | 덧창에 비활성 개념이 없다. 열리거나 닫히거나 둘뿐이다. 트리거는 `PopoverTrigger` 가 받은 `disabled` 를 그대로 쓴다                                                                                         |
| loading       | 없다          | 스스로 데이터를 불러오지 않는다. 불러오는 중을 보여야 하면 덧창 본문에 `Skeleton` 을 놓는다 — **덧창 높이가 그때 바뀐다는 것을 알고 써라.** `Skeleton` 의 높이를 실제 내용과 같게 잡는다                   |
| empty         | 없다          | `children` 이 비면 덧창을 열지 마라 — 이유: 288px 짜리 빈 상자가 아래 글자를 가린다. 조건부 렌더는 부르는 쪽이 한다                                                                                        |
| error         | 없다          | 덧창이 에러 상태를 갖지 않는다. 덧창 안의 실패는 본문에 `Alert variant="destructive"` 를 놓아 표시한다                                                                                                     |

**열고 닫는 전이는 `fade` + `zoom-95` 에 방향별 `slide-in` 이 더해진다** (`popover.tsx:37`).
여섯 방향(`top` · `bottom` · `left` · `right` · `inline-start` · `inline-end`)에 각각 반대쪽에서
2 스텝(8px) 미끄러져 들어온다.
**`motion-reduce:` 짝이 빠져 있다** — [`../tokens.md`](../tokens.md) 가 "전이를 넣으면
`motion-reduce:transition-none` 을 같은 줄에 넣는다" 를 실측 8:8 로 정했다.
**`motion-reduce:animate-none` 을 넣는다. 이유:** 미끄러지는 움직임은 전정기관 이상이 있는
사용자에게 어지럼을 준다. **고칠 위치:** `../../src/ui/popover.tsx:37`.

## a11y

- a11y:label — `PopoverTitle` 을 넣으면 Base UI 가 `aria-labelledby` 로 덧창과 묶는다. **제목 없이 열지 마라 — 이유:** 이름 없는 덧창은 스크린리더가 "그룹" 이라고만 읽어 무엇이 열렸는지 알 수 없다. 제목을 화면에 보이지 않게 해야 하면 `sr-only` 를 쓴다. `PopoverDescription` 은 선택이고, 넣으면 `aria-describedby` 로 묶인다. 트리거가 아이콘 버튼이면 `aria-label` 이 **필수**다 — [`Button.md`](Button.md) 의 a11y:label 과 같은 규칙이다
- a11y:focus — 열리면 포커스가 덧창 안으로 들어가고 닫히면 `PopoverTrigger` 로 돌아간다. Base UI 가 처리한다. Esc 로 닫히고, 덧창 밖을 누르면 닫힌다. **`Dialog` 와 달리 포커스가 덧창에 갇히지 않는다** — Tab 으로 덧창을 빠져나가면 덧창이 닫힌다. **덧창 안에 포커스 대상이 0개면 `Popover` 를 쓰지 마라 — 이유:** 키보드로 연 뒤 갈 곳이 없어 Esc 말고는 할 수 있는 일이 없다. 글자만 보여 줄 자리는 `Tooltip` 이다
- a11y:contrast — `--popover` 와 `--popover-foreground` 의 값은 `--card` · `--card-foreground` 와 **같다** (`../../src/tokens.css:68-69` 라이트 · `:103-104` 다크). 그래서 [`../tokens.md`](../tokens.md) 의 카드 실측값이 그대로 적용된다 — 제목 fg=`--popover-foreground` / bg=`--popover` 라이트 16.73 · 다크 14.84, 설명 fg=`--muted-foreground` / bg=`--popover` 라이트 5.59 · 다크 7.34. 둘 다 4.5:1 통과. **`ring-1 ring-foreground/10` 의 테두리 대비는 미측정이다** — 알파가 얹힌 색은 배경에 따라 달라져 고정 쌍으로 계산되지 않는다. 같은 판단을 [`../tokens.md`](../tokens.md) 가 다크 `--border` 에 대해 이미 내렸다
- a11y:target — 덧창 면은 클릭 대상이 아니라 24x24 규칙이 걸리지 않는다. 트리거와 덧창 안의 버튼만 그 규칙을 받고, [`Button.md`](Button.md) 가 `size="default"` 40px · `size="icon"` 40x40 · `size="icon-sm"` 32x32 로 정했다. 트리거와 덧창 사이 `sideOffset` 4px 은 클릭 영역을 가르지 않는다 — 그 틈은 포인터가 지나가는 자리다
- a11y:role — Base UI 가 `role="dialog"` 를 붙인다. **`aria-modal` 은 붙지 않는다** — 뒤를 막지 않기 때문이다. **`role` 을 덮어쓰지 마라. 이유:** `tooltip` 으로 바꾸면 안의 버튼을 스크린리더가 읽지 못하고, `menu` 로 바꾸면 화살표 키 이동이 있는 것처럼 읽히는데 실제로는 없다. 트리거는 `aria-expanded` 와 `aria-controls` 를 Base UI 가 붙인다

## responsive

- 브레이크포인트 분기가 **0건**이다. 폭 `w-72`(288px)가 모든 화면에서 같다 (`popover.tsx:37`)
- **375px 화면에서 288px 덧창은 화면 폭의 77% 를 덮는다.** 화면 좌우 여백 `px-5`(20px x2)를 빼면 쓸 수 있는 폭이 335px 이라 47px 만 남는다. **375px 에서 `align="start"` 또는 `align="end"` 를 쓰지 마라 — 이유:** 트리거가 화면 가장자리에 있으면 덧창이 밖으로 나가고, Base UI 의 `Positioner` 가 밀어 넣으면서 트리거와의 정렬이 깨진다. 기본값 `center` 를 쓴다
- 덧창이 화면 아래로 넘치면 Base UI 가 `side` 를 뒤집는다. `side="bottom"` 이 `top` 이 되고 `slide-in` 방향도 함께 바뀐다 — `data-[side=top]:slide-in-from-bottom-2` (`popover.tsx:37`)가 그 경우의 값이다
- **최대 높이를 정하지 않았다.** `PopoverContent` 에 `max-h-*` 가 없다 (`popover.tsx:37`). 내용이 길면 덧창이 화면 밖으로 나간다. **긴 목록을 넣을 자리면 `className="max-h-64 overflow-y-auto"` 를 준다** — 이유: 덧창 밖으로 나간 부분은 스크롤로 닿을 수 없다. 목록이 본래 목적이면 `Select` 를 쓴다 — 그쪽은 `max-h-(--available-height)` 를 이미 갖는다 (`select.tsx:84`)
- 덧창을 화면 폭에 맞춰 늘리지 마라. **이유:** 288px 은 트리거 곁이라는 것을 형태로 말하는 폭이다. 화면 폭을 채우면 `Dialog` 와 구분되지 않고, `Dialog` 는 뒤를 막지만 이것은 막지 않는다
- `lg` 이상 브레이크포인트를 넣지 마라. **이유:** 폭이 고정이라 분기를 늘려도 화면이 달라지지 않는다

## 상호작용

- 열림/닫힘 두 상태뿐이다. hover / focus-visible / pressed 는 트리거와 덧창 안의 요소가 갖는다
- 닫는 수단 셋 — Esc · 바깥 클릭 · Tab 으로 빠져나가기. 셋 다 `onOpenChange` 로 모인다
