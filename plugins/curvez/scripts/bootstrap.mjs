#!/usr/bin/env node
/**
 * 프로젝트 부트스트랩 — 스택을 감지하고 `.curvez/` 를 스캐폴드한다.
 *
 * 사용법:
 *   node bootstrap.mjs [--dir <프로젝트 루트>] [--json] [--dry-run] [--force]
 *
 *   --json     판정 결과를 JSON 으로만 출력한다 (에이전트가 파싱해 인터뷰 문항을 만든다)
 *   --dry-run  판정만 하고 파일을 만들지 않는다
 *   --force    이미 있는 .curvez/profile.json 을 덮어쓴다
 *
 * `curvez:bootstrap` 스킬의 절차 1~7 을 그대로 옮긴 것이다. 스킬이 절차의 정본이고
 * 이 스크립트는 그 실행기다. 절차가 바뀌면 양쪽을 함께 고친다.
 *
 * **이 스크립트는 사용자에게 묻지 않는다.** 자동으로 판정할 수 있는 것만 채우고,
 * 판정 불가한 것은 `questions[]` 로 내보낸다.
 * 이유: 추측으로 채운 값은 다음 라운드에서 사실처럼 쓰이고, 틀렸을 때 어디서 왔는지 되짚을 수 없다.
 * 묻는 일은 사용자와 대화할 수 있는 에이전트의 몫이다.
 *
 * exit code: 0 = 진행 가능(질문이 남아 있어도 0), 1 = 진행 불가, 2 = 사용법 오류.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, appendFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";

const argv = process.argv.slice(2);
const opt = {
  dir: process.cwd(),
  json: argv.includes("--json"),
  dryRun: argv.includes("--dry-run"),
  force: argv.includes("--force"),
};
const dirIdx = argv.indexOf("--dir");
if (dirIdx !== -1) {
  if (!argv[dirIdx + 1]) {
    console.error("--dir 다음에 경로가 필요하다.");
    process.exit(2);
  }
  opt.dir = resolve(argv[dirIdx + 1]);
}

const ROOT = opt.dir;
const CURVEZ = join(ROOT, ".curvez");
const PROFILE = join(CURVEZ, "profile.json");

/** `commands` 키별 스크립트 후보. 위에서부터 먼저 맞는 하나를 쓴다. */
const COMMAND_CANDIDATES = {
  typecheck: ["typecheck", "type-check", "tsc"],
  lint: ["lint"],
  test: ["test"],
  build: ["build"],
};

/** 스택별 필수 프로파일 키. 없으면 진행 불가다. */
const REQUIRED_KEYS = {
  nextjs: ["paths.web"],
  "react-native": ["paths.mobile", "expo.sdkVersion"],
  monorepo: ["paths.web", "paths.mobile", "paths.domain"],
};

const readJson = (p) => {
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return null;
  }
};

const getPath = (obj, dotted) => dotted.split(".").reduce((o, k) => o?.[k], obj);

/**
 * `pnpm-workspace.yaml` 이 실제로 워크스페이스를 정의하는지 본다.
 *
 * 파일 존재만으로 모노레포라고 단정하면 안 된다. pnpm 은 이 파일을 워크스페이스 정의뿐 아니라
 * `allowBuilds` · `minimumReleaseAgeExclude` 같은 설치 설정 파일로도 쓴다.
 * 실제 Expo 단일 저장소가 이 이유로 monorepo 로 오판돼, 있지도 않은 `apps/` 를 순회하고
 * "스택 판정 불가" 로 멈췄다. `packages:` 키가 있어야 워크스페이스다.
 */
