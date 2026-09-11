# GOAL — handwork 디자인 시스템

handwork 의 **토큰 · 컴포넌트 · 스토리북**을 한 벌로 묶고, 그것을 만들고 유지하는
**담당자 2명과 절차 2벌**을 저장소 루트 `.claude/` 에 남긴다.

이 문서는 실행 지시문이다. 값이 갈리면 여기가 정본이고, 여기에 없는 값은 지어내지 않고 묻는다.

**디자인 값은 이 디렉터리 안에서 끝난다.** 색·간격·타이포·상태·고도·대비는 전부
[`tokens.md`](tokens.md) 에 있고, 밖의 문서를 정본으로 가리키지 않는다.
**남아 있는 저장소 루트 참조는 오케스트레이션 도구뿐이다** — 아래 3·4·9절의
`plugins/curvez/scripts/*.mjs`(에이전트·스킬 스캐폴드, `doctor.mjs`)와 `.curvez/team.md`(소유권 선언).
그것들은 값이 아니라 팀을 돌리는 절차라 그대로 쓴다. **디자인 값을 그쪽에서 가져오지 마라.**

---

## 1. 확정 사항 — 인터뷰와 실측으로 정해진 것

| 항목            | 값                                                | 근거                                                                                |
| --------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 팀 규모         | 에이전트 2 + 스킬 2                               | 사용자 결정. `extending.md` 의 "하나만" 에서 한 칸만 늘렸다                         |
| 규약 파일 위치  | 저장소 루트 `.claude/agents/` · `.claude/skills/` | `doctor.mjs` · `new-agent.mjs` · `new-skill.mjs` 가 `process.cwd()/.claude` 만 본다 |
| 코드 위치       | `apps/handwork/src/shared/ui/`                    | `packages/README.md` — "앱 하나만 쓰는 코드는 그 앱 안에 둔다"                      |
| 산출물 위치     | `apps/handwork/design/`                           | 디자인 자산은 앱 안에 둔다. 담당은 `handwork-design-system` 이다                    |
| 스토리 범위     | `shared/ui/` + `entities/*/ui/`                   | 이 둘만 서버 의존이 없다. Storybook 의 RSC 지원은 experimental 이다                 |
| 컴포넌트 범위   | 9종 (5절)                                         | 실측한 중복에서 추출 + 필수 프리미티브                                              |
| Figma           | **범위 밖.** 내보내기 파일까지만 만든다           | REST API 로 컴포넌트 생성이 불가능하고, Variables 는 Enterprise 전용이다            |
| 검증            | 로컬 게이트 3종 (8절)                             | 외부 서비스·계정 0개로 전부 돌아간다                                                |
| 에이전트 prefix | `handwork-`                                       | 검증기가 프로젝트 prefix 를 강제하지 않는다. 사람이 지킨다                          |

## 2. 조사로 확정된 외부 사실

**출처를 확인한 것만 적었다. 확인하지 못한 것은 12절에 있다.**

### Storybook — Next 16 을 공식 지원한다

`@storybook/nextjs-vite@10.6.0` 의 peerDependencies 가 근거다.

```
next: '^14.1.0 || ^15.0.0 || ^16.0.0'
react: '... || ^19.0.0'
vite: '^5.0.0 || ^6.0.0 || ^7.0.0 || ^8.0.0'
storybook: '^10.6.0'
```

- **문서 페이지는 낡았다.** `storybook.js.org` 의 nextjs-vite 페이지는 아직 "Next.js ≥ 14.1" 만 적고 있다. peer 범위가 정본이다
- **`vite` 가 필수 peer 인데 handwork 에 없다.** 설치 목록에 넣는다
- **RSC 는 experimental 이라고 문서가 명시한다.** 그래서 스토리 범위를 `shared/ui` 와 `entities/*/ui` 로 잠갔다
- Node 24 가 필요할 수 있다. 현재 `v24.19.0` 이라 충족한다 — Node 20 에서 `react-remove-scroll is not in cache` 로 깨진 사례가 이슈에 있다

### Figma — 컴포넌트를 코드에서 만들 수 없다

