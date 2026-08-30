# mattpocock-skills — 벤더링 기록

<!-- forbidden-words: allow -->

curvez 가 직접 만들지 않고 **복사해 들여온** 스킬이다. 원본이 개정되면 이 사본은 낡는다.
낡았는지 대조할 수 있도록 아래 세 값을 반드시 유지한다.

| 항목      | 값                                                         |
| --------- | ---------------------------------------------------------- |
| 원본      | `mattpocock-skills` (claude-plugins-official 마켓플레이스) |
| 원본 버전 | **1.2.3**                                                  |
| 복사 시점 | **2026-08-30**                                             |
| 라이선스  | MIT — `LICENSE` 원문을 그대로 함께 둔다                    |
| 저자      | Matt Pocock (https://www.aihero.dev)                       |

## 들여온 것

curvez 에 없던 축만 골랐다. 이미 있는 것(요구사항·아키텍처·구현·QA·리뷰·회고)은 들여오지 않는다.

| 스킬                            | 원본 경로                                          | curvez 에 없던 축            |
| ------------------------------- | -------------------------------------------------- | ---------------------------- |
| `grill-me`                      | `skills/productivity/grill-me`                     | 계획·판단을 캐묻는 압박 질문 |
| `grill-with-docs`               | `skills/engineering/grill-with-docs`               | 문서를 근거로 캐묻기         |
| `code-review`                   | `skills/engineering/code-review`                   | 기준 대비 리뷰 절차          |
| `tdd`                           | `skills/engineering/tdd`                           | 실패 테스트 먼저 쓰는 루프   |
| `improve-codebase-architecture` | `skills/engineering/improve-codebase-architecture` | 기존 코드 구조 개선 절차     |
| `handoff`                       | `skills/productivity/handoff`                      | 사람 간 인수인계 문서        |
| `writing-for-agents`            | `skills/productivity/writing-for-agents`           | 에이전트가 읽을 문서 쓰는 법 |

> 📌 요청 목록의 `write-a-skill` 은 원본 1.2.3 에 그 이름으로 없다.
> 스킬 문서 작성을 다루는 것은 `writing-for-agents` 라 그것을 들여왔다.

## 원본이 바뀌었는지 확인하는 법

```bash
claude plugin marketplace update claude-plugins-official
ls ~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/
```

디렉터리에 `1.2.3` 말고 더 높은 버전이 보이면 이 사본이 낡은 것이다.
그때 아래를 실행해 차이를 본다.

```bash
NEW=~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/<새버전>/skills
diff -r "$NEW/engineering/tdd" plugins/curvez/vendor/mattpocock-skills/tdd
```

## 다른 벤더링 자산

이 디렉터리 밖에도 복사본이 하나 있다.

| 대상                  | 원본                                         | 원본 버전 | 복사 시점  | 비고                                           |
| --------------------- | -------------------------------------------- | --------- | ---------- | ---------------------------------------------- |
| `templates/CLAUDE.md` | `andrej-karpathy-skills:karpathy-guidelines` | 1.0.0     | 2026-08-28 | 1~~4절만 원본의 한글 번역. 5~~12절은 자체 작성 |

`vendor/` 아래로 옮기지 않는 이유는 그 파일이 **스캐폴드 산출물**이기 때문이다.
bootstrap 이 새 프로젝트에 복제하므로 템플릿 자리에 있어야 한다.
출처·버전·복사 시점은 그 파일 첫머리 주석에 같은 형식으로 적혀 있다.

## 손대지 않는다

**사본을 고치지 않는다.** 고치면 원본과 대조할 수 없게 되고, 그 순간 벤더링이 아니라 포크가 된다.
curvez 규약에 맞게 바꿔야 할 것이 생기면 사본을 고치지 말고 `skills/` 아래에 curvez 스킬을 새로 만들어
이 사본을 참조하게 한다.
