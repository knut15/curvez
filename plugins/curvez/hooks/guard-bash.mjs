#!/usr/bin/env node
/**
 * PreToolUse(Bash) 가드.
 *
 * 두 가지를 막는다.
 *   1. 되돌리기 어려운 git 명령
 *   2. npm / yarn — curvez 는 pnpm 고정이다
 *
 * `jq` 대신 node 로 stdin 을 읽는다.
 * 이유: curvez 스크립트는 외부 의존성 0 이 원칙이다. `jq` 가 없는 환경에서 훅이 조용히
 * 실패하면 가드가 없는 상태로 명령이 통과한다 — 가드의 실패는 차단이 아니라 허용으로 나타난다.
 *
 * exit 2 = 차단(stderr 메시지가 모델에게 전달된다). exit 0 = 통과.
 */

import { readFileSync } from "node:fs";

/**
 * git 전역 옵션. 서브커맨드 앞에 끼어들 수 있다.
 *
 *   -C <경로>          작업 디렉터리 변경
 *   -c <키>=<값>       설정 덮어쓰기
 *   --git-dir=<경로>   저장소 지정
 *   --no-pager, -p     값 없는 플래그
 *
 * 이것을 건너뛰지 않으면 `git -C /tmp/x <서브커맨드>` 가 전부 우회한다.
 * 실측에서 3건이 통과했다 — 가드가 있다고 믿는 상태에서 없는 것이라 가장 나쁜 형태다.
 */
const GIT_GLOBAL = String.raw`(?:\s+(?:-[cC]\s+\S+|--[a-z][a-z-]*(?:=\S+)?|-[a-zA-Z]+))*`;

/** `git <전역옵션>* <서브커맨드>` 를 매치하는 정규식을 만든다. */
function gitCmd(sub) {
  return new RegExp(String.raw`\bgit\b` + GIT_GLOBAL + String.raw`\s+` + sub);
}

/**
 * 보호 브랜치 이름. 프로젝트마다 다르므로 흔한 것들을 함께 본다.
 *
 * 한계: 프로파일의 `git.protectedBranches` 를 읽지 않는다 — 훅은 프로젝트 컨텍스트 없이도
 * 동작해야 하고, 여기서 파일을 읽으면 프로파일이 없는 저장소에서 가드가 통째로 죽는다.
 */
const PROTECTED = String.raw`(?:main|master|release|develop|production)`;

