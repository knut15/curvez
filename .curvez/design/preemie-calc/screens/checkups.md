# screen: checkups
route: /dashboard/checkups
goal: 다음 영유아검진 차수와 오늘 작성해야 할 문진표·발달선별검사지 개월을 확인한다 (F4, PC-F4-AC1~AC5, PC-F4-EX1)
entry: dashboard 의 quick-links "영유아검진 도우미" 카드
exit: 뒤로가기 → /dashboard

## layout
- region: header
  - fixed: true
  - role: 뒤로가기와 화면 제목 "영유아검진 도우미". **제목은 화면 폭과 무관하게 항상 헤더 정중앙에 온다**(PageHeader.md `## 레이아웃`)
  - component: PageHeader(variant=back, title="영유아검진 도우미", onBack)

- region: content
  - scroll: true
  - region: current-summary
    - role: 오늘 작성할 검사지 개월을 한 줄로 강조(예: "오늘은 교정 4개월 기준으로 문진표를 쓰세요", PC-F4-AC2). 앞에 `IconBadge`(icon="Stethoscope", tone=warm) 장식. current 차수가 없으면(모두 지났거나 아직 시작 전) 이 영역을 그리지 않는다
    - priority: 1
  - region: unconfirmed-notice
    - role: questionnaireCorrection 이 미확정 상태이면 이 화면 전체가 잠정 규칙을 쓴다는 표시를 한다
    - component: UnconfirmedNotice
  - region: round-list
    - role: 차수별 방문 기간(출생 기준)과 검사지 기준 개월을 목록으로 보여준다. 지난·오늘·남은 차수를 구분한다(PC-F4-AC4)
    - component: CheckupRoundItem(반복, 방문 시작일 순 정렬)
    - 각 항목: 차수 라벨("1차") + 방문 기간(예: "2026-07-01 ~ 2026-09-30") + 검사지 기준 배지("교정 4개월 기준" 또는 "생후 26개월 기준", 24개월 검진 이후는 출생 기준으로 표시, PC-F4-AC3) + StatusBadge(지남/오늘/예정)
  - region: disclaimer
    - role: 데이터 출처와 기준일(PC-F4-AC5), 의료 면책 문구
    - component: ReferenceFooter

## states
- state:default — round-list 에 1개 이상의 차수가 있다
- state:loading — 프로필은 dashboard 에서 이미 읽었다. 200ms 미만, 표시하지 않는다
- state:empty — 생후 72개월 이상이라 모든 차수가 지났으면 round-list 자리를 문구로 바꾼다: "영유아검진 대상 기간이 끝났습니다"(SPEC 원문 그대로, PC-F4-EX1). `IconBadge`(icon="Info", tone=primary)와 함께 보인다. current-summary·round-list 는 숨기고 이 문구와 disclaimer 만 남긴다
- state:error — checkup-rounds.json 을 불러오지 못하면 content 를 StatePanel(variant=error) 로 치환. 문구 "검진 안내를 불러오지 못했습니다", 액션 버튼 "대시보드로"

## responsive
- 360~767px(모바일): round-list 1열 카드, 좌우 여백 --space-4(16px)
- 768~1279px(태블릿): content 폭 최대 --layout-content-max(720px) 중앙 정렬, 좌우 여백 --space-4(16px) 그대로. round-list 카드를 좌우 2열로 배치, current-summary 는 폭 전체
- >=1280px(데스크톱): content 폭 최대 --layout-content-max(720px) 중앙 정렬, 좌우 여백 --space-6(32px)(2열 화면 분할은 하지 않는다 — CheckupRoundItem 자체가 이미 2열 그리드라 화면을 더 넓히면 카드가 과하게 넓어진다, CheckupRoundItem.md 참고). round-list 2열 그리드 유지, 카드 내부 패딩만 --space-5(24px)로 키운다

## a11y
- focus-order: header.back → current-summary(있으면) → round-list[0..n]
- landmark: content = main, header = banner
- announce: 없음(정적 조회 화면)
