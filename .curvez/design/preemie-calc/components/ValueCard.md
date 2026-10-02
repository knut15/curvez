# component: ValueCard
purpose: 값 하나(아이콘+라벨+큰 값+보조값)를 카드로 보여준다. `AgeSummaryCard` 의 생후/교정 2열 비교와 달리 비교 대상이 없는 단일 값 조회 화면에 쓴다(경감 구간, 교정연령 종료, 목표키, 분유량). 도메인 타입을 모르고 문자열 3개 + 아이콘 이름 하나만 받는다 — 이전에는 `AgeSummaryCard(variant=single)` 가 이 역할을 겸했지만, 같은 층(widgets) 슬라이스인 `age-summary` 를 다른 widgets 슬라이스(`copay-relief-result`, `correction-period-result`)가 런타임으로 부르는 구조 문제(구조 리뷰 PLC-02)가 있어 shared 층의 별도 컴포넌트로 뗐다
쓰이는 화면: copay-relief(icon="Banknote"), correction-period(icon="Hourglass"), target-height(icon="Target", 8차 라운드), formula(icon="Milk", 8차 라운드)
요구 ID: PC-F5-AC1~AC5, PC-F6-AC1, PC-F6-AC2, PC-F6-AC4, PC-F14-AC1~AC3, PC-F15-AC1

## props
| 이름 | 타입 | 필수 | 기본값 | 의미 |
|---|---|---|---|---|
| icon | string (lucide-react export 이름) | O | — | 화면 문맥에 맞는 장식 아이콘. copay-relief="Banknote"(경감/지원금), correction-period="Hourglass"(적용 기간), target-height="Target"(목표), formula="Milk"(분유) |
| tone | primary \| corrected \| pop \| warm \| success | X | primary | `IconBadge` 의 tone 과 카드 상단 강조선 색을 함께 정한다 |
| label | string | O | — | 예: "경감 구간", "목표키 참고", "하루 권장량" |
| value | string | O | — | 예: "5년 3개월". correction-period 처럼 문장형 안내가 필요하면 이 자리에 문장을 그대로 넣는다(예: "24개월까지"). target-height 는 "175.0cm", formula 는 "600~720ml" 처럼 단위 포함 값을 그대로 넣는다 |
| subValue | string \| null | X | null | 예: "종료 예정일: 2031-06-01", target-height 는 "(168.5~181.5cm)". 없으면 이 줄을 그리지 않는다 |

## states
| state | 트리거 | 시각 변화 |
|---|---|---|
| default | value 있음 | bg=--color-bg-surface, radius=--radius-lg, 그림자=--elevation-card. 카드 위쪽에 `IconBadge`(size=lg, icon·tone prop 그대로 전달). 라벨은 `--font-size-subtitle` 크기로 아이콘 아래, 값은 `--font-size-display` 크기로 크게, subValue 는 값 바로 아래 `--font-size-body` 로(있을 때만) |
| loading | 데이터 준비 전(200ms 이상 걸릴 때만) | `Skeleton` 으로 카드 내부를 대체(`IconBadge` 자리도 Skeleton 원형으로) |
| error | 이 컴포넌트는 에러 상태를 갖지 않는다 | 에러는 상위 화면의 `StatePanel` 이 카드 자리를 통째로 대체한다 |

## a11y
- a11y:label — 카드 전체에 `aria-label` 을 별도로 두지 않는다. 내부 텍스트(라벨 → 값 → 보조값 순서)가 그대로 읽히도록 시맨틱 순서를 둔다. `IconBadge` 는 `aria-hidden`
- a11y:focus — 정적 텍스트 카드라 포커스 대상이 아니다(탭 순서에서 건너뛴다)
- a11y:contrast — 라벨·값·보조값 모두 `--color-text-primary`(15.17, 대비 검증 표)를 쓴다
- a11y:target — 카드 자체는 터치 대상이 아니다(터치 요구 없음)
- a11y:role — group. `aria-labelledby` 로 라벨 요소를 가리킨다

## responsive
- <768: 카드 폭 100%
- 768~1279: 카드 폭 최대 480px 중앙 정렬(각 화면 스펙의 result 영역 폭 규칙과 같다)
- >=1280: 카드 폭 최대 560px 중앙 정렬, 카드 내부 패딩 --space-6(32px)로 키운다(화면 자체가 --layout-content-max, 720px 안에서 중앙 정렬되므로 카드가 그 안에서 다시 한번 여백을 갖는다. 카드 자체의 480/560px 값은 본문 컨테이너 폭 통일 대상이 아니다 — 7차 라운드 CONTEXT)
