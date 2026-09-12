---
name: component-docs
description: scopulusUI 문서 사이트의 컴포넌트 원고를 daisyUI 형식으로 쓴다 — props 표와 예제만 담고 설명 문단을 쓰지 않는다. "컴포넌트 문서 써줘", "컴포넌트 원고 만들어줘", "문서 사이트에 컴포넌트 추가해줘", "예제 추가해줘", "props 표 만들어줘", "component docs", "add a component page", "/component-docs" 라고 하거나 `packages/scopulus-ui/src/ui/` 에 컴포넌트를 새로 만든 직후에 실행한다.
---

컴포넌트 원고는 **무엇이 있고 어떻게 쓰는지**만 보여 준다. 왜 그렇게 만들었는지는 안 적는다.

그 자리는 `packages/scopulus-ui/design/components/<Name>.md` 다. 스펙에는 `파일:줄` 과 재현
명령과 states 여덟 줄과 a11y 다섯 키가 있다. 원고에 그걸 옮겨 적으면 **묽은 사본**이 되고,
한쪽만 고쳐질 때 어느 것이 맞는지 판정할 근거가 사라진다.

사용자 지적이 근거다(2026-09-11) — **"preview, html, jsx 이렇게 보여주면된다고"**,
**"이런설명을 왜 하는건데"**.

## 언제 이 스킬을 쓰는가

- `apps/scopulus-ui/content/components/` 에 원고를 새로 쓰거나 고칠 때
- `packages/scopulus-ui/src/ui/` 에 컴포넌트를 추가해 문서 사이트에 실어야 할 때
- 기존 원고에서 설명 문단을 걷어낼 때
- props 가 바뀌어 표를 갱신해야 할 때

## 언제 쓰지 않는가

- **컴포넌트의 값과 근거를 정할 때 → `design-system` 을 쓴다.** `파일:줄`·states·a11y 는
  스펙이 정본이다. 이 스킬은 이미 정해진 값을 화면에 올리기만 한다.
  **이유:** 두 곳에서 값을 정하면 스펙과 원고가 서로 달라지고 어느 쪽이 맞는지 판정할 근거가 없다
- **스토리를 쓸 때 → `storybook` 을 쓴다.** 스토리는 컴포넌트를 서버 없이 렌더해 보는 자리이고
  접근성 검사가 거기서 돈다. 원고는 사람이 읽는 화면이다
- 컴포넌트 코드 자체를 고칠 때 → 구현 스킬로 돌아간다. 원고를 맞추려고 컴포넌트를 바꾸지 않는다
- 목록 화면(`/components`)의 묶음·순서를 정할 때 → `apps/scopulus-ui/src/shared/lib/components.ts`
  하나가 정본이다. 원고에 적지 않는다

## 정답 형식 — `button.mdx`

`apps/scopulus-ui/content/components/button.mdx` 가 견본이다. **쓰기 전에 그 파일을 읽는다.**

```mdx
import { AppLink, Button } from "@scopulus/ui";
import { Example, Props } from "@/widgets/example";

<Props
  rows={[
    {
      name: "variant",
      type: `"default" | "ghost" | "outline"`,
      default: `"default"`,
    },
    {
      name: "size",
      type: `"default" | "icon" | "icon-sm"`,
      default: `"default"`,
    },
    {
      name: "aria-label",
      type: "string",
      note: "size 가 icon · icon-sm 이면 필수",
    },
    { name: "...", type: "ComponentProps<'button'>", note: "그대로 흘러간다" },
  ]}
/>

<Example title="Button" code={`<Button>저장</Button>`}>
  <Button>저장</Button>
</Example>

<Example
  title="Variants"
  code={`<Button>default</Button>
<Button variant="outline">outline</Button>`}
>
  <Button>default</Button>
  <Button variant="outline">outline</Button>
</Example>
```

화면에 나오는 것은 이 순서다.

```
Button                              ← [slug]/page.tsx 가 메타에서 낸다
scopulusUI 의 Button Components 입니다.  ← 같은 곳에서 이름으로 생성한다
[props 표]
Button      [프리뷰] [코드]
Variants    [프리뷰] [코드]
```

제목과 요약 줄은 **원고가 쓰지 않는다.** `[slug]/page.tsx` 가 만든다.

