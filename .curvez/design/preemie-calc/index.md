# 디자인 스펙 — preemie-calc (1단계)

> 기준: 360px 모바일 폭 + **1280px 데스크톱 폭**(이번 라운드부터 데스크톱 레이아웃 값을 명시한다). 시안 없음 —
> 근거 순서는 ① 요구사항 사용자 흐름(`.curvez/requirements.md`) → ② 레포 기존 토큰(handwork 는 참조 금지,
> preemie-calc 자체 토큰을 이어 쓴다) → ③ 브라우저 관례(네이티브 date input, 시스템 글꼴) → ④ 기본 스케일
> (4pt 그리드, radius 3단계 변형). 다크 모드는 이번 범위가 아니다(`tokens.md` decisions).

## 2026-10-02 9차 라운드 — F8 AC3 추이 그래프(recharts)

`recharts`(^3.10.1)가 `apps/preemie-calc` 에 설치됐다(사용자 원문 "권고대로 하고 recharts 설치, .omc 지워줘"). 8차
라운드에서 "보류: 차트 라이브러리 미정"으로 남겨 둔 PC-F8-AC3(기록이 2개 이상이면 측정일 순서로 추이 그래프)를
이번 라운드에서 설계했다.

1. **새 컴포넌트 1개**: `GrowthTrendChart` — 지표(키·몸무게·머리둘레) 하나당 인스턴스 하나, `growth` 화면에 3개를
   세로로 쌓는다(지표를 한 그래프에 섞지 않는다). x축은 측정일(SPEC 원문 "측정일 순서로" 그대로), y축은 지표 단위
   (cm/kg). 백분위 기준선(3·50·97)을 실측값 선과 함께 그린다 — LMS(L,M,S)에서 역산한 값만 쓴다(지시서 CONTEXT
   허용 범위). 자세한 내용은 `components/GrowthTrendChart.md`
2. **`screens/growth.md` 갱신**: entry-form(1) → **trend(2, 신규)** → record-list(3) → disclaimer 순서로 바꿨다
   (추이를 먼저 보여준 뒤 정확한 값을 표로 확인하는 흐름). 기록이 1개 이하일 때의 상태 문구, loading·empty·error
   상태에 trend 영역을 어떻게 포함하는지를 명문화했다
3. **`GrowthRecordTable` 문구 갱신**: "추이 그래프의 대체 표현"이라는 8차 라운드 문구가 더는 사실이 아니라(이제
   그래프가 실제로 있다), 표와 그래프가 "짝"이라는 문구로 바꿨다 — 표가 그래프의 스크린리더 대체 표현이라는 점도
   추가했다
4. **새 색 쌍 1개**: `tokens.md` 대비 검증 표에 실측값 선 색(`#0E7490`)과 카드 배경(`#FFFFFF`) 조합을 추가했다(21쌍).
   이 값은 기존 "CTA 라벨/primary" 쌍(`#FFFFFF`/`#0E7490`)과 전경·배경만 바뀐 같은 색 조합이라 5.36 으로 같다 —
   순수 계산상 새로 확인이 필요했을 뿐, 실제로는 새 색이 아니다. 나머지 두 선 색(50백분위=`--color-text-muted`,
   3·97백분위=`--color-accent-danger`)은 이미 검증된 쌍(카드 배경 `#FFFFFF` 위)을 그대로 재사용해 새 쌍이 없다
5. **새 아이콘 없음**: `GrowthTrendChart` 의 제목 아이콘(키=`Ruler`, 몸무게=`Weight`, 머리둘레=`CircleDashed`)은
   `GrowthEntryForm` 이 같은 지표에 이미 쓰는 아이콘을 그대로 재사용했다
6. **커버리지 표**: PC-F8-AC3 을 "보류"에서 "설계됨(9차 라운드)"으로 갱신했다

## decisions (9차 라운드분)

| 무엇을 | 왜 | 되돌릴 위치 |
|---|---|---|
| 지표 3개를 한 그래프에 섞지 않고 `GrowthTrendChart` 인스턴스 3개(세로로 쌓는 small multiples)로 설계한다. 지표 전환 탭은 쓰지 않는다 | y축 단위가 cm(키·머리둘레)와 kg(몸무게)로 갈려 한 축에 섞을 수 없다(지시서 CONTEXT 가 이미 금지). 탭 전환은 새 상호작용 상태를 추가하고 세 지표 동시 비교를 어렵게 한다 | `components/GrowthTrendChart.md:decisions`, `screens/growth.md:## layout` region: trend |
| x축을 측정일(날짜)로 하고 나이(개월)로 하지 않는다 | PC-F8-AC3 SPEC 원문이 "측정일 순서로"다. 나이는 기록마다 기준(교정/생후)이 바뀔 수 있어 연속된 축으로 쓰면 왜곡된다. 측정일은 `percentileHidden`(예정일 이전) 기록에도 항상 있어 축이 끊기지 않는다 | `components/GrowthTrendChart.md:## 레이아웃` |
| 백분위 기준선(3·50·97)을 함께 그린다 | 성장 백분위 앱에서 실측값만 보여주면 "또래 대비 어디쯤인지"를 그래프가 답하지 못한다. 지시서가 "그린다면 LMS 데이터에서 계산할 수 있는 것만" 이라고 허용했고, LMS 의 L·M·S 역산 값은 그 범위 안에 있다 | `components/GrowthTrendChart.md:## 데이터 전제` |
| 백분위 역산 함수(`inverseStandardNormalCdf` 등)가 architecture.md ⑧에 아직 없다는 사실을 설계 문서에만 남기고 architecture.md 는 고치지 않는다 | 지시서 SCOPE 가 architecture.md 를 읽기 전용으로 뒀다. 이 함수는 기존 레이어 구조를 바꾸지 않고 함수 하나를 더하는 것이라 `curvez-architect` 보다 `curvez-nextjs` 구현 메모로 충분하다고 판단했다 | `.curvez/architecture.md:#### ⑧ 성장 기록과 백분위`(다음 아키텍처 라운드에서 공식화할지는 오케스트레이터 판단) |
| 그래프 SVG 전체를 `aria-hidden` 처리하고, 점마다 개별 `aria-label` 을 넣는 완전 접근형 차트로 만들지 않는다 | `GrowthRecordTable` 이 이미 같은 데이터를 행 단위로 완전히 설명한다. 그래프까지 똑같이 설명하면 같은 정보가 두 번 다른 말로 나와 오히려 혼란이다 | `components/GrowthTrendChart.md:## a11y` |
| `screens/growth.md` 의 region 순서를 entry-form → record-list → disclaimer 에서 entry-form → **trend** → record-list → disclaimer 로 바꾼다(그래프를 표보다 앞에 둔다) | 추이(큰 그림)를 먼저 보여주고 정확한 값(표)은 그 다음에 확인하는 흐름이 "측정 기록을 남기고 바로 결과를 확인한다"는 화면 목표에 맞다. 다른 화면(`order-detail` 예시 형식)도 요약 영역을 상세 목록보다 우선순위를 높게 둔다 | `screens/growth.md:## layout` |

