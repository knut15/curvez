#!/usr/bin/env node
/**
 * curvez 종합 점검기.
 *
 * 사용법:
 *   node doctor.mjs            # 플러그인 자체 + 현재 프로젝트를 함께 점검
 *   node doctor.mjs --plugin   # 플러그인 자체만 점검
 *
 * 검증기 3종을 순차 실행하고 결과를 한 화면에 모은다.
 * exit code: 하나라도 실패하면 1.
 */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = resolve(__dirname, "..");

const pluginOnly = process.argv.includes("--plugin");

/** 검증기 하나를 돌리고 성공 여부를 돌려준다. */
function run(label, script, args) {
  console.log(`\n── ${label} ──`);
  const result = spawnSync(
    process.execPath,
    [join(__dirname, script), ...args],
    { stdio: "inherit" },
  );
  return result.status === 0;
}

/**
 * 고립된 문서가 없는지 본다.
 *
 * curvez 의 참조는 층위마다 형태가 다르다. 마크다운 링크만 세면 대부분이 고립으로 잡힌다 —
 * 실제로 이름 참조를 못 보고 9건을 오탐한 적이 있다.
 *
 *   에이전트  → 이름(`curvez-designer`)으로 참조된다. 제어면 등록 검사가 따로 본다
 *   스킬      → 이름(`curvez:wireframe-spec`, `skills/<name>`)으로 참조된다
 *   docs      → README 인덱스에서 링크로 도달해야 한다
 *   references→ 소속 SKILL.md 가 포인터로 가리켜야 한다 (validate-skills 가 본다)
 *
 * 여기서는 스킬과 docs 두 층을 본다. 나머지는 각자의 검사가 담당한다.
 */
function checkOrphanDocs() {
  const problems = [];

  // 저장소 전체 텍스트를 한 번만 읽는다.
  const corpus = [];
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (["node_modules", ".git", ".omc"].includes(e.name)) continue;
      const full = join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (/\.(md|mjs|json)$/.test(e.name))
        corpus.push({ path: full, text: readFileSync(full, "utf8") });
    }
  };
  walk(PLUGIN_ROOT);

  // 1) 스킬 — 자기 파일 밖에서 이름으로 참조되는가
  const skillsDir = join(PLUGIN_ROOT, "skills");
  if (existsSync(skillsDir)) {
    for (const e of readdirSync(skillsDir, { withFileTypes: true })) {
      if (!e.isDirectory()) continue;
      const own = join(skillsDir, e.name, "SKILL.md");
      if (!existsSync(own)) continue;
      const re = new RegExp(`curvez:${e.name}|\`${e.name}\`|skills/${e.name}`);
      const found = corpus.some(
        (c) => !c.path.startsWith(join(skillsDir, e.name)) && re.test(c.text),
      );
      if (!found)
        problems.push(
          `스킬 \`${e.name}\` 을 아무도 가리키지 않는다. 호출 경로가 없다`,
        );
    }
  }

  // 2) docs — README 인덱스에서 도달 가능한가
  const docsDir = join(PLUGIN_ROOT, "docs");
  const readmePath = join(docsDir, "README.md");
  if (existsSync(readmePath)) {
    const readme = readFileSync(readmePath, "utf8");
    for (const f of readdirSync(docsDir).filter(
      (n) => n.endsWith(".md") && n !== "README.md",
    )) {
      if (!readme.includes(f))
        problems.push(
          `docs/${f} 가 README 인덱스에 없다. 아무도 찾아가지 못한다`,
        );
    }
  }

  return { ok: problems.length === 0, problems };
}

/**
 * 문서가 말하는 개수·존재 여부가 실제와 맞는지 본다.
 *
 * 이유: 산출물이 늘어도 문서는 자동으로 갱신되지 않는다. 실제로 에이전트가 12종이 된 뒤에도
 * README 는 "11종" 이라고 말했고, 실행기 4개가 생긴 뒤에도 "없음" 이라고 적혀 있었다.
 * 문서는 사용자가 가장 먼저 읽는 것이라, 여기가 틀리면 나머지가 맞아도 신뢰를 잃는다.
 *
 * "N종" 패턴과 "없음/미구현" 서술 두 가지를 본다.
 */
