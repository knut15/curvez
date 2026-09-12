# component: Switch

purpose: 하나의 설정을 즉시 켜고 끈다. 제출 버튼을 눌러야 반영되는 자리면 `Checkbox` 를 쓴다

## 근거 — shadcn base-nova 에서 받았다

### 1. 출처

| 항목      | 값                                                            |
| --------- | ------------------------------------------------------------- |
| 받은 명령 | `pnpm dlx shadcn@4 add switch`                                |
| 스타일    | `base-nova`                                                   |
| 받은 날짜 | **2026-09-11**                                                |
| 소스      | [`../../src/ui/switch.tsx`](../../src/ui/switch.tsx)          |
| 기반      | `@base-ui/react/switch` (`switch.tsx:3`). **Radix 가 아니다** |
| 아이콘    | 없다                                                          |
| 지시어    | `"use client"` (`switch.tsx:1`)                               |

**export 1개** (`switch.tsx:31`)

| export   | 감싸는 것                                        | 소스 줄        |
| -------- | ------------------------------------------------ | -------------- |
| `Switch` | `SwitchPrimitive.Root` + `SwitchPrimitive.Thumb` | `switch.tsx:6` |

`Thumb` 은 따로 export 되지 않는다. `Switch` 안에 박혀 있다 (`switch.tsx:23-26`).

**variant 축이 없다. size 는 있다.**

| 축   | 값                                   | 기본값    | 소스 줄              |
| ---- | ------------------------------------ | --------- | -------------------- |
| size | `sm`(24 x 14) · `default`(32 x 18.4) | `default` | `switch.tsx:8,11,18` |

**`sm` 과 `default` 가 [`Select.md`](Select.md) 의 같은 이름과 값이 다르다.** 그쪽은 높이
28px / 32px 이다 (`select.tsx:41`). **이름이 같다고 크기를 맞추지 마라 — 이유:** 두 컴포넌트의
받은 소스가 각자 그 값을 갖고 있고, 맞추려면 한쪽을 손으로 고쳐야 한다.

### 2. handwork 사용처: 0곳

handwork 화면 어디에도 쓰인 적이 없다. **기존 9종의 `## 근거` 에 있는 `파일:줄` 이 이 문서에는
없다.** 값의 출처는 위의 받은 소스 하나다.

### 3. 왜 20종에 들어가는가

**폼 묶음을 덮는다.** 폼 5종(`Input` · `Textarea` · `Checkbox` · `Switch` · `Select`) 중
고른 즉시 반영되는 자리를 맡는다.

## props

| 이름            | 타입                         | 필수 | 기본값    | 의미                                |
| --------------- | ---------------------------- | ---- | --------- | ----------------------------------- |
| size            | `sm` \| `default`            | X    | `default` | 24x14 / 32x18.4 (`switch.tsx:8,11`) |
| checked         | `boolean`                    | X    | —         | 제어로 쓸 때의 값                   |
| defaultChecked  | `boolean`                    | X    | `false`   | 비제어로 쓸 때의 처음 값            |
| onCheckedChange | `(checked: boolean) => void` | X    | —         | 값이 바뀔 때                        |
| disabled        | `boolean`                    | X    | `false`   | 클릭 무시 + 불투명도 50%            |
| required        | `boolean`                    | X    | `false`   | 폼 제출 시 필수                     |
| name            | `string`                     | X    | —         | 폼 필드 이름                        |
| className       | `string`                     | X    | —         | 자리를 앉힐 때만 쓴다               |

타입 원본은 `SwitchPrimitive.Root.Props` 에 `size` 를 더한 것이다 (`switch.tsx:10-12`).

**`indeterminate` 가 없다.** `Checkbox` 와 다른 점이다 — 켜짐과 꺼짐 둘뿐이다.
**부분 선택을 표시할 자리에는 `Checkbox` 를 쓴다. 이유:** 스위치의 모양이 "지금 켜져 있다" 를
손잡이의 위치로 말하는데, 가운데에 둘 자리가 없다.

