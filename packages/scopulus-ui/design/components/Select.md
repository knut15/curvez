# component: Select

purpose: 닫힌 목록에서 하나를 고른다. 값이 열려 있으면 `Input`, 켜고 끄는 것이면 `Checkbox` 나 `Switch` 를 쓴다

## 근거 — shadcn base-nova 에서 받았다

### 1. 출처

| 항목      | 값                                                                                   |
| --------- | ------------------------------------------------------------------------------------ |
| 받은 명령 | `pnpm dlx shadcn@4 add select`                                                       |
| 스타일    | `base-nova`                                                                          |
| 받은 날짜 | **2026-09-11**                                                                       |
| 소스      | [`../../src/ui/select.tsx`](../../src/ui/select.tsx)                                 |
| 기반      | `@base-ui/react/select` (`select.tsx:2`). **Radix 가 아니다**                        |
| 아이콘    | `lucide-react` 의 `ChevronDownIcon` · `CheckIcon` · `ChevronUpIcon` (`select.tsx:4`) |

**export 10개** (`select.tsx:188-199`)

| export                   | 감싸는 Base UI 프리미티브         | 소스 줄          |
| ------------------------ | --------------------------------- | ---------------- |
| `Select`                 | `SelectPrimitive.Root` **별칭**   | `select.tsx:6`   |
| `SelectTrigger`          | `SelectPrimitive.Trigger`         | `select.tsx:28`  |
| `SelectValue`            | `SelectPrimitive.Value`           | `select.tsx:18`  |
| `SelectContent`          | `SelectPrimitive.Popup`           | `select.tsx:56`  |
| `SelectGroup`            | `SelectPrimitive.Group`           | `select.tsx:8`   |
| `SelectLabel`            | `SelectPrimitive.GroupLabel`      | `select.tsx:98`  |
| `SelectItem`             | `SelectPrimitive.Item`            | `select.tsx:111` |
| `SelectSeparator`        | `SelectPrimitive.Separator`       | `select.tsx:139` |
| `SelectScrollUpButton`   | `SelectPrimitive.ScrollUpArrow`   | `select.tsx:152` |
| `SelectScrollDownButton` | `SelectPrimitive.ScrollDownArrow` | `select.tsx:170` |

**`Select` 만 감싸지 않은 별칭이다** — `const Select = SelectPrimitive.Root` (`select.tsx:6`).
나머지 아홉은 클래스를 얹은 함수다. **`data-slot` 이 `Select` 에만 없다는 뜻이다.**

**스크롤 단추 둘은 `SelectContent` 안에 이미 박혀 있다** (`select.tsx:89`, `:91`). export 되지만
**직접 놓지 마라 — 이유:** 두 벌이 겹쳐 목록 위아래에 화살표가 두 개씩 뜬다.

**variant 축이 없다. size 는 `SelectTrigger` 에만 있다.**

| 축   | 값                                   | 기본값    | 소스 줄               |
| ---- | ------------------------------------ | --------- | --------------------- |
| size | `sm`(h-7=28px) · `default`(h-8=32px) | `default` | `select.tsx:30,34,41` |

### 2. handwork 사용처: 0곳

handwork 화면 어디에도 쓰인 적이 없다. **기존 9종의 `## 근거` 에 있는 `파일:줄` 실측이 이 문서에는
없다.** 값의 출처는 위의 받은 소스 하나다.

### 3. 왜 20종에 들어가는가

**폼 묶음을 덮는다.** 폼 5종(`Input` · `Textarea` · `Checkbox` · `Switch` · `Select`) 중
값의 집합이 닫혀 있는 자리를 맡는다.

## props

### Select (루트)

