# component: Field

purpose: 라벨·컨트롤·설명·오류를 한 벌로 묶고 `id` 를 `aria-describedby` 로 이어 준다

## 근거 — shadcn/ui 의 마크업 구조만 옮겼다

### 1. 출처

**이 컴포넌트는 화면에서 센 값이 아니다.** handwork 화면에 폼 필드가 쓰인 자리가 **0곳**이다.
`## 근거` 에 `파일:줄` 이 없는 것은 빠뜨린 것이 아니라 셀 화면이 없기 때문이다.

| 항목           | 값                                                                              |
| -------------- | ------------------------------------------------------------------------------- |
| 구조 출처      | shadcn/ui `field` — <https://ui.shadcn.com/docs/components/field>               |
| 참고           | daisyUI `fieldset` — <https://daisyui.com/components/fieldset/>                 |
| 옮긴 것        | 라벨 → 컨트롤 → 설명 → 오류의 세로 순서, `aria-invalid` 는 컨트롤에 준다는 규칙 |
| 옮기지 않은 것 | 부품 10개(`FieldSet` · `FieldLegend` · `FieldGroup` · `FieldSeparator` …)       |
| 의존성         | 없다. 훅도 쓰지 않는다                                                          |
| 소스           | [`../../src/ui/field.tsx`](../../src/ui/field.tsx)                              |

**export 1개**

| export  | 태그    | 안에 내는 것                                          |
| ------- | ------- | ----------------------------------------------------- |
| `Field` | `<div>` | [`Label`](Label.md) · 함수 children · `<p>` 설명·오류 |

**부품 10개를 옮기지 않았다.** shadcn 은 `FieldSet` · `FieldLegend` · `FieldContent` · `FieldTitle` ·
`FieldSeparator` 까지 내보낸다.
**이유:** 이 저장소에 쓰는 곳이 0곳이고, 부품으로 나누면 `id` 를 잇는 일이 부품 사이로 흩어져
**이 컴포넌트가 존재하는 이유가 사라진다.** 여러 필드를 `<fieldset>` 으로 묶는 자리는
[`Radio.md`](Radio.md) 의 `RadioGroup` 하나이고 그것이 자기 `<legend>` 를 갖는다.

**variant 축이 없다. size 축도 없다.** `cva` 를 쓰지 않는다.

### 2. id 를 어떻게 잇나 — 이 컴포넌트의 전부

`id` 하나에서 나머지를 만든다.

| 무엇       | id                 | 언제 생기나              |
| ---------- | ------------------ | ------------------------ |
| 컨트롤     | `<id>`             | 항상                     |
| 설명 `<p>` | `<id>-description` | `description` 이 있을 때 |
| 오류 `<p>` | `<id>-error`       | `error` 가 있을 때       |

컨트롤이 받는 값은 셋이다.

```
{ id, "aria-describedby": "<id>-description <id>-error", "aria-invalid": true }
```

- 설명만 있으면 `aria-describedby="<id>-description"`
- 오류만 있으면 `aria-describedby="<id>-error"` 와 `aria-invalid="true"`
- 둘 다 없으면 **속성을 붙이지 않는다.** 빈 문자열을 남기지 마라 —
  **이유:** `aria-describedby=""` 는 없는 것과 같지 않다. 화면 낭독기가 빈 설명을 찾다가
  멈추는 구현이 있다

### 3. 컨트롤을 함수 children 으로 받는다

```tsx
<Field id="title" label="사례 제목" error="제목을 입력하십시오">
  {(control) => <Input {...control} />}
</Field>
```

**`React.cloneElement` 로 몰래 prop 을 얹지 않는다.**
**이유 둘.** 부르는 쪽이 직접 준 `aria-describedby` 를 조용히 덮어쓴다. 그리고 children 이
조각(fragment)이거나 둘 이상일 때 타입이 아니라 **런타임에야** 깨진다. 함수 children 은 무엇이
건네지는지가 호출부에 그대로 보인다.

**바꿀 때 고칠 위치:** `../../src/ui/field.tsx` 의 `FieldControl` 타입과 `children` 호출부.

### 4. `"use client"` 를 붙이지 않는다 — `useId` 를 쓰지 않기 때문이다

**결정: `id` 를 필수 prop 으로 받는다. `useId` 를 쓰지 않는다. 그래서 `"use client"` 가 없다.**

**이유 둘.**

1. `useId` 는 훅이라 `"use client"` 가 따라온다. 그러면 **폼 필드를 하나라도 쓰는 화면이 전부
   클라이언트 경계 안으로 끌려 들어간다.** 값을 배치하기만 하는 컴포넌트에 그 비용을 물릴 이유가
   없다. 같은 판단으로 `input.tsx` 와 `checkbox.tsx` 에도 `"use client"` 가 없고,
   `switch.tsx:1` 에만 있다
