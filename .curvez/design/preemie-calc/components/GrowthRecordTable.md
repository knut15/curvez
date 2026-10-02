# component: GrowthRecordTable
purpose: 저장된 성장 측정 기록을 측정일 역순 목록으로 보여준다. 기록마다 그 시점의 나이 기준(생후/교정)과 백분위(또는 표시 제외 사유)를 함께 보여준다. `GrowthTrendChart`(추이 그래프, PC-F8-AC3)의 짝이다 — 그래프가 오르내림과 또래 백분위 구간 대비 위치를 보여준다면, 이 표는 같은 데이터를 정확한 값(소수점까지)과 행 단위 주의 문구로 보여준다. 그래프는 `aria-hidden` 처리돼 있어 이 표가 스크린리더에서 그 데이터의 유일한 설명이기도 하다(`components/GrowthTrendChart.md` a11y:label 참고)
쓰이는 화면: growth
요구 ID: PC-F8-AC1, AC2, AC4, AC5, EX1

## props
| 이름 | 타입 | 필수 | 기본값 | 의미 |
|---|---|---|---|---|
| records | `GrowthRecordRow[]`(아래 타입) | O | — | 측정일 역순(최신 위)으로 이미 정렬된 배열 |

`GrowthRecordRow`:
| 필드 | 타입 | 의미 |
|---|---|---|
| measurementDate | CalendarDate | 측정일 |
| heightCm / weightKg / headCircumferenceCm | number | 입력한 측정값 |
| posture | "lying" \| "standing" | "누워서"/"서서" |
| ageBasis | {kind:"chronological"\|"corrected"; label:string} | label 은 SPEC 원문 패턴 "교정 ○개월 기준"(PC-F8-AC1) 또는 "생후 ○개월 기준"을 개월 수만 채워 그대로 쓴다. 색으로 구분하지 않는다(텍스트 문구가 구분 수단이다 — `InfoRow`(basis)와 같은 규칙) |
| percentile | {height:number; weight:number; headCircumference:number} \| null | 소수점 첫째 자리까지(PC-F8-AC4). null 이면 percentileHidden=true 다 |
| percentileHidden | boolean | true 면 PC-F8-AC5/EX1 — 측정일이 출산 예정일보다 앞선(교정 40주 이전) 기록이다 |
| cautionNeeded | boolean | true 면 percentile 세 값 중 하나 이상이 3 미만 또는 97 초과다(PC-F8-AC2) |

## states
| state | 트리거 | 시각 변화 |
|---|---|---|
| default(행) | percentileHidden=false | 한 행에 측정일 + 키/몸무게/머리둘레 값(각각 "82.5cm(55.2%ile)" 형태로 원값과 백분위를 함께) + 자세("누워서"/"서서") + ageBasis.label. cautionNeeded=true 면 행 아래 한 줄로 "소아청소년과 상담을 권합니다"(SPEC 원문 그대로, PC-F8-AC2)를 아이콘 `AlertTriangle` + `--color-accent-danger`(기존 오류 텍스트 색 재사용 — 새 색을 만들지 않는다, `#B91C1C` 는 이미 4.5 이상 검증돼 있다)로 보여준다 |
| percentile-hidden(행) | percentileHidden=true | 키/몸무게/머리둘레 원값은 그대로 보이되, 백분위 자리에 숫자 대신 "이 시기는 백분위를 표시하지 않습니다"(SPEC 원문 그대로, PC-F8-AC5)를 한 번만 보여준다(세 항목마다 반복하지 않는다). 아이콘 `Info`, 색은 `--color-text-muted`(정보 안내이지 오류가 아니다) |
| loading | 데이터 준비 전(200ms 이상 걸릴 때만) | `Skeleton`(shape=card)으로 표 전체를 대체 |
| empty | records.length === 0 | 이 컴포넌트는 빈 배열을 받으면 아무것도 그리지 않는다 — 빈 상태 문구는 상위 화면(`growth.md` state:empty)의 `StatePanel` 이 표 전체 자리를 대체하는 방식으로 처리한다(이 컴포넌트 자체는 "표가 있다"는 전제에서만 쓰인다) |
| error | 쓰이지 않음 | 해당 없음(상위 화면의 StatePanel 이 대체) |

## a11y
- a11y:label — 각 행을 하나의 그룹으로 읽는다: "측정일 2026-06-01, 키 82.5cm 55.2백분위, 몸무게 12.0kg 48.0백분위, 머리둘레 45.2cm 60.1백분위, 누워서 측정, 교정 3개월 기준"(percentile-hidden 이면 "..., 이 시기는 백분위를 표시하지 않습니다"). `AlertTriangle`·`Info` 아이콘은 `aria-hidden`
- a11y:focus — 정적 표라 포커스 대상이 아니다(탭 순서에서 건너뛴다)
- a11y:contrast — 기본 텍스트 `--color-text-primary/--color-bg-surface`=15.17. 주의 문구 `#B91C1C/#FFFFFF`=6.47. 안내 문구 `--color-text-muted/--color-bg-surface`=7.63(모두 tokens.md 기존 검증 표 값 재사용, 새 쌍 없음)
- a11y:target — 터치 대상이 아니다(행 클릭 동작 없음)
- a11y:role — table(>=768px, `<th>` 로 측정일·키·몸무게·머리둘레·자세·기준·백분위 7개 열 머리글). <768px 카드 스택에서는 listitem(각 카드가 하나의 항목)

## responsive
- <768: 기록마다 카드 1개(라벨-값 세로 스택, `InfoRow`(basis)의 모바일 규칙과 같은 패턴 — 라벨 위, 값 아래)
- 768~1279: 표(7열: 측정일·키·몸무게·머리둘레·자세·기준·백분위), 각 셀 패딩 --space-3(12px)
- >=1280: 표 유지, 행 내부 패딩만 --space-4(16px)로 키운다(checkups 의 `CheckupRoundItem` 데스크톱 규칙과 같은 방식 — 표 폭 자체는 화면 본문 --layout-content-max=720px 를 넘지 않는다)