function checkDocDrift() {
  const counts = {
    에이전트: readdirSync(join(PLUGIN_ROOT, "agents")).filter((f) =>
      f.endsWith(".md"),
    ).length,
    스킬: readdirSync(join(PLUGIN_ROOT, "skills"), {
      withFileTypes: true,
    }).filter(
      (d) =>
        d.isDirectory() &&
        existsSync(join(PLUGIN_ROOT, "skills", d.name, "SKILL.md")),
    ).length,
  };

  // 실제로 존재하는데 문서가 "없다" 고 말하면 안 되는 것들
  const shouldExist = [
    "scripts/bootstrap.mjs",
    "scripts/quality-gate.mjs",
    "presets/architecture/ddd.md",
    "hooks/hooks.json",
  ].filter((r) => existsSync(join(PLUGIN_ROOT, r)));

  // 검사 대상은 docs 뿐이 아니다. 에이전트 정의와 스킬에도 시점 서술이 남는다.
  // 실제로 "6단계 산출물이라 아직 없다" 가 agents/·skills/ 에 5곳 남아 있었는데
  // 검사가 docs/ 와 루트만 보고 있어 전부 놓쳤다.
  const docs = [];
  const collect = (dir, depth = 0) => {
    if (!existsSync(dir) || depth > 2) return;
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (["node_modules", ".git", ".omc"].includes(e.name)) continue;
      const full = join(dir, e.name);
      if (e.isDirectory()) collect(full, depth + 1);
      else if (e.name.endsWith(".md")) docs.push(full);
    }
  };
  for (const r of ["docs", "agents", "skills", "presets"])
    collect(join(PLUGIN_ROOT, r));
  const repoRoot = resolve(PLUGIN_ROOT, "..", "..");
  if (existsSync(repoRoot)) {
    for (const f of readdirSync(repoRoot).filter((n) => n.endsWith(".md")))
      docs.push(join(repoRoot, f));
  }

  const problems = [];
  /**
   * 코드펜스와 인라인 백틱을 지운다.
   *
   * 이유: 규칙을 *설명하는* 문서가 그 규칙의 위반으로 잡힌다. 실제로 "빌드 N단계 를 쓰지 마라"
   * 라고 적은 README 가 드리프트로 검출됐다. TODO 마커 검사에서 겪은 것과 같은 자기참조 문제다.
   * 예시와 금지 목록은 백틱이나 코드블록 안에 두는 것이 규약이므로, 그것을 지우면 걸러진다.
   */
  const strip = (t) =>
    t.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");

  for (const file of docs) {
    const text = strip(readFileSync(file, "utf8"));
    const rel = file.slice(PLUGIN_ROOT.length + 1) || file;

    for (const [label, actual] of Object.entries(counts)) {
      // 마크다운 강조(`**12종**`)와 표 구분자(`| 12종`)는 건너뛰되,
      // 사이에 다른 라벨이 끼면 표 행을 가로지른 것이므로 버린다.
      const patterns = [
        new RegExp(`${label}([^\\n]{0,12}?)(\\d+)\\s*종`, "g"),
        new RegExp(`(\\d+)\\s*종([^\\n]{0,4}?)${label}`, "g"),
      ];
      const others = Object.keys(counts).filter((k) => k !== label);
      // 부분집합을 가리키는 수식어. "스킬 나머지 10종" 은 전체 개수가 아니다.
      const SUBSET = /나머지|구현|리뷰|읽기 전용|코어|추가/;
      // 연결어가 끼면 다른 항목으로 넘어간 것이다.
      // "에이전트와 15종 스킬" 에서 15는 스킬 개수지 에이전트 개수가 아니다.
      const JOINER = /[와과·,]|및|그리고/;

      for (const [idx, re] of patterns.entries()) {
        let m;
        while ((m = re.exec(text)) !== null) {
          const gap = idx === 0 ? m[1] : m[2];
          const said = Number(idx === 0 ? m[2] : m[1]);
          if (said === actual) continue;
          if (others.some((o) => gap.includes(o))) continue; // 표 행 가로지름
          if (JOINER.test(gap)) continue; // 다른 항목으로 넘어감
          if (SUBSET.test(gap)) continue; // 부분집합 수식어
          if (said < actual / 2) continue; // 부분집합 추정
          problems.push(`${rel}: "${label}…${said}종" → 실제 ${actual}종`);
        }
      }
    }

    // "N/N" 완료 비율 표기 — "에이전트 11/11" 처럼 쓴 것이 실제 개수와 맞는가.
    // 이유: "N종" 패턴만 보면 비율 표기를 놓친다. 실제로 GOAL 완료 기준의
    // `에이전트 11/11 · 스킬 13/13` 이 12/12·15/15 가 된 뒤에도 그대로 남아 있었다.
    for (const [label, actual] of Object.entries(counts)) {
      const re = new RegExp(`${label}[^\\n]{0,8}?(\\d+)\\s*/\\s*(\\d+)`, "g");
      let m;
      while ((m = re.exec(text)) !== null) {
        const [num, den] = [Number(m[1]), Number(m[2])];
        // 분모가 전체 개수를 뜻하는 표기만 본다. 분자 < 분모면 진행률이라 대상이 아니다.
        if (num !== den) continue;
        if (den === actual) continue;
        problems.push(
          `${rel}: "${label}…${num}/${den}" → 실제 ${actual}/${actual}`,
        );
      }
    }

    // 워커 수 표기 — "라인업 N종", "팀 인원 상한은 N명" 은 오케스트레이터를 뺀 워커 수다.
    // "에이전트 라인업 N종" 처럼 라벨이 붙으면 전체 개수라 위 라벨 검사가 이미 본다.
    //
    // 이유: 13번째 에이전트를 추가할 때 "11종" 다섯 곳을 12로 일괄 치환했는데, 그중 두 곳
    // ("팀 명단 N종 중 Agent 가 있는 것은 이 에이전트뿐")은 오케스트레이터를 포함해 세는
    // 문장이라 13이어야 했다. 라벨 붙은 개수만 보던 이 검사는 다섯 곳 전부를 몰랐다.
    // 그래서 포함해 세는 문장은 수를 빼고 쓰는 것이 규약이고("라인업 전체에서"),
    // 남아 있는 개수 표기는 전부 워커 수로 판정한다.
    // migration.md 는 버전 시점에 얼린 이력이라 제외한다.
    if (!file.endsWith("migration.md")) {
      const workers = counts.에이전트 - 1;
      for (const m of text.matchAll(
        /(에이전트\s*)?(라인업|팀 명단|팀 인원)[^\n]{0,10}?(\d+)\s*[종명]/g,
      )) {
        if (m[1]) continue;
        const said = Number(m[3]);
        if (said !== workers) {
          problems.push(
            `${rel}: "${m[2]}…${said}" → 워커는 오케스트레이터를 뺀 ${workers}. 전체를 세는 문장이면 수를 빼고 쓴다`,
          );
        }
      }
    }

    // 빌드 시점 서술 — "N단계 산출물이라 아직 없다" 류.
    // 이유: 파일명 리터럴만 보면 `presets/architecture/<이름>.md` 같은 플레이스홀더나
    // "6단계 산출물" 같은 표현을 놓친다. 실제로 이 형태로 6곳이 남아 있었다.
    for (const m of text.matchAll(
      /[^\n]*(빌드 \d단계|\d단계 산출물|아직 생성 전|아직 존재하지 않는|지금은 존재하지 않는|늦게 생긴다)[^\n]*/g,
    )) {
      problems.push(`${rel}: 빌드 시점 서술 — "${m[0].trim().slice(0, 60)}…"`);
    }

    for (const item of shouldExist) {
      const base = item.split("/").pop();
      const re = new RegExp(`[^\\n]*${base.replace(".", "\\.")}[^\\n]*`, "g");
      let m;
      while ((m = re.exec(text)) !== null) {
        if (/\*\*없음\*\*|없음\b|미구현|아직 없/.test(m[0])) {
          problems.push(`${rel}: "${base}" 를 없다고 적었지만 존재한다`);
        }
      }
    }
  }
  return { ok: problems.length === 0, problems: [...new Set(problems)] };
}

