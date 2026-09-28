# 원칙 인덱스

여러 에이전트와 스킬에 걸쳐 적용되는 규칙을 원칙 하나당 파일 하나로 둔다. 원칙을 적용할 때는 이 목록에서
"언제" 가 맞는 항목을 찾아 **그 파일을 끝까지 읽는다.** 이 목록의 한 줄은 요약이고, 판정 질문과 패턴은
원칙 파일에만 있다.

항목 형식: `- **제목** ([slug](slug.md)) — 언제: <applies_when>. <규칙 문장>`
이 형식과 파일의 1:1 대응은 `scripts/validate-principles.mjs` 가 검사한다.

## 보고와 판단

- **추측하지 않고 blocked 로 돌아온다** ([blocked-over-guessing](blocked-over-guessing.md)) — 언제: 필요한 입력·결정·파일이 없거나 해석이 둘 이상일 때. 정보가 없으면 추측으로 채우지 않고 `status: blocked` 로 돌아와 `blocked_on` 에 무엇이 없는지 적는다.
- **두 번 재시도한 뒤 partial 로 보고한다** ([retry-twice-then-partial](retry-twice-then-partial.md)) — 언제: 같은 도구 호출이나 명령이 되풀이해 실패할 때. 같은 도구 호출이 실패하면 2회까지 재시도하고, 그래도 실패하면 `status: partial` 로 보고하며 무엇이 몇 번째에서 실패했는지 남긴다.
- **형용사가 아니라 수치로 보고한다** ([numbers-not-adjectives](numbers-not-adjectives.md)) — 언제: 검증 결과를 보고하거나 핸드오프의 verification 을 채울 때. "통과했다", "모두 정상", "이상 없음" 대신 실행한 명령과 출력에서 읽은 수치를 쓰고, 실패는 개수가 아니라 이름으로 적는다.
- **결정이 나지 않으면 정해진 순서로 고른다** ([tie-break-order](tie-break-order.md)) — 언제: 판단 기준표로 결정이 나지 않을 때. 판단 기준표로 결정이 나지 않으면 안전한 쪽 → 이미 적힌 기존 결정 → 하나를 고르고 되돌릴 지점을 남기는 순서로 정하고, 멈추지 않는다.
- **명령은 profile 에서만 읽는다** ([commands-from-profile](commands-from-profile.md)) — 언제: 검증·빌드·테스트 명령을 실행하거나 지시할 때. typecheck·lint·test·build 명령은 `.curvez/profile.json` 의 `commands` 에서만 읽고, 비어 있으면 명령을 지어내지 않고 그 게이트를 미검증으로 둔다.

## 팀 실행

- **워커는 오케스트레이터만 띄운다** ([orchestrator-owns-spawn](orchestrator-owns-spawn.md)) — 언제: 에이전트 정의에 도구를 주거나 워커를 띄울 때. `Agent` 도구는 `curvez-orchestrator` 만 갖고, 다른 에이전트와 스킬은 워커를 직접 띄우지 않는다.
- **소유 경로가 겹치면 순차로 돌린다** ([exclusive-ownership](exclusive-ownership.md)) — 언제: 워커를 병렬로 띄울지 정하거나 파일을 쓸 때. 워커는 자기 `owns` 경로 안에서만 쓰고, 소유 경로가 한 글자라도 겹치는 워커끼리는 병렬로 돌리지 않고 순차로 내린다.
- **리뷰어는 고치지 않는다** ([read-only-reviewer](read-only-reviewer.md)) — 언제: 리뷰·감사 에이전트를 정의하거나 리뷰를 수행할 때. 리뷰어는 코드를 고치지 않고 지적만 반환하며, Bash 로 파일을 바꾸는 우회도 하지 않는다.
- **질문은 모아서 한 번에 한다** ([batch-questions](batch-questions.md)) — 언제: 사용자에게 물어야 할 것이 생겼을 때. 사용자에게 할 질문은 라운드가 끝날 때 모아서 한 번에 묻고, 응답은 질문 원문과 짝지어 해당 워커에게 넘긴다.
- **되돌리기 어려운 행동은 승인을 받는다** ([approval-boundary](approval-boundary.md)) — 언제: 되돌리기 어려운 행동을 하기 직전. 팀 구성, 커밋·push·머지, 규약 수정처럼 되돌리기 어려운 행동은 사용자의 명시적 승인이 있을 때만 한다.

## 규약 작성

- **규칙에는 이유를 붙인다** ([why-first](why-first.md)) — 언제: 금지하거나 강제하는 규칙을 쓸 때. 금지하거나 강제하는 규칙 바로 뒤에 `**이유:**` 로 그 규칙이 없으면 무엇이 깨지는지 적는다.
- **같은 의미는 한 곳에만 둔다** ([single-source](single-source.md)) — 언제: 규칙·수치·형식·절차를 문서에 적을 때. 규칙·수치·형식·절차는 정본 한 곳에만 적고, 다른 곳은 그 경로를 가리킨다.
