# GOAL — scopulusUI

handwork 안에 있던 컴포넌트를 **독립 라이브러리 `@scopulus/ui`** 로 뽑고, 그것을 보여주는
**문서 사이트를 GitHub Pages 에 올린다.** handwork 는 그 사이트를 Labs 글 하나로 링크한다.

이 문서는 실행 지시문이다. 값이 서로 다르면 여기가 정본이고 여기에 없는 값은 지어내지 않고 묻는다.

---

## 1. 확정 사항

| 항목          | 값                                                               | 근거                                                                   |
| ------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 라이브러리    | `packages/scopulus-ui/` · 패키지명 **`@scopulus/ui`**            | 사용처가 둘이 된다. `packages/README.md` 의 "두 번째 사용처" 조건 충족 |
| 문서 사이트   | `apps/scopulus-ui/`                                              | 사용자 결정. 앱 이름이 scopulusUI 다                                   |
| 사이트 스택   | Next.js App Router + `@next/mdx` + **static export**             | handwork 와 같은 스택. `profile.json` 의 `stack` 이 `nextjs` 다        |
| 컴포넌트 수   | **20종** (기존 9 + 신규 11)                                      | 포트폴리오 규모. 60종은 검증되지 않은 것이 대량으로 남는다             |
| 디자인 스펙   | 컴포넌트 스펙 + `tokens.md` 만 패키지로. 화면 스펙은 handwork 에 | 각자 쓰는 것을 각자 갖는다                                             |
| 스토리북      | `packages/scopulus-ui/.storybook/` 으로 이동                     | 스토리·테스트·play 가 컴포넌트 옆에 붙어 있어야 한다                   |
| 버전          | `CHANGELOG.md` **수기** (Keep a Changelog 형식)                  | changesets 는 도구가 하나 더 는다. npm 발행을 안 하므로 값어치가 작다  |
| 배포          | 같은 저장소 GitHub Pages → `knut15.github.io/curvez/`            | 사용자 결정                                                            |
| handwork 링크 | **Labs 글 하나**                                                 | Labs 가 이미 "만든 것의 기록" 으로 정의돼 있다                         |

## 2. 지금 상태

```
컴포넌트 구현    10개   apps/handwork/src/shared/ui/
스토리 파일      11개   shared 9 + entities 2
컴포넌트 스펙    12개   apps/handwork/design/components/
화면 스펙         5개   apps/handwork/design/screens/
스토리           35개   테스트 35개 전부 통과
대비 검증        쌍 20건 + 토큰 hex 동기 25건, 실패 0
```

**handwork 화면이 아직 프리미티브를 쓰지 않는다.** 실제 import 는 셋뿐이다.

| 파일                                                         | import          |
| ------------------------------------------------------------ | --------------- |
| `src/app/layout.tsx:6`                                       | `ThemeProvider` |
| `src/widgets/site-header.tsx:3`                              | `ThemeToggle`   |
| `src/views/case-detail.tsx:4` · `src/views/lab-detail.tsx:2` | `PROSE`         |

나머지 7종(Button · Card · Badge · AppLink · Separator · PageShell · PageTitle)은 만들어만 두고
화면에 붙이지 않았다. `apps/handwork/design/adoption.md` 의 이관 대상 26곳이 그 작업이다.

**그래서 지금 옮기는 비용이 가장 싸다.** 화면 코드를 고칠 것이 사실상 없다.

## 3. 조사로 확정된 외부 사실

**출처를 확인한 것만 적었다. 확인하지 못한 것은 13절에 있다.**

### GitHub Pages

- **아직 켜져 있지 않다.** `gh api repos/knut15/curvez/pages` → 404
- 저장소는 **public**, 기본 브랜치 `main`
- 프로젝트 페이지라 URL 이 `https://knut15.github.io/curvez/` 다. **`basePath: "/curvez"` 가 필요하다**
- **한 저장소에 Pages 사이트는 하나다.** scopulusUI 가 그 하나를 쓴다

### handwork 는 Pages 에 못 올린다

