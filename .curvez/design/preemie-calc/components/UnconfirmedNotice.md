# component: UnconfirmedNotice
purpose: PRD §9 미결에 걸려 "미확정" 상태인 값을 쓰는 화면에서, 그 값이 잠정값임을 사용자에게 알린다(색만이 아니라 기호+텍스트로). 8차 라운드부터 `text` prop 을 그대로 활용해 formula 화면의 "기준 확인 중"(PC-F15-EX3, SPEC 원문 그대로) 표시에도 재사용한다 — 새 컴포넌트를 만들지 않는다
쓰이는 화면: checkups(questionnaireCorrection 미확정 시), copay-relief(innerBoundary·endDateMethod 미확정 시), correction-period(ageBasis 미확정 시), formula(분유량 계수가 미확정인 교정 나이 구간, 8차 라운드)
요구 ID: PRD §9 미결 1·2·3, standing.md 5번("미확정" 표시 하나로 정의), PC-F15-EX3

## props
| 이름 | 타입 | 필수 | 기본값 | 의미 |
|---|---|---|---|---|
| text | string | X | "이 값은 공식 원문 확인 전 잠정값입니다" | 화면마다 다른 설명을 덮어쓸 수 있다. formula 는 "기준 확인 중"(SPEC 원문 그대로, PC-F15-EX3)을 그대로 넘긴다 |

## states
| state | 트리거 | 시각 변화 |
|---|---|---|
| default | 해당 값의 `Settled<T>.status === "미확정"` | bg=--color-notice-bg, fg=--color-notice-text, radius=--radius-md, 좌측에 아이콘 `AlertTriangle`(--icon-size-md, 이전 라운드까지 쓰던 "△" 기호를 실제 아이콘으로 바꿨다) + 굵게 "미확정" 라벨 + text 설명. formula 화면은 "미확정" 라벨 대신 "기준 확인 중" 문구 하나만 text 로 채워 SPEC 원문 글자 수를 그대로 지킨다(화면 쪽 문서 참고) |
| hidden | `Settled<T>.status === "확정"` | 이 컴포넌트 자체를 그리지 않는다(값이 확정되면 이 컴포넌트도 화면에서 빠진다 — 코드는 고치지 않고 데이터 파일의 status 만 바뀐다는 architecture 의 원칙과 같다) |
| disabled | 쓰이지 않음 | 해당 없음 |
| error | 쓰이지 않음 | 해당 없음 |

## a11y
- a11y:label — `AlertTriangle` 아이콘은 `aria-hidden="true"`, "미확정"(또는 formula 의 "기준 확인 중") 텍스트가 접근 이름이다
- a11y:focus — 포커스 대상이 아니다(정적 안내)
- a11y:contrast — `#9A3412/#FFF7ED` = 6.88(대비 검증 표)
- a11y:target — 터치 대상 없음
- a11y:role — note(정보성 텍스트 블록. alert 는 아니다 — 사용자 행동을 막지 않는 참고 정보라 assertive 하게 끼어들지 않는다)

## responsive
- <768: 폭 100%, 좌우 여백 --space-4
- >=1280: 부모 콘텐츠 폭과 같다(768~1279 도 동일)