| 하려는 것       | REST API                                | Plugin API                      | Figma MCP (write to canvas) |
| --------------- | --------------------------------------- | ------------------------------- | --------------------------- |
| 컴포넌트 생성   | **불가.** 노드 쓰기 자체가 없다         | 가능                            | 가능                        |
| 변수(토큰) 쓰기 | 가능하나 **Enterprise org + Full seat** | 가능                            | 가능                        |
| 전제            | Enterprise 플랜                         | Figma 안에서 도는 플러그인 제작 | **유료 플랜 + Full seat**   |

**그래서 이번 범위는 내보내기까지다.** W3C Design Tokens JSON 을 만들어 두고, Figma 쪽으로
넘기는 것은 사람이 Tokens Studio 같은 플러그인으로 한다. 이 세션에 Figma MCP 는 연결돼 있지 않다.

---

## 3. 에이전트 2종

`node plugins/curvez/scripts/new-agent.mjs <name> --model <값>` 으로 스캐폴드한다.
출력은 기본값인 `.claude/agents/` 다 — `--dir` 을 붙이지 않는다.

### 3.1 `handwork-design-system` (opus)

**owns:** `apps/handwork/design/`

값을 확정하는 담당이다. 코드를 쓰지 않는다.

- 기존 `tokens.md` 위에 **부족한 축**(간격·타이포 스케일·상태·고도)을 얹는다. 색은 이미 확정돼 있으므로 건드리지 않는다
- 컴포넌트 9종의 스펙을 props · variants · states · a11y 로 확정한다
- 실사이트 적용 가이드를 쓴다 — "어느 화면의 어느 줄을 무엇으로 바꾸는가" 를 경로와 함께
- **새 색을 만들지 않는다.** 값의 정본 순위는 `apps/handwork/design/tokens.md` > `globals.css` 다.
  둘이 어긋나면 CSS 가 이기고, 그 어긋남은 `check-contrast.mjs` 의 동기 검사가 잡는다

### 3.2 `handwork-ui` (sonnet)

**owns:** `apps/handwork/src/shared/ui/` · `apps/handwork/.storybook/` ·
`apps/handwork/src/**/*.stories.tsx` · `apps/handwork/scripts/`

확정된 스펙을 코드로 옮기고 게이트를 실제로 돌린다.

- `shared/ui/` 에 컴포넌트를 구현한다. shadcn 은 `base-nova` 스타일 + `@base-ui/react` 다 (Radix 가 아니다)
- 스토리를 쓰고 `build-storybook` 을 통과시킨다
- 토큰 내보내기 스크립트를 만든다
- 화면 코드(`views/` · `widgets/`)를 **직접 고치지 않는다.** 적용은 `curvez-nextjs` 가 가이드를 받아서 한다

### 3.3 소유권 충돌 — 팀 편성 시점에 선언한다

**`curvez-nextjs` 는 `${paths.web}` = `apps/handwork` 전체를 소유한다.** `handwork-ui` 의
소유 경로가 그 안에 있으므로 정면으로 겹친다. 병렬로 돌리면 나중에 쓴 쪽이 앞선 쪽을 조용히 지운다.

**코어 에이전트 정의를 고치지 않는다.** 고치면 이 플러그인을 쓰는 다른 프로젝트의 팀 편성이
아무도 요청하지 않았는데 달라진다.

**대신 `.curvez/team.md` 에 이 프로젝트의 예외로 박는다.** `extending.md` 4단계가 정한 방식이다.

```
이 프로젝트에서 apps/handwork/src/shared/ui/ · .storybook/ · **/*.stories.tsx ·
scripts/ 는 handwork-ui 가 소유한다. curvez-nextjs 는 그 경로를 쓰지 않는다.
```

**바꿀 때 고칠 위치:** `.curvez/team.md` 한 곳. `team.md` 는 `curvez-orchestrator` 소유다.

---

## 4. 스킬 2종

`node plugins/curvez/scripts/new-skill.mjs <name>` 으로 스캐폴드한다. 출력은 `.claude/skills/` 다.
**prefix 를 붙이지 않는다** — 프로젝트 스킬도 디렉터리명이 곧 이름이다.

| 스킬            | 주 사용자                | 하는 일                                                           |
| --------------- | ------------------------ | ----------------------------------------------------------------- |
| `design-system` | `handwork-design-system` | 토큰 축 확장 · 컴포넌트 스펙 확정 · 적용 가이드 작성 절차         |
| `storybook`     | `handwork-ui`            | 스토리 작성 · 다크모드 데코레이터 · `build-storybook` 게이트 절차 |

