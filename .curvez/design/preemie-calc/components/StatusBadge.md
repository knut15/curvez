# component: StatusBadge
purpose: 상태를 색+아이콘+텍스트 라벨 세 겹으로 표시하는 배지. 색만으로도, 아이콘만으로도
의미를 전달하지 않는다(PC-NF-A11Y-1, 이번 라운드 CONTEXT "아이콘만으로도 금지 — 글자 병기"). 이전 라운드까지는
텍스트 기호(✓●·–)를 썼지만, 이번 라운드에서 `lucide-react` 가 생겨 실제 아이콘으로 바꿨다 — 라벨 텍스트는 그대로
유지한다(아이콘이 기호를 대체할 뿐 텍스트를 대신하지 않는다). 8차 라운드(F10)부터 검진 차수(지남/오늘/예정/대상아님)
kind 4종에 예방접종 전용 kind 3종(done/soon/missed)을 더했다 — 같은 배지 구조를 재사용하되 색 쌍은 최대한
기존 값을 그대로 쓴다(새 색을 만들지 않는다)
쓰이는 화면: checkups(CheckupRoundItem 안에서 씀, kind=past/current/upcoming), copay-relief(대상 아님, kind=neutral), correction-period(대상 아님, kind=neutral), vaccinations(VaccinationRoundItem 안에서 씀, kind=done/soon/missed/upcoming)
요구 ID: PC-F4-AC4, PC-F5-AC4, PC-F6-EX1, PC-F10-AC1, PC-F10-AC2, PC-NF-A11Y-1

## props
| 이름 | 타입 | 필수 | 기본값 | 의미 |
|---|---|---|---|---|
| kind | past \| current \| upcoming \| neutral \| done \| soon \| missed | O | — | past="지남"+`CircleCheckBig`, current="오늘"+`CircleDot`, upcoming="예정"+`Circle`, neutral="대상 아님"/"해당 없음"+`Minus`. done="완료"+`CircleCheckBig`(past 와 같은 색 쌍 재사용), soon="임박"+`Clock`(current 와 같은 색 쌍 재사용), missed="놓침"+`AlertTriangle`(기존 오류 색 쌍 재사용). 모두 lucide-react export 이름 |
| label | string | X | kind 기본 라벨 | 기본 라벨을 그대로 쓰거나 화면 문맥에 맞게 덮어쓴다(예: neutral 을 "경감 대상이 아닙니다" 전체 문구로 쓸 때는 이 컴포넌트를 쓰지 않고 화면 텍스트로 직접 적는다 — 배지는 짧은 라벨 전용) |

## states
| state | 트리거 | 시각 변화 |
|---|---|---|
| past | kind=past | bg=--color-status-past-bg(#D1FAE5), fg=--color-status-past-text(#047857), 아이콘 `CircleCheckBig`(--icon-size-sm) |
| current | kind=current | bg=--color-status-current-bg(#FEF3C7), fg=--color-status-current-text(#B45309), 아이콘 `CircleDot`(--icon-size-sm). 목록에 새로 나타날 때 아이콘이 `--motion-easing-playful` 로 살짝 튕기며 나타난다(--motion-duration-base, tokens.md 가 허용한 3곳 중 하나) |
| upcoming | kind=upcoming | bg=--color-status-upcoming-bg(#FFFFFF, 테두리 --color-border-subtle), fg=--color-status-upcoming-text(#292524), 아이콘 `Circle`(--icon-size-sm) |
| neutral | kind=neutral | bg=--color-status-neutral-bg(#F5F5F4), fg=--color-status-neutral-text(#57534E), 아이콘 `Minus`(--icon-size-sm) — past 와 배경·아이콘이 모두 다르다(이전 라운드까지는 past·neutral 이 같은 회색 한 벌을 썼다. 이번 라운드는 "지남(완료)"과 "대상 아님(해당 없음)"이 서로 다른 의미라 색도 나눴다, tokens.md decisions) |
| done | kind=done(8차 라운드 신규, 예방접종 전용) | bg=--color-status-past-bg, fg=--color-status-past-text, 아이콘 `CircleCheckBig` — past 와 같은 색 쌍을 그대로 재사용한다("완료"와 "지남" 둘 다 "끝났다"는 같은 의미라 값을 나누지 않는다) |
| soon | kind=soon(8차 라운드 신규, 예방접종 전용) | bg=--color-status-current-bg, fg=--color-status-current-text, 아이콘 `Clock`(--icon-size-sm, 신규 아이콘) — current("오늘")와 같은 색 쌍을 재사용한다("지금 곧 신경 써야 함"이라는 긴장감이 같은 계열이라 값을 나누지 않는다). 라벨은 "임박"으로 current 의 "오늘"과 구분한다 |
| missed | kind=missed(8차 라운드 신규, 예방접종 전용) | bg=--color-accent-danger-bg, fg=--color-accent-danger, 아이콘 `AlertTriangle`(--icon-size-sm) — 기존 오류 색 쌍을 재사용한다("놓쳤으니 챙겨야 한다"는 경고 의미가 다른 위험 경고와 같은 계열이라 값을 나누지 않는다) |
| disabled | 쓰이지 않음 | 해당 없음 |
| error | 쓰이지 않음 | 해당 없음 |

## a11y
- a11y:label — 배지 텍스트 자체가 접근 이름이다("지남", "오늘", "완료", "임박", "놓침" 등). 아이콘(`CircleCheckBig`·`CircleDot`·`Circle`·`Minus`·`Clock`·`AlertTriangle`)은 장식이라 `aria-hidden="true"`, 라벨 텍스트가 이미 같은 의미를 담고 있어 아이콘에 별도 접근 이름을 주지 않는다
- a11y:focus — 포커스 대상이 아니다(정보 표시 전용)
- a11y:contrast — past/done `#047857/#D1FAE5`=4.84, current/soon `#B45309/#FEF3C7`=4.51, upcoming `#292524/#FFFFFF`=15.17, neutral `#57534E/#F5F5F4`=6.99, missed `#B91C1C/#FEF2F2`=5.91(모두 tokens.md 대비 검증 표 값 그대로, 8차 라운드에서 새로 추가한 색 쌍은 없다)
- a11y:target — 배지는 터치 대상이 아니다(클릭 동작 없음 — 예방접종의 "완료" 체크는 이 배지가 아니라 `VaccinationRoundItem` 의 별도 체크박스가 담당한다)
- a11y:role — img 가 아니라 일반 텍스트(status). `aria-live` 는 두지 않는다(목록 진입 시 한 번에 렌더되고 이후 상태가 실시간으로 바뀌지 않는다 — 하루가 지나거나 사용자가 체크하는 것으로 상태가 바뀌면 그 순간 다시 렌더될 뿐, 배지 자체가 스스로 시간 경과를 감시하지 않는다)

## responsive
- <768: 배지 높이 24px(본문 줄 안에 인라인으로 붙는다), 폰트 --font-size-meta, 아이콘 --icon-size-sm(16px)
- >=768: 변화 없음
