# component: Menu

purpose: 세로로 선 이동 목록 하나. 묶음마다 소제목을 얹고 지금 열려 있는 항목을 면으로 표시한다

## 근거 — 문서 사이트 왼쪽 목록을 그대로 뽑았다

### 1. 출처

**이 18종 가운데 화면 근거가 있는 유일한 것이다.** daisyUI 나 shadcn/ui 에서 옮긴 것이 아니라,
scopulus-ui 문서 사이트가 실제로 쓰고 있는 목록을 라이브러리로 뽑았다.

| 항목      | 값                                                                                                               |
| --------- | ---------------------------------------------------------------------------------------------------------------- |
| 뽑은 곳   | [`apps/scopulus-ui/src/widgets/components-nav.tsx`](../../../../apps/scopulus-ui/src/widgets/components-nav.tsx) |
| 사용처    | `apps/scopulus-ui/src/app/components/layout.tsx:35` — **1곳**                                                    |
| 확인 날짜 | **2026-09-12**                                                                                                   |
| 소스      | [`../../src/ui/menu.tsx`](../../src/ui/menu.tsx)                                                                 |

**export 2개**

| export       | 태그             | 맡는 것                                |
| ------------ | ---------------- | -------------------------------------- |
| `Menu`       | `<nav>` + `<ul>` | 묶음·항목·현재 표시                    |
| `MenuScroll` | `<div>`          | 옆에 고정하고 자기 안에서만 스크롤한다 |

### 2. 화면에서 그대로 가져온 값

| 값                                                                                              | 근거 줄                 |
| ----------------------------------------------------------------------------------------------- | ----------------------- |
| `aria-label` 이 붙은 `<nav>`                                                                    | `components-nav.tsx:41` |
| `sticky top-16 -mt-16 h-[calc(100vh-4rem)] w-52 shrink-0 self-start overflow-y-auto pt-16 pb-8` | `components-nav.tsx:51` |
| `[scrollbar-color:color-mix(in_oklch,var(--muted-foreground)_35%,transparent)_transparent]`     | `components-nav.tsx:51` |
| 묶음 사이 간격 `space-y-5`                                                                      | `components-nav.tsx:55` |
| 묶음 소제목 `px-2 text-xs font-bold tracking-wider uppercase`                                   | `components-nav.tsx:58` |
| `<ul role="list" className="mt-1.5">`                                                           | `components-nav.tsx:61` |
| `aria-current={active ? "page" : undefined}`                                                    | `components-nav.tsx:69` |
| 항목 `block rounded-md px-2 py-1 text-sm` + 전이 + 포커스 네 조각                               | `components-nav.tsx:73` |
| 현재 항목 `bg-accent font-medium text-accent-foreground`                                        | `components-nav.tsx:75` |
| 그 밖 `text-muted-foreground hover:bg-accent hover:text-accent-foreground`                      | `components-nav.tsx:76` |

재현: `grep -n 'sticky top-16\|rounded-md px-2 py-1' apps/scopulus-ui/src/widgets/components-nav.tsx` → 2줄.

### 3. 화면과 다르게 한 것

| 무엇        | 화면                               | 여기                   | 이유                                                                     |
| ----------- | ---------------------------------- | ---------------------- | ------------------------------------------------------------------------ |
| 현재 항목   | `usePathname()` 으로 스스로 읽는다 | `current` prop         | 라우터를 읽으면 Next 의 `usePathname` 에 묶여 다른 라우터에서 쓸 수 없다 |
| 고정·스크롤 | `<nav>` 하나가 다 한다             | `MenuScroll` 로 나눴다 | 목록이 높이를 가지면 어디에 붙일지를 목록이 정하게 된다                  |
| 좁은 화면   | `hidden lg:flex`                   | **없다**               | 숨길지는 이것을 쓰는 페이지가 정한다. 라이브러리가 정하면 되돌릴 수 없다 |
| 소제목      | `<p>Components</p>` 가 안에 있다   | **없다**               | `MenuScroll` 의 `children` 으로 `Menu` 옆에 둔다. 목록의 일부가 아니다   |

## props

### Menu

| 이름    | 타입          | 필수 | 기본값 | 의미                                                            |
| ------- | ------------- | ---- | ------ | --------------------------------------------------------------- |
| groups  | `MenuGroup[]` | O    | —      | 묶음 목록. 순서가 곧 화면 순서다                                |
| label   | `string`      | O    | —      | `<nav>` 의 이름                                                 |
| current | `string`      | X    | —      | 지금 열려 있는 주소. `href` 와 정확히 같은 항목 하나에만 붙는다 |

`MenuGroup` 은 `{ id: string; label?: string; items: { href: string; label: string }[] }` 다.
`label` 이 없는 묶음은 소제목 없이 항목만 나오고 위 여백 `mt-1.5` 도 붙지 않는다.

