# component: CheckupRoundItem
purpose: 검진 차수 하나(방문 기간·검사지 기준·상태)를 카드로 보여준다
쓰이는 화면: checkups
요구 ID: PC-F4-AC1~AC4

## props
| 이름 | 타입 | 필수 | 기본값 | 의미 |
|---|---|---|---|---|
| roundLabel | string | O | — | "1차" |
| visitStart / visitEnd | CalendarDate | O | — | 방문 기간(출생 기준, PC-F4-AC1) |
| questionnaireBasisLabel | string | O | — | "교정 4개월 기준" 또는 "생후 26개월 기준"(PC-F4-AC2, AC3) |
| status | "past" \| "current" \| "upcoming" | O | — | `StatusBadge` 로 그린다 |

## states
| state | 트리거 | 시각 변화 |
|---|---|---|
| default | status=upcoming | bg=--color-bg-surface, border=--color-border-subtle, radius=--radius-lg. 카드 좌상단에 `IconBadge`(icon="Stethoscope", tone=primary, size=sm, 장식)를 roundLabel 앞에 둔다 |
| current | status=current | bg=--color-status-current-bg, border=--color-status-current-text, 카드가 목록 맨 위로 온다(PC-F4-AC4). `IconBadge` tone 이 warm 으로 바뀐다(카드 상태와 톤을 맞춘다) |
| past | status=past | bg=--color-status-past-bg, 텍스트는 --color-status-past-text(흐리지만 대비는 유지). `IconBadge` tone 이 success 로 바뀐다 |
| disabled | 쓰이지 않음 | 해당 없음 |
| error | 쓰이지 않음 | 해당 없음 |

## a11y
- a11y:label — 카드 전체를 하나의 그룹으로 읽는다: "1차, 2026-07-01부터 2026-09-30까지, 교정 4개월 기준, 오늘"(상태 라벨까지 포함). `IconBadge` 는 장식이라 `aria-hidden="true"`, 이 문자열에 포함되지 않는다
- a11y:focus — 정적 카드라 포커스 대상이 아니다
- a11y:contrast — `StatusBadge` 참고(모두 4.5 이상)
- a11y:target — 터치 대상이 아니다(클릭 동작 없음)
- a11y:role — listitem

## responsive
- <768: 카드 세로 1열
- 768~1279: 2열 그리드(current 카드는 항상 첫 번째 칸, 폭 전체)
- >=1280: `checkups` 화면의 `round-list` 폭(최대 --layout-content-max, 720px) 안에서 2열 그리드 유지. 카드 자체 폭이 넓어지는 대신 카드 내부 여백을 --space-5(24px)로 키운다(빈 공간을 여백으로 흡수해 카드가 지나치게 넓어지지 않게 한다)