/**
 * 에이전트가 제어면에 등록됐는지 본다.
 *
 * 정의가 규약을 지키는 것과 오케스트레이터가 그 존재를 아는 것은 다르다.
 * 실제로 `curvez-git` 을 만들고 세 곳 어디에도 등록하지 않아, 검증은 전부 통과하는데
 * 라운드 그래프에 자리가 없어 호출될 수 없는 상태가 됐다.
 *
 * 오케스트레이터 자신은 제외한다 — 자기를 자기 통신 표에 적지 않는다.
 */
function checkControlPlane() {
  const registries = [
    "agents/curvez-orchestrator.md",
    "skills/team-orchestration/SKILL.md",
    "docs/team-execution.md",
  ];
  const texts = registries.map((r) => {
    const p = join(PLUGIN_ROOT, r);
    return { rel: r, text: existsSync(p) ? readFileSync(p, "utf8") : "" };
  });

  const dir = join(PLUGIN_ROOT, "agents");
  if (!existsSync(dir)) return { ok: true, orphans: [] };

  const orphans = [];
  for (const f of readdirSync(dir).filter((n) => n.endsWith(".md"))) {
    const name = f.slice(0, -3);
    if (name === "curvez-orchestrator") continue;
    const missing = texts
      .filter((t) => !t.text.includes(name))
      .map((t) => t.rel);
    if (missing.length) orphans.push({ name, missing });
  }
  return { ok: orphans.length === 0, orphans };
}

