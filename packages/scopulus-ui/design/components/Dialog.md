# component: Dialog

purpose: 화면을 덮고 답을 받을 때까지 뒤의 조작을 막는다. 흐름을 끊지 않는 알림은 `Alert`, 곁에 붙는 덧창은 `Popover` 가 맡는다

## 근거 — shadcn base-nova 에서 받았다

### 1. 출처

| 항목      | 값                                                            |
| --------- | ------------------------------------------------------------- |
| 받은 명령 | `pnpm dlx shadcn@4 add dialog`                                |
| 스타일    | `base-nova`                                                   |
| 받은 날짜 | **2026-09-11**                                                |
| 소스      | [`../../src/ui/dialog.tsx`](../../src/ui/dialog.tsx)          |
| 기반      | `@base-ui/react/dialog` (`dialog.tsx:2`). **Radix 가 아니다** |
| 아이콘    | `lucide-react` 의 `XIcon` (`dialog.tsx:6`, 쓰이는 자리 `:71`) |

**export 10개** (`dialog.tsx:146-157`)

| export              | 감싸는 Base UI 프리미티브     | 태그       | 소스 줄          |
| ------------------- | ----------------------------- | ---------- | ---------------- |
| `Dialog`            | `DialogPrimitive.Root`        | (없다)     | `dialog.tsx:8`   |
| `DialogTrigger`     | `DialogPrimitive.Trigger`     | `<button>` | `dialog.tsx:12`  |
| `DialogPortal`      | `DialogPrimitive.Portal`      | (없다)     | `dialog.tsx:16`  |
| `DialogClose`       | `DialogPrimitive.Close`       | `<button>` | `dialog.tsx:20`  |
| `DialogOverlay`     | `DialogPrimitive.Backdrop`    | `<div>`    | `dialog.tsx:24`  |
| `DialogContent`     | `DialogPrimitive.Popup`       | `<div>`    | `dialog.tsx:40`  |
| `DialogHeader`      | (없다 — 순수 `<div>`)         | `<div>`    | `dialog.tsx:80`  |
| `DialogFooter`      | (없다 — 순수 `<div>`)         | `<div>`    | `dialog.tsx:90`  |
| `DialogTitle`       | `DialogPrimitive.Title`       | `<h2>`     | `dialog.tsx:117` |
| `DialogDescription` | `DialogPrimitive.Description` | `<p>`      | `dialog.tsx:130` |

**variant 축이 없다. size 축도 없다.** `dialog.tsx` 에 `cva` 가 없다. 크기를 정하는 것은
`DialogContent` 의 `max-w-[calc(100%-2rem)] sm:max-w-sm` 하나다 (`dialog.tsx:54`).

### 2. handwork 사용처: 0곳

handwork 화면 어디에도 쓰인 적이 없다. **기존 9종의 `## 근거` 에 있는 `파일:줄` 실측이 이 문서에는
없다.** 값의 출처는 위의 받은 소스 하나다.

### 3. 왜 20종에 들어가는가

**오버레이 묶음을 덮는다.** 오버레이 3종(`Dialog` · `Tooltip` · `Popover`) 중 뒤를 막고
답을 받는 자리를 맡는다.

## `Button` 에 의존한다 — 20종 중 유일하다

`dialog.tsx:5` 가 `./button` 을 import 한다. 쓰는 자리가 둘이다.

| 자리                           | 쓰는 값                          | 소스 줄            |
| ------------------------------ | -------------------------------- | ------------------ |
| `DialogContent` 의 닫기 버튼   | `variant="ghost" size="icon-sm"` | `dialog.tsx:64-68` |
| `DialogFooter` 의 `Close` 버튼 | `variant="outline"`              | `dialog.tsx:109`   |

**그래서 [`Button.md`](Button.md) 의 `outline` 과 `icon-sm` 을 되살렸다.** 처음 뺀 근거는
"이 사이트에 버튼이 들어갈 자리가 둘뿐" 이었는데 라이브러리가 되면서 그 전제가 깨졌다.
`../../src/ui/button.tsx:13-16` 의 주석이 같은 사실을 적고 있다.

**`Button` 의 `outline` · `icon-sm` 을 다시 빼지 마라.**
**이유:** 빼는 순간 `Dialog` 가 타입 오류로 빌드에서 깨진다. 되살린 두 값의 유일한 사용처가 여기다.

**닫기 버튼에 `variant="default"` 를 쓰지 마라.**
**이유:** 채운 면이 되면 팝업 안에서 가장 무거운 요소가 닫기 버튼이 된다. 팝업의 주된 행동은
`DialogFooter` 에 들어가고, 그 자리가 `default` 를 쓸 자리다.

