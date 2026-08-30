#!/usr/bin/env python3
"""guard-forbidden-words.mjs 회귀 테스트.

    python3 hooks/tests/guard-forbidden-words.test.py

forbidden-words: allow  ← 이 파일은 금지어를 케이스로 적어야 하므로 예외다.

이 가드의 어려운 부분은 "막는 것"이 아니라 "합성어를 막지 않는 것"이다.
암벽등반·절벽·벽화·이화벽화마을이 걸리기 시작하면 사람이 가드를 꺼 버린다.
가드가 꺼지면 정작 막아야 할 단독 사용이 통째로 통과한다 — 오탐이 가드를 죽인다.

그래서 통과 케이스를 차단 케이스보다 많이 둔다.

exit 0 = 전부 통과.
"""
import json, subprocess, sys, os

os.chdir(os.path.join(os.path.dirname(__file__), "..", ".."))
HOOK = "hooks/guard-forbidden-words.mjs"

# 디스크에 없는 경로여야 한다. 실재하는 파일을 가리키면 그 파일의 예외 표시를 읽어 버린다.
NOWHERE = "/tmp/curvez-guard-forbidden-words-nonexistent.md"

MARKER = "forbidden-words" + ": allow"

# (tool_input, 기대 exit code, 설명)
cases = [
    # ── 단독 사용은 막는다 ──
    ({"file_path": NOWHERE, "content": "첫 번째 벽을 넘었다"}, 2, "장애물 뜻"),
    ({"file_path": NOWHERE, "content": "성능의 벽"}, 2, "한계 뜻"),
    ({"file_path": NOWHERE, "content": "노트가 벽에 걸린다"}, 2, "목록 뜻"),
    ({"file_path": NOWHERE, "content": "팀 간의 벽이 문제다"}, 2, "단절 뜻"),
    ({"file_path": NOWHERE, "content": "벽"}, 2, "조사 없는 단독"),
    ({"file_path": NOWHERE, "content": "여러 벽들이 있었다"}, 2, "복수형도 단독 사용"),
    ({"file_path": NOWHERE, "new_string": "여기서 벽을 만났다"}, 2, "Edit 의 new_string"),
    # ── 합성어·고유명사는 통과시킨다. 오탐이 가드를 죽인다 ──
    ({"file_path": NOWHERE, "content": "암벽등반을 갔다"}, 0, "암벽등반"),
    ({"file_path": NOWHERE, "content": "절벽 아래를 봤다"}, 0, "절벽"),
    ({"file_path": NOWHERE, "content": "벽화가 예쁘다"}, 0, "벽화"),
    ({"file_path": NOWHERE, "content": "이화벽화마을에 갔다"}, 0, "고유명사"),
    ({"file_path": NOWHERE, "content": "성벽과 방벽"}, 0, "성벽·방벽"),
    ({"file_path": NOWHERE, "content": "벽돌과 벽지를 골랐다"}, 0, "벽돌·벽지"),
    # ── 코드 식별자는 영문이라 애초에 걸리지 않는다 ──
    ({"file_path": NOWHERE, "content": "import Wall from './Wall.tsx'"}, 0, "영문 식별자"),
    # ── 예외 표시가 있는 내용은 통과 ──
    ({"file_path": NOWHERE, "content": MARKER + "\n금지어는 '벽' 이다"}, 0, "예외 표시"),
    # ── 검사 대상이 아닌 호출은 건드리지 않는다 ──
    ({"file_path": NOWHERE}, 0, "쓰는 내용이 없는 호출"),
    ({}, 0, "tool_input 이 비어 있음"),
]

fails = []
for tool_input, want, label in cases:
    payload = json.dumps({"tool_name": "Write", "tool_input": tool_input})
    r = subprocess.run(
        ["node", HOOK], input=payload, capture_output=True, text=True
    )
    if r.returncode != want:
        fails.append(f"{label}: exit {r.returncode} (기대 {want}) — {tool_input}")

if fails:
    print(f"FAILED {len(fails)}/{len(cases)}")
    for f in fails:
        print("  " + f)
    sys.exit(1)

print(f"OK {len(cases)}/{len(cases)} — guard-forbidden-words 회귀 테스트 통과")
