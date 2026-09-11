# 디자인 스펙 — handwork

포트폴리오 웹사이트. 화면 5개, 컴포넌트 12종이다.

**이 디렉터리가 handwork 디자인의 정본이다.** 값을 찾으려고 저장소의 다른 곳으로 나갈 일이 없다.
색의 실제 출처만 예외로 `apps/handwork/src/app/globals.css` 이고, 그 동기는
`node apps/handwork/scripts/check-contrast.mjs` 가 기계로 검사한다.

**디자인 자산이 앱 안에 있다.** 저장소 루트의 도구·규약과 무관하게 이 앱만 들고 나가도 성립한다.
그것이 여기 있는 이유다 — 디자인 값이 밖의 문서에 매여 있으면, 그 문서가 바뀔 때 화면이
바뀌었는지 아닌지 알 방법이 없다.

## 이 디렉터리의 문서

| 문서                         | 무엇                                                                                | 담당                          |
| ---------------------------- | ----------------------------------------------------------------------------------- | ----------------------------- |
| [`tokens.md`](tokens.md)     | **값 전부.** 색 · 랜딩 팔레트 · 형태 · 폭 · 간격 · 타이포 · 상태 · 고도 · 대비 검증 | `handwork-design-system`      |
| [`screens/`](screens/)       | 화면 5개의 구조 · 상태 · 접근성                                                     | `handwork-design-system`      |
| [`components/`](components/) | 컴포넌트 12종 스펙                                                                  | `handwork-design-system`      |
| [`adoption.md`](adoption.md) | 화면을 프리미티브로 바꾸는 순서. 파일:줄 · before/after                             | **`curvez-nextjs` 가 읽는다** |
| [`GOAL.md`](GOAL.md)         | 이번 시스템 작업의 실행 지시문과 게이트 3종                                         | 전원                          |
| `tokens.figma.json`          | `globals.css` 에서 생성한 W3C 토큰. **손으로 고치지 마라**                          | `handwork-ui` (스크립트)      |

## 화면

| screen-id                             | route(nextjs)   | 목표                                                  | 상태 |
| ------------------------------------- | --------------- | ----------------------------------------------------- | ---- |
| [home](screens/home.md)               | `/`             | 한 문장 포지셔닝을 읽히고 케이스 3건 중 하나로 보낸다 | 확정 |
| [case-index](screens/case-index.md)   | `/cases`        | 케이스 전체를 훑고 하나를 고른다                      | 확정 |
| [case-detail](screens/case-detail.md) | `/cases/[slug]` | 제약·선택·버린 것을 끝까지 읽힌다                     | 확정 |
| [lab-index](screens/lab-index.md)     | `/labs`         | 만든 것의 기록을 훑고 하나를 고른다                   | 확정 |
| [lab-detail](screens/lab-detail.md)   | `/labs/[slug]`  | 무엇을 만들었고 어디까지 왔는지 끝까지 읽힌다         | 확정 |

## 컴포넌트 — 12종

두 층이다. **프리미티브**는 도메인을 모르고, **화면 컴포넌트**는 그 위에 올라가 케이스·기록을 안다.

### 프리미티브 8종 — `apps/handwork/src/shared/ui/`

근거는 실측한 중복이다. 괄호 안은 같은 클래스 문자열이 반복된 횟수.

| 이름                                 | 근거 (실측)                                   | 구현                                                              |
| ------------------------------------ | --------------------------------------------- | ----------------------------------------------------------------- |
| [PageShell](components/PageShell.md) | 같은 클래스 문자열 **5회**                    | `shared/ui/page-shell.tsx`                                        |
| [PageTitle](components/PageTitle.md) | 목록형 **3회** + 상세형 **2회**               | `shared/ui/page-title.tsx`                                        |
| [Card](components/Card.md)           | 면 클래스 **2회**                             | `shared/ui/card.tsx`                                              |
| [Badge](components/Badge.md)         | 태그 칩 **4회** + 상태 배지 **2곳**           | `shared/ui/badge.tsx` — **`status` prop 이 `tone` 으로 바뀌었다** |
| [Button](components/Button.md)       | **0회.** `<button>` 은 ThemeToggle 하나뿐이다 | `shared/ui/button.tsx` — 화면에 쓰이는 자리는 아직 0곳            |
| [AppLink](components/AppLink.md)     | hover 강조색 **6곳**                          | `shared/ui/app-link.tsx`                                          |
| [Separator](components/Separator.md) | `border-t` **4회** (여백은 세 갈래)           | `shared/ui/separator.tsx`                                         |
| [Prose](components/Prose.md)         | 사용처 **2곳**, 클래스 동일                   | `shared/ui/prose.ts` — **`PROSE` 문자열과 한 파일에 있다**        |