**라벨 글자를 스위치 안에 넣지 마라(`ON`/`OFF`).**
**이유:** 32x18.4px 안에 들어가는 글자가 없고, 넣으면 켜짐일 때 `ON` 이 보이는지 `OFF` 가
보이는지가 매번 판단 대상이 된다. 상태는 손잡이의 위치와 면 색이 말한다.

### 받은 그대로의 값

| 축          | `default`                                                               | `sm`                | 소스 줄         |
| ----------- | ----------------------------------------------------------------------- | ------------------- | --------------- |
| 바깥 크기   | `h-[18.4px] w-[32px]`                                                   | `h-[14px] w-[24px]` | `switch.tsx:18` |
| 손잡이 크기 | `size-4` = 16px                                                         | `size-3` = 12px     | `switch.tsx:25` |
| 반경        | `rounded-full`                                                          | `rounded-full`      | `switch.tsx:18` |
| 켜짐 면     | `--primary`                                                             | `--primary`         | `switch.tsx:18` |
| 꺼짐 면     | `--input` (다크는 알파 80%)                                             | 같다                | `switch.tsx:18` |
| 손잡이 색   | `--background` (다크 켜짐 `--primary-foreground` · 꺼짐 `--foreground`) | 같다                | `switch.tsx:25` |
| 클릭 영역   | `after:-inset-x-3 after:-inset-y-2` → **56 x 34.4**                     | → **48 x 30**       | `switch.tsx:18` |

**`h-[18.4px]` · `w-[32px]` · `h-[14px]` · `w-[24px]` 는 임의값이다.**
[`../tokens.md`](../tokens.md) 가 "임의값 간격을 쓰지 마라 — `p-[13px]`, `gap-[18px]` 같은 것" 을
화면에 나온 0곳으로 정했다. **그 금지는 간격(`p-*`·`m-*`·`gap-*`)에 대한 것이고 여기는 크기(`h-*`·`w-*`)라
문자 그대로는 걸리지 않는다. 그러나 같은 문제를 낳는다** — 18.4px 이 맞는지 틀린지 판정할 기준이 없다.
**받은 값을 그대로 둔다.**
**이유:** 32 : 18.4 는 손잡이 16px 이 양끝에 2.4px 씩 남기고 정확히 한 칸 움직이는 비율이다
(`data-checked:translate-x-[calc(100%-2px)]`, `switch.tsx:25`). 숫자를 스케일에 맞춰 반올림하면
손잡이가 끝에서 삐져나오거나 덜 간다. **고칠 때는 바깥 크기와 손잡이 크기와 이동 거리 셋을 함께
고친다 — 고칠 위치:** `../../src/ui/switch.tsx:18` 과 `:25`.

**`--input` 은 [`../tokens.md`](../tokens.md) 의 색 표 14행에 없다.** 값은
`../../src/tokens.css:80`(라이트) · `:115`(다크)에 있다. **새 토큰을 만들지 마라 — 이유:** 이미 CSS 에
있는 이름이다.

## states

