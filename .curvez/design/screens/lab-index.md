# screen: lab-index

platform: nextjs
route(nextjs): /labs
route(rn): 해당 없음 — profile 의 stack 이 nextjs 라 모바일 앱이 없다
goal: 방문자가 "끝나지 않은 것들"이 있다는 사실과 그 성격을 알고 간다
entry: 헤더의 Labs 링크
exit: 헤더로 다른 화면 · 항목이 생기면 lab-detail

## layout

- region: header
  - role: 사이트 전역 헤더. `current="labs"`
  - component: SiteHeader
- region: main
  - scroll: true
  - role: 실험 목록. landmark=main
  - region: title
    - role: 화면 제목과 성격 한 문단. **Cases 와 무엇이 다른지**를 여기서 가른다
    - priority: 1
    - 원문: "끝나지 않은 것들. 검증 중인 실험, 만들다 만 도구, 답이 안 나온 시도를 둡니다. 케이스가 '무엇을 골랐나'라면 여기는 '아직 고르지 못한 것'입니다."
  - region: list
    - role: 실험 카드 목록. **지금은 비어 있다**
    - priority: 2
- region: footer
  - role: 저작권 한 줄
  - component: SiteFooter

**Cases 와 Labs 는 완결 여부로 가른다.**
**이유:** 둘 다 "만든 것"이라 주제로는 갈리지 않는다. 결론이 난 것은 Cases, 아직 아닌 것은 Labs 다.
이 기준이 없으면 글을 쓸 때마다 어디에 둘지 매번 다시 고민하게 되고, 두 목록의 성격이 섞인다.

## states

- state:default — 항목이 1건 이상일 때. 정렬은 Cases 와 같이 date 내림차순
- state:loading — 없다. 항목이 생기면 Cases 처럼 빌드 시점 정적 생성이라 런타임 요청이 0건이다
- state:empty — **지금 상태다.** 문구 "아직 공개한 실험이 없습니다." 한 줄. 홈으로 돌아가는 링크를 두지 않는다 — 헤더가 이미 그 자리를 한다
- state:error — 없다. 항목이 생겨도 MDX 파싱 실패는 빌드 실패로 끝난다

## responsive

- nextjs: <768 1열 · py-10 / >=768 py-16, 컨테이너 max-w-5xl. 설명 문단은 `max-w-[60ch]` · `break-keep`

## a11y

- focus-order: header.logo → header.cases → header.labs → header.theme → (목록이 생기면 list.card[0..n])
- landmark: main = main
- a11y:contrast — 본문과 보조 문구는 shadcn 토큰 위라 라이트 5.15 이상 · 다크 12.46 이상

## 아직 만들지 않은 것

**상세 라우트(`/labs/[slug]`)와 MDX 로더를 붙이지 않았다.**
**이유:** 넣을 글이 없는데 목록·상세 기계를 먼저 만들면 링크가 하나도 없는 코드가 남는다.
첫 글이 생길 때 Cases 와 같은 구조로 붙이고, 그때 두 컬렉션의 로더를 `shared/lib` 로 뺀다.
