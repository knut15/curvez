# component: Badge

purpose: 한 낱말짜리 메타 정보를 본문과 구분해 얹는다. 태그 칩과 기록 상태 둘을 맡는다

## 근거 — 실측 두 형태

### 형태 1 — 태그 칩, 4회

```
rounded-sm bg-muted px-2 py-0.5
```

| 파일                                               | 줄  | 추가 클래스                              |
| -------------------------------------------------- | --- | ---------------------------------------- |
| `apps/handwork/src/entities/case/ui/case-card.tsx` | 27  | (부모가 `text-xs text-muted-foreground`) |
| `apps/handwork/src/entities/lab/ui/lab-card.tsx`   | 41  | (부모가 `text-xs text-muted-foreground`) |
| `apps/handwork/src/views/case-detail.tsx`          | 37  | `text-xs text-muted-foreground`          |
| `apps/handwork/src/views/lab-detail.tsx`           | 33  | `text-xs text-muted-foreground`          |

재현: `grep -rn 'rounded-sm bg-muted px-2 py-0\.5' apps/handwork/src --include='*.tsx'` → 4줄.

### 형태 2 — 기록 상태, 점 + 글자. 자리 2곳 · 분기 4줄

```
size-1.5 rounded-full bg-brand-accent      (status === "진행 중")
size-1.5 rounded-full bg-muted-foreground  (그 밖)
```

| 파일                                             | 줄    | 자리                  |
| ------------------------------------------------ | ----- | --------------------- |
| `apps/handwork/src/entities/lab/ui/lab-card.tsx` | 19-31 | 카드 맨 윗줄, 제목 위 |
| `apps/handwork/src/views/lab-detail.tsx`         | 18-28 | 상세 h1 아래 메타 줄  |

재현: `grep -rn 'size-1\.5 rounded-full' apps/handwork/src --include='*.tsx'` → 4줄(삼항 양쪽이 각 2줄).

### status 값은 3종이다

`apps/handwork/src/entities/lab/model/types.ts:15`

```ts
export const LAB_STATUSES = ["진행 중", "멈춤", "마무리"] as const;
```

**케이스에는 상태가 없다.** 같은 파일 7-10행 주석: "Cases 에는 없는 값이다 — 케이스는 결론이 난
판단 하나라 상태가 없다."

## props

| 이름     | 타입                            | 필수 | 기본값 | 의미                                                        |
| -------- | ------------------------------- | ---- | ------ | ----------------------------------------------------------- |
| variant  | `tag` \| `status`               | X    | `tag`  | `tag`=면 있는 칩(4회), `status`=점 + 글자(2곳)              |
| status   | `진행 중` \| `멈춤` \| `마무리` | △    | —      | `variant="status"` 일 때 필수. 점 색과 글자를 동시에 정한다 |
| children | `string`                        | △    | —      | `variant="tag"` 일 때 필수. 태그 원문                       |

`variant` 별 값.

| variant  | 면                               | 반경              | 글자                               | 점                             |
| -------- | -------------------------------- | ----------------- | ---------------------------------- | ------------------------------ |
| `tag`    | bg=`--muted`, 여백 `px-2 py-0.5` | `rounded-sm`(6px) | `text-xs`, fg=`--muted-foreground` | 없음                           |
| `status` | 없음(투명)                       | —                 | `text-xs`, fg=`--muted-foreground` | `size-1.5`(6px) `rounded-full` |

`status` 의 점 색.

| status 값 | 점 색                | 근거                                 |
| --------- | -------------------- | ------------------------------------ |
| `진행 중` | `--ring`             | `entities/lab/ui/lab-card.tsx:22-23` |
| `멈춤`    | `--muted-foreground` | `entities/lab/ui/lab-card.tsx:24`    |
| `마무리`  | `--muted-foreground` | 같은 분기의 else 쪽                  |

**`멈춤` 과 `마무리` 를 색으로 가르지 마라.**
**이유:** `../tokens.md` 가 "강조색을 하나만 쓴다. 두 번째 색을 들이지 않는다" 를 정했다. 셋을 색으로
가르려면 색이 셋 필요하다. 지금은 "지금 움직이는가"(강조색) 와 "멈춰 있는가"(중립) 둘로만 가르고,
`멈춤` 과 `마무리` 의 차이는 옆에 붙은 글자가 말한다.

**`size` prop 을 두지 않는다.**
**이유:** 실측 네 자리의 칩이 전부 같은 크기다. 카드 안이든 상세 화면이든 태그의 무게가 같아야 한다.

**색을 직접 넘기는 prop(`color`, `tone`)을 두지 않는다.**
**이유:** 부르는 쪽이 색을 고를 수 있으면 토큰 밖의 값이 들어오고, 그 값은 [`../tokens.md`](../tokens.md) 에
남지 않는다. 색은 `variant` 와 `status` 가 정하고, 부르는 쪽이 고를 수 없다.

## states

