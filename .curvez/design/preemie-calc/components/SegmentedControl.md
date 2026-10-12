# component: SegmentedControl
purpose: 상호 배타적인 선택지 2개 중 하나를 고른다(성별, 측정 자세, 예정일↔주수 모드 전환의 시각 대안). 이 앱에서는 주로 성별 선택에 쓴다
쓰이는 화면: input, input-weeks, growth(측정 자세, 8차 라운드)
요구 ID: PC-F1-AC1, PC-NF-A11Y-3, PC-NF-A11Y-1, F8(CONTEXT)

## props
| 이름 | 타입 | 필수 | 기본값 | 의미 |
|---|---|---|---|---|
| label | string | O | — | "성별" 또는 "측정 자세" |
| options | {value:string; label:string}[] | O | — | [{value:"male",label:"남아"},{value:"female",label:"여아"}] 또는 [{value:"lying",label:"누워서"},{value:"standing",label:"서서"}](growth) |
| value | string \| null | O | — | 선택값. 초기값 없음(강제 선택) |
| required | boolean | X | true | true 면 그룹의 `aria-label` 값 자체를 레이블 텍스트 뒤에 ", 필수" 를 붙인 값(예: "성별, 필수", "측정 자세, 필수")으로 설정한다(`aria-label` 은 속성값 하나가 접근성 이름 전체를 대체하므로 `RequiredMark` 의 sr-only span 을 쓰지 않는다, DSG-04 교정). 그룹 위에 보이는 텍스트 레이블에는 `RequiredMark` 의 시각 별표만 붙는다(DUP-01 통일) |
| onChange | (v: string) => void | O | — | — |

## states
| state | 트리거 | 시각 변화 |
|---|---|---|
| default | 선택 없음 | 트랙 radius=--radius-pill, 두 버튼 모두 bg=--color-bg-surface, border=--color-border-strong, fg=--color-text-primary |
| selected | 옵션 선택됨 | 선택된 버튼 bg=--color-accent-primary, fg=--color-text-on-accent + 좌측에 아이콘 `Check`(--icon-size-sm, 색만으로 선택 상태를 표시하지 않는다, PC-NF-A11Y-1 — 이전 라운드까지 쓰던 "✓" 기호를 실제 아이콘으로 바꿨다) |
| focus-visible | 키보드 포커스 | outline 2px + offset 2px |
| disabled | 쓰이지 않음 | 해당 없음 |
| error | required 인데 미선택 상태로 제출 시도 | input 화면은 폼 레벨 에러 배너 "날짜를 확인하세요" 는 날짜 전용이라 별도 문구를 쓰지 않고, 그룹 테두리를 --color-accent-danger 로 바꾸고 그룹 아래 "성별을 선택하세요" 를 보인다. growth 화면은 측정 자세 미선택 시 같은 방식으로 그룹 아래 "측정 자세를 선택하세요" 를 보인다 |

## a11y
- a11y:label — `role="radiogroup"` + `aria-label="성별"`(또는 "측정 자세", required=true 면 `aria-label` 값을 통째로 "성별, 필수"/"측정 자세, 필수" 로 설정한다 — `RequiredMark` 의 sr-only span 이 아니라 속성값 자체가 레이블 텍스트 뒤에 ", 필수" 를 붙인 값이다, DSG-04 교정). 그룹 위에 보이는 텍스트 레이블에는 `RequiredMark` 의 시각 별표만 붙는다(레이블이 aria-label 로 이미 그룹에 연결돼 있어 별도의 sr-only 텍스트가 필요 없다, DUP-01 통일). 각 버튼은 `role="radio"` + `aria-checked`
- a11y:focus — 방향키(←/→)로 옵션 간 이동, 탭은 그룹 전체에서 한 번만 멈춘다(roving tabindex)
- a11y:contrast — 선택된 버튼 `#FFFFFF/#0E7490` = 5.36(대비 검증 표). 미선택 버튼은 `--color-text-primary/--color-bg-surface` = 15.17
- a11y:target — 버튼 높이 48px, 두 버튼 사이 간격 없음(하나의 트랙처럼 붙여도 되나, 붙일 때도 각 버튼의 클릭 영역은 48px 이상 유지)
- a11y:role — radiogroup/radio (버튼 그룹처럼 보이지만 상호 배타 선택이라 checkbox 가 아니라 radio 의미다)

## responsive
- <768: 두 옵션 가로 배치, 폭 50%씩
- >=1280: 변화 없음(768~1279 도 동일)
