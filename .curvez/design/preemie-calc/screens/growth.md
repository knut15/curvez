# screen: growth
route: /dashboard/growth
goal: 측정 기록(측정일·키·몸무게·머리둘레·측정 자세)을 남기고, 기록마다 그 시점의 나이 기준(출생/교정)에 맞춘 성장 백분위를 확인한다 (F8, PC-F8-AC1, AC2, AC4, AC5, EX1). 기록이 2개 이상이면 지표별 추이 그래프로 오르내림과 또래 백분위 구간 대비 위치를 함께 본다 (PC-F8-AC3)
entry: dashboard 의 quick-links "성장 기록" 카드
exit: 뒤로가기 → /dashboard

## layout
- region: header
  - fixed: true
  - role: 뒤로가기와 화면 제목 "성장 기록". **제목은 화면 폭과 무관하게 항상 헤더 정중앙에 온다**(PageHeader.md `## 레이아웃`)
  - component: PageHeader(variant=back, title="성장 기록", onBack)

- region: content
  - scroll: true
  - region: entry-form
    - role: 새 측정 기록을 추가한다. 다섯 값(측정일·키·몸무게·머리둘레·측정 자세) 모두 입력해야 저장된다
    - component: GrowthEntryForm
    - priority: 1
  - region: trend
    - role: 기록이 2개 이상이면 지표별(키·몸무게·머리둘레) 추이 그래프 3개를 세로로 쌓아 보여준다(PC-F8-AC3). 측정일 오름차순(왼쪽이 가장 오래된 기록). 백분위 기준선(3·50·97)을 함께 그려 또래 대비 위치를 보여준다. 기록이 1개면 그래프 대신 "기록을 더 추가하면 보인다"는 안내 한 줄, 기록이 0개면 이 영역 자체를 그리지 않는다(state:empty 의 StatePanel 이 이미 같은 안내를 한다)
    - component: GrowthTrendChart (측정값 상태에 따라 3개 인스턴스: measure=height / weight / headCircumference)
    - priority: 2
  - region: record-list
    - role: 저장된 기록을 측정일 역순(최신이 위)으로 보여준다. 기록마다 그 시점의 나이 기준(생후/교정)과 백분위(또는 표시 제외 사유)를 함께 보여준다. 추이 그래프(trend)가 "오르내림"을 보여준다면 이 표는 "정확한 값"(소수점까지)과 주의 문구를 행 단위로 보여준다 — 그래프의 스크린리더 대체 표현이기도 하다(`components/GrowthTrendChart.md` a11y:label 참고)
    - component: GrowthRecordTable
    - priority: 3
  - region: disclaimer
    - role: 성장 백분위 데이터 출처·기준일, 의료 면책 문구
    - component: ReferenceFooter(sources=growthPercentileMeta)

## states
- state:default — 기록이 1개 이상이고, 각 행에 백분위 값 또는 "이 시기는 백분위를 표시하지 않습니다"(PC-F8-AC5)가 채워진다. 기록이 2개 이상이면 trend 영역에 그래프 3개가 보인다(PC-F8-AC3). 기록이 정확히 1개면 trend 영역에 안내 한 줄만 보인다(`components/GrowthTrendChart.md` state:insufficient-data)
- state:loading — localStorage 읽기는 동기 처리라 200ms 미만이다. 표시하지 않는다. entry-form 은 항상 유지되고, 드물게 200ms 를 넘기면 trend·record-list 자리를 각각 Skeleton(shape=card)으로 채운다
- state:empty — 저장된 기록이 0개면 trend·record-list 자리를 StatePanel(variant=domain-empty) "아직 기록이 없습니다"로 대체한다("검색 결과 없음"이 아니라 "아직 없음" — 이 화면에 필터가 없어 구분할 두 번째 빈 상태는 없다). icon="Ruler" tone=primary. entry-form 은 이 상태에서도 그대로 보여 첫 기록 입력을 유도한다. trend 영역은 기록이 0개일 때 애초에 그리지 않으므로(위 `## layout` region: trend 참고) 이 StatePanel 하나가 두 영역을 겸한다
- state:error — 성장 백분위 기준 데이터 파일(growth-percentile.json)을 불러오지 못하면 content 전체를 StatePanel(variant=error)로 치환. 문구 "성장 기준 자료를 불러오지 못했습니다", 액션 버튼 "대시보드로"(→ /dashboard). 이 경우 entry-form 도 함께 가린다 — 기준 자료 없이는 백분위를 계산할 수 없어 새 기록을 받아도 보여줄 결과가 없기 때문이다(측정값 자체를 저장 없이 버리는 것을 막기 위해 폼 자체를 비활성화한다). trend 영역도 같은 이유로 content 전체 치환에 포함된다(백분위 기준선을 못 그린다)

## responsive
- 360~767px(모바일): 1열. entry-form 필드 세로 스택, 좌우 여백 --space-4(16px). record-list 는 기록마다 카드 1개(라벨-값 세로 스택, `InfoRow`(basis) 의 모바일 규칙과 같은 패턴). trend 의 그래프 3개는 세로로 쌓고(각 220px → 아래 `components/GrowthTrendChart.md` 의 200px, 카드 사이 간격 --space-5)
- 768~1279px(태블릿): content 폭 최대 --layout-content-max(720px) 중앙 정렬, 좌우 여백 --space-4(16px) 그대로. record-list 를 표(측정일·키·몸무게·머리둘레·자세·기준·백분위 7열)로 바꾼다. trend 그래프 높이 220px(`components/GrowthTrendChart.md` 참고)
- >=1280px(데스크톱): content 폭 최대 --layout-content-max(720px) 중앙 정렬, 좌우 여백 --space-6(32px)(2열로 나누지 않는다 — 나머지 8개 화면과 같은 1열 본문 폭 규칙). record-list 표 유지, 행 내부 패딩만 --space-4(16px)로 키운다. trend 그래프 높이 240px, 카드 내부 패딩 --space-6(32px)

## a11y
- focus-order: header.back → entry-form.측정일 → entry-form.키 → entry-form.몸무게 → entry-form.머리둘레 → entry-form.측정자세 → entry-form.저장 버튼 → trend(각 그래프는 `aria-hidden`, 탭 순서에서 건너뜀. 기록 1개일 때의 안내 카드도 포커스 대상이 아니다) → record-list[0..n]
- landmark: content = main, header = banner
- announce: 기록 저장 성공 시 live region "기록을 저장했습니다". 저장 실패(유효성 오류) 시 live region "측정값을 확인하세요"