| state         | 트리거   | 시각 변화                                                                                                                                                                   |
| ------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| default       | —        | `tag`: bg=`--muted`, fg=`--muted-foreground`, `rounded-sm`, `px-2 py-0.5`, `text-xs`. `status`: 점 `size-1.5 rounded-full` + 글자                                           |
| hover         | 없음     | 상호작용 요소가 아니다. 눌리지 않고 링크도 아니다 — 이유: 카드 안에 있을 때 카드 링크와 경쟁한다. 근거는 Card.md 의 `a11y:focus`                                            |
| focus-visible | 없음     | 포커스를 받지 않는다. `tabindex` 를 주지 마라                                                                                                                               |
| pressed       | 없음     | 누를 수 없다                                                                                                                                                                |
| disabled      | 없음     | 비활성 개념이 없다. 표시 전용이다                                                                                                                                           |
| loading       | 없음     | `tags` 와 `status` 가 MDX frontmatter 에서 오고 빌드 시점에 박힌다                                                                                                          |
| empty         | **있다** | `tags` 가 빈 배열이면 Badge 를 하나도 렌더하지 않는다. 자리 표시자·"태그 없음" 문구를 넣지 마라 — 이유: 없다는 사실이 정보가 아니다. `status` 는 타입상 필수라 빈 값이 없다 |
| error         | 없음     | 값의 집합이 `LAB_STATUSES` 로 닫혀 있어 모르는 값이 들어올 수 없다                                                                                                          |

**카드 안 태그는 3개까지만 보이고 나머지는 `+N` 이다.** `entities/case/ui/case-card.tsx:10-11,31` ·
`entities/lab/ui/lab-card.tsx:10-11,45`. 그 `+N` 은 Badge 가 아니라 그냥 글자다 — 면이 없다.
**상세 화면에서는 접지 않는다.** `views/case-detail.tsx:34` · `views/lab-detail.tsx:30` 이 전부 펼친다.
**이유:** 목록은 훑는 화면이라 높이를 맞춰야 하고, 상세는 끝까지 읽는 화면이라 감출 이유가 없다.

## a11y

- a11y:label — 해당 없음. 글자가 그대로 보이는 표시다. `aria-label` 을 붙이지 마라 — 이유: 보이는 글자와 읽히는 글자가 갈린다. 단 `status` 의 **점은 `aria-hidden` 이다** (`lab-card.tsx:20`, `lab-detail.tsx:20`) — 색만으로 말하는 장식이고 그 뜻은 옆 글자가 이미 말한다
- a11y:focus — 포커스 대상이 0개다. 포커스 순서에 끼어들지 않는다. 카드 안에 있을 때 카드 링크가 유일한 포커스 대상이고, Badge 는 그 링크의 접근 이름에서도 빠진다 ([`CaseCard.md`](CaseCard.md) 의 `a11y:label`)
- a11y:contrast — `tag`: fg=`--muted-foreground` / bg=`--muted` 라이트 4.91 · 다크 6.51 (`../tokens.md` 실측값, 4.5:1 통과). `status` 글자: fg=`--muted-foreground` / bg=`--card` 라이트 5.59 · 다크 7.34, bg=`--background` 라이트 5.28 · 다크 7.97. 점은 `aria-hidden` 이라 대비 대상이 아니다
- a11y:target — 해당 없음. 클릭 대상이 아니다. 24x24 규칙은 상호작용 요소에만 걸린다. 칩 실측 높이는 글자 12px + 세로 여백 4px = 16px 이고, 눌리지 않으므로 문제가 아니다
- a11y:role — 역할을 지정하지 않는다. `<span>` 이다. `status`·`img`·`note` 를 붙이지 마라 — 이유: `role="status"` 는 live region 이라 값이 바뀔 때마다 스크린리더가 읽는다. 이 배지는 바뀌지 않는다. 상세 화면에서 칩들은 `<ul role="list">` 안의 `<li>` 이고(`case-detail.tsx:33`, `lab-detail.tsx:29`) 그 역할은 목록 쪽이 갖는다

**색만으로 상태를 말하지 마라.** 점 옆에 상태 글자가 항상 함께 있다
(`lab-card.tsx:27-29`, `lab-detail.tsx:27`).

## responsive

- 모든 폭에서 동일한 크기다. 브레이크포인트 분기가 0건이다
- 칩이 여러 개일 때 `flex flex-wrap gap-2` 로 감싸 다음 줄로 넘긴다 — `case-card.tsx:24`, `lab-card.tsx:39`, `case-detail.tsx:33`, `lab-detail.tsx:29` 네 곳 모두 같다
- 칩 안에서 줄바꿈이 일어나지 않는다. 태그는 한 낱말이라 375px 에서도 한 칩이 한 줄을 넘지 않는다
- 상태 배지는 `flex items-center gap-2` 로 점과 글자를 붙인다 (`lab-card.tsx:18`, `lab-detail.tsx:18`). 점이 글자 세로 가운데에 온다

## 상호작용

- 없음. hover / focus-visible 대상이 아니다
