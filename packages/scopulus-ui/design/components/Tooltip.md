# component: Tooltip

purpose: 트리거의 이름이나 짧은 보충을 포인터·포커스가 머무는 동안만 띄운다. 누를 것이 들어가면 `Popover`, 뒤를 막아야 하면 `Dialog` 다

## 근거 — shadcn base-nova 에서 받았다

### 1. 출처

| 항목      | 값                                                              |
| --------- | --------------------------------------------------------------- |
| 받은 명령 | `pnpm dlx shadcn@4 add tooltip`                                 |
| 스타일    | `base-nova`                                                     |
| 받은 날짜 | **2026-09-11**                                                  |
| 소스      | [`../../src/ui/tooltip.tsx`](../../src/ui/tooltip.tsx)          |
| 기반      | `@base-ui/react/tooltip` (`tooltip.tsx:3`). **Radix 가 아니다** |
| 아이콘    | 없다                                                            |
| 지시어    | `"use client"` (`tooltip.tsx:1`)                                |

**export 4개** (`tooltip.tsx:65`)

| export            | 감싸는 Base UI 프리미티브   | 태그       | 소스 줄          |
| ----------------- | --------------------------- | ---------- | ---------------- |
| `TooltipProvider` | `TooltipPrimitive.Provider` | (없다)     | `tooltip.tsx:6`  |
| `Tooltip`         | `TooltipPrimitive.Root`     | (없다)     | `tooltip.tsx:19` |
| `TooltipTrigger`  | `TooltipPrimitive.Trigger`  | `<button>` | `tooltip.tsx:23` |
| `TooltipContent`  | `TooltipPrimitive.Popup`    | `<div>`    | `tooltip.tsx:27` |

**`Portal` · `Positioner` · `Arrow` 는 export 되지 않는다.** `TooltipContent` 안에 박혀 있다
(`tooltip.tsx:41-42`, `:58`) — 화살표를 끌 수 없다.

**variant 축이 없다. size 축도 없다.** `tooltip.tsx` 에 `cva` 가 없고 최대 폭이
`max-w-xs`(320px) 하나다 (`tooltip.tsx:52`).

### 2. handwork 사용처: 0곳

handwork 화면 어디에도 쓰인 적이 없다. **기존 9종의 `## 근거` 에 있는 `파일:줄` 이 이 문서에는
없다.** 값의 출처는 위의 받은 소스 하나다.

### 3. 왜 20종에 들어가는가

**오버레이 묶음을 덮는다.** 오버레이 3종(`Dialog` · `Tooltip` · `Popover`) 중
머무는 동안만 뜨고 누를 것이 없는 자리를 맡는다.

## `TooltipProvider` 를 앱 루트에 감싼다 — 이것이 없으면 동작하지 않는다

`Tooltip` 은 `TooltipPrimitive.Root` 만 감쌌고 `Provider` 를 안에 두지 않았다
(`tooltip.tsx:19-21`). **`TooltipProvider` 없이 `Tooltip` 을 쓰면 Base UI 가 Provider 를 찾지 못한다.**

**앱 루트에 한 번만 감싼다.**

```tsx
<TooltipProvider>{children}</TooltipProvider>
```

**`Tooltip` 마다 감싸지 마라.**
**이유:** Provider 는 "하나가 열리면 다른 것은 지연 없이 바로 열린다" 는 무리 짓기를 맡는다.
개별로 감싸면 무리가 하나씩 쪼개져 그 동작이 사라진다.

**`delay` 기본값이 `0` 이다** (`tooltip.tsx:7`). 받은 소스가 정한 값이고, Base UI 의 기본값이 아니다.
**`0` 을 그대로 둔다.**
**이유:** 이 프로젝트의 툴팁이 붙을 자리는 아이콘 버튼의 이름이고([`ThemeToggle.md`](ThemeToggle.md) 의
`size="icon"` 이 그 예다), 이름은 늦게 나오면 쓸모가 없다. 지연을 두려면
`<TooltipProvider delay={700}>` 한 곳만 고친다 — **고칠 위치:** 앱 루트의 그 한 줄.

## props

### TooltipProvider

| 이름       | 타입              | 필수 | 기본값  | 의미                            |
| ---------- | ----------------- | ---- | ------- | ------------------------------- |
| delay      | `number`          | X    | **`0`** | 뜨기까지의 ms (`tooltip.tsx:7`) |
| closeDelay | `number`          | X    | —       | 사라지기까지의 ms               |
| children   | `React.ReactNode` | O    | —       | 앱 전체                         |

### Tooltip (루트)

