# component: Table

purpose: 행과 열이 있는 값을 격자로 늘어놓는다. 읽는 글 안의 표는 `Prose` 가 맡는다

## 근거 — shadcn base-nova 에서 받았다

### 1. 출처

| 항목      | 값                                                                    |
| --------- | --------------------------------------------------------------------- |
| 받은 명령 | `pnpm dlx shadcn@4 add table`                                         |
| 스타일    | `base-nova`                                                           |
| 받은 날짜 | **2026-09-11**                                                        |
| 소스      | [`../../src/ui/table.tsx`](../../src/ui/table.tsx)                    |
| 기반      | **Base UI 프리미티브를 쓰지 않는다.** 순수 표 태그다 (`table.tsx:12`) |
| 아이콘    | 없다                                                                  |
| 지시어    | `"use client"` (`table.tsx:1`)                                        |

**export 8개** (`table.tsx:106-115`)

| export         | 태그                          | 소스 줄        |
| -------------- | ----------------------------- | -------------- |
| `Table`        | `<table>` (`<div>` 로 감싼다) | `table.tsx:6`  |
| `TableHeader`  | `<thead>`                     | `table.tsx:21` |
| `TableBody`    | `<tbody>`                     | `table.tsx:31` |
| `TableFooter`  | `<tfoot>`                     | `table.tsx:41` |
| `TableRow`     | `<tr>`                        | `table.tsx:54` |
| `TableHead`    | `<th>`                        | `table.tsx:67` |
| `TableCell`    | `<td>`                        | `table.tsx:80` |
| `TableCaption` | `<caption>`                   | `table.tsx:93` |

**`Table` 만 자기 태그를 감싼다.** `<div data-slot="table-container" className="relative w-full
overflow-x-auto">` 가 `<table>` 을 두른다 (`table.tsx:8-11`). 그 `<div>` 는 export 되지 않는다 —
**가로 스크롤을 끌 수 없다.**

**variant 축이 없다. size 축도 없다.** `table.tsx` 에 `cva` 가 없다.

### 2. handwork 사용처: 0곳

handwork 화면 어디에도 쓰인 적이 없다. **기존 9종의 `## 근거` 에 있는 `파일:줄` 실측이 이 문서에는
없다.** 값의 출처는 위의 받은 소스 하나다.

### 3. 왜 20종에 들어가는가

**데이터 묶음을 덮는다.** 네 묶음 중 데이터는 이 하나이고, 행과 열을 가진 값을 늘어놓는
자리를 맡는다.

## props

여덟 조각 전부 대응하는 DOM 태그의 속성을 그대로 받는다. 고유 prop 이 **0개**다.

| export         | 타입                              | 쓰는 값                               |
| -------------- | --------------------------------- | ------------------------------------- |
| `Table`        | `React.ComponentProps<"table">`   | `className` · `<table>` 속성          |
| `TableHeader`  | `React.ComponentProps<"thead">`   | `className` · `<thead>` 속성          |
| `TableBody`    | `React.ComponentProps<"tbody">`   | `className` · `<tbody>` 속성          |
| `TableFooter`  | `React.ComponentProps<"tfoot">`   | `className` · `<tfoot>` 속성          |
| `TableRow`     | `React.ComponentProps<"tr">`      | `className` · `data-state="selected"` |
| `TableHead`    | `React.ComponentProps<"th">`      | `className` · `scope` · `colSpan`     |
| `TableCell`    | `React.ComponentProps<"td">`      | `className` · `colSpan` · `rowSpan`   |
| `TableCaption` | `React.ComponentProps<"caption">` | `className`                           |

**`data` prop(배열을 넘기면 행을 그려 주는 것)을 두지 마라.**
**이유:** 열마다 무엇을 어떻게 보일지가 다르고, 그것을 prop 으로 받으려면 렌더 함수의 배열이
필요해진다. 조각을 조합해 쓰는 편이 짧다.

**정렬·선택·페이지 넘김 기능을 넣지 마라.**
**이유:** 받은 소스에 없다. `TableRow` 의 `data-[state=selected]` (`table.tsx:59`)는 **선택된 행의
면 색만** 정하고, 무엇이 선택됐는지는 부르는 쪽이 관리한다.

