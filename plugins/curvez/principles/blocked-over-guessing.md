---
name: blocked-over-guessing
applies_when: 필요한 입력·결정·파일이 없거나 해석이 둘 이상일 때
---

# 추측하지 않고 blocked 로 돌아온다

**정보가 없으면 추측으로 채우지 않고 `status: blocked` 로 돌아와 `blocked_on` 에 무엇이 없는지 적는다.**

**이유:** `blocked` 는 실패가 아니라 정상 상태다. 오케스트레이터는 `blocked` 를 받아 사용자에게
묻거나 다른 에이전트에게 돌린다. 추측으로 메운 `done` 은 아무도 잡아내지 못하고, 그 위에 쌓인
작업까지 나중에 되돌려야 한다. 오케스트레이터가 추측하면 워커 여러 명에게 동시에 퍼진다.

**패턴:**

- 필수 입력 파일(`.curvez/profile.json`, 앞 단계 핸드오프)이 없으면 작업을 시작하지 않는다
- 해석이 둘이고 결과가 크게 다르면 `blocked`. 결과가 비슷하면 하나를 고르고 `decisions` 에 `reversible_at` 을 남긴다
- 앞 단계의 결정과 부딪히면 조용히 뒤집지 않고 `blocked_on` 에 이의를 남긴다

**판정 질문:** 이 산출물의 전제 가운데 입력 파일이나 사용자 발언으로 확인되지 않은 것이 있는가?

**더 읽을 곳:** `skills/agent-contract/SKILL.md` 의 status 규칙.