| 이름         | 타입                      | 필수 | 기본값  | 의미                                |
| ------------ | ------------------------- | ---- | ------- | ----------------------------------- |
| open         | `boolean`                 | X    | —       | 제어로 쓸 때의 열림 여부            |
| defaultOpen  | `boolean`                 | X    | `false` | 비제어로 쓸 때의 처음 값            |
| onOpenChange | `(open: boolean) => void` | X    | —       | 열고 닫힐 때                        |
| children     | `React.ReactNode`         | O    | —       | `TooltipTrigger` + `TooltipContent` |

### TooltipContent

| 이름        | 타입                                                                     | 필수 | 기본값       | 의미                                         |
| ----------- | ------------------------------------------------------------------------ | ---- | ------------ | -------------------------------------------- |
| side        | `top` \| `bottom` \| `left` \| `right` \| `inline-start` \| `inline-end` | X    | **`top`**    | 트리거의 어느 쪽에 뜨는가 (`tooltip.tsx:29`) |
| sideOffset  | `number`                                                                 | X    | **`4`**      | 트리거와의 간격 px (`tooltip.tsx:30`)        |
| align       | `start` \| `center` \| `end`                                             | X    | **`center`** | 그 축에서의 정렬 (`tooltip.tsx:31`)          |
| alignOffset | `number`                                                                 | X    | **`0`**      | 정렬 축의 어긋남 px (`tooltip.tsx:32`)       |
| className   | `string`                                                                 | X    | —            | 최대 폭을 바꿀 때만 쓴다                     |
| children    | `React.ReactNode`                                                        | O    | —            | **글자만.** 아래 금지 참조                   |

**`side` 기본값이 `top` 이다.** [`Popover.md`](Popover.md) 와 [`Select.md`](Select.md) 의
`bottom` 과 다르다 — 받은 소스가 그렇다. **맞추지 마라. 이유:** 툴팁은 포인터가 트리거 위에
있을 때 뜨므로, 아래에 뜨면 포인터와 겹칠 자리가 생긴다.

**`children` 에 링크·버튼·입력을 넣지 마라.**
**이유:** 툴팁은 포인터가 떠나면 사라진다. 안의 링크로 포인터를 옮기는 사이 툴팁이 닫혀 닿을 수 없다.
누를 것이 있으면 `Popover` 다.

**긴 설명을 넣지 마라.** 글자가 `text-xs`(12px)에 최대 폭 320px 이다 (`tooltip.tsx:52`).
**이유:** 읽는 동안 포인터를 움직이면 사라진다. 한 줄에서 두 줄까지가 이 컴포넌트의 몫이고,
그보다 길면 본문에 쓴다.

### 받은 그대로의 값 (`tooltip.tsx:52`, `:58`)

| 축      | 값                                                    |
| ------- | ----------------------------------------------------- |
| 면      | bg=`--foreground`                                     |
| 글자    | fg=`--background` · `text-xs`(12px)                   |
| 반경    | `rounded-md` = 8px                                    |
| 여백    | `px-3 py-1.5` = 좌우 12px · 세로 6px                  |
| 최대 폭 | `max-w-xs` = 320px. 폭은 `w-fit` 으로 내용을 따라간다 |
| 화살표  | `size-2.5`(10px) 를 45도 돌린 것. bg=`--foreground`   |
| 겹침    | `z-50`                                                |

**면과 글자가 뒤집혀 있다.** 다른 오버레이 둘(`Dialog` · `Popover`)은 bg=`--popover` 인데
여기만 bg=`--foreground` 다. **뒤집힌 채로 둔다.**
**이유:** 툴팁은 아래 내용 위에 잠깐 떠 있다가 사라진다. 같은 밝기의 면이면 아래 카드와 겹쳤을 때
어디까지가 툴팁인지 판정할 수 없다. 뒤집힌 면은 테두리 없이도 경계를 말한다 —
그래서 `ring-1` 이 없는 유일한 오버레이다.

**`py-1.5`(6px)가 [`../tokens.md`](../tokens.md) 의 간격 12단계 밖이다.** 그 문서의 12단계는
`0.5` · `1` · `2` · `2.5` · `3` · `4` · `5` · `6` · `8` · `10` · `12` · `16` 이고 `1.5` 가 없다.
**`py-1`(4px)으로 내린다.**
**이유:** 12px 글자에 6px 여백이면 상자 높이가 24px 이고, 4px 이면 20px 이다. 둘 다 툴팁으로 읽히고,
스케일 밖의 값을 하나 들이면 그 값이 맞는지 판정할 기준이 사라진다.
**고칠 위치:** `../../src/ui/tooltip.tsx:52`.

**`rounded-[2px]` 가 화살표에 있다** (`tooltip.tsx:58`). 반경 3단계 밖이다.
**그대로 둔다. 이유:** 10px 사각형을 45도 돌린 꼭짓점을 살짝 깎는 값이고, 3단계의 최솟값
`rounded-sm`(6px)을 주면 10px 사각형이 원이 되어 화살표가 사라진다.

