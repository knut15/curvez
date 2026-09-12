# component: Alert

purpose: 화면 흐름을 끊지 않고 한 자리에서 알림을 전한다. 화면을 막고 답을 받아야 하면 `Dialog` 를 쓴다

## 근거 — shadcn base-nova 에서 받았다

### 1. 출처

| 항목      | 값                                                                                |
| --------- | --------------------------------------------------------------------------------- |
| 받은 명령 | `pnpm dlx shadcn@4 add alert`                                                     |
| 스타일    | `base-nova`                                                                       |
| 받은 날짜 | **2026-09-11**                                                                    |
| 소스      | [`../../src/ui/alert.tsx`](../../src/ui/alert.tsx)                                |
| 기반      | Base UI 프리미티브를 쓰지 않는다. `<div role="alert">` 하나다 (`alert.tsx:27-29`) |
| 아이콘    | 자체 아이콘이 없다. 부르는 쪽이 넣는다                                            |

**export 4개** (`alert.tsx:75`)

| export             | 태그    | 소스 줄        |
| ------------------ | ------- | -------------- |
| `Alert`            | `<div>` | `alert.tsx:21` |
| `AlertTitle`       | `<div>` | `alert.tsx:36` |
| `AlertDescription` | `<div>` | `alert.tsx:49` |
| `AlertAction`      | `<div>` | `alert.tsx:65` |

**variant 2종** — `default` · `destructive` (`alert.tsx:9-13`). 기본값 `default` (`alert.tsx:16`).
**size 축이 없다.** `cva` 정의(`alert.tsx:7-18`)에 `size` 키가 없다.

### 2. handwork 사용처: 0곳

handwork 화면 어디에도 쓰인 적이 없다. **기존 9종의 `## 근거` 에 있는 `파일:줄` 이 이 문서에는
없다.** 값의 출처는 위의 받은 소스 하나다.

### 3. 왜 20종에 들어가는가

**피드백 묶음을 덮는다.** 폼 · 오버레이 · 피드백 · 데이터 네 묶음 중 피드백이 `Alert` 와
`Skeleton` 둘이고, 그중 결과를 글로 말하는 쪽이 `Alert` 다.

## props

### Alert

| 이름      | 타입                          | 필수 | 기본값    | 의미                                       |
| --------- | ----------------------------- | ---- | --------- | ------------------------------------------ |
| variant   | `default` \| `destructive`    | X    | `default` | 알림의 무게. 두 단계뿐이다                 |
| className | `string`                      | X    | —         | 바깥에서 자리를 앉힐 때만 쓴다             |
| children  | `React.ReactNode`             | O    | —         | `AlertTitle` · `AlertDescription` · 아이콘 |
| (그 밖)   | `React.ComponentProps<"div">` | X    | —         | `<div>` 의 속성을 그대로 받는다            |

**색을 직접 넘기는 prop(`color`, `tone`)을 두지 마라.**
**이유:** 부르는 쪽이 색을 고르면 [`../tokens.md`](../tokens.md) 에 남지 않는 값이 화면에 들어오고,
그 값이 검증된 것인지 판정할 근거가 사라진다.

### variant 별 값 (`alert.tsx:10-12`)

| variant       | 면       | 글자                | 설명 글자                |
| ------------- | -------- | ------------------- | ------------------------ |
| `default`     | `--card` | `--card-foreground` | `--muted-foreground`     |
| `destructive` | `--card` | `--destructive`     | `--destructive` 알파 90% |

**두 variant 의 배경이 같다.** `destructive` 도 `bg-card` 다 — 면이 아니라 글자 색으로만 가른다.

### 조각별 값

| export             | 값                                                                                | 소스 줄        |
| ------------------ | --------------------------------------------------------------------------------- | -------------- |
| `Alert`            | `rounded-lg` · `border` · `px-2.5 py-2` · `gap-0.5` · `text-sm` · `grid`          | `alert.tsx:6`  |
| `AlertTitle`       | `font-medium`. 아이콘이 있으면 2열로 밀린다(`group-has-[>svg]/alert:col-start-2`) | `alert.tsx:41` |
| `AlertDescription` | `text-sm` · fg=`--muted-foreground` · `text-balance`                              | `alert.tsx:57` |
| `AlertAction`      | `absolute top-2 right-2`                                                          | `alert.tsx:69` |

