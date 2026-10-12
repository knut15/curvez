# 디자인 토큰 — preemie-calc

기준 폭: **360px** (모바일 우선, PC-NF-MOBILE-1). 데스크톱 기준 폭은 **1280px** 다(이번 라운드 지시 — 좁은 360px 칸만
가운데 덩그러니 있지 않게 폭별 레이아웃 값을 정한다. `## 레이아웃` 참고). 다크 모드는 이번 범위가 아니다(라이트 한 벌) —
이전 라운드 CONTEXT 지시가 그대로 유지된다. 아래 표는 `curvez-designer` 기본 형식(라이트·다크 동시 표)이 아니라
**라이트 한 칸**으로 적는다.

> **2026-09-29 4차 라운드(밝고 생기 있는 리디자인):** 사용자 지시("디자인이 좀더 예쁘면 좋겠는데?" → 분위기 "밝고
> 생기 있는", 범위 "화면 구성도 다시", "헤더 타이틀은 중앙에 정렬")에 따라 이 문서를 전면 교체했다. 바뀐 것 셋 —
> ① 색 팔레트를 파랑 단색 + 회색 중심에서 5개 뚜렷한 포인트 색(생후=청록, 교정=보라, 포인트=핑크, 하이라이트=호박,
> 완료=초록)으로 넓혔다. 모든 새 쌍은 이 문서 끝 `## 대비 검증` 에서 node 로 실측했다(20쌍 전부 4.5 이상, 3:1 예외
> 없음). ② `lucide-react ^1.41.0`(handwork 와 같은 버전, 사용자 승인) 아이콘을 도입했다 — 새 카테고리 `icon`(크기
> 토큰) 을 더했다. ③ 헤더 좌우 여백을 대칭으로 고정하는 `layout` 카테고리와, CSS만으로 그리는 장식 배경을 위한
> `gradient` 카테고리를 더했다. 라디우스도 8/12/20 으로 더 둥글게 올렸다(친근한 인상). 자세한 이유는 `## decisions`.

새 폰트 패키지는 쓰지 않는다(폰트는 시스템 글꼴 스택 유지). 아이콘은 **lucide-react** 하나만 쓴다 — 새 이미지 에셋,
직접 그린 SVG, 다른 아이콘 라이브러리를 추가하지 않는다. 일러스트가 필요한 자리는 lucide 아이콘 조합 + 색 면(CSS
그라디언트·도형)으로만 표현한다. 그 이상(사진, 일러스트 에셋, 커스텀 SVG)이 필요하다고 판단되면 이 문서가 아니라
`decisions`·`blocked_on` 에 적는다(이번 라운드에는 없었다).

## 이름 규칙

`--<category>-<role>-<variant>` (소문자 kebab-case). `category` ∈ `color`·`space`·`font`·`radius`·`elevation`·`motion`·
`touch`·`icon`(신규, 아이콘 크기)·`layout`(신규, 헤더·컨테이너 폭 같은 레이아웃 상수)·`gradient`(신규, CSS 장식 배경).
값 이름(청록/보라 등)을 넣지 않고 의미(role)로 짓는다.

## 색

의미 5계열 — **생후**(청록, 브랜드 프라이머리) · **교정**(보라) · **포인트**(핑크, 축하·강조·"+아이 추가" 같은
행동 유도) · **하이라이트**(호박, "오늘"처럼 지금 이 순간을 가리킴) · **완료**(초록, "지남"). 다섯 계열 모두
"색+아이콘+텍스트 라벨" 세 겹으로만 의미를 전달한다(색·아이콘 단독 사용 금지, PC-NF-A11Y-1 + 이번 라운드 CONTEXT
"아이콘만으로도 금지 — 글자 병기").

| 토큰 | 값 | 용도 |
|---|---|---|
| `--color-bg-canvas` | `#FFF9F2` | 화면 최하단 배경(따뜻한 아이보리) |
| `--color-bg-surface` | `#FFFFFF` | 카드·시트·입력칸·모달 배경 |
| `--color-text-primary` | `#292524` | 본문 |
| `--color-text-muted` | `#57534E` | 보조 설명, 라벨, 메타(출처·기준일) |
| `--color-text-on-accent` | `#FFFFFF` | accent 배경 위 텍스트 |
| `--color-text-disabled` | `#A8A29E` | 비활성 입력·버튼 텍스트 (WCAG 1.4.11 예외 대상. 4.5:1 요구하지 않음) |
| `--color-accent-primary` | `#0E7490` | "생후" 계열 강조, 기본 CTA 배경, 브랜드 프라이머리 |
| `--color-accent-primary-hover` | `#155E75` | 기본 CTA hover/pressed |
| `--color-accent-primary-disabled` | `#9FCBD6` | 기본 CTA 비활성 배경 (텍스트는 `--color-text-on-accent` 유지, 대비 열외) |
| `--color-accent-primary-soft-bg` | `#E0F7FA` | "생후" 계열 아이콘 칩·카드 은은한 배경 |
| `--color-accent-corrected` | `#7C3AED` | "교정" 계열 강조 |
| `--color-accent-corrected-soft-bg` | `#F3ECFF` | "교정" 계열 아이콘 칩·카드 은은한 배경 |
| `--color-accent-pop` | `#BE185D` | 포인트 강조 배경("+ 아이 추가" 버튼, 축하·선택 표시) |
| `--color-accent-pop-soft-bg` | `#FCE7F3` | 포인트 계열 은은한 배경 |
| `--color-accent-warm` | `#B45309` | "오늘"·하이라이트 강조 |
| `--color-accent-warm-soft-bg` | `#FEF3C7` | 하이라이트 계열 은은한 배경 |
| `--color-accent-success` | `#047857` | "지남·완료" 강조 |
| `--color-accent-success-soft-bg` | `#D1FAE5` | 완료 계열 은은한 배경 |
| `--color-accent-danger` | `#B91C1C` | 위험 버튼 배경, 오류 텍스트 (변경 없음 — 기존 값이 이미 5개 새 계열과 겹치지 않고 대비도 충분하다) |
| `--color-accent-danger-bg` | `#FEF2F2` | 오류 패널 배경 |
| `--color-border-subtle` | `#EDE7DE` | 구분선, 카드 테두리(따뜻한 톤) |
| `--color-border-strong` | `#A8A29E` | 입력칸 기본 테두리 |
| `--color-border-focus` | `#0E7490` | 포커스 링(브랜드 프라이머리 재사용 — 텍스트 대비가 아니라 시각적 outline 이라 별도 색을 만들지 않는다) |
| `--color-status-past-bg` | `#D1FAE5` | 지난 항목 배경(검진 차수 등). "완료" 계열 재사용 |
| `--color-status-past-text` | `#047857` | 지난 항목 텍스트. 라벨 "지남" + 아이콘 `CircleCheckBig` 동반 |
| `--color-status-current-bg` | `#FEF3C7` | 오늘 항목 배경. "하이라이트" 계열 재사용 |
| `--color-status-current-text` | `#B45309` | 오늘 항목 텍스트. 라벨 "오늘" + 아이콘 `CircleDot` 동반 |
| `--color-status-upcoming-bg` | `#FFFFFF` | 예정 항목 배경(테두리만) |
| `--color-status-upcoming-text` | `#292524` | 예정 항목 텍스트. 라벨 "예정" + 아이콘 `Circle` 동반 |
| `--color-status-neutral-bg` | `#F5F5F4` | "대상 아님"·"해당 없음" 배경 |
| `--color-status-neutral-text` | `#57534E` | "대상 아님"·"해당 없음" 텍스트. 아이콘 `Minus` 동반 |
| `--color-notice-bg` | `#FFF7ED` | "미확정" 표시 배경(호박과 구분되는 별도 주황 — 의미가 다르면 값이 비슷해도 토큰을 나눈다) |
| `--color-notice-text` | `#9A3412` | "미확정" 표시 텍스트. 아이콘 `AlertTriangle` 동반 |

8차 라운드(F10 예방접종 일정)의 "완료"·"임박"·"놓침" 배지는 위 표의 기존 값(완료=--color-status-past-*, 임박=
--color-status-current-*, 놓침=--color-accent-danger*)을 그대로 재사용한다 — 새 색을 추가하지 않았다
(`components/StatusBadge.md` 참고).

## 간격 (px, 4pt 그리드)

| 토큰 | 값 | 용도 |
|---|---|---|
| `--space-1` | 4 | 아이콘-텍스트 밀착 간격 |
| `--space-2` | 8 | 라벨-입력칸 간격, 배지 내부 패딩 |
| `--space-3` | 12 | 입력칸 내부 패딩, 리스트 항목 내부 간격 |
| `--space-4` | 16 | 화면 좌우 여백(360px 기준), 카드 내부 패딩 |
| `--space-5` | 24 | 섹션 사이 간격 |
| `--space-6` | 32 | 화면 상단 여백, 큰 섹션 구분 |
| `--space-7` | 48 | 화면 하단 여백, 버튼 그룹과 disclaimer 사이 |
| `--space-8` | 64 | 데스크톱(≥1280px) 섹션 간격, 데스크톱 화면 상하 여백 |

## 레이아웃 (신규 카테고리 — 브레이크포인트, 헤더·컨테이너 폭)

> **2026-09-30 7차 라운드(본문 폭 720px 한 열로 통일):** 사용자 원문 "가로사이즈는 메인과 서브가 동일하게 만들어
> 왔다갔다하지말고" → 9개 화면(input·input-weeks·dashboard·age-basis·checkups·copay-relief·correction-period·
> share·guide) 전부가 본문 콘텐츠 최대 폭 하나(`--layout-content-max`, 720px)를 쓴다. 화면을 옮겨도 좌우 기준선이
> 바뀌지 않는다. dashboard 의 main+sidebar 2열(1120px) 구조는 이번 라운드로 없앴다(1열, `screens/dashboard.md`
> 참고) — 그래서 사이드바 폭·열 간격 토큰도 함께 폐기했다. 좌우 패딩도 폭 구간별로 값 하나만 쓴다 — <1280px:
> `--space-4`(16px), ≥1280px: `--space-6`(32px). 자세한 이유는 `## decisions`, `index.md` 7차 라운드 절 참고.

