---
name: commands-from-profile
applies_when: 검증·빌드·테스트 명령을 실행하거나 지시할 때
---

# 명령은 profile 에서만 읽는다

**typecheck·lint·test·build 명령은 `.curvez/profile.json` 의 `commands` 에서만 읽고, 비어 있으면 명령을 지어내지 않고 그 게이트를 미검증으로 둔다.**

**이유:** 프로젝트마다 스크립트 이름이 다르다. 지어낸 명령은 없는 스크립트를 부르거나 다른 범위를
검사하고, 그 결과가 `done` 의 근거가 되면 검증하지 않은 것을 검증했다고 말하게 된다.

**패턴:**

- 명령이 필요하면 `profile.json` 을 먼저 읽는다
- 키가 비었으면 `blocked` 또는 "미검증" 으로 보고한다. 대체 명령을 쓰지 않는다
- 명령을 바꿔야 하면 `profile.json` 을 고치는 것이 먼저다

**판정 질문:** 이번에 실행한 검증 명령이 모두 `profile.json` 의 `commands` 에 그대로 있는가?

**더 읽을 곳:** `skills/quality-gate/SKILL.md`, `skills/bootstrap/SKILL.md`.
