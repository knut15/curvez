# component: DateField
purpose: 날짜 하나(출생일, 출산 예정일, 측정일)를 받는다. 네이티브 `<input type="date">` 를 쓴다(새 날짜 선택 라이브러리를 만들지 않는다)
쓰이는 화면: input, input-weeks, growth(측정일, 8차 라운드)
요구 ID: PC-F1-AC1, PC-F1-AC2, PC-F1-AC3, PC-F1-EX1, PC-F1-EX2, PC-NF-A11Y-3

## props
| 이름 | 타입 | 필수 | 기본값 | 의미 |
|---|---|---|---|---|
| label | string | O | — | "출생일", "출산 예정일" 또는 "측정일" |
| required | boolean | X | true | 이 컴포넌트가 쓰이는 자리는 모두 필수다. true 면 레이블에 `RequiredMark` 스펙(별표 + 스크린리더 접미사 ", 필수")이 적용되어 레이블의 접근성 이름이 "레이블 텍스트 + , 필수"(예: "출생일, 필수", "측정일, 필수")가 된다(DUP-01 통일, DSG-04 교정) |
| value | CalendarDate \| null | O | — | `YYYY-MM-DD` |
| min / max | CalendarDate | X | — | 브라우저 네이티브 제약(출생일의 max=오늘, 측정일의 min=아이 출생일·max=오늘). 값 검증은 별도로 폼 레벨에서 한 번 더 한다(PC-F1-EX1, EX2는 폼 에러 문구로 보인다. `GrowthEntryForm` 의 측정일 에러도 같은 방식이다. 브라우저 제약은 입력을 더 쉽게 만드는 보조 장치일 뿐이다) |
| error | string \| null | X | null | 이 필드 하나만의 에러는 없다(여러 값·필드를 함께 봐야 하는 검증은 폼 레벨 에러 배너로 처리). 항상 null |
| onChange | (v: CalendarDate) => void | O | — | — |

## states
| state | 트리거 | 시각 변화 |
|---|---|---|
| default | — | `TextField` 와 같은 시각(bg=--color-bg-surface, border=--color-border-strong, radius=--radius-md). 레이블 앞에 장식 아이콘 `CalendarDays`(--icon-size-sm, --color-text-muted, `aria-hidden`) |
| focus | 포커스 진입 | border=--color-border-focus |
| filled | value 있음 | 브라우저 기본 날짜 표기(YYYY-MM-DD 또는 로케일 표기) |
| disabled | 쓰이지 않음 | 해당 없음 |
| error | 쓰이지 않음(폼 레벨 에러로 대체) | 해당 없음 — 사유: 위 error prop 설명 참고 |

## a11y
- a11y:label — `<label for>` 연결. required=true 이면 `components/RequiredMark.md` 스펙을 그대로 적용해 별표와 스크린리더 접미사 ", 필수" 를 둔다. 레이블의 접근성 이름은 레이블 텍스트 뒤에 ", 필수" 가 이어진 값(예: "출생일, 필수", "측정일, 필수")이 된다 — 레이블 텍스트가 두 번 들어가지 않는다. `aria-required="true"` 도 함께 둔다(DUP-01 통일, DSG-04 교정). 레이블 앞 `CalendarDays` 아이콘은 `aria-hidden`
- a11y:focus — 네이티브 date picker 가 열려도 Esc 로 닫히고 포커스가 입력칸에 남는다(브라우저 기본 동작을 따른다, 별도 구현 없음)
- a11y:contrast — `TextField` 와 같다(15.17)
- a11y:target — 입력칸 높이 48px
- a11y:role — textbox(네이티브 date input 의 기본 역할을 따른다. 커스텀 role 을 씌우지 않는다)

## responsive
- <768: 폭 100%
- >=1280: 변화 없음(768~1279 도 동일)
