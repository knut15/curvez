# screen: input
route: /
goal: 사용자가 출생일·출산 예정일(또는 재태주수+일)·성별을 입력해 프로필을 저장하고 대시보드로 넘어간다 (F1, PC-F1-AC1~AC6)
entry: 검색 결과 · 카카오톡 공유 링크 · 처음 방문(북마크) · dashboard 의 "+ 아이 추가"(쿼리 `?new=1`, PC-F1-AC5). 저장된 프로필이 있고 `new=1` 이 아니면 이 화면을 그리지 않고 즉시 /dashboard 로 보낸다(PC-F1-AC4). `new=1` 이면 프로필이 이미 있어도 리다이렉트하지 않고 빈 입력 폼을 그린다(두 번째 이상 아이 추가)
exit: 저장 성공 → `saveProfile` 이 새 프로필을 뒤에 더하고 그 아이를 선택한 뒤 /dashboard 로 이동(추가한 아이가 보인 채로 열린다). "주수로 입력" 전환은 이 화면 안에서 모드만 바꾼다(이동 아님)

## layout
- region: page-background
  - role: 화면 전체 배경. `--gradient-hero-canvas`(청록빛 은은한 광원 + 아이보리, tokens.md)를 화면 최하단에 깐다 — 장식일 뿐 콘텐츠가 아니다("밝고 생기 있는" 리디자인, CSS 그라디언트만 사용)
- region: header
  - fixed: false
  - role: 서비스 이름만 한 줄로 보여준다. 뒤로가기 없음(첫 진입이라 갈 곳이 없다). **제목은 이 화면을 포함한 모든 화면에서 화면 폭과 무관하게 항상 헤더 정중앙에 온다**(PageHeader.md `## 레이아웃` 규칙)
  - component: PageHeader(variant=title-only, title=siteName)
  - tokens: bg=--color-bg-surface, height=--layout-header-height(64px)
- region: content
  - scroll: true
  - role: 입력 폼 하나만 놓는다. 마케팅 문구·배너·광고를 두지 않는다(PC-F1-AC1, PC-NF-MOBILE-4). 이름·출생 체중은 이 화면에 두지 않는다(PC-F1-AC1, SPEC §3 은 둘 다 선택 항목이지 이 화면의 필수 항목이 아니다) — 저장한 뒤 대시보드 헤더의 `HeaderMenu`."프로필 편집"(EditProfileDialog)에서 입력·수정한다(PC-F6-AC3, PC-F7-AC1)
  - region: form-card
    - role: 입력 폼을 감싸는 카드. 360px 에서도 >=1280px 에서도 "허허벌판에 입력칸만 떠 있는" 인상을 주지 않도록 카드 형태로 감쌌다. 카드 폭은 본문 컨테이너(`--layout-content-max`, 720px)를 항상 100% 채운다 — 이전 라운드는 카드 자체를 400px 로 좁혔으나, 다른 8개 화면과 같은 좌우 기준선을 쓰기 위해 7차 라운드부터 컨테이너를 채우는 쪽으로 바꿨다(`index.md` 7차 라운드 decisions)
    - component: (카드 컨테이너) bg=--color-bg-surface, radius=--radius-lg, 그림자=--elevation-card, 패딩=--space-6(32px)
    - region: brand-decoration
      - role: 장식. 카드 위쪽 중앙에 `IconBadge`(icon="Baby", tone=primary, size=hero, 장식) — PC-F1-AC1 이 금지하는 것은 "추가 입력·버튼" 이지 아이콘·일러스트 장식이 아니다(CONTEXT 명시)
    - region: form
      - role: 프로필 값을 받는다
      - fields (세로로 이 순서 — SPEC 원문 "출산 예정일 칸 아래에 '주수로 입력' 전환이 있다"(PC-F1-AC1)에 맞춘 순서를 그대로 유지한다):
        - DateField(label="출생일", required=true, placeholder="YYYY-MM-DD")
        - 예정일 모드일 때: DateField(label="출산 예정일", required=true)
        - 주수 모드일 때: GestationInput(label="출생 시 재태주수", required=true) — weeks(22~44) + days(0~6). `/?weeks=n` 진입 시 이 모드로 시작하고 weeks 에 n, days 에 0 이 채워진다
        - GestationModeToggle: 링크형 텍스트 "주수로 입력"(예정일 모드일 때 보임) / "예정일로 입력"(주수 모드일 때 보임) — 바로 위 필드(출산 예정일 또는 주수+일) 아래에 놓는다. 누르면 그 필드가 예정일 ↔ 주수 모드로 바뀐다(PC-F1-AC1)
        - SegmentedControl(label="성별", options=["남아","여아"], required=true)
      - error: 재태일수가 154일 미만·308일 초과(22주 0일 미만·44주 초과)이거나 출생일이 오늘보다 뒤면, 폼 위에 인라인 에러(아이콘 `AlertCircle` + "날짜를 확인하세요", SPEC 원문 그대로)가 보이고 저장 버튼이 비활성화된다
    - region: submit
      - role: 저장하고 결과 화면으로 넘어간다
      - component: Button(variant=primary, label="저장하고 결과 보기", size=lg)
      - tokens: margin-top=--space-6

