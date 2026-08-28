#!/usr/bin/env node
/**
 * 핸드오프 계약 검증기.
 *
 * 사용법:
 *   node validate-handoff.mjs                    # .curvez/handoff/*.json 전부 검사
 *   node validate-handoff.mjs <파일|디렉터리> [...]  # 지정한 것만 검사
 *
 * 스키마 단일 출처는 scripts/schema/handoff.schema.json 이다.
 * 이 스크립트는 그 스키마의 규칙을 의존성 없이 직접 검사한다.
 *
 * exit code: 오류 1건 이상이면 1.
 */

import { readdirSync, statSync, existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { Report } from "./lib/report.mjs";
import {
  HANDOFF_STATUSES,
  HANDOFF_REQUIRED_FIELDS,
  HANDOFF_OPTIONAL_FIELDS,
  ARTIFACT_KINDS,
  FINDING_REQUIRED_FIELDS,
  FINDING_SEVERITIES,
  FINDING_PRIORITIES,
} from "./lib/spec.mjs";

function collectTargets(args) {
  if (args.length > 0) {
    const files = [];
    for (const arg of args) {
      const p = resolve(arg);
      if (!existsSync(p)) {
        console.error(`경로를 찾을 수 없다: ${p}`);
        process.exit(2);
      }
      if (statSync(p).isDirectory()) files.push(...listJson(p));
      else files.push(p);
    }
    return files;
  }

  const dir = join(process.cwd(), ".curvez", "handoff");
  return existsSync(dir) ? listJson(dir) : [];
}

function listJson(dir) {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => join(dir, f));
}

/** 객체 배열 필드의 각 항목이 필수 키를 갖는지 검사한다. */
function checkItems(file, report, list, fieldName, requiredKeys, rule) {
  list.forEach((item, i) => {
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      report.error(file, null, rule, `${fieldName}[${i}] 이 객체가 아니다.`);
      return;
    }
    for (const key of requiredKeys) {
      const v = item[key];
      if (typeof v !== "string" || v.trim() === "") {
        report.error(
          file,
          null,
          rule,
          `${fieldName}[${i}].${key} 가 없거나 빈 문자열이다.`,
        );
      }
    }
  });
}