## 2026-09-30 8차 라운드 — SPEC 버전 2 신규 기능(F7 문구 복사·F8 성장 기록·F10 예방접종·F14 목표키·F15 분유량) + 본문 폭 명문화

`.curvez/requirements.md`(SPEC 버전 2 반영)가 1단계에 새로 들어온 F7 보강(결과 문구 복사)·F8(성장 백분위+기록)·
F10(예방접종 일정)·F14(목표키 참고)·F15(분유량 참고)를 이번 라운드에서 화면·컴포넌트 스펙으로 옮겼다. 시안은
여전히 없다 — 기존 톤("밝고 생기 있는", lucide 아이콘, 가운데 헤더, 한 열 레이아웃)을 그대로 따르고, 새 색은
하나도 만들지 않았다(전부 기존 20쌍 재사용, `tokens.md` 참고).

1. **새 화면 4개**: growth(`/dashboard/growth`, F8), vaccinations(`/dashboard/vaccinations`, F10),
   target-height(`/dashboard/target-height`, F14), formula(`/dashboard/formula`, F15). 라우트 이름·위치는
   기존 `/dashboard/<kebab-case>` 패턴을 그대로 따랐다(age-basis·checkups·copay-relief·correction-period 와 같은 층위)
2. **F8 AC3(추이 그래프) 보류**: 기록이 2개 이상이면 그래프를 그리라는 수용 기준이 있지만, 이 저장소에 차트
   라이브러리가 없고 지시서 FORBIDDEN 이 "차트 설계(라이브러리 전제)"를 금지했다. 그래프 자리 자체를 스펙에 넣지
   않았고, 대신 `GrowthRecordTable`(신규) 하나로 여러 기록의 측정값·나이 기준·백분위를 나란히 비교할 수 있게
   설계했다. 커버리지 표에 PC-F8-AC3 을 "보류: 차트 라이브러리 미정"으로 그대로 남겼다 — 오케스트레이터가 사용자에게
   라이브러리를 확인한 뒤 별도 라운드에서 채운다
3. **새 컴포넌트 3개**: `GrowthEntryForm`(측정 기록 입력 폼), `GrowthRecordTable`(측정 기록 목록+백분위, 위 그래프
   대체), `VaccinationRoundItem`(접종 차수 카드+완료 체크). 기존 컴포넌트를 최대한 재사용했다 — `DateField`·
   `TextField`·`SegmentedControl`·`Button`·`ValueCard`·`StatusBadge`·`ReferenceFooter`·`StatePanel`·`Skeleton`·
   `UnconfirmedNotice`·`IconBadge` 11개를 8차 라운드 화면에서 그대로 또는 kind/prop 확장으로 재사용했다(각 컴포넌트
   문서의 "쓰이는 화면" 절 참고)
4. **`StatusBadge` 확장**: 예방접종 상태(완료/임박/놓침)를 위해 kind 3종(done/soon/missed)을 더했다 — 색은 기존
   past(완료)·current(임박)·danger(놓침) 쌍을 그대로 재사용하고, 아이콘만 새로 더했다(`Clock`=임박). 기존
   past/current/upcoming/neutral(검진용)은 손대지 않았다
5. **`ShareActionButton` 확장(F7)**: "결과 문구 복사" 버튼을 셋째 행동으로 더했다(PC-F7-AC5~AC7) — 나이 결과 문구
   + 공유 링크를 함께 클립보드에 담는다. 완료 문구는 SPEC 원문 그대로 "문구를 복사했어요"(기존 "링크 복사"의
   "복사했습니다"와는 다른 문구 — 서로 다른 동작이라 각자의 SPEC 문구를 유지했다). dashboard 의 share-entry 영역에
   반영했다
6. **대시보드 바로가기 격자 확장**: quick-links 가 4개(어느 나이를 쓰나·영유아검진 도우미·본인부담 경감 종료일·
   교정연령 적용 종료 안내)에서 8개로 늘었다. 새 4개(성장 기록·예방접종 일정·목표키 참고·분유량 참고)는 숨기는
   조건이 없어 모든 아이에게 항상 보인다(`screens/dashboard.md`)
7. **본문 글 영역 720px(박스 784px) 명문화**: `tokens.md`의 `--layout-content-max`(720)가 가리키는 것을 "바깥
   박스 폭"이 아니라 "글이 흐르는 안쪽 영역 폭"으로 명확히 했다. 숫자 자체(720/16/32)는 바뀌지 않는다 — 기존
   9개 화면의 "content 폭 최대 720px + 좌우 여백 16/32px" 문구가 이미 이 계산(데스크톱 박스=720+32×2=784)과
   일치해서, 9개 화면 파일을 다시 쓰지 않고 `tokens.md`에 계산 표만 더했다. 자세한 이유는 `tokens.md` 8차 라운드
   decisions 참고
8. **F14 성별 표시**: 목표키 화면은 성별을 다시 입력받지 않는다(CONTEXT "성별은 프로필에서") — 프로필에 저장된
   성별을 정적 텍스트 한 줄로 보여준다(`screens/target-height.md` gender-note 영역)

> **이전 라운드 기록**: 4~7차 라운드(밝고 생기 있는 리디자인, 구현 결함 역보정, 본문 폭 720px 통일)는 아래 각
> 절에 그대로 남아 있다. 이번 8차 라운드는 그 위에 새 기능만 더했다 — 기존 9개 화면·23개 컴포넌트의 구조는
> 하나도 바꾸지 않았다("쓰이는 화면"·"요구 ID" 메타데이터만 새 화면을 추가 반영했다).

## decisions (8차 라운드분)