2. 만들어진 `id` 는 **바깥에서 가리킬 수 없다.** 폼 위쪽의 오류 요약에서 필드로 건너뛰는
   링크(`href="#title"`)나 제출 뒤 초점을 첫 오류로 옮기는 코드가 그 `id` 를 필요로 한다.
   `useId` 가 만든 `«r3»` 같은 값은 그 자리에서 쓸 수 없다

**바꿀 때 고칠 위치:** `../../src/ui/field.tsx` 의 props 타입과 파일 첫 줄.

## props

| 이름        | 타입                                   | 필수 | 기본값 | 의미                                              |
| ----------- | -------------------------------------- | ---- | ------ | ------------------------------------------------- |
| id          | `string`                               | O    | —      | 컨트롤의 `id`. 설명·오류 `id` 가 여기서 파생된다  |
| label       | `React.ReactNode`                      | O    | —      | 라벨 글자. `Label` 에 그대로 넘어간다             |
| description | `React.ReactNode`                      | X    | —      | 컨트롤 아래 보조 설명                             |
| error       | `React.ReactNode`                      | X    | —      | 오류 문구. 있으면 컨트롤이 `aria-invalid` 가 된다 |
| children    | `(control: FieldControl) => ReactNode` | O    | —      | 컨트롤을 만드는 함수. 받은 것을 그대로 펼친다     |

`FieldControl` 은 `{ id: string; "aria-describedby": string \| undefined; "aria-invalid": true \| undefined }` 다.

**`disabled` prop 을 두지 마라.**
**이유:** 비활성은 컨트롤의 속성이다. `Field` 가 따로 받으면 `<Field disabled>` 와
`<Input disabled>` 가 어긋날 수 있고, 어느 쪽이 맞는지 판정할 근거가 없다. 라벨이 함께 흐려지는
것은 `group/field` 안에 `:disabled` 인 컨트롤이 있는지를 CSS 가 직접 보는 방식으로 한다.

**`error` 를 `boolean` 으로 받지 마라. 문구 자체를 받는다.**
**이유:** `boolean` 이면 문구를 놓을 자리를 부르는 쪽이 정하게 되고, 그 순간 화면마다 오류가
다른 곳에 나온다. 같은 판단을 [`Input.md`](Input.md) 의 "`error` · `errorMessage` prop 을 두지 마라"
가 적고 있다 — 그 문서가 말한 "필드 아래 `<p>`" 를 맡는 것이 이 컴포넌트다.

**`className` 을 받지 않는다.**
**이유:** 필드 안의 값(간격 8px, 세로 쌓기)은 한 벌뿐이고 필드끼리의 간격은 폼이 정한다.

## states

| state         | 트리거                        | 시각 변화                                                                                                                                                                                          |
| ------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| default       | —                             | `flex w-full flex-col gap-2`. 라벨 → 컨트롤 → 설명 → 오류 순서. 자기 배경·테두리 없음                                                                                                              |
| hover         | 없음                          | `hover:` 가 0건이다. 상호작용 요소가 아니라 배치 컨테이너다. hover 표시는 안쪽 컨트롤이 낸다                                                                                                       |
| focus-visible | 없음                          | 초점을 받지 않는다. `tabindex` 를 주지 않는다. 초점 링은 컨트롤이 자기 `ring-3` 으로 낸다                                                                                                          |
| pressed       | 없음                          | 누를 수 없다                                                                                                                                                                                       |
| disabled      | 컨트롤의 `disabled`           | `Field` 자신은 비활성 개념이 없다. `group/field` 덕에 라벨이 `opacity-50` 으로 함께 흐려지고, 컨트롤은 자기 `disabled:` 조각을 쓴다                                                                |
| loading       | 없음                          | 자기 비동기 동작이 없다. 저장 중은 컨트롤에 `disabled` 를 주고 표시는 부르는 쪽이 한다 — **필드 자리에 `Skeleton` 을 끼워 넣지 마라. 이유:** 라벨이 사라지면 무엇을 기다리는 칸인지 판정할 수 없다 |
| empty         | `description`·`error` 가 없음 | 그 `<p>` 요소를 **아예 만들지 않는다.** 빈 `<p>` 를 남기면 `gap-2` 만큼 빈 줄이 생겨 필드마다 높이가 달라진다                                                                                      |
| error         | `error` 가 있음               | 컨트롤에 `aria-invalid="true"` 가 붙어 테두리·링이 `--destructive` 로 바뀌고(`input.tsx:11`), 오류 `<p>` 가 `text-sm text-destructive` 로 마지막 줄에 붙는다                                       |

**전이를 넣지 않는다.** 색이 바뀌는 상태가 없어 `transition-*` 이 0건이고 `motion-reduce:` 짝도
필요 없다. 오류가 나타날 때의 전이는 컨트롤이 자기 `transition-colors` 로 낸다.