| 토큰 | 값 | 용도 |
|---|---|---|
| `--layout-breakpoint-tablet` | 768 (px) | 이 폭부터 좌우 패딩이 한 단계 바뀐다(콘텐츠 최대 폭 자체는 바뀌지 않는다 — 7차 라운드부터 폭은 전 구간에서 `--layout-content-max` 하나) |
| `--layout-breakpoint-desktop` | 1280 (px) | 이 폭부터 좌우 패딩이 --space-6(32px)로 한 번 더 바뀐다(콘텐츠 최대 폭은 역시 바뀌지 않는다) |
| `--layout-header-height` | 64 | `PageHeader` 높이(모든 variant, 모든 폭 공통) |
| `--layout-header-side-reserve` | 112 | 헤더 좌/우 zone 이 항상 서로 같은 최소 폭으로 예약하는 값. "더보기"(아이콘+"더보기", 약 96px)와 "대비 버튼(아이콘+"대시보드", 약 108px) 중 더 넓은 쪽을 기준으로 여유를 둔 값이다. 한쪽 zone 이 비어 있어도(title-only variant) 이 폭만큼 비워 두어 제목이 항상 화면 정중앙에 온다(헤더 가운데 정렬 규칙) |
| `--layout-content-max` | 720 | 9개(8차 라운드부터 13개) 화면 전부가 쓰는 유일한 **본문 글 영역**(글이 흐르는 안쪽 읽기 칸) 최대 폭. 360px 폭에서는 이 값에 닿지 않고 자연히 100%-32px(좌우 --space-4 각 16px)로 찬다. 768px·1280px 이상에서도 이 값에서 더 넓어지지 않고 가운데 정렬된다. 헤더 내부 3분할 그리드, dashboard content, input·input-weeks·share 의 폼·카드 컨테이너, age-basis·checkups·copay-relief·correction-period·guide·growth·vaccinations·target-height·formula 의 content 컨테이너가 전부 이 토큰 하나를 쓴다 |
| ~~`--layout-content-max-mobile`~~ | ~~400~~ | **폐기(7차 라운드)** — `--layout-content-max` 로 통합. 이전에는 input·input-weeks 의 form-card 만 이 값으로 좁혔으나, 다른 화면과 좌우 기준선을 맞추기 위해 카드를 컨테이너 폭 전체로 채우는 쪽으로 바꿨다(`screens/input.md` 참고) |
| ~~`--layout-content-max-tablet`~~ | ~~640~~ | **폐기(7차 라운드)** — `--layout-content-max`(720)로 통합 |
| ~~`--layout-content-max-desktop-narrow`~~ | ~~640~~ | **폐기(7차 라운드)** — `--layout-content-max`(720)로 통합 |
| ~~`--layout-container-max-desktop`~~ | ~~1120~~ | **폐기(7차 라운드)** — dashboard 2열(main+sidebar) 구조 자체를 없애 1열로 통일했다. 이 값을 쓰던 화면은 이제 `--layout-content-max`(720)를 쓴다 |
| ~~`--layout-dashboard-sidebar-width`~~ | ~~360~~ | **폐기(7차 라운드)** — 같은 이유(2열 구조 폐기) |
| ~~`--layout-column-gap-desktop`~~ | ~~32~~ | **폐기(7차 라운드)** — 같은 이유(2열 구조 폐기) |