굵은 글씨 둘은 스펙과 구현이 갈린 곳이다. 무엇이 왜 달라졌는지는
[`adoption.md`](adoption.md) 의 첫 절이 값으로 적었다.

### 화면 컴포넌트 4종 — `apps/handwork/src/entities/` · `widgets/` · `shared/ui/`

| 이름                                     | 쓰이는 화면       | 비고                                                                         |
| ---------------------------------------- | ----------------- | ---------------------------------------------------------------------------- |
| [CaseCard](components/CaseCard.md)       | home · case-index | [Card](components/Card.md) 위에 올라간다. 카드 전체가 링크 하나              |
| [LabCard](components/LabCard.md)         | lab-index         | CaseCard 와 같은 규칙 + [Badge](components/Badge.md) `variant="status"` 하나 |
| [SiteHeader](components/SiteHeader.md)   | 전 화면           | 로고(홈) + Cases + Labs + 테마 토글. 홈·서브가 같은 컴포넌트                 |
| [ThemeToggle](components/ThemeToggle.md) | 전 화면(헤더 안)  | 라이트·다크 전환. 화면에 존재하는 유일한 `<button>`                          |

**shadcn 전체 세트를 깔지 않는다.** 화면 5개짜리 사이트라 쓰이지 않는 컴포넌트는 스토리까지
따라와서 유지할 것만 늘리고 검증되지는 않는다. 필요해지면 `shadcn add` 로 받아
`src/shared/ui/` 에 두되, **받은 컴포넌트를 여기에 다시 스펙으로 적지 않는다** — 그 문서는
shadcn 쪽이 정본이고 사본은 낡는다. 이 프로젝트가 값을 바꾼 것만 스펙으로 남긴다
([`Button.md`](components/Button.md) 가 그 예다).

## 커버리지

### 스펙

| 항목                                                   | 값                                                            |
| ------------------------------------------------------ | ------------------------------------------------------------- |
| 화면                                                   | **5 / 5 확정**                                                |
| 컴포넌트                                               | **12 / 12 확정** (프리미티브 8 + 화면 4)                      |
| 필수 섹션 4종(`props`·`states`·`a11y`·`responsive`)    | 12 / 12 파일에 존재                                           |
| 접근성 5키(`label`·`focus`·`contrast`·`target`·`role`) | 12 / 12 파일에 존재                                           |
| 상태 4종(`default`·`loading`·`empty`·`error`)          | 존재. 불가능한 상태는 사유를 적었다                           |
| 라이트·다크                                            | 색 토큰 14종 전부 양쪽 정의. 중립 스케일은 브랜드 색조를 띤다 |
| 새로 만든 색 토큰                                      | **0건**                                                       |
| 지어낸 수치                                            | **0건.** 반복 횟수·줄 번호는 전부 grep 출력이다               |

### 토큰 축

| 축               | 상태                                                            |      실측 |
| ---------------- | --------------------------------------------------------------- | --------: |
| 색 · 랜딩 팔레트 | 확정 — 14종 + 브랜드 5종                                        | 동기 25건 |
| 형태(반경)       | 확정 — 3단계                                                    |         — |
| 폭               | 확정 — 2값                                                      |        13 |
| 간격             | 확정 — 12단계                                                   |        89 |
| 타이포           | 확정 — 크기 8 · 굵기 5 · 서체 2 · 자간 7 · 행간 3               |        58 |
| 상태             | 확정 — hover 3종 · focus 4조각 · active 1자리 · disabled 조합만 |        41 |
| 고도             | 확정 — **쓰지 않는다** + 이유 3가지                             |         0 |
| 대비 검증        | 20쌍(라이트 10 · 다크 10), 실패 0. 렌더 화면 실측               |        20 |

### 구현 쪽 진행

| 항목                                            | 누가                     | 상태                                                                                                     |
| ----------------------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------- |
| 프리미티브 8종 + ThemeToggle 을 `shared/ui/` 에 | `handwork-ui`            | **끝났다** — `apps/handwork/src/shared/ui/` 에 9개                                                       |
| 스토리                                          | `handwork-ui`            | **끝났다** — `*.stories.tsx` 11파일 (shared/ui 9 + entities 2)                                           |
| `tokens.figma.json` 내보내기                    | `handwork-ui`            | **끝났다** — `export-tokens.mjs --check` exit 0                                                          |
| G3 대비 + 토큰 동기                             | `handwork-ui`            | **끝났다** — 쌍 20건 · 토큰 hex 25건, 실패 0건 (직접 돌려 확인)                                          |
| G1 빌드 게이트                                  | `handwork-ui`            | 돌아간다고 보고받았다. **이 문서를 쓰면서 직접 돌리지는 않았다**                                         |
| 화면 이관 가이드                                | `handwork-design-system` | **끝났다** — [`adoption.md`](adoption.md)                                                                |
| **화면을 프리미티브로 이관**                    | **`curvez-nextjs`**      | **남았다.** 대상 26곳, 값이 바뀌는 곳 5곳. [`adoption.md`](adoption.md) 가 순서와 before/after 를 갖는다 |