/** 되돌리기 어렵거나 원격에 영향을 주는 명령. */
const DANGEROUS_GIT = [
  // 평범한 `git push` 는 막지 않는다.
  //
  // 원격에 커밋을 얹는 것은 append 라 되돌릴 수 있다 — revert 커밋 하나면 된다.
  // 반면 아래 두 가지는 원격의 이력을 **지운다**. 다른 사람이 이미 받아 간 커밋이면
  // 로컬에서 되돌릴 방법이 없다. 그래서 push 전체가 아니라 이 둘만 막는다.
  //
  // `-f` 축약형을 함께 잡는 이유: 아래 `--force` 규칙은 문자열 `--force` 만 본다.
  // push 규칙을 통째로 빼면 `git push -f` 가 어디에도 안 걸려 조용히 통과한다.
  {
    re: gitCmd(String.raw`push\b[^;&|]*\s(?:-f\b|--force\b(?!-with-lease))`),
    why: "강제 push 는 원격에 있던 남의 커밋을 덮어쓴다. 되돌릴 수 없다",
  },
  {
    re: gitCmd(String.raw`push\b[^;&|]*(?:\s--delete\b|\s:\S)`),
    why: "원격 브랜치·태그를 지운다. 받아 간 사람이 없으면 복구할 방법이 없다",
  },
  {
    re: gitCmd(String.raw`reset\s+--hard\b`),
    why: "커밋되지 않은 변경이 복구 불가능하게 사라진다",
  },
  {
    re: gitCmd(String.raw`clean\s+-[a-z]*f`),
    why: "추적되지 않는 파일이 사라진다. .env 나 로컬 설정이 포함될 수 있다",
  },
  // 로컬 브랜치 삭제 전체는 막지 않는다.
  //
  // 머지가 끝난 작업 브랜치를 지우는 것은 저장소를 쓰는 일상이고, 이 조작은 원격에 닿지
  // 않는다. 잘못 지워도 커밋은 reflog 에 남고 삭제 명령이 SHA 를 출력하므로
  // `git branch <이름> <SHA>` 로 되살린다 — 원격 이력을 지우는 push 와 손실의 성질이 다르다.
  //
  // 남기는 것은 보호 브랜치의 로컬 사본을 지우는 경우뿐이다. 이쪽은 되살릴 수는 있어도
  // 지울 이유가 없고, 지운 뒤에 벌어지는 혼란(추적 브랜치 소실, 잘못된 base 에서 분기)이 크다.
  // 축약형 `-D` 와 `--delete --force` 를 함께 본다. `-d`(머지된 것만 삭제)도 같이 잡는다.
  {
    re: gitCmd(
      String.raw`branch\b(?=[^;&|]*\s-(?:[a-zA-Z]*[dD]|-delete)\b)[^;&|]*\s` +
        PROTECTED +
        String.raw`(?![\w./-])`,
    ),
    why: "보호 브랜치의 로컬 사본을 지운다. 작업 브랜치를 정리하는 것이라면 그 브랜치 이름을 직접 적어라",
  },
  {
    re: gitCmd(String.raw`checkout\s+\.(\s|$)`),
    why: "작업 트리의 변경을 통째로 버린다",
  },
  {
    re: gitCmd(String.raw`restore\s+\.(\s|$)`),
    why: "작업 트리의 변경을 통째로 버린다",
  },
  // `--force` 는 git 명령일 때만 막는다.
  // 이유: 패턴만 보면 `pnpm install --force` 처럼 무해한 명령이 차단된다. 실측에서 걸렸다.
  //
  // `git branch` 는 여기서 제외한다. 제외하지 않으면 `--delete --force` 만 이 규칙에 걸려
  // 같은 조작인 `-D` 와 결과가 갈린다. 보호 브랜치는 바로 위 규칙이 이미 막는다.
  {
    re: /\bgit\b(?![^;&|]*\sbranch\b)[^;&|]*--force\b(?!-with-lease)/,
    why: "강제 갱신은 남의 커밋을 덮어쓸 수 있다",
  },
  // 보호 브랜치 대상 rebase.
  {
    re: gitCmd(String.raw`rebase\b[^;&|]*\b` + PROTECTED + String.raw`\b`),
    why: "공유 브랜치 rebase 는 이력을 갈라놓는다",
  },
];

/** pnpm 이 아닌 패키지 매니저. */
const WRONG_PM = [
  { re: /(^|[;&|]\s*)npm\s+(i|install|ci|add|update|run)\b/, name: "npm" },
  { re: /(^|[;&|]\s*)yarn\s+/, name: "yarn" },
];

function readInput() {
  try {
    const raw = readFileSync(0, "utf8");
    return raw.trim() ? JSON.parse(raw) : {};
  } catch {
    // 입력을 못 읽으면 판단할 근거가 없다. 통과시키되 조용히 넘어가지 않는다.
    process.stderr.write(
      "curvez 가드: 훅 입력을 파싱하지 못했다. 명령을 검사하지 못한 채 통과시킨다.\n",
    );
    process.exit(0);
  }
}

const input = readInput();
const command = input?.tool_input?.command;

if (typeof command !== "string" || command.trim() === "") process.exit(0);

for (const { re, why } of DANGEROUS_GIT) {
  if (re.test(command)) {
    process.stderr.write(
      `curvez 가드가 차단했다: ${command}\n` +
        `이유: ${why}\n` +
        `정말 필요하면 사용자에게 직접 실행을 요청하라. 우회 명령을 만들지 마라.\n`,
    );
    process.exit(2);
  }
}

for (const { re, name } of WRONG_PM) {
  if (re.test(command)) {
    process.stderr.write(
      `curvez 가드가 차단했다: ${name} 사용\n` +
        `이 프로젝트는 pnpm 고정이다. lockfile 이 갈리면 병렬 작업에서 설치 상태가 어긋나고,\n` +
        `어느 에이전트가 어떤 의존성으로 돌았는지 재현할 수 없게 된다.\n` +
        `${name} 대신 pnpm 으로 바꿔 다시 실행하라.\n`,
    );
    process.exit(2);
  }
}

process.exit(0);
