# component: VaccinationRoundItem
purpose: 예방접종 한 차수(백신명·권장일·교정 나이 병기·상태·완료 체크)를 카드로 보여준다. `CheckupRoundItem` 과 같은 목적(차수 카드)이지만 상태 종류(완료/임박/놓침)와 사용자가 직접 체크하는 상호작용이 있어 별도 컴포넌트로 둔다
쓰이는 화면: vaccinations
요구 ID: PC-F10-AC1, AC2, AC3

## props
| 이름 | 타입 | 필수 | 기본값 | 의미 |
|---|---|---|---|---|
| vaccineName | string | O | — | 예: "B형간염" |
| doseLabel | string | O | — | 예: "1차" |
| recommendedDate | CalendarDate | O | — | 권장일(출생 기준). 데이터 파일의 개월 수를 출생일에 더한 값(PC-F10-AC1) |
| correctedAgeLabel | string | O | — | SPEC 원문 패턴 그대로 — 예: "교정 5일"(PC-F10-AC1). 교정일수가 음수면 "교정 D-○" |
| status | "done" \| "soon" \| "missed" \| "upcoming" | O | — | done=완료(체크됨), soon=권장일이 7일 이내로 남음, missed=권장일이 지나고 미체크, upcoming=그 외(아직 7일 이상 남음). `StatusBadge` 로 그린다 — done·soon·missed 는 이번 라운드에 추가한 kind, upcoming 은 기존 kind 를 그대로 재사용한다(`components/StatusBadge.md` 참고) |
| completed | boolean | O | — | 사용자가 "완료" 체크박스를 직접 켰는지. true 면 status 계산과 무관하게 항상 done 으로 보인다(날짜가 미래여도 미리 맞았다고 체크할 수 있다) |
| onToggleComplete | (v: boolean) => void | O | — | 체크박스 토글. `localStorage` 에 즉시 반영돼 새로 열어도 유지된다(PC-F10-AC3) |

## states
| state | 트리거 | 시각 변화 |
|---|---|---|
| default | status=upcoming | bg=--color-bg-surface, border=--color-border-subtle, radius=--radius-lg. 카드 좌상단에 `IconBadge`(icon="Syringe", tone=primary, size=sm, 장식). `StatusBadge`(kind=upcoming, 기존 그대로) |
| soon | status=soon | `StatusBadge`(kind=soon, label="임박", bg=--color-status-current-bg, fg=--color-status-current-text — 기존 "오늘" 색 쌍을 재사용하되 아이콘만 새로 더한다 `Clock`, 텍스트는 "임박") — 색+아이콘+텍스트 라벨 세 겹 규칙(PC-NF-A11Y-1)을 그대로 지킨다 |
| missed | status=missed | `StatusBadge`(kind=missed, label="놓침", bg=--color-accent-danger-bg, fg=--color-accent-danger, 아이콘 `AlertTriangle` — 기존 오류 색 쌍 재사용, 새 색을 만들지 않는다) |
| done | status=done(completed=true) | `StatusBadge`(kind=done, label="완료", bg=--color-status-past-bg, fg=--color-status-past-text, 아이콘 `CircleCheckBig` — `checkups` 의 "지남" 색 쌍을 그대로 재사용) |
| checkbox-default | completed=false | 카드 우측에 네이티브 체크박스 + 보이는 라벨 "완료로 표시"(체크박스만 단독으로 두지 않는다) |
| checkbox-checked | completed=true | 체크박스 체크됨. 라벨은 "완료로 표시" 그대로 유지(라벨 문구가 바뀌지 않아도 `aria-checked` 로 상태가 전달된다) |
| focus-visible | 키보드 포커스(체크박스) | outline 2px + offset 2px, color=--color-border-focus |
| disabled | 쓰이지 않음 | 해당 없음 |
| error | 쓰이지 않음 | 해당 없음 |

## a11y
- a11y:label — 카드 전체를 하나의 그룹으로 읽는다: "B형간염 1차, 2026-05-01, 교정 5일, 임박"(상태 라벨 포함). 체크박스는 별도로 `aria-label="B형간염 1차 완료로 표시"`(접근 이름이 카드 제목과 중복되지 않도록 항목을 특정한다). `IconBadge`·상태 아이콘(`Clock`·`AlertTriangle`·`CircleCheckBig`·`Circle`)은 `aria-hidden`
- a11y:focus — 카드 자체는 포커스 대상이 아니고, 체크박스만 탭 순서에 들어간다
- a11y:contrast — soon `#B45309/#FEF3C7`=4.51, missed `#B91C1C/#FEF2F2`=5.91, done `#047857/#D1FAE5`=4.84, upcoming `#292524/#FFFFFF`=15.17(모두 tokens.md 기존 검증 표 값 재사용, 새 쌍 없음)
- a11y:target — 체크박스 48×48px 이상(터치 영역), 인접 카드와 --touch-target-gap(8px) 이상 간격
- a11y:role — listitem(카드 전체). 체크박스는 `checkbox` role(네이티브 `<input type="checkbox">`)

## responsive
- <768: 카드 세로 1열
- 768~1279: 2열 그리드
- >=1280: `vaccinations` 화면의 `round-list` 폭(최대 --layout-content-max, 720px) 안에서 2열 그리드 유지, 카드 내부 패딩만 --space-5(24px)로 키운다(`CheckupRoundItem` 데스크톱 규칙과 같다)