## 규칙

- **산문 0줄.** 도입 문장도 없다. `import` 다음이 바로 `<Props>` 다
- **`##` 를 직접 쓰지 않는다.** 소제목은 `<Example title>` 이 낸다
- **`<Props>` 가 첫 요소다.** `children` 하나뿐이어도 표를 낸다.
  **이유:** 표가 없으면 받는 값이 없는 것인지 적기를 빠뜨린 것인지 구별되지 않는다
- 예제는 **3~6개.** 실제로 있는 variant·size·state 만 만든다
- `title` 은 영문이다 — `Variants` · `Sizes` · `Disabled` · `With label`
- **`code` 와 프리뷰가 같아야 한다.** `code` 는 프리뷰를 그대로 적은 문자열이다.
  둘이 따로라 한쪽만 고치면 어긋난다. 고칠 때 둘 다 고친다
- 링크·강조·목록을 쓰지 않는다
- **사용자에게 시키는 문장을 쓰지 않는다** — `눌러 보십시오`·`쓰지 마십시오`
- **승부로 말하지 않는다.** `이긴다`·`이깁니다`·`진다` 를 쓰지 않는다.
  **이유:** 값이 겨루는 것이 아니다. 무엇이 적용되는지, 무엇을 따르는지가 사실이다.

  | 쓰지 않는다                              | 이렇게 쓴다                                |
  | ---------------------------------------- | ------------------------------------------ |
  | `둘이 다르면 CSS 가 이깁니다`            | `둘이 다르면 CSS 를 따릅니다`              |
  | `나중 값이 조용히 이긴다`                | `나중 값이 조용히 적용된다`                |
  | `어느 쪽이 이기는지 화면에서만 드러난다` | `어느 값이 적용되는지 화면에서만 드러난다` |
  | `구체성이 높아 그것을 이긴다`            | `구체성이 높아 우선순위가 높다`            |

- **저렴한 낱말을 쓰지 않는다** — `깐다`·`때려`·`갖다 붙인다`.
  설치·적용을 가리키면 `불러온다`·`더한다`·`넣는다` 로 쓴다
- **`둔다`·`둡니다` 로 동작을 말하지 않는다.** 무엇을 하는지가 없다.

  | 쓰지 않는다                           | 이렇게 쓴다                               |
  | ------------------------------------- | ----------------------------------------- |
  | `.dark` 안에도 같은 이름을 **둡니다** | `.dark` 안에도 같은 이름을 **정의합니다** |
  | 기본값을 그대로 **둔다**              | 기본값을 그대로 **쓴다**                  |
  | 값을 비워 **둔다**                    | 값을 **넣지 않는다**                      |

- **출처를 적지 않는다.** 아래 넷은 원고에 넣지 않는다.
  **이유:** 어디서 왔는지는 만들면서 한 고민이지 쓰는 사람이 알 일이 아니다

  | 원고에 쓰지 않는다                              | 어디에 있나      |
  | ----------------------------------------------- | ---------------- |
  | `## 어디서 왔나` 절 통째로                      | 스펙의 `## 근거` |
  | `shadcn base-nova 에서 받았습니다 — 2026-09-11` | 스펙의 `## 근거` |
  | `handwork 에서 뽑았다`·`사용처 0곳`             | 스펙의 `## 근거` |
  | 받아 온 날짜·커밋 해시·벤더 경로                | 스펙의 `## 근거` |

  **스펙(`design/components/<Name>.md`)에는 그대로 둔다.** 거기서는 그것이 근거다 —
  값을 왜 그렇게 정했는지 판정하려면 어디서 온 값인지가 있어야 한다. 지우는 것은 사이트 원고뿐이다

- **값을 지어내지 않는다.** 없는 prop 을 표에 넣거나 없는 variant 를 예제로 만들지 않는다

## 값을 어디서 읽나

| 무엇                   | 어디                                                                   |
| ---------------------- | ---------------------------------------------------------------------- |
| props 의 타입과 기본값 | `packages/scopulus-ui/src/ui/<name>.tsx` 의 실제 타입                  |
| 무엇을 예제로 보일지   | `packages/scopulus-ui/design/components/<Name>.md` 의 `props`·`states` |
| 하위 컴포넌트 이름     | `packages/scopulus-ui/src/index.ts` 배럴                               |

