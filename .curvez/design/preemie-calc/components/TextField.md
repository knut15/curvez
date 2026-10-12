# component: TextField
purpose: 한 줄 텍스트 입력을 받는다. 레이블을 항상 함께 그린다. 처음에는 이름·출생 체중(둘 다 선택, `EditProfileDialog` 안)에만 쓰였지만, 8차 라운드(F8·F14·F15)부터 화면에 직접 배치되는 필수 숫자 입력(키·몸무게·머리둘레·부모 키·분유량 체중)에도 쓴다 — 선택/필수 여부는 `required` prop 하나로 그대로 갈린다(구조 변경 없음)
쓰이는 화면: `EditProfileDialog`(다이얼로그, dashboard 위에서 열림, 이름·출생 체중 선택 입력) · `GrowthEntryForm`(growth 화면 직접 배치, 키·몸무게·머리둘레 필수 입력, 8차 라운드) · target-height(직접 배치, 아빠 키·엄마 키 필수 입력, 8차 라운드) · formula(직접 배치, 체중 필수 입력, 8차 라운드)
요구 ID: PC-F1-EX3, PC-F6-AC3, PC-F7-AC1, PC-NF-A11Y-3, PC-NF-MOBILE-2, PC-F14-AC1~AC3, PC-F14-EX1, PC-F15-AC1~AC3, PC-F15-EX1

## props
| 이름 | 타입 | 필수 | 기본값 | 의미 |
|---|---|---|---|---|
| label | string | O | — | 입력칸 위에 항상 보이는 레이블(placeholder 로 대신하지 않는다) |
| icon | string (lucide-react export 이름) \| null | X | null | 레이블 앞에 붙는 장식 아이콘(--icon-size-sm, --color-text-muted). `EditProfileDialog` 는 이름="UserRound", 출생 체중="Weight". `GrowthEntryForm` 은 키="Ruler", 몸무게="Weight", 머리둘레="CircleDashed". target-height 는 아빠·엄마 키 모두 "Ruler". formula 는 체중="Weight" |
| required | boolean | X | false | true 면 `RequiredMark` 스펙(별표 + 스크린리더 접미사 ", 필수")이 적용되어 레이블의 접근성 이름이 레이블 텍스트 뒤에 ", 필수" 가 이어진 값이 된다(DUP-01 통일, DSG-04 교정). `EditProfileDialog` 의 이름·출생 체중은 선택 입력이라 항상 false, `GrowthEntryForm`·target-height·formula 의 숫자 입력은 모두 필수라 true 다 |
| placeholder | string | X | — | 예시 값. 레이블을 대신하지 않는다 |
| value | string | O | — | 현재 값 |
| inputMode | text \| decimal | X | text | decimal 이면 모바일 키보드가 숫자+소수점 전용으로 뜬다. `<input type="text" inputmode="decimal">` 을 쓴다 — `type="number"` 의 증감 화살표 UI는 쓰지 않는다. 8차 라운드의 키·몸무게·머리둘레·부모 키·분유량 체중 입력은 모두 decimal 이다 |
| suffix | string \| null | X | null | 입력칸 오른쪽에 붙는 단위 표시(예: "kg", "cm"). 값 자체에는 포함하지 않는다 |
| maxLength | number \| null | X | null | 입력 가능한 최대 글자 수(이름=20, `EditProfileDialog` 참고) |
| error | string \| null | X | null | 있으면 입력칸 아래 에러 문구로 보인다 |
| onChange | (v: string) => void | O | — | — |

## states
| state | 트리거 | 시각 변화 |
|---|---|---|
| default | — | bg=--color-bg-surface, border=--color-border-strong, radius=--radius-md, fg=--color-text-primary |
| focus | 포커스 진입 | border=--color-border-focus, outline 2px + offset 1px |
| filled | value 비어있지 않음 | 시각 변화 없음(레이블이 입력칸 밖에 항상 고정돼 있어 "떠 있는 레이블" 애니메이션이 없다) |
| error | error 값이 있음 | border=--color-accent-danger, 입력칸 아래 에러 문구(아이콘 `AlertCircle`(--icon-size-sm) + 빨강 텍스트). 예: "이름은 20자 이내로 입력하세요", "체중을 확인하세요(0.2~6.0kg)"(EditProfileDialog), "값을 확인하세요"(GrowthEntryForm 의 키·몸무게·머리둘레), "부모님 키를 모두 확인하세요"(target-height, SPEC 원문 그대로), "체중을 확인하세요(0.5~15kg)"(formula) |
| disabled | 이 컴포넌트는 쓰이지 않는다 | 해당 없음 — 지금까지 이 컴포넌트가 쓰이는 모든 자리(선택 입력 둘, 필수 숫자 입력 다섯)에 비활성 상태가 필요 없다 |

## a11y
- a11y:label — `<label for>` 로 입력칸과 프로그램적으로 연결한다. 선택 입력(이름·출생 체중)은 레이블에 "(선택)" 을 직접 적는다(예: "이름 (선택)", "출생 체중 (kg, 선택)") — required=false 라 `RequiredMark` 가 그려지지 않으므로 "(선택)" 표기와 겹치지 않는다(PC-F1-EX3). required=true 로 쓰는 자리(키·몸무게·머리둘레·아빠 키·엄마 키·체중)는 `components/RequiredMark.md` 스펙을 그대로 적용해 별표와 스크린리더 접미사 ", 필수" 를 둔다. 레이블의 접근성 이름은 레이블 텍스트 뒤에 ", 필수" 가 이어진 값(예: "키, 필수", "아빠 키, 필수")이 된다(DUP-01 통일, DSG-04 교정). 레이블 앞 icon 은 `aria-hidden`
- a11y:focus — 탭 진입 시 포커스 링이 보인다. 에러 발생 시에도 포커스를 이동시키지 않는다(사용자가 입력 중이면 방해하지 않는다)
- a11y:contrast — 입력 텍스트 `--color-text-primary`/`--color-bg-surface` = 15.17(대비 검증 표). 에러 문구 `#B91C1C`/`#FFFFFF` = 6.47
- a11y:target — 입력칸 높이 48px(=--touch-target-min), 좌우 패딩 --space-3. suffix 텍스트가 있어도 터치 영역은 줄지 않는다
- a11y:role — textbox(기본 `<input type="text">`, inputMode=decimal 이어도 `type="text"` 를 유지한다)

## responsive
- <768: 폭 100%(부모 폼 또는 다이얼로그 폭을 따른다)
- >=1280: 변화 없음(768~1279 도 동일 — 다이얼로그 안에서 쓰일 때는 다이얼로그 자체가 최대 400px 로 제한되고, growth·target-height·formula 화면에 직접 배치될 때는 각 화면의 entry-form 폭 규칙을 따른다)
