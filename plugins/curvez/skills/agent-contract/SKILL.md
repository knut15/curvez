---
name: agent-contract
description: 오케스트레이터가 워커에게 주는 지시서와, 워커가 작업을 마치고 다음 담당에게 넘기는 핸드오프 계약을 쓰고 읽고 검증한다. "핸드오프", "handoff", "인계", "결과 넘겨", "계약 써줘", "작업 완료 보고", "다음 에이전트한테 넘겨", "지시서", "brief", "hand off to" 라고 하거나 워커를 띄우거나 서브에이전트가 결과를 반환할 때 실행한다.
---

지시서와 핸드오프는 curvez 팀 실행의 유일한 통신 수단이다. 에이전트끼리 실시간으로 대화하지 못하므로,
들어가는 지시서와 나오는 핸드오프가 곧 API 다. 계약이 깨지면 수신 에이전트가 잘못된 전제 위에서 자기
작업을 시작하고, 오염이 팀 전체로 전파된다.

## 언제 이 스킬을 쓰는가

- 오케스트레이터가 워커를 띄우며 지시서를 쓸 때
- 에이전트가 맡은 작업을 끝내고 결과를 넘길 때
- 다른 에이전트가 남긴 핸드오프를 읽고 자기 작업을 시작할 때
- 오케스트레이터가 여러 핸드오프를 수합해 다음 단계를 정할 때
- `status` 를 `done` 으로 올려도 되는지 판정할 때
- 핸드오프 파일이 스키마를 지키는지 검증할 때

## 언제 쓰지 않는가

- 에이전트 정의 파일(`agents/*.md`)을 새로 만들거나 고칠 때 → `authoring-agents` 를 쓴다
- 스킬 문서를 만들거나 고칠 때 → `authoring-skills` 를 쓴다
- 사용자에게 최종 보고할 때 → 핸드오프는 에이전트 간 통신이다. 사용자 보고는 자연어로 따로 쓴다

**이유:** 핸드오프는 기계가 읽는 계약이고 사용자 보고는 사람이 읽는 문장이다. 둘을 섞으면
계약에 서사가 섞여 파싱이 깨지고, 보고에 스키마가 섞여 사람이 읽지 못한다.

## 지시서

오케스트레이터가 `curvez:*` 워커를 띄울 때 프롬프트는 아래 칸으로 쓴다. 칸 이름은 줄 맨 앞에 쓰고,
다음 칸이 나오기 전까지가 그 칸의 값이다. 칸 목록의 정본은 `scripts/lib/spec.mjs` 의 `BRIEF_FIELDS` 다.

```
GOAL:       한 문장. 이 대화를 모르는 사람도 실행할 수 있게 결과를 쓴다
SCOPE:      쓸 수 있는 경로(그 워커의 owns)와 읽기만 하는 경로
CONTEXT:    읽을 입력 파일의 경로. 앞 단계 핸드오프에 기대면 그 핸드오프 경로
ACCEPTANCE: 판정할 수 있는 기준. 한 줄에 하나. .curvez/requirements.md 의 AC ID 를 쓴다
VERIFY:     실행할 명령. profile.json 의 commands 에서 옮긴다
FORBIDDEN:  소유 경로 밖 쓰기, 의존성 추가, 강제 push, 그리고 이 작업만의 금지
REPORT:     핸드오프 경로와 status 규칙. 막히면 추측하지 말고 status: blocked 로 돌아오라는 지시
STANDING:   .curvez/standing.md
```

- `GOAL`·`SCOPE`·`REPORT` 가 아닌 칸은 `없음: <이유>` 로 비울 수 있다. 예) `CONTEXT: 없음: 첫 라운드라 앞 산출물이 없다`
- 작은 작업은 칸 값을 한 줄로 줄인다. 칸 자체는 빼지 않는다
- 읽기 전용 리뷰어의 `REPORT` 는 "응답 전체를 핸드오프 JSON 으로만 반환하라" 다
- `hooks/check-brief.mjs` 가 띄우기 직전에 칸을 검사하고, 빠지거나 빈 칸이 있으면 호출을 막는다

**이유:** 워커는 팀 명단도, 다른 워커의 소유 경로도, 이 작업이 왜 필요한지도 모른다. 프롬프트에 없는
것은 워커가 추측하고, 그 추측은 핸드오프를 받은 뒤에야 드러난다. 칸을 고정하면 무엇이 빠졌는지가
띄우기 전에 보인다.

### 고정 지시문 — `.curvez/standing.md`

모든 워커에게 매번 적용하는 제약을 모은 파일이다. 오케스트레이터가 쓰고, 첫 워커를 띄우기 전에 없으면
만든다. 번호 붙은 줄 하나에 제약 하나를 쓴다.

- 같은 지시를 두 번째로 하게 되면 지시하기 전에 여기에 한 줄을 더한다
- 워커는 `STANDING` 칸의 경로를 읽고 따른다

**이유:** 라운드가 이어질수록 처음에 한 지시가 흐려진다. 매번 프롬프트에 새로 쓰면 빠지는 줄이 생기고,
빠진 줄 하나가 사람의 확인 한 번을 부른다.

## 저장 위치

```
.curvez/handoff/<from>.<timestamp>.json
```

- `<from>` 은 만든 에이전트의 `name` 그대로. 예) `curvez-architect`
- `<timestamp>` 는 `YYYYMMDD-HHmmss`. 예) `curvez-architect.20260816-141203.json`
- 덮어쓰지 않는다. **이유:** 회고 에이전트가 실행 이력을 시간순으로 재구성한다. 덮어쓰면 무엇이 언제 어긋났는지 복원할 수 없다

