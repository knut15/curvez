# component: GrowthEntryForm
purpose: 측정 기록 하나(측정일·키·몸무게·머리둘레·측정 자세)를 입력받아 추가한다. 다섯 값 모두 이 화면에만 있는 조합이라 별도 화면에 두지 않고 폼 하나로 묶었다
쓰이는 화면: growth
요구 ID: F8(CONTEXT), PC-NF-A11Y-3, PC-NF-MOBILE-2

## props
| 이름 | 타입 | 필수 | 기본값 | 의미 |
|---|---|---|---|---|
| measurementDate | CalendarDate \| null | O | — | 측정일. `DateField` 그대로 씀(max=오늘, min=아이 출생일) |
| heightCm | string | O | — | 키 입력 원문(파싱 전). `TextField`(icon="Ruler", suffix="cm", inputMode=decimal) |
| weightKg | string | O | — | 몸무게 입력 원문. `TextField`(icon="Weight", suffix="kg", inputMode=decimal) |
| headCircumferenceCm | string | O | — | 머리둘레 입력 원문. `TextField`(icon="CircleDashed", suffix="cm", inputMode=decimal) |
| posture | "lying" \| "standing" \| null | O | — | 측정 자세. `SegmentedControl`(label="측정 자세", options=[{value:"lying",label:"누워서"},{value:"standing",label:"서서"}]) — 표준 성장도표가 측정 자세에 따라 참조 구간을 다르게 쓰기 때문에 자세를 그대로 저장한다(연령으로 자동 추정하지 않는다). 옵션 라벨은 SPEC/PRD 에 정해진 문구가 없어 근거 순서 4번(기본 스케일)으로 "누워서"/"서서" 두 값을 정했다 |
| onSubmit | (values: {measurementDate, heightCm, weightKg, headCircumferenceCm, posture}) => void | O | — | 다섯 값이 모두 채워지고 유효성 검사를 통과해야 호출된다 |

## states
| state | 트리거 | 시각 변화 |
|---|---|---|
| default | — | 필드 순서(세로): 측정일 → 키 → 몸무게 → 머리둘레 → 측정 자세 → `Button`(variant=primary, label="기록 추가"). 다섯 필드 모두 `RequiredMark` 스펙 적용(별표+스크린리더 접미사 ", 필수") |
| field-error(숫자 필드) | 키·몸무게·머리둘레 중 하나가 숫자가 아니거나 0 이하 | 해당 `TextField` 만 error 상태(border=--color-accent-danger, 아이콘 `AlertCircle`, 문구 "값을 확인하세요"). 정밀한 임상 상·하한(예: 키 30~120cm)은 SPEC·PRD 어디에도 없어 이 스펙이 지어내지 않는다 — 백분위 계산 자체가 growth-percentile.json 의 LMS 표 정의역 밖 값을 받으면 그 결과(예: 백분위 계산 불가)로 걸러진다(architecture 의 데이터 파일 책임) |
| field-error(측정일) | 측정일이 비었거나, 아이 출생일보다 앞서거나, 오늘보다 뒤임 | 폼 위 배너 "측정일을 확인하세요"(아이콘 `AlertCircle`) — 두 경계(출생일, 오늘)를 함께 보는 검증이라 `DateField` 자체가 아니라 `input` 화면과 같은 폼 레벨 배너로 보여준다 |
| submitting | onSubmit 처리 중 | localStorage 쓰기는 동기 처리라 200ms 미만이다. 로딩 표시를 두지 않는다 |
| disabled | 쓰이지 않음 | 해당 없음 |
| error | 쓰이지 않음(위 field-error 두 항목이 이 컴포넌트의 에러 표현 전부다) | 해당 없음 |

## a11y
- a11y:label — 다섯 필드 모두 각 컴포넌트(`DateField`·`TextField`·`SegmentedControl`)의 a11y:label 규칙을 그대로 따른다(`<label for>` 연결 + `RequiredMark` 접미사 ", 필수"). 아이콘(`Ruler`·`Weight`·`CircleDashed`)은 `aria-hidden`
- a11y:focus — 탭 순서는 측정일 → 키 → 몸무게 → 머리둘레 → 측정 자세 → 저장 버튼. 필드 에러가 발생해도 포커스를 강제로 옮기지 않는다(입력 중 방해 금지, `TextField`·`DateField` 규칙과 동일)
- a11y:contrast — 각 필드는 `TextField`·`DateField`·`SegmentedControl` 문서의 대비 값을 그대로 쓴다(15.17). 에러 문구 `#B91C1C/#FFFFFF`=6.47
- a11y:target — 다섯 필드와 버튼 모두 48px 이상 높이, 필드 사이 --space-3(12px) 간격
- a11y:role — form(암묵적, 별도 `role` 없이 `<form>` 요소). 저장 버튼은 `type="submit"`

## responsive
- <768: 다섯 필드 세로 스택(폭 100%), 저장 버튼 fullWidth
- 768~1279: 세로 스택 유지(짧은 숫자 입력 5개를 가로로 늘어놓으면 오히려 시선이 분산된다). 저장 버튼 최대 320px
- >=1280: 변화 없음(768~1279 와 동일)
