# component: PageTitle

purpose: 화면 제목 h1 과 그 아래 설명 문단을 한 벌로 낸다. 한 화면에 하나만 둔다

## 근거 — 화면에 3번 + 변형 2번

### 목록형 3회 — `text-4xl font-bold tracking-[-0.02em]`

| 파일                                     | 줄  | 제목                         |
| ---------------------------------------- | --- | ---------------------------- |
| `apps/handwork/src/views/case-index.tsx` | 9   | `케이스`                     |
| `apps/handwork/src/views/lab-index.tsx`  | 7   | `Labs`                       |
| `apps/handwork/src/app/not-found.tsx`    | 11  | `찾을 수 없는 케이스입니다.` |

재현: `grep -rn 'text-4xl font-bold tracking-\[-0\.02em\]' apps/handwork/src --include='*.tsx'` → 3줄.

### 상세형 2회 — 위에 `leading-[1.15]` 와 `break-keep` 이 더 붙는다

| 파일                                      | 줄  | 클래스                                                            |
| ----------------------------------------- | --- | ----------------------------------------------------------------- |
| `apps/handwork/src/views/case-detail.tsx` | 26  | `text-4xl leading-[1.15] font-bold tracking-[-0.02em] break-keep` |
| `apps/handwork/src/views/lab-detail.tsx`  | 14  | `text-4xl leading-[1.15] font-bold tracking-[-0.02em] break-keep` |

재현: `grep -rn 'text-4xl' apps/handwork/src --include='*.tsx'` → 5줄 (목록형 3 + 상세형 2).

### 제목 + 설명이 한 벌로 반복된다

| 파일                                     | 제목 줄 | 설명 줄 | 설명 클래스                                                          |
| ---------------------------------------- | ------- | ------- | -------------------------------------------------------------------- |
| `apps/handwork/src/views/case-index.tsx` | 9       | 10      | `mt-3 max-w-[65ch] leading-relaxed break-keep text-muted-foreground` |
| `apps/handwork/src/views/lab-index.tsx`  | 7       | 8       | `mt-3 max-w-[60ch] leading-relaxed break-keep text-muted-foreground` |
| `apps/handwork/src/app/not-found.tsx`    | 11      | 14      | `mt-3 text-muted-foreground`                                         |

**설명 폭을 `max-w-[65ch]` 하나로 통일한다.** 화면에는 65ch · 60ch · 폭 없음 셋이 있었다.
**이유:** 셋 다 "제목 밑의 한 문단" 으로 같은 의미다. 값이 다른데 의미가 같으면 나누지 않는다
([`../tokens.md`](../tokens.md) 머리의 토큰 판정표). 65ch 를 고르는 근거는 최다 사용이 아니라 [`../tokens.md`](../tokens.md) 의
본문 폭 `max-w-[68ch]` 에 가장 가깝다는 것이다 — 같은 화면에서 두 문단의 줄바꿈 지점이 크게 다르면
설명과 본문이 다른 문서로 읽힌다.
**바꿀 때 고칠 위치:** `views/lab-index.tsx:8` 의 `max-w-[60ch]` 와 `app/not-found.tsx:14` 의 폭 없음,
두 곳.

## props

| 이름        | 타입                | 필수 | 기본값  | 의미                                                   |
| ----------- | ------------------- | ---- | ------- | ------------------------------------------------------ |
| children    | `string`            | O    | —       | 제목 원문. 마크업이 아니라 문자열만 받는다             |
| description | `React.ReactNode`   | X    | 없음    | 설명 문단. 주면 제목 아래 12px(`mt-3`) 간격으로 붙는다 |
| variant     | `index` \| `detail` | X    | `index` | `index`=목록·오류 화면(3회), `detail`=상세 화면(2회)   |

`variant` 가 바꾸는 것은 두 가지뿐이다.

| variant  | 추가 클래스                 | 근거                                                                     |
| -------- | --------------------------- | ------------------------------------------------------------------------ |
| `index`  | 없음                        | 제목이 한 줄로 끝난다. 행간이 화면에 드러나지 않는다                     |
| `detail` | `leading-[1.15] break-keep` | 제목이 MDX 에서 오는 문장이라 두 줄 이상이 된다. 한글 어절을 끊지 않는다 |