function validateHandoff(file, report) {
  report.track(file);

  let data;
  try {
    data = JSON.parse(readFileSync(file, "utf8"));
  } catch (err) {
    report.error(
      file,
      null,
      "handoff/invalid-json",
      `JSON 파싱 실패: ${err.message}`,
    );
    return;
  }

  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    report.error(file, null, "handoff/not-object", "최상위가 객체가 아니다.");
    return;
  }

  // 1. 필수 필드 존재
  for (const field of HANDOFF_REQUIRED_FIELDS) {
    if (!(field in data)) {
      report.error(
        file,
        null,
        "handoff/field-required",
        `\`${field}\` 가 없다. 필수: ${HANDOFF_REQUIRED_FIELDS.join(", ")}`,
      );
    }
  }

  // 1-1. 알 수 없는 최상위 키
  //      이유: 오타 키는 조용히 무시된다. 쓴 쪽은 데이터를 남겼다고 믿고 읽는 쪽은 그것을 못 본다.
  //      스키마의 `additionalProperties: false` 와 동작을 맞춘다.
  const allowedKeys = new Set([
    ...HANDOFF_REQUIRED_FIELDS,
    ...HANDOFF_OPTIONAL_FIELDS,
  ]);
  for (const key of Object.keys(data)) {
    if (!allowedKeys.has(key)) {
      report.error(
        file,
        null,
        "handoff/unknown-field",
        `알 수 없는 최상위 키 \`${key}\`. 허용: ${[...allowedKeys].join(", ")}. 오타인지 확인하라 — 모르는 키는 아무도 읽지 않는다.`,
      );
    }
  }

  // 2. from
  if (typeof data.from !== "string" || data.from.trim() === "") {
    report.error(
      file,
      null,
      "handoff/from-invalid",
      "from 이 비었다. 어떤 에이전트가 만든 결과인지 없으면 추적이 끊긴다.",
    );
  }

  // 3. to
  if (!Array.isArray(data.to) || data.to.length === 0) {
    report.error(
      file,
      null,
      "handoff/to-empty",
      "to 가 비었다. 받는 쪽이 없는 핸드오프는 아무도 읽지 않는다. 오케스트레이터에게 돌려줄 때도 명시하라.",
    );
  } else if (data.to.some((t) => typeof t !== "string" || t.trim() === "")) {
    report.error(file, null, "handoff/to-invalid", "to 에 빈 문자열이 있다.");
  }

  // 4. status
  if (!HANDOFF_STATUSES.includes(data.status)) {
    report.error(
      file,
      null,
      "handoff/status-invalid",
      `status \`${data.status}\` 는 허용값이 아니다. 허용: ${HANDOFF_STATUSES.join(", ")}`,
    );
  }

  // 5. summary
  if (typeof data.summary !== "string" || data.summary.trim() === "") {
    report.error(file, null, "handoff/summary-empty", "summary 가 비었다.");
  }

  // 6. 배열 필드 형태
  for (const field of [
    "artifacts",
    "decisions",
    "blocked_on",
    "verification",
  ]) {
    if (field in data && !Array.isArray(data[field])) {
      report.error(
        file,
        null,
        "handoff/field-not-array",
        `${field} 가 배열이 아니다. 없으면 빈 배열 \`[]\` 로 두어라.`,
      );
    }
  }

  const artifacts = Array.isArray(data.artifacts) ? data.artifacts : [];
  const decisions = Array.isArray(data.decisions) ? data.decisions : [];
  const blockedOn = Array.isArray(data.blocked_on) ? data.blocked_on : [];
  const verification = Array.isArray(data.verification)
    ? data.verification
    : [];

  checkItems(
    file,
    report,
    artifacts,
    "artifacts",
    ["path", "kind"],
    "handoff/artifact-invalid",
  );
  checkItems(
    file,
    report,
    decisions,
    "decisions",
    ["what", "why"],
    "handoff/decision-invalid",
  );
  checkItems(
    file,
    report,
    blockedOn,
    "blocked_on",
    ["question", "who"],
    "handoff/blocked-invalid",
  );
  checkItems(
    file,
    report,
    verification,
    "verification",
    ["command", "result"],
    "handoff/verification-invalid",
  );

  for (const [i, a] of artifacts.entries()) {
    if (a && typeof a.kind === "string" && !ARTIFACT_KINDS.includes(a.kind)) {
      report.error(
        file,
        null,
        "handoff/artifact-kind",
        `artifacts[${i}].kind \`${a.kind}\` 는 허용값이 아니다. 허용: ${ARTIFACT_KINDS.join(", ")}`,
      );
    }
  }

  // 6-1. findings — 리뷰 지적. 선택 필드지만 있으면 형태를 강제한다.
  //      이유: 두 리뷰어가 서로 다른 키 이름을 쓰면 오케스트레이터가 결과를 두 벌로 파싱해야 한다.
  if ("findings" in data && !Array.isArray(data.findings)) {
    report.error(
      file,
      null,
      "handoff/field-not-array",
      "findings 가 배열이 아니다. 없으면 키를 생략하거나 빈 배열로 두어라.",
    );
  }
  const findings = Array.isArray(data.findings) ? data.findings : [];

  // `where` 와 `evidence` 는 형태가 둘이라 문자열 전용 검사에서 뺀다.
  // 이유: 중복·순환 지적은 위치가 본질적으로 여럿이고, 실행으로 얻은 근거는 명령과 출력 둘이다.
  // 한 형태로 강제하면 그 정보를 문자열에 뭉개 넣게 되어 기계 판독이 오히려 어려워진다.
  const findingStringFields = FINDING_REQUIRED_FIELDS.filter(
    (k) => k !== "where",
  );
  checkItems(
    file,
    report,
    findings,
    "findings",
    findingStringFields,
    "handoff/finding-invalid",
  );

  for (const [i, f] of findings.entries()) {
    if (!f || typeof f !== "object") continue;

    // where: 문자열 또는 비지 않은 문자열 배열
    const where = f.where;
    const whereList = Array.isArray(where) ? where : [where];
    const whereOk =
      whereList.length > 0 &&
      whereList.every((w) => typeof w === "string" && w.trim() !== "");
    if (!whereOk) {
      report.error(
        file,
        null,
        "handoff/finding-where",
        `findings[${i}].where 가 비었다. 파일:라인 문자열 하나 또는 문자열 배열로 적어라. 위치 없는 지적은 재현할 수 없다.`,
      );
    }

    // evidence: 선택. 문자열 또는 { command, output }
    if (f.evidence !== undefined) {
      const e = f.evidence;
      const evidenceOk =
        (typeof e === "string" && e.trim() !== "") ||
        (e !== null &&
          typeof e === "object" &&
          !Array.isArray(e) &&
          typeof e.command === "string" &&
          e.command.trim() !== "" &&
          typeof e.output === "string");
      if (!evidenceOk) {
        report.error(
          file,
          null,
          "handoff/finding-evidence",
          `findings[${i}].evidence 형태가 잘못됐다. 문자열이거나 { command, output } 객체여야 한다.`,
        );
      }
    }
    if (f.severity !== undefined && !FINDING_SEVERITIES.includes(f.severity)) {
      report.error(
        file,
        null,
        "handoff/finding-severity",
        `findings[${i}].severity \`${f.severity}\` 는 허용값이 아니다. 허용: ${FINDING_SEVERITIES.join(", ")}`,
      );
    }
    if (f.priority !== undefined && !FINDING_PRIORITIES.includes(f.priority)) {
      report.error(
        file,
        null,
        "handoff/finding-priority",
        `findings[${i}].priority \`${f.priority}\` 는 허용값이 아니다. 허용: ${FINDING_PRIORITIES.join(", ")}`,
      );
    }
    if (f.severity === undefined && f.priority === undefined) {
      report.error(
        file,
        null,
        "handoff/finding-rank",
        `findings[${i}] 에 severity 도 priority 도 없다. 등급 없는 지적은 우선순위를 매길 수 없어 전부 같은 무게로 묻힌다.`,
      );
    }
  }

  // 7. 핵심 규칙 — done 은 검증 없이 선언할 수 없다.
  //    이유: 검증 없는 완료 선언이 하네스 전체의 신뢰를 무너뜨린다. 팀 병렬 실행에서는
  //    수신 에이전트가 송신 에이전트의 done 을 믿고 자기 작업을 시작하므로 오염이 전파된다.
  if (data.status === "done" && verification.length === 0) {
    report.error(
      file,
      null,
      "handoff/done-without-verification",
      "status 가 done 인데 verification 이 비었다. 실제로 돌린 명령과 결과를 최소 1건 남기거나 status 를 partial 로 낮춰라.",
    );
  }

  // 8. blocked 는 무엇에 막혔는지 있어야 한다.
  //    이유: blocked 는 실패가 아니라 정상 상태다. 다만 질문이 없으면 오케스트레이터가 풀어줄 수 없다.
  if (data.status === "blocked" && blockedOn.length === 0) {
    report.error(
      file,
      null,
      "handoff/blocked-without-question",
      "status 가 blocked 인데 blocked_on 이 비었다. 누구에게 무엇을 물어야 하는지 남겨라.",
    );
  }

  // 9. done 인데 미해결 질문이 남아 있으면 모순이다.
  if (data.status === "done" && blockedOn.length > 0) {
    report.error(
      file,
      null,
      "handoff/done-with-blockers",
      `status 가 done 인데 blocked_on 이 ${blockedOn.length}건 남아 있다. status 를 partial 또는 blocked 로 바꿔라.`,
    );
  }

  // 10. 결과물도 결정도 없는 done 은 한 일이 없다는 뜻이다.
  if (
    data.status === "done" &&
    artifacts.length === 0 &&
    decisions.length === 0
  ) {
    report.warn(
      file,
      null,
      "handoff/done-empty",
      "status 가 done 인데 artifacts 와 decisions 가 모두 비었다. 남긴 것이 없는 완료인지 확인하라.",
    );
  }
}

function main() {
  const targets = collectTargets(process.argv.slice(2));
  const report = new Report("핸드오프 검증");

  if (targets.length === 0) {
    console.log(
      "검사할 핸드오프가 없다. (.curvez/handoff/ 가 비었거나 존재하지 않는다)",
    );
    return 0;
  }

  for (const file of targets) validateHandoff(file, report);
  return report.print();
}

process.exit(main());