| 무엇을 | 왜 | 되돌릴 위치 |
|---|---|---|
| F8-AC3(추이 그래프)을 이번 스펙에 넣지 않고 `GrowthRecordTable`(표)로 대체하며, 커버리지 표에 "보류: 차트 라이브러리 미정"으로 남긴다 | 지시서 FORBIDDEN 이 "차트 설계(라이브러리 전제)"를 금지했고, 이 저장소에 차트 라이브러리가 없다. standing.md 3번("라이브러리가 없다고 대체품을 직접 구현하지 않는다")과도 같은 원칙이다 — 직접 그리는 SVG/canvas 차트를 설계하는 대신 표로 같은 목적(여러 기록 비교)을 만족시켰다 | `.curvez/design/preemie-calc/screens/growth.md`, `.curvez/design/preemie-calc/components/GrowthRecordTable.md` |
| 예방접종 상태 배지(완료/임박/놓침)에 새 색을 만들지 않고 기존 past(완료)·current(임박)·danger(놓침) 색 쌍을 재사용한다 | "값 차이가 지각 임계 이하면 기존 것을 쓴다" 기준을 확장 적용했다 — 완료="지남"과, 임박="오늘"의 긴장감과, 놓침="위험 경고"와 각각 의미가 충분히 가까워 새 토큰을 만들 근거가 없었다. 아이콘(`Clock`)만 새로 더해 배지끼리 구분한다 | `.curvez/design/preemie-calc/components/StatusBadge.md`, `.curvez/design/preemie-calc/tokens.md:## 색` |
| 측정 자세(growth) 옵션 라벨을 "누워서"/"서서" 두 값으로 정한다 | SPEC·PRD 어디에도 정확한 옵션 문구가 없어 근거 순서 4번(기본 스케일)을 적용했다. 표준 성장도표가 측정 자세에 따라 참조 구간을 다르게 쓰므로, 나이로 자동 추정하지 않고 사용자가 실제 잰 자세를 그대로 선택하게 했다 | `.curvez/design/preemie-calc/components/GrowthEntryForm.md` |
| growth 의 키·몸무게·머리둘레 입력에 정밀한 임상 상·하한(예: 키 30~120cm)을 정하지 않는다 | SPEC·PRD 어디에도 이 값이 없다 — "정보가 없으면 채우지 않는다" 원칙에 따라 "0 이하·숫자 아님"만 이 스펙이 검증하고, 정밀한 유효 구간은 growth-percentile.json(LMS 표)의 정의역에 맡긴다(데이터 파일 책임, architecture 원칙과 일치) | `.curvez/design/preemie-calc/components/GrowthEntryForm.md` |
| F15 의 "기준 확인 중"(EX3) 상태에 새 컴포넌트를 만들지 않고 기존 `UnconfirmedNotice`(text prop)를 재사용한다 | `UnconfirmedNotice` 가 이미 "이 값은 잠정값입니다"류 안내를 위한 범용 컴포넌트이고, `text` prop 으로 문구를 완전히 덮어쓸 수 있다. PRD §9 결정이 4개월 이후 계수를 "확인 중"으로 명시적으로 남겨 두어(미결이 아니라 확정된 미결) 이 컴포넌트의 의도와 정확히 맞는다 | `.curvez/design/preemie-calc/components/UnconfirmedNotice.md`, `.curvez/design/preemie-calc/screens/formula.md` |
| target-height·formula 의 유효성 오류를 화면 자체의 `state:error`(입력 검증)로 다루고, `StatePanel` 로 화면 전체를 대체하지 않는다 | 두 화면 모두 외부 데이터 요청 실패 시나리오가 없고(계산이 순수 클라이언트 함수), 오류가 "값을 고치면 바로 없어지는" 입력 유효성 문제라 `input` 화면의 날짜 검증 오류와 같은 선례를 따랐다 | `.curvez/design/preemie-calc/screens/target-height.md`, `.curvez/design/preemie-calc/screens/formula.md` |
| `--layout-content-max`(720)의 의미를 "글 영역"으로 명확히 하되 기존 9개 화면 파일은 다시 쓰지 않는다 | 기존 9개 화면의 "content 폭 최대 720px + 좌우 여백" 문구가 이미 이 계산과 일치한다고 판단했다(자세한 근거는 `tokens.md` 8차 라운드 decisions) — 숫자 변경이 없는 명확화라 "최소한만 건드린다" 원칙에 따라 tokens.md 한 곳만 고쳤다. 이 판단이 틀렸다면(9개 화면이 실제로 "박스=720"을 의도했다면) 9개 화면의 `## responsive` 를 다시 계산해야 한다 | `.curvez/design/preemie-calc/tokens.md:## 레이아웃` |
| `screens/formula.md` 의 자기 모순(20행 preemie-note "계산 성공 여부와 무관하게 항상" vs 34행 state:error "result·preemie-note 는 그리지 않는다")을 34행 쪽을 고쳐 없앤다 — state:error 에서도 preemie-note 는 그대로 남기고 result 만 그리지 않는다 | 리뷰어 DSG-02(`curvez-reviewer.20260930-143021.json`)가 지적한 모순이다. 오케스트레이터 tie-break 결정: 20행과 PC-F15-AC2(`requirements.md:225`, "결과보다 먼저 보인다")가 더 구체적이고 안전 문구이며, 구현(`FormulaPanelSection.tsx:35`)이 이미 이렇게 동작한다 | `.curvez/design/preemie-calc/screens/formula.md:state:error` |

## 2026-09-29 5차 라운드 — "밝고 생기 있는" 리디자인

사용자 원문: "디자인이 좀더 예쁘면 좋겠는데?" → 분위기 "밝고 생기 있는"(또렷한 포인트 색, 아이콘·일러스트 요소로
친근하게), 범위 "화면 구성도 다시"(대시보드 정보 배치·위계까지), 추가 원문 "헤더 타일틀은 중앙에 정렬하고". 이
라운드에서 바뀐 것을 요약한다 — 자세한 근거는 `tokens.md`·각 컴포넌트 문서의 `decisions`/본문에 있다.

1. **토큰**: 색 팔레트를 파랑 1색+회색에서 5계열(생후=청록·교정=보라·포인트=핑크·하이라이트=호박·완료=초록)로
   넓혔다. 배경을 회색조에서 따뜻한 아이보리로 바꿨다. 라디우스를 더 둥글게(8/12/20) 올렸다. 아이콘 크기(`icon`),
   레이아웃 상수(`layout`), CSS 그라디언트(`gradient`) 세 카테고리를 새로 더했다. 20쌍 전부 4.5:1 이상 실측(`tokens.md`).
