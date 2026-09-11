# component: Textarea

purpose: 여러 줄짜리 글자를 받는다. 한 줄이면 `Input` 을 쓴다

## 근거 — shadcn base-nova 에서 받았다

### 1. 출처

| 항목      | 값                                                                            |
| --------- | ----------------------------------------------------------------------------- |
| 받은 명령 | `pnpm dlx shadcn@4 add textarea`                                              |
| 스타일    | `base-nova`                                                                   |
| 받은 날짜 | **2026-09-11**                                                                |
| 소스      | [`../../src/ui/textarea.tsx`](../../src/ui/textarea.tsx)                      |
| 기반      | **Base UI 프리미티브를 쓰지 않는다.** 순수 `<textarea>` 다 (`textarea.tsx:6`) |
| 아이콘    | 없다                                                                          |

**export 1개** (`textarea.tsx:17`)

| export     | 감싸는 것 | 태그         | 소스 줄          |
| ---------- | --------- | ------------ | ---------------- |
| `Textarea` | (없다)    | `<textarea>` | `textarea.tsx:4` |

**`Input` 과 다르다.** `Input` 은 `@base-ui/react/input` 의 `InputPrimitive` 를 쓰지만
(`input.tsx:2,7`) `Textarea` 는 DOM 태그를 그대로 쓴다. **이 차이를 맞추려고 한쪽을 고치지 마라.**
**이유:** `@base-ui/react` 에 textarea 프리미티브가 없어서 받은 소스가 그렇게 나왔다. 없는 것을
만들어 맞추면 라이브러리를 올릴 때 손으로 쓴 쪽이 조용히 뒤처진다.

**variant 축이 없다. size 축도 없다.** `textarea.tsx` 에 `cva` 가 없고 최소 높이가
`min-h-16`(64px) 하나다 (`textarea.tsx:9`).

### 2. handwork 사용처: 0곳

handwork 화면 어디에도 쓰인 적이 없다. **기존 9종의 `## 근거` 에 있는 `파일:줄` 실측이 이 문서에는
없다.** 값의 출처는 위의 받은 소스 하나다.

### 3. 왜 20종에 들어가는가

**폼 묶음을 덮는다.** 폼 5종(`Input` · `Textarea` · `Checkbox` · `Switch` · `Select`) 중
길이가 정해지지 않은 글자를 받는 자리를 맡는다.

## props

| 이름         | 타입                               | 필수 | 기본값  | 의미                                  |
| ------------ | ---------------------------------- | ---- | ------- | ------------------------------------- |
| value        | `string`                           | X    | —       | 제어로 쓸 때의 값                     |
| defaultValue | `string`                           | X    | —       | 비제어로 쓸 때의 처음 값              |
| onChange     | `(e) => void`                      | X    | —       | 값이 바뀔 때                          |
| placeholder  | `string`                           | X    | —       | 빈 상태의 안내 글자                   |
| rows         | `number`                           | X    | —       | 처음 줄 수. 아래 `## responsive` 참조 |
| disabled     | `boolean`                          | X    | `false` | 입력 무시 + 면 채움 + 불투명도 50%    |
| required     | `boolean`                          | X    | `false` | 폼 제출 시 필수                       |
| aria-invalid | `boolean`                          | X    | `false` | 오류 표시                             |
| className    | `string`                           | X    | —       | 최소 높이를 바꿀 때만 쓴다            |
| (그 밖)      | `React.ComponentProps<"textarea">` | X    | —       | `<textarea>` 의 속성을 그대로 받는다  |

**`autoResize` prop 을 두지 마라.**
**이유:** 받은 소스가 `field-sizing-content` 로 이미 한다 (`textarea.tsx:9`). CSS 가 하는 일을
prop 으로 다시 열면 끄는 경로와 켜는 경로가 둘이 되고, 둘이 어긋나면 화면에서만 드러난다.

**`maxLength` 를 주면 남은 글자 수를 함께 보여 준다.**
**이유:** 세지 않고는 한계를 알 수 없고, 잘린 뒤에 알면 이미 쓴 글이 사라진 뒤다. 그 표시는
`Textarea` 밖의 `<p>` 가 맡는다 — 컴포넌트 안에 넣지 마라.

### 받은 그대로의 값 (`textarea.tsx:9`)