`apps/handwork/src/app/page.tsx:6` 이 `export const dynamic = "force-dynamic"` 이다. 랜딩 배경을
방문마다 뽑느라 요청 시점 렌더가 필요해서 `output: "export"` 와 맞지 않는다. **handwork 배포는
이번 범위가 아니다.**

### daisyUI 사이트 구조 (비교 대상)

컴포넌트 **68종** · 유틸리티 600+ · 현재 버전 5.7.36. `/docs/changelog/` 를 따로 두고 메이저
버전별로 문서를 분기한다(5.x ~ 1.x). 상단 내비는 Docs · Components · Templates · Blog 로 나뉜다.

**버전별 문서 분기는 따라 하지 않는다.** 0.1.0 에서 시작하는데 분기할 과거가 없다.

---

## 4. 만들 구조

```
packages/scopulus-ui/
├── package.json              name: "@scopulus/ui", exports 명시
├── CHANGELOG.md              Keep a Changelog. 손으로 쓴다
├── src/
│   ├── index.ts              배럴. 공개 API 는 여기가 전부다
│   └── ui/                   컴포넌트 20종 + 스토리
├── design/
│   ├── tokens.md             색·간격·타이포·상태·고도·대비 검증
│   └── components/           스펙 20종
├── .storybook/               handwork 에서 이동
└── scripts/                  check-contrast.mjs · export-tokens.mjs · lib/

apps/scopulus-ui/               문서 사이트 (Next static export)
├── next.config.ts            output:"export" · basePath:"/curvez" · images.unoptimized
├── content/                  MDX 원고
└── src/                      FSD 층은 handwork 와 같다

apps/handwork/
├── design/                   화면 스펙 5종 + CaseCard·LabCard·SiteHeader 스펙만 남는다
├── content/labs/             scopulusUI 를 소개하는 글 1편이 여기 생긴다
└── src/shared/ui/            theme-provider.tsx 하나만 남는다
```

## 5. 컴포넌트 20종

### 기존 9종 — 옮기기만 한다

Button · Card · Badge · AppLink · Separator · PageShell · PageTitle · Prose · ThemeToggle

**스펙·스토리·play 함수를 그대로 가져간다.** 값을 바꾸지 않는다.

**`ThemeProvider` 는 옮기지 않는다.** `app/layout.tsx` 의 배선이지 컴포넌트가 아니고, 스펙도 없다.
**`ThemeToggle` 은 옮긴다.** 스펙과 스토리를 가진 컴포넌트이고 사이트에서 보여줄 것이다.
그 대가로 **`next-themes` 가 패키지의 `peerDependencies` 가 된다.**
**바꿀 때 고칠 위치:** `packages/scopulus-ui/package.json` 의 `peerDependencies` 와
`src/ui/theme-toggle.tsx`.

### 신규 11종

| 묶음     | 컴포넌트                                      |
| -------- | --------------------------------------------- |
| 폼       | Input · Textarea · Checkbox · Switch · Select |
| 오버레이 | Dialog · Tooltip · Popover                    |
| 피드백   | Alert · Skeleton                              |
| 데이터   | Table                                         |

**전부 shadcn `base-nova` 로 받아 토큰만 맞춘다.** 손으로 새로 쓰지 않는다 — Button 때와 달리
이것들은 이 사이트에서 쓰던 것이 아니다.

### 신규 컴포넌트는 화면에서 쓰던 것이 아니다 — 그렇게 적는다

기존 9종의 스펙은 `## 근거` 에 **"같은 클래스 문자열이 몇 번 반복되는가"** 를 `파일:줄` 로
적었다. 신규 11종에는 그 근거가 **없다.** 화면에 쓰인 적이 없기 때문이다.

**없는 근거를 지어내지 마라.** 신규 스펙의 `## 근거` 는 이 셋을 적는다.