**아이콘은 `Alert` 의 직계 자식으로 넣는다.** `has-[>svg]:grid-cols-[auto_1fr]` (`alert.tsx:6`) 가
직계 `<svg>` 를 보고 격자를 1열에서 2열로 바꾼다. 크기를 지정하지 않은 아이콘은 16px 로 눌린다
(`*:[svg:not([class*='size-'])]:size-4`).

**`AlertAction` 을 넣으면 오른쪽에 72px 이 예약된다.** `has-data-[slot=alert-action]:pr-18`
(`alert.tsx:6`). 72px 은 [`../tokens.md`](../tokens.md) 의 간격 12단계 밖이다 — **그 값을 다른 곳에
복사하지 마라. 이유:** 스케일 밖의 값이 두 곳에 있으면 어느 쪽이 의도인지 판정할 수 없다.

**`AlertAction` 안에 `Button` 을 하나만 넣는다.**
**이유:** 예약된 폭이 72px 고정이라 두 개를 넣으면 제목 글자와 겹친다.

## states

| state         | 트리거            | 시각 변화                                                                                                                                                      |
| ------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| default       | —                 | `default`: bg=`--card`, 제목 fg=`--card-foreground`, 설명 fg=`--muted-foreground`. `destructive`: 같은 면에 제목·아이콘 fg=`--destructive`, 설명은 그 알파 90% |
| hover         | 없다              | 상호작용 요소가 아니다. `alert.tsx` 전체에 `hover:` 가 0건이다 — 유일한 예외가 `AlertTitle`·`AlertDescription` 안의 `<a>` 이고, 그 hover 는 링크의 것이다      |
| focus-visible | 없다              | 컨테이너가 포커스를 받지 않는다. `tabindex` 를 주지 마라 — 이유: 읽기만 하는 영역이 포커스 순서에 끼면 키보드 이동 횟수만 늘어난다                             |
| pressed       | 없다              | 누를 수 없다. 누를 것이 있으면 그것은 `AlertAction` 안의 `Button` 이고 눌림 상태는 그 컴포넌트가 갖는다                                                        |
| disabled      | 없다              | 비활성 개념이 없다. 표시 전용이다                                                                                                                              |
| loading       | 없다              | 스스로 데이터를 불러오지 않는다. 불러오는 중을 보여야 하면 `Alert` 자리에 `Skeleton` 을 놓는다                                                                 |
| empty         | 없다              | `children` 이 비면 `Alert` 를 렌더하지 마라 — 이유: 내용 없는 테두리 상자가 남아 무언가 실패한 것처럼 읽힌다. 조건부 렌더는 부르는 쪽이 한다                   |
| error         | **`destructive`** | variant 로 표현한다. 별도 상태가 아니다. 제목·아이콘이 `--destructive`, 설명이 그 알파 90% 다 (`alert.tsx:12`)                                                 |

**전이를 넣지 마라.** `alert.tsx` 에 `transition-*` 이 0건이다.
**이유:** 상태가 바뀌지 않는 표시 요소다. 전이할 대상이 없는데 전이를 붙이면
[`../tokens.md`](../tokens.md) 의 `motion-reduce:transition-none` 짝 규칙까지 딸려 온다.

## a11y

