# screen: lab-index

route: /labs
goal: 방문자가 "무엇을 만들어 왔나"를 훑고 하나를 골라 읽는다
entry: 헤더의 Labs 링크 · 검색 유입
exit: 카드 클릭 → lab-detail

## layout

- region: header
  - role: 사이트 전역 헤더. `current="labs"`
  - component: SiteHeader
- region: main
  - scroll: true
  - role: 기록 목록. landmark=main
  - region: title
    - role: 화면 제목과 성격 한 문단. **Cases 와 무엇이 다른지**를 여기서 가른다
    - priority: 2
    - type: h1 `text-4xl` `tracking-[-0.02em]` · 설명 `max-w-[60ch]` `leading-relaxed` `break-keep`
    - 원문: "만든 것의 기록. 스킬과 오케스트레이션을 어떻게 짰고 무엇이 남았는지, 성과와 초안과 히스토리를 둡니다. 케이스가 '하나의 판단'이라면 여기는 '만드는 과정'입니다."
  - region: list
    - role: 기록 카드를 최신순으로 나열한다
    - priority: 1
    - component: LabCard (반복, 상한 없음)
    - layout: <768 1열 / >=768 2열 grid, gap-4
- region: footer
  - role: 저작권 한 줄
  - component: SiteFooter

## Cases 와 Labs 를 무엇으로 가르는가

**주제로 가른다. 완결 여부로 가르지 않는다.**

|           | Cases                 | Labs                                       |
| --------- | --------------------- | ------------------------------------------ |
| 다루는 것 | 판단 하나             | 만든 것 하나                               |
| 뼈대      | 제약 → 선택 → 버린 것 | 성과 · 초안 · 히스토리                     |
| 소재      | 일에서 마주친 문제    | 직접 만든 스킬 · 오케스트레이션            |
| 완결      | 결론이 난 것만        | `status` 로 표시하고 진행 중인 것도 싣는다 |

**앞선 결정을 뒤집었다.** 처음에는 "끝나지 않은 것들" 로 정하고 완결 여부로 갈랐다.
그 기준으로는 **완성한 스킬을 어디에도 둘 수 없다** — 케이스의 뼈대(제약·선택·버린 것)에
맞지 않고, Labs 의 정의(미완)에도 걸린다. 그래서 기준을 주제로 옮기고, 진행 정도는
버리지 않고 `status` 값으로 옮겼다.

**이 기준이 없으면** 글을 쓸 때마다 어디에 둘지 다시 고민하게 되고 두 목록의 성격이 섞인다.

## states

- state:default — 카드 1건 이상. 정렬은 MDX frontmatter 의 date 내림차순
- state:loading — 없다. 목록은 빌드 시점에 정적으로 생성된다. 런타임 요청이 0건이라 로딩 구간이 존재하지 않는다
- state:empty — MDX 가 0건일 때. list 자리에 문구 "아직 공개한 기록이 없습니다." 한 줄. 위에 `border-t` 를 둬 목록이 들어설 자리임을 표시한다. 홈으로 돌아가는 링크를 두지 않는다 — 헤더가 이미 그 자리를 한다. 필터가 없으므로 "검색 결과 없음" 과 구분할 필요가 없다
- state:error — 없다. MDX 파싱 실패는 빌드 실패로 끝나고 배포되지 않는다

## responsive

- <768 1열 · py-10 · px-5 / >=768 2열 · py-16 · px-8, 컨테이너 max-w-5xl. 설명 문단은 `max-w-[60ch]` · `break-keep`

## a11y

- focus-order: header.logo → header.cases → header.labs → header.theme → title → list.card[0..n] → footer
- landmark: main = main, list = list(role=list, 카드는 listitem)
- announce: 없음
- a11y:contrast — h1 라이트 15.82 · 다크 16.13, 설명 라이트 5.28 · 다크 7.97

## 로더를 어디까지 나눠 썼나

`shared/lib/mdx-collection.ts` 에 **slug 목록과 정렬만** 둔다. cases 와 labs 가 같은 것을 쓴다.

**MDX 를 실제로 import 하는 함수는 공유하지 않는다.**
**이유:** 번들러가 `import()` 의 경로를 정적으로 훑어 대상 파일을 모아 두는데, 디렉터리까지
변수로 만들면 무엇을 모아야 할지 알 수 없게 된다. 그래서 각 컬렉션이 자기 경로를 리터럴로 든다.

## 컬렉션은 비워 둘 수 없다

**`content/labs/` 에 `.mdx` 가 하나도 없으면 빌드가 깨진다.** 번들러가 모을 대상이 없어
`module not found` 로 끝난다(실제로 그렇게 실패했다). 그래서 `_template.mdx` 를 한 장 둔다.

`_` 로 시작하는 파일은 `listSlugs` 가 걸러서 **목록에도 라우트에도 나오지 않는다**
(`/labs/_template` 은 404 다). 새 글은 이 파일을 복사해 이름만 바꿔 쓴다.

**`_template.mdx` 를 지우지 마라.** 공개한 글이 0건인 순간 빌드가 다시 깨진다.
같은 규칙이 `content/cases/` 에도 적용되지만, 그쪽은 글이 3건 있어 지금은 템플릿을 두지 않았다.
