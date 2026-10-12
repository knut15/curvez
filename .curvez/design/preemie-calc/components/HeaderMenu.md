# component: HeaderMenu
purpose: dashboard 헤더의 "프로필 편집"·"정보 전체 삭제" 두 액션을 하나의 "더보기" 버튼 뒤로 묶는다(이번 라운드
신규 — CONTEXT "헤더 타이틀은 모든 폭에서 가운데 정렬" 요구를 지키려면 헤더 우측 zone 이 좁고 고정된 폭이어야
하는데, 두 액션(특히 SPEC 원문 그대로의 긴 라벨 "정보 전체 삭제")을 나란히 두면 zone 폭이 늘어나 `PageHeader` 의
`--layout-header-side-reserve` 고정값과 맞지 않는다. tokens.md decisions 참고). 두 액션 모두 SPEC 원문 텍스트를
그대로 가진 완전한 메뉴 항목(버튼)으로 열리므로 PC-F1-AC6 의 "'정보 전체 삭제'를 누르고 확인" 동작은 그대로 된다
쓰이는 화면: dashboard(PageHeader variant=dashboard 의 우측 zone)
요구 ID: PC-F1-AC6, PC-F1-EX3, PC-F6-AC3, PC-F7-AC1

## props
| 이름 | 타입 | 필수 | 기본값 | 의미 |
|---|---|---|---|---|
| onEditProfile | () => void | O | — | "프로필 편집" 항목 클릭 시 `EditProfileDialog` 를 연다(PC-F6-AC3, PC-F7-AC1) |
| onDeleteAll | () => void | O | — | "정보 전체 삭제" 항목 클릭 시 `ConfirmDialog` 를 연다(SPEC 원문 그대로, PC-F1-AC6) |

## states
| state | 트리거 | 시각 변화 |
|---|---|---|
| closed | 기본 | "더보기" 아이콘 버튼만 보인다: 아이콘 `MoreVertical`(--icon-size-md) + 화면에 보이는 텍스트 "더보기"(작은 글자, --font-size-meta, 아이콘 아래 또는 오른쪽). 아이콘 단독이 아니다(PC-NF-A11Y-1 확장 적용) |
| open | "더보기" 클릭 | 버튼 아래에 팝오버 메뉴가 열린다. bg=--color-bg-surface, radius=--radius-lg, 그림자=--elevation-modal. 항목 순서: "프로필 편집"(아이콘 `Pencil`, 색=--color-text-primary) → "정보 전체 삭제"(아이콘 `Trash2`, 색=--color-accent-danger, 위험 행동이라 아래에 둔다). 각 항목 높이 48px, 좌우 패딩 --space-4 |
| item-hover/pressed | 항목에 포인터 진입/눌림 | bg=--color-bg-canvas(프로필 편집), bg=--color-accent-danger-bg(정보 전체 삭제) |
| focus-visible | 키보드 포커스(트리거 또는 항목) | outline 2px + offset 2px, color=--color-border-focus |
| disabled | 쓰이지 않음 | 해당 없음 |
| error | 쓰이지 않음 | 해당 없음 |

## a11y
- a11y:label — 트리거 버튼의 접근 이름은 화면에 보이는 텍스트 "더보기" 그대로(아이콘은 `aria-hidden="true"`). `aria-haspopup="menu"` + `aria-expanded`
- a11y:focus — 트리거는 `aria-controls` 로 메뉴와 연결된다. 메뉴가 열리면 포커스가 첫 항목("프로필 편집")으로 이동한다. 방향키(↑/↓)로 항목 간 이동, Esc 로 닫히고 포커스가 트리거로 돌아간다. 항목 클릭 시(다이얼로그가 열리므로) 포커스는 그 다이얼로그의 첫 입력 요소로 넘어간다(각 다이얼로그 문서 참고)
- a11y:contrast — "프로필 편집" 항목 `--color-text-primary/--color-bg-surface`=15.17. "정보 전체 삭제" 항목 `--color-accent-danger/--color-bg-surface`(#B91C1C/#FFFFFF)=6.47. 트리거 텍스트 "더보기"는 `--color-text-muted/--color-bg-surface`=7.63
- a11y:target — 트리거 버튼 48×48px 이상. 메뉴 항목 각각 높이 48px, 좌우 여백 --space-4
- a11y:role — `role="menu"`, 트리거는 `button`, 항목은 `role="menuitem"`

## responsive
- <768: 팝오버가 트리거 오른쪽 아래에 붙어 열린다. 메뉴 폭 200px, 화면 오른쪽 여백(--space-4) 안에 들어오도록 위치를 조정한다
- 768~1279: 변화 없음
- >=1280: 변화 없음(팝오버 폭·위치 규칙 동일 — 헤더 자체가 `--layout-content-max`(720px, 7차 라운드부터 variant=dashboard 도 다른 variant 와 같은 값) 안에 중앙 정렬되므로 트리거 위치만 달라지고 메뉴 동작은 같다)