### 확인 못 한 것 — 구현 시점에 실측해서 채운다

**추측으로 채우지 않았다.** 각 항목은 해당 스펙 안에 같은 문장으로 남아 있다.

| 항목                                                    | 어디에                                                       |
| ------------------------------------------------------- | ------------------------------------------------------------ |
| shadcn `base-nova` button 의 기본 높이·여백 원본 수치   | [`Button.md`](components/Button.md) `## 근거`                |
| `--primary/90`(hover) 과 `--primary-foreground` 의 대비 | [`Button.md`](components/Button.md) `## states`              |
| `--foreground` / `--muted`(인라인 코드·`pre`) 의 대비   | [`Prose.md`](components/Prose.md) `a11y:contrast`            |
| MDX 본문 링크의 포커스 링이 실제로 어떻게 그려지는가    | [`Prose.md`](components/Prose.md) `## states`                |
| 본문에 가로로 넘치는 코드 블록이 실제로 있는가          | [`Prose.md`](components/Prose.md) `a11y:focus`               |
| 랜딩 워드마크가 실제 사진 픽셀 위에서 갖는 대비         | [`adoption.md`](adoption.md) `## 렌더 화면에서 재야 하는 것` |

앞 셋은 재고 나면 [`tokens.md`](tokens.md) 의 대비 검증 목록에 줄을 더해야 끝난다.
`node apps/handwork/scripts/check-contrast.mjs` 가 그 줄을 파싱하므로 형식을 바꾸지 마라.

## 이 스펙이 전제하는 것

- **콘텐츠는 레포 안 MDX 다.** 케이스와 기록 본문은 `content/cases` · `content/labs` 에 있고
  빌드 시점에 정적으로 박힌다. 그래서 랜딩을 뺀 네 화면 모두 런타임 로딩·에러 상태가 없고,
  각 화면의 `state:loading` / `state:error` 줄과 컴포넌트 12종의 `loading` 행에 그 사유를 적었다
- **랜딩만 예외다.** 배경을 방문마다 뽑느라 `force-dynamic` 이라, 요청마다 서버에서 렌더한다
- **랜딩은 프리미티브를 쓰지 않는다.** `views/home.tsx` 는 `PageShell` 도 `PageTitle` 도 쓰지 않는다.
  배경 사진 한 장과 워드마크뿐이고, 그 색은 `--brand-mark`·`--brand-overlay-ink` 라 `.dark` 에서
  뒤집히지 않는다(`apps/handwork/src/app/globals.css` 66-70행 부근)
- **다크 모드는 클래스 토글이고 UI 가 헤더에 있다.** shadcn 이 깔아 둔 `.dark` 블록을 `next-themes` 로
  전환한다. 모든 상태 값이 라이트·다크 양쪽에서 같은 토큰 이름을 쓰고, 스펙에 라이트 전용 값이 0건이다
- **비동기 동작이 0건이다.** 폼·서버 액션·클라이언트 페칭이 없어 `loading` 과 `error` 를 값으로
  정할 근거가 없다. 지어내지 않고 사유를 적었다

## 1차 케이스 3건

주제는 사용자가 말한 소재에서 왔다. 제목·본문은 쓰면서 확정한다.

| slug                         | 다룰 것                                                                                  |
| ---------------------------- | ---------------------------------------------------------------------------------------- |
| `token-store-race-condition` | multi-audience 토큰 스토어의 레이스 컨디션. 무엇이 겹쳐 터졌고 어떤 잠금·순서로 막았는가 |
| `middleware-proxy-split`     | Middleware 와 Proxy 를 나눈 판단. 무엇을 어느 쪽에 두었고 왜 반대로 하지 않았는가        |
| `shared-sdk-design`          | 여러 서비스가 가져다 쓰는 SDK 설계. 공개 표면을 어디서 끊었고 무엇을 감췄는가            |

## 미결 질문

| #   | 질문                                                     | 누가 답하나 | 막고 있는 것                                                                 |
| --- | -------------------------------------------------------- | ----------- | ---------------------------------------------------------------------------- |
| 1   | 연락용 이메일 주소를 공개할 것인가, 한다면 어느 주소인가 | 사용자      | home 의 contact 링크 하나. GitHub 링크는 확정이라 영역 자체는 구현할 수 있다 |

**개인 이메일을 공개 저장소의 스펙에 대신 적어 넣지 않는다.**
**이유:** 한 번 커밋되면 이력에 남아 지워도 남는다. 공개 여부는 값을 아는 쪽이 결정할 일이지
스펙이 추론할 일이 아니다.