2. **아이콘**: `lucide-react ^1.41.0`(handwork 와 같은 버전, 사용자 승인)을 도입했다. 이전까지 쓰던 텍스트 기호
   (✓●·–△)를 전부 실제 아이콘으로 바꾸되, 아이콘 단독 사용은 어디에도 없다 — 색+아이콘+텍스트 라벨 세 겹 규칙을
   그대로 유지했다(이번 라운드 CONTEXT "아이콘만으로도 금지 — 글자 병기"). 사용한 아이콘 전체 목록은 아래
   `## 아이콘 목록` 참고
3. **헤더**: 제목을 **모든 variant·모든 화면 폭에서 항상 정중앙**에 고정했다. `PageHeader.md` 의 3분할 그리드 +
   고정 예약 폭(`--layout-header-side-reserve`) 규칙으로 좌/우 zone 콘텐츠가 달라도 어긋나지 않는다.
   dashboard 헤더의 "프로필 편집"·"정보 전체 삭제" 두 액션은 새 컴포넌트 `HeaderMenu`(더보기) 뒤로 묶었고,
   자주 쓰는 아이 전환·추가(`ChildSwitcherTabs`)는 헤더 바로 아래 그대로 남겨 위계를 다시 정했다
4. **데스크톱(≥1280px) 레이아웃**: 이전까지는 대부분 "콘텐츠 폭 최대 480px 중앙 정렬" 하나뿐이라 넓은 화면에서
   좁은 칸만 덩그러니 보였다. 이번 라운드는 화면마다 값을 정했다 — dashboard 는 2열(main+sidebar, 1120px 컨테이너),
   나머지 조회형 화면(age-basis·checkups·copay-relief·correction-period·guide)은 640~720px 로 살짝 넓힌 1열 +
   배경(`--color-bg-canvas`)이 전체 폭을 채우게 했고, input·input-weeks·share 는 카드 하나를 화면 정중앙에 두고
   좌우에 `--gradient-hero-canvas` 장식 배경을 깔았다
5. **컴포넌트 2개 신규**: `IconBadge`("색 원 배경+아이콘" 패턴, 3곳 이상 반복돼 승격), `HeaderMenu`(헤더 더보기 메뉴).
   기존 21개 컴포넌트는 전부 유지하고 색·아이콘·반응형 값만 갱신했다(구조·prop 계약은 그대로 — `ChildSwitcherTabs`
   의 `children`→`options` prop 이름만 지난 라운드에 이미 코드가 바뀐 상태라 문서를 실제 구현에 맞춰 갱신했다)

> **이전 라운드 기록(2026-09-29, 1~4차)**: 화면 9개·컴포넌트 목록·PRD 미결 처리 방식(`UnconfirmedNotice`)·
> 화면 분할 근거는 이번 라운드에서도 그대로 유지된다. 지난 교정 이력(ACC-02/03/06, PLC-02, DUP-01, DSG-01/04)은
> 각 컴포넌트 문서 본문에 남아 있다. 이 섹션은 5차 라운드 변경분만 요약한다.

## 화면 목록 (13개, 8차 라운드부터 4개 추가 — `.curvez/architecture.md` ⑥ 라우트 목록 중 sitemap 제외)

| screen-id | 라우트 | 기능 | 파일 |
|---|---|---|---|
| input | `/` (기본) · `/?new=1`(아이 추가) | F1 입력, PC-F1-AC5 아이 추가 진입 | `screens/input.md` |
| input-weeks | `/?weeks=<24~36>` | F13-AC3 진입(입력 화면 변형) | `screens/input-weeks.md` |
| dashboard | `/dashboard` | F2 + 아이 전환/추가 + 프로필 편집 + 전체 삭제 + 공유 진입 + F8·F10·F14·F15 바로가기(8차 라운드) | `screens/dashboard.md` |
| age-basis | `/dashboard/age-basis` | F3 | `screens/age-basis.md` |
| checkups | `/dashboard/checkups` | F4 | `screens/checkups.md` |
| copay-relief | `/dashboard/copay-relief` | F5 | `screens/copay-relief.md` |
| correction-period | `/dashboard/correction-period` | F6 | `screens/correction-period.md` |
| growth | `/dashboard/growth` | F8(성장 백분위+기록), 8차 라운드 신규 | `screens/growth.md` |
| vaccinations | `/dashboard/vaccinations` | F10(예방접종 일정), 8차 라운드 신규 | `screens/vaccinations.md` |
| target-height | `/dashboard/target-height` | F14(목표키 참고), 8차 라운드 신규 | `screens/target-height.md` |
| formula | `/dashboard/formula` | F15(분유량 참고), 8차 라운드 신규 | `screens/formula.md` |
| share | `/share` | F7 받는 쪽 | `screens/share.md` |
| guide | `/guide/[weeks]/[months]` | F13 | `screens/guide.md` |

## 컴포넌트 목록 (27개 — 8차 라운드 신규 3개: GrowthEntryForm, GrowthRecordTable, VaccinationRoundItem. 9차 라운드 신규 1개: GrowthTrendChart)

