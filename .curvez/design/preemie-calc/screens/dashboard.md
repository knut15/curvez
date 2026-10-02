# screen: dashboard
route: /dashboard
goal: 오늘 기준 생후/교정 나이를 확인하고, 다른 기능·아이 전환·아이 추가·프로필 편집·삭제·공유로 이동한다 (F2, PC-F1-AC5, PC-F1-AC6, PC-F6-AC3, PC-F7-AC1, F7 진입, 8차 라운드부터 F8·F10·F14·F15 진입 카드 추가)
entry: input 화면 저장 완료 / 재방문 시 자동 진입(저장된 프로필 있음, PC-F1-AC4) / 하위 화면에서 뒤로가기
exit: 하위 화면(age-basis·checkups·copay-relief·correction-period·growth·vaccinations·target-height·formula)으로 이동 / 공유 카드 생성(F7) / 정보 전체 삭제 확인 후 input 화면으로 / "+ 아이 추가" → `/?new=1` 로 이동(PC-F1-AC5) / 프로필 편집 저장·취소 → 이 화면에 남는다(다이얼로그만 닫힌다)

## layout
- region: header
  - fixed: true
  - role: 서비스 브랜드 마크(장식) + 제목. "프로필 편집"·"정보 전체 삭제" 는 이번 라운드부터 `HeaderMenu` 하나("더보기")로 묶었다(위치·위계 재정렬 — tokens.md decisions). **제목은 이 화면을 포함한 모든 화면에서 화면 폭과 무관하게 항상 헤더 정중앙에 온다**(PageHeader.md `## 레이아웃` 규칙 — 좌측 브랜드 마크와 우측 `HeaderMenu` 트리거는 폭이 달라도 `--layout-header-side-reserve` 로 같은 최소 폭을 예약해 제목이 밀리지 않는다)
  - component: PageHeader(variant=dashboard, onEditProfile, onDeleteAll)
  - tokens: bg=--color-bg-surface, height=--layout-header-height(64px), border-bottom=--color-border-subtle

- region: child-switcher
  - role: 아이가 1명이면 "+ 아이 추가" 버튼만, 2명 이상이면 전환 탭 + "+ 아이 추가" 버튼을 함께 보여준다(PC-F1-AC5). 이 영역은 프로필이 1명 이상이면 항상 보인다(0명이면 이 화면 자체가 `/` 로 리다이렉트되므로 닿지 않는다). "프로필 편집"·"정보 전체 삭제" 가 헤더 메뉴 뒤로 빠지면서, 이 영역이 헤더 바로 아래 첫 조작 지점이 됐다(자주 쓰는 행동을 위로, 가끔 쓰는 행동을 메뉴 뒤로)
  - component: ChildSwitcherTabs

- region: content
  - scroll: true
  - role: 모든 폭에서 1열, 아래 순서 그대로(age-summary → quick-links → share-entry → disclaimer). 이전 라운드의 >=1280px 2열(main+sidebar) 구조는 7차 라운드로 없앴다 — 본문 최대 폭을 다른 8개 화면과 같은 `--layout-content-max`(720px) 하나로 통일했다(아래 `## responsive` 참고, 사용자 원문 "가로사이즈는 메인과 서브가 동일하게")
  - region: age-summary
    - role: 오늘 기준 생후/교정 나이를 나란히 보여준다. 모든 폭에서 스크롤 없이 화면에 들어와야 한다(핵심 정보, priority 1). content 맨 위(더는 별도 main 컬럼이 없다)
    - component: AgeSummaryCard
    - priority: 1
  - region: quick-links
    - role: F3~F6·F8·F10·F14·F15 로 가는 이동 카드 목록(8차 라운드부터 4개 → 8개). F6(교정연령 적용 종료 안내)은 재태 37주 이상이면 이 목록에서 숨긴다(PC-F6-EX1). 새로 더한 4개(성장 기록·예방접종 일정·목표키 참고·분유량 참고)는 숨기는 조건이 없다 — 모든 아이에게 항상 보인다
    - component: InfoRow(variant=nav-card, 반복 — icon="CircleHelp" "어느 나이를 쓰나", icon="Stethoscope" "영유아검진 도우미", icon="Banknote" "본인부담 경감 종료일", icon="Hourglass" "교정연령 적용 종료 안내", icon="Ruler" "성장 기록"(8차 라운드), icon="Syringe" "예방접종 일정"(8차 라운드), icon="Target" "목표키 참고"(8차 라운드), icon="Milk" "분유량 참고"(8차 라운드))
    - priority: 2
  - region: share-entry
    - role: 지금 결과를 공유한다. "결과 문구 복사"·"링크 복사"는 항상 보인다(PC-F7-EX1, PC-F7-AC5~AC7, 8차 라운드부터 두 복사 버튼으로 늘었다). `navigator.share` 를 쓸 수 있는 환경이면 그 위에 카드 이미지를 만들어 공유하는 버튼도 함께 보인다(카카오 SDK 미사용). 모든 폭에서 quick-links 바로 아래(본문 흐름 안, 더는 별도 sidebar 칸이 아니다 — 7차 라운드)
    - component: ShareActionButton
    - priority: 3
  - region: disclaimer
    - role: 의료 면책 문구와 근거 자료 안내. 모든 폭에서 맨 아래(share-entry 다음)
    - component: ReferenceFooter(variant=disclaimer-only)
    - priority: 4