| 이름          | 타입                      | 필수 | 기본값  | 의미                              |
| ------------- | ------------------------- | ---- | ------- | --------------------------------- |
| value         | `string`                  | X    | —       | 제어로 쓸 때의 값                 |
| defaultValue  | `string`                  | X    | —       | 비제어로 쓸 때의 처음 값          |
| onValueChange | `(value: string) => void` | X    | —       | 값이 바뀔 때                      |
| disabled      | `boolean`                 | X    | `false` | 전체 비활성                       |
| required      | `boolean`                 | X    | `false` | 폼 제출 시 필수                   |
| name          | `string`                  | X    | —       | 폼 필드 이름                      |
| children      | `React.ReactNode`         | O    | —       | `SelectTrigger` + `SelectContent` |

### SelectTrigger

| 이름      | 타입              | 필수 | 기본값    | 의미                             |
| --------- | ----------------- | ---- | --------- | -------------------------------- |
| size      | `sm` \| `default` | X    | `default` | 28px / 32px (`select.tsx:30,34`) |
| className | `string`          | X    | —         | 폭을 바꿀 때만 쓴다              |
| children  | `React.ReactNode` | O    | —         | `SelectValue` 하나               |

**아래 화살표는 `SelectTrigger` 안에 박혀 있다** (`select.tsx:47-51`). 바꿀 수 없다.

### SelectContent

| 이름                 | 타입                                                                     | 필수 | 기본값       | 의미                                                  |
| -------------------- | ------------------------------------------------------------------------ | ---- | ------------ | ----------------------------------------------------- |
| side                 | `top` \| `bottom` \| `left` \| `right` \| `inline-start` \| `inline-end` | X    | **`bottom`** | 트리거의 어느 쪽에 뜨는가 (`select.tsx:59`)           |
| sideOffset           | `number`                                                                 | X    | **`4`**      | 트리거와의 간격 px (`select.tsx:60`)                  |
| align                | `start` \| `center` \| `end`                                             | X    | **`center`** | 그 축에서의 정렬 (`select.tsx:61`)                    |
| alignOffset          | `number`                                                                 | X    | **`0`**      | 정렬 축의 어긋남 px (`select.tsx:62`)                 |
| alignItemWithTrigger | `boolean`                                                                | X    | **`true`**   | 고른 항목을 트리거 위에 겹쳐 띄운다 (`select.tsx:63`) |
| children             | `React.ReactNode`                                                        | O    | —            | `SelectGroup` · `SelectItem` · `SelectSeparator`      |

**`alignItemWithTrigger={true}` 일 때 열고 닫는 움직임이 꺼진다** —
`data-[align-trigger=true]:animate-none` (`select.tsx:84`). 목록이 트리거 위에 겹쳐 나타나므로
미끄러져 들어올 자리가 없다.

### SelectValue · SelectItem · 그 밖

| export            | 값                                                                                                              | 소스 줄                  |
| ----------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `SelectValue`     | `flex flex-1 text-left`. 값이 없으면 `data-placeholder` 로 fg=`--muted-foreground`                              | `select.tsx:22`          |
| `SelectContent`   | `rounded-lg` · bg=`--popover` · fg=`--popover-foreground` · `shadow-md` · `ring-1` · `min-w-36`(144px) · `z-50` | `select.tsx:84`          |
| `SelectGroup`     | `scroll-my-1 p-1`                                                                                               | `select.tsx:12`          |
| `SelectLabel`     | `px-1.5 py-1 text-xs` · fg=`--muted-foreground`                                                                 | `select.tsx:105`         |
| `SelectItem`      | `rounded-md` · `py-1 pr-8 pl-1.5` · `text-sm` · 체크 표시는 오른쪽 `right-2`                                    | `select.tsx:120,130`     |
| `SelectSeparator` | `-mx-1 my-1 h-px` · bg=`--border`                                                                               | `select.tsx:146`         |
| 스크롤 단추       | `py-1` · bg=`--popover` · 아이콘 16px                                                                           | `select.tsx:160`, `:178` |

**세 값이 [`../tokens.md`](../tokens.md) 와 어긋난다. 섞지 말고 하나를 고른다.**