**오류 `<p>` 에 `role="alert"` 을 붙이지 않는다.**
**이유:** `alert` 은 단호한(assertive) 라이브 영역이라 **화면이 처음 그려질 때도 읽어 버린다.**
제출 전부터 오류가 있는 화면(서버에서 오류와 함께 다시 그린 폼)에서 그 읽기는 사용자가 아무것도
하지 않았는데 끼어드는 소리가 된다. `aria-describedby` 로 이어 두면 초점이 컨트롤에 닿는 순간
읽힌다. **바꿀 때 고칠 위치:** `../../src/ui/field.tsx` 의 오류 `<p>` 한 줄.

## a11y

- a11y:label — 이름은 [`Label`](Label.md) 이 `htmlFor={id}` 로 준다. **컨트롤이 `{...control}` 을 펼치지 않으면 이름이 붙지 않는다** — 그것이 이 컴포넌트의 유일한 오용이고 타입으로 막지 못한다. 스토리의 axe 검사가 `label` 위반으로 잡는다(`field.stories.tsx` 의 모든 스토리가 `getByRole("textbox", { name })` 으로 이름을 확인한다). `<div role="group">` 을 쓰지 마라 — 이유: 이름 없는 묶음이 화면 낭독기에 "묶음" 이라는 소리 하나만 더한다. 이름은 라벨이 이미 준다
- a11y:focus — 초점 대상이 **1개**(컨트롤)다. `Field` 자신은 받지 않는다. 초점 순서는 DOM 순서와 같고, 설명과 오류는 `<p>` 라 초점을 받지 않는다. 오류가 여럿인 폼에서 첫 오류로 초점을 옮기는 것은 폼의 일이고 그때 쓰는 것이 `id` 다 — 위 `### 4` 의 두 번째 이유
- a11y:contrast — 라벨 fg=`--foreground` / bg=`--background` 라이트 15.82 · 다크 16.13, 설명 fg=`--muted-foreground` / bg=`--background` 라이트 5.28 · 다크 7.97 ([`../tokens.md`](../tokens.md) `## 대비 검증` 의 대비값, 4.5:1 통과). **오류 fg=`--destructive` / bg=`--background` 쌍은 그 목록에 없다.** 이 문서를 쓰면서 `scripts/lib/tokens.mjs` 의 `contrast()` 로 계산한 값은 **라이트 4.51 · 다크 6.64** 로 둘 다 4.5:1 을 넘는다. **그 쌍을 [`../tokens.md`](../tokens.md) 에 넣는 것은 이 문서의 일이 아니다** — 그 파일은 한 사람이 맡는다. 라이트 4.51 은 하한에서 0.01 여유뿐이므로 `--destructive` 를 조금이라도 밝히면 떨어진다
- a11y:target — `Field` 자신은 클릭 대상이 아니다. 라벨은 눌러서 초점을 옮기고, 컨트롤의 크기 하한은 그 컨트롤의 스펙이 정한다([`Input.md`](Input.md) 의 32px, [`Checkbox.md`](Checkbox.md) 의 40x32). 필드를 세로로 쌓을 때 **간격 8px 이상**을 둔다
- a11y:role — 역할이 없다. 그냥 `<div>` 다. **`role="group"` 도 `<fieldset>` 도 쓰지 마라 — 이유:** 컨트롤이 하나뿐인 자리에 묶음 역할을 주면 화면 낭독기가 묶음에 들어가고 나오는 소리를 필드마다 두 번 더 낸다. 컨트롤이 여럿인 묶음은 [`Radio.md`](Radio.md) 의 `RadioGroup` 이 `<fieldset>` + `<legend>` 로 맡는다

## responsive

- 브레이크포인트 분기가 **0건**이다. 모든 폭에서 세로로 쌓고 `gap-2`(8px)를 둔다
- 폭은 `w-full` 이라 부모가 정한다. `max-w-*` 를 붙이지 마라 —
  **이유:** 필드의 폭은 폼의 폭이고, 폼은 [`PageShell.md`](PageShell.md) 안에 들어간다.
  필드가 스스로 폭을 정하면 두 곳이 같은 값을 갖게 된다
- 라벨을 컨트롤 왼쪽에 놓는 가로 배치를 만들지 마라.
  **이유:** 375px 에서 라벨에 100px 을 주면 [`Input.md`](Input.md) 이 적은 대로 값에 쓸 폭이
  215px 로 줄어 열 자 남짓에서 잘린다. `md:` 이상에서만 가르려 해도 `md` 미만과 이상의 레이아웃이
  두 벌이 되고, 그 둘의 라벨 폭은 화면에 0번 나온 값이다
- 설명과 오류가 길면 그대로 감싼다. 줄 수를 제한하지 마라 — **이유:** 무엇이 잘못인지 말하는
  문장이 잘리면 고칠 방법을 알 수 없다
- `lg` 이상을 넣지 마라. 페이지 폭이 `max-w-5xl`(1024px)에서 멈춘다

## 상호작용

- 없음. `Field` 자신은 hover / focus-visible 대상이 아니다. 라벨을 누르면 컨트롤로 초점이 가고,
  그 표시는 컨트롤의 `focus-visible:ring-3` 이 낸다