## 스키마

```json
{
  "from": "curvez-architect",
  "to": ["curvez-nextjs"],
  "status": "done",
  "summary": "DDD 4레이어로 확정. 도메인은 프레임워크 import 금지.",
  "artifacts": [
    {
      "path": ".curvez/architecture.md",
      "kind": "decision",
      "note": "레이어 경계 규칙 포함"
    }
  ],
  "decisions": [
    {
      "what": "application 레이어를 별도로 두지 않고 domain 에 유스케이스를 합쳤다",
      "why": "화면이 12개 이하라 레이어 하나를 더 두면 파일만 늘고 경계는 안 생긴다",
      "reversible_at": ".curvez/architecture.md:레이어 정의"
    }
  ],
  "blocked_on": [],
  "verification": [
    {
      "command": "node scripts/validate-handoff.mjs",
      "result": "오류 0개",
      "passed": true
    }
  ]
}
```

필드별 상세와 실제 예시는 [references/field-reference.md](references/field-reference.md) 를 읽는다.

## status 판정 규칙

세 값 중 하나를 고른다. 판정을 흐리지 마라.

| status    | 조건                               | 강제 규칙                                                 |
| --------- | ---------------------------------- | --------------------------------------------------------- |
| `done`    | 맡은 범위를 끝냈고 검증까지 마쳤다 | `verification` 최소 1건 필수. `blocked_on` 이 비어야 한다 |
| `partial` | 일부만 끝냈다. 남은 것을 알고 있다 | 무엇까지 됐고 무엇이 남았는지 `summary` 에 적는다         |
| `blocked` | 답 없이는 더 못 간다               | `blocked_on` 최소 1건 필수                                |

**`done` 은 `verification` 없이 쓸 수 없다.**
**이유:** 수신 에이전트는 송신 에이전트의 `done` 을 믿고 자기 작업을 시작한다. 검증되지 않은
`done` 하나가 그 뒤의 모든 작업을 잘못된 전제 위에 올린다. 검증을 못 돌렸으면 `partial` 로 낮춘다.

**막혔으면 `blocked` 를 쓴다. 추측으로 채우고 `done` 하지 마라.** (원칙: `principles/blocked-over-guessing.md`)
**이유:** `blocked` 는 실패가 아니라 정상 상태다. 오케스트레이터는 `blocked` 를 받아 사용자에게
묻거나 다른 에이전트에게 돌린다. 추측으로 메운 `done` 은 아무도 못 잡아내고 나중에 되돌리기가 훨씬 비싸다.

## 작성 절차

1. **자기 검증을 먼저 돌린다.** 담당 에이전트 정의의 `## 품질 자체 검증` 에 적힌 명령을 실제로 실행한다
2. **`verification` 에 명령과 실제 출력을 적는다.** 요약하지 말고 판정 가능한 값으로 적는다
   - 좋음: `{ "command": "pnpm typecheck", "result": "0 errors, 0 warnings" }`
   - 나쁨: `{ "command": "타입 확인", "result": "통과" }`
3. **`decisions` 에 되돌릴 위치를 남긴다.** `reversible_at` 이 없으면 나중에 이 결정을 뒤집을 때 전체를 다시 읽어야 한다
4. **`to` 를 채운다.** 받는 쪽이 없으면 아무도 읽지 않는다. 오케스트레이터에게만 돌려줄 때도 `["curvez-orchestrator"]` 로 명시한다
5. **`status` 를 판정한다.** 위 표대로 고른다
6. **파일로 쓰고 검증한다**

```bash
node "$CURVEZ_ROOT/scripts/validate-handoff.mjs" .curvez/handoff/
```

## 읽는 절차

핸드오프를 받아 자기 작업을 시작할 때 순서를 지킨다.

1. `status` 를 먼저 본다. `blocked` 나 `partial` 이면 **그 전제 위에서 작업을 시작하지 마라**
2. `blocked_on` 을 본다. 나에게 온 질문(`who` 가 내 `name`)이 있으면 그것부터 답한다
3. `decisions` 를 본다. 내 작업과 충돌하는 결정이 있으면 뒤집지 말고 `blocked_on` 에 이의를 남긴다
   - **이유:** 앞 단계의 결정을 뒤에서 조용히 뒤집으면 두 산출물이 서로 다른 전제를 갖게 되고,
     어느 쪽이 맞는지 판정할 근거가 사라진다
4. `artifacts` 의 파일을 읽는다. `summary` 만 읽고 진행하지 마라

## 파일 소유권

핸드오프는 소유권 충돌을 드러내는 자리이기도 하다.

- 각 에이전트는 자기가 쓰는 경로를 `artifacts` 에 남긴다
- 오케스트레이터는 병렬 실행 전에 소유 경로가 겹치는지 확인한다
- 겹치면 **병렬을 포기하고 순차로 강등한다**
  - **이유:** 두 에이전트가 같은 파일을 동시에 고치면 나중에 쓴 쪽이 앞선 쪽을 지운다.
    조용히 사라지므로 리뷰에서도 안 잡힌다

## 완료 기준

- [ ] `node scripts/validate-handoff.mjs .curvez/handoff/` 가 오류 0개로 끝난다
- [ ] `status: done` 인 파일 전부에 `verification` 이 1건 이상 있다
- [ ] `verification.result` 가 판정 가능한 값이다 (수치·개수·명시적 상태)
- [ ] `to` 가 빈 파일이 없다