| 어긋나는 값                                                                         | `../tokens.md` 가 정한 것       | 어느 쪽을 쓰나                                                                                                                                                                  |
| ----------------------------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `px-1.5`(6px) — `SelectLabel` (`select.tsx:105`), `SelectItem` 의 `pl-1.5` (`:120`) | 간격 12단계에 `1.5` 스텝이 없다 | **`px-2`(8px)로 올린다.** 이유: 12단계 밖의 값이 하나 들어오면 스케일 밖 값이 맞는지 판정할 기준이 사라진다. 8px 은 실측 17건짜리 단계다                                        |
| `shadow-md` (`select.tsx:84`)                                                       | `## 고도` 절 — "쓰지 않는다"    | **그대로 둔다.** 같은 절이 되돌릴 조건을 "화면 위에 떠서 아래를 가리는 요소가 생길 때" 로 적었고 목록이 그 조건이다. 판단의 근거는 [`Popover.md`](Popover.md) 의 같은 표에 있다 |
| `duration-100` (`select.tsx:84`)                                                    | `duration-150` (실측 9건)       | **`duration-150`.** 이유: 모션 값이 `--ease-out` 하나로 못박혀 있는데 시간만 두 값이면 어느 것이 의도인지 판정할 수 없다                                                        |

**고칠 위치:** 이 표와 `../../src/ui/select.tsx` 의 해당 줄.

**`--popover` · `--popover-foreground` · `--input` 은 [`../tokens.md`](../tokens.md) 의 색 표 14행에
없다.** 값은 `../../src/tokens.css:68-69,80`(라이트) · `:103-104,115`(다크)에 있다.
**새 토큰을 만들지 마라 — 이유:** 이미 CSS 에 있는 이름이다.

## states

| state         | 트리거         | 시각 변화                                                                                                                                                                                                                                                                                                                                                                     |
| ------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| default       | 닫힘           | 트리거: 면 투명(다크는 `--input` 알파 30%), 테두리 `--input`, `rounded-lg`, `h-8`, `pr-2 pl-2.5`, `text-sm`, 오른쪽에 16px 아래 화살표. 목록은 DOM 에 없다 (`select.tsx:41,71`)                                                                                                                                                                                               |
| hover         | 포인터 진입    | **다크에서만 있다** — `dark:hover:bg-input/50` (`select.tsx:41`). 라이트에는 `hover:` 가 0건이다. **라이트에도 같은 hover 를 넣거나 다크의 것을 빼라. 이유:** 테마에 따라 상호작용 신호가 있다가 없으면 "누를 수 있다" 를 색으로 배울 수 없다. **권고: 둘 다 뺀다** — [`Input.md`](Input.md) 와 [`Textarea.md`](Textarea.md) 가 hover 0건이고, 폼 5종의 신호를 한 벌로 맞춘다 |
| focus-visible | 키보드 포커스  | 트리거: `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50` (`select.tsx:41`). 목록 안에서는 화살표 키로 옮기는 항목이 `focus:bg-accent focus:text-accent-foreground` 를 받는다 (`select.tsx:120`)                                                                                                                                                    |
| pressed       | 없다           | `active:` 가 0건이다. 누르면 목록이 열리고 그 사실이 목록 자체로 드러난다                                                                                                                                                                                                                                                                                                     |
| disabled      | `disabled`     | 트리거 `disabled:cursor-not-allowed disabled:opacity-50` (`select.tsx:41`). 항목 `data-disabled:pointer-events-none data-disabled:opacity-50` (`select.tsx:120`). 대비 하한 **3:1**(WCAG 1.4.11)                                                                                                                                                                              |
| loading       | 없다           | 스스로 데이터를 불러오지 않는다. 목록을 비동기로 받아야 하면 받을 때까지 트리거에 `disabled` 를 주고 `SelectValue` 의 `placeholder` 로 상태를 말한다 — **목록 안에 스피너를 넣지 마라. 이유:** 열어야만 보이는 표시는 기다리는 사람에게 닿지 않는다                                                                                                                           |
| empty         | 항목 0개       | **받은 소스에 빈 목록 표시가 없다.** `SelectContent` 가 빈 상자로 뜬다. **항목이 0개면 트리거에 `disabled` 를 주고 목록을 열지 마라 — 이유:** 열어서 아무것도 없는 것을 보여 주는 것보다 열 수 없다는 것을 먼저 아는 편이 짧다                                                                                                                                                |
| error         | `aria-invalid` | 트리거 `aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20`. 다크는 테두리가 `--destructive` 알파 50%, 링이 알파 40% 다 (`select.tsx:41`)                                                                                                                                                                                                   |