| state         | 트리거         | 시각 변화                                                                                                                                                                                                                                                                                           |
| ------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| default       | —              | 꺼짐: 면 `--input`(다크 알파 80%), 손잡이가 왼쪽 끝. 켜짐: 면 `--primary`, 손잡이가 오른쪽 끝. 손잡이는 `rounded-full` 에 bg=`--background` (`switch.tsx:18,25`)                                                                                                                                    |
| hover         | 없다           | `switch.tsx` 에 `hover:` 가 0건이다. **hover 면을 만들지 마라 — 이유:** 실제 클릭 영역이 스위치보다 넓어(56x34.4) 면을 칠하면 눌리는 곳과 칠해지는 곳이 어긋난다. 같은 판단을 [`Checkbox.md`](Checkbox.md) 가 적고 있다                                                                             |
| focus-visible | 키보드 포커스  | `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50` (`switch.tsx:18`). 아래 a11y:focus 참조                                                                                                                                                                                 |
| pressed       | 없다           | `active:` 가 0건이다. **`active:scale-97` 을 붙이지 마라 — 이유:** [`../tokens.md`](../tokens.md) 가 그 값을 아이콘 버튼 하나로 못박았고, 손잡이가 이미 움직여 눌린 것을 말한다                                                                                                                     |
| disabled      | `disabled`     | `data-disabled:cursor-not-allowed data-disabled:opacity-50` (`switch.tsx:18`). 대비 하한 **3:1**(WCAG 1.4.11). **`disabled` 속성을 실제로 주고 색만으로 표현하지 마라** — 이유: 대비를 낮춘 것과 그냥 흐린 것을 스크린리더는 구분하지 못한다                                                        |
| loading       | 없다           | 스스로 비동기 동작을 하지 않는다. **즉시 반영이 이 컴포넌트의 전제인데 서버 응답을 기다려야 하면 `Switch` 를 쓰지 마라 — 이유:** 손잡이가 이미 옮겨 간 뒤에 실패하면 되돌아가는 움직임이 사용자 조작처럼 보인다. 그런 자리는 `Checkbox` + 제출 버튼이다                                             |
| empty         | 없다           | 값이 `true`·`false` 둘뿐이라 빈 값이 없다. 라벨이 비면 스위치를 렌더하지 마라 — 이유: 무엇을 켜는지 모르는 스위치가 남는다                                                                                                                                                                          |
| error         | `aria-invalid` | `aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20`. 다크는 테두리가 `--destructive` 알파 50%, 링이 알파 40% 다 (`switch.tsx:18`). **쓸 자리가 거의 없다** — 켜고 끄는 값 하나가 형식 오류를 낼 경우가 없고, 필수 동의처럼 "꺼져 있으면 안 되는" 자리에만 걸린다 |

**`transition-all` 을 쓴다** (`switch.tsx:18`). [`../tokens.md`](../tokens.md) 가
**"`transition-all` 을 쓰지 마라. 화면에 0번 나온다"** 를 명시했다. 이유도 적혀 있다 — "레이아웃 속성까지
애니메이션되어 스크롤 중에 프레임이 떨어진다".

**`transition-colors` 로 바꾼다.**
**이유:** 바깥 상자에서 실제로 변하는 것은 면 색과 테두리 색뿐이다. 손잡이의 이동은
`transition-transform` 이 따로 맡고 있다 (`switch.tsx:25`) — `transition-all` 은 그 일을 하지 않는다.
**`duration-150 ease-out motion-reduce:transition-none` 을 함께 넣는다** — 그 셋이
[`../tokens.md`](../tokens.md) 의 화면에 9·9·8번 나온 한 벌이다. 손잡이 쪽도 같다.
**고칠 위치:** `../../src/ui/switch.tsx:18` 과 `:25`.

## a11y