## states
- state:default — 모든 필드가 비어 있다(`?new=1` 진입도 같다 — 새 아이는 기존 값을 물려받지 않는다). 저장 버튼은 필수 값이 다 차고 유효성을 통과해야 활성화된다
- state:loading — localStorage 쓰기는 동기 처리라 200ms 미만이다. 표시하지 않는다. 저장된 프로필이 있어 /dashboard 로 넘어가는 순간에도 header 만 유지하고 폼 자리에는 아무것도 그리지 않는다(깜빡임 최소화, Skeleton 없음)
- state:empty — 이 화면 자체가 입력 전 기본 상태다. 별도의 빈 상태는 없다(입력 폼이 늘 존재한다)
- state:error — 유효성 오류. 필드 그룹 위에 에러 배너 "날짜를 확인하세요"(아이콘 `AlertCircle` + 빨강 텍스트, 색만 쓰지 않는다). 폼 값은 유지, 저장 버튼 비활성

## responsive
- 360~767px(모바일): 1열, 화면 좌우 여백 --space-4(16px), form-card 폭 100%(카드 자체 좌우 여백은 카드 패딩이 대신한다), brand-decoration `IconBadge` size=lg(hero 는 좁은 화면에서 과하다)
- 768~1279px(태블릿): 본문 컨테이너 폭 최대 --layout-content-max(720px) 중앙 정렬, 좌우 여백 --space-4(16px) 그대로(이전 라운드는 카드를 400px 로 좁혔으나 7차 라운드부터 다른 화면과 같은 폭 규칙을 쓴다). form-card 는 컨테이너 폭 100%를 그대로 채운다. 배경 그라디언트는 화면 전체 폭을 채운다
- >=1280px(데스크톱): 본문 컨테이너 폭 --layout-content-max(720px), 좌우 여백 --space-6(32px)로 유지(2열로 나누지 않는다 — 입력 폼 하나뿐이라 나눌 콘텐츠가 없다). form-card 는 컨테이너 폭 100%를 채운다. 카드 좌우로 `--gradient-hero-canvas` 배경이 여전히 넉넉히 드러난다(720px 밖은 배경만). brand-decoration `IconBadge` size=hero(40px 아이콘, 56px 원)

## a11y
- focus-order: 출생일 → 출산예정일(또는 주수+일) → "주수로 입력"/"예정일로 입력" 전환 → 성별 → 저장 버튼
- landmark: content = main, header = banner
- announce: 저장 성공 시 live region "프로필을 저장했습니다". 유효성 오류 발생 시 live region "날짜를 확인하세요"
