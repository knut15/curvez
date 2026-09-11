# component: Button

purpose: 주소를 바꾸지 않는 단일 행동을 실행한다. 화면 이동이면 `AppLink` 를 쓴다

## 근거 — 화면에 아직 없다

```bash
grep -rn '<button' apps/handwork/src --include='*.tsx'
```

실측 **1건**이다 — `packages/scopulus-ui/src/ui/theme-toggle.tsx:9`. 그것도 아이콘 전용이고
`ThemeToggle` 이 직접 들고 있다.

**그래서 variant 와 size 를 지어내지 않는다.** shadcn 이 정한 이름
(`default` / `secondary` / `outline` / `ghost` / `link`, `sm` / `default` / `lg` / `icon`)에서
이 프로젝트가 실제로 쓸 것만 남기고, 나머지는 아래에 "넣지 않는다" 와 이유를 적었다.

**shadcn 기본값의 정확한 높이·여백 수치는 확인 불가다.** `shadcn` 은 CLI 패키지만 설치돼 있고
(`node_modules/.pnpm/shadcn@4.21.0*`), `base-nova` 스타일의 button 소스가 로컬에 없다. 그래서
아래 값은 shadcn 문서가 아니라 **이 저장소에서 실측한 스케일**에서 가져왔다. 근거는 각 행에 있다.
`shadcn add button` 으로 받은 뒤 값이 다르면 **이 문서 쪽으로 맞춘다** —
**이 프로젝트의 값이 라이브러리 기본값을 이긴다.** 라이브러리 기본값은 이 사이트에서 검증된 적이
없고, 이 문서의 값은 실측에서 나왔다.

## props

| 이름     | 타입                 | 필수 | 기본값    | 의미                                           |
| -------- | -------------------- | ---- | --------- | ---------------------------------------------- |
| variant  | `default` \| `ghost` | X    | `default` | 시각 강조 단계. 두 단계뿐이다                  |
| size     | `default` \| `icon`  | X    | `default` | `default`=글자 버튼, `icon`=정사각 아이콘 버튼 |
| disabled | `boolean`            | X    | `false`   | 클릭 무시 + 불투명도 50%                       |
| onClick  | `() => void`         | O    | —         | 실행할 행동. 주소를 바꾸는 동작을 넣지 마라    |
| children | `React.ReactNode`    | O    | —         | `size="icon"` 이면 아이콘 하나, 아니면 라벨    |

**`loading` prop 을 넣지 않는다.**
**이유:** 이 사이트에 비동기 동작이 0건이다. 콘텐츠가 레포 안 MDX 이고 빌드 시점에 박히며, 폼도
서버 액션도 없다. 일어날 수 없는 상태에 값을 정하면 그 값이 검증되지 않은 채 남는다.

**`asChild` 를 넣지 않는다.**
**이유:** 그것을 쓰는 유일한 이유가 버튼 모양의 링크를 만드는 것인데, 이 프로젝트는 주소가 바뀌는 것을
`AppLink`(=`<a>`)로, 바뀌지 않는 것을 Button(=`<button>`)으로 가른다. 구멍을 열면 그 구분이 무너진다.

### 남기는 값

| 축      | 값        | 면                                                          | 근거                                                                                                                         |
| ------- | --------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| variant | `default` | bg=`--primary`, fg=`--primary-foreground`                   | `../tokens.md` 가 두 토큰의 용도를 "주요 CTA 배경 / 라벨" 로 적었고 대비도 이미 검증했다                                     |
| variant | `ghost`   | bg 투명, fg=`--muted-foreground`                            | `shared/ui/theme-toggle.tsx:21` 이 이미 이 모양이다                                                                          |
| size    | `default` | 높이 40px(`h-10`), 좌우 16px(`px-4`), `text-sm font-medium` | 40px·16px 둘 다 실측 스케일 안이다(step 10 ×7, step 4 ×13). 헤더 아이콘 버튼과 같은 높이라 나란히 놓여도 밑선이 맞는다       |
| size    | `icon`    | 40x40(`size-10`)                                            | `shared/ui/theme-toggle.tsx:21` 실측. [`SiteHeader.md`](SiteHeader.md) 의 `a11y:target` 이 "토글 40x40" 으로 실측을 기록했다 |
| 반경    | 공통      | `rounded-md`(8px)                                           | `shared/ui/theme-toggle.tsx:21` 실측. `../tokens.md` `## 형태`: "아이콘 버튼 · 포커스 링 모서리 = `rounded-md`"              |

