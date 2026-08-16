#!/usr/bin/env python3
"""guard-bash.mjs 회귀 테스트.

    python3 hooks/tests/guard-bash.test.py

전역 옵션 우회(`git -C /tmp push`)가 실제로 뚫린 적이 있다. 정규식이 `git\s+push` 라
옵션이 끼면 통과했다. 이 종류는 조용히 다시 뚫리므로 케이스를 고정해 둔다.

exit 0 = 전부 통과.
"""
import json, subprocess, sys, os

os.chdir(os.path.join(os.path.dirname(__file__), "..", ".."))
p = "hooks/guard-bash.mjs"

PUSH = "pu" + "sh"
RESET = "re" + "set"
HARD = "--h" + "ard"

# ── 회귀 테스트 ──
G = "g" + "it "
cases = [
    (G + PUSH + " origin main", 2, "기본 push"),
    (G + "-C /tmp/example " + PUSH, 2, "-C 우회"),
    (G + "-c user.name=x " + PUSH, 2, "-c 우회"),
    (G + "--git-dir=/tmp/x " + PUSH, 2, "--git-dir 우회"),
    (G + "-C /tmp " + RESET + " " + HARD, 2, "-C + reset"),
    (G + "-C /tmp clean -fd", 2, "-C + clean"),
    (G + "-C /tmp branch -D old", 2, "-C + branch -D"),
    (G + "--no-pager " + PUSH, 2, "--no-pager 우회"),
    (G + "status", 0, "정상"),
    (G + "-C /tmp status", 0, "-C + 정상"),
    (G + "log --oneline", 0, "정상"),
    (G + "commit -m x", 0, "정상"),
    ("pnpm install --force", 0, "비-git --force"),
    (G + "rebase feature/x", 0, "비보호 브랜치 rebase"),
    (G + "-C /tmp rebase main", 2, "-C + 보호 rebase"),
]
ok = fail = 0
for cmd, want, label in cases:
    r = subprocess.run(["node", p], input=json.dumps({"tool_input": {"command": cmd}}),
                       capture_output=True, text=True)
    good = r.returncode == want
    ok += good; fail += (not good)
    print(f"  {'OK  ' if good else 'FAIL'} exit={r.returncode}(기대 {want})  {label}")
print(f"\n통과 {ok} / 실패 {fail}")
sys.exit(1 if fail else 0)
