# screen: home

platform: nextjs
route(nextjs): /
route(rn): 해당 없음 — profile 의 stack 이 nextjs 라 모바일 앱이 없다
goal: 방문자가 첫 스크롤 안에 "무엇을 하는 사람인가"를 읽고, 근거가 되는 케이스 3건 중 하나로 들어간다
entry: 직접 방문 · 이력서/프로필의 링크
exit: 케이스 카드 클릭 → case-detail · "전체 보기" → case-index

## layout

- region: header
  - fixed: false
  - role: 사이트 이름과 케이스 목록으로 가는 링크. 스크롤을 따라오지 않는다
  - component: SiteHeader
  - tokens: bg=--background, border-b=--border
- region: main
  - scroll: true
  - role: 페이지 본문. landmark=main
  - region: hero
    - role: 한 문장 포지셔닝. 이 화면에서 가장 먼저 읽혀야 한다
    - priority: 1
    - content: h1 한 문장(최대 2줄) + 보조 문단 1개(최대 3줄) + 연락 링크 2개
    - h1(초안): "여러 서비스가 가져다 쓰는 프론트엔드 시스템을 만듭니다."
    - 보조(초안): 무엇을 만들었는지가 아니라 어떤 제약에서 무엇을 고르고 무엇을 버렸는지를 씁니다.
    - tokens: fg=--foreground, 보조=--muted-foreground, 제목=text-4xl
  - region: featured-cases
    - role: 포지셔닝의 근거. 케이스 3건을 카드로 보여준다
    - priority: 2
    - 1차 3건: token-store-race-condition · middleware-proxy-split · shared-sdk-design
    - component: CaseCard (3회 반복)
    - layout: <768 1열 / >=768 3열 grid, gap-4
    - tail: "전체 보기" 링크 1개 → /cases
  - region: contact
    - role: 다음 행동. 이메일과 GitHub 링크
    - priority: 3
    - github: https://github.com/knut15 (확정)
    - email: 주소 미정. `mailto:` 자리만 두고 값은 사용자가 넣는다. 공개 레포에 개인 주소를 박는 결정이라 스펙이 대신 정하지 않는다
- region: footer
  - role: 저작권 한 줄. 링크 없음
  - tokens: fg=--muted-foreground

## states

- state:default — featured-cases 에 케이스 3건. MDX 가 3건 미만이면 있는 만큼만 보이고 빈 칸을 만들지 않는다
- state:loading — 없다. 케이스는 빌드 시점에 MDX 에서 정적으로 박히므로 런타임 데이터 요청이 0건이다. 스켈레톤을 만들지 않는다
- state:empty — MDX 파일이 0건이면 featured-cases 영역 자체를 렌더하지 않는다. "케이스가 없습니다" 문구를 쓰지 않는다 — 방문자에게 빈 상태를 보여줄 이유가 없고, 이건 빌드 시점에 이미 아는 사실이다
- state:error — 없다. 빌드 시점에 MDX 파싱이 실패하면 배포가 실패한다. 런타임 에러 화면을 만들지 않는다

## responsive

- nextjs: <768 단일 열, hero 제목 text-3xl, 섹션 세로 py-10 / >=768 featured-cases 3열, 제목 text-4xl, py-16
- nextjs: 컨테이너 max-w-5xl, 좌우 px-4

## a11y

- focus-order: header.logo → header.cases → header.theme → hero.contact[0] → hero.contact[1] → featured-cases.card[0..2] → featured-cases.all → contact.email → contact.github
- landmark: main = main, header = banner, footer = contentinfo
- announce: 없음. 이 화면에는 비동기 상태 변화가 없다