- a11y:label — 라벨이 **필수**다. `<label>` 로 감싸거나 `htmlFor` 로 묶는다. **`aria-label` 로 대신하지 마라 — 이유:** 보이는 글자가 없으면 라벨을 눌러 켜는 동작이 사라지고, 32px 스위치만 눌러야 한다. **라벨 글자를 상태에 따라 바꾸지 마라**(켜짐일 때 "끄기", 꺼짐일 때 "켜기") — 이유: 라벨은 무엇을 다루는지를 말하고 상태는 `aria-checked` 가 말한다. 둘을 한 글자에 담으면 스크린리더가 "끄기, 켜짐" 처럼 읽어 지금이 어느 쪽인지 알 수 없다
- a11y:focus — 포커스 순서는 DOM 순서와 같고, `disabled` 스위치는 포커스를 받지 않는다. Space 로 뒤집는다. **뒤집은 뒤에도 포커스를 잃지 않는다** — 이유: 제자리에서 상태가 바뀌는 요소는 연속으로 조작하는 일이 있다. 같은 판단을 [`Button.md`](Button.md) 의 a11y:focus 가 적고 있다. **포커스 표시는 `focus-visible:ring-3` 이고 [`../tokens.md`](../tokens.md) 의 네 조각과 다르다. 폼 5종은 `ring-3` 한 벌로 통일한다** — 판단의 근거는 [`Checkbox.md`](Checkbox.md) 의 a11y:focus 에 있다
- a11y:contrast — **켜짐 면 `--primary` / 주변 bg=`--background` 쌍과 꺼짐 면 `--input` / bg=`--background` 쌍은 [`../tokens.md`](../tokens.md) 의 `## 대비 검증` 목록에 없다 — 미측정이다.** 스위치는 글자가 아니라 **의미 있는 그래픽**이라 하한이 **3:1**(WCAG 1.4.11)이고, 손잡이와 면의 대비도 같은 기준을 받는다. 다크의 `--input` 은 알파라 배경에 따라 실제 색이 달라져 고정 쌍으로 계산되지 않는다. 구현 뒤 렌더 화면에서 `getComputedStyle` 로 재서 [`../tokens.md`](../tokens.md) 에 한 줄을 추가한다. **색만으로 상태를 말하지 마라** — 손잡이의 위치가 색과 함께 상태를 말한다
- a11y:target — 스위치는 `default` 32x18.4 · `sm` 24x14 로 **둘 다 24x24 최소에 세로가 못 미친다.** 실제 클릭 영역을 `after:absolute after:-inset-x-3 after:-inset-y-2` (`switch.tsx:18`)가 넓혀 **`default` 56 x 34.4, `sm` 48 x 30** 이 된다 — 그래야 기준을 넘는다. **`after:` 조각을 지우지 마라. 이유:** 지우는 순간 세로가 18.4px 이 되어 기준 아래로 떨어진다. 스위치를 세로로 나란히 놓을 때 **간격 8px 이상을 둔다** — 34.4px 영역이 겹치지 않게 하려면 그만큼이 필요하다
- a11y:role — `switch` 다. Base UI 가 `<button role="switch">` 로 렌더하고 `aria-checked` 를 관리한다. **`role="checkbox"` 로 바꾸지 마라 — 이유:** 스크린리더가 `switch` 는 "켜짐/꺼짐" 으로, `checkbox` 는 "선택됨/선택 안 됨" 으로 읽는다. 즉시 반영되는 설정과 제출해야 반영되는 선택은 다른 것이고, 그 차이를 역할이 말한다. **`<input type="checkbox">` 로 바꾸지 마라 — 이유:** 같은 이유로 역할이 `checkbox` 가 된다

## responsive

- 브레이크포인트 분기가 **0건**이다. `switch.tsx` 전체에 `sm:`·`md:` 가 없다. **분기를 넣지 마라 — 이유:** 클릭 영역이 56x34.4 라 375px 화면에서도 24x24 최소를 넘는다
- **`size="sm"` 을 손가락으로 누르는 화면에서 쓰지 마라.** 클릭 영역이 48x30 으로 기준은 넘지만 스위치 자체가 24x14 라 손잡이 12px 의 위치를 눈으로 판정하기 어렵다. **`sm` 은 마우스를 쓰는 밀집한 목록에만 쓴다**
- 라벨과 나란히 놓을 때 `flex items-center justify-between` 을 쓰고 라벨을 왼쪽, 스위치를 오른쪽에 둔다. **이유:** 설정 목록에서 스위치가 한 열로 서면 켜진 것과 꺼진 것을 훑어 셀 수 있다
- 라벨이 길어 줄바꿈되면 스위치가 밀린다. 스위치에 `shrink-0` 를 준다 — 받은 소스가 이미 갖고 있다 (`switch.tsx:18`). **그 조각을 지우지 마라. 이유:** 없으면 375px 에서 스위치가 눌려 가로가 줄고 손잡이가 상자 밖으로 나간다
- `lg` 이상 브레이크포인트를 넣지 마라. **이유:** 크기가 고정이라 분기를 늘려도 화면이 달라지지 않는다

## 상호작용

- focus-visible / disabled 정의. hover 와 pressed 는 없다
- 켜고 끄는 것은 손잡이의 `transition-transform` 이 그린다 (`switch.tsx:25`)
