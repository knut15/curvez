# screen: guide
route: /guide/[weeks]/[months]
goal: 검색으로 들어온 방문자가 "내 상황과 같은 조합" 설명을 읽고 계산기로 넘어간다 (F13, PC-F13-AC1~AC4)
entry: 검색 결과(예: "32주 출생 생후 3개월"). 481개(13주수 × 37개월) 조합 페이지 중 하나
exit: "이 주수로 계산기 열기" → /?weeks=<weeks>

## layout
- region: header
  - fixed: false
  - role: 서비스 브랜드 마크(장식) + 이름. **제목은 화면 폭과 무관하게 항상 헤더 정중앙에 온다**(PageHeader.md `## 레이아웃`). 이 헤더 제목은 h2 다(headingLevel=2) — 아래 heading 리전의 조합 제목을 h1 으로 두어 페이지 안에 h1 하나만 두기 위함(2026-09-30 6차 라운드, `PageHeader.md:## props`)
  - component: PageHeader(variant=title-only, title=siteName, headingLevel=2)

- region: content
  - scroll: true
  - region: heading
    - role: 조합을 제목으로 보여준다(h1). 예: "32주 출생, 생후 3개월"(2026-09-30 6차 라운드 — 헤더의 PageHeader 제목은 h2 로 내리고 이 조합 제목이 페이지의 유일한 h1 이다)
  - region: description
    - role: 예정일 대비 몇 주 일찍 태어났는지와 그 시점의 교정 나이 설명(PC-F13-AC2). 예: "예정일보다 8주 일찍 태어남" + "이 시기 교정 나이는 생후 3개월에서 8주(약 2개월)를 뺀 값입니다" 같은 설명. **날짜는 쓰지 않는다**(빌드 시점에 고정되면 안 된다, architecture ⑥)
  - region: checkup-info
    - role: 이 개월 수에 해당하는 검진 안내를 요약한다(1단계는 검진만, 접종은 3단계에 F10 이 생기면 추가, PC-F13-EX1). 앞에 장식 `IconBadge`(icon="Stethoscope", tone=primary)
  - region: cta
    - role: 이 주수를 채운 입력 화면으로 이동
    - component: Button(variant=primary, label="이 주수로 계산기 열기", icon={name:"ArrowRight",position:"trailing"})
  - region: disclaimer
    - role: 의료 면책 문구
    - component: ReferenceFooter(variant=disclaimer-only)

## states
- state:default — 이 화면의 유일한 상태다. 정적 빌드 페이지라 조합이 항상 존재한다(24~36주 × 0~36개월, `dynamicParams=false`)
- state:loading — 정적으로 빌드돼 서버 요청이 없다. 로딩 상태 자체가 없다
- state:empty — 이 화면에는 빈 상태가 없다. 범위 밖 조합(weeks<24 또는 >36, months<0 또는 >36)은 페이지 자체가 빌드되지 않아 404 로 처리된다(이 화면의 상태가 아니다)
- state:error — 빌드 결과물이라 런타임 에러가 없다. 데이터 파일(checkup-rounds.json 등) 자체를 못 읽으면 빌드가 실패하므로 이 화면에는 표시할 에러 상태가 없다

## responsive
- 360~767px(모바일): 1열, 좌우 여백 --space-4(16px)
- 768~1279px(태블릿): content 폭 최대 --layout-content-max(720px) 중앙 정렬, 좌우 여백 --space-4(16px) 그대로
- >=1280px(데스크톱): content 폭 최대 --layout-content-max(720px) 중앙 정렬, 좌우 여백 --space-6(32px)(이전 라운드는 이 화면만 720px 로 다른 "narrow" 화면(640px)보다 넉넉히 뒀으나, 7차 라운드부터 9개 화면 전부 같은 값을 쓰므로 더는 예외가 아니다). 배경(`--color-bg-canvas`)이 화면 전체 폭을 채운다

## a11y
- focus-order: heading → description → checkup-info → cta
- landmark: content = main, header = banner
- announce: 없음(정적 페이지, 사용자 조작으로 바뀌는 화면 상태가 없다)