**`label` 이 필수인 이유:** 이름 없는 `<nav>` 가 한 화면에 둘이면 낭독기가 "탐색" 만 두 번
읽는다. 기본값을 두면 두 목록이 같은 이름을 갖게 되어 같은 문제로 돌아온다.

**`current` 는 부분 일치가 아니라 완전 일치다.** `/components` 를 넘겨도 `/components/badge`
항목은 켜지지 않는다. **이유:** 부분 일치를 쓰면 `/components` 항목과 `/components/badge` 항목이
동시에 켜지고, `aria-current="page"` 가 둘이 된다.

**`className` 을 받지 않는다.**
**이유:** 목록의 모양은 한 벌이다. 자리와 높이는 `MenuScroll` 이 갖고, 그 둘 말고 바깥에서
정할 것이 없다.

### MenuScroll

| 이름     | 타입              | 필수 | 기본값 | 의미                             |
| -------- | ----------------- | ---- | ------ | -------------------------------- |
| children | `React.ReactNode` | O    | —      | 보통 소제목 하나와 `Menu` 하나다 |

**값을 받지 않는다.** `top-16` · `-mt-16` · `pt-16` 은 **헤더 높이 64px 에 묶인 한 벌**이고
셋이 같은 값이라야 목록이 스크롤 0부터 움직이지 않는다. 셋 중 하나를 prop 으로 열면 나머지 둘과
어긋난 값이 들어올 수 있고, 어긋난 결과는 스크롤을 내려 봐야만 보인다.

**`w-52`(208px)는 고정이다.** 폭을 두지 않으면 열이 가장 긴 항목만큼 벌어져, 항목을 하나 더할
때마다 본문 시작 위치가 움직인다.

## states

`MenuScroll` 은 상태가 없다. 아래 여덟 줄은 `Menu` 의 항목 하나에 대한 것이다.

| state         | 트리거              | 시각 변화                                                                                                                      |
| ------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| default       | —                   | `block rounded-md px-2 py-1 text-sm`, fg=`--muted-foreground`, 면 없음. 묶음 소제목은 `text-xs font-bold uppercase`            |
| hover         | 포인터              | bg → `--accent`, fg → `--accent-foreground`. `transition-colors duration-150 ease-out` + `motion-reduce:transition-none`       |
| focus-visible | 키보드 이동         | `outline-2` + `outline-offset-2` + `outline-ring`. **`focus-visible:rounded-sm` 을 붙이지 않는다** — 이미 `rounded-md` 가 있다 |
| pressed       | 없다                | 누름 상태를 만들지 않는다. [`../tokens.md`](../tokens.md) 가 "링크에 눌림 상태를 만들지 마라" 로 정했다                        |
| disabled      | 없다                | 비활성 항목이라는 개념이 없다. 갈 수 없는 곳은 `items` 에 넣지 않는다                                                          |
| loading       | 없다                | 스스로 데이터를 불러오지 않는다. `groups` 는 부르는 쪽이 이미 갖고 있는 값이다                                                 |
| empty         | `groups` 가 빈 배열 | 이름만 있는 빈 `<nav>` 가 남는다. **빈 배열을 넘기지 마라** — 이유: 낭독기가 내용 없는 탐색 영역을 읽는다                      |
| error         | 없다                | 상태를 갖지 않아 실패할 동작이 없다                                                                                            |

**현재 항목(`aria-current="page"`)은 별도 state 가 아니라 default 의 한 갈래다.**
bg=`--accent`, fg=`--accent-foreground`, `font-medium` 이다. hover 와 같은 면을 쓴다 —
**이유:** 면을 하나 더 만들려면 색이 하나 더 필요하고, [`../tokens.md`](../tokens.md) 가
"강조색을 하나만 쓴다" 로 정했다. 둘을 가르는 것은 굵기(`font-medium`)와 속성이다.

## a11y