| 컴포넌트 | 역할 | 쓰이는 화면 |
|---|---|---|
| Button | 단일 행동 실행(icon prop: 라벨 옆 lucide 아이콘) | input, input-weeks, dashboard, share, guide, growth, target-height, formula(8차 라운드 추가), ConfirmDialog, EditProfileDialog, HeaderMenu |
| TextField | 한 줄 텍스트 입력(이름·출생 체중은 선택, 8차 라운드부터 키·몸무게·머리둘레·부모 키·분유량 체중처럼 필수 입력도 담당) | EditProfileDialog(다이얼로그), GrowthEntryForm·target-height·formula(화면 직접 배치, 8차 라운드) |
| DateField | 날짜 입력(출생일·출산예정일·측정일, 장식 아이콘 CalendarDays) | input, input-weeks, growth(8차 라운드) |
| GestationInput | 재태주수+일 입력(장식 아이콘 CalendarClock) | input, input-weeks |
| SegmentedControl | 상호 배타 선택(성별, 측정 자세 — 선택 표시 아이콘 Check) | input, input-weeks, growth(8차 라운드) |
| RequiredMark | 입력 컴포넌트 필수 표시(별표+스크린리더 문구) 통일 규칙 | DateField·GestationInput·SegmentedControl(input, input-weeks, growth), TextField(EditProfileDialog, GrowthEntryForm, target-height, formula) 내부에서 쓰인다 |
| PageHeader | 화면 상단 제목/뒤로가기/브랜드 마크/액션 — **제목 항상 정중앙** | 전체 13화면 |
| HeaderMenu | dashboard 헤더 "더보기" — 프로필 편집·정보 전체 삭제를 묶는다 | dashboard(PageHeader 우측 zone) |
| IconBadge | "색 원 배경+아이콘" 장식 표시. 3곳 이상 반복돼 승격 | 브랜드 마크(전 화면), InfoRow(nav-card·basis), ValueCard, AgeSummaryCard, CheckupRoundItem, VaccinationRoundItem, StatePanel |
| AgeSummaryCard | 생후/교정 나이 2열 비교 카드(그라디언트 배경+아이콘 라벨) | dashboard(variant=default), share(variant=share-preview) |
| ValueCard | 값 하나(아이콘+라벨+값+보조값) 표시 카드 | copay-relief(icon=Banknote), correction-period(icon=Hourglass), target-height(icon=Target, 8차 라운드), formula(icon=Milk, 8차 라운드) |
| InfoRow | 라벨-기준-값 행 / 이동 카드(아이콘+ChevronRight) | dashboard(nav-card, 8개), age-basis(basis) |
| CheckupRoundItem | 검진 차수 카드(장식 아이콘 Stethoscope) | checkups |
| VaccinationRoundItem | (신규, 8차 라운드) 예방접종 차수 카드(백신명·권장일·교정 나이 병기·완료 체크·StatusBadge) | vaccinations |
| StatusBadge | 지남/오늘/예정/대상아님/완료/임박/놓침 배지(8차 라운드부터 done·soon·missed 3종 추가) | checkups, copay-relief, correction-period, vaccinations(8차 라운드) |
| GrowthEntryForm | (신규, 8차 라운드) 측정 기록 입력 폼(측정일·키·몸무게·머리둘레·측정 자세) | growth |
| GrowthRecordTable | (신규, 8차 라운드) 측정 기록 목록 + 나이 기준·백분위(`GrowthTrendChart`(추이 그래프)의 짝 — 그래프의 스크린리더 대체 표현이기도 하다) | growth |
| GrowthTrendChart | (신규, 9차 라운드) 지표별(키·몸무게·머리둘레) 추이 그래프 — 측정일 순서, 백분위 기준선(3·50·97) 동반, recharts 로 구현 | growth |
| ReferenceFooter | 출처·기준일·의료 면책 공통 영역(아이콘 Info) | dashboard, age-basis, checkups, copay-relief, correction-period, share, guide, growth, vaccinations, target-height, formula(8차 라운드 4개 추가) |
| UnconfirmedNotice | PRD §9 미확정 값 표시(아이콘 AlertTriangle), 8차 라운드부터 F15 "기준 확인 중" 표시에도 재사용 | checkups, copay-relief, correction-period, formula(8차 라운드) |
| ChildSwitcherTabs | 아이 전환 탭(알약형, Baby 아이콘) + "+ 아이 추가"(pop 색, 아이콘 없음 — 라벨의 "+" 문자가 아이콘을 겸한다) | dashboard |
| ConfirmDialog | 삭제 재확인 모달(아이콘 AlertTriangle) | dashboard(HeaderMenu 경유) |
| EditProfileDialog | 이름·출생 체중 입력/수정 모달(아이콘 Pencil) | dashboard(HeaderMenu 경유) |
| ShareActionButton | 링크 복사(항상, Copy/CopyCheck) + 결과 문구 복사(항상, 8차 라운드 신규 버튼) + 공유(navigator.share 지원 시, Share2) | dashboard |
| ShareCardCanvas | 공유 카드 이미지 그리기 사양(아이보리 배경+장식 원 2개) | dashboard(생성), share(미리보기 값 재사용) |
| Skeleton | 로딩 자리표시(200ms 이상일 때만) | dashboard, age-basis, checkups, copay-relief, correction-period, growth(8차 라운드) |
| StatePanel | 에러/도메인 빈 상태 공용 패널(아이콘 AlertTriangle/Info) | dashboard, age-basis, checkups, copay-relief, correction-period, share, growth, vaccinations, formula(8차 라운드 3개 추가) |

## 아이콘 목록 (lucide-react export 이름, `^1.41.0`)

의미를 담는 자리는 전부 텍스트 라벨과 함께 쓴다(아이콘 단독 없음, PC-NF-A11Y-1 확장).