**항목의 강조에 `focus:` 를 쓴다** (`select.tsx:120`). [`../tokens.md`](../tokens.md) 는
"`focus:` 를 쓰지 말고 `focus-visible:` 만 쓴다" 를 실측 0건으로 정했다.
**여기서는 `focus:` 를 그대로 둔다.**
**이유:** 그 금지의 근거가 "마우스로 누른 뒤에도 링이 남아 소음이 된다" 인데, 목록 항목의 포커스는
화살표 키가 옮기는 것이고 누른 순간 목록이 닫혀 링이 남을 시간이 없다. 여기서 `focus-visible:` 을
쓰면 키보드로 옮긴 항목에도 강조가 붙지 않는 브라우저가 생긴다.
**[`../tokens.md`](../tokens.md) 의 그 규칙에 이 예외를 적어야 한다** — 그 작업은 이 문서의 범위가 아니다.

**트리거의 `transition-colors` 에 `motion-reduce:transition-none` · `duration-150` · `ease-out` 이
빠져 있다** (`select.tsx:41`). **같은 줄에 넣는다. 이유:** [`../tokens.md`](../tokens.md) 가 그 셋을
실측 8·9·9건으로 정했고, 값이 없으면 브라우저 기본값이 쓰여 같은 화면의 다른 요소와 속도가 갈린다.
**고칠 위치:** `../../src/ui/select.tsx:41`.

## a11y

- a11y:label — `<label htmlFor>` 가 **필수**다. **`SelectValue` 의 `placeholder` 로 대신하지 마라 — 이유:** 값을 고르면 사라져, 무엇을 고르는 칸인지 다시 확인할 수 없다. 항목을 묶을 때는 `SelectGroup` + `SelectLabel` 을 쓴다 — Base UI 가 `aria-labelledby` 로 묶는다. `SelectLabel` 을 `SelectGroup` 밖에 놓지 마라 — 이유: 묶임이 끊겨 항목처럼 읽힌다. 체크 표시(`CheckIcon`)는 장식이므로 `aria-hidden` 이다 — 고른 항목은 `aria-selected` 가 이미 말한다
- a11y:focus — 닫혔을 때 포커스 대상은 트리거 1개다. 열리면 포커스가 목록으로 들어가고 고른 항목에 선다. 화살표 키로 옮기고 Enter·Space 로 고르며 Esc 로 닫는다. 글자를 치면 그 글자로 시작하는 항목으로 뛴다 — Base UI 가 처리한다. 닫히면 포커스가 트리거로 돌아간다. **트리거의 포커스 표시는 `focus-visible:ring-3` 이고 [`../tokens.md`](../tokens.md) 의 네 조각과 다르다. 폼 5종은 `ring-3` 한 벌로 통일한다** — 판단의 근거는 [`Checkbox.md`](Checkbox.md) 의 a11y:focus 에 있다
- a11y:contrast — 트리거 글자 fg=`--foreground` / bg=`--background` 라이트 15.82 · 다크 16.13, 값이 없을 때 fg=`--muted-foreground` / bg=`--background` 라이트 5.28 · 다크 7.97. 목록은 `--popover` 가 `--card` 와 같은 값이라(`../../src/tokens.css:68-69` 라이트 · `:103-104` 다크) 카드 실측값이 그대로 적용된다 — 항목 글자 fg=`--popover-foreground` / bg=`--popover` 라이트 16.73 · 다크 14.84, `SelectLabel` fg=`--muted-foreground` / bg=`--popover` 라이트 5.59 · 다크 7.34. 전부 4.5:1 통과 ([`../tokens.md`](../tokens.md) `## 대비 검증` 실측값). **강조된 항목의 fg=`--accent-foreground` / bg=`--accent` 쌍은 미측정이다** — 구현 뒤 렌더 화면에서 `getComputedStyle` 로 재서 [`../tokens.md`](../tokens.md) 에 한 줄을 추가한다. 테두리 `--input` 과 오류 테두리 `--destructive` 도 미측정이고 하한은 **3:1**(WCAG 1.4.11)이다
- a11y:target — 트리거 높이 `default` 32px · `sm` 28px. 둘 다 24x24 최소를 넘는다. **`size="sm"` 을 `Input` 옆에 쓰지 마라 — 이유:** `Input` 이 32px 이라 밑선이 4px 어긋난다. 목록 항목의 높이는 글자 14px + `py-1`(4px x2) = **22px 로 24px 최소에 못 미친다.** **`py-1.5`(6px x2)로 올려 26px 로 만든다. 이유:** 24x24 는 포인터로 누르는 모든 대상에 걸리고, 목록 항목은 마우스로도 누른다. **고칠 위치:** `../../src/ui/select.tsx:120`
- a11y:role — 트리거는 `combobox`, 목록은 `listbox`, 항목은 `option` 이다. Base UI 가 붙이고 `aria-expanded` · `aria-selected` 를 관리한다. **`role` 을 덮어쓰지 마라. 이유:** `menu`/`menuitem` 으로 바꾸면 "고르면 값이 남는다" 가 아니라 "누르면 행동이 실행된다" 로 읽힌다. **`<select>` 로 바꾸지 마라 — 이유:** 항목에 아이콘·묶음 라벨·구분선을 넣을 수 없고, 이 컴포넌트는 셋 다 갖는다