**`variant` 를 셋 이상으로 늘리지 마라.**
**이유:** 화면에 두 형태뿐이었다. 세 번째를 만들면 어느 화면이 어느 형태인지 화면을 열어 봐야 안다.

**`level` prop 을 두지 않는다. 항상 `<h1>` 이다.**
**이유:** 한 화면에 h1 은 하나다. 레벨을 고를 수 있게 하면 h1 이 둘이거나 없는 화면이 생기고,
그것은 스크린리더의 문서 개요를 망가뜨린다. h2·h3 는 본문 안에 있고 `Prose` 가 맡는다.

## states

| state         | 트리거 | 시각 변화                                                                                                                                           |
| ------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| default       | —      | 제목 `text-4xl font-bold tracking-[-0.02em]`, fg=`--foreground`(상속). 설명 `mt-3 max-w-[65ch] leading-relaxed break-keep`, fg=`--muted-foreground` |
| hover         | 없음   | 텍스트다. 포인터에 반응하지 않는다                                                                                                                  |
| focus-visible | 없음   | 포커스를 받지 않는다. `tabindex` 를 주지 마라                                                                                                       |
| pressed       | 없음   | 누를 수 없다                                                                                                                                        |
| disabled      | 없음   | 비활성 개념이 없다                                                                                                                                  |
| loading       | 없음   | 제목은 빌드 시점에 확정된다. 스켈레톤을 만들지 않는다 — 랜딩을 뺀 네 화면이 정적 생성이다                                                           |
| empty         | 없음   | `children` 이 필수라 빈 제목이 나올 수 없다. 목록이 비었을 때도 제목은 그대로 남는다 (`case-index.tsx:9` 는 목록이 0건일 때도 렌더된다)             |
| error         | 없음   | 오류 화면에도 이 컴포넌트가 쓰인다(`not-found.tsx:11`). 자기 오류 상태를 갖지 않는다                                                                |

## a11y

- a11y:label — 해당 없음. 텍스트 제목이라 접근 이름이 곧 `children` 이다. `aria-label` 을 중복 지정하지 마라 — 이유: 보이는 글자와 읽히는 글자가 달라진다
- a11y:focus — 포커스 대상이 0개다. 포커스 순서에 끼어들지 않는다. 화면의 첫 포커스 대상은 헤더이고 그 다음이 본문 안의 링크다
- a11y:contrast — 제목 fg=`--foreground` / bg=`--background` 라이트 15.82 · 다크 16.13. 설명 fg=`--muted-foreground` / bg=`--background` 라이트 5.28 · 다크 7.97. `../tokens.md` 의 대비값이고 둘 다 4.5:1 을 넘는다
- a11y:target — 해당 없음. 클릭 대상이 아니다
- a11y:role — `heading` level 1 (`<h1>` 의 암묵 역할). `role="heading" aria-level` 을 손으로 쓰지 마라 — 이유: 요소가 이미 그 역할을 가지고, 손으로 쓰면 레벨이 어긋날 수 있다. 설명 문단은 `<p>` 이고 역할을 지정하지 않는다

## responsive

- **모든 폭에서 `text-4xl`(36px) 고정.** `../tokens.md`: "h1 은 어느 화면에서도 `text-4xl` 이다"
- 375px 에서 목록형 제목 3개(`케이스` · `Labs` · `찾을 수 없는 케이스입니다.`)가 전부 한 줄에 들어간다. 상세형만 두 줄 이상이 되고 그때 `leading-[1.15]` 가 줄 간격을 좁힌다
- 설명 문단은 `max-w-[65ch]` 가 상한이라 1024px 화면에서도 폭이 더 늘지 않는다. 좁은 화면에서는 `PageShell` 의 좌우 여백까지 채운다
- 크기 분기(`md:text-5xl` 같은 것)를 넣지 마라 — 이유: 화면에 0번 나오고, `../tokens.md` 가 h1 을 한 단계로 못박았다. 유일한 예외인 랜딩 워드마크는 제목이 아니라 브랜드 마크이고 `views/home.tsx:103` 의 `clamp()` 를 쓴다

## 상호작용

- 없음. hover / focus-visible 대상이 아니다
