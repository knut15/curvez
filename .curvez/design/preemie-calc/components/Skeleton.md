# component: Skeleton
purpose: 데이터가 200ms 이상 걸려 준비될 때만 보이는 로딩 자리표시. 이 앱은 계산이 대부분 동기(로컬)라 실제로 등장하는 경우는 드물지만, 규약상 모든 화면에 정의해 둔다
쓰이는 화면: dashboard, age-basis, checkups, copay-relief, correction-period, growth(8차 라운드 — record-list 자리)
요구 ID: 없음(비기능 일반 원칙 — 200ms 미만 로딩은 표시하지 않는다는 자체 기준)

## props
| 이름 | 타입 | 필수 | 기본값 | 의미 |
|---|---|---|---|---|
| shape | text \| card | O | — | text=한 줄 텍스트 자리(높이 20px), card=`AgeSummaryCard`·`GrowthRecordTable` 같은 큰 블록 자리(높이 부모와 같음) |
| lines | number | X | 1 | shape=text 일 때 반복할 줄 수 |

## states
| state | 트리거 | 시각 변화 |
|---|---|---|
| pulsing | 항상(보이는 동안) | bg=--color-border-subtle 와 --color-bg-canvas 사이를 --motion-duration-base 로 반복 교차(pulse). radius=--radius-md |
| disabled | 쓰이지 않음 | 해당 없음 |
| error | 쓰이지 않음 | 해당 없음 |

## a11y
- a11y:label — `aria-hidden="true"` + 상위 컨테이너에 `aria-busy="true"`. 스크린리더에는 뼈대 도형을 읽히지 않고 "불러오는 중" 한 번만 안내한다(`aria-live="polite"` 텍스트 "불러오는 중")
- a11y:focus — 포커스 대상이 아니다
- a11y:contrast — 장식 요소라 텍스트 대비 기준 대상이 아니다
- a11y:target — 터치 대상 아님
- a11y:role — presentation

## responsive
- <768 / 768~1279 / >=1280 — 부모 영역 크기를 그대로 채운다(고정 크기 없음, 화면 폭에 반응하지 않는다)