| 아이콘 | 뜻 | 쓰이는 곳 |
|---|---|---|
| `Baby` | 서비스 브랜드, 아이 | 헤더 브랜드 마크(IconBadge), ChildSwitcherTabs 탭 |
| `MoreVertical` | 더 보기 | HeaderMenu 트리거 |
| `Pencil` | 편집 | HeaderMenu "프로필 편집" 항목, EditProfileDialog 제목 |
| `Trash2` | 삭제 | HeaderMenu "정보 전체 삭제" 항목 |
| `AlertTriangle` | 경고·주의·미확정 | ConfirmDialog 제목, UnconfirmedNotice, ShareActionButton 에러, StatePanel(error), VaccinationRoundItem(missed, 8차 라운드), GrowthRecordTable(백분위 주의, 8차 라운드) |
| `ChevronLeft` | 뒤로가기 | PageHeader(variant=back) |
| `ChevronRight` | 이동(다음 화면) | InfoRow(variant=nav-card) |
| `Check` | 선택됨 | SegmentedControl |
| `CalendarDays` | 생후(날짜 기준), 날짜 입력 | AgeSummaryCard 생후 라벨, DateField(측정일 포함, 8차 라운드) |
| `CalendarClock` | 재태주수 입력 | GestationInput |
| `Sparkles` | 교정(보정된 특별한 기준) | AgeSummaryCard 교정 라벨 |
| `CircleHelp` | 어느 나이를 쓰나 | InfoRow(nav-card) |
| `Stethoscope` | 검진 | InfoRow(nav-card·basis), CheckupRoundItem, checkups current-summary, guide checkup-info |
| `Banknote` | 본인부담 경감 | InfoRow(nav-card), ValueCard(copay-relief) |
| `Hourglass` | 교정연령 적용 기간 | InfoRow(nav-card), ValueCard(correction-period) |
| `Syringe` | 예방접종 | InfoRow(basis·nav-card), VaccinationRoundItem(8차 라운드) |
| `Utensils` | 이유식 | InfoRow(basis) |
| `ClipboardList` | 문진표·발달선별검사지 | InfoRow(basis) |
| `ClipboardCheck` | 발달 평가 | InfoRow(basis) |
| `CircleCheckBig` | 지남(완료) / 예방접종 완료(8차 라운드) | StatusBadge(past, done) |
| `CircleDot` | 오늘 | StatusBadge(current) |
| `Circle` | 예정 | StatusBadge(upcoming) |
| `Minus` | 대상 아님 | StatusBadge(neutral) |
| `Clock` | (신규, 8차 라운드) 임박(권장일이 7일 이내로 남음) | StatusBadge(soon), VaccinationRoundItem |
| `Ruler` | (신규, 8차 라운드) 키·신장 측정 | InfoRow(nav-card, "성장 기록"), GrowthEntryForm(키), TextField(target-height, 아빠 키·엄마 키) |
| `CircleDashed` | (신규, 8차 라운드) 머리둘레 측정(정확히 대응하는 아이콘이 없어 원형 장식으로 대체, 장식 전용이라 의미 전달 책임은 레이블 텍스트가 진다) | GrowthEntryForm(머리둘레) |
| `Target` | (신규, 8차 라운드) 목표(목표키) | InfoRow(nav-card, "목표키 참고"), ValueCard(target-height) |
| `Milk` | (신규, 8차 라운드) 분유·수유 | InfoRow(nav-card, "분유량 참고"), ValueCard(formula), TextField(formula, 체중 아이콘은 Weight 를 그대로 쓴다 — Milk 는 결과 카드 전용) |
| `Info` | 안내(도메인 빈 상태, 면책 문구 보조) | ReferenceFooter, StatePanel(domain-empty), checkups/copay-relief/correction-period/growth(8차 라운드)/formula(8차 라운드) 의 domain-empty |
| `AlertCircle` | 입력 오류 | TextField, input 화면 폼 에러 배너, GrowthEntryForm·target-height·formula(8차 라운드) |
| `Share2` | 카드 공유 | ShareActionButton |
| `Copy` / `CopyCheck` | 링크 복사·결과 문구 복사(8차 라운드 신규 버튼도 같은 아이콘 재사용) / 복사 완료 | ShareActionButton |
| `ArrowRight` | 다음 행동으로 이동 | share 화면 CTA, guide 화면 CTA |
| `UserRound` | 이름 입력 | TextField(EditProfileDialog, icon prop) |
| `Weight` | 출생 체중 / 몸무게 / 분유량 체중 입력(8차 라운드부터 재사용 범위 확장) | TextField(EditProfileDialog, GrowthEntryForm, formula) |

## 커버리지 표 — 요구 ID → 화면/컴포넌트

| 요구 ID | 화면 | 관련 컴포넌트 |
|---|---|---|
| PC-F1-AC1 | input, input-weeks | DateField, GestationInput, SegmentedControl, Button (이름 입력칸 없음). 필드 순서: 출생일 → 출산예정일(또는 주수+일) → "주수로 입력"/"예정일로 입력" 전환 → 성별. 장식만 허용(IconBadge 브랜드 마크, form-card 배경) — 추가 입력·버튼 없음 |
| PC-F1-AC2, AC3 | input, input-weeks | GestationInput, DateField (계산은 entities 담당, 화면은 값만 보여준다) |
| PC-F1-AC4 | input → dashboard | — (자동 리다이렉트, screen:input entry 참고. `?new=1` 이면 이 리다이렉트를 건너뛴다) |
| PC-F1-AC5 | dashboard, input(`/?new=1`) | ChildSwitcherTabs("+ 아이 추가" 포함), DateField, GestationInput, SegmentedControl, Button |
| PC-F1-AC6 | dashboard | PageHeader → HeaderMenu("정보 전체 삭제"), ConfirmDialog |
| PC-F1-EX1, EX2 | input, input-weeks | (폼 에러 배너 "날짜를 확인하세요", 아이콘 AlertCircle) |
| PC-F1-EX3 | dashboard | EditProfileDialog(TextField, 이름 선택 입력), ChildSwitcherTabs("아이 N") |
| PC-F2-AC1~AC5 | dashboard | AgeSummaryCard(교정 칸도 생후 칸과 같은 "{라벨} {값}" 한 덩어리로 렌더링) |
| PC-F2-EX1 | dashboard | (empty 사유: `/` 로 리다이렉트) |
| PC-F3-AC1~AC5 | age-basis | InfoRow(variant=basis, 아이콘 5종) |
| PC-F4-AC1~AC5 | checkups | CheckupRoundItem, StatusBadge, ReferenceFooter |
| PC-F4-EX1 | checkups | StatePanel(domain-empty) |
| PC-F5-AC1~AC5 | copay-relief | ValueCard(icon=Banknote), ReferenceFooter |
| PC-F5-AC4 | copay-relief | StatePanel(domain-empty) |
| PC-F6-AC1, AC2, AC4 | correction-period | ValueCard(icon=Hourglass) |
| PC-F6-AC3 | correction-period, dashboard | ValueCard, PageHeader → HeaderMenu("프로필 편집") → EditProfileDialog(출생 체중 입력 위치) |
| PC-F6-EX1 | dashboard(quick-links 미해당 4개는 숨김 규칙 없음, 기존 nav-card 미노출), correction-period | InfoRow(nav-card 미노출) |
| PC-F7-AC1~AC4 | dashboard, share | ShareActionButton, ShareCardCanvas, PageHeader → HeaderMenu("프로필 편집") → EditProfileDialog(이름 입력 위치) |
| PC-F7-AC5, AC6, AC7 | dashboard | (8차 라운드) ShareActionButton("결과 문구 복사" 버튼, 완료 문구 "문구를 복사했어요") |
| PC-F7-EX1 | dashboard | ShareActionButton(링크 복사 버튼, shareSupported 값과 무관하게 항상 보인다) |
| PC-F8-AC1, AC2, AC4, AC5 | growth | (8차 라운드) GrowthRecordTable(백분위·기준 라벨·주의 문구·표시 제외 사유), GrowthEntryForm |
| PC-F8-AC3 | growth | **설계됨(9차 라운드).** `GrowthTrendChart`(지표별 추이 그래프 3개, measure=height/weight/headCircumference) — recharts(^3.10.1, 설치됨) 로 구현한다. `screens/growth.md` region: trend, `components/GrowthTrendChart.md` 참고 |
| PC-F8-EX1 | growth | (8차 라운드) GrowthRecordTable(percentileHidden 상태, PC-F8-AC5 와 같은 표시) |
| PC-F10-AC1, AC2, AC3 | vaccinations | (8차 라운드) VaccinationRoundItem, StatusBadge(kind=done/soon/missed/upcoming) |
| PC-F13-AC1~AC4 | guide | (정적 빌드, 이 화면 자체가 산출물) |
| PC-F13-AC3 | input-weeks | GestationInput(weeks 프리필) |
| PC-F14-AC1~AC3 | target-height | (8차 라운드) ValueCard(icon=Target), TextField×2(아빠 키·엄마 키), gender-note(정적 텍스트) |
| PC-F14-EX1 | target-height | (8차 라운드) Button(disabled), 에러 문구 "부모님 키를 모두 확인하세요"(SPEC 원문 그대로) |
| PC-F15-AC1~AC3 | formula | (8차 라운드) ValueCard(icon=Milk), TextField(체중), preemie-note(재태 37주 미만 안내), ReferenceFooter |
| PC-F15-EX1 | formula | (8차 라운드) Button(disabled), TextField(error) |
| PC-F15-EX2 | formula | (8차 라운드) StatePanel(domain-empty, "이 시기에는 일반 권장량을 보여주지 않습니다" — 현재 데이터에서는 도달 불가, 사유는 `screens/formula.md` state:empty 참고) |
| PC-F15-EX3 | formula | (8차 라운드) UnconfirmedNotice(text="기준 확인 중") |
| PC-NF-MOBILE-1~4 | 전체 | tokens.md(360px 기준, 17px/48px), input(입력칸+버튼만) |
| PC-NF-MED-1 | dashboard, age-basis, checkups, copay-relief, correction-period, share, guide, growth, vaccinations, target-height, formula(8차 라운드 4개 추가) | ReferenceFooter |
| PC-NF-A11Y-1 | dashboard(아이나이 라벨), checkups/copay-relief/correction-period/vaccinations(8차 라운드, StatusBadge) | AgeSummaryCard, StatusBadge, SegmentedControl, ChildSwitcherTabs — 이번 라운드부터 "아이콘만으로도 금지" 로 범위가 넓어져, 새로 도입한 아이콘도 전부 텍스트 라벨과 짝을 이룬다(`## 아이콘 목록` 전체) |
| PC-NF-A11Y-2 | 전체 | tokens.md 대비 검증(20쌍, 전부 4.5 이상, 8차 라운드에서 새 쌍을 추가하지 않았다) |
| PC-NF-A11Y-3 | input, input-weeks, dashboard, growth, target-height, formula(8차 라운드 3개 추가) | DateField, GestationInput, SegmentedControl(a11y:label), TextField(a11y:label), RequiredMark |

