---
name: numbers-not-adjectives
applies_when: 검증 결과를 보고하거나 핸드오프의 verification 을 채울 때
---

# 형용사가 아니라 수치로 보고한다

**"통과했다", "모두 정상", "이상 없음" 대신 실행한 명령과 출력에서 읽은 수치를 쓰고, 실패는 개수가 아니라 이름으로 적는다.**

**이유:** 수신 쪽은 문장의 뉘앙스가 아니라 수치로 다음 행동을 정한다. "통과" 는 몇 개 중 몇 개인지,
0개가 실행된 것인지, 무엇이 실패했는지를 모두 지운다. 그러면 수신 쪽은 같은 명령을 다시 돌리거나
믿고 넘어갈 수밖에 없고, 어느 쪽이든 앞 단계의 검증은 의미를 잃는다.

**패턴:**

- `verification[]` 항목마다 `command` 와 `result` 를 둔다
- `47 tests, 45 passed, 2 failed (auth.login.expired-token, cart.total.discount)` 처럼 쓴다
- 실패를 숨기지 않는다. 실패한 명령의 출력은 그대로 붙인다

**판정 질문:** 이 보고만 읽고 수신 쪽이 명령을 다시 돌리지 않고 다음 행동을 정할 수 있는가?

**더 읽을 곳:** `skills/quality-gate/SKILL.md` 의 `## 수치로 보고한다` 표, `docs/quality-model.md`.