### 경계는 한쪽에만 그어진다 — 알고 넘어간다

`design-system` 의 `## 언제 쓰지 않는가` 에 트리거가 겹치는 코어 스킬을 이름으로 적는다.
**반대 방향은 적지 않는다.**

**이유:** 코어 스킬이 특정 프로젝트의 스킬 이름을 알면 안 된다. 다른 프로젝트에는 없는 이름을
가리키게 된다. `extending.md` 는 "양쪽에 적어야 경계가 닫힌다" 고 말하지만, 코어-프로젝트
방향에서는 그 규칙을 지킬 수 없다. **경계가 반쪽인 것을 인정하고, 트리거가 실제로 겹치는지
만든 뒤에 확인한다** (9절 2단계).

---

## 5. 만들 컴포넌트 9종

**실측한 중복에서 뽑았다.** 괄호 안은 현재 저장소에서 같은 클래스 문자열이 반복된 횟수다.

| #   | 이름          | 근거                                                                                   |
| --- | ------------- | -------------------------------------------------------------------------------------- |
| 1   | `PageShell`   | `max-w-5xl flex-1 px-5 py-10 md:px-8 md:py-16` **5회 중복**                            |
| 2   | `PageTitle`   | `text-4xl font-bold tracking-[-0.02em]` **3회** + 변형 2회. 제목 + 설명 문단이 한 벌   |
| 3   | `Card`        | 카드 면 클래스 **2회** (CaseCard · LabCard 가 이것 위에 올라간다)                      |
| 4   | `Badge`       | lab 의 `status`, case 의 태그 칩                                                       |
| 5   | `Button`      | 화면에 아직 없다. `shadcn add button` 으로 받아 토큰만 맞춘다                          |
| 6   | `AppLink`     | hover·focus 를 `--brand-accent` 하나로 모으는 자리. tokens.md 의 "강조색 하나" 를 강제 |
| 7   | `Separator`   | `border-t` + 여백 조합 반복                                                            |
| 8   | `Prose`       | 기존 `shared/ui/prose.ts` 를 시스템에 편입                                             |
| 9   | `ThemeToggle` | 기존 `shared/ui/theme-toggle.tsx` 를 시스템에 편입                                     |

**shadcn 전체 세트를 깔지 않는다.** handwork 는 화면 5개짜리 사이트다. 쓰이지 않는 컴포넌트는
스토리까지 따라와서, 유지할 것만 늘리고 검증되지는 않는다.

---

## 6. 스토리북 구성

```
apps/handwork/.storybook/main.ts       # framework: @storybook/nextjs-vite
apps/handwork/.storybook/preview.ts    # ../src/app/globals.css 를 import 한다
```

- 설치: `storybook@^10.6` · `@storybook/nextjs-vite@^10.6` · `@storybook/addon-themes@^10.6` · `vite`
- 다크모드: `addon-themes` 의 클래스 데코레이터로 `.dark` 를 토글한다. `next-themes` 를 스토리북에
  띄우지 않는다 — 프로바이더가 하나 더 생기면 실제 앱과 다른 경로로 테마가 걸린다
- 스토리는 컴포넌트 파일 옆에 둔다 (`shared/ui/card.tsx` ↔ `shared/ui/card.stories.tsx`)
- **`views/` 와 `app/` 은 올리지 않는다.** 서버 컴포넌트다

---

## 7. 토큰 내보내기 — Figma 로 가는 유일한 경로

`apps/handwork/scripts/export-tokens.mjs` 를 만든다.

- 입력: `apps/handwork/src/app/globals.css` (값의 정본)
- 출력: `apps/handwork/design/tokens.figma.json` (W3C Design Tokens 형식)
- 라이트·다크를 두 모드로 낸다

**`tokens.md` 를 입력으로 쓰지 않는다.** 그 문서는 스스로 "정본은 globals.css 다. 값이 갈리면
CSS 가 이긴다" 고 적어 뒀다. 사본을 입력으로 삼으면 내보낸 값이 조용히 낡는다.

---

## 8. 검증 — 게이트 3종

**전부 실행 가능한 명령이다.** `extending.md` 가 명시한다 — 실행 가능한 명령이 없는 에이전트는
원리적으로 `status: done` 을 낼 수 없다.