**`has-data-[slot=kbd]:pr-1.5` 와 `**:data-[slot=kbd]:*` 가 있다** (`tooltip.tsx:52`).
**이 라이브러리에 `Kbd` 컴포넌트가 없다.** `../../src/index.ts` 의 20종에 없다.
**그 조각을 검증된 값으로 적지 마라.** 쓰이는 곳이 0곳이다.

## states

| state         | 트리거                     | 시각 변화                                                                                                                                                                                                                        |
| ------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| default       | 닫힘                       | 아무것도 렌더되지 않는다. `TooltipPrimitive.Portal` 이 열릴 때만 DOM 에 붙는다 (`tooltip.tsx:41`)                                                                                                                                |
| hover         | **포인터가 트리거에 진입** | 툴팁이 뜬다. **이 컴포넌트에서 hover 는 면의 색이 아니라 존재 자체다** — 툴팁 면에는 `hover:` 가 0건이다. 포인터가 떠나면 사라진다                                                                                               |
| focus-visible | **키보드 포커스**          | 툴팁이 뜬다. 포커스가 떠나면 사라진다. 툴팁 면 자체는 포커스를 받지 않는다 — 아래 a11y:focus 참조                                                                                                                                |
| pressed       | 없다                       | 툴팁을 누를 수 없다. **트리거를 누르면 툴팁이 닫힌다** — Base UI 가 그렇게 한다. 이유: 누른 뒤에도 떠 있으면 방금 누른 것의 결과를 가린다                                                                                        |
| disabled      | 없다                       | 툴팁에 비활성 개념이 없다. **`disabled` 인 트리거 위에서는 툴팁이 뜨지 않는다** — `disabled` 요소는 포인터 이벤트를 받지 않는다. 비활성 이유를 말해야 하면 트리거를 `<span>` 으로 감싸고 그 `<span>` 에 `TooltipTrigger` 를 건다 |
| loading       | 없다                       | 스스로 데이터를 불러오지 않는다. **불러온 값을 툴팁에 넣지 마라. 이유:** 값이 도착하기 전에 포인터가 떠나면 아무것도 보여 주지 못한 채 사라진다                                                                                  |
| empty         | 없다                       | `children` 이 비면 `Tooltip` 을 쓰지 마라 — 이유: 빈 상자가 화살표를 달고 떠서 무언가 깨진 것처럼 읽힌다. 조건부 렌더는 부르는 쪽이 한다                                                                                         |
| error         | 없다                       | 툴팁이 에러 상태를 갖지 않는다. 오류 문구는 `Alert variant="destructive"` 나 필드 아래 글자가 맡는다 — **툴팁에 넣지 마라. 이유:** 포인터를 올려야만 보이는 오류는 못 본 채 지나간다                                             |

**열고 닫는 전이는 `fade` + `zoom-95` 에 방향별 `slide-in` 이 더해진다** (`tooltip.tsx:52`).
여섯 방향에 각각 반대쪽에서 2 스텝(8px) 미끄러져 들어온다.
**`motion-reduce:` 짝이 빠져 있다** — [`../tokens.md`](../tokens.md) 가 "전이를 넣으면
`motion-reduce:transition-none` 을 같은 줄에 넣는다" 를 화면에 나온 8:8 로 정했다.
**`motion-reduce:animate-none` 을 넣는다. 이유:** 툴팁은 화면을 훑는 동안 여러 개가 잇따라 뜨고
사라진다. 그 반복되는 움직임이 전정기관 이상이 있는 사용자에게 가장 세게 닿는다.
**고칠 위치:** `../../src/ui/tooltip.tsx:52`.

**`duration` 과 `ease` 가 없다** (`tooltip.tsx:52`). `Dialog`·`Popover`·`Select` 는 `duration-100`
을 갖는데 여기만 없다. **`duration-150 ease-out` 을 붙인다. 이유:**
[`../tokens.md`](../tokens.md) 가 그 둘을 화면에 나온 9곳씩으로 정했고, 값이 없으면 브라우저 기본값이 쓰여
같은 화면의 다른 오버레이와 속도가 달라진다.

## a11y