/**
 * 훅 매니페스트가 로드 가능한 형태인지 본다.
 *
 * 파일이 존재한다는 것과 로더가 읽을 수 있다는 것은 다르다. 실제로 최상위 `hooks` 키가 없어
 * 훅 4개가 전부 등록되지 않은 상태로 "구조 OK" 가 나온 적이 있다 —
 * 스크립트를 직접 실행하면 동작하므로 검증에서도 통과처럼 보였다.
 */
function checkHookManifest() {
  const p = join(PLUGIN_ROOT, "hooks", "hooks.json");
  if (!existsSync(p)) return { ok: false, why: "hooks/hooks.json 이 없다" };

  let d;
  try {
    d = JSON.parse(readFileSync(p, "utf8"));
  } catch (e) {
    return { ok: false, why: `JSON 파싱 실패: ${e.message}` };
  }

  if (!d.hooks || typeof d.hooks !== "object") {
    return {
      ok: false,
      why: "최상위 `hooks` 키가 없다. 이벤트를 루트에 두면 로더가 읽지 못한다",
    };
  }

  const problems = [];
  for (const [event, entries] of Object.entries(d.hooks)) {
    if (!Array.isArray(entries)) {
      problems.push(`${event} 이 배열이 아니다`);
      continue;
    }
    entries.forEach((e, i) => {
      if (!Array.isArray(e.hooks) || e.hooks.length === 0) {
        problems.push(`${event}[${i}] 에 hooks 배열이 없다`);
        return;
      }
      e.hooks.forEach((h, j) => {
        if (h.type !== "command")
          problems.push(
            `${event}[${i}].hooks[${j}].type 이 "command" 가 아니다`,
          );
        if (typeof h.command !== "string" || !h.command.trim())
          problems.push(`${event}[${i}].hooks[${j}].command 가 비었다`);
      });
    });
  }
  return problems.length
    ? { ok: false, why: problems.join(", ") }
    : { ok: true, events: Object.keys(d.hooks) };
}

/**
 * 등급 B — 런타임 완비 검사.
 *
 * GOAL 이 약속했지만 아직 없을 수 있는 것들이다. 없어도 정적 규약은 성립하므로
 * **exit code 에 반영하지 않는다.** 대신 무엇이 비었는지 이름을 대고 드러낸다.
 *
 * 이 등급을 따로 둔 이유: 검사 목록이 "지금 있는 파일" 로만 이뤄져 있으면
 * doctor 통과가 곧 완료로 읽힌다. 실제로 `bootstrap.mjs` 와 `quality-gate.mjs` 가
 * 없는 상태에서도 "검사 3종 전부 정상" 이 나왔고, 그 출력이 완료 근거로 쓰였다.
 * 검증기가 자기 검사 범위를 밝히지 않으면 통과 자체가 위장이 된다.
 */
