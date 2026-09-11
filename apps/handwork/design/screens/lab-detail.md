# screen: lab-detail

route: /labs/[slug]
goal: 방문자가 하나의 기록에서 "무엇을 만들었고 지금 어디까지 왔나"를 끝까지 읽는다
entry: lab-index 의 카드 · 외부 링크
exit: 헤더로 다른 화면

## layout

- region: header
  - role: 사이트 전역 헤더. `current="labs"`
  - component: SiteHeader
- region: main
  - scroll: true
  - role: 기록 본문. landmark=main
  - region: lab-header
    - role: 제목·상태·시점·태그. 본문을 읽기 전에 맥락을 준다
    - priority: 1
    - content: h1 · 상태 점과 상태·date 한 줄 · 태그 칩 n개
    - type: h1 `text-4xl` `tracking-[-0.02em]` `leading-[1.15]` `break-keep` · 메타 `text-sm`
    - tokens: 메타=--muted-foreground, 칩 bg=--muted `rounded-sm`, 상태 점=--brand-accent(진행 중) / --muted-foreground(그 외)
  - region: body
    - role: MDX 본문
    - priority: 2
    - layout: max-w-[68ch] 단일 열
    - **서식은 `shared/ui/prose.ts` 의 `PROSE` 하나를 case-detail 과 함께 쓴다.** 두 화면이 각자 들고 있으면 한쪽만 고쳐질 때 본문 서식이 조용히 갈린다
- region: footer
  - role: 저작권 한 줄
  - component: SiteFooter

**이전/다음 링크를 두지 않는다.**
**이유:** case-detail 은 케이스가 서로 이어 읽히는 묶음이라 이웃을 준다. Labs 항목은 각자 다른
작업이라 순서에 뜻이 없다. 시점 순으로 이어 놓으면 관계 없는 두 기록이 이어진 것처럼 읽힌다.

## states

- state:default — 본문이 있는 기록 하나
- state:loading — 없다. 정적 생성이라 런타임 데이터 요청이 0건이다
- state:empty — 이 화면에는 빈 상태가 없다. 단건 조회이고, 없는 slug 는 state:error 로 간다
- state:error — 없는 slug 는 Next 의 notFound() 로 404 를 반환한다. 문구와 링크는 app/not-found.tsx 가 그린다. 재시도 버튼을 두지 않는다 — 다시 눌러도 결과가 같다

## responsive

- <768 py-10 · px-5 · 본문 그대로 1열 / >=768 py-16 · px-8 · 본문 max-w-[68ch] 중앙 정렬, 컨테이너 max-w-5xl

## a11y

- focus-order: header.logo → header.cases → header.labs → header.theme → body 내부 링크 순서 → footer
- landmark: main = main, body = article
- heading: h1 은 기록 제목 하나뿐. MDX 본문의 최상위 제목은 h2 로 시작한다
- 상태 점은 `aria-hidden` 이다. 같은 뜻이 바로 옆 글자로 이미 읽힌다
- a11y:contrast — 본문 라이트 15.82 · 다크 16.13, 메타 라이트 5.28 · 다크 7.97

## frontmatter

MDX 파일이 `export const meta` 로 내보내는 값이다. 이 표가 정본이다.

| 키      | 타입                            | 필수 | 의미                                           |
| ------- | ------------------------------- | ---- | ---------------------------------------------- |
| title   | string                          | O    | 기록 제목                                      |
| summary | string                          | O    | 한 줄 요약. 목록 카드에 3줄까지 보인다         |
| date    | string (YYYY-MM)                | O    | 정렬 기준이자 카드·상세에 표시되는 시점        |
| status  | `진행 중` \| `멈춤` \| `마무리` | O    | 지금 어디까지 왔는가. 목록에서 배지로 나온다   |
| tags    | string[]                        | O    | 주제 태그. 카드에 3개까지 보이고 나머지는 "+N" |

**`status` 값을 늘리려면 `entities/lab/model/types.ts` 의 `LAB_STATUSES` 를 먼저 고친다.**
**이유:** 타입이 리터럴 유니온이라 문서에만 늘리면 MDX 가 타입 검사를 통과하지 못한다.

빈 값으로 채운 사본이 `content/labs/_template.mdx` 에 있다. 새 글은 그것을 복사한다 —
`_` 로 시작하는 파일은 목록과 라우트에서 빠진다. 이유는 lab-index 스펙의 `## 컬렉션은 비워 둘 수 없다` 를 본다.