- a11y:label — **툴팁의 글자가 트리거의 접근 이름이 된다.** Base UI 가 `aria-describedby` 또는 `aria-labelledby` 로 묶는다. **트리거에 `aria-label` 을 따로 주고 툴팁에 다른 글자를 넣지 마라 — 이유:** 보이는 글자와 읽히는 글자가 달라져 음성 조작이 실패한다. 아이콘 버튼에 툴팁을 달 때는 **둘 중 하나만 쓴다** — [`Button.md`](Button.md) 가 `size="icon"` 에 `aria-label` 을 필수로 정했으므로, 툴팁을 달면 그 `aria-label` 과 툴팁 글자를 **같은 문자열로** 맞춘다. [`ThemeToggle.md`](ThemeToggle.md) 의 "테마 전환" 이 그 예다
- a11y:focus — 툴팁 면은 포커스를 받지 않는다. **`tabindex` 를 주지 마라 — 이유:** 포커스가 툴팁으로 옮겨 가는 순간 트리거에서 떠난 것이 되어 툴팁이 사라진다. 키보드 사용자는 트리거에 포커스를 주어 툴팁을 열고 Esc 로 닫는다. **포인터를 툴팁 위로 옮겨도 닫히지 않아야 한다** — Base UI 가 트리거와 툴팁 사이를 한 무리로 다룬다. `sideOffset` 을 4 보다 크게 두지 마라 — 이유: 틈이 벌어지면 그 사이를 지나는 동안 닫힌다. 같은 판단을 [`Popover.md`](Popover.md) 의 `## props` 가 적고 있다
- a11y:contrast — fg=`--background` / bg=`--foreground` 다. 두 토큰의 값은 `--primary-foreground` · `--primary` 와 **같다** (`../../src/tokens.css:64,71`·`:65,70` 라이트 · `:99,106`·`:100,105` 다크). 그래서 [`../tokens.md`](../tokens.md) `## 대비 검증` 의 "CTA 라벨/CTA 배경" 대비값이 그대로 적용된다 — **라이트 15.82 · 다크 16.13**, 4.5:1 통과. **글자가 `text-xs`(12px)이라 큰 글자 완화(3:1)를 받지 않는다** — 4.5:1 기준을 그대로 받고, 통과한다. 화살표는 면과 같은 색이라 대비 대상이 아니다
- a11y:target — 툴팁 면은 클릭 대상이 아니라 24x24 규칙이 걸리지 않는다. 규칙은 트리거가 받고, [`Button.md`](Button.md) 가 `size="icon"` 40x40 · `size="icon-sm"` 32x32 로 정했다. **트리거가 글자 안의 `<abbr>` 처럼 작은 것이면 `Tooltip` 을 쓰지 마라 — 이유:** 포인터가 닿을 수 있어도 손가락은 닿지 못하고, 터치 화면에는 hover 가 없다
- a11y:role — `tooltip` 이다. Base UI 가 붙인다. **`role` 을 덮어쓰지 마라. 이유:** `dialog` 로 바꾸면 스크린리더가 안의 요소를 훑을 수 있는 것으로 읽는데 실제로는 포커스를 줄 수 없다. **`title` 속성으로 대신하지 마라 — 이유:** 브라우저 기본 툴팁은 지연 시간을 바꿀 수 없고 키보드 포커스로는 뜨지 않으며 모바일에서 아예 나오지 않는다. 그것이 이 컴포넌트가 있는 이유다

## responsive

- 브레이크포인트 분기가 **0건**이다. `tooltip.tsx` 전체에 `sm:`·`md:` 가 없다
- 폭이 `w-fit max-w-xs` 다 (`tooltip.tsx:52`). 내용을 따라가되 320px 을 넘지 않는다. **375px 화면에서 320px 툴팁은 화면 폭의 85% 를 덮는다** — 화면 좌우 여백(`px-5` 20px x2)을 빼면 15px 만 남는다. **375px 에서 툴팁 글자를 한 줄에 끝나는 길이로 쓴다 — 이유:** 세 줄이 되면 트리거 위아래를 함께 가려 무엇에 붙은 툴팁인지 읽을 수 없다
- 툴팁이 화면 위로 넘치면 Base UI 가 `side` 를 뒤집는다. `side="top"` 이 `bottom` 이 되고 `slide-in` 방향과 화살표 위치도 함께 바뀐다 — `data-[side=bottom]:top-1` (`tooltip.tsx:58`)이 그 경우의 화살표 값이다
- **터치 화면에는 hover 가 없다.** 손가락으로 누르면 트리거의 동작이 실행되고 툴팁은 뜨지 않는다. **툴팁에만 있는 정보를 두지 마라 — 이유:** 터치로 접근하는 사용자가 그 정보에 닿을 수단이 없다. 툴팁은 이미 화면에 있는 것의 이름을 말하는 자리이지 새 정보를 두는 자리가 아니다
- `lg` 이상 브레이크포인트를 넣지 마라. **이유:** 최대 폭이 320px 로 고정이라 분기를 늘려도 화면이 달라지지 않는다

## 상호작용

- hover / focus-visible 로 열리고, 그 둘이 끝나면 닫힌다. Esc 로도 닫힌다
- 툴팁 면 자체는 hover / focus-visible / pressed 대상이 아니다