### 조각별 값

| export         | 값                                                                                                 | 소스 줄         |
| -------------- | -------------------------------------------------------------------------------------------------- | --------------- |
| 감싸는 `<div>` | `relative w-full overflow-x-auto`                                                                  | `table.tsx:10`  |
| `Table`        | `w-full caption-bottom text-sm`                                                                    | `table.tsx:14`  |
| `TableHeader`  | 안의 모든 `<tr>` 에 아래 테두리                                                                    | `table.tsx:25`  |
| `TableBody`    | 마지막 `<tr>` 의 테두리를 지운다                                                                   | `table.tsx:35`  |
| `TableFooter`  | 위 테두리 · bg=`--muted` 알파 50% · `font-medium`                                                  | `table.tsx:46`  |
| `TableRow`     | 아래 테두리 · `transition-colors` · hover bg=`--muted` 알파 50% · 선택 bg=`--muted`                | `table.tsx:59`  |
| `TableHead`    | `h-10`(40px) · `px-2`(8px) · `text-left` · `font-medium` · `whitespace-nowrap` · fg=`--foreground` | `table.tsx:72`  |
| `TableCell`    | `p-2`(8px) · `align-middle` · `whitespace-nowrap`                                                  | `table.tsx:85`  |
| `TableCaption` | `mt-4` · `text-sm` · fg=`--muted-foreground`                                                       | `table.tsx:100` |

**`TableCaption` 은 표 아래에 온다.** `caption-bottom` (`table.tsx:14`)이 그렇게 정한다. DOM 상
`<caption>` 은 `<table>` 의 첫 자식이어야 하지만 화면에서는 아래에 그려진다. **DOM 순서를 바꾸지
마라 — 이유:** 브라우저가 `<caption>` 을 첫 자식이 아닌 자리에서 무시한다.

**체크박스가 든 칸은 오른쪽 여백이 0 이 된다** — `[&:has([role=checkbox])]:pr-0`
(`table.tsx:72`, `:85`). [`Checkbox.md`](Checkbox.md) 의 클릭 영역이 상자 바깥 12px 을 이미
가져가므로 여백을 겹쳐 두지 않으려는 값이다.

**`--muted` 알파 50% 가 두 자리에 쓰인다** (`table.tsx:46`, `:59`). [`../tokens.md`](../tokens.md) 의
색 표에 알파 단계가 없다. **새 토큰을 만들지 마라 — 이유:** 알파는 토큰이 아니라 토큰에 얹는
값이고, [`Button.md`](Button.md) 가 `--primary/90` 에 대해 이미 같은 방식을 쓴다.

## states

| state         | 트리거             | 시각 변화                                                                                                                                                                                                                                          |
| ------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| default       | —                  | 표 `w-full`, 글자 `text-sm`. 머리 행 높이 40px 에 `font-medium`, 본문 칸 여백 8px. 행마다 아래 테두리 `--border`, 본문 마지막 행만 없다 (`table.tsx:14,25,35,72,85`)                                                                               |
| hover         | 포인터가 행에 진입 | bg → `--muted` 알파 50% (`table.tsx:59`). **머리 행에도 걸린다** — `TableHeader` 안의 `<tr>` 도 `TableRow` 다. **머리 행에는 `hover:bg-transparent` 를 주어 끈다. 이유:** 머리 행은 누를 수 있는 것이 아닌데 hover 면이 뜨면 누를 수 있다고 읽힌다 |
| focus-visible | 없다               | 행도 칸도 포커스를 받지 않는다. **행 전체를 누를 수 있게 만들지 마라 — 이유:** `<tr>` 에 `onClick` 을 걸면 키보드로 닿을 수 없다. 누를 것이 있으면 칸 안에 `AppLink` 나 `Button` 을 넣고 그것이 포커스를 받는다                                    |
| pressed       | 없다               | `active:` 가 0건이다. 누름은 칸 안의 `Button` 이 갖는다                                                                                                                                                                                            |
| disabled      | 없다               | 표에 비활성 개념이 없다. 칸 안의 `Button` · `Checkbox` 는 각자 `disabled` 를 갖는다                                                                                                                                                                |
| loading       | 없다               | 스스로 데이터를 불러오지 않는다. 불러오는 중에는 **행 수만큼 `Skeleton` 을 놓는다** — `TableCell` 안에 `<Skeleton className="h-4 w-full" />` 을 넣는다. 이유: 표 전체를 비우면 머리 행까지 사라져 무엇을 기다리는지 읽을 수 없다                   |
| empty         | 행 0개             | **받은 소스에 빈 표 표시가 없다.** 머리 행만 남고 아래가 빈 상자가 된다. **`<TableRow><TableCell colSpan={열 수}>` 한 행을 넣고 그 안에 한 문장을 쓴다. 이유:** `colSpan` 없이 넣으면 글자가 첫 열 폭에 갇혀 줄바꿈된다                            |
| error         | 없다               | 표가 에러 상태를 갖지 않는다. 불러오기가 실패하면 표를 렌더하지 말고 그 자리에 `Alert variant="destructive"` 를 놓는다 — 이유: 머리 행만 남은 표는 값이 0개인 것과 구분되지 않는다                                                                 |