function hasPnpmWorkspacePackages() {
  const p = join(ROOT, "pnpm-workspace.yaml");
  if (!existsSync(p)) return false;
  try {
    // YAML 파서를 쓰지 않는다(의존성 0 원칙). 최상위 `packages:` 키만 확인하면 충분하다.
    return /^packages:\s*$|^packages:\s*\[/m.test(readFileSync(p, "utf8"));
  } catch {
    return false;
  }
}

// ── 절차 2: 스택 감지 ────────────────────────────────────────────────
function detect() {
  const root = readJson(join(ROOT, "package.json"));
  if (!root) return { error: "NO_PACKAGE_JSON" };

  const dep = { ...(root.dependencies ?? {}), ...(root.devDependencies ?? {}) };

  return {
    workspace: !!root.workspaces || hasPnpmWorkspacePackages(),
    // 최상위 `expo` 키는 레거시 설정 블록일 수 있다. 의존성만 본다.
    next: dep.next ?? null,
    expo: dep.expo ?? null,
    reactNative: dep["react-native"] ?? null,
    packageManager: root.packageManager ?? null,
    scripts: Object.keys(root.scripts ?? {}),
  };
}

/** 워크스페이스를 순회해 web·mobile·domain 후보를 찾는다. */
function scanWorkspaces() {
  const roots = ["apps", "packages"];
  const found = { web: [], mobile: [], packages: {} };

  for (const r of roots) {
    const base = join(ROOT, r);
    if (!existsSync(base)) continue;
    for (const entry of readdirSync(base)) {
      const pkgPath = join(base, entry, "package.json");
      const pkg = readJson(pkgPath);
      if (!pkg) continue;
      const rel = `${r}/${entry}`;
      const dep = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
      found.packages[pkg.name ?? rel] = { rel, deps: Object.keys(dep) };
      if (dep.next) found.web.push(rel);
      if (dep.expo || dep["react-native"]) found.mobile.push(rel);
    }
  }

  // paths.domain 은 이름이 아니라 의존 관계로 판정한다.
  // 이유: `domain`/`core`/`shared` 같은 이름 규칙은 저장소마다 다르지만,
  // "웹과 모바일이 둘 다 의존한다" 는 구조적 사실이다.
  const webPkgs = Object.entries(found.packages).filter(([, v]) => found.web.includes(v.rel));
  const mobilePkgs = Object.entries(found.packages).filter(([, v]) => found.mobile.includes(v.rel));
  const internal = new Set(Object.keys(found.packages));

  const usedByWeb = new Set(webPkgs.flatMap(([, v]) => v.deps.filter((d) => internal.has(d))));
  const usedByMobile = new Set(mobilePkgs.flatMap(([, v]) => v.deps.filter((d) => internal.has(d))));
  const domainCandidates = [...usedByWeb]
    .filter((d) => usedByMobile.has(d))
    .map((d) => found.packages[d].rel);

  return { ...found, domainCandidates };
}

/**
 * git 브랜치 전략을 감지한다.
 *
 * 원격 브랜치 목록으로 2단(`main ← release ← 작업`) 인지 1단(`main ← 작업`) 인지 가른다.
 * 이유: 브랜치 전략은 프로젝트마다 다르다. `release` 가 없는 저장소에서 그것을 기본값으로 두면
 * 작업 브랜치를 딸 곳이 없어 매번 막힌다. 반대로 있는데 안 쓰면 배포된 것 위에서 작업하게 된다.
 *
 * `{ git, remote, inferred }` 를 돌려준다. `remote` 와 `inferred` 는 확인 문항의 재료이고
 * 프로파일에 들어가지 않는다 — `git` 만 그대로 쓴다.
 */
function detectGit() {
  const r = spawnSync("git", ["branch", "-r", "--format=%(refname:short)"], {
    cwd: ROOT, encoding: "utf8",
  });
  if (r.status !== 0) return null;

  const remote = r.stdout.split("\n").map((b) => b.trim().replace(/^origin\//, "")).filter(Boolean);
  const has = (n) => remote.includes(n);

  const releaseBranch = has("main") ? "main" : has("master") ? "master" : null;
  if (!releaseBranch) return null;

  // 통합 브랜치가 따로 있으면 2단이다.
  const integration = has("release") ? "release" : has("develop") ? "develop" : null;
  const baseBranch = integration ?? releaseBranch;

  return {
    git: {
      baseBranch,
      releaseBranch,
      mergeStrategy: "rebase",
      protectedBranches: baseBranch === releaseBranch ? [releaseBranch] : [releaseBranch, baseBranch],
      // 이 브랜치로 가는 PR 은 사람이 머지한다.
      // 기본값이 releaseBranch 인 이유: 그 머지가 곧 배포인지는 프로젝트의 CD 설정에 달렸고
      // curvez 는 알 수 없다. 모르면 안전한 쪽 — 에이전트가 배포를 누르지 않는 쪽 — 으로 둔다.
      // 1단 구조에서 에이전트 머지를 허용하려면 이 배열을 비운다.
      humanMergeTargets: [releaseBranch],
    },
    remote,
    // 이름만 보고 통합 브랜치라고 단정한 자리. 여기가 틀릴 수 있어 확인 문항이 나간다.
    inferred: integration,
  };
}

// ── 절차 3: commands ────────────────────────────────────────────────
function mapCommands(scripts) {
  const out = {};
  for (const [key, cands] of Object.entries(COMMAND_CANDIDATES)) {
    const hit = cands.find((c) => scripts.includes(c));
    // 후보가 없으면 키를 통째로 생략한다. 없는 스크립트를 적으면 매 라운드
    // "not found" 로 끝나는데, 그 실패는 코드가 깨진 실패와 출력만으로 구분되지 않는다.
    if (hit) out[key] = `pnpm ${hit}`;
  }
  return out;
}

// ── 판정 ────────────────────────────────────────────────────────────
function decide(d) {
  const questions = [];
  const decisions = [];

  if (d.error === "NO_PACKAGE_JSON") {
    return { blocked: "package.json 이 없다. 프로젝트 루트가 맞는지 확인하라.", questions, decisions };
  }

  let stack = null;
  let ws = d.workspace ? scanWorkspaces() : null;

  // 워크스페이스라고 판정했는데 하위 앱이 하나도 없으면 루트 자체가 앱이다.
  // 이유: 워크스페이스 선언과 실제 구조는 어긋날 수 있다. 순회 결과가 비었는데도
  // 모노레포로 밀어붙이면 루트의 의존성을 아예 보지 않고 판정 불가로 끝난다.
  if (ws && ws.web.length === 0 && ws.mobile.length === 0) {
    decisions.push({
      what: "워크스페이스 신호가 있지만 하위 앱이 없어 단일 저장소로 판정",
      why: "apps/·packages/ 순회 결과가 비었다. 루트 의존성으로 판정한다",
    });
    ws = null;
  }

  if (ws) {
    if (ws.web.length > 0 && ws.mobile.length > 0) stack = "monorepo";
    else if (ws.web.length > 0) stack = "nextjs";
    else stack = "react-native";
  } else if (d.next && !d.expo && !d.reactNative) {
    stack = "nextjs";
  } else if ((d.expo || d.reactNative) && !d.next) {
    stack = "react-native";
  } else if (d.next && (d.expo || d.reactNative)) {
    questions.push({
      key: "stack",
      ask: "next 와 expo/react-native 가 같은 package.json 에 있다. 웹을 곁들인 RN 앱인가, RN 을 곁들인 웹인가?",
      why: "판정이 틀리면 담당 구현 에이전트 자체가 틀린다",
    });
  } else {
    questions.push({
      key: "stack",
      ask: "next·expo·react-native 중 어느 것도 찾지 못했다. curvez 대상 저장소가 맞는가?",
      why: "스택을 지어내면 존재하지 않는 경로에 코드를 쓴다",
    });
  }

  const paths = {};
  const expo = {};

  if (stack === "monorepo" && ws) {
    if (ws.web.length === 1) paths.web = ws.web[0];
    else questions.push({ key: "paths.web", ask: `웹 앱 후보가 ${ws.web.length}개다: ${ws.web.join(", ") || "없음"}. 어느 것인가?`, why: "경로를 추측하면 소유권이 겹친다" });

    if (ws.mobile.length === 1) paths.mobile = ws.mobile[0];
    else questions.push({ key: "paths.mobile", ask: `모바일 앱 후보가 ${ws.mobile.length}개다: ${ws.mobile.join(", ") || "없음"}. 어느 것인가?`, why: "경로를 추측하면 소유권이 겹친다" });

    if (ws.domainCandidates.length === 1) {
      paths.domain = ws.domainCandidates[0];
      decisions.push({ what: `paths.domain 을 ${paths.domain} 으로 판정`, why: "웹과 모바일이 둘 다 의존하는 유일한 내부 패키지" });
    } else {
      questions.push({
        key: "paths.domain",
        ask: `공유 도메인 후보가 ${ws.domainCandidates.length}개다: ${ws.domainCandidates.join(", ") || "없음"}. 어느 것인가?`,
        why: "이름이 아니라 의존 관계로 판정하므로 자동 축소가 불가능하다",
      });
    }
  } else if (stack === "nextjs") {
    paths.web = ".";
    decisions.push({ what: "paths.web 을 저장소 루트로 판정", why: "워크스페이스가 아닌 단일 저장소" });
  } else if (stack === "react-native") {
    paths.mobile = ".";
    decisions.push({ what: "paths.mobile 을 저장소 루트로 판정", why: "워크스페이스가 아닌 단일 저장소" });
  }

  // expo.sdkVersion — react-native / monorepo 에서 필요
  if (stack === "react-native" || stack === "monorepo") {
    const range = d.expo ?? (ws ? readJson(join(ROOT, paths.mobile ?? "", "package.json"))?.dependencies?.expo : null);
    if (range) {
      const m = String(range).match(/(\d+)\./);
      if (m) expo.sdkVersion = m[1];
      else questions.push({ key: "expo.sdkVersion", ask: `expo 버전 범위 "${range}" 에서 메이저를 뽑지 못했다. SDK 버전은?`, why: "SDK 마다 지원 라이브러리 버전이 고정돼 어긋나면 런타임에서만 드러난다" });
    } else if (stack === "react-native") {
      questions.push({
        key: "expo.sdkVersion",
        ask: "expo 의존성이 없다. bare React Native 인가?",
        why: "현재 계약은 react-native 스택에 expo.sdkVersion 을 필수로 요구한다. bare 라면 계약 확장이 필요하다",
      });
    }
  }

  // paths.tests — 유일하게 폴백이 허용된다
  for (const c of ["tests", "test", "__tests__"]) {
    if (existsSync(join(ROOT, c))) {
      paths.tests = c;
      break;
    }
  }

  const commands = mapCommands(d.scripts ?? []);
  const gates = ["typecheck", "lint", "test"].filter((k) => commands[k]);
  if (gates.length === 0) {
    questions.push({
      key: "commands",
      ask: "typecheck·lint·test 스크립트가 하나도 없다. 품질 게이트를 무엇으로 판정하는가?",
      why: "게이트가 통째로 비면 status: done 을 판정할 근거가 없다",
    });
  }

  const gitDetected = detectGit();
  const git = gitDetected?.git ?? null;
  if (!git) {
    questions.push({
      key: "git",
      ask: "원격 브랜치를 읽지 못했다. 작업 브랜치를 어디서 따고 PR 을 어디로 보내는가?",
      why: "브랜치를 잘못 짚으면 배포된 것 위에서 작업하거나 남의 작업 위에 커밋이 쌓인다",
    });
  } else {
    const tier = git.baseBranch === git.releaseBranch ? "1단" : "2단";
    decisions.push({
      what: `git 전략을 ${tier}(base=${git.baseBranch}, release=${git.releaseBranch})으로 판정`,
      why: "원격 브랜치 목록에서 통합 브랜치 존재 여부로 갈랐다",
    });

    // 2단 판정은 브랜치 **이름**만 보고 내린 추정이다. 그래서 쓰기 전에 확인받는다.
    // 이유: `release` 가 통합 지점이 아니라 오래된 유물인 저장소가 있다. 그 경우 작업 브랜치가
    // 아무도 보지 않는 브랜치에서 나고 PR 도 거기로 열린다. 오류가 나지 않아 리뷰 화면을
    // 열어 봐야 드러나고, 그때는 이미 커밋이 여러 개다.
    // 1단은 확인 문항을 내지 않는다 — 통합 브랜치 후보가 원격에 아예 없어 추정한 것이 없다.
    if (gitDetected.inferred) {
      questions.push({
        key: "git.baseBranch",
        ask:
          `원격 브랜치는 ${gitDetected.remote.join(", ")} 다. ` +
          `이름을 보고 ${gitDetected.inferred} 를 통합 브랜치로 봤다 — ` +
          `작업 브랜치를 ${git.baseBranch} 에서 따고 PR 도 거기로 열면 맞는가? ` +
          `(${gitDetected.inferred} 가 지금 안 쓰는 브랜치면 ${git.releaseBranch} 하나로 간다)`,
        why: "이름만 보고 정한 값이다. 틀리면 아무도 보지 않는 브랜치로 PR 이 열리고, 그 사실은 리뷰 화면을 열어야 드러난다",
      });
    }
  }

  const profile = {
    stack,
    packageManager: "pnpm",
    architecture: "ddd",
    ...(Object.keys(paths).length ? { paths } : {}),
    ...(Object.keys(expo).length ? { expo } : {}),
    ...(git ? { git } : {}),
    commands,
  };

  const missing = stack && REQUIRED_KEYS[stack]
    ? REQUIRED_KEYS[stack].filter((k) => !getPath(profile, k))
    : [];

  return { stack, profile, questions, decisions, missing, detected: d, workspace: ws };
}

// ── 절차 6: 스캐폴드 ────────────────────────────────────────────────
const ARCH_SKELETON = `# 아키텍처

> \`curvez:architecture-setup\` 이 채운다. 헤딩 문자열은 고정이다 — 구현 에이전트가 이 이름으로 찾는다.

## 레이어 정의

## 의존 방향

## 금지 import

## 폴더 구조

## 스택 매핑

## 예외

없음

## 결정 로그

| 무엇을 | 왜 | 되돌릴 위치 |
|---|---|---|
`;

const TEAM_SKELETON = `# 팀 구성

> \`curvez:team-orchestration\` 이 라운드마다 다시 쓴다.

이번 라운드에 세팅된 담당이 없다.
`;

/** CI 에서 돌릴 게이트. 순서는 싼 것부터 — 먼저 깨지는 것이 먼저 보고돼야 한다. */
const CI_GATES = ["typecheck", "lint", "test", "build"];

/**
 * GitHub Actions 워크플로를 계획한다. 쓰지는 않는다 (`--dry-run` 에서도 계획은 나온다).
 *
 * 게이트 명령은 프로파일의 `commands` 를 그대로 쓴다. 여기서 명령을 새로 만들지 않는다.
 * 이유: 로컬 게이트와 CI 게이트가 다른 명령을 돌리면 "로컬은 통과했는데 CI 가 빨간" 상태가
 * 상시화되고, 그때 어느 쪽이 맞는지 판정할 근거가 없다. 단일 출처는 `commands` 다.
 *
 * `{ skip: 이유 }` 또는 `{ rel, content }` 를 돌려준다.
 */
function ciPlan(profile) {
  const r = spawnSync("git", ["remote", "get-url", "origin"], { cwd: ROOT, encoding: "utf8" });
  const origin = r.status === 0 ? r.stdout.trim() : "";
  if (!origin) return { skip: "원격 origin 이 없다. 어느 CI 를 쓰는지 알 수 없어 만들지 않는다" };
  if (!/github\.com/.test(origin)) {
    // GitLab·Bitbucket 은 파일 위치와 문법이 통째로 다르다. 형식을 지어내면 조용히 안 도는
    // 파일이 저장소에 남고, 사용자는 CI 가 있다고 믿는다.
    return { skip: `원격이 GitHub 이 아니다 (${origin}). 다른 CI 형식을 지어내지 않는다` };
  }

  const wfDir = join(ROOT, ".github", "workflows");
  if (existsSync(wfDir)) {
    const existing = readdirSync(wfDir).filter((f) => /\.ya?ml$/.test(f));
    if (existing.length) {
      // 덮어쓰지 않는 이유: 워크플로는 시크릿·배포·환경 승인과 얽혀 있다. 이름이 겹치지 않아도
      // 게이트가 두 번 도는 것 자체가 비용이고, 어느 쪽이 정본인지 사람이 판단해야 한다.
      return { skip: `.github/workflows/ 에 이미 워크플로가 있다 (${existing.join(", ")}). 손대지 않는다` };
    }
  }

  const gates = CI_GATES.filter((k) => profile.commands?.[k]);
  if (!gates.length) return { skip: "commands 에 게이트가 하나도 없다. 돌릴 것이 없다" };

  // 브랜치 필터는 프로파일에서 읽는다. 하드코딩된 main 을 쓰지 않는다.
  const base = profile.git?.baseBranch;
  const release = profile.git?.releaseBranch;
  const branches = [...new Set([base, release].filter(Boolean))];
  const filter = branches.length ? `\n    branches: [${branches.join(", ")}]` : "";

  const pkg = readJson(join(ROOT, "package.json")) ?? {};
  // engines.node 를 그대로 따른다. 없으면 22 (LTS). 프로젝트가 정한 값이 있으면 그것이 정본이다.
  const nodeMajor = String(pkg.engines?.node ?? "").match(/(\d+)/)?.[1] ?? "22";
  // packageManager 필드가 있으면 pnpm/action-setup 이 그 버전을 읽는다. 없을 때만 버전을 준다.
  const pnpmVersion = /^pnpm@/.test(String(pkg.packageManager ?? "")) ? null : "10";

  const steps = gates
    .map((k) => `      - name: ${k}\n        run: ${profile.commands[k]}`)
    .join("\n");

  const content = `# curvez:bootstrap 이 만들었다. 게이트 명령은 .curvez/profile.json 의 commands 가 정본이다 —
# 명령을 바꿀 때 이 파일만 고치면 로컬 게이트와 갈라진다. profile.json 을 함께 고쳐라.
name: ci

on:
  pull_request:${filter}
  push:${filter}

# 같은 브랜치에 새 커밋이 오면 앞선 실행을 취소한다. 낡은 결과를 기다리지 않는다.
concurrency:
  group: ci-\${{ github.ref }}
  cancel-in-progress: true

jobs:
  gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4${pnpmVersion ? `\n        with:\n          version: ${pnpmVersion}` : ""}

      - uses: actions/setup-node@v4
        with:
          node-version: "${nodeMajor}"
          cache: pnpm

      # --frozen-lockfile: lockfile 과 package.json 이 어긋나면 조용히 맞추지 말고 실패한다.
      - run: pnpm install --frozen-lockfile

${steps}
`;

  return { rel: ".github/workflows/ci.yml", content, gates, branches, nodeMajor };
}

function scaffold(profile) {
  const created = [];
  const skipped = [];

  for (const d of ["", "research", "handoff", "tmp", "qa"]) {
    const p = d ? join(CURVEZ, d) : CURVEZ;
    if (!existsSync(p)) {
      mkdirSync(p, { recursive: true });
      created.push(d ? `.curvez/${d}/` : ".curvez/");
    }
  }

  // 빈 디렉터리는 클론 시 사라진다.
  for (const d of ["research", "handoff"]) {
    const keep = join(CURVEZ, d, ".gitkeep");
    if (!existsSync(keep)) {
      writeFileSync(keep, "");
      created.push(`.curvez/${d}/.gitkeep`);
    }
  }

  const files = [
    [PROFILE, JSON.stringify(profile, null, 2) + "\n"],
    [join(CURVEZ, "architecture.md"), ARCH_SKELETON],
    [join(CURVEZ, "team.md"), TEAM_SKELETON],
  ];
  for (const [p, content] of files) {
    const rel = p.slice(ROOT.length + 1);
    if (existsSync(p) && !opt.force) {
      skipped.push(rel);
      continue;
    }
    writeFileSync(p, content);
    created.push(rel);
  }

  // CI 워크플로. 이미 있으면 손대지 않는다 — --force 로도 덮지 않는다.
  const ci = ciPlan(profile);
  if (ci.skip) {
    skipped.push(`.github/workflows/ci.yml (${ci.skip})`);
  } else {
    mkdirSync(join(ROOT, ".github", "workflows"), { recursive: true });
    writeFileSync(join(ROOT, ci.rel), ci.content);
    created.push(`${ci.rel} (게이트 ${ci.gates.join("·")})`);
  }

  // .gitignore — tmp 만 막는다. .curvez/ 자체는 커밋 대상이다.
  const gi = join(ROOT, ".gitignore");
  const line = ".curvez/tmp/";
  const cur = existsSync(gi) ? readFileSync(gi, "utf8") : "";
  if (!cur.split("\n").some((l) => l.trim() === line)) {
    appendFileSync(gi, (cur && !cur.endsWith("\n") ? "\n" : "") + line + "\n");
    created.push(".gitignore (+.curvez/tmp/)");
  }

  return { created, skipped };
}

// ── main ────────────────────────────────────────────────────────────
function main() {
  const already = existsSync(PROFILE);
  const result = decide(detect());

  if (result.blocked) {
    if (opt.json) console.log(JSON.stringify({ ok: false, blocked: result.blocked }, null, 2));
    else console.error(`BLOCKED: ${result.blocked}`);
    return 1;
  }

  let scaffoldResult = null;
  const canWrite = result.stack && result.missing.length === 0;

  if (!opt.dryRun && canWrite) {
    // 이미 프로파일이 있어도 스캐폴드를 돌린다. scaffold() 는 파일마다 존재 여부를 보고
    // 있는 것은 건너뛰므로 기존 값은 덮이지 않는다 — 스킬 절차 1 의 "없는 디렉터리·파일만
    // 만든다" 가 그 규칙이다.
    //
    // 통째로 건너뛰지 않는 이유: 그러면 이미 붙여 둔 프로젝트에 나중에 추가된 산출물
    // (CI 워크플로 같은 것)이 영원히 안 생긴다. 사용자는 bootstrap 을 다시 돌렸는데도
    // 아무 일이 없었던 것으로 보게 되고, 왜 없는지 알 방법이 없다.
    //
    // 덮어쓰지 않는 이유: paths 는 이미 architecture·design·소유권 판정에 참조돼 있다.
    // 값이 바뀌면 그 참조들이 조용히 어긋난다.
    scaffoldResult = scaffold(result.profile);
  }

  // CI 계획은 쓰기와 무관하게 보고한다 — --dry-run 에서도 무엇이 만들어질지 보여야 한다.
  const ci = canWrite ? ciPlan(result.profile) : null;
  const ciSummary = !ci ? null
    : ci.skip ? { skip: ci.skip }
    : { path: ci.rel, gates: ci.gates, branches: ci.branches, nodeMajor: ci.nodeMajor };

  const payload = {
    ok: true,
    stack: result.stack,
    profile: result.profile,
    missing: result.missing,
    questions: result.questions,
    decisions: result.decisions,
    scaffold: scaffoldResult,
    ci: ciSummary,
    dryRun: opt.dryRun,
  };

  if (opt.json) {
    console.log(JSON.stringify(payload, null, 2));
    return 0;
  }

  console.log(`스택        ${result.stack ?? "판정 불가"}`);
  console.log(`프로파일    ${JSON.stringify(result.profile.commands)}`);
  if (result.profile.paths) console.log(`경로        ${JSON.stringify(result.profile.paths)}`);
  if (result.profile.expo) console.log(`expo        ${JSON.stringify(result.profile.expo)}`);

  if (result.decisions.length) {
    console.log("\n판정 근거");
    for (const d of result.decisions) console.log(`  · ${d.what} — ${d.why}`);
  }

  if (result.missing.length) {
    console.log(`\n필수 키 누락  ${result.missing.join(", ")}`);
    console.log("  추측하지 않는다. 아래 질문에 답을 받아 채운 뒤 다시 실행하라.");
  }

  if (result.questions.length) {
    console.log(`\n사용자에게 물을 것 ${result.questions.length}건`);
    for (const q of result.questions) console.log(`  [${q.key}] ${q.ask}\n      이유: ${q.why}`);
  }

  if (ciSummary) {
    console.log(
      ciSummary.skip
        ? `\nCI    만들지 않는다 — ${ciSummary.skip}`
        : `\nCI    ${ciSummary.path} (게이트 ${ciSummary.gates.join("·")} / node ${ciSummary.nodeMajor}` +
          `${ciSummary.branches.length ? ` / 브랜치 ${ciSummary.branches.join(", ")}` : ""})`
    );
  }

  if (scaffoldResult) {
    if (scaffoldResult.created.length) console.log(`\n생성  ${scaffoldResult.created.join(", ")}`);
    if (scaffoldResult.skipped.length) console.log(`유지  ${scaffoldResult.skipped.join(", ")} (덮어쓰지 않았다. --force 로 덮어쓴다)`);
  } else if (opt.dryRun) {
    console.log("\n--dry-run — 파일을 만들지 않았다.");
  } else if (!canWrite) {
    console.log("\n필수 키가 채워지지 않아 스캐폴드를 건너뛰었다.");
  }

  console.log(
    result.questions.length === 0 && result.missing.length === 0
      ? "\nbootstrap: 자동 판정으로 프로파일이 완성됐다."
      : `\nbootstrap: 질문 ${result.questions.length}건이 남았다. 답을 받아 profile.json 을 채운 뒤 curvez:architecture-setup 으로 넘어간다.`
  );
  return 0;
}

process.exit(main());
