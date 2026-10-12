# screen: age-basis
route: /dashboard/age-basis
goal: 항목(접종·검진·이유식·발달)마다 어느 나이 기준을 쓰는지, 오늘 그 기준의 값이 무엇인지 확인한다 (F3, PC-F3-AC1~AC5)
entry: dashboard 의 quick-links "어느 나이를 쓰나" 카드
exit: 뒤로가기 → /dashboard

## layout
- region: header
  - fixed: true
  - role: 뒤로가기와 화면 제목 "어느 나이를 쓰나". **제목은 화면 폭과 무관하게 항상 헤더 정중앙에 온다**(PageHeader.md `## 레이아웃`). 뒤로가기는 좌측 zone 에, 아이콘 `ChevronLeft` + 텍스트 "대시보드"
  - component: PageHeader(variant=back, title="어느 나이를 쓰나", onBack)

- region: content
  - scroll: true
  - region: intro
    - role: 재태 37주 이상 아이는 모든 항목이 "생후 나이 그대로" 로 보인다는 안내를 한 줄로 둔다(PC-F3-AC5). 37주 미만이면 이 줄 자체를 그리지 않는다
  - region: item-list
    - role: 항목별 기준·오늘 값을 나란히 보여준다(예방접종·이유식·영유아검진 방문·문진표·발달선별검사지·발달 평가). 각 항목 앞에 장식 아이콘이 붙는다(InfoRow 의 `icon` prop)
    - component: InfoRow(variant=basis, 반복) — 각 행: `IconBadge` + 라벨("예방접종" 등) + 기준 배지("출생 기준"/"교정 기준") + 오늘 값("생후 3개월" 등)
    - 아이콘 매핑: 예방접종="Syringe", 이유식="Utensils", 영유아검진 방문="Stethoscope", 문진표·발달선별검사지="ClipboardList", 발달 평가="ClipboardCheck"
    - 예시(오늘 2026-06-01, 32주 아이): "예방접종 — 출생 기준 — 생후 3개월", "이유식 — 교정 기준 — 교정 1개월", "영유아검진 방문 — 출생 기준", "문진표·발달선별검사지 — 교정 기준(24개월 검진까지)"
  - region: source-note
    - role: 항목마다 근거 자료 이름과 기준일을 보인다(PC-F3-AC4). InfoRow 안에 작게 병기한다
  - region: disclaimer
    - role: 의료 면책 문구 + 전체 근거 자료 출처
    - component: ReferenceFooter

## states
- state:default — item-list 5개 항목이 모두 채워진다
- state:loading — 프로필은 dashboard 에서 이미 읽은 값을 그대로 쓰므로 이 화면 자체의 데이터 로딩은 없다. 200ms 미만, 표시하지 않는다
- state:empty — 이 화면에는 빈 상태가 없다. 5개 항목은 age-basis.json 에 고정 정의돼 있어 "항목이 0개" 인 경우가 생기지 않는다
- state:error — age-basis.json 을 불러오지 못하면(빌드 시점 포함 자산 오류) content 를 StatePanel(variant=error) 로 치환. 문구 "안내를 불러오지 못했습니다", 액션 버튼 "대시보드로"(→ /dashboard)

## responsive
- 360~767px(모바일): 1열, InfoRow 세로 스택(라벨 위·값 아래), 좌우 여백 --space-4(16px)
- 768~1279px(태블릿): content 폭 최대 --layout-content-max(720px) 중앙 정렬, 좌우 여백 --space-4(16px) 그대로. InfoRow 를 라벨-기준-값 3열 표로 바꾼다
- >=1280px(데스크톱): content 폭 최대 --layout-content-max(720px) 중앙 정렬, 좌우 여백 --space-6(32px)(2열로 나누지 않는다 — 목록형 콘텐츠라 폭을 더 넓혀도 가독성 이점이 없다). 배경(`--color-bg-canvas`)이 화면 전체 폭을 채워 좁은 칸만 덩그러니 있는 인상을 줄인다. InfoRow 3열 표 유지, 행 내부 패딩만 --space-4(16px)로 키운다

## a11y
- focus-order: header.back → intro(있으면) → item-list[0..4]
- landmark: content = main, header = banner
- announce: 없음(정적 조회 화면, 사용자 조작에 따른 화면 변화가 없다)