## 미결 질문

없음. PRD §9 의 미결(1·2·3)은 값을 확정하지 않고 `UnconfirmedNotice` 컴포넌트 하나로 "미확정" 표시 방법만
정의했다(architecture.md 의 `Settled<T>` 설계와 짝을 이룬다). 미결 5(쌍둥이 묶음 표시)는 지시서가 설계 범위에서
제외했으므로 다루지 않았다 — 아이 전환은 `ChildSwitcherTabs` 로 목록 전환만 한다. 8차 라운드에서 "보류"로 남겼던
F8-AC3(추이 그래프)는 9차 라운드에서 `GrowthTrendChart` 로 설계를 마쳤다(위 커버리지 표 "설계됨" 참고) — 9차
라운드에서 새로 생긴 미결 질문은 없다. 다만 백분위 기준선 역산에 쓰는 `inverseStandardNormalCdf`(가칭)는
architecture.md ⑧에 아직 없는 새 함수라, `curvez-nextjs` 가 구현할 때 이 문서의 `GrowthTrendChart.md:## 데이터 전제`
를 근거로 추가해야 한다(architecture.md 자체를 고칠지는 오케스트레이터 판단).

## 2026-09-30 6차 라운드 — 구현 결함 역보정

`curvez-nextjs`(`.curvez/handoff/curvez-nextjs.20260930-012225.json`)가 오케스트레이터 지시로 캡처에서 찾은 시각
결함 5건을 코드에서 먼저 고쳤다. 이 라운드는 그 5건을 스펙에 그대로 반영해 문서와 코드를 다시 맞춘다 — 화면 구조·
컴포넌트 prop 계약·요구 ID 매핑은 바뀌지 않았다. 자세한 내용은 각 컴포넌트·화면 문서 본문과 아래 `decisions`.

## decisions (6차 라운드분 — 구현 결함 역보정)

| 무엇을 | 왜 | 되돌릴 위치 |
|---|---|---|
| `ChildSwitcherTabs` "+ 아이 추가" 버튼의 leading 아이콘(`UserRoundPlus`) 규정을 뺀다. 이 아이콘은 다른 어디에도 쓰이지 않아 `## 아이콘 목록`에서도 뺐다 | 라벨 "+ 아이 추가" 에 이미 "+" 가 있어 아이콘을 더하면 더하기 표시가 두 번 보였다(캡처로 확인). 라벨 문구 자체는 바꾸지 않았다 | `components/ChildSwitcherTabs.md:## states`(solo 행), `index.md:## 컴포넌트 목록`·`## 아이콘 목록` |
| 한국어 줄바꿈을 앱 전체 `word-break: keep-all`(전역, `body` 한 곳)로 정한다 | 음절 중간 줄바꿈("교정연 / 령")이 헤더 제목·버튼 라벨 등 여러 화면에서 보였다. 어절 단위로만 줄바꾸는 것이 한국어 웹 타이포의 기본 관례다(근거 순서 3번) | `tokens.md:## 줄바꿈 규칙 (전역)` |
| `PageHeader` 제목의 말줄임(단일 줄 ellipsis)을 없애고 가운데 칸 안에서 최대 3줄까지 가운데 정렬 줄바꿈하게 하며, 페이지당 h1 하나만 두도록 `headingLevel`(1\|2) prop 을 명문화한다(기본 h1, `guide` 만 h2) | `keep-all` 적용 뒤 `correction-period`(360px)의 "교정연령 적용 종료 안내"가 가운데 트랙(~104px)에 2줄로 못 들어가 잘렸다(실측, scrollHeight>clientHeight). "2줄 유지"는 이전 라운드 코드 주석에만 있던 값이고 requirements.md 수용 기준에는 없어, "잘리지 않는다" 를 우선했다. `headingLevel` 은 코드가 이미 `guide` 에서 h2 로 쓰고 있었는데 스펙에 없어 문서를 실제 구현에 맞췄다 | `components/PageHeader.md:## 레이아웃`·`## props`·`## a11y`, `screens/guide.md:## layout` |
| `AgeSummaryCard` 의 값 텍스트(숫자+단위, 날짜)를 공백 조각 단위로 `white-space: nowrap` 처리한다고 명문화한다(360px 2열 유지 규칙은 그대로 둔다) | 전역 `keep-all` 은 한글 음절 사이만 막고 숫자-한글 경계(예: "92"·"일" 사이)의 줄바꿈은 막지 못해 "92일 · 3개월" 같은 값이 중간에서 끊겼다(캡처로 확인) | `components/AgeSummaryCard.md:## states` |
| `Button` 라벨은 항상 한 줄(`white-space: nowrap`)로 정한다. `ChildSwitcherTabs` 는 1280px 에서 dashboard content 컨테이너와 같은 왼쪽 선에 두고, 그 아래 content 컨테이너 상단 패딩만 `--space-5`(24px, 기존 `--space-8`=64px)로 줄인다 | 360px 좁은 flex 행(`ChildSwitcherTabs`)에서 버튼이 눌려 라벨이 중간에 끊겼다. 1280px 에서는 "+ 아이 추가" 버튼이 카드 행보다 왼쪽에 떠 있고 버튼-카드 사이 빈 공간(약 76px)이 과했다(둘 다 캡처로 확인) | `components/Button.md:## states`, `components/ChildSwitcherTabs.md:## responsive`, `screens/dashboard.md:## responsive` |


