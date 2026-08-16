/**
 * curvez 규약의 단일 출처.
 *
 * 에이전트·스킬 작성 규칙이 여러 곳에 흩어지면 스킬 문서와 검증기가 서로 다른 규칙을 말하게 된다.
 * 규칙 값은 전부 여기에 두고, 스킬 문서는 "무엇을·왜"만 설명한다.
 */

/** 에이전트 프론트매터 필수 필드. 하나라도 빠지면 검증 실패. */
export const AGENT_REQUIRED_FIELDS = [
  "name",
  "description",
  "tools",
  "disallowedTools",
  "model",
  "owns",
];

/**
 * `owns` 가 비어 있음을 나타내는 값. 읽기 전용 에이전트가 쓴다.
 *
 * 빈 값을 허용하지 않는 이유: 빈 칸은 "쓰는 경로가 없다" 와 "생각하지 않았다" 를 구분하지 못한다.
 * `none` 은 판단했다는 기록이다.
 */
export const OWNS_NONE = "none";

/**
 * 프로파일에서 값이 오는 경로는 심볼로 적는다. 리터럴 경로와 섞이지 않게 한다.
 *
 * 이유: `paths.web` 의 실제 값은 프로젝트마다 다르다. 정의에 `apps/web` 을 박으면
 * 그 값이 아닌 프로젝트에서 소유권 검사가 엉뚱한 경로를 비교하게 된다.
 */
export const OWNS_SYMBOLS = [
  "${paths.web}",
  "${paths.mobile}",
  "${paths.tests}",
  "${paths.domain}",
];

/**
 * 소유자를 둘 수 없는 경로.
 *
 * `paths.domain` 은 모노레포의 공유 도메인 패키지다. 한쪽 스택 사정으로 공유 시그니처를
 * 바꾸면 다른 스택이 조용히 깨지고, 그 깨짐은 그쪽 에이전트가 다음에 실행될 때까지
 * 발견되지 않는다. 그래서 소유자를 두지 않고, 이 경로를 건드리는 작업에서는
 * 구현 에이전트를 동시에 띄우지 않는다.
 */
export const UNOWNED_PATHS = ["${paths.domain}"];

/**
 * 소유권 검사에서 제외하는 경로.
 *
 * `.curvez/handoff/` 는 전원이 쓰지만 파일명이 `<from>.<timestamp>.json` 으로 고유해
 * 실제 충돌이 일어나지 않는다. 디렉터리 단위로 비교하면 전원이 충돌로 잡힌다.
 */
export const OWNS_SHARED_EXEMPT = [".curvez/handoff/"];

/** 에이전트 본문 필수 섹션. 헤딩 문자열과 순서가 고정이다. */
export const AGENT_REQUIRED_SECTIONS = [
  "핵심 역할",
  "판단 기준",
  "입출력 프로토콜",
  "팀 통신 프로토콜",
  "에러 핸들링",
  "협업과 팀 내 위치",
  "품질 자체 검증",
];

/** `model` 필드 허용값. */
export const ALLOWED_MODELS = ["opus", "sonnet", "haiku", "inherit"];

/** 쓰기 도구. 읽기 전용 에이전트는 이것들을 disallowedTools 에 넣어야 한다. */
export const WRITE_TOOLS = ["Write", "Edit", "NotebookEdit"];

/** 스킬 프론트매터 필수 필드. */
export const SKILL_REQUIRED_FIELDS = ["name", "description"];

/** 스킬 본문 필수 섹션. 트리거 경계를 강제한다. */
export const SKILL_REQUIRED_SECTIONS = [
  "언제 이 스킬을 쓰는가",
  "언제 쓰지 않는가",
];

/** SKILL.md 최대 줄 수. */
export const SKILL_MAX_LINES = 500;

/** 단일 섹션이 이 줄 수를 넘으면 references 분리를 권고한다(경고). */
export const SECTION_SOFT_LIMIT = 120;

/** description 최소 길이. 너무 짧으면 호출 신호가 부족하다. */
export const DESCRIPTION_MIN_LENGTH = 40;

/** description 에 있어야 할 따옴표 트리거 최소 개수. */
export const MIN_QUOTED_TRIGGERS = 3;

/** 핸드오프 status 허용값. */
export const HANDOFF_STATUSES = ["done", "blocked", "partial"];

/** 핸드오프 필수 최상위 필드. */
export const HANDOFF_REQUIRED_FIELDS = [
  "from",
  "to",
  "status",
  "summary",
  "artifacts",
  "decisions",
  "blocked_on",
  "verification",
];

/**
 * 핸드오프의 선택 최상위 필드.
 *
 * 필수 필드와 합쳐 이것이 허용 키의 전부다. 그 외 키는 오류로 잡는다.
 * 이유: 오타 키(`verifications` 같은)는 조용히 무시되어, 쓴 쪽은 데이터를 남겼다고 믿고
 * 읽는 쪽은 그 데이터를 못 본다. 스키마의 `additionalProperties: false` 와 동작을 맞춘다.
 */
export const HANDOFF_OPTIONAL_FIELDS = ["findings"];

/**
 * 리뷰 지적(`findings[]`) 항목의 필수 키.
 *
 * 두 리뷰어가 같은 이름을 써야 오케스트레이터가 한 벌로 파싱한다.
 * `where` 를 필수로 둔 이유: 파일:라인이 없는 지적은 재현할 수 없고, 재현 못 하는 지적은
 * 수신 에이전트가 추측으로 고치게 만든다.
 */
export const FINDING_REQUIRED_FIELDS = ["id", "kind", "where", "what", "why"];

/** curvez-reviewer 의 심각도 등급. */
export const FINDING_SEVERITIES = ["blocker", "major", "minor"];

/** curvez-structure-reviewer 의 우선순위. */
export const FINDING_PRIORITIES = ["P0", "P1", "P2", "P3"];

/**
 * artifact.kind 허용값.
 *
 * `commit`·`pr` 은 파일이 아니라 이력의 식별자다. `code` 로 뭉치면 "무엇이 커밋됐나" 를
 * 찾을 때 소스 파일과 섞여 구분되지 않는다. `path` 에는 `git:<해시>` 또는 PR URL 을 적는다.
 *
 * `retro` 를 `doc` 과 따로 두는 이유: 다음 회고가 이전 회고를 핸드오프 로그에서 찾아
 * 같은 액션 아이템이 반복됐는지 대조한다. 일반 문서와 같은 kind 를 쓰면 그 조회가
 * 프로젝트의 모든 문서를 훑게 되어 신호가 묻힌다.
 */
export const ARTIFACT_KINDS = [
  "decision",
  "code",
  "doc",
  "test",
  "spec",
  "research",
  "review",
  "retro",
  "commit",
  "pr",
];
