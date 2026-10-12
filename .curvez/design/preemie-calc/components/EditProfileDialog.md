# component: EditProfileDialog
purpose: 이름과 출생 체중(둘 다 선택 입력, SPEC §3)을 저장 이후에 입력하거나 고친다. 첫 입력 시점(input 화면)에는 묻지 않는다(PC-F1-AC1)
쓰이는 화면: dashboard
요구 ID: PC-F1-EX3, PC-F6-AC3, PC-F7-AC1, PC-NF-A11Y-3

## props
| 이름 | 타입 | 필수 | 기본값 | 의미 |
|---|---|---|---|---|
| open | boolean | O | false | — |
| initialName | string \| null | O | — | 열릴 때 이름 입력칸에 채워지는 현재 값(없으면 빈 문자열) |
| initialBirthWeightKg | number \| null | O | — | 열릴 때 체중 입력칸에 채워지는 현재 값(kg 단위). 없으면 빈 입력칸 |
| onSave | (values: { name: string \| null; birthWeightGrams: number \| null }) => void | O | — | `saveProfile` 로 이어진다. 이름은 앞뒤 공백 제거 후 빈 문자열이면 null, 체중은 kg 값을 g 정수로 반올림하거나(예: 1.4 → 1400) 빈 입력칸이면 null |
| onCancel | () => void | O | — | 닫기만 하고 아무 것도 바꾸지 않는다 |

## states
| state | 트리거 | 시각 변화 |
|---|---|---|
| closed | open=false | 그리지 않는다 |
| open | open=true | 화면 중앙에 모달, 배경에 반투명 스크림(rgba(41,37,36,0.45)), 그림자=--elevation-modal, radius=--radius-lg. 제목 옆에 `IconBadge`(icon="Pencil", tone=primary, size=md, 장식). 이름 입력칸에 포커스 |
| error-name | 이름이 20자를 넘음(TextField.maxLength=20) | 이름 입력칸 아래 에러 "이름은 20자 이내로 입력하세요", 저장 버튼 비활성 |
| error-weight | 체중 입력값이 숫자가 아니거나 0.2~6.0(kg) 범위 밖 | 체중 입력칸 아래 에러 "체중을 확인하세요(0.2~6.0kg)", 저장 버튼 비활성. 소수점 첫째 자리까지 입력받고 그 이상은 반올림한다 |
| saving | onSave 처리 중 | localStorage 쓰기는 동기 처리라 200ms 미만이다. 로딩 표시를 두지 않는다 |
| disabled | 쓰이지 않음 | 해당 없음 |

두 입력칸 모두 비워 두면(둘 다 null) 유효성 오류 없이 저장된다 — 이름·출생 체중은 선택 항목이라 빈 값 자체가 유효하다(PC-F1-EX3).

## a11y
- a11y:label — `role="dialog"` + `aria-labelledby`(제목 "프로필 편집") + `aria-describedby`(설명 "이름과 출생 체중은 선택 입력입니다"). 두 입력칸은 TextField 의 `<label for>` 를 그대로 쓴다("이름 (선택)", "출생 체중 (kg, 선택)"). `IconBadge` 는 `aria-hidden`. `TextField` 의 icon prop 으로 이름="UserRound", 출생 체중="Weight" 를 각각 넘긴다(장식, 입력칸 왼쪽)
- a11y:focus — 열리면 포커스가 이름 입력칸으로 이동한다. 닫히면(저장·취소 모두) 포커스가 트리거였던 "프로필 편집" 버튼으로 돌아간다. 열려 있는 동안 포커스는 모달 밖으로 나가지 않는다(focus trap)
- a11y:contrast — "저장" 버튼(primary) `#FFFFFF/#0E7490` = 5.36. "취소" 버튼(secondary) `--color-text-primary/--color-bg-surface` = 15.17. 에러 문구 `#B91C1C/#FFFFFF` = 6.47
- a11y:target — 두 입력칸과 두 버튼 모두 48px 높이. 버튼을 가로로 배치할 때 --touch-target-gap(8px) 이상 간격
- a11y:role — dialog(파괴적 행동이 아니므로 `alertdialog` 를 쓰지 않는다 — `ConfirmDialog` 와 구분되는 지점)

## responsive
- <768: 모달 폭 320px(360px 화면에서 좌우 여백 20px), 화면 중앙
- >=1280: 모달 폭 400px 고정, 화면 중앙(768~1279 도 동일)
