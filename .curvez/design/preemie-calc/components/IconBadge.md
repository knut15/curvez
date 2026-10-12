# component: IconBadge
purpose: "색 있는 원 배경 + lucide 아이콘" 패턴을 하나로 묶은 장식용 표시 컴포넌트. 헤더 브랜드 마크, `InfoRow`(nav-card)
아이콘, `ValueCard` 아이콘, `AgeSummaryCard` 라벨 아이콘, `CheckupRoundItem`·`VaccinationRoundItem` 상태 아이콘, `StatePanel` 아이콘 등
3곳 이상에서 같은 패턴이 반복돼 신규 컴포넌트로 승격했다(4차 라운드, "밝고 생기 있는" 리디자인 — tokens.md decisions).
그 자체로는 의미를 전달하지 않는다 — 항상 옆이나 위에 텍스트 라벨이 있는 자리에서만 쓴다(PC-NF-A11Y-1, 아이콘 단독 사용 금지)
쓰이는 화면: input(브랜드 마크), dashboard(브랜드 마크, quick-links 아이콘), age-basis·checkups·copay-relief·correction-period·share·guide(브랜드 마크 또는 항목 아이콘), growth·vaccinations·target-height·formula(브랜드 마크 또는 항목 아이콘, 8차 라운드)
요구 ID: 없음(비기능 일반 원칙 — PC-NF-A11Y-1 을 지키기 위한 순수 장식 컴포넌트)

## props
| 이름 | 타입 | 필수 | 기본값 | 의미 |
|---|---|---|---|---|
| icon | string (lucide-react export 이름) | O | — | 예: "Baby", "Stethoscope", "Banknote", "Hourglass", "CircleHelp", "Ruler", "Target", "Milk" |
| tone | primary \| corrected \| pop \| warm \| success \| danger \| neutral | O | — | 원 배경·아이콘 색 계열. tokens.md 의 5계열 + danger(오류 전용, `StatePanel` variant=error) + neutral(회색, 브랜드 마크가 아닌 중립 장식용) |
| size | sm \| md \| lg \| hero | X | md | sm=원 28px/아이콘 --icon-size-sm, md=원 36px/아이콘 --icon-size-md, lg=원 44px/아이콘 --icon-size-lg, hero=원 56px/아이콘 --icon-size-hero |
| decorative | boolean | X | true | true(기본)면 `aria-hidden="true"`. false 로 쓰는 경우는 없다 — 의미를 담아야 하면 `StatusBadge` 처럼 텍스트 라벨이 있는 별도 컴포넌트를 쓴다(이 컴포넌트는 항상 장식이다) |

## states
| state | 트리거 | 시각 변화 |
|---|---|---|
| default | tone=primary | bg=--color-accent-primary-soft-bg, 아이콘 색=--color-accent-primary |
| default | tone=corrected | bg=--color-accent-corrected-soft-bg, 아이콘 색=--color-accent-corrected |
| default | tone=pop | bg=--color-accent-pop-soft-bg, 아이콘 색=--color-accent-pop |
| default | tone=warm | bg=--color-accent-warm-soft-bg, 아이콘 색=--color-accent-warm |
| default | tone=success | bg=--color-accent-success-soft-bg, 아이콘 색=--color-accent-success |
| default | tone=danger | bg=--color-accent-danger-bg, 아이콘 색=--color-accent-danger |
| default | tone=neutral | bg=--color-status-neutral-bg, 아이콘 색=--color-text-muted |
| disabled | 쓰이지 않음 | 해당 없음(장식 요소라 비활성 상태가 없다) |
| error | 쓰이지 않음 | 해당 없음(tone=danger 가 이 컴포넌트에서 "에러"를 표현하는 방법이다 — 위 default 행 참고. 별도 error 상태를 두지 않는다) |

## a11y
- a11y:label — 항상 `aria-hidden="true"`. 이 컴포넌트가 전달하는 정보는 없다 — 바로 옆 텍스트 라벨이 실제 의미를 담는다(예: `InfoRow`(nav-card)의 "영유아검진 도우미" 텍스트, `IconBadge` 는 그 앞의 원형 장식일 뿐이다)
- a11y:focus — 포커스 대상이 아니다
- a11y:contrast — 장식(아이콘이 배경 원 위에서 시각적으로 구분되면 충분)이지만, 실제로 쓰는 7개 tone 조합 모두 tokens.md 대비 검증 표의 텍스트용 쌍과 같은 색 조합을 재사용한다(예: tone=primary 는 `#0E7490/#E0F7FA`=4.81, tone=danger 는 `#B91C1C/#FEF2F2`=5.91) — 우연히도 텍스트 기준(4.5:1)도 넘는다
- a11y:target — 터치 대상이 아니다(단독으로 클릭되지 않는다 — 클릭 가능한 부모가 있다면 그 부모가 48px 터치 영역을 가진다)
- a11y:role — presentation

## responsive
- <768/768~1279/>=1280 — 크기는 `size` prop 으로만 결정되고 화면 폭에 반응하지 않는다. 화면별로 어느 size 를 쓸지는 각 컴포넌트 문서(`InfoRow`, `ValueCard`, `AgeSummaryCard`, `PageHeader`, `StatePanel`)가 정한다