- a11y:label — 컨테이너에 `aria-label` 을 붙이지 마라. **이유:** `role="alert"` 가 안의 글자를 그대로 읽는다. 라벨을 얹으면 보이는 글자와 읽히는 글자가 달라진다. 아이콘은 장식이므로 `aria-hidden` 을 붙인다 — 그 뜻은 옆의 `AlertTitle` 이 이미 말한다. `AlertAction` 안의 아이콘 버튼은 [`Button.md`](Button.md) 의 `a11y:label` 을 따라 `aria-label` 이 **필수**다
- a11y:focus — 포커스 대상은 0개 또는 1개다. 글만 있으면 0개, `AlertAction` 이 있으면 그 안의 버튼 1개다. 포커스 순서는 DOM 순서를 따르고, `AlertAction` 이 DOM 상 제목 뒤에 오므로 제목·설명을 읽은 뒤 버튼에 닿는다. **`AlertAction` 을 DOM 앞으로 옮겨 화면 오른쪽 위에 맞추려 하지 마라** — 이유: 시각 순서는 `absolute` 가 이미 맞췄고, DOM 을 앞으로 옮기면 읽기 순서만 뒤집힌다
- a11y:contrast — `default` 제목 fg=`--card-foreground` / bg=`--card` 라이트 16.73 · 다크 14.84, 설명 fg=`--muted-foreground` / bg=`--card` 라이트 5.59 · 다크 7.34 ([`../tokens.md`](../tokens.md) `## 대비 검증` 의 대비값, 4.5:1 통과). **`destructive` 의 fg=`--destructive` / bg=`--card` 쌍은 [`../tokens.md`](../tokens.md) 의 목록에 없다 — 미측정이다.** 구현 뒤 렌더 화면에서 `getComputedStyle` 로 재서 같은 형식으로 한 줄을 추가한다. 설명 글자의 알파 90% 는 배경에 따라 실제 색이 달라져 고정 쌍으로 계산되지 않는다 — 같은 문서가 다크 `--border` 에 대해 이미 같은 판단을 내렸다
- a11y:target — 컨테이너는 클릭 대상이 아니라 24x24 규칙이 걸리지 않는다. `AlertAction` 안의 버튼만 그 규칙을 받고, [`Button.md`](Button.md) 가 `size="icon-sm"` 을 32x32 로 정했다 — 24x24 를 넘는다
- a11y:role — `alert` 다. `alert.tsx:29` 가 하드코딩한다. **`role` 을 덮어쓰지 마라. 이유:** `role="alert"` 는 `aria-live="assertive"` 와 같아, 붙는 순간 스크린리더가 읽던 것을 끊고 이 글을 읽는다. 그 세기가 맞지 않는 알림이면 `Alert` 를 쓰지 말고 그냥 글로 쓴다. **이미 화면에 있는 `Alert` 의 글자를 나중에 바꾸지 마라** — 이유: 바뀔 때마다 다시 읽힌다

## responsive

- 컨테이너 폭이 `w-full` 이다 (`alert.tsx:6`). 폭은 부모가 정한다. **`Alert` 에 `max-w-*` 를 직접 걸지 마라 — 이유:** 페이지 폭은 [`PageShell.md`](PageShell.md) 가 정하고, 두 곳이 폭을 정하면 어느 값이 적용되는지 화면에서만 드러난다
- 브레이크포인트 분기는 **1건**이다 — `AlertDescription` 의 `md:text-pretty` (`alert.tsx:57`). 768px 미만은 `text-balance`(줄 길이를 고르게), 768px 이상은 `text-pretty`(고아 낱말만 막는다)
- 좌우 여백 `px-2.5`(10px) · 세로 여백 `py-2`(8px)가 모든 폭에서 같다. 375px 에서도 바뀌지 않는다
- 아이콘이 있으면 격자가 `auto_1fr` 2열이 되고 열 간격이 `gap-x-2`(8px)다 (`alert.tsx:6`). 좁은 폭에서 아이콘이 줄바꿈되지 않는다 — 아이콘 열이 `auto` 라 16px 을 먼저 가져간다
- `AlertAction` 이 있을 때 오른쪽 72px 이 예약되므로, **375px 화면에서 제목에 쓸 수 있는 폭은 375 - 40(화면 좌우 `px-5` 두 번) - 20(`px-2.5` 두 번) - 72 = 243px 이다.** 제목을 그 안에 끝나는 길이로 쓴다

## 상호작용

- 없다. hover / focus-visible / active 대상이 아니다
- 유일한 상호작용은 `AlertAction` 안의 `Button` 과 본문 안의 `<a>` 이고, 둘 다 자기 규칙을 따른다