> **2026-09-30 8차 라운드(글 영역 720px · 박스 784px 명문화):** 사용자 원문 "가로사이즈는... 본문 글 영역을
> 720px(박스 784px)로" — 위 `--layout-content-max`(720) 의 의미를 이번 라운드에서 **"바깥 박스(카드·컨테이너) 폭"
> 이 아니라 "글이 실제로 흐르는 안쪽 영역 폭"** 으로 명확히 했다. 지금까지 각 화면 파일의 `## responsive` 가 이미
> "content 폭 최대 --layout-content-max(720px) 중앙 정렬, **좌우 여백** --space-4/--space-6"이라고 적어 왔는데,
> 이 "좌우 여백"은 애초부터 720px 칸의 **바깥쪽**(뷰포트 가장자리 ~ 720px 칸 사이)을 가리키는 값이었다 — 즉 기존
> 9개 화면의 수치는 바뀌지 않는다. 이번 라운드는 이 계산을 명시적인 숫자(박스 폭)로 한 번 더 적어, 구현자가 "720이
> 카드 폭인가 글 영역인가"를 추측하지 않게 한다:
>
> | 폭 구간 | 글 영역(`--layout-content-max`) | 좌우 여백(바깥) | 계산된 박스 폭 |
> |---|---|---|---|
> | <768px(모바일) | 720에 닿지 않음(뷰포트가 더 좁다) | --space-4(16px) 각 1회 | 뷰포트 폭 그대로(예: 360px 뷰포트 → 328px 안쪽 칸 + 좌우 16px) |
> | 768~1279px(태블릿) | 720 | --space-4(16px) 각 1회 | 720+16×2=**752px** |
> | ≥1280px(데스크톱) | 720 | --space-6(32px) 각 1회 | 720+32×2=**784px**(사용자 지시 원문의 "박스 784px"과 일치) |
>
> 이 표는 계산 결과를 보여줄 뿐, 새 토큰을 만들지 않는다 — `--layout-content-max`(720)와 각 화면의 기존 "좌우
> 여백" 값(--space-4/--space-6)을 그대로 더한 값이다. 기존 9개 화면 파일의 `## responsive` 문구를 다시 쓸 필요가
> 없다(수치 변경이 아니라 이 토큰이 가리키는 것이 "박스"가 아니라 "글 영역"이라는 의미 확정이다) — 8차 라운드에서
> 새로 만든 growth·vaccinations·target-height·formula 4개 화면도 같은 규칙을 그대로 따른다