| 축        | 값                                            |
| --------- | --------------------------------------------- |
| 최소 높이 | `min-h-16` = 64px                             |
| 높이 증가 | `field-sizing-content` — 내용에 따라 늘어난다 |
| 폭        | `w-full`                                      |
| 반경      | `rounded-lg` = 10px (`--radius`)              |
| 테두리    | `border border-input`                         |
| 면        | 투명. 다크만 `--input` 알파 30%               |
| 여백      | `px-2.5 py-2` = 좌우 10px · 세로 8px          |
| 글자      | `text-base` → 768px 이상 `md:text-sm`         |
| 안내 글자 | fg=`--muted-foreground`                       |
| 전이      | `transition-colors`                           |

**`Input` 과 세로 여백이 다르다** — `Input` 은 `py-1`(4px), `Textarea` 는 `py-2`(8px)다.
**맞추려 하지 마라. 이유:** `Input` 은 높이가 32px 로 고정이라 여백이 높이를 밀지만, `Textarea` 는
내용에 따라 늘어나므로 여백이 첫 줄과 테두리 사이의 숨 쉴 자리다. 둘 다
[`../tokens.md`](../tokens.md) 의 간격 12단계 안이다.

**`disabled:pointer-events-none` 이 `Input` 에는 있고 여기에는 없다** (`input.tsx:11` vs
`textarea.tsx:9`). **`Textarea` 에도 넣는다. 이유:** 없으면 비활성 상태에서도 글자를 끌어 선택할 수
있어, 못 고치는 글을 고칠 수 있는 것처럼 보인다. **고칠 위치:** `../../src/ui/textarea.tsx:9`.

**`--input` 은 [`../tokens.md`](../tokens.md) 의 색 표 14행에 없다.** 값은
`../../src/tokens.css:80`(라이트) · `:115`(다크)에 있다. **새 토큰을 만들지 마라 — 이유:** 이미 CSS 에
있는 이름이다.

## states

| state         | 트리거             | 시각 변화                                                                                                                                                                                      |
| ------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| default       | —                  | 면 투명(다크는 `--input` 알파 30%), 테두리 `--input`, `rounded-lg`, `min-h-16`, `px-2.5 py-2`. 글자 fg=`--foreground` 상속                                                                     |
| hover         | 없다               | `textarea.tsx` 에 `hover:` 가 0건이다. **hover 면을 만들지 마라 — 이유:** 글자를 넣을 수 있다는 것은 커서가 이미 말한다. 같은 판단을 [`Input.md`](Input.md) 가 적고 있다                       |
| focus-visible | 키보드·클릭 포커스 | `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50` — 테두리가 `--ring` 이 되고 그 바깥에 3px 링이 알파 50% 로 깔린다                                                  |
| pressed       | 없다               | 누름 상태가 없다. 누르면 포커스가 들어가고 그 표시는 focus-visible 이 맡는다                                                                                                                   |
| disabled      | `disabled`         | `disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50`. 다크는 `dark:disabled:bg-input/80`. 대비 하한 **3:1**(WCAG 1.4.11). `disabled:pointer-events-none` 은 위 표대로 더한다 |
| loading       | 없다               | 스스로 비동기 동작을 하지 않는다. 저장 중을 보여야 하면 `disabled` 를 주고 표시는 부르는 쪽이 한다                                                                                             |
| empty         | 값이 빈 문자열     | 높이가 `min-h-16`(64px)이고 안내 글자가 fg=`--muted-foreground` 로 보인다. **안내 글자를 라벨 대신 쓰지 마라 — 이유:** 글자를 넣는 순간 사라진다                                               |
| error         | `aria-invalid`     | `aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20`. 다크는 테두리가 `--destructive` 알파 50%, 링이 알파 40% 다                                             |

**`transition-colors` 에 `motion-reduce:transition-none` · `duration-150` · `ease-out` 이 빠져 있다**
(`textarea.tsx:9`). [`../tokens.md`](../tokens.md) 가 그 셋을 실측 8·9·9건으로 정했다.
**같은 줄에 넣는다. 이유:** 값이 없으면 브라우저 기본값이 쓰여 같은 화면의 다른 요소와 속도가 갈리고,
`motion-reduce` 가 빠진 곳은 화면에서만 드러난다. **고칠 위치:** `../../src/ui/textarea.tsx:9`.

## a11y