## props

### Dialog (루트)

| 이름         | 타입                      | 필수 | 기본값  | 의미                              |
| ------------ | ------------------------- | ---- | ------- | --------------------------------- |
| open         | `boolean`                 | X    | —       | 제어로 쓸 때의 열림 여부          |
| defaultOpen  | `boolean`                 | X    | `false` | 비제어로 쓸 때의 처음 값          |
| onOpenChange | `(open: boolean) => void` | X    | —       | 열고 닫힐 때                      |
| modal        | `boolean`                 | X    | `true`  | 뒤의 조작을 막는다                |
| children     | `React.ReactNode`         | O    | —       | `DialogTrigger` + `DialogContent` |

**`modal={false}` 를 쓰지 마라.**
**이유:** 뒤를 막지 않는 덧창은 `Popover` 가 맡는다. 같은 일을 두 컴포넌트가 하면 어느 것을 쓸지가
매번 판단 대상이 된다.

### DialogContent

| 이름            | 타입              | 필수 | 기본값     | 의미                                   |
| --------------- | ----------------- | ---- | ---------- | -------------------------------------- |
| showCloseButton | `boolean`         | X    | **`true`** | 오른쪽 위 X 버튼 (`dialog.tsx:43`)     |
| className       | `string`          | X    | —          | 폭을 바꿀 때만 쓴다                    |
| children        | `React.ReactNode` | O    | —          | `DialogHeader` · 본문 · `DialogFooter` |

### DialogFooter

| 이름            | 타입              | 필수 | 기본값      | 의미                                  |
| --------------- | ----------------- | ---- | ----------- | ------------------------------------- |
| showCloseButton | `boolean`         | X    | **`false`** | 바닥의 `Close` 버튼 (`dialog.tsx:92`) |
| children        | `React.ReactNode` | X    | —           | 주된 행동 버튼                        |

**두 `showCloseButton` 의 기본값이 반대다.** `DialogContent` 는 `true`, `DialogFooter` 는 `false` 다.
**둘을 동시에 켜지 마라.**
**이유:** 같은 팝업에 닫기 수단이 셋(X · Close · Esc)이 되어 어느 것이 주된 닫기인지 판정할 수 없다.

### 그 밖의 조각

| export              | 값                                                                                    | 소스 줄          |
| ------------------- | ------------------------------------------------------------------------------------- | ---------------- |
| `DialogOverlay`     | `fixed inset-0 z-50` · 검정 알파 10% · 배경 흐림 `backdrop-blur-xs`                   | `dialog.tsx:32`  |
| `DialogContent`     | `fixed` 가운데 · `z-50` · `rounded-xl` · bg=`--popover` · `p-4` · `gap-4` · `text-sm` | `dialog.tsx:54`  |
| `DialogHeader`      | `flex flex-col gap-2`                                                                 | `dialog.tsx:84`  |
| `DialogFooter`      | `-mx-4 -mb-4` · `border-t` · bg=`--muted` 알파 50% · `p-4` · `gap-2`                  | `dialog.tsx:102` |
| `DialogTitle`       | `font-heading text-base leading-none font-medium`                                     | `dialog.tsx:122` |
| `DialogDescription` | `text-sm` · fg=`--muted-foreground`                                                   | `dialog.tsx:138` |

**세 값이 [`../tokens.md`](../tokens.md) 와 어긋난다. 섞지 말고 하나를 고른다.**