## 글자 크기 (px)

본문 기준은 **17px 이상**이다(PC-NF-MOBILE-2). `--font-size-meta`(출처·기준일 캡션)만 본문이 아닌 부가 정보로
보고 17px 미만을 허용한다 — `decisions` 참고(이전 라운드 결정, 변경 없음).

| 토큰 | 값 | line-height | 용도 |
|---|---|---|---|
| `--font-size-display` | 28 | 1.25 | 핵심 숫자(생후/교정 일수) |
| `--font-size-title` | 20 | 1.3 | 화면 제목 |
| `--font-size-subtitle` | 18 | 1.35 | 섹션 소제목, 카드 제목 |
| `--font-size-body` | 17 | 1.5 | 본문 최소 크기 |
| `--font-size-body-lg` | 19 | 1.5 | 카드 안 강조 본문 |
| `--font-size-button` | 17 | 1.2 | 버튼 라벨 |
| `--font-size-meta` | 14 | 1.4 | 출처·기준일·타임스탬프 (본문 아님) |

폰트 스택: `-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif` (변경 없음).

## 줄바꿈 규칙 (전역, 2026-09-30 6차 라운드 — 구현 결함 역보정)

한국어 본문은 `word-break: keep-all`(전역, `body` 요소 한 곳에 선언)로 **어절 단위로만** 줄바꿈한다 — 음절 중간에서
끊기지 않는다. 캡처에서 "교정연령 적 / 용 종료 안내" 처럼 단어 중간이 끊기는 결함이 여러 화면(헤더 제목, 버튼
라벨)에서 보여 전역으로 적용했다(근거 순서 3번, 한국어 웹 타이포 관례).

- `overflow-wrap: break-word` 를 `PageHeader` 제목처럼 폭이 아주 좁아질 수 있는 자리에 안전망으로 함께 둔다 —
  `keep-all` 로도 쪼갤 수 없는(한 단어가 칸보다 넓은) 극단적인 경우에만 개입한다(`components/PageHeader.md` 참고)
- 숫자+단위·날짜처럼 **한 덩어리로 읽혀야 하는 조각**(예: "92일", "2026-06-26")은 `keep-all` 만으로 보호되지
  않는다 — `keep-all` 은 한글 음절 사이만 막을 뿐, 숫자-한글 경계("92"와 "일" 사이)의 줄바꿈 기회는 막지 못한다.
  이런 값은 컴포넌트가 공백으로 나눈 조각마다 `white-space: nowrap` 을 개별로 걸어야 한다(`components/AgeSummaryCard.md`
  참고)
- 버튼 라벨처럼 항상 한 줄이어야 하는 짧은 문구는 컴포넌트 차원에서 `white-space: nowrap` 을 쓴다(`components/Button.md`
  참고) — `keep-all` 은 줄바꿈을 허용하되 그 지점을 어절 단위로 좁힐 뿐, 줄바꿈 자체를 막지는 않는다

## 아이콘 (신규 카테고리)

`lucide-react` 컴포넌트를 그대로 쓴다(예: `import { Baby } from "lucide-react"`). 아래 크기만 쓰고, 임의 크기를
만들지 않는다. 색은 위 `## 색` 표의 토큰을 그대로 쓰고, 장식용(정보를 담지 않는) 아이콘은 항상 `aria-hidden="true"`
를 둔다. 개별 아이콘 이름 목록(어느 아이콘을 어디에 쓰는지)은 `index.md`의 `## 아이콘 목록`에 있다 — 이 문서는
크기 토큰만 정의한다.

| 토큰 | 값 (px) | 용도 |
|---|---|---|
| `--icon-size-sm` | 16 | 인라인 배지 안 아이콘(StatusBadge 등) |
| `--icon-size-md` | 20 | 버튼 안 아이콘, 헤더 액션 아이콘 |
| `--icon-size-lg` | 24 | `IconBadge` 안 아이콘(nav-card, ValueCard) |
| `--icon-size-xl` | 32 | `AgeSummaryCard` 라벨 아이콘 |
| `--icon-size-hero` | 40 | 헤더 브랜드 마크, 빈 상태·에러 패널 아이콘 |

## 그라디언트 · 장식 배경 (신규 카테고리 — CSS로만 그린다, 이미지 없음)

| 토큰 | 값 | 용도 |
|---|---|---|
| `--gradient-hero-canvas` | `radial-gradient(120% 90% at 50% -10%, #E0F7FA 0%, #FFF9F2 55%, #FFF9F2 100%)` | input·input-weeks·share 화면의 헤더~폼 상단 배경(은은한 청록 광원 느낌) |
| `--gradient-card-primary-soft` | `linear-gradient(135deg, #E0F7FA 0%, #FFFFFF 62%)` | `AgeSummaryCard` "생후" 칸 배경 |
| `--gradient-card-corrected-soft` | `linear-gradient(135deg, #F3ECFF 0%, #FFFFFF 62%)` | `AgeSummaryCard` "교정" 칸 배경 |

## 반경 · 터치 영역

