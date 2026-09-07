# screen: case-detail

platform: nextjs
route(nextjs): /cases/[slug]
route(rn): 해당 없음 — profile 의 stack 이 nextjs 라 모바일 앱이 없다
goal: 방문자가 하나의 케이스에서 "어떤 제약에서 무엇을 골랐고 무엇을 버렸나"를 끝까지 읽는다
entry: home 의 카드 · case-index 의 카드 · 외부 링크
exit: 목록으로 돌아가기 → case-index · 다음 케이스 → case-detail

## layout

- region: header
  - role: 사이트 이름과 케이스 목록 링크
  - component: SiteHeader
- region: main
  - scroll: true
  - role: 케이스 본문. landmark=main
  - region: case-header
    - role: 제목·기간·역할·기술 태그. 본문을 읽기 전에 맥락을 준다
    - priority: 1
    - content: h1 · 메타 한 줄(date, role) · 태그 칩 n개
    - tokens: 메타=--muted-foreground, 칩 bg=--muted
  - region: body
    - role: MDX 본문. 제약 → 선택 → 버린 것 순서로 읽힌다
    - priority: 2
    - layout: max-w-[68ch] 단일 열
    - tokens: 코드 블록 bg=--muted, 인용 border-l=--border
  - region: nav-next
    - role: 다음 읽을거리. 이전/다음 케이스 링크 최대 2개. 없으면 영역을 숨긴다
    - priority: 3
- region: footer
  - role: 저작권 한 줄

## states

- state:default — 본문이 있는 케이스 하나. nav-next 는 이웃 케이스가 있을 때만 보인다
- state:loading — 없다. 정적 생성이라 런타임 데이터 요청이 0건이다
- state:empty — 이 화면에는 빈 상태가 없다. 단건 조회이고, 없는 slug 는 state:error 로 간다
- state:error — 없는 slug 는 Next 의 notFound() 로 404 를 반환한다. 문구 "찾을 수 없는 케이스입니다." 와 목록으로 가는 링크 1개. 재시도 버튼을 두지 않는다 — 다시 눌러도 결과가 같다

## responsive

- nextjs: <768 py-10 · 본문 그대로 1열 / >=768 py-16 · 본문 max-w-[68ch] 중앙 정렬, 컨테이너 max-w-5xl

## a11y

- focus-order: header.logo → header.cases → header.theme → case-header.tag[0..n] → body 내부 링크 순서 → nav-next.prev → nav-next.next → footer
- landmark: main = main, body = article
- announce: 없음
- heading: h1 은 케이스 제목 하나뿐. MDX 본문의 최상위 제목은 h2 로 시작한다