**`TableRow` 의 `transition-colors` 에 `motion-reduce:transition-none` · `duration-150` · `ease-out`
이 빠져 있다** (`table.tsx:59`). [`../tokens.md`](../tokens.md) 가 그 셋을 실측 8·9·9건으로 정했다.
**같은 줄에 넣는다. 이유:** 값이 없으면 브라우저 기본값이 쓰여 같은 화면의 다른 요소와 속도가 갈리고,
행이 많은 표에서는 여러 행을 빠르게 지날 때 그 차이가 드러난다.
**고칠 위치:** `../../src/ui/table.tsx:59`.

**행 hover 가 [`../tokens.md`](../tokens.md) 의 실측 3종과 다르다.** 그 문서의 hover 표는
링크(fg→`--ring`) · 면(bg→`--accent`) · 아이콘 버튼(bg→`--accent`, fg→`--accent-foreground`) 셋을
적었고, 행의 `--muted` 알파 50% 는 그중에 없다.
**`--muted` 알파 50% 를 그대로 둔다.**
**이유:** `--accent` 는 `--muted` 와 같은 값인데(`../../src/tokens.css:74,76` 라이트 ·
`:109,111` 다크) 알파 없이 쓰면 행 면이 칩·코드 블록과 같은 무게가 된다. 표에서는 행이 수십 개라
같은 세기의 면이 반복되면 격자가 읽히지 않는다.
**[`../tokens.md`](../tokens.md) 의 hover 표에 네 번째 행을 적어야 한다** — 그 작업은 이 문서의
범위가 아니다.

## a11y