라디우스를 이전 라운드(4/8/16)보다 더 둥글게 올렸다 — "밝고 생기 있는" 인상은 모서리가 둥글수록 친근하게 읽힌다
(근거 순서 4번, 기본 스케일. `decisions` 참고).

| 토큰 | 값 | 용도 |
|---|---|---|
| `--radius-sm` | 8 | 배지, 인라인 칩 |
| `--radius-md` | 12 | 입력칸, 버튼 |
| `--radius-lg` | 20 | 카드, 모달 |
| `--radius-pill` | 999 | 탭, 상태 배지, "+ 아이 추가" 버튼 |
| `--touch-target-min` | 48 | 버튼·탭·입력칸 높이 최소값(PC-NF-MOBILE-3, 변경 없음) |
| `--touch-target-gap` | 8 | 인접 터치 요소 사이 최소 간격(변경 없음) |

## elevation · motion

| 토큰 | 값 | 용도 |
|---|---|---|
| `--elevation-card` | `0 2px 8px rgba(41,37,36,0.08)` | 카드 그림자 |
| `--elevation-modal` | `0 16px 40px rgba(41,37,36,0.22)` | ConfirmDialog·EditProfileDialog·HeaderMenu 팝오버 |
| `--motion-duration-fast` | 150ms | 버튼 pressed, 배지 전환 |
| `--motion-duration-base` | 200ms | 카드 진입, 토스트 |
| `--motion-easing-standard` | `cubic-bezier(0.2,0,0,1)` | 대부분의 전환(이동·페이드) |
| `--motion-easing-playful` | `cubic-bezier(0.34,1.56,0.64,1)` | 신규. 살짝 튕기는 느낌의 강조 전환 한정 사용 — `ChildSwitcherTabs` 선택 전환, `ShareActionButton` "복사했습니다"/"문구를 복사했어요" 아이콘 전환, `StatusBadge` current 진입 애니메이션. 화면 전환·레이아웃 이동에는 쓰지 않는다(멀미 유발 방지, 딱 세 곳으로 제한) |

## 대비 검증