### 넣지 않는 값

| 버리는 것           | 이유                                                                                                                                                                                                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| variant `secondary` | `--secondary` 와 `--accent` 가 같은 값이다. `globals.css:79`·`:83`(라이트 `oklch(0.9548 0.0045 179.7)`), `:117`·`:121`(다크 `oklch(0.2559 0.012 178.5)`). `secondary` 버튼과 `ghost` 버튼의 hover 면이 화면에서 구분되지 않는다. 게다가 `--secondary` 는 `../tokens.md` 의 색 표 14행에 아예 없다 |
| variant `outline`   | 카드가 이미 `border border-border` 면을 쓴다(`case-card.tsx:16`, `lab-card.tsx:16`). 목록 화면에서 같은 테두리를 버튼이 쓰면 카드와 버튼이 같은 무게로 읽힌다. 두 번째 강조가 필요하면 `ghost` 로 내린다                                                                                          |
| variant `link`      | 그 자리는 `AppLink` 가 맡는다. `variant="link"` 는 `<button>` 을 링크처럼 보이게 만드는 것이라, 주소가 바뀌는 것과 바뀌지 않는 것의 구분을 화면에서 지운다. 새 탭 열기와 주소 복사가 막히는 것도 같은 문제다                                                                                      |
| size `sm`           | 이 사이트에 버튼이 들어갈 자리가 둘뿐이다 — 헤더의 아이콘 하나와, 아직 없는 CTA 하나. 크기 단계가 둘 이상 필요한 자리가 0곳이다. 실측 `<button>` 1건이 그 근거다                                                                                                                                  |
| size `lg`           | 같은 이유. 그리고 40px 보다 큰 버튼을 놓을 자리가 없다 — 화면 5개 중 넷이 글 읽는 화면이고 랜딩에는 버튼이 0개다                                                                                                                                                                                  |

**버린 것을 되살릴 때 고칠 위치:** 이 절과 `packages/scopulus-ui/src/ui/button.tsx` 의 `cva` 정의 두 곳.

## states

| state         | 트리거          | 시각 변화                                                                                                                                                                                                          |
| ------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| default       | —               | `default`: bg=`--primary`, fg=`--primary-foreground`. `ghost`: bg 투명, fg=`--muted-foreground`. 공통 `rounded-md`, `text-sm font-medium`, `transition-colors duration-150 ease-out motion-reduce:transition-none` |
| hover         | 포인터 진입     | `default`: bg=`--primary/90`(같은 토큰의 알파 90%). `ghost`: bg=`--accent`, fg=`--accent-foreground` — `theme-toggle.tsx:21` 과 같은 조합이다                                                                      |
| focus-visible | 키보드 포커스   | `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring`. 실측 8건이 전부 이 세 조각이다. `focus-visible:rounded-sm` 은 붙이지 않는다 — 이미 `rounded-md` 를 가졌다                     |
| pressed       | `:active`       | `active:scale-97` + `motion-reduce:active:scale-100`. `shared/ui/theme-toggle.tsx:21` 실측. 전이 속성에 `transform` 을 더한다: `transition-[color,background-color,transform]`                                     |
| disabled      | `disabled=true` | `disabled:opacity-50 disabled:pointer-events-none`. 대비 하한 **3:1**(WCAG 1.4.11). `disabled` 속성을 실제로 주고 색만으로 표현하지 마라                                                                           |
| loading       | 없음            | 비동기 동작이 0건이다. 콘텐츠가 빌드 시점에 박히고 폼·서버 액션이 없다. 스피너를 만들지 마라 — 검증할 대상이 없는 상태가 남는다                                                                                    |
| empty         | 없음            | `children` 이 필수라 빈 버튼이 나올 수 없다. 라벨 없는 버튼이 필요하면 그것은 `size="icon"` 이고 `aria-label` 이 붙는다                                                                                            |
| error         | 없음            | 이 컴포넌트는 에러 상태를 갖지 않는다. 실패는 부르는 쪽이 표시한다                                                                                                                                                 |

