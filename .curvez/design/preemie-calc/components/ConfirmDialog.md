# component: ConfirmDialog
purpose: 되돌릴 수 없는 행동(정보 전체 삭제) 전에 한 번 더 확인받는다
쓰이는 화면: dashboard
요구 ID: PC-F1-AC6

## props
| 이름 | 타입 | 필수 | 기본값 | 의미 |
|---|---|---|---|---|
| open | boolean | O | false | — |
| title | string | O | "정보 전체 삭제" | SPEC 원문 그대로 |
| description | string | O | "저장된 모든 아이 정보가 이 기기에서 사라집니다. 되돌릴 수 없습니다." | — |
| onConfirm | () => void | O | — | `deleteAllChildData()` 실행 후 `/` 로 이동 |
| onCancel | () => void | O | — | 닫기만 하고 아무 것도 지우지 않는다 |

## states
| state | 트리거 | 시각 변화 |
|---|---|---|
| closed | open=false | 그리지 않는다 |
| open | open=true | 화면 중앙에 모달, 배경에 반투명 스크림(rgba(41,37,36,0.45)), 그림자=--elevation-modal, radius=--radius-lg. 제목 옆에 `IconBadge`(icon="AlertTriangle", tone=danger, size=md, 장식) — 위험한 행동임을 색+아이콘으로 미리 알린다(텍스트 제목 "정보 전체 삭제"가 이미 있어 아이콘은 보강일 뿐이다) |
| confirming | onConfirm 처리 중 | localStorage 삭제는 동기 처리라 200ms 미만이다. 로딩 표시를 두지 않는다 |
| disabled | 쓰이지 않음 | 해당 없음 |
| error | 쓰이지 않음 | 해당 없음(삭제는 실패할 수 없는 동기 로컬 연산이다) |

## a11y
- a11y:label — `role="alertdialog"` + `aria-labelledby=title` + `aria-describedby=description`. `IconBadge` 는 `aria-hidden`
- a11y:focus — 열리면 포커스가 "취소" 버튼으로 이동(위험한 쪽인 "삭제"에 기본 포커스를 두지 않는다). 닫히면 포커스가 원래 트리거("정보 전체 삭제" 버튼)로 돌아간다. 모달이 열려 있는 동안 포커스는 모달 밖으로 나가지 않는다(focus trap)
- a11y:contrast — "삭제" 버튼(danger) `#FFFFFF/#B91C1C` = 6.47. "취소" 버튼(secondary) `--color-text-primary/--color-bg-surface` = 15.17
- a11y:target — 두 버튼 모두 48px, 가로 배치 시 --touch-target-gap(8px) 이상 간격
- a11y:role — alertdialog

## responsive
- <768: 모달 폭 320px(360px 화면에서 좌우 여백 20px), 화면 중앙
- >=1280: 모달 폭 400px 고정, 화면 중앙(768~1279 도 동일 — 모달은 좁은 화면 전용 규칙 하나만 두고 그 이상은 폭을 고정한다)
