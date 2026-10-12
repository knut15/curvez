# screen: vaccinations
route: /dashboard/vaccinations
goal: 차수별 예방접종 권장일과 교정 나이를 확인하고, 완료 여부를 체크한다 (F10, PC-F10-AC1~AC3)
entry: dashboard 의 quick-links "예방접종 일정" 카드
exit: 뒤로가기 → /dashboard

## layout
- region: header
  - fixed: true
  - role: 뒤로가기와 화면 제목 "예방접종 일정". **제목은 화면 폭과 무관하게 항상 헤더 정중앙에 온다**(PageHeader.md `## 레이아웃`)
  - component: PageHeader(variant=back, title="예방접종 일정", onBack)

- region: content
  - scroll: true
  - region: round-list
    - role: 백신·차수별 권장일(출생 기준)과 교정 나이를 병기하고, 완료/임박/놓침 상태와 완료 체크를 보여준다(PC-F10-AC1, AC2). 권장일이 이른 순으로 정렬한다
    - component: VaccinationRoundItem(반복)
    - 각 항목: 백신명+차수("B형간염 1차" 등) + 권장일(출생 기준, 예: "2026-05-01") + 교정 나이 병기(SPEC 원문 패턴 "교정 5일" 그대로, 음수면 "교정 D-○") + StatusBadge(kind=done\|soon\|missed\|upcoming) + "완료" 체크박스
  - region: disclaimer
    - role: 예방접종 일정 데이터 출처(질병관리청 표준 예방접종 일정표)·기준일, 의료 면책 문구
    - component: ReferenceFooter(sources=vaccinationScheduleMeta)

## states
- state:default — round-list 에 1개 이상의 차수가 있다
- state:loading — 프로필과 완료 체크는 dashboard 진입 시 이미 읽었다. 200ms 미만, 표시하지 않는다
- state:empty — 이 화면에는 빈 상태가 없다. 예방접종 차수는 vaccination-schedule.json 에 고정 정의돼 있어 "차수가 0개" 인 경우가 생기지 않는다(age-basis·checkups 와 같은 사유)
- state:error — vaccination-schedule.json 을 불러오지 못하면 content 를 StatePanel(variant=error)로 치환. 문구 "접종 안내를 불러오지 못했습니다", 액션 버튼 "대시보드로"

## responsive
- 360~767px(모바일): round-list 1열 카드, 좌우 여백 --space-4(16px)
- 768~1279px(태블릿): content 폭 최대 --layout-content-max(720px) 중앙 정렬, 좌우 여백 --space-4(16px) 그대로. round-list 카드를 좌우 2열로 배치(checkups 화면과 같은 패턴)
- >=1280px(데스크톱): content 폭 최대 --layout-content-max(720px) 중앙 정렬, 좌우 여백 --space-6(32px)(2열 화면 분할은 하지 않는다 — `VaccinationRoundItem` 자체가 이미 2열 그리드다). round-list 2열 그리드 유지, 카드 내부 패딩만 --space-5(24px)로 키운다

## a11y
- focus-order: header.back → round-list[0..n](각 항목 안 "완료" 체크박스 포함)
- landmark: content = main, header = banner
- announce: 완료 체크 시 live region "{백신명} {차수}를 완료로 표시했습니다". 체크 해제 시 "{백신명} {차수} 완료 표시를 지웠습니다"