이 화면 위에 오버레이 둘이 열린다(레이아웃 트리에는 넣지 않는다 — 화면을 이동하지 않고 겹쳐 뜬다):
- header 의 `HeaderMenu` → "프로필 편집" 항목 → `EditProfileDialog` (이름·출생 체중 입력/수정, PC-F6-AC3·PC-F7-AC1)
- header 의 `HeaderMenu` → "정보 전체 삭제" 항목(SPEC 원문 그대로) → `ConfirmDialog` (PC-F1-AC6)

## states
- state:default — 프로필이 있다. age-summary 가 값으로 채워진다
- state:loading — localStorage 읽기는 동기 처리라 200ms 미만이다. 표시하지 않는다. 최초 hydration 이 200ms 를 넘는 드문 경우에만 age-summary·quick-links 자리를 Skeleton 으로 채운다. header·child-switcher 는 유지
- state:empty — 저장된 프로필이 없으면 이 화면을 그리지 않고 `/` 로 보낸다(PC-F2-EX1). 그래서 이 화면에는 "프로필 없음" 빈 상태가 없다
- state:error — localStorage 값을 읽었지만 파싱에 실패하면(버전 불일치 등) content 를 StatePanel(variant=error) 로 치환한다. 문구 "정보를 불러오지 못했습니다", 액션 버튼 "처음으로"(→ /). header·child-switcher 는 유지

## responsive
- 360~767px(모바일): 1열, quick-links 는 세로 목록(8개), content 좌우 여백 --space-4(16px)
- 768~1279px(태블릿): content 폭 최대 --layout-content-max(720px) 중앙 정렬, 좌우 여백 --space-4(16px) 그대로. quick-links 는 2열 그리드(4행 × 2열)로 바뀐다. share-entry·disclaimer 는 quick-links 아래 그대로 1열
- >=1280px(데스크톱): content 폭 최대 --layout-content-max(720px) 중앙 정렬, 좌우 여백 --space-6(32px)(2열 분할 폐기 — 이전 라운드의 main+sidebar 1120px 구조를 버리고 나머지 8개 화면과 같은 1열 본문 폭 규칙을 쓴다, 7차 라운드 CONTEXT "가로사이즈는 메인과 서브가 동일하게"). age-summary → quick-links(2열 그리드 유지, 카드 내부 패딩만 키운다) → share-entry → disclaimer 순서 그대로 세로로 쌓는다. header·child-switcher 내부 콘텐츠 폭도 같은 --layout-content-max(720px)·좌우 --space-6 기준선을 써서 child-switcher 왼쪽 끝이 카드들과 같은 세로선에 온다(2026-09-30 6차 라운드 결함 수정 유지). content 컨테이너의 상단 패딩만 이 폭에서 --space-8(64px) 대신 --space-5(24px)를 쓴다(좌우=--space-6, 하단=--space-8 은 그대로) — child-switcher 자체 하단 패딩(--space-3=12px)과 합쳐 버튼-카드 사이 빈 공간이 76px 에서 36px 로 줄어든다

## a11y
- focus-order: header."더보기"(HeaderMenu 트리거) → child-switcher.탭[0..n] → child-switcher."+ 아이 추가" → age-summary → quick-links[0..7](8개, 어느 나이를 쓰나 → 영유아검진 도우미 → 본인부담 경감 종료일 → 교정연령 적용 종료 안내 → 성장 기록 → 예방접종 일정 → 목표키 참고 → 분유량 참고) → share-entry. 모든 폭에서 DOM 순서와 시각 순서가 같다(7차 라운드부터 2열 분할 자체가 없어 이 둘이 어긋날 지점이 없다)
- landmark: content = main, header = banner
- announce: 아이 전환 시 live region "○○(으)로 바꿨습니다"(이름 없으면 "아이 N"). 삭제 확인(ConfirmDialog) 완료 시 live region "저장된 정보를 모두 지웠습니다". 프로필 편집(EditProfileDialog) 저장 완료 시 live region "프로필 정보를 저장했습니다"