1. **출처** — `shadcn add <이름>` 으로 받은 `base-nova` 소스. 받은 날짜와 variant/size 목록
2. **handwork 사용처: 0곳** — 명시한다. 기존 9종과 섞이면 어느 것이 검증된 값인지 구분되지 않는다
3. **왜 20종에 들어가는가** — 폼·오버레이·피드백·데이터 네 묶음을 덮기 위해서다.
   그 밖의 이유를 적지 마라

**`## 상태` 의 상태 4종과 `a11y:` 다섯 키는 기존과 같은 깊이로 채운다.** 근거가 없는 것과
스펙이 얕은 것은 다르다.

---

## 6. 사이트 구조

| 라우트                  | 내용                                                             |
| ----------------------- | ---------------------------------------------------------------- |
| `/`                     | 무엇인지 한 문장 · 컴포넌트 수 · 설치와 사용 3줄 · 토큰 미리보기 |
| `/docs/getting-started` | 설치 · `@scopulus/ui` import · Tailwind 설정                     |
| `/docs/tokens`          | 색·간격·타이포·상태 표. 라이트·다크 동시                         |
| `/components/<이름>`    | 20종. 라이브 예제 + props 표 + 스펙의 `## 근거` 요약             |
| `/changelog`            | `packages/scopulus-ui/CHANGELOG.md` 를 빌드 시점에 읽어 렌더     |

**MDX 원고가 정본이다.** 컴포넌트 페이지는 `content/components/<이름>.mdx` 이고, 그 안에서
`@scopulus/ui` 를 import 해 실제 컴포넌트를 렌더한다. 스크린샷을 쓰지 않는다.

**값의 정본은 `packages/scopulus-ui/design/` 이다.** 사이트는 그 값을 보여주는 곳이지 정하는 곳이
아니다. 두 곳이 다르면 스펙이 이긴다 — MDX 에 값을 손으로 옮겨 적지 마라.

---

## 7. 버전과 배포

### CHANGELOG.md — 손으로 쓴다

