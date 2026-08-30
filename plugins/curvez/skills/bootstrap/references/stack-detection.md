# 스택 감지 — 루트 판정으로 안 갈릴 때

`SKILL.md` 절차 2 에서 루트 `package.json` 감지가 `workspace: true` 로 나왔거나, 세 가지 기본
판정 어디에도 안 걸렸을 때 읽는다.

---

## 워크스페이스를 순회한다

루트에 `workspaces` 나 `pnpm-workspace.yaml` 이 있으면 앱이 루트가 아니라 하위 패키지에 있다.
루트 의존성만 보면 `next` 도 `expo` 도 없는 것처럼 보인다.

```bash
node -e '
const fs = require("fs"), path = require("path");
const read = (p) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } };
const pkgs = [];
const walk = (dir, depth) => {
  if (depth > 3) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory() || e.name === "node_modules" || e.name.startsWith(".")) continue;
    const sub = path.join(dir, e.name);
    const pkg = read(path.join(sub, "package.json"));
    if (pkg) {
      const d = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      pkgs.push({ dir: sub, name: pkg.name, deps: Object.keys(d), next: !!d.next, expo: d.expo || null, rn: !!d["react-native"] });
    }
    walk(sub, depth + 1);
  }
};
walk(".", 0);
const web = pkgs.filter((p) => p.next);
const mobile = pkgs.filter((p) => p.expo || p.rn);
const shared = pkgs.filter((p) => !p.next && !p.expo && !p.rn &&
  web.some((w) => w.deps.includes(p.name)) && mobile.some((m) => m.deps.includes(p.name)));
console.log(JSON.stringify({
  web: web.map((p) => p.dir),
  mobile: mobile.map((p) => p.dir),
  domainCandidates: shared.map((p) => p.dir)
}, null, 2));
'
```

`node_modules` 와 점으로 시작하는 디렉터리를 건너뛰고 깊이 3까지만 본다.
**이유:** `node_modules` 안에는 `next` 를 의존하는 패키지가 수백 개 있어서, 안 걸러내면
`web` 배열이 의존성 목록으로 채워져 판정이 통째로 무의미해진다.

---

## 출력으로 판정한다

| `web`                  | `mobile` | 판정                                           |
| ---------------------- | -------- | ---------------------------------------------- |
| 1개                    | 1개      | `monorepo`                                     |
| 1개                    | 0개      | `nextjs`. `paths.web` 은 그 디렉터리           |
| 0개                    | 1개      | `react-native`. `paths.mobile` 은 그 디렉터리  |
| 0개                    | 0개      | 판정 불가. 인터뷰 1번 문항으로 올린다          |
| 2개 이상 (어느 쪽이든) | —        | 판정 불가. 어느 것이 주 앱인지 인터뷰로 묻는다 |

**`web` 이나 `mobile` 이 2개 이상일 때 첫 번째를 고르지 마라.**
**이유:** 순회 순서는 파일시스템 순서라 `apps/web` 과 `apps/admin` 중 무엇이 먼저 나올지 정해져
있지 않다. 같은 저장소에서 실행할 때마다 다른 `paths.web` 이 나오면, 그 값을 소유 경로로 쓰는
구현 에이전트가 매번 다른 디렉터리를 담당하게 된다.

---

## paths.domain 은 "둘 다 의존하는 패키지" 다

`domainCandidates` 는 웹 앱과 모바일 앱이 **둘 다** 의존하는 워크스페이스 패키지다.
이름에 `domain`·`core`·`shared` 가 들어갔는지로 고르지 마라.

**이유:** 이름 규칙은 저장소마다 다르지만 "양쪽이 의존한다" 는 구조적 사실이다.
`paths.domain` 은 **소유자를 두지 않는 경로**이고, 이 값이 틀리면 `curvez-orchestrator` 가
`curvez-nextjs` 와 `curvez-react-native` 를 순차로 강등해야 할 라운드에서 병렬로 띄운다.
그 결과 한쪽이 다른 쪽의 변경을 조용히 덮어쓴다.

| `domainCandidates` | 행동                                                                                          |
| ------------------ | --------------------------------------------------------------------------------------------- |
| 정확히 1개         | 그것을 `paths.domain` 으로 쓴다                                                               |
| 0개                | 인터뷰 2번 문항으로 묻는다. 공유 패키지가 실제로 없다면 `stack` 이 `monorepo` 가 아닐 수 있다 |
| 2개 이상           | 인터뷰로 하나를 고르게 한다. 여러 개를 배열로 넣지 마라 — `paths.domain` 은 단일 문자열이다   |

---

## 한 package.json 에 next 와 react-native 가 같이 있을 때

판정하지 말고 인터뷰 1번 문항으로 올린다.

**이유:** 이 배치는 두 가지 서로 다른 프로젝트에서 나온다 — 웹 빌드를 곁들인 RN 앱,
그리고 마이그레이션 중간 상태의 웹 앱이다. 의존성 목록만으로는 구분되지 않는데, 판정이 틀리면
`curvez-nextjs` 와 `curvez-react-native` 중 **엉뚱한 에이전트가 담당**이 되어 그 라운드의
산출물 전체가 다른 프레임워크 관례로 쓰인다. 코드 리뷰 단계까지 가서야 드러난다.