- a11y:label — `Menu` 의 `<nav>` 에 `aria-label={label}` 이 **언제나 붙는다**(필수 prop). 항목 글자가 그 자체로 링크 이름이므로 `aria-label` 로 덮지 마라 — 보이는 글자와 읽히는 글자가 달라진다. **묶음 소제목 `<p>` 와 `<ul>` 을 `aria-labelledby` 로 잇지 않는다** — 이유: 그러려면 DOM id 가 필요하고, 한 화면에 `Menu` 가 둘이면 같은 `groups[].id` 가 중복 id 를 만든다. 묶음 소제목은 `<ul>` 바로 앞에 오므로 읽는 순서가 이미 그 관계를 말한다. **`MenuScroll` 에는 이름을 붙이지 마라** — 그냥 `<div>` 다. 랜드마크는 안쪽 `<nav>` 하나여야 한다
- a11y:focus — 포커스 대상은 모든 `items` 의 합만큼이다. 문서 사이트 기준 20개 안팎이다. 순서는 DOM 순서 = 묶음 순서 안의 항목 순서다. `MenuScroll` 에 `tabindex` 를 주지 마라 — 이유: 스크롤되는 상자가 포커스를 받으면 목록을 지나칠 때 정거장이 하나 더 생긴다. 포커스가 화면 밖 항목으로 가면 브라우저가 `MenuScroll` 안에서 알아서 스크롤한다 — `overflow-y-auto` 가 그것을 만든다
- a11y:contrast — 기본 항목 fg=`--muted-foreground` / bg=`--background` 라이트 **5.28** · 다크 **7.97**, 묶음 소제목도 같은 쌍이다([`../tokens.md`](../tokens.md) `## 대비 검증`). **현재·hover 항목 fg=`--accent-foreground` / bg=`--accent` 쌍은 그 목록에 없다 — 미측정이다.** 같은 fg 를 쓰는 측정된 쌍이 라이트 15.82(`#14201E`/`#F7F9F8`)와 16.73(`#14201E`/`#FFFFFF`) 이고 `--accent`(`#EDF1F0`)가 그 두 배경 사이보다 어두우므로 라이트 값은 15.82 아래다. 다크도 같은 방식으로 14.84(`#E6EDEA`/`#141A18`) 아래다. **둘 다 4.5:1 을 크게 넘지만 이것은 계산한 상한이지 잰 값이 아니다.** 실제 값이 필요하면 렌더 화면에서 `getComputedStyle` 로 재서 [`../tokens.md`](../tokens.md) 에 한 줄을 추가한다 — 그 파일은 이 문서가 고칠 대상이 아니다
- a11y:target — 항목 하나의 높이는 `py-1`(4px 두 번) + `text-sm` 줄높이 20px = **28px** 이고 폭은 `w-52` 에서 `px-2` 를 뺀 **192px** 이다. 24x24 를 넘는다. `py-1` 을 더 줄이지 마라 — 24px 아래로 내려간다
- a11y:role — `Menu` 는 `navigation`(landmark)이다. `<nav>` 가 이미 그 역할을 가지므로 `role="navigation"` 을 손으로 붙이지 마라. **`<ul>` 에는 `role="list"` 를 붙인다**(`menu.tsx` 의 `<ul role="list">`, 화면에서는 `components-nav.tsx:61`) — 이유: Safari 는 `list-style:none` 이 걸린 목록에서 목록 의미를 떼어 낸다. Tailwind preflight 가 모든 `ul`·`ol` 에 그것을 걸므로 이 `<ul>` 이 그 조건에 들어간다. `MenuScroll` 의 `<div>` 에는 role 을 주지 마라

## responsive

- `Menu` 에 브레이크포인트 분기가 **0건**이다. 어느 폭에서나 같은 클래스다
- `MenuScroll` 에도 분기가 **0건**이다. 좁은 화면에서 숨기는 것은 이것을 쓰는 페이지가 한다 — 문서 사이트는 `components-nav.tsx:51` 에서 `hidden lg:flex` 로 그 일을 하고 있고, 그 값은 라이브러리로 가져오지 않았다
- `MenuScroll` 의 높이는 `h-[calc(100vh-4rem)]` 이다. 4rem 은 헤더 64px 이고 `top-16` · `-mt-16` · `pt-16` 과 같은 값이다. **헤더 높이를 바꾸면 네 곳을 함께 바꾼다**
- 폭 `w-52`(208px)는 모든 폭에서 같다. 긴 항목 이름은 그 안에서 줄을 바꾼다
- 목록이 화면 높이보다 길면 `MenuScroll` **안에서만** 스크롤된다. 페이지는 따로 스크롤된다

## 상호작용

- hover — 항목에 면이 깔린다(bg `--accent`, fg `--accent-foreground`). 이동·그림자 없음
- focus-visible — `outline-2 / outline-offset-2 / outline-ring` 세 조각. 반경은 항목이 이미 가진 `rounded-md` 다
- 클릭은 주소를 바꾼다. `next/link` 가 낸 `<a>` 이므로 새 탭 열기와 주소 복사가 살아 있다
- **`scroll` 을 끄지 마라.** 오른쪽 본문은 통째로 바뀌는 내용이라 누를 때마다 맨 위에서 시작해야 한다. 왼쪽 목록의 스크롤 위치는 이것과 무관하게 남는다 — `MenuScroll` 이 레이아웃 안에 있어 라우트가 바뀌어도 DOM 이 유지되기 때문이다
- `MenuScroll` 자체는 hover / focus 대상이 아니다. 스크롤만 한다