## responsive

- 브레이크포인트 분기가 **0건**이다. `select.tsx` 전체에 `sm:`·`md:` 가 없다
- 트리거 폭이 `w-fit` 이다 (`select.tsx:41`). **내용에 따라 폭이 변한다** — 값을 고를 때마다 트리거가 늘었다 줄었다 한다. **폼 안에서는 `className="w-full"` 을 준다. 이유:** 옆의 `Input` 이 `w-full` 이라(`input.tsx:11`) 폭이 들쭉날쭉하면 같은 폼의 필드가 서로 다른 것으로 읽힌다
- 목록 폭은 `w-(--anchor-width)` 로 **트리거 폭을 따라간다** (`select.tsx:84`). 하한이 `min-w-36`(144px)이다. 트리거가 좁아도 목록은 144px 아래로 내려가지 않는다
- 목록 높이는 `max-h-(--available-height)` 로 **화면에 남은 높이를 따라간다** (`select.tsx:84`). 넘치면 목록 안에서 세로 스크롤되고 위아래에 스크롤 단추가 뜬다 (`select.tsx:89,91`). **`max-h-*` 를 직접 주지 마라 — 이유:** 두 값이 겹치면 화면 아래에 닿았을 때 어느 쪽이 이기는지 화면에서만 드러난다
- 항목 글자가 `whitespace-nowrap` 이다 (`select.tsx:125`). 긴 항목은 줄바꿈하지 않고 잘린다. **375px 에서 화면 좌우 여백을 뺀 335px 안에 끝나는 길이로 항목 글자를 쓴다**
- `lg` 이상 브레이크포인트를 넣지 마라. **이유:** 폭이 트리거를 따라가므로 분기를 늘려도 화면이 달라지지 않는다

## 상호작용

- 트리거 — focus-visible / disabled / error. hover 는 위 `## states` 의 판단대로 뺀다
- 항목 — `focus:` 강조 / disabled. 키보드는 화살표 · Enter · Space · Esc · 글자 뛰기
