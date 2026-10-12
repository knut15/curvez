# component: AgeSummaryCard
purpose: 핵심 숫자 결과를 카드 하나로 보여준다. dashboard 에서는 생후/교정 나이를 나란히(variant=default), share 에서는 같은 레이아웃을 이름·프로필 조작 UI 없이 보여준다(variant=share-preview). 값 하나만 보여주는 화면(경감 구간, 교정연령 종료)은 이 컴포넌트가 아니라 `ValueCard` 를 쓴다(구조 리뷰 PLC-02). 이번 라운드("밝고 생기 있는" 리디자인)에서 두 칸에 각각 연한 그라디언트 배경과 아이콘 라벨을 더해 한눈에 "다른 두 기준"이라는 것이 보이게 했다
쓰이는 화면: dashboard(variant=default), share(variant=share-preview)
요구 ID: PC-F2-AC1~AC5, PC-F2-AC4, PC-F7-AC1, PC-F7-AC2, PC-NF-A11Y-1

## props
| 이름 | 타입 | 필수 | 기본값 | 의미 |
|---|---|---|---|---|
| variant | default \| share-preview | O | default | default=생후+교정 2열. share-preview=default 와 같은 레이아웃이지만 이름·프로필 조작 UI가 없다 |
| chronological | {value:string; label:string} | O | — | 예: value="92일 · 3개월", label="생후" |
| corrected | {kind:"hidden"\|"before-due"\|"after-due"; value:string} \| null | X | — | hidden 이면 corrected 칸 전체를 그리지 않는다(PC-F2-AC4). before-due 면 value="D-25", 보조값="재태 36주 3일"(PC-F2-AC2) |
| basisLine | string | O | — | "생후: 출생일 기준 · 교정: 출산 예정일 기준"(PC-F2-AC5, SPEC 원문) |
| nextMonthDates | {chronological:string; corrected:string\|null} | X | — | "생후 4개월: 2026-07-01" / "교정 2개월: 2026-06-26"(PC-F2-AC3) |

## states
| state | 트리거 | 시각 변화 |
|---|---|---|
| default | corrected 있음 | 2열. 생후 칸 배경=--gradient-card-primary-soft, 교정 칸 배경=--gradient-card-corrected-soft(각 칸이 은은한 색 면으로 구분된다 — 장식일 뿐, PC-NF-A11Y-1 준수는 아래 텍스트+아이콘 조합이 맡는다). 각 칸 위쪽에 `IconBadge`(size=lg) — 생후 칸 icon="CalendarDays" tone=primary, 교정 칸 icon="Sparkles" tone=corrected. 각 칸의 텍스트는 라벨과 값이 붙은 하나의 문구로 보인다 — 생후 칸="생후 {chronological.value}", 교정 칸="교정 {corrected.value}"(두 칸이 같은 규칙을 따른다. 색만으로도 아이콘만으로도 구분하지 않는다 — 텍스트 라벨이 항상 함께 있다, PC-NF-A11Y-1). **이 "{라벨} {값}" 한 문구 규칙은 2026-09-29 교정 라운드(ACC-02)에서 못 박은 그대로 유지한다 — 라벨을 별도 헤딩 요소로 먼저 그리지 않는다**. 값 문구 안의 공백 조각(예: "92일", "·", "3개월", 날짜 "2026-06-26")은 각각 `white-space: nowrap` 을 걸어 조각 내부가 줄 끝에서 끊기지 않게 한다(2026-09-30 6차 라운드 결함 수정) — 전역 `word-break: keep-all`(tokens.md)은 한글 음절 사이 줄바꿈만 막고 숫자-한글 경계("92"와 "일" 사이 등)의 줄바꿈 기회는 막지 못해 별도 처리가 필요했다. 이 규칙은 `chronological.value`·`corrected.value`·`corrected.subValue`·`nextMonthDates` 문구 전체에 적용되고, 조각 사이 공백은 그대로 줄바꿈 지점으로 남아 문장 전체는 여러 줄로 접힐 수 있다 |
| corrected-hidden | corrected=null(재태 37주 이상) | 생후 칸만 폭 100%로 보인다(배경·아이콘 그대로). "교정 나이는 재태 37주 이상이라 표시하지 않습니다" 를 카드 아래 한 줄로 덧붙인다(PC-F2-AC4) |
| loading | 데이터 준비 전(200ms 이상 걸릴 때만) | `Skeleton` 으로 카드 내부를 대체(그라디언트 배경도 Skeleton 의 pulse 배경으로 대체된다) |
| error | 이 컴포넌트는 에러 상태를 갖지 않는다 | 에러는 상위 화면의 `StatePanel` 이 카드 자리를 통째로 대체한다 |

## a11y
- a11y:label — 카드 전체에 `aria-label` 을 별도로 두지 않는다. 내부 텍스트("생후 {value}", "교정 {value}")가 그대로 읽히도록 시맨틱 순서를 그대로 둔다(라벨이 이미 값 문구 안에 있어 별도 라벨 요소가 필요 없다). `IconBadge` 는 `aria-hidden`
- a11y:focus — 정적 텍스트 카드라 포커스 대상이 아니다(탭 순서에서 건너뛴다)
- a11y:contrast — 그라디언트 배경은 장식용이라 텍스트 대비 규정 대상이 아니다(배경 자체가 `#FFFFFF`에 가깝게 끝나는 그라디언트라 텍스트가 항상 밝은 영역 위에 온다). 값 텍스트("생후 92일 · 3개월" 등)는 `--color-text-primary`(15.17, 대비 검증 표)를 쓴다 — 그라디언트 시작색(`#E0F7FA`/`#F3ECFF`) 위에서도 `#292524` 는 각각 13대 이상으로 여유 있게 통과한다(흰색보다 짙지 않은 배경이라 대비가 더 커진다)
- a11y:target — 카드 자체는 터치 대상이 아니다(터치 요구 없음)
- a11y:role — group. `aria-labelledby` 로 라벨 요소를 가리킨다

## responsive
- <768: default variant 는 2열을 유지하되(가로 폭이 좁아 생후·교정이 한눈에 나란히 보이는 것이 핵심 가치라 세로로 쌓지 않는다), 각 칸 안 텍스트 크기를 --font-size-body-lg 로 줄이고 `IconBadge` size=md 로 줄인다(360px 폭에서 두 칸이 겹치지 않도록)
- 768~1279: 카드 폭 100%(화면 본문 컨테이너 `--layout-content-max`=720px 를 그대로 채운다 — 이전 라운드는 480px 로 제한했으나 7차 라운드부터 dashboard·share 모두 같은 컨테이너 폭 규칙을 쓴다). 내부 폰트는 tokens.md 기본값(--font-size-display), `IconBadge` size=lg
- >=1280: 화면 본문 컨테이너(`--layout-content-max`=720px) 폭 전체를 그대로 채운다(이전 라운드는 dashboard 의 1120px 2열 main 컬럼 폭까지 넓혔으나, 2열 구조가 없어지면서 이제 나머지 8개 화면과 같은 720px 상한을 쓴다). 두 칸 사이 간격을 --space-6(32px)로 넓히고 `IconBadge` size=lg 유지. 카드 폭이 더 이상 1120px 까지 넓어지지 않으므로 이전 라운드의 34px 데스크톱 전용 숫자 크기는 폐기하고 tokens.md 기본값(--font-size-display, 28px)을 그대로 쓴다