function checkRuntimeReadiness() {
  console.log("\n── 런타임 완비 (참고) ──");

  // 디렉터리 존재가 아니라 **파일 목록**을 본다.
  // 이유: 디렉터리만 확인하면 프리셋이 1종이든 4종이든 "완비" 가 나온다.
  // 실제로 3종을 지운 뒤에도 3/3 완비가 출력됐다.
  const expected = [
    {
      path: "presets/architecture/ddd.md",
      what: "DDD 아키텍처 프리셋",
      fallback: "curvez-architect 의 내장 폴백 레이어",
    },
    {
      path: "presets/stack/nextjs.md",
      what: "Next.js 스택 프리셋",
      fallback: "curvez:bootstrap 의 감지 절차만으로 진행",
    },
    {
      path: "presets/stack/react-native.md",
      what: "RN 스택 프리셋",
      fallback: "위와 같음",
    },
    {
      path: "presets/stack/monorepo.md",
      what: "모노레포 스택 프리셋",
      fallback: "위와 같음",
    },
    { path: "docs/README.md", what: "문서 인덱스", fallback: "없음" },
    {
      path: "hooks/tests/guard-bash.test.py",
      what: "가드 회귀 테스트",
      fallback: "없음 — 우회가 조용히 다시 뚫린다",
    },
    {
      path: "hooks/tests/guard-forbidden-words.test.py",
      what: "금지어 가드 회귀 테스트",
      fallback: "없음 — 합성어 오탐이 조용히 늘어난다",
    },
  ];

  const missing = [];
  for (const item of expected) {
    if (existsSync(join(PLUGIN_ROOT, item.path))) {
      console.log(`OK   ${item.path}`);
    } else {
      console.log(`없음 ${item.path} — ${item.what}`);
      console.log(`     대체: ${item.fallback}`);
      missing.push(item.path);
    }
  }

  const total = expected.length;
  const have = total - missing.length;
  console.log(
    missing.length === 0
      ? `완비 ${have}/${total} — 런타임 구성요소 전부 존재`
      : `완비 ${have}/${total} — ${missing.length}개 미구현. 정적 규약과 별개이며 exit code 에 반영하지 않는다`,
  );
  return { have, total, missing };
}

/**
 * 등급 A — 정적 규약 검사. 파일이 없으면 설치가 깨진 것이다.
 *
 * 여기 있는 것만 exit code 를 좌우한다.
 */
function checkStructure() {
  console.log("── 플러그인 구조 ──");
  const required = [
    ".claude-plugin/plugin.json",
    "scripts/lib/spec.mjs",
    "scripts/lib/frontmatter.mjs",
    "scripts/lib/report.mjs",
    "scripts/schema/handoff.schema.json",
    "scripts/validate-agents.mjs",
    "scripts/validate-skills.mjs",
    "scripts/validate-handoff.mjs",
    "scripts/new-agent.mjs",
    "scripts/new-skill.mjs",
    "scripts/bootstrap.mjs",
    "scripts/quality-gate.mjs",
    "hooks/hooks.json",
    "hooks/guard-bash.mjs",
    "hooks/guard-forbidden-words.mjs",
    "hooks/validate-on-write.mjs",
    "hooks/check-handoff.mjs",
    "hooks/notify-update.mjs",
  ];

  let missing = 0;
  for (const rel of required) {
    if (!existsSync(join(PLUGIN_ROOT, rel))) {
      console.log(`FAIL ${rel} 이 없다.`);
      missing += 1;
    }
  }
  console.log(
    missing === 0
      ? `OK 플러그인 구조 — 필수 파일 ${required.length}개 전부 존재`
      : `FAILED 플러그인 구조 — ${missing}개 누락`,
  );
  return missing === 0;
}

