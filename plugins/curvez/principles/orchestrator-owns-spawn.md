---
name: orchestrator-owns-spawn
applies_when: 에이전트 정의에 도구를 주거나 워커를 띄울 때
---

# 워커는 오케스트레이터만 띄운다

**`Agent` 도구는 `curvez-orchestrator` 만 갖고, 다른 에이전트와 스킬은 워커를 직접 띄우지 않는다.**

**이유:** 서브에이전트가 또 서브에이전트를 띄우면 실행 트리의 깊이를 아무도 통제하지 못한다. 토큰 소비를
예측할 수 없고, 실패가 났을 때 어느 층에서 무엇이 깨졌는지 추적이 끊긴다.

**패턴:**

- 다른 에이전트 정의의 `tools` 에 `Agent` 를 넣지 않는다
- 팀이 필요한 스킬은 워커를 띄우지 않고 오케스트레이터에게 넘긴다
- `general-purpose` 처럼 `Agent` 를 가진 범용 타입을 워커로 쓰지 않는다

**판정 질문:** `curvez-orchestrator` 가 아닌 곳에서 `Agent` 도구를 부르는 경로가 있는가?

**더 읽을 곳:** `docs/design-rationale.md` §7.