세 곳 중 어디에도 없는 값은 **없는 값이다.** 추측해서 채우지 않는다.

## 프리뷰가 까다로운 것

| 컴포넌트                     | 어떻게                                     | 이유                                           |
| ---------------------------- | ------------------------------------------ | ---------------------------------------------- |
| `PageShell`                  | 실물 대신 점선 테두리 `<div>` 로 흉내 낸다 | `<main>` 이라 화면의 `<main>` 안에 못 들어간다 |
| `PageTitle`                  | 실물 대신 같은 크기의 `<p>` 로 흉내 낸다   | `<h1>` 을 내서 한 화면에 `h1` 이 둘이 된다     |
| `Dialog`·`Popover`·`Tooltip` | **트리거까지 실물로 넣는다**               | 눌러야 보인다. 보는 사람이 눌러 확인한다       |
| `Select`                     | 실물을 넣는다                              | 열지 않아도 트리거가 보인다                    |
| `Prose`                      | 실물을 넣되 내용은 짧게                    | `<article>` 중첩은 허용된다                    |
| `Table`                      | 행 3개까지                                 | 더 늘려도 보여 주는 것이 같다                  |

흉내 낸 경우에도 **`code` 에는 실제 사용법을 적는다.** 흉내 낸 도형의 마크업을 적지 않는다.

`"use client"` 가 붙은 것(`switch`·`table`·`theme-toggle`·`tooltip`)도 MDX 에서 그대로 쓴다.

**MDX 에서 모달·팝오버를 열어 둔 채로 두지 않는다.** 닫힌 상태가 기본이다.
`alert`·`confirm`·`prompt` 를 쓰지 않는다 — 뜨는 순간 그 화면의 자동 검사가 멈춘다.

## 표는 컴포넌트로 낸다

이 앱에는 **`remark-gfm` 이 없다.** 마크다운 표(`| a | b |`)를 쓰면 글자 그대로 나온다.
실제로 `page-title.mdx` 의 표 네 줄이 그렇게 깨져 있었다(2026-09-11 발견).

그래서 props 표는 `<Props rows={[...]} />` 로 낸다. `apps/scopulus-ui/src/widgets/example.tsx`
가 정본이다. **설치로 풀지 마라** — 값이 구조로 남는 편이 낫고, 원고마다 열이 달라지지 않는다.

## 검증

원고를 고친 뒤 **실제로 연다.** dev 서버는 3001 이다.

```bash
cd /Users/kim/Workspace/curvez
pnpm exec prettier --write apps/scopulus-ui/content/components/<slug>.mdx
curl -s -o /dev/null -w "%{http_code}\n" --max-time 60 http://localhost:3001/components/<slug>
```

**200 이 아니면 고친다.** MDX 문법 오류는 500 으로 나온다. 빌드는 통과하는데 화면만 깨지는
경우가 있으므로 exit code 로 판정하지 않는다.

산문이 남았는지 센다.

```bash
grep -nE '^[^<import`[:space:]]' apps/scopulus-ui/content/components/<slug>.mdx
```

`<Props`·`<Example`·`/>`·`</Example>`·`import` 로 시작하지 않는 줄이 나오면 산문이 남은 것이다.

`page-title` 을 고쳤으면 `h1` 개수를 센다. 하나여야 한다.

```bash
curl -s --max-time 60 http://localhost:3001/components/page-title | grep -c '<h1'
```

## 완료 기준

- [ ] `import` 다음이 바로 `<Props>` 다. 산문 0줄
- [ ] `##` 를 직접 쓴 자리 0곳
- [ ] `<Props>` 의 모든 행이 실제 타입에서 왔다. 지어낸 prop 0개
- [ ] 예제가 3~6개이고 전부 실제로 있는 값이다
- [ ] 각 `<Example>` 의 `code` 가 바로 아래 프리뷰와 같다
- [ ] 출처·근거·수치·`파일:줄` 을 적은 자리 0곳
- [ ] 사용자에게 시키는 문장 0개
- [ ] 화면을 열어 **200** 을 확인했다
- [ ] `prettier --write` 를 돌렸다