## 2026-09-30 7차 라운드 — 본문 폭 720px 한 열로 통일

사용자 원문: "가로사이즈는 메인과 서브가 동일하게 만들어 왔다갔다하지말고" → 선택 "720px 한 열(권장)". 9개 화면
(input·input-weeks·dashboard·age-basis·checkups·copay-relief·correction-period·share·guide) 전부가 본문 콘텐츠
최대 폭 하나(`--layout-content-max`, 720px)를 쓰도록 통일했다. 화면을 옮겨도 좌우 기준선이 바뀌지 않는다.

1. **토큰**: `--layout-content-max`(720px) 하나만 남기고, 화면마다 다르던 `--layout-content-max-mobile`(400)·
   `--layout-content-max-tablet`(640)·`--layout-content-max-desktop-narrow`(640)·`--layout-container-max-desktop`
   (1120)·`--layout-dashboard-sidebar-width`(360)·`--layout-column-gap-desktop`(32) 는 전부 폐기했다(`tokens.md`
   `## 레이아웃` 참고). 좌우 패딩도 폭 구간별로 값 하나만 쓴다 — <1280px: --space-4(16px), >=1280px: --space-6(32px)
2. **dashboard**: main+sidebar 2열 구조를 없애고 1열로 바꿨다. 순서는 age-summary → quick-links(2열 격자는 유지) →
   share-entry(이전에 사이드바에 있던 공유 버튼 영역) → disclaimer. header·child-switcher 내부 콘텐츠 폭도 같은
   `--layout-content-max`(720px) 기준선을 쓴다(`screens/dashboard.md`)
3. **헤더**: `PageHeader` 의 내부 그리드 폭이 variant 와 무관하게 전부 `--layout-content-max`(720px)를 쓴다(이전
   라운드는 variant=dashboard 만 1120px 로 더 넓었다, `components/PageHeader.md`)
4. **input·input-weeks·share**: 폼 카드(`form-card`)·공유 카드(`card-preview`)를 720px 컨테이너 안에서 100% 채우는
   쪽으로 바꿨다(이전 라운드는 각각 400px·420px 로 카드 자체를 더 좁혔다). 카드가 더 좁으면 다른 조회 화면과 좌우
   기준선이 달라지기 때문이다(`screens/input.md`·`screens/share.md`)
5. **건드리지 않은 것**: `ValueCard`(480/560px)·`StatePanel`(480px)·`ConfirmDialog`/`EditProfileDialog`(400px)·
   `Button` 최대 폭(320px)처럼 본문 컨테이너 **안에** 있는 개별 요소 폭은 이번 라운드 대상이 아니다(지시서 FORBIDDEN
   범위) — 이 값들은 컨테이너가 720px 로 넓어져도 그대로다

## decisions (7차 라운드분)

| 무엇을 | 왜 | 되돌릴 위치 |
|---|---|---|
| 화면마다 다르던 본문 최대 폭 토큰 6개(400·640·640·1120·360·32)를 `--layout-content-max`(720px) 하나로 합친다 | 사용자 원문 "가로사이즈는 메인과 서브가 동일하게 만들어 왔다갔다하지말고". 9개 화면이 화면 폭이 다르면 화면을 옮길 때마다 좌우 시작선이 흔들린다 — 시안이 없어 근거 순서 1번(요구사항 사용자 흐름)이 아니라 사용자의 직접 지시를 그대로 값으로 옮겼다 | `tokens.md:## 레이아웃` |
| dashboard 의 main+sidebar 2열(1120px) 구조를 버리고 1열로 되돌린다. 공유 버튼 영역(share-entry)은 quick-links 바로 아래, disclaimer 바로 위에 둔다 | 2열 구조 자체가 1120px 라는 dashboard 전용 값을 필요로 했다. 폭을 통일하려면 2열 구조를 없애는 것이 유일한 방법이었다(폭은 같은데 열 구성만 다르면 콘텐츠 배치가 화면마다 또 달라 보인다) | `screens/dashboard.md` |
| input·input-weeks 의 form-card, share 의 card-preview 를 400px/420px 로 좁히지 않고 720px 컨테이너를 100% 채우게 바꾼다 | 지시서 CONTEXT "카드가 더 좁으면 기준선이 달라지므로 컨테이너 폭을 채우는 쪽을 우선 검토"를 그대로 따랐다. 카드를 좁게 유지하면 좌우 시작선이 age-basis·checkups 같은 화면과 달라진다 | `screens/input.md`, `screens/share.md` |
| `ValueCard`·`StatePanel`·다이얼로그·버튼처럼 본문 컨테이너 **안**에 있는 개별 요소의 폭(480/560/400/320px)은 그대로 둔다 | 지시서가 이 값들을 명시적으로 대상 밖("대상이 아닌 것")으로 뒀다. 컨테이너 폭 통일과 컨테이너 안 요소의 폭은 다른 문제다 | `components/ValueCard.md`, `components/StatePanel.md` |
