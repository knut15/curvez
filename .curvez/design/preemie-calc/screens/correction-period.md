# screen: correction-period
route: /dashboard/correction-period
goal: 교정연령을 언제까지 쓰는지 확인한다 (F6, PC-F6-AC1~AC4, PC-F6-EX1)
entry: dashboard 의 quick-links "교정연령 적용 종료 안내" 카드. 재태 37주 이상 아이는 이 카드 자체가 dashboard 에 없다(PC-F6-EX1)
exit: 뒤로가기 → /dashboard

## layout
- region: header
  - fixed: true
  - role: 뒤로가기와 화면 제목 "교정연령 적용 종료 안내". **제목은 화면 폭과 무관하게 항상 헤더 정중앙에 온다**(PageHeader.md `## 레이아웃`)
  - component: PageHeader(variant=back, title="교정연령 적용 종료 안내", onBack)

- region: content
  - scroll: true
  - region: result
    - role: 기본 종료 개월과(체중 미입력 시) 연장 조건을 함께 보여준다
    - component: ValueCard(icon="Hourglass", tone=warm) — AgeSummaryCard(variant=single) 에서 ValueCard 로 옮겼다(구조 리뷰 PLC-02)
    - 문구(SPEC 원문 그대로):
      - 체중 미입력: "24개월까지" 와 "출생 체중이 1.5kg 미만이면 36개월까지" 를 함께 보인다(PC-F6-AC1)
      - 재태 28주 미만 또는 체중 1.5kg 미만: "36개월까지 쓸 수 있음"(PC-F6-AC2, AC3)
  - region: unconfirmed-notice
    - role: 종료 기준을 출생/교정 어느 나이로 셀지가 미확정이면 표시한다. 미확정인 동안은 종료 날짜를 계산하지 않고 개월 문구만 보인다
    - component: UnconfirmedNotice
  - region: advice
    - role: "의료진과 상담해 정하세요"(SPEC 원문 그대로, PC-F6-AC4)를 result 바로 아래에 둔다
  - region: disclaimer
    - role: 의료 면책 문구, 데이터 출처
    - component: ReferenceFooter

## states
- state:default — 재태 37주 미만이다. result·advice 가 찬다
- state:loading — dashboard 에서 이미 읽은 프로필로 계산하므로 이 화면만의 로딩이 없다. 200ms 미만, 표시하지 않는다
- state:empty — 재태 37주 이상인 프로필로 이 경로에 직접 접근하면(예: 즐겨찾기) result·advice·unconfirmed-notice 를 문구로 바꾼다: "이 아이는 교정연령을 쓰지 않습니다(재태 37주 이상)". `IconBadge`(icon="Info", tone=primary)와 함께 보인다. dashboard 의 quick-links 에는 애초에 이 카드가 없어 정상 경로로는 이 상태에 닿지 않는다
- state:error — correction-period.json 을 불러오지 못하면 content 를 StatePanel(variant=error) 로 치환. 문구 "안내를 불러오지 못했습니다", 액션 버튼 "대시보드로"

## responsive
- 360~767px(모바일): result 카드 폭 100%, 좌우 여백 --space-4(16px)
- 768~1279px(태블릿): content 폭 최대 --layout-content-max(720px) 중앙 정렬, 좌우 여백 --space-4(16px) 그대로. result 카드 폭 최대 480px 중앙 정렬(ValueCard 자체의 폭 — 본문 컨테이너 통일 대상이 아니다)
- >=1280px(데스크톱): content 폭 최대 --layout-content-max(720px) 중앙 정렬, 좌우 여백 --space-6(32px). result 카드(ValueCard) 폭 최대 560px 중앙 정렬(ValueCard.md 의 데스크톱 규칙 참고, 마찬가지로 본문 컨테이너 폭 통일 대상이 아니다)

## a11y
- focus-order: header.back → result → unconfirmed-notice(있으면) → advice
- landmark: content = main, header = banner
- announce: 없음(정적 조회 화면)
