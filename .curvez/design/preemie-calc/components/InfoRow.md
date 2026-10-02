# component: InfoRow
purpose: 라벨-기준-값 한 줄 정보 행. variant=nav-card 로 쓰면 다른 화면으로 가는 이동 카드가 된다. 이번 라운드부터 두 variant 모두 앞에 장식 아이콘이 붙는다("밝고 생기 있는" 리디자인)
쓰이는 화면: dashboard(variant=nav-card), age-basis(variant=basis)
요구 ID: PC-F3-AC1~AC5, PC-F6-EX1

## props
| 이름 | 타입 | 필수 | 기본값 | 의미 |
|---|---|---|---|---|
| variant | basis \| nav-card | O | — | basis=아이콘+라벨+기준배지+값(age-basis). nav-card=아이콘+제목+설명+화살표(dashboard 이동 카드) |
| icon | string (lucide-react export 이름) | O | — | nav-card 4종: "어느 나이를 쓰나"="CircleHelp", "영유아검진 도우미"="Stethoscope", "본인부담 경감 종료일"="Banknote", "교정연령 적용 종료 안내"="Hourglass". basis 5종: "예방접종"="Syringe", "이유식"="Utensils", "영유아검진 방문"="Stethoscope", "문진표·발달선별검사지"="ClipboardList", "발달 평가"="ClipboardCheck" |
| iconTone | primary \| corrected \| pop \| warm \| success | X | primary | `IconBadge` 의 tone |
| label | string | O | — | "예방접종", "어느 나이를 쓰나" 등 |
| basis | "출생 기준" \| "교정 기준" \| "교정 기준(24개월 검진까지)" | X(variant=basis 일 때 필수) | — | PC-F3-AC1~AC3 문구 그대로 |
| value | string | X(variant=basis) | — | "생후 3개월" 등 |
| sourceLabel | string | X(variant=basis) | — | 근거 자료 이름 + 기준일을 한 줄로(PC-F3-AC4) |
| href | string | X(variant=nav-card 일 때 필수) | — | 이동 경로 |
| onClick | () => void | X(variant=nav-card) | — | — |

## states
| state | 트리거 | 시각 변화 |
|---|---|---|
| default | — | basis: bg=--color-bg-surface, radius=--radius-md, 좌측에 `IconBadge`(size=sm). 배지는 `basis` 값에 따라 텍스트만 다르고 배경은 모두 --color-bg-canvas + 테두리(색으로 기준을 구분하지 않는다, 텍스트 문구 자체가 구분 수단이다). nav-card: bg=--color-bg-surface, radius=--radius-lg, 좌측에 `IconBadge`(size=lg), 우측에 아이콘 `ChevronRight`(--icon-size-md, --color-text-muted, 장식 — 이전 라운드까지 쓰던 텍스트 기호 "›" 를 실제 아이콘으로 바꿨다) |
| hover/pressed(nav-card) | 포인터 진입/눌림 | bg=--color-bg-canvas, `IconBadge` 배경이 한 단계 진해진다(soft-bg → 같은 계열의 조금 더 짙은 톤) |
| focus-visible | 키보드 포커스(nav-card) | outline 2px + offset 2px, color=--color-border-focus |
| disabled | 쓰이지 않음 | 해당 없음 |
| error | 쓰이지 않음 | 해당 없음 — 상위 화면 레벨에서 처리 |

## a11y
- a11y:label — nav-card 는 카드 전체가 링크 하나다(내부에 별도 링크를 두지 않는다 — 키보드 사용자가 탭을 여러 번 누르지 않도록). `IconBadge`·`ChevronRight` 는 `aria-hidden`, 접근 이름은 label(+설명) 텍스트다. basis 행은 링크가 아니라 정적 텍스트다
- a11y:focus — nav-card 만 포커스 대상. 순서는 화면에 보이는 순서
- a11y:contrast — 텍스트 `--color-text-primary/--color-bg-surface` = 15.17, 보조 설명 `--color-text-muted/--color-bg-surface` = 7.63
- a11y:target — nav-card 전체 높이 최소 48px(내용이 2줄이면 자연히 넘는다), basis 행은 터치 대상이 아니라 열외
- a11y:role — nav-card: link(전체 카드가 `<a>`). basis: listitem(목록 안에서 쓰인다)

## responsive
- <768: basis variant 는 라벨 위, 기준·값 아래로 세로 스택. nav-card 는 세로 목록 1열
- 768~1279: basis variant 를 라벨-기준-값 3열 표로 바꾼다(age-basis 화면 정의와 일치). nav-card 는 2열 그리드(dashboard 화면 정의와 일치)
- >=1280: basis variant 는 768~1279 와 동일(콘텐츠 최대 폭 --layout-content-max, 720px 안에서 3열 표 유지). nav-card 는 dashboard 본문 컨테이너(`--layout-content-max`=720px, 7차 라운드부터 1열) 안에서 2열 그리드 유지, 카드 내부 패딩만 --space-5(24px)로 키운다
