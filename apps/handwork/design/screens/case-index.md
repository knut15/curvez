# screen: case-index

route: /cases
goal: 방문자가 케이스 전체를 훑고 자기 관심사에 맞는 것을 고른다
entry: home 의 "전체 보기" · header 의 케이스 링크 · 검색 유입
exit: 카드 클릭 → case-detail

## layout

- region: header
  - role: 사이트 이름과 홈 링크
  - component: SiteHeader
- region: main
  - scroll: true
  - role: 케이스 목록. landmark=main
  - region: title
    - role: 화면 제목과 한 줄 설명. 목록이 무엇의 모음인지 말한다
    - priority: 2
    - type: h1 `text-4xl` `tracking-[-0.02em]` · 설명 `max-w-[65ch]` `leading-relaxed` `break-keep`
  - region: list
    - role: 케이스 카드를 최신순으로 나열한다
    - priority: 1
    - component: CaseCard (반복, 상한 없음)
    - layout: <768 1열 / >=768 2열 grid, gap-4
- region: footer
  - role: 저작권 한 줄

## states

- state:default — 카드 1건 이상. 정렬은 MDX frontmatter 의 date 내림차순
- state:loading — 없다. 목록은 빌드 시점에 정적으로 생성된다. 런타임 요청이 0건이라 로딩 구간이 존재하지 않는다
- state:empty — MDX 가 0건일 때. list 자리에 문구 "아직 공개한 케이스가 없습니다." 한 줄과 홈으로 돌아가는 링크 1개. 위에 `border-t` 를 둬 목록이 들어설 자리임을 표시한다 — 구분선이 없으면 설명 문단에 붙어 읽힌다. 필터가 없으므로 "검색 결과 없음" 과 구분할 필요가 없다
- state:error — 없다. MDX 파싱 실패는 빌드 실패로 끝나고 배포되지 않는다

## responsive

- <768 1열 · py-10 · px-5 / >=768 2열 · py-16 · px-8, 컨테이너 max-w-5xl. 좌우 여백은 헤더와 같은 값이다

## a11y

- focus-order: header.logo → header.home → header.theme → title → list.card[0..n] → footer
- landmark: main = main, list = list(role=list, 카드는 listitem)
- announce: 없음