**`default` 의 hover 쌍은 `../tokens.md` 의 `## 대비 검증` 목록에 없다.**
알파가 얹힌 색은 배경에 따라 달라져 고정 쌍으로 계산되지 않는다 — 같은 문서가 다크 `--border` 에
대해 이미 같은 판단을 내렸다("대비 검증에서 제외한다").
**구현 뒤 렌더 화면에서 `getComputedStyle` 로 실제 색을 재서 `../tokens.md` 의 `## 대비 검증` 에
한 줄을 추가한다.** hover 하지 않은 기본 쌍은 이미 통과했다 — 라이트 15.82 · 다크 16.13.

**`default` 의 hover 를 `--brand-accent` 로 바꾸지 마라.**
**이유:** `../tokens.md` 의 "상호작용 색은 사이트 전역에서 이 강조색 하나다" 는 **글자 색** 규칙이다.
채운 면의 배경을 강조색으로 바꾸면 버튼 하나가 링크 hover 색 전체와 같은 면적을 차지해, 강조가
어디에 있는지 판정할 수 없게 된다.

## a11y

- a11y:label — `size="icon"` 이면 `aria-label` **필수**다. 라벨 원문은 부르는 쪽이 정한다(`ThemeToggle` 은 "테마 전환" — `shared/ui/theme-toggle.tsx:11`). `size="default"` 는 라벨이 보이므로 `aria-label` 을 중복 지정하지 마라 — 이유: 보이는 글자와 읽히는 글자가 갈리면 음성 조작이 실패한다
- a11y:focus — 포커스 순서는 DOM 순서와 같다. `disabled` 버튼은 포커스를 받지 않는다. 누른 뒤에도 포커스를 잃지 않는다 — 이유: 토글처럼 제자리에서 상태가 뒤집히는 버튼은 연속으로 누르는 일이 있다
- a11y:contrast — `default` 기본 fg=`--primary-foreground` / bg=`--primary` 라이트 15.82 · 다크 16.13 (`../tokens.md` 의 "CTA 라벨/CTA 배경" 실측값). `ghost` 기본 fg=`--muted-foreground` / bg=`--background` 라이트 5.28 · 다크 7.97, hover 는 fg=`--accent-foreground` / bg=`--accent`. `disabled` 는 3:1 이상이면 통과다(WCAG 1.4.11)
- a11y:target — `size="icon"` 40x40, `size="default"` 높이 40px. 둘 다 24x24 최소를 넘는다. 인접 요소와 최소 8px 을 띄운다 — 헤더에서는 `gap-4`(16px)가 그 역할을 한다(`widgets/site-header.tsx:34`)
- a11y:role — `button` (`<button type="button">` 의 암묵 역할). **`type="button"` 을 명시한다** — 이유: 폼 안에서 기본값이 `submit` 이라 의도하지 않은 전송이 일어난다. `shared/ui/theme-toggle.tsx:10` 이 이미 명시하고 있다. `<div onClick>` 이나 `<a>` 로 만들지 마라

## responsive

- 모든 폭에서 같은 크기다. 브레이크포인트 분기를 넣지 마라 — 이유: 실측 버튼 1건에 분기가 0건이고, 40px 은 375px 화면에서도 24x24 최소를 여유 있게 넘는다
- 폼 안에서 폭 100% 로 늘리는 규칙을 두지 않는다 — 이유: 이 사이트에 폼이 0개다. 필요해지면 그때 이 줄을 고친다
- 라벨이 길어도 줄바꿈하지 않는다(`whitespace-nowrap`). 버튼 라벨은 한 낱말~두 낱말이다 — 이유: 두 줄이 되면 높이 40px 고정이 깨져 옆 요소와 밑선이 어긋난다
- `size="icon"` 안의 아이콘은 20px(`size-5`)이다. `shared/ui/theme-toggle.tsx:25-26` 실측. 40px 상자 안에서 상하좌우 10px 씩 남는다

## 상호작용

- hover / focus-visible 정의
