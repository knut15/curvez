# component: ThemeToggle

purpose: 라이트·다크를 전환한다. 선택은 브라우저에 남고 다음 방문에 이어진다

구현: `packages/scopulus-ui/src/ui/theme-toggle.tsx`. 사용처는 `apps/handwork/src/widgets/site-header.tsx:49` 하나다.

**화면에 존재하는 유일한 `<button>` 이다** — `grep -rn '<button' apps/handwork/src --include='*.tsx'`
가 1건(`theme-toggle.tsx:9`)이다. 그래서 이 디자인 시스템의 버튼 값이 전부 이 파일에서 실측됐다.

## props

| 이름 | 타입 | 필수 | 기본값 | 의미                                           |
| ---- | ---- | ---- | ------ | ---------------------------------------------- |
| 없음 | —    | —    | —      | 상태를 스스로 읽고 쓴다. 부모가 넘길 값이 없다 |

라이브러리는 `next-themes` 를 쓴다. 직접 만들지 않는다.
**이유:** 서버에서 렌더한 마크업과 브라우저의 저장값이 다르면 첫 프레임에 라이트가 번쩍 스친다.
그것을 막으려면 CSS 가 그려지기 전에 저장값을 읽어 `<html>` 에 클래스를 붙이는 인라인 스크립트가
문서 머리에 들어가야 하는데, 그 삽입이 이 라이브러리의 존재 이유다. 손으로 만들면 그 스크립트를
직접 써야 하고, 그것이 프레임워크의 스트리밍 렌더와 어긋나는 순간 번쩍임이 돌아온다.

**`className` prop 을 열지 마라.**
**이유:** 면이 [`Button.md`](Button.md) 의 `variant="ghost" size="icon"` 과 같아야 한다(아래
`## Button 과의 관계`). 덧붙일 구멍을 열면 그 일치가 호출하는 쪽마다 깨질 수 있다. 사용처가
헤더 하나뿐이라 구멍이 필요하지도 않다.

## states

| state         | 트리거        | 시각 변화                                                                                                                                                                             |
| ------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| default       | —             | 현재 테마의 반대 아이콘 하나. bg 투명, fg=--muted-foreground                                                                                                                          |
| hover         | 포인터 진입   | bg=--accent, fg=--accent-foreground                                                                                                                                                   |
| focus-visible | 키보드 포커스 | outline 2 + offset 2, color=--ring                                                                                                                                                    |
| pressed       | :active       | `active:scale-97` (97%). `motion-reduce:active:scale-100` 을 같은 줄에 둔다                                                                                                           |
| disabled      | 없음          | 비활성 상태가 없다                                                                                                                                                                    |
| loading       | 없다          | 두 아이콘을 다 렌더하고 `.dark` 클래스로 CSS 가 고른다. next-themes 가 첫 페인트 전에 그 클래스를 붙이므로 자바스크립트 상태 없이 맞는 아이콘이 나온다. 마운트 전 빈 상자가 필요 없다 |
| empty         | 없음          | 내용을 받지 않는다. 아이콘 두 개가 코드에 박혀 있고(`theme-toggle.tsx:25-26`) 둘 중 하나는 항상 보인다. 빈 상자가 나오는 경로가 없다                                                  |
| error         | 없음          | 실패할 동작이 아니다                                                                                                                                                                  |

`pressed` 만 이 시스템에서 유일하게 시각 변화를 갖는다.
**이유:** 축소는 "지금 여기서 무언가 일어났다" 는 신호다. 제자리에서 상태가 뒤집히는 버튼에만
맞고, 화면을 떠나는 링크에 붙이면 거짓말이 된다. 그래서 링크·카드는 `pressed` 가 "시각 변화 없음" 이다.

## a11y

- a11y:label — 아이콘 전용이라 `aria-label` 필수. 원문 "테마 전환"(`theme-toggle.tsx:11`). 현재 테마를 라벨에 넣지 않는다 — 아이콘과 라벨이 서로 다른 시점에 갱신되면 스크린리더가 반대로 읽는다
- a11y:focus — 헤더 링크 다음, 본문 앞. 누른 뒤에도 포커스를 잃지 않는다
- 토글 방향은 `document.documentElement.classList` 를 읽어 정한다(`theme-toggle.tsx:16`). `resolvedTheme` 은 하이드레이션 전에 `undefined` 라 그 값으로 뒤집으면 첫 클릭이 반대로 간다
- a11y:contrast — fg=--muted-foreground / bg=--background 라이트 5.28 · 다크 7.97. hover 는 fg=--accent-foreground / bg=--accent
- a11y:target — 40x40 px (`size-10`). 24x24 최소를 넘고 헤더 링크와 gap-4 로 8px 이상 떨어진다. **이 40x40 이 [`Button.md`](Button.md) 의 `size="icon"` 값의 출처다**
- a11y:role — button. 링크가 아니다. 주소가 바뀌지 않는다. `type="button"` 을 명시한다(`theme-toggle.tsx:10`) — 폼 안에서 기본값이 `submit` 이라 의도하지 않은 전송이 일어난다