### G1. 빌드 게이트

```bash
pnpm typecheck && pnpm lint && pnpm build
pnpm --filter handwork exec storybook build --output-dir /tmp/sb-out
```

네 개 모두 exit 0.

### G2. 토큰 밖 하드코딩 색값

```bash
grep -rnE '#[0-9a-fA-F]{3,8}\b|rgba?\(|oklch\(' apps/handwork/src \
  --include='*.tsx' --include='*.ts' | grep -v 'globals.css'
```

**지금 7건이다. 전부 `src/views/home.tsx` 다** (11절 참조). 이 게이트의 통과 기준은
"0건" 이 아니라 **"`shared/ui/` 와 `entities/*/ui/` 안에서 0건"** 으로 시작한다.
랜딩을 언제 정리할지는 11절의 결정에 달렸다.

### G3. 대비 검사

`apps/handwork/scripts/check-contrast.mjs` 를 만든다. `globals.css` 의 토큰 쌍을 읽어
WCAG AA(본문 4.5:1, disabled 3:1)를 계산하고 실패 건수를 낸다. 실패 0건.

**기존 20쌍 검증이 이미 통과한 상태다**(`tokens.md`). 새로 추가하는 축에서만 새 쌍이 생긴다.

### 미실행으로 남기는 것

- **시각 회귀 없음.** Chromatic 을 쓰지 않기로 했다. 픽셀 단위 변화는 이 게이트로 안 잡힌다
- **a11y 자동 검사 없음.** axe 를 붙이지 않았다. 접근성은 스펙 단계에서 값으로 정하고 사람이 본다
- **테스트 없음.** `profile.json` 의 `commands` 에 `test` 가 없다

---

## 9. 실행 순서

각 단계에 **무엇으로 확인하는지**를 붙였다. 확인이 안 되면 다음으로 넘어가지 않는다.

1. **규약 파일 스캐폴드** — 에이전트 2 + 스킬 2 를 만들고 TODO 를 전부 채운다
   → 검증: `node plugins/curvez/scripts/doctor.mjs` exit 0. 에이전트 14/14 · 스킬 18/18
2. **트리거 겹침 대조** — 새 스킬의 트리거로 코어 스킬을 훑는다
   → 검증: `grep -rn "디자인\|토큰\|스토리북" plugins/curvez/skills .claude/skills --include='SKILL.md'`
   출력을 눈으로 읽고, 겹치면 프로젝트 스킬 쪽 `## 언제 쓰지 않는가` 에 적는다
3. **소유권 선언** — `.curvez/team.md` 에 3.3 의 예외를 박는다
   → 검증: `grep -n "handwork-ui" .curvez/team.md` 가 1건 이상
4. **토큰 축 확장** — 간격·타이포·상태·고도를 `apps/handwork/design/tokens.md` 에 값으로 적는다
   → 검증: G3 실패 0건
5. **컴포넌트 스펙 9종** — `apps/handwork/design/components/` 에 하나씩
   → 검증: 9개 파일 각각에 props · variants · states · a11y 네 섹션이 있다
6. **스토리북 설치** — 6절의 패키지를 넣고 `main.ts` · `preview.ts` 를 쓴다
   → 검증: `storybook build` exit 0. 이 시점의 스토리는 0개여도 된다
7. **컴포넌트 구현 + 스토리** — 9종을 `shared/ui/` 에 쓰고 스토리를 붙인다
   → 검증: G1 · G2(`shared/ui` 범위) · G3 전부 통과
8. **기존 화면 마이그레이션 가이드** — `apps/handwork/design/adoption.md`
   → 검증: 가이드의 모든 항목이 `파일:줄` 형식으로 현재 코드를 가리킨다
9. **토큰 내보내기** — 7절 스크립트
   → 검증: 출력 JSON 이 라이트·다크 두 모드를 갖고, 색 토큰 수가 `globals.css` 와 같다

**6번을 4·5번보다 먼저 하지 않는다.** 스펙 없이 스토리북을 깔면 무엇을 담을지 모르는 채로
설정만 남고, 그 설정이 맞는지 판정할 대상이 없다.

---

## 10. 완료 기준

