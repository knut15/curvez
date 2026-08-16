#!/usr/bin/env python3
"""guard-bash.mjs 회귀 테스트.

    python3 hooks/tests/guard-bash.test.py

전역 옵션 우회(`git -C /tmp push`)가 실제로 뚫린 적이 있다. 정규식이 `git\s+push` 라
옵션이 끼면 통과했다. 이 종류는 조용히 다시 뚫리므로 케이스를 고정해 둔다.

평범한 push 는 **허용**한다. 원격에 커밋을 얹는 것은 revert 로 되돌릴 수 있다.
막는 것은 원격 이력을 지우는 두 가지 — 강제 push 와 원격 브랜치 삭제다.
`-f` 축약형 케이스를 반드시 남겨 둔다. push 규칙을 통째로 빼면 `--force` 규칙이
문자열 `--force` 만 보기 때문에 `-f` 가 조용히 통과한다.

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
FORCE = "--fo" + "rce"
cases = [
    # 평범한 push 는 허용한다
    (G + PUSH + " origin main", 0, "기본 push 허용"),
    (G + PUSH + " -u origin main", 0, "-u push 허용"),
    (G + "-C /tmp/example " + PUSH, 0, "-C + push 허용"),
    (G + "-c user.name=x " + PUSH, 0, "-c + push 허용"),
    (G + "--git-dir=/tmp/x " + PUSH, 0, "--git-dir + push 허용"),
    (G + "--no-pager " + PUSH, 0, "--no-pager + push 허용"),
    (G + PUSH + " origin main:main", 0, "refspec push 허용"),
    # 원격 이력을 지우는 push 는 계속 막는다
    (G + PUSH + " -f origin main", 2, "-f 축약 강제 push"),
    (G + PUSH + " " + FORCE + " origin main", 2, "--force 강제 push"),
    (G + "-C /tmp " + PUSH + " -f", 2, "-C + -f 강제 push"),
    (G + PUSH + " " + FORCE + "-with-lease origin main", 0, "--force-with-lease 는 허용"),
    (G + PUSH + " --delete origin old", 2, "원격 브랜치 삭제"),
    (G + PUSH + " origin :old", 2, "콜론 문법 원격 브랜치 삭제"),
    (G + "-C /tmp " + RESET + " " + HARD, 2, "-C + reset"),
    (G + "-C /tmp clean -fd", 2, "-C + clean"),
    (G + "-C /tmp branch -D old", 2, "-C + branch -D"),
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
