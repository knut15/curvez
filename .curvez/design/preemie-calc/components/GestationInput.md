# component: GestationInput
purpose: 출생 시 재태주수+일을 받아 출산 예정일을 역산할 수 있게 한다("주수로 입력" 모드일 때 DateField(출산예정일) 대신 쓴다)
쓰이는 화면: input, input-weeks
요구 ID: PC-F1-AC1, PC-F1-AC3, PC-F1-EX1, PC-F13-AC3

## props
| 이름 | 타입 | 필수 | 기본값 | 의미 |
|---|---|---|---|---|
| label | string | O | "출생 시 재태주수" | 두 입력칸을 묶는 하나의 레이블(fieldset legend) |
| weeks | number | O | — | 22~44. `/?weeks=n` 진입 시 n 으로 채워진다(PC-F13-AC3) |
| days | number | O | 0 | 0~6 |
| required | boolean | X | true | true 면 legend 에 `RequiredMark` 스펙(별표 + 스크린리더 접미사 ", 필수")이 적용되어 legend 의 접근성 이름이 legend 텍스트 뒤에 ", 필수" 가 이어진 값(예: "출생 시 재태주수, 필수")이 된다(DUP-01 통일, DSG-04 교정) |
| onChange | (v: {weeks:number; days:number}) => void | O | — | — |

## states
| state | 트리거 | 시각 변화 |
|---|---|---|
| default | — | weeks·days 입력칸 두 개가 가로로 나란히, 각각 `TextField` 와 같은 시각(radius=--radius-md). weeks 뒤에 "주", days 뒤에 "일" 접미 텍스트. legend 앞에 장식 아이콘 `CalendarClock`(--icon-size-sm, --color-text-muted, `aria-hidden`) |
| focus | 포커스 진입 | border=--color-border-focus(포커스가 있는 입력칸에만) |
| disabled | 쓰이지 않음 | 해당 없음 |
| error | 계산 결과 재태일수가 154일 미만·308일 초과(PC-F1-EX1) | 폼 레벨 에러 배너 "날짜를 확인하세요" 로 보인다. 이 컴포넌트 자체는 테두리를 빨강으로 바꾸지 않는다(두 값의 조합 오류라 어느 한 칸만 빨갛게 하면 원인을 잘못 가리킨다) |

## a11y
- a11y:label — `<fieldset>` + `<legend>` 로 "출생 시 재태주수" 를 묶고, weeks 입력칸은 `aria-label="주"`, days 입력칸은 `aria-label="일"` 을 추가로 둔다(레이블이 짧은 접미 텍스트뿐이라 스크린리더에 "주" 하나로만 읽히지 않도록). required=true 이면 legend 텍스트에 `components/RequiredMark.md` 스펙을 그대로 적용해 별표와 스크린리더 접미사 ", 필수" 를 둔다. legend 의 접근성 이름은 legend 텍스트 뒤에 ", 필수" 가 이어진 값(예: "출생 시 재태주수, 필수")이 된다 — legend 텍스트가 두 번 들어가지 않는다(DUP-01 통일, DSG-04 교정)
- a11y:focus — 탭 순서는 weeks → days
- a11y:contrast — `TextField` 와 같다(15.17)
- a11y:target — 각 입력칸 높이 48px, 너비는 최소 64px(2자리 숫자 + 여백), 두 칸 사이 간격 --space-2(8px)
- a11y:role — spinbutton(`<input type="number">` 의 기본 역할)

## responsive
- <768: weeks·days 가로 배치 유지(작은 숫자칸이라 세로로 쌓지 않는다)
- >=1280: 변화 없음(768~1279 도 동일)