- [ ] `doctor.mjs` exit 0. 에이전트·스킬의 TODO 잔여 **0건**
- [ ] 컴포넌트 9종이 `shared/ui/` 에 있고 각각 스토리가 하나 이상
- [ ] G1 · G2 · G3 전부 통과. 수치를 핸드오프 `verification[]` 에 원문으로 남긴다
- [ ] `adoption.md` 의 항목이 전부 `파일:줄` 을 가리킨다
- [ ] `tokens.figma.json` 이 라이트·다크 두 모드를 갖는다
- [ ] `.curvez/team.md` 에 소유권 예외가 적혀 있다
- [ ] 새로 만든 색 토큰 **0건** — 기존 토큰만 쓴다

---

## 11. 지금 어긋나 있는 것 — 실측

디자인 시스템을 만들기 전에 **판정이 필요한 것 둘**이다. 지금 답을 정하지 않아도 되지만,
4단계(토큰 축 확장)에 들어가기 전에는 정해야 한다.

### 랜딩의 하드코딩 색 7건

`src/views/home.tsx` 에 있다.

- `ground` 5개 (`#17928e` `#144946` `#3ca89e` `#85c7bf` `#9eddcb`) — 배경 이미지 5장 각각의
  지배색이다. 이미지에 묶인 값이라 토큰으로 올릴 성격이 아닐 수 있다
- `text-[#101514]` — `--brand-canvas` 의 다크 값과 같다. 토큰을 쓰지 않고 같은 값을 다시 적었다
- `text-[#ff6b4a]` — **코랄이다**

### 코랄은 tokens.md 와 정면으로 부딪힌다

`tokens.md` 는 이렇게 적혀 있다.

> **강조색을 하나만 쓴다.** 두 번째 색을 들이지 않는다.
> **이유:** 이 스타일이 성립하는 근거가 색 대비가 아니라 형태 대비(면·줄·원)다.

그런데 워드마크의 `w` 는 코랄(`#ff6b4a`)이고, `mark-field.svg` 의 설명에도 "가운데 하나만
코랄이다" 가 있다. **문서가 금지한 것을 화면이 하고 있다.**

셋 중 하나를 골라야 한다.

1. 코랄을 **랜딩 전용 두 번째 강조색으로 토큰화**하고 `tokens.md` 의 "하나만" 규칙에 예외를 적는다
2. 코랄을 **없앤다.** 워드마크를 단색으로 돌린다
3. **지금 상태를 유지하고 게이트에서 `views/` 를 제외한다.** 문서와 화면의 어긋남은 남는다

**권고: 1번.** 이미 두 자리(워드마크·SVG)에서 의도적으로 쓰이고 있어 사고가 아니다.
규칙이 현실과 맞지 않으면 우회하지 말고 규칙을 고친다.
**바꿀 때 고칠 위치:** `apps/handwork/design/tokens.md` 의 `## 랜딩 팔레트` 와
`apps/handwork/src/app/globals.css` 의 `--brand-*` 블록 두 곳.

---

## 12. 미확정 · 위험

확인하지 못한 것을 그대로 적는다.

| 항목                                           | 상태                                                                                                                                                       |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tailwind v4 + Storybook 10                     | **확인 불가.** Storybook 문서에 Tailwind v4 언급이 없다. `preview.ts` 에서 `globals.css` 를 import 하는 통상 방식으로 시도하고, 안 되면 그 사실을 보고한다 |
| `@base-ui/react` + Storybook                   | **확인 불가.** shadcn `base-nova` 는 Radix 가 아니라 Base UI 를 쓴다. 스토리북 사례를 찾지 못했다                                                          |
| `shadcn add` 가 base-nova 로 실제로 받아지는가 | **확인 불가.** `shared/ui/` 에 shadcn 프리미티브가 0개라 한 번도 받아본 적이 없다                                                                          |
| 프로젝트 `.claude/agents/` 를 로더가 읽는가    | **확인 불가.** `extending.md` 가 "설치했을 때 로더가 인식하는지는 검증되지 않았다" 고 적어 뒀다                                                            |
| 스토리북을 `pnpm lint` 대상에서 뺄 것인가      | 미정. `.storybook/` 과 `*.stories.tsx` 가 기존 eslint flat config 에 걸리는지 6단계에서 확인한다                                                           |

**이 표의 항목은 만들면서 답이 나온다. 지금 추측으로 채우지 않는다.**