아래 쌍은 실제로 화면에서 겹치는 글자색·배경색 조합이다(아이콘 색도 텍스트와 같은 토큰을 재사용하므로 이 표가
아이콘 대비도 함께 보증한다). `mode=light` 만 있다(다크 범위 밖). 전부 4.5:1 이상으로 맞춰, 3:1 예외(큰 글자·아이콘)를
쓴 쌍은 없다. 8차 라운드(F8·F10·F14·F15)는 새 색 쌍을 만들지 않고 이 20쌍만 재사용했다(각 컴포넌트 문서의 "새 색을
만들지 않는다" 표기 참고) — 그래서 이 표는 4차 라운드 실측 그대로다. 9차 라운드(F8 AC3 추이 그래프)에서 `GrowthTrendChart`
의 실측값 선 색(`#0E7490`, 카드 배경 `#FFFFFF` 위)을 추가로 확인해 21쌍이 됐다 — 이 값은 기존 "CTA 라벨/primary"
쌍과 전경·배경만 바뀐 같은 색 조합이라(명도 대비 공식은 순서 무관) 새로 계산해도 같은 5.36이 나왔다.

- fg=#292524 bg=#FFF9F2 mode=light min=4.5   # 본문/캔버스
- fg=#292524 bg=#FFFFFF mode=light min=4.5   # 본문/서피스
- fg=#57534E bg=#FFFFFF mode=light min=4.5   # 보조/서피스
- fg=#57534E bg=#FFF9F2 mode=light min=4.5   # 보조/캔버스
- fg=#FFFFFF bg=#0E7490 mode=light min=4.5   # CTA 라벨/accent-primary
- fg=#FFFFFF bg=#155E75 mode=light min=4.5   # CTA 라벨/accent-primary-hover
- fg=#0E7490 bg=#E0F7FA mode=light min=4.5   # 생후 텍스트·아이콘/soft-bg
- fg=#FFFFFF bg=#7C3AED mode=light min=4.5   # 교정 라벨/accent-corrected
- fg=#7C3AED bg=#F3ECFF mode=light min=4.5   # 교정 텍스트·아이콘/soft-bg
- fg=#FFFFFF bg=#BE185D mode=light min=4.5   # 포인트 라벨/accent-pop
- fg=#BE185D bg=#FCE7F3 mode=light min=4.5   # 포인트 텍스트·아이콘/soft-bg
- fg=#B45309 bg=#FFFFFF mode=light min=4.5   # 하이라이트(오늘) 텍스트/서피스
- fg=#B45309 bg=#FEF3C7 mode=light min=4.5   # 하이라이트 텍스트/soft-bg
- fg=#047857 bg=#FFFFFF mode=light min=4.5   # 완료(지남) 텍스트/서피스
- fg=#047857 bg=#D1FAE5 mode=light min=4.5   # 완료 텍스트/soft-bg
- fg=#57534E bg=#F5F5F4 mode=light min=4.5   # 대상아님 텍스트/배경
- fg=#FFFFFF bg=#B91C1C mode=light min=4.5   # 위험 버튼 라벨/accent-danger
- fg=#B91C1C bg=#FFFFFF mode=light min=4.5   # 오류 텍스트/서피스
- fg=#B91C1C bg=#FEF2F2 mode=light min=4.5   # 오류 텍스트/오류 패널 배경
- fg=#9A3412 bg=#FFF7ED mode=light min=4.5   # 미확정 텍스트/배경
- fg=#0E7490 bg=#FFFFFF mode=light min=4.5   # 성장 추이 그래프 실측값 선/카드 배경(GrowthTrendChart, 9차 라운드 — 값은 기존 "CTA 라벨/primary" 쌍과 같다. 전경·배경을 바꿔 계산해도 명도 대비 공식은 두 색의 순서와 무관하다)

실측(이 스펙 작성 시 node 로 WCAG 상대 명도 대비 공식을 직접 계산, 스크립트는 `verification` 에 적은 경로 참고):
21쌍 전부 4.5 이상. 최저값은 `#0E7490/#E0F7FA` = 4.81, 최고값은 `#292524/#FFFFFF` = 15.17.
전체 실측값(반올림 소수 둘째 자리):

| 쌍 | 값 | 기준 |
|---|---|---|
| 본문/캔버스 | 14.51 | 4.5 |
| 본문/서피스 | 15.17 | 4.5 |
| 보조/서피스 | 7.63 | 4.5 |
| 보조/캔버스 | 7.30 | 4.5 |
| CTA 라벨/primary | 5.36 | 4.5 |
| CTA 라벨/primary-hover | 7.27 | 4.5 |
| 생후/soft-bg | 4.81 | 4.5 |
| 교정 라벨/corrected | 5.70 | 4.5 |
| 교정/soft-bg | 4.95 | 4.5 |
| 포인트 라벨/pop | 6.04 | 4.5 |
| 포인트/soft-bg | 5.14 | 4.5 |
| 하이라이트/서피스 | 5.02 | 4.5 |
| 하이라이트/soft-bg | 4.51 | 4.5 |
| 완료/서피스 | 5.48 | 4.5 |
| 완료/soft-bg | 4.84 | 4.5 |
| 대상아님 텍스트/배경 | 6.99 | 4.5 |
| 위험 라벨/danger | 6.47 | 4.5 |
| 오류 텍스트/서피스 | 6.47 | 4.5 |
| 오류 텍스트/오류배경 | 5.91 | 4.5 |
| 미확정 텍스트/배경 | 6.88 | 4.5 |
| 생후 선/카드 배경(GrowthTrendChart, 9차) | 5.36 | 4.5 |

## decisions

| 무엇을 | 왜 | 되돌릴 위치 |
|---|---|---|
| `GrowthTrendChart`(9차 라운드, F8 AC3 추이 그래프)의 선 색을 새로 만들지 않고 기존 3개(`--color-accent-primary`=실측값, `--color-text-muted`=50백분위, `--color-accent-danger`=3·97백분위)를 재사용한다. 대비 검증 표에는 `#0E7490/#FFFFFF`(카드 배경 위 실측값 선) 한 쌍만 새로 추가한다 — 나머지 두 색은 이미 같은 배경(`#FFFFFF`) 조합으로 검증돼 있다 | 선 색마다 새 의미를 만들 필요가 없다 — 실측값=브랜드 프라이머리(이 앱의 핵심 데이터), 중앙값=중립 보조색, 위험 경계(3·97백분위)=이미 "주의" 의미로 쓰는 danger 색을 그대로 재사용하면 PC-F8-AC2(3 미만/97 초과 주의)와 시각적으로도 뜻이 통한다. "값은 같아도 의미가 다르면 토큰을 나눈다"는 이번에 해당하지 않는다 — 여기서는 의미까지 같다(각 토큰의 기존 역할을 그대로 가져왔을 뿐 새 역할을 만들지 않았다) | `components/GrowthTrendChart.md:## 레이아웃`, `tokens.md:## 대비 검증` |
| 이 문서를 라이트/다크 동시 표가 아니라 라이트 한 칸으로 쓴다 | 이전 라운드 CONTEXT("다크 모드는 이번 범위가 아니다")가 이번 라운드에도 그대로 유효하다. 이번 지시서에 다크 모드 관련 언급이 없어 이전 결정을 뒤집을 근거가 없다 | `.curvez/design/preemie-calc/tokens.md:## 색` |
| 색 팔레트를 파랑 단색(생후)+보라(교정) 2계열에서 5계열(생후=청록 `#0E7490`, 교정=보라 `#7C3AED`, 포인트=핑크 `#BE185D`, 하이라이트=호박 `#B45309`, 완료=초록 `#047857`)로 넓힌다 | 사용자 지시 "밝고 생기 있는"(또렷한 포인트 색). 기존 팔레트는 CTA 파랑 하나와 상태 회색조뿐이라 "밋밋하다"는 관찰과 일치했다. 다섯 계열은 각각 다른 의미(생후/교정/행동유도/지금순간/완료)에 묶여 있어 "의미가 다르면 값도 나눈다" 기준을 만족한다. 전부 4.5:1 이상 실측(위 표) | `.curvez/design/preemie-calc/tokens.md:## 색` |
| 배경을 회색조 `#F5F7FA` 에서 따뜻한 아이보리 `#FFF9F2` 로 바꾼다 | "밝고 생기 있는" 인상은 차가운 회색보다 따뜻한 중성색에서 더 잘 읽힌다. 흰 카드(`#FFFFFF`)와의 명도차가 여전히 있어(14.51 대비, 카드 경계가 그림자 없이도 구분된다) 레이어 구분은 유지된다 | `.curvez/design/preemie-calc/tokens.md:## 색` |
| `lucide-react ^1.41.0`(handwork 와 같은 버전)을 새 의존성으로 쓴다 | CONTEXT 에서 사용자가 명시적으로 승인했다("아이콘: lucide-react 추가— handwork 와 같은 ^1.41.0"). standing.md 3번("지시서에 적힌 의존성 목록 밖의 패키지를 설치하지 않는다")의 예외로, 이 지시서 CONTEXT 자체가 그 목록이다. 이 스펙 문서는 패키지를 설치하지 않는다 — `curvez-nextjs` 가 실제 설치와 `package.json` 반영을 한다 | `apps/preemie-calc/package.json`(curvez-nextjs 몫) |
| 라디우스를 4/8/16 에서 8/12/20 으로 올린다 | "밝고 생기 있는" 시안이 없어 근거 순서 4번(기본 스케일)을 다시 적용했다. 더 둥근 모서리가 딱딱한 인상을 줄인다는 것은 일반적인 UI 관례이지 임의 취향이 아니다 — radius 3단계 변형이라는 기본 형식 안에서 값만 올렸다 | `.curvez/design/preemie-calc/tokens.md:## 반경 · 터치 영역` |
| 헤더 좌/우 zone 의 최소 예약 폭을 `--layout-header-side-reserve: 112px` 하나의 상수로 고정하고, 실제 내용이 더 좁아도(또는 비어 있어도) 그 폭만큼 항상 비워 둔다 | 사용자 지시 "헤더 타이틀은 모든 폭에서 가운데 정렬". CSS Grid `1fr auto 1fr` 만으로는 좌우 콘텐츠 폭이 다를 때(예: 왼쪽 비어 있음, 오른쪽에 "더보기" 버튼) 두 `1fr` 트랙이 콘텐츠 최소 폭에 맞춰 커져 중앙 제목이 기하학적으로 정중앙에서 벗어날 수 있다. `minmax(112px, 1fr)` 로 양쪽을 같은 최소값으로 강제하면 어떤 조합에서도 제목이 정중앙에 온다 | `.curvez/design/preemie-calc/components/PageHeader.md` |
| dashboard 헤더의 "프로필 편집"·"정보 전체 삭제" 두 액션을 헤더에 직접 두지 않고 새 컴포넌트 `HeaderMenu`(더보기 메뉴) 하나로 묶는다 | 두 액션을 헤더에 나란히 두면(특히 "정보 전체 삭제"라는 SPEC 원문 그대로의 긴 라벨) 360px 폭에서 우측 zone 이 넓어져 좌측 zone 과 비대칭이 되고, `--layout-header-side-reserve` 상수 하나로 양쪽을 맞추기 어려워진다. 두 액션 모두 "자주 쓰는 행동"이 아니라(편집은 가끔, 삭제는 드묾) 메뉴 뒤로 넣어도 사용성 손해가 적다. "위치와 위계를 다시 정한다"(CONTEXT)는 지시에 맞춰 자주 쓰는 아이 전환·추가는 헤더 바로 아래 `child-switcher` 영역에 그대로 남기고, 편집·삭제만 위계를 낮췄다. 메뉴를 열면 두 항목 모두 SPEC 원문 텍스트("정보 전체 삭제")를 그대로 가진 완전한 버튼으로 보이므로 PC-F1-AC6 의 "누르고 확인" 동작은 그대로 성립한다 | `.curvez/design/preemie-calc/components/HeaderMenu.md`, `.curvez/design/preemie-calc/components/PageHeader.md`, `.curvez/design/preemie-calc/screens/dashboard.md` |
| 아이콘·색 배지·설명 카드에 반복되는 "원형 배경 + 아이콘" 패턴을 새 컴포넌트 `IconBadge` 로 승격한다 | 같은 패턴이 3곳 이상(헤더 브랜드 마크, `InfoRow`(nav-card) 아이콘, `ValueCard` 아이콘, `AgeSummaryCard` 라벨 아이콘)에서 반복된다. "같은 새 값이 3곳 이상에서 필요하면 토큰(또는 컴포넌트)으로 승격한다" 기준 | `.curvez/design/preemie-calc/components/IconBadge.md` |
| 검진 차수 상태(지남/오늘/예정/대상아님)의 텍스트 기호(✓·●··-–)를 lucide 아이콘(`CircleCheckBig`·`CircleDot`·`Circle`·`Minus`)으로 바꾼다 | 이번 라운드에서 아이콘 라이브러리가 생겨 텍스트 기호 대신 실제 아이콘을 쓸 수 있게 됐다. 색+아이콘+텍스트 라벨 세 겹 규칙(PC-NF-A11Y-1)은 그대로 유지한다 — 아이콘이 기호를 대체할 뿐 라벨 텍스트는 없어지지 않는다 | `.curvez/design/preemie-calc/components/StatusBadge.md` |
| `ShareCardCanvas` 는 lucide 아이콘을 canvas 에 그리지 않고, 단색 원(반투명, canvas `arc`+`fill`) 장식만 더한다 | lucide 아이콘을 canvas 에 그리려면 SVG 경로를 Path2D 로 변환해 래스터화해야 해 구현 복잡도가 늘고 이번 지시서의 "lucide 아이콘 조합, 색 면" 허용 범위를 벗어날 위험이 있다. 원형 색 면은 순수 canvas 도형 API(`arc`)만으로 되는 가장 단순한 장식이라 이 경계 안에 확실히 든다 | `.curvez/design/preemie-calc/components/ShareCardCanvas.md` |
| `--motion-easing-playful` 를 추가하되 세 곳(ChildSwitcherTabs 선택, ShareActionButton 복사 완료 아이콘, StatusBadge current 진입)으로만 한정한다 | "생기 있는" 인상에 미세한 통통 튀는 전환이 어울리지만, 화면 전환·레이아웃 이동에 쓰면 멀미를 유발할 수 있다. 정보량이 바뀌지 않는 작은 상태 전환(아이콘 하나, 배지 하나)에만 쓰는 것으로 범위를 좁혔다 | `.curvez/design/preemie-calc/tokens.md:## elevation · motion` |
| `--font-size-meta`(14px)만 "본문 아님" 으로 두고 17px 미만을 허용한다 (이전 라운드 결정, 유지) | PC-NF-MOBILE-2 는 "본문 글씨" 를 요구했다. 출처·기준일 캡션은 참고 정보이지 본문 설명이 아니다 | `.curvez/design/preemie-calc/tokens.md:## 글자 크기` |
| 간격 스케일 4pt 그리드에 `--space-8`(64px) 한 단계를 더한다(이전 7단계 + 1) | 데스크톱(≥1280px) 레이아웃 값을 이번 라운드에서 처음 정하면서, 기존 최대값 48px 으로는 데스크톱 섹션 간격이 좁아 보였다(근거 순서 4번, 기본 스케일 연장) | `.curvez/design/preemie-calc/tokens.md:## 간격` |
| 앱 전체 본문에 `word-break: keep-all` 을 전역(body) 한 곳에 추가하고, `AgeSummaryCard`·`Button` 등 "한 덩어리 유지"가 필요한 값에는 조각 단위 `white-space: nowrap` 을 컴포넌트별로 얹는다(2026-09-30 6차 라운드, `curvez-nextjs.20260930-012225.json` 결함 수정 역반영) | 오케스트레이터가 캡처에서 한글 음절 중간 줄바꿈·숫자-단위 끊김을 결함으로 지정했다. `keep-all` 하나로는 숫자-한글 경계를 못 막아 두 규칙을 함께 둬야 했다 | `.curvez/design/preemie-calc/tokens.md:## 줄바꿈 규칙 (전역)` |
| 화면마다 다르던 본문 최대 폭 토큰 6개(`--layout-content-max-mobile`=400, `--layout-content-max-tablet`=640, `--layout-content-max-desktop-narrow`=640, `--layout-container-max-desktop`=1120, `--layout-dashboard-sidebar-width`=360, `--layout-column-gap-desktop`=32)를 `--layout-content-max`(720px) 하나로 합친다(2026-09-30 7차 라운드) | 사용자 원문 "가로사이즈는 메인과 서브가 동일하게 만들어 왔다갔다하지말고"(선택지 "720px 한 열"). 화면마다 본문 폭이 다르면 화면을 옮길 때마다 좌우 시작선이 흔들린다 — 시안이 없어 근거 순서 1번이 아니라 사용자의 직접 지시를 그대로 값으로 옮겼다 | `.curvez/design/preemie-calc/tokens.md:## 레이아웃`, `.curvez/design/preemie-calc/index.md:## 2026-09-30 7차 라운드` |
| `--layout-content-max`(720)의 의미를 "바깥 박스 폭"에서 "글이 흐르는 안쪽 영역 폭"으로 명확히 하고, 각 폭 구간의 계산된 박스 폭(모바일=뷰포트 그대로, 태블릿=752, 데스크톱=784)을 표로 남긴다. 숫자 자체(720, --space-4=16, --space-6=32)는 바꾸지 않는다(2026-09-30 8차 라운드) | 사용자 원문 "본문 글 영역을 720px(박스 784px)로". 기존 9개 화면의 `## responsive` 문구는 이미 "content 폭 최대 720px 중앙 정렬 + 좌우 여백 16/32px"로 적혀 있었고, 이 "좌우 여백"이 720px 칸의 바깥쪽 간격이라는 전제로 계산하면 데스크톱 박스 폭이 이미 720+32×2=784 로 사용자 지시와 일치한다. 그래서 기존 9개 화면 파일을 다시 쓰지 않고, 그 전제를 명문화하는 것만으로 "글 영역 720/박스 784" 요구를 만족한다고 판단했다 — 최소한만 건드린다는 원칙과, 숫자 변경 없이 "해석의 여지"만 없앤다는 목표에 맞다. 오케스트레이터가 이 해석에 동의하지 않으면(즉 기존 9개 화면이 실제로는 "박스=720"으로 구현돼 있었다면) 9개 화면의 `## responsive` 좌우 여백 수치를 다시 계산해야 한다 — 그 경우 되돌릴 위치는 각 화면 파일의 `## responsive` 절이다 | `.curvez/design/preemie-calc/tokens.md:## 레이아웃`, `.curvez/design/preemie-calc/screens/*.md:## responsive`(9개 기존 화면, 재계산이 필요해지면) |