- a11y:label — `<label htmlFor>` 가 **필수**다. **`placeholder` 로 대신하지 마라 — 이유:** 글자를 넣으면 사라진다. 라벨을 화면에 보이지 않게 해야 하면 `sr-only` 를 쓴다. `maxLength` 가 있으면 남은 글자 수 표시를 `aria-describedby` 로 묶고 그 표시에 `aria-live="polite"` 를 준다 — **`assertive` 를 쓰지 마라. 이유:** 글자를 칠 때마다 읽던 것을 끊는다
- a11y:focus — 포커스 순서는 DOM 순서와 같고, `disabled` 필드는 포커스를 받지 않는다. **Tab 이 필드를 빠져나간다** — `<textarea>` 안에서 Tab 은 들여쓰기가 아니라 다음 요소로 간다. 그 동작을 가로채지 마라 — 이유: 키보드만 쓰는 사용자가 필드에 갇힌다. **포커스 표시는 `focus-visible:ring-3` 이고 [`../tokens.md`](../tokens.md) 의 네 조각과 다르다. 폼 5종은 `ring-3` 한 벌로 통일한다** — 판단의 근거는 [`Checkbox.md`](Checkbox.md) 의 a11y:focus 에 있다
- a11y:contrast — 글자 fg=`--foreground` / bg=`--background` 라이트 15.82 · 다크 16.13, 안내 글자 fg=`--muted-foreground` / bg=`--background` 라이트 5.28 · 다크 7.97 ([`../tokens.md`](../tokens.md) `## 대비 검증` 실측값, 4.5:1 통과). **테두리 `--input` / bg=`--background` 쌍과 오류 테두리 `--destructive` / bg=`--background` 쌍은 미측정이다** — 테두리 하한은 **3:1**(WCAG 1.4.11)이고 다크의 `--input` 은 알파라 고정 쌍으로 계산되지 않는다. 구현 뒤 렌더 화면에서 재서 [`../tokens.md`](../tokens.md) 에 한 줄을 추가한다
- a11y:target — 최소 높이 64px · 폭 `w-full`. 24x24 최소를 넉넉히 넘는다. **`min-h-16` 을 24px 아래로 내리지 마라 — 이유:** 여러 줄을 받는 칸이 한 줄짜리보다 낮으면 무엇을 받는 칸인지 모양이 말하지 못한다. 필드를 세로로 쌓을 때 간격 8px 이상을 둔다
- a11y:role — `textbox` 에 `aria-multiline="true"` (`<textarea>` 의 암묵 역할). **`role` 을 지정하지 마라 — 이유:** 암묵 역할이 이미 맞고, `contenteditable` 인 `<div>` 로 바꾸면 그 역할을 손으로 붙여야 하는 데다 되돌리기·맞춤법 검사가 브라우저마다 갈린다

## responsive

- 브레이크포인트 분기는 **1건**이다 — `text-base md:text-sm` (`textarea.tsx:9`). 768px 미만은 16px, 768px 이상은 14px 이다. **이 분기를 지우지 마라. 이유:** iOS Safari 는 글자 크기가 16px 미만인 입력 필드에 포커스가 가면 화면을 확대한다. `md` 는 [`../tokens.md`](../tokens.md) 의 실측 15건짜리 브레이크포인트다
- 높이가 `field-sizing-content` 로 내용에 따라 늘어난다 (`textarea.tsx:9`). **`rows` 로 높이를 고정하지 마라 — 이유:** `field-sizing-content` 가 이기므로 `rows` 는 처음 높이만 정하고, 두 값이 다르면 어느 쪽이 의도인지 판정할 수 없다. 처음 높이를 바꾸려면 `className` 으로 `min-h-*` 를 준다
- **최대 높이를 정하지 않았다.** 긴 글을 넣으면 필드가 화면보다 길어진다. 그 자리가 `Dialog` 안이면 `className="max-h-[40vh]"` 를 준다 — 이유: 팝업 안에서 필드가 늘어나면 `DialogFooter` 의 버튼이 화면 밖으로 밀린다. 같은 판단을 [`Dialog.md`](Dialog.md) 의 `## responsive` 가 적고 있다
- 폭이 `w-full` 이다. 폭은 부모가 정한다. **375px 에서 필드 폭은 335px 이다** (375 - 화면 좌우 `px-5` 20px x2)
- 가로로 크기를 조절하지 못하게 한다 — `resize-y` 또는 `resize-none` 을 준다. **이유:** 기본값 `resize: both` 는 사용자가 필드를 부모보다 넓게 늘릴 수 있게 하고, 그러면 375px 화면이 가로로 스크롤된다
- `lg` 이상 브레이크포인트를 넣지 마라. **이유:** 페이지 폭이 `max-w-5xl`(1024px)에서 멈춘다

## 상호작용

- focus-visible / disabled / error 정의. hover 와 pressed 는 없다