function main() {
  const results = [];

  results.push(["플러그인 구조", checkStructure()]);

  const hookManifest = checkHookManifest();
  console.log(
    hookManifest.ok
      ? `OK 훅 매니페스트 — 이벤트 ${hookManifest.events.join(", ")} 등록 가능`
      : `FAIL 훅 매니페스트 — ${hookManifest.why}`,
  );
  results.push(["훅 매니페스트", hookManifest.ok]);

  const cp = checkControlPlane();
  if (cp.ok) {
    console.log(
      "OK 제어면 등록 — 모든 에이전트가 오케스트레이터·팀 스킬·docs 에 등록됨",
    );
  } else {
    for (const o of cp.orphans) {
      console.log(
        `FAIL 제어면 등록 — ${o.name} 이 등록되지 않았다: ${o.missing.join(", ")}`,
      );
    }
    console.log(
      "     정의만으로는 호출되지 않는다. authoring-agents 의 `### 4. 제어면에 등록한다` 를 따르라.",
    );
  }
  results.push(["제어면 등록", cp.ok]);

  const drift = checkDocDrift();
  if (drift.ok) {
    console.log("OK 문서 동기화 — 개수·구현 상태 서술이 실제와 일치");
  } else {
    for (const d of drift.problems) console.log(`FAIL 문서 동기화 — ${d}`);
  }
  results.push(["문서 동기화", drift.ok]);

  const orphan = checkOrphanDocs();
  if (orphan.ok) {
    console.log("OK 문서 연결 — 고립된 스킬·문서 없음");
  } else {
    for (const o of orphan.problems) console.log(`FAIL 문서 연결 — ${o}`);
  }
  results.push(["문서 연결", orphan.ok]);

  const agentTargets = [join(PLUGIN_ROOT, "agents")];
  const skillTargets = [join(PLUGIN_ROOT, "skills")];
  const handoffTargets = [];

  if (!pluginOnly) {
    const projectAgents = join(process.cwd(), ".claude", "agents");
    const projectSkills = join(process.cwd(), ".claude", "skills");
    const projectHandoff = join(process.cwd(), ".curvez", "handoff");
    if (existsSync(projectAgents)) agentTargets.push(projectAgents);
    if (existsSync(projectSkills)) skillTargets.push(projectSkills);
    if (existsSync(projectHandoff)) handoffTargets.push(projectHandoff);
  }

  const existingAgents = agentTargets.filter(existsSync);
  const existingSkills = skillTargets.filter(existsSync);

  if (existingAgents.length > 0) {
    results.push([
      "에이전트",
      run("에이전트 검증", "validate-agents.mjs", existingAgents),
    ]);
  } else {
    console.log("\n── 에이전트 검증 ──\n건너뜀 — agents/ 디렉터리가 없다.");
  }

  if (existingSkills.length > 0) {
    results.push([
      "스킬",
      run("스킬 검증", "validate-skills.mjs", existingSkills),
    ]);
  } else {
    console.log("\n── 스킬 검증 ──\n건너뜀 — skills/ 디렉터리가 없다.");
  }

  if (handoffTargets.length > 0) {
    results.push([
      "핸드오프",
      run("핸드오프 검증", "validate-handoff.mjs", handoffTargets),
    ]);
  } else {
    console.log("\n── 핸드오프 검증 ──\n건너뜀 — .curvez/handoff/ 가 없다.");
  }

  const readiness = checkRuntimeReadiness();

  const failed = results.filter(([, ok]) => !ok);
  console.log("\n── 종합 ──");
  console.log("[A] 정적 규약 — exit code 를 좌우한다");
  for (const [label, ok] of results) {
    console.log(`    ${ok ? "OK  " : "FAIL"} ${label}`);
  }
  console.log(
    failed.length === 0
      ? `    통과 — 검사 ${results.length}종 전부 정상`
      : `    실패 — ${failed.length}/${results.length}종: ${failed.map(([l]) => l).join(", ")}`,
  );

  console.log("\n[B] 런타임 완비 — 참고 정보. exit code 와 무관하다");
  console.log(
    readiness.missing.length === 0
      ? `    완비 ${readiness.have}/${readiness.total}`
      : `    완비 ${readiness.have}/${readiness.total} — 미구현: ${readiness.missing.join(", ")}`,
  );

  // 두 등급을 한 문장으로 다시 못 박는다.
  // 이유: 위쪽 출력을 흘려보고 마지막 줄만 읽는 경우가 많다. 그 한 줄이 A 만 말하면
  // B 가 비어 있어도 "통과" 로 읽힌다 — doctor 의 이름이 실제 검사 범위보다 넓게 들린다.
  if (failed.length === 0 && readiness.missing.length > 0) {
    console.log(
      `\ndoctor: 정적 규약 통과. 다만 런타임 ${readiness.missing.length}개가 미구현이라 "설치 후 즉시 자동 실행" 은 아직 성립하지 않는다.`,
    );
  } else if (failed.length === 0) {
    console.log("\ndoctor: 정적 규약 통과, 런타임 완비.");
  } else {
    console.log("\ndoctor: 정적 규약 실패. 위 FAIL 항목을 먼저 고쳐라.");
  }

  return failed.length === 0 ? 0 : 1;
}

process.exit(main());
