# component: Button
purpose: 단일 행동을 실행한다(저장, 삭제 확인, 공유, 계산기로 이동, 계산하기). 화면 이동만 하는 자리에도 이 컴포넌트를 쓴다(별도 Link 컴포넌트를 두지 않는다 — 시안 없음, 화면 수가 적어 승격하지 않는다)
쓰이는 화면: input, input-weeks, dashboard, share, guide, growth, target-height, formula(8차 라운드부터 3개 추가 — "기록 추가"·"계산하기") (ConfirmDialog·EditProfileDialog·HeaderMenu 내부 버튼도 이 컴포넌트다)
요구 ID: PC-F1-AC1, PC-F1-AC6, PC-F13-AC3, PC-NF-MOBILE-3, PC-F14-AC1~AC3·EX1, PC-F15-AC1~AC3·EX1

## props
| 이름 | 타입 | 필수 | 기본값 | 의미 |
|---|---|---|---|---|
| variant | primary \| secondary \| danger \| pop \| text | X | primary | 시각 강조 단계. danger=정보 전체 삭제 확정, pop=축하·행동유도(예: "+ 아이 추가"), text=링크형("주수로 입력") |
| size | md \| lg | X | md | md=높이 48(=--touch-target-min), lg=높이 52(주 CTA, input 화면 저장 버튼) |
| icon | { name: string(lucide-react export 이름); position: "leading" \| "trailing" } \| null | X | null | 라벨 옆에 lucide 아이콘을 더한다(--icon-size-md). 아이콘만 두고 라벨을 비우지 않는다 — 이 컴포넌트는 항상 텍스트 라벨이 있다는 전제라 아이콘 단독 버튼을 만들지 않는다 |
| loading | boolean | X | false | true 면 라벨 유지 + 우측 스피너, 클릭 무시 |
| disabled | boolean | X | false | 클릭 무시 + 대비 낮춤. growth 의 "기록 추가", target-height·formula 의 "계산하기"는 필수 입력이 유효성 검사를 통과할 때까지 이 상태를 쓴다(PC-F14-EX1, PC-F15-EX1) |
| fullWidth | boolean | X | false | true 면 폭 100% |
| onClick | () => void | O | — | 클릭 핸들러 |

## states
| state | 트리거 | 시각 변화 |
|---|---|---|
| default | — | primary: bg=--color-accent-primary, fg=--color-text-on-accent. secondary: bg=--color-bg-surface, fg=--color-text-primary, border=--color-border-strong. danger: bg=--color-accent-danger, fg=--color-text-on-accent. pop: bg=--color-accent-pop, fg=--color-text-on-accent. text: bg=투명, fg=--color-accent-primary, 밑줄. radius=--radius-md(12px, pop variant 만 --radius-pill — "+ 아이 추가" 처럼 알약형 버튼일 때). 라벨은 항상 한 줄이다(`white-space: nowrap`, `flex-shrink: 0`, 2026-09-30 6차 라운드 결함 수정) — 이 컴포넌트는 짧은 단일 문구를 전제해 줄바꿈을 허용하지 않는다. 좁은 flex 행(예: `ChildSwitcherTabs`)에 놓여 공간이 부족해도 버튼이 눌려 라벨이 끊기는 대신 형제 요소가 줄어들거나 스크롤된다 |
| hover | 포인터 진입(데스크톱 뷰) | primary: bg=--color-accent-primary-hover. secondary: bg=--color-bg-canvas. danger: bg 10% 어둡게. pop: bg 10% 어둡게 |
| pressed | 눌림(`:active`) | opacity 0.92, scale 없음(레이아웃 점프 방지) |
| focus-visible | 키보드 포커스 | outline 2px + offset 2px, color=--color-border-focus |
| disabled | disabled=true | primary: bg=--color-accent-primary-disabled, fg=--color-text-on-accent 유지. secondary/danger/pop: opacity 0.5. 커서 not-allowed |
| loading | loading=true | 라벨 유지, 우측에 16px 스피너(icon prop 이 있어도 loading 중에는 스피너가 그 자리를 대신한다), 폭 고정(레이아웃 점프 금지) |
| error | 없음 | 이 컴포넌트는 에러 상태를 갖지 않는다. 에러는 상위 폼·화면이 표시한다 |

## a11y
- a11y:label — 텍스트 라벨이 있는 버튼은 aria-label 을 추가로 넣지 않는다(중복). icon prop 이 있어도 라벨 텍스트가 항상 있으므로 별도 처리가 필요 없다 — icon 은 `aria-hidden="true"`
- a11y:focus — 포커스 순서는 DOM 순서와 같다. loading 중에도 포커스를 잃지 않는다
- a11y:contrast — primary/danger/pop 라벨 대비는 tokens.md 대비 검증의 `#FFFFFF/#0E7490`(5.36), `#FFFFFF/#B91C1C`(6.47), `#FFFFFF/#BE185D`(6.04) 값을 그대로 쓴다. secondary 는 `--color-text-primary/--color-bg-surface`(15.17)를 쓴다. disabled 는 4.5:1 요구에서 열외(WCAG 1.4.11)이지만 primary-disabled 배경 위 흰 텍스트도 시각적으로 구분되도록 유지한다
- a11y:target — size=md 는 48px 높이(=--touch-target-min), size=lg 는 52px. 좌우 패딩 --space-4 이상, 인접 버튼과 --touch-target-gap(8px) 이상 간격
- a11y:role — button. 화면 이동에 쓰더라도 role="link" 로 바꾸지 않는다(클릭 시 즉시 이동이 아니라 저장 후 이동처럼 부수효과가 있는 경우가 섞여 있어 button 으로 통일 — variant=text 로 "주수로 입력" 처럼 순수 토글에 쓸 때도 button 이다)

## responsive
- <640: fullWidth=true 인 버튼(입력 폼의 저장 버튼, share 의 CTA, growth 의 "기록 추가", target-height·formula 의 "계산하기")은 화면 좌우 여백을 제외한 전체 폭을 쓴다
- 640~1279: fullWidth 라도 최대 폭 320px 로 제한
- >=1280: 변화 없음(640~1279 규칙 유지 — 버튼은 화면 폭이 넓어져도 커지지 않는다. 주변 레이아웃이 넓어질 뿐이다)