- a11y:label — `TableCaption` 이 **필수**다. 표가 무엇의 표인지 말한다. **빼고 위에 `<h2>` 로 대신하지 마라 — 이유:** 제목과 표의 묶임이 DOM 에 남지 않아, 스크린리더로 표만 골라 훑을 때 이름 없는 표가 된다. 머리 칸은 `TableHead`(`<th>`)를 쓰고 `scope="col"` 을 준다 — 세로 머리면 `scope="row"` 다. **머리 칸을 `TableCell`(`<td>`)로 만들지 마라 — 이유:** 칸을 읽을 때 어느 열의 값인지가 함께 읽히지 않는다
- a11y:focus — 표 자체는 포커스를 받지 않는다. **가로로 스크롤되는 표는 포커스를 받아야 한다** — 감싼 `<div>` 에 `tabIndex={0}` 과 `role="region"` 과 `aria-label` 을 준다. 이유: 마우스 없이는 가로 스크롤을 움직일 수 없다. 받은 소스의 `<div>` 에는 셋 다 없다 (`table.tsx:8-11`). **고칠 위치:** `../../src/ui/table.tsx:8-11`. 칸 안의 `AppLink` · `Button` 은 각자 자기 포커스 표시를 갖고, 순서는 행 왼쪽에서 오른쪽·위에서 아래다
- a11y:contrast — 본문 글자 fg=`--foreground` / bg=`--background` 라이트 15.82 · 다크 16.13, 머리 글자도 같은 쌍이다 (`table.tsx:72` 가 `text-foreground` 를 명시한다). `TableCaption` fg=`--muted-foreground` / bg=`--background` 라이트 5.28 · 다크 7.97. 전부 4.5:1 통과 ([`../tokens.md`](../tokens.md) `## 대비 검증` 실측값). **hover·선택·바닥 행의 bg=`--muted` 알파 50% 위 글자 쌍은 미측정이다** — 알파가 얹힌 색은 배경에 따라 달라져 고정 쌍으로 계산되지 않는다. 구현 뒤 렌더 화면에서 `getComputedStyle` 로 재서 [`../tokens.md`](../tokens.md) 에 한 줄을 추가한다. 행을 가르는 테두리 `--border` 는 면 구분이라 글자 기준을 적용하지 않는다
- a11y:target — 칸 자체는 클릭 대상이 아니라 24x24 규칙이 걸리지 않는다. 머리 칸 높이가 40px, 본문 칸이 글자 14px + `p-2`(8px x2) = **30px** 이다. 칸 안에 `Button` 을 넣으면 `size="icon-sm"`(32x32)까지만 들어간다 — `size="icon"`(40x40)은 행 높이를 40px 로 밀어 다른 행과 어긋난다. 같은 행에 버튼 둘을 놓을 때 `gap-2`(8px) 이상을 둔다. [`Checkbox.md`](Checkbox.md) 의 클릭 영역이 40x32 라 칸 하나를 거의 채운다 — **체크박스 열의 폭을 40px 아래로 줄이지 마라**
- a11y:role — `table` · `rowgroup` · `row` · `columnheader` · `cell` 이 전부 암묵 역할이다. **`role` 을 지정하지 마라. 이유:** 태그가 이미 맞다. **`<div>` 로 표를 만들지 마라 — 이유:** 역할 여덟 개를 손으로 붙여야 하고 하나만 빠져도 스크린리더의 표 읽기 방식이 통째로 꺼진다. 정렬 가능한 열은 `TableHead` 에 `aria-sort` 를 준다 — 정렬 기능을 넣을 때 함께 적는다

## responsive

- 브레이크포인트 분기가 **0건**이다. `table.tsx` 전체에 `sm:`·`md:` 가 없다
- **좁은 화면의 대응은 가로 스크롤 하나다.** 감싼 `<div>` 가 `overflow-x-auto` 다 (`table.tsx:10`). 표는 `w-full` 이지만 칸의 `whitespace-nowrap` (`table.tsx:72`, `:85`)이 줄바꿈을 막아, 내용이 넓으면 표가 컨테이너를 넘고 그 `<div>` 안에서만 가로로 스크롤된다. **바깥 페이지는 가로로 스크롤되지 않는다** — 그것이 이 `<div>` 의 목적이다
- **`overflow-x-auto` 를 끄지 마라. 이유:** 끄는 순간 표가 페이지를 밀어 375px 화면 전체가 가로로 움직인다
- **`whitespace-nowrap` 을 지우고 줄바꿈으로 좁히려 하지 마라. 이유:** 열 폭이 내용에 따라 제각각 달라져 행끼리 값이 세로로 맞지 않는다. 표는 세로로 맞아야 훑을 수 있다
- 375px 에서 화면 좌우 여백(`px-5` 20px x2)을 빼면 **표에 쓸 수 있는 폭이 335px** 이다. 칸 여백 8px x2 를 빼면 4열짜리 표에서 한 열이 평균 76px 이다. **열이 다섯을 넘으면 375px 에서 반드시 가로 스크롤이 생긴다** — 그것을 전제로 열 순서를 정한다. 가장 중요한 열을 왼쪽에 둔다
- 가로 스크롤되는 표에 위 a11y:focus 대로 `tabIndex={0}` · `role="region"` · `aria-label` 을 준다
- `lg` 이상 브레이크포인트를 넣지 마라. **이유:** 페이지 폭이 `max-w-5xl`(1024px)에서 멈춘다

## 상호작용

- 행 hover 하나뿐이다. focus-visible · pressed · disabled 는 칸 안의 요소가 갖는다
- 가로 스크롤은 감싼 `<div>` 가 맡는다