[Keep a Changelog](https://keepachangelog.com/ko/1.1.0/) 형식. `0.1.0` 에서 시작한다.

```markdown
## [0.1.0] - 2026-09-11

### Added

- 컴포넌트 20종 ...
```

버전은 `packages/scopulus-ui/package.json` 의 `version` 과 **같아야 한다.** 사이트가 둘을 대조해
어긋나면 빌드를 깨뜨린다(10절 G4).

### GitHub Pages

새 워크플로 `.github/workflows/pages.yml` 을 만든다. `ci.yml` 은 건드리지 않는다.

- `main` push 에서만 돈다. PR 에서는 돌지 않는다 — PR 마다 배포하면 사이트가 흔들린다
- `actions/configure-pages` → `upload-pages-artifact` → `deploy-pages`
- 권한 `pages: write` · `id-token: write`
- **`.nojekyll` 을 출력에 넣는다.** 없으면 Jekyll 이 `_` 로 시작하는 경로를 버린다

**Pages 를 켜는 것은 사람이 한다.** 저장소 Settings → Pages → Source 를 GitHub Actions 로
바꾸는 일이고, 지금 API 가 404 다. 워크플로만 만들어 두고 첫 배포 전에 알린다.

**스토리북은 Pages 에 올리지 않는다.** 범위를 넓히지 않기 위해서다. 올리려면 빌드 산출물을
export 출력의 `storybook/` 아래로 복사하고 사이트에서 링크하면 된다 —
**고칠 위치:** `.github/workflows/pages.yml` 한 곳.

---

## 8. 이동 계획

**한 번에 옮기고 참조를 한 번에 고친다.** 두 곳에 사본을 두지 않는다.

| 무엇                                   | 어디서 → 어디로                                                                |
| -------------------------------------- | ------------------------------------------------------------------------------ |
| 컴포넌트 9종 + 스토리 9개              | `apps/handwork/src/shared/ui/` → `packages/scopulus-ui/src/ui/`                |
| 컴포넌트 스펙 8종 + `ThemeToggle.md`   | `apps/handwork/design/components/` → `packages/scopulus-ui/design/components/` |
| `tokens.md` · `tokens.figma.json`      | `apps/handwork/design/` → `packages/scopulus-ui/design/`                       |
| `.storybook/` 3파일                    | `apps/handwork/` → `packages/scopulus-ui/`                                     |
| `scripts/` 3파일 + `vitest.config.mts` | `apps/handwork/` → `packages/scopulus-ui/`                                     |

**남는 것**

- `apps/handwork/design/screens/` 5종 · `components/` 의 CaseCard · LabCard · SiteHeader
- `apps/handwork/src/shared/ui/theme-provider.tsx`
- `apps/handwork/src/entities/*/ui/*.stories.tsx` 2개 — 화면 전용 카드라 handwork 스토리북이
  필요해진다. **handwork 에 스토리북을 다시 세우지 않는다.** 이 둘의 스토리는 지운다
  (스펙은 남는다). **바꿀 때 고칠 위치:** 이 문단과 `apps/handwork/package.json`

**`adoption.md` 를 고쳐야 한다.** 이관 대상 26곳의 import 가 `@/shared/ui/*` 에서
`@scopulus/ui` 로 바뀐다. 참조 74건의 `파일:줄` 도 다시 검증한다.

**스크립트 경로가 바뀐다.** `check-contrast.mjs` 의 `DESIGN` 과 `export-tokens.mjs` 의 출력이
`packages/scopulus-ui/design/` 을 가리켜야 한다. `globals.css` 는 여전히 `apps/handwork` 에
있으므로 **토큰의 정본이 앱에 남는 문제**가 생긴다 — 9절 참조.

---

## 9. 토큰의 정본을 어디에 둘 것인가 — 실행 전에 정한다

지금 색 토큰의 정본은 `apps/handwork/src/app/globals.css` 이고, `tokens.md` 는 스스로 사본이라고
적어 뒀다. 라이브러리가 패키지로 나가면 **앱의 CSS 에 의존하는 라이브러리**가 된다.

**권고: `packages/scopulus-ui/src/tokens.css` 로 옮기고 handwork 가 import 한다.**

- 라이브러리가 자기 토큰을 갖는다. 두 번째 앱이 생겨도 같은 값을 쓴다
- `apps/handwork/src/app/globals.css` 는 `@import "@scopulus/ui/tokens.css"` 한 줄과 handwork
  고유값(`--brand-*` 랜딩 팔레트)만 남긴다
- 스크립트 둘의 입력이 `packages/scopulus-ui/src/tokens.css` 가 된다

**랜딩 팔레트(`--brand-accent` · `--brand-canvas` · `--brand-ink` · `--brand-mark` ·
`--brand-overlay-ink`)는 옮기지 않는다.** handwork 의 브랜드 색이고 라이브러리와 무관하다.

**바꿀 때 고칠 위치:** 이 절과 `packages/scopulus-ui/scripts/lib/tokens.mjs` 의 `CSS_PATH`.

---

## 10. 검증 — 게이트

### G1. 빌드

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
pnpm --filter @scopulus/ui exec storybook build --output-dir /tmp/sb
pnpm --filter scopulus-ui-site build          # static export
```

전부 exit 0. **export 출력에 `index.html` 과 `.nojekyll` 이 있어야 한다.**

### G2. 토큰 밖 하드코딩 색값

```bash
grep -rnE '#[0-9a-fA-F]{3,8}\b|rgba?\(|oklch\(' packages/scopulus-ui/src \
  --include='*.tsx' --include='*.ts' | grep -v '\.stories\.' | grep -v tokens.css
```

**0건.** 현재 `shared/ui` + `entities` 범위가 0건이므로 옮긴 뒤에도 0건이어야 한다.

### G3. 대비 + 접근성

```bash
node packages/scopulus-ui/scripts/check-contrast.mjs   # 실패 0건
pnpm test                                            # 스토리마다 axe. 위반이면 실패
```

**신규 11종이 들어오면 대비 쌍이 늘어난다.** 현재 20쌍이고 새 쌍은 렌더 화면에서 재서
`tokens.md` 의 `## 대비 검증` 에 같은 형식으로 추가한다.

### G4. 버전 일치

```bash
node packages/scopulus-ui/scripts/check-version.mjs
```

`package.json` 의 `version` 과 `CHANGELOG.md` 최상단 항목이 같은지 본다. 다르면 exit 1.
**이 스크립트를 새로 만든다.**

### G5. 링크 무결성

```bash
node apps/scopulus-ui/scripts/check-links.mjs
```

MDX 안의 내부 링크와 `파일:줄` 참조가 실재하는지 본다. **이 스크립트를 새로 만든다.**

### 각 게이트는 음성 검사로 확인한다

**"실패 0건" 은 그 자체로 아무것도 증명하지 않는다.** 결함이 있는 입력에도 0건이 나올 수 있다.
G2·G4·G5 는 각각 일부러 깨뜨려 잡히는지 확인하고 그 출력을 보고에 원문으로 남긴다.

---

## 11. 실행 순서

각 단계에 **무엇으로 확인하는지**를 붙였다. 확인이 안 되면 다음으로 넘어가지 않는다.

1. **패키지 골격** — `packages/scopulus-ui/package.json` · `tsconfig` · `exports`
   → 검증: `pnpm install` 이 워크스페이스로 인식. `pnpm -r list` 에 `@scopulus/ui` 등장
2. **토큰 이전** — `tokens.css` 를 패키지로, handwork 는 import 한 줄
   → 검증: `pnpm --filter handwork build` exit 0. 렌더 화면 색이 그대로
3. **컴포넌트 9종 + 스토리 + 스토리북 + 스크립트 이동**
   → 검증: G1 · G2 · G3 전부 통과. 스토리 수가 이동 전과 같다
4. **handwork 참조 정리** — `adoption.md` 의 import 를 `@scopulus/ui` 로. 참조 74건 재검증
   → 검증: `파일:줄` 참조 전부 실재. 빈 줄 0건
5. **신규 11종** — `shadcn add` 로 받아 토큰 맞추고 스펙·스토리 작성
   → 검증: 스펙 20/20 에 `props · states · a11y · responsive` 네 섹션. G3 통과
6. **CHANGELOG.md + 버전 게이트**
   → 검증: G4 가 음성 검사에서 잡는다
7. **사이트 골격** — `apps/scopulus-ui` 스캐폴드, static export 설정
   → 검증: `next build` exit 0. 출력에 `index.html` · `.nojekyll`
8. **사이트 내용** — MDX 원고 · 컴포넌트 페이지 20종 · changelog 페이지
   → 검증: G5 통과. 컴포넌트 페이지가 실제 컴포넌트를 렌더(스크린샷 0건)
9. **Pages 워크플로**
   → 검증: 워크플로 문법 검사. **실제 배포는 사람이 Pages 를 켠 뒤**
10. **handwork Labs 글**
    → 검증: `/labs` 에 항목이 뜨고 상세에서 사이트로 나가는 링크가 산다

**5번을 3번보다 먼저 하지 않는다.** 이동이 끝나기 전에 새 컴포넌트를 만들면 두 곳에 컴포넌트가
생기고 어느 쪽이 정본인지 판정할 근거가 사라진다.

---

## 12. 소유권 — 정해야 한다

지금 두 담당의 이름이 `handwork-` 로 시작하는데 소유 경로가 handwork 밖으로 나간다.

**권고: 이름을 유지하고 소유 경로만 옮긴다.**

| 담당                     | 새 소유 경로                                                                                                          |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `handwork-design-system` | `packages/scopulus-ui/design/`, `apps/handwork/design/`                                                               |
| `handwork-ui`            | `packages/scopulus-ui/src/`, `packages/scopulus-ui/.storybook/`, `packages/scopulus-ui/scripts/`, `apps/scopulus-ui/` |

**이유:** 에이전트 이름을 바꾸면 `.claude/`·`team.md`·핸드오프 이력의 참조가 전부 어긋난다.
이름이 소유 범위보다 좁아진 것은 사실이지만 그 불일치는 문서 한 줄로 적어 두면 읽을 수 있다.

**반대 의견이 있으면 실행 전에 말한다.** `scopulus-ui-design` · `scopulus-ui-impl` 로 바꾸는 것도
합리적이다 — 그때는 `.claude/agents/` 2파일 · `.claude/skills/` 2파일 · `.curvez/team.md` 를
함께 고친다.

`.curvez/team.md` 의 소유권 예외 표도 새 경로로 고친다. **`packages/scopulus-ui/` 는 코어
에이전트의 소유 경로와 안 겹치므로 예외 선언이 필요 없다** — `curvez-nextjs` 는
`${paths.web}` = `apps/handwork` 만 소유한다.

**`apps/scopulus-ui/` 는 겹친다.** `${paths.web}` 가 `apps/handwork` 하나라 문자열로는 안 겹치지만
프로파일의 `paths.web` 을 어떻게 둘지 정해야 한다 — 13절.

---

## 13. 미확정 · 위험

확인하지 못한 것을 그대로 적는다.

| 항목                                                 | 상태                                                                                                                                                              |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `profile.json` 의 `paths.web` 이 앱 둘을 어떻게 담나 | **미정.** 지금 `apps/handwork` 하나다. 앱이 둘이면 `stack` 을 `monorepo` 로 올리고 `paths` 를 다시 잡아야 할 수 있다. `bootstrap` 의 판정 규칙을 다시 읽고 정한다 |
| Next static export + `@next/mdx` 조합                | **확인 불가.** handwork 는 export 를 쓰지 않는다. 7단계에서 실제로 빌드해 확인한다                                                                                |
| `basePath` 와 MDX 내부 링크                          | **확인 불가.** `/curvez` 접두가 붙으면 손으로 쓴 `/components/button` 링크가 깨진다. G5 가 그것을 잡아야 한다                                                     |
| shadcn `base-nova` 의 11종이 실제로 받아지는가       | **확인 불가.** Button 하나만 `--dry-run` 으로 봤다. Dialog·Popover 는 `@base-ui/react` 의 다른 프리미티브를 쓸 수 있다                                            |
| 신규 11종의 대비 쌍                                  | **확인 불가.** 렌더해서 재야 한다. 지금 20쌍이 몇 쌍으로 늘지 모른다                                                                                              |
| Pages 첫 배포                                        | **사람이 켜야 한다.** Settings → Pages → Source = GitHub Actions. 지금 API 404 다                                                                                 |
| `@scopulus/ui` 의 빌드 형태                          | **미정.** 소스 그대로 노출(`exports` 가 `.tsx` 를 가리킴)할지, tsup 등으로 빌드할지. 워크스페이스 안에서만 쓰면 소스 노출이 가볍다                                |

**이 표의 항목은 만들면서 답이 나온다. 지금 추측으로 채우지 않는다.**

---

## 14. 완료 기준

- [ ] `pnpm -r list` 에 `@scopulus/ui` 가 뜨고 handwork 가 `workspace:*` 로 쓴다
- [ ] 컴포넌트 **20종**이 `packages/scopulus-ui/src/ui/` 에 있고 각각 스토리와 스펙을 갖는다
- [ ] 스펙 20/20 에 `props · states · a11y · responsive` 네 섹션. 신규 11종은 `handwork 사용처: 0곳` 이 명시돼 있다
- [ ] G1~G5 전부 통과. **각 게이트가 음성 검사에서 실제로 잡힌 출력을 보고에 남겼다**
- [ ] `apps/handwork/src/shared/ui/` 에 `theme-provider.tsx` 하나만 남는다
- [ ] `adoption.md` 의 import 가 `@scopulus/ui` 이고 `파일:줄` 참조가 전부 실재한다
- [ ] 사이트가 static export 로 빌드되고 출력에 `index.html` · `.nojekyll` 이 있다
- [ ] `CHANGELOG.md` 의 최상단 버전이 `package.json` 과 같다
- [ ] `/labs` 에 scopulusUI 글이 뜨고 상세에서 사이트로 나가는 링크가 산다
- [ ] 금지어 **0건**