## responsive

- 모든 폭에서 동일. 모바일에서도 헤더에 남는다. 브레이크포인트 분기가 0건이다
- **[`Button.md`](Button.md) 의 `## responsive` 와 같은 판단이다.** 이유도 같다 — 40px 은 375px 화면에서도 24x24 최소를 여유 있게 넘는다

## Button 과의 관계 — 면은 같고 컴포넌트는 따로 쓴다

| 항목      | ThemeToggle 실측 (`theme-toggle.tsx:21`)                | `Button` 의 `ghost`+`icon` |
| --------- | ------------------------------------------------------- | -------------------------- |
| 크기      | `size-10` (40x40)                                       | 같다                       |
| 반경      | `rounded-md` (8px)                                      | 같다                       |
| 기본 fg   | `text-muted-foreground`                                 | 같다                       |
| hover     | `hover:bg-accent hover:text-accent-foreground`          | 같다                       |
| focus     | `focus-visible:outline-2 outline-offset-2 outline-ring` | 같다                       |
| 눌림      | `active:scale-97` + `motion-reduce:active:scale-100`    | 같다                       |
| 전이 속성 | `transition-[color,background-color,transform]`         | 같다                       |

**면이 전부 같다. 그래도 `Button` 으로 바꾸지 않는다.**
**이유:** 이 버튼은 `next-themes` 의 `setTheme` 과 `document.documentElement.classList` 를 직접 읽는
클라이언트 컴포넌트이고(`theme-toggle.tsx:1` · `:3` · `:16`), 두 아이콘을 다 렌더한 뒤 CSS 로 고르는
구조가 그 안에 박혀 있다(`:25-26`). `Button` 을 한 겹 끼우면 그 구조가 두 파일로 갈라지는데,
얻는 것은 클래스 문자열 하나를 줄이는 것뿐이다.

**대신 한 방향을 못박는다: `Button` 의 `ghost`+`icon` 이 이 파일을 따라간다.**
[`Button.md`](Button.md) 의 "남기는 값" 표가 이 파일의 줄 번호를 근거로 적혀 있다.
**고칠 때 순서:** `packages/scopulus-ui/src/ui/theme-toggle.tsx:21` 을 먼저 고치고
[`Button.md`](Button.md) 의 표를 맞춘다. 반대로 하지 마라.

## 아이콘 크기 — 20px 하나

실측: `theme-toggle.tsx:25`(`hidden size-5 dark:block`) · `:26`(`size-5 dark:hidden`).
`grep -rn 'size-5' apps/handwork/src --include='*.tsx'` 가 2건이고 둘 다 이 파일이다.

**시스템의 아이콘 크기 단계는 `size-5`(20px) 하나다. 두 번째 크기를 만들지 마라.**
**이유:** 아이콘이 쓰이는 자리가 이 파일뿐이다. 쓰이지 않는 단계를 만들면 처음 아이콘을 넣는
사람이 둘 중 무엇을 골라야 하는지 판정할 수 없다.

40px 상자 안에 20px 아이콘이면 사방 10px 이 남는다. 그 10px 은 [`../tokens.md`](../tokens.md) 의
간격 스케일에 올리지 마라 — 간격이 아니라 상자와 아이콘의 차이로 계산된 값이다.

**아이콘 라이브러리를 쓰지 않는다.** `apps/handwork/components.json` 의 `iconLibrary` 는 `lucide` 지만
이 파일은 SVG 를 직접 그린다(`theme-toggle.tsx:31-63`).
**이유:** 아이콘 두 개를 위해 `lucide-react` 를 클라이언트 번들에 넣지 않는다. 세 번째 아이콘이
필요해지면 그때 판단한다.

## 스토리북에서 검증되는 것과 안 되는 것

다크 모드를 `@storybook/addon-themes` 의 클래스 데코레이터로 토글한다. `next-themes` 를 스토리북에
띄우지 않는다 — 프로바이더가 하나 더 생기면 실제 앱과 다른 경로로 테마가 걸린다.

**그래서 검증되는 것과 안 되는 것이 갈린다. 이 구분을 스토리 파일에 적는다.**

| 스토리로 검증되는 것                           | 검증되지 않는 것                                        |
| ---------------------------------------------- | ------------------------------------------------------- |
| `.dark` 일 때 해 아이콘, 라이트일 때 달 아이콘 | 클릭이 실제로 테마를 뒤집는가 (`setTheme` 이 안 붙는다) |
| hover · focus-visible · active 의 면           | 첫 페인트 전에 `.dark` 가 붙는가 (하이드레이션 순서)    |
| 40x40 상자와 20px 아이콘의 정렬                | 브라우저에 선택이 남는가                                |

**검증되지 않는 셋은 스토리로 만들지 마라.**
**이유:** 프로바이더 없이 흉내 낸 스토리는 통과해도 실제 동작을 말해 주지 않는다. 통과하는데
화면에서는 깨지는 검사가 가장 나쁘다.

## 상호작용

- hover / focus-visible 정의
