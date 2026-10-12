# component: StatePanel
purpose: 데이터를 불러오지 못했을 때(error)나 이 화면에서 논리적으로 보여줄 결과가 없을 때(도메인 empty) 콘텐츠 영역 전체를 대체하는 공용 패널
쓰이는 화면: dashboard, age-basis, checkups, copay-relief, correction-period, share, growth, vaccinations, formula(8차 라운드부터 3개 추가 — 각 화면의 state:error, 일부는 state:empty 도 이 컴포넌트를 쓴다)
요구 ID: PC-F4-EX1, PC-F5-AC4, PC-F15-EX2

## props
| 이름 | 타입 | 필수 | 기본값 | 의미 |
|---|---|---|---|---|
| variant | error \| domain-empty | O | — | error=데이터를 못 불러옴. domain-empty=정상적으로 계산했지만 보여줄 결과가 없음("영유아검진 대상 기간이 끝났습니다", "경감 대상이 아닙니다", "아직 기록이 없습니다", "이 시기에는 일반 권장량을 보여주지 않습니다") |
| message | string | O | — | SPEC 원문 문구를 그대로 쓴다 |
| actionLabel | string | X | — | "처음으로" / "대시보드로" / "계산기 열기" |
| onAction | () => void | X | — | — |

## states
| state | 트리거 | 시각 변화 |
|---|---|---|
| error | variant=error | bg=--color-accent-danger-bg, `IconBadge`(icon="AlertTriangle", tone=danger, size=hero) + message(이전 라운드까지 쓰던 "!" 기호를 실제 아이콘으로 바꿨다), 버튼(secondary)으로 actionLabel(재시도가 아니라 화면 이동이라 아이콘을 더하지 않는다) |
| domain-empty | variant=domain-empty | bg=--color-bg-canvas(경고 느낌이 아니라 중립 정보), `IconBadge`(icon="Info", tone=primary, size=hero) + message 만 크게(--font-size-subtitle), actionLabel 은 선택(예: copay-relief 는 액션 없이 문구만. growth 의 "아직 기록이 없습니다"는 icon="Ruler" 로 화면 맥락에 맞춘 아이콘을 쓴다 — 위 icon 값은 화면별로 덮어쓸 수 있다) |
| disabled | 쓰이지 않음 | 해당 없음 |
| loading | 이 컴포넌트는 로딩 상태를 갖지 않는다 | 로딩은 `Skeleton` 이 맡는다 |

## a11y
- a11y:label — `role="status"`(domain-empty) 또는 `role="alert"`(error)로 진입 시 스크린리더가 message 를 바로 읽는다. `IconBadge` 는 `aria-hidden`
- a11y:focus — error 일 때 actionLabel 버튼으로 포커스를 옮긴다(재시도/복귀 동작을 바로 할 수 있게). domain-empty 는 포커스를 옮기지 않는다(오류가 아니라 정상 결과라 방해하지 않는다)
- a11y:contrast — error 텍스트 `#B91C1C/#FEF2F2` = 5.91(대비 검증 표). domain-empty 텍스트 `--color-text-primary/--color-bg-canvas` = 14.51
- a11y:target — actionLabel 버튼 48px(`Button` 상속)
- a11y:role — error=alert, domain-empty=status

## responsive
- <768: 폭 100%, 상하 패딩 --space-6, `IconBadge` size=lg(hero 는 좁은 화면에서 과하다)
- 768~1279: 폭 최대 480px 중앙, `IconBadge` size=hero
- >=1280: 폭 최대 480px 중앙 유지(에러·빈 상태 패널은 화면이 넓어져도 커지지 않는다 — 짧은 메시지가 넓게 퍼지면 오히려 읽기 어렵다), `IconBadge` size=hero
