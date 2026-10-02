# screen: share
route: /share#b=YYYY-MM-DD&d=YYYY-MM-DD
goal: 링크를 받은 사람(조부모 등)이 카드를 보고, 원하면 자기 아이 계산기로 넘어간다 (F7 받는 쪽, PC-F7-AC1~AC3)
entry: 카카오톡/문자로 받은 공유 링크. 이름·프로필 id 는 URL 에 없다(fragment 에 출생일·출산예정일만)
exit: "내 아이도 계산해보기" → / (새 프로필 입력)

## layout
- region: page-background
  - role: 화면 전체 배경. `--gradient-hero-canvas`(청록빛 은은한 광원 + 아이보리)를 깐다 — 링크를 처음 받은 사람의 첫인상이라 input 화면과 같은 톤을 쓴다("밝고 생기 있는" 리디자인)
- region: header
  - fixed: false
  - role: 서비스 브랜드 마크(장식) + 이름만. 뒤로가기 없음(외부에서 바로 들어온다). **제목은 화면 폭과 무관하게 항상 헤더 정중앙에 온다**(PageHeader.md `## 레이아웃`)
  - component: PageHeader(variant=title-only, title=siteName)

- region: content
  - scroll: true
  - region: card-preview
    - role: 공유 카드와 같은 내용을 화면에서도 보여준다(카드 이미지는 별도 canvas 로 그리지만, 이 화면의 표시값은 카드와 같은 데이터를 쓴다). 이름은 어디에도 없다(PC-F7-AC1)
    - component: AgeSummaryCard(variant=share-preview) — 오늘 날짜 기준으로 이 기기에서 다시 계산한다(PC-F7-AC2)
    - priority: 1
  - region: cta
    - role: 자기 아이로 계산기를 새로 시작하는 진입점
    - component: Button(variant=secondary, label="내 아이도 계산해보기", icon={name:"ArrowRight",position:"trailing"})
    - priority: 2
  - region: disclaimer
    - role: 의료 면책 문구
    - component: ReferenceFooter(variant=disclaimer-only)

## states
- state:default — fragment 해독 성공. card-preview 가 오늘 기준 값으로 채워진다
- state:loading — 클라이언트에서 fragment 를 읽고 계산하는 처리는 동기라 200ms 미만이다. 표시하지 않는다
- state:empty — 이 화면에는 "결과 없음" 상태가 없다. fragment 가 없거나 해독에 실패하는 경우는 state:error 로 다룬다
- state:error — fragment 해독 실패 또는 값이 유효성 검사(재태 22~44주)를 통과하지 못하면 card-preview·cta 를 StatePanel(variant=error) 로 치환한다. 문구 "링크를 확인할 수 없습니다", 액션 버튼 "계산기 열기"(→ /). header·disclaimer 는 유지

## responsive
- 360~767px(모바일): card-preview 폭 100%, 좌우 여백 --space-4(16px)
- 768~1279px(태블릿): 본문 컨테이너 폭 최대 --layout-content-max(720px) 중앙 정렬, 좌우 여백 --space-4(16px) 그대로(이전 라운드는 카드를 420px 로 좁혔으나 7차 라운드부터 다른 화면과 같은 폭 규칙을 쓴다). card-preview 는 컨테이너 폭 100%를 채운다
- >=1280px(데스크톱): 본문 컨테이너 폭 --layout-content-max(720px), 좌우 여백 --space-6(32px)로 유지(input 화면과 같은 이유 — 카드 하나뿐이라 2열로 나누지 않는다). card-preview 는 컨테이너 폭 100%를 채운다. 배경 그라디언트가 컨테이너 좌우로 넉넉히 드러난다

## a11y
- focus-order: card-preview(정적 텍스트라 탭 없음) → cta
- landmark: content = main, header = banner
- announce: 없음(사용자 조작으로 바뀌는 상태가 없다. 진입 시 바로 렌더된다)