| 어긋나는 값                     | `../tokens.md` 가 정한 것                                            | 어느 쪽을 쓰나                                                                                                                                                                |
| ------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rounded-xl` (`dialog.tsx:54`)  | 반경 3단계 — `rounded-lg` 10px · `rounded-md` 8px · `rounded-sm` 6px | **`rounded-lg`.** 이유: "한 화면에 둥근 버튼과 각진 카드가 섞이면 어느 쪽이 의도인지 판정할 수 없다". 팝업만 14px 을 쓸 근거가 없다                                           |
| `bg-black/10` (`dialog.tsx:32`) | 색 표 14행 어디에도 검정 리터럴이 없다                               | **`bg-foreground/10`.** 이유: 라이트의 `--foreground` 는 거의 검정이라 화면이 같고, 다크에서는 밝은 막이 되어 덮은 것이 보인다                                                |
| `text-base` (`dialog.tsx:122`)  | "본문에 `text-base` 를 붙이지 마라" (실측 0건)                       | **`text-base` 를 유지한다.** 이유: 그 금지는 본문 글자에 대한 것이고, 여기는 `<h2>` 제목이다. 타이포 8단계의 "본문" 16px 과 같은 크기를 제목이 쓰는 것은 팝업이 작기 때문이다 |

**고칠 위치:** 이 표와 `../../src/ui/dialog.tsx` 의 해당 줄.

## states

| state         | 트리거        | 시각 변화                                                                                                                                                                              |
| ------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| default       | 닫힘          | 아무것도 렌더되지 않는다. `DialogPortal` 이 열릴 때만 DOM 에 붙는다 (`dialog.tsx:49`)                                                                                                  |
| hover         | 포인터 진입   | 팝업 면에는 없다. **버튼 두 개만 hover 를 갖고 그 값은 [`Button.md`](Button.md) 가 정한다** — `ghost` 는 bg→`--accent`, `outline` 은 bg→`--accent` + fg→`--accent-foreground`          |
| focus-visible | 키보드 포커스 | 팝업 자체는 `outline-none` 이다 (`dialog.tsx:54`). 열릴 때 포커스가 팝업 안으로 들어가지만 링을 그리지 않는다 — 링은 안의 버튼·입력이 각자 그린다                                      |
| pressed       | 없다          | 팝업 면은 누를 수 없다. 누름은 안의 `Button` 이 갖고 `active:scale-97` 은 그 컴포넌트의 값이다                                                                                         |
| disabled      | 없다          | 팝업에 비활성 개념이 없다. 열리거나 닫히거나 둘뿐이다. 안의 버튼은 각자 `disabled` 를 갖는다                                                                                           |
| loading       | 없다          | 스스로 데이터를 불러오지 않는다. 불러오는 중을 보여야 하면 팝업 본문에 `Skeleton` 을 놓는다 — **팝업 전체를 스피너로 덮지 마라. 이유:** 제목이 사라지면 무엇을 기다리는지 읽을 수 없다 |
| empty         | 없다          | `DialogContent` 의 `children` 이 비면 팝업을 열지 마라 — 이유: 뒤를 막아 놓고 보여 줄 것이 없으면 사용자가 할 수 있는 일이 닫기뿐이다                                                  |
| error         | 없다          | 팝업이 에러 상태를 갖지 않는다. 팝업 안의 실패는 본문에 `Alert variant="destructive"` 를 놓아 표시한다                                                                                 |

**열고 닫는 전이는 `duration-100` 이다** (`dialog.tsx:32`, `:54`). 막은 `fade`, 팝업은
`fade` + `zoom-95` 다. **`motion-reduce:` 짝이 빠져 있다** — [`../tokens.md`](../tokens.md) 가
"전이를 넣으면 `motion-reduce:transition-none` 을 같은 줄에 넣는다" 를 실측 8:8 로 정했다.
**`motion-reduce:animate-none` 을 두 줄에 넣는다. 이유:** 화면 한가운데가 100ms 동안 커지는 움직임은
전정기관 이상이 있는 사용자에게 어지럼을 준다. **고칠 위치:** `../../src/ui/dialog.tsx:32` · `:54`.

**`duration-100` 은 [`../tokens.md`](../tokens.md) 의 `duration-150`(실측 9건)과 다르다.**
**`duration-150` 으로 맞춘다. 이유:** 같은 문서가 `--ease-out` 하나로 모션 값을 못박았고, 시간만
두 값이면 어느 것이 의도인지 판정할 수 없다.

## a11y

- a11y:label — `DialogTitle` 이 **필수**다. Base UI 가 `aria-labelledby` 로 팝업과 제목을 묶는다. 제목을 빼고 `aria-label` 로 대신하지 마라 — 이유: 보이는 제목이 없으면 스크린리더 사용자만 팝업의 이름을 알고 화면을 보는 사용자는 모른다. `DialogDescription` 은 선택이고, 넣으면 `aria-describedby` 로 묶인다. 닫기 버튼의 이름은 `<span className="sr-only">Close</span>` 다 (`dialog.tsx:72`) — **영어다. "닫기" 로 바꾼다. 이유:** 이 프로젝트의 화면 글자가 전부 한글이고, 한 낱말만 영어면 음성 조작에서 무엇을 말해야 하는지 갈린다. **고칠 위치:** `../../src/ui/dialog.tsx:72` 와 `:110`
- a11y:focus — 열리면 포커스가 팝업 안으로 들어가고 닫히면 `DialogTrigger` 로 돌아간다. Base UI 가 처리한다. **포커스가 팝업 밖으로 나가지 않는다** — Tab 이 마지막 요소에서 첫 요소로 돈다. Esc 로 닫힌다. **`onOpenChange` 에서 닫기를 막지 마라 — 이유:** Esc 가 듣지 않는 팝업은 키보드만 쓰는 사용자를 가둔다. 뒤의 화면은 `inert` 가 되어 포커스 순서에서 빠진다
- a11y:contrast — `--popover` 와 `--popover-foreground` 의 값은 `--card` · `--card-foreground` 와 **같다** (`../../src/tokens.css:66,68` 라이트 · `:101,103` 다크). 그래서 [`../tokens.md`](../tokens.md) 의 카드 실측값이 그대로 적용된다 — 제목 fg=`--popover-foreground` / bg=`--popover` 라이트 16.73 · 다크 14.84, 설명 fg=`--muted-foreground` / bg=`--popover` 라이트 5.59 · 다크 7.34. 둘 다 4.5:1 통과. **`DialogFooter` 의 bg=`--muted` 알파 50% 위 글자 쌍은 미측정이다** — 알파가 얹힌 색은 배경에 따라 달라져 고정 쌍으로 계산되지 않는다. 구현 뒤 렌더 화면에서 `getComputedStyle` 로 재서 [`../tokens.md`](../tokens.md) 에 한 줄을 추가한다
- a11y:target — 닫기 버튼이 `size="icon-sm"` = **32x32** ([`Button.md`](Button.md) 의 size 표). 24x24 최소를 넘는다. 팝업 오른쪽 위 `top-2 right-2`(8px)에 앉는다 (`dialog.tsx:66`). `DialogFooter` 의 버튼은 `size="default"` 라 높이 40px 이고 서로 `gap-2`(8px)를 둔다 (`dialog.tsx:102`) — 인접 요소 최소 8px 규칙을 만족한다
- a11y:role — `dialog` 다. Base UI 가 `role="dialog" aria-modal="true"` 를 붙인다. `DialogTitle` 은 `<h2>`, `DialogDescription` 은 `<p>` 로 렌더된다. **`role` 을 덮어쓰지 마라 — 이유:** `aria-modal` 이 빠지면 스크린리더가 팝업 뒤의 글자까지 읽어, 화면에서는 막혀 있는 것이 음성에서는 열려 있게 된다. **`alertdialog` 로 바꾸지 마라 — 이유:** 그 역할은 되돌릴 수 없는 행동을 확인받는 자리 전용이고, 이 프로젝트에 그런 자리가 0곳이다

## responsive

- 브레이크포인트 분기는 **2건**이고 둘 다 `sm`(640px)이다. [`../tokens.md`](../tokens.md) 의 실측(`sm` 1회 · `md` 15회) 안이다
  - `DialogContent` 의 `max-w-[calc(100%-2rem)] sm:max-w-sm` (`dialog.tsx:54`) — 640px 미만은 화면 폭에서 좌우 16px 씩 뺀 값, 640px 이상은 384px 고정
  - `DialogFooter` 의 `flex-col-reverse sm:flex-row sm:justify-end` (`dialog.tsx:102`) — 640px 미만은 버튼이 세로로 쌓이고 **주된 행동이 위로 온다**(`-reverse`), 640px 이상은 가로로 오른쪽 정렬
- **375px 화면에서 팝업 폭은 343px 이다** (375 - 16x2). 안쪽 여백 `p-4`(16px)를 빼면 본문에 쓸 수 있는 폭이 311px 이다
- 세로로 넘치면 팝업이 화면 밖으로 나간다. `DialogContent` 에 `max-h-*` 가 없다 (`dialog.tsx:54`). **본문이 길어질 자리면 본문만 감싸는 `<div className="max-h-[60vh] overflow-y-auto">` 를 부르는 쪽이 넣는다 — 이유:** 팝업 전체를 스크롤하면 `DialogFooter` 의 버튼이 화면 밖으로 밀려 닫을 수단이 X 버튼 하나만 남는다
- `DialogFooter` 의 `-mx-4 -mb-4` 는 `DialogContent` 의 `p-4` 를 상쇄해 바닥 띠를 팝업 폭 끝까지 늘린다. **`DialogFooter` 를 `DialogContent` 밖에 놓지 마라 — 이유:** 상쇄할 여백이 없어 음수 여백이 팝업 밖으로 삐져나온다
- `lg` 이상 브레이크포인트를 넣지 마라. **이유:** 640px 위에서 팝업 폭이 384px 로 멈춘다. 더 넓힐 근거가 없다

## 상호작용

- hover / focus-visible / pressed 는 전부 안의 `Button` 이 갖는다. 팝업 면 자체는 상호작용 대상이 아니다
- 닫는 수단 셋 — X 버튼 · Esc · 막 클릭. 셋 다 `onOpenChange` 로 모인다
