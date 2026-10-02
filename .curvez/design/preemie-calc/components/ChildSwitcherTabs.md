# component: ChildSwitcherTabs
purpose: 저장된 아이 사이를 전환하고, "+ 아이 추가" 로 새 프로필을 추가하는 진입점을 함께 보여준다. 헤더에서
"프로필 편집"·"정보 전체 삭제" 가 `HeaderMenu` 뒤로 빠지면서, 이 컴포넌트가 dashboard 진입 직후 가장 먼저 보이는
조작 영역이 됐다(이번 라운드 위계 재정렬 — tokens.md decisions)
쓰이는 화면: dashboard
요구 ID: PC-F1-AC5, PC-F1-EX3

## props
| 이름 | 타입 | 필수 | 기본값 | 의미 |
|---|---|---|---|---|
| options | {id:string; label:string}[] | O | — | label 은 이름 또는 "아이 N"(이름 없을 때, PC-F1-EX3) |
| selectedId | string | O | — | 현재 선택된 아이 |
| onSelect | (id:string) => void | O | — | 탭 클릭 시 `selectProfile` 호출 후 dashboard 를 다시 그린다 |
| onAddChild | () => void | O | — | "+ 아이 추가" 클릭 시 `/?new=1` 로 이동한다(PC-F1-AC5) |

## states
| state | 트리거 | 시각 변화 |
|---|---|---|
| solo | options.length === 1 | 전환할 대상이 없어 탭을 그리지 않는다. "+ 아이 추가" 버튼(`Button` variant=pop, icon 없음 — 라벨의 "+" 문자가 아이콘을 겸한다, 2026-09-30 6차 라운드 결함 수정)만 좌측에 보인다 |
| default | options.length >= 2 | 가로 스크롤 알약형(pill) 탭 목록 뒤에 "+ 아이 추가" 버튼이 마지막 항목으로 붙는다. 각 탭 radius=--radius-pill, bg=--color-bg-surface, border=--color-border-subtle. 탭 앞에 작은 아이콘 `Baby`(--icon-size-sm, 장식, `aria-hidden`) |
| selected | 탭이 selectedId 와 같음 | bg=--color-accent-primary, fg=--color-text-on-accent, 아이콘 `Baby` 색이 흰색으로 바뀌고 그 옆에 `Check`(--icon-size-sm) 를 더한다(색만으로 선택 표시하지 않는다). 선택 전환 시 `--motion-easing-playful` 로 배경색이 튕기듯 채워진다(tokens.md 가 허용한 3곳 중 하나) |
| focus-visible | 키보드 포커스(탭 또는 "+ 아이 추가") | outline 2px + offset 2px |
| disabled | 쓰이지 않음 | 해당 없음 |
| error | 쓰이지 않음 | 해당 없음 |

## a11y
- a11y:label — 실제 전환 가능한 탭이 있을 때만(options.length >= 2) `role="tablist"` + `aria-label="아이 선택"` 을 그 탭들에 두른다. 각 탭은 `role="tab"` + `aria-selected`. "+ 아이 추가" 는 tablist 밖의 독립된 버튼이다 — 라벨 텍스트 "+ 아이 추가" 가 이미 접근 이름이라 별도 aria-label 을 겹쳐 쓰지 않는다(전환이 아닌 행위라 tablist 패턴에 섞지 않는다)
- a11y:focus — 방향키로 탭 간 이동(roving tabindex, tablist 안에서만). "+ 아이 추가" 는 tablist 뒤에 오는 별도 탭 정지점(Tab 키로 이동)이다. 선택 시 아래 age-summary 로 포커스를 억지로 옮기지 않는다(live region 안내로 대신한다)
- a11y:contrast — 선택 탭 `#FFFFFF/#0E7490` = 5.36. 미선택 탭 `--color-text-primary/--color-bg-surface` = 15.17. "+ 아이 추가" 버튼(variant=pop) `#FFFFFF/#BE185D` = 6.04
- a11y:target — 탭 높이 48px, 탭 사이 간격 --touch-target-gap(8px). "+ 아이 추가" 버튼도 48px 높이, 앞 요소와 8px 이상 간격
- a11y:role — tablist/tab(전환 탭이 있을 때), button("+ 아이 추가")

## responsive
- <768: 탭이 화면 폭을 넘으면 가로 스크롤(스크롤 가능함을 알리는 화살표 없이, 마지막 항목이 잘려 보여 스크롤 가능함을 암시). "+ 아이 추가" 는 스크롤 끝에 있어도 항상 같은 목록의 마지막 항목이다
- 768~1279: 탭 전부가 한 줄에 들어가면 스크롤 없음
- >=1280: dashboard 본문 컨테이너(`--layout-content-max`=720px, 7차 라운드부터 1열) 폭 안에서 왼쪽 정렬 유지(전체 폭으로 늘리지 않는다 — 탭이 너무 넓어지면 알약형 모양이 어색해진다). 탭 사이 간격만 --space-3(12px)로 살짝 넓힌다. 이 영역의 좌우 폭·여백은 dashboard content 컨테이너(`--layout-content-max`=720px, 좌우 --space-6)와 정확히 같은 값을 써서 영역 왼쪽 끝이 카드들과 같은 세로선에 온다(2026-09-30 6차 라운드 결함 수정 — 이전에는 이 영역에 별도 좌측 여백이 없어 카드보다 왼쪽에 떠 보였다. 7차 라운드는 컨테이너 폭 값만 1120px 에서 720px 로 바꿨다). 이 영역 자체의 상하 패딩(--space-3=12px)은 유지하고, 바로 아래 dashboard content 컨테이너의 상단 패딩만 --space-8(64px)에서 --space-5(24px)로 줄여(좌우·하단은 그대로) 버튼-카드 사이 빈 공간을 12+64=76px 에서 12+24=36px 로 줄인다(`screens/dashboard.md:## responsive` 에도 같은 값)
