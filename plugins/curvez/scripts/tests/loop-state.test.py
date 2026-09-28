#!/usr/bin/env python3
"""loop-state.mjs 회귀 테스트.

    python3 scripts/tests/loop-state.test.py

게이트 루프가 언제 계속하고 언제 멈추는지를 고정한다. 판정을 스크립트로 옮긴 이유가
"한 번만 더" 를 막는 것이라, 멈춤 조건이 조용히 풀리면 루프가 상한 없이 돈다.
특히 두 가지는 통과로 보이기 쉬워 케이스를 따로 둔다 — test 게이트가 돌지 않은 ok,
테스트 0개 실행.

exit 0 = 전부 통과.
"""
import json, os, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPT = os.path.join(HERE, "..", "loop-state.mjs")

failures = []


def run(root, *args):
    r = subprocess.run(["node", SCRIPT, *args, "--dir", root], capture_output=True, text=True)
    out = json.loads(r.stdout.strip().splitlines()[-1]) if r.stdout.strip() else {}
    return r.returncode, out


def gate(root, ok, failed=(), not_run=(), blocked=None):
    """quality-gate --json 출력 모양의 파일을 만든다."""
    if blocked:
        data = {"ok": False, "blocked": blocked}
    else:
        v = [{"command": "pnpm typecheck", "result": "0 errors", "passed": True}]
        v += [{"command": c, "result": r, "passed": False} for c, r in failed]
        if ok and "test" not in not_run:
            v.append({"command": "pnpm test", "result": "4 tests, 4 passed", "passed": True})
        data = {"ok": ok, "verification": v, "notRun": [{"gate": g, "why": "없음"} for g in not_run]}
    p = os.path.join(root, "gate.json")
    with open(p, "w") as f:
        json.dump(data, f)
    return p


def state(root):
    with open(os.path.join(root, ".curvez", "loop.json")) as f:
        return json.load(f)


def write_state(root, s):
    with open(os.path.join(root, ".curvez", "loop.json"), "w") as f:
        json.dump(s, f)


def check(name, cond, detail=""):
    if not cond:
        failures.append(f"{name} {detail}")
    print(("ok   " if cond else "FAIL ") + name)


def fresh():
    root = tempfile.mkdtemp(prefix="loop-state-")
    code, out = run(root, "init", "--plan", "구현 → 게이트 → 수정")
    assert code == 0, out
    return root


# 1. 실패하면 계속, 통과하면 끝
root = fresh()
code, out = run(root, "record", "--gate", gate(root, False, [("pnpm test", "4 tests, 3 passed, 1 failed (a)")]))
check("실패 → continue", out.get("verdict") == "continue" and out.get("fixesLeft") == 5, str(out))
code, out = run(root, "record", "--gate", gate(root, True))
check("test 가 돈 ok → pass", out.get("verdict") == "pass" and state(root)["status"] == "passed", str(out))
code, out = run(root, "record", "--gate", gate(root, False))
check("끝난 루프에 record → 거절(exit 2)", code == 2, str(out))

# 2. 같은 실패가 3번 연속이면 멈춘다
root = fresh()
for i in range(3):
    code, out = run(root, "record", "--gate", gate(root, False, [("pnpm test", "4 tests, 3 passed, 1 failed (a)")]))
check("같은 실패 3연속 → stop(no-progress)", out.get("verdict") == "stop" and "no-progress" in (out.get("reason") or ""), str(out))

# 3. 실패가 바뀌어도 수정 5회를 쓰면 멈춘다 (게이트 6번째)
root = fresh()
verdicts = []
for i in range(6):
    code, out = run(root, "record", "--gate", gate(root, False, [("pnpm test", f"{i} failed")]))
    verdicts.append(out.get("verdict"))
check("수정 5회 뒤 → stop(max-fix)", verdicts[:5] == ["continue"] * 5 and verdicts[5] == "stop" and "max-fix" in out.get("reason", ""), str(verdicts))

# 4. test 게이트가 돌지 않은 ok 는 통과가 아니다
root = fresh()
code, out = run(root, "record", "--gate", gate(root, True, not_run=("test",)))
check("test 미실행 ok → stop(blocked)", out.get("verdict") == "stop" and "blocked" in out.get("reason", ""), str(out))

# 5. 테스트 0개 실행은 멈춘다
root = fresh()
code, out = run(root, "record", "--gate", gate(root, False, [("pnpm test", "테스트 0개 실행 — no tests found. exit 0 이지만 통과 근거가 아니다")]))
check("테스트 0개 실행 → stop(blocked)", out.get("verdict") == "stop" and "0개 실행" in out.get("reason", ""), str(out))

# 6. 게이트가 진행 불가면 멈춘다
root = fresh()
code, out = run(root, "record", "--gate", gate(root, False, blocked="profile.json 이 없다"))
check("게이트 blocked → stop", out.get("verdict") == "stop" and "profile.json" in out.get("reason", ""), str(out))

# 7. 시간 상한
root = fresh()
s = state(root)
s["elapsedMs"] = s["limits"]["maxMinutes"] * 60_000
write_state(root, s)
code, out = run(root, "record", "--gate", gate(root, False, [("pnpm test", "x")]))
check("시간 상한 → stop(time)", out.get("verdict") == "stop" and "time" in out.get("reason", ""), str(out))

# 8. resume 은 세션 사이 공백을 세지 않는다
root = fresh()
s = state(root)
s["lastAt"] -= 8 * 60 * 60_000  # 밤사이 8시간 꺼져 있었다
write_state(root, s)
run(root, "resume")
code, out = run(root, "record", "--gate", gate(root, False, [("pnpm test", "x")]))
check("resume 뒤 공백 제외", out.get("minutesUsed") == 0 and out.get("verdict") == "continue", str(out))

# 9. 도는 루프가 있으면 init 을 거절하고, stop 뒤에는 새로 시작할 수 있다
root = fresh()
code, out = run(root, "init", "--plan", "다른 계획")
check("도는 루프 위 init → 거절", code == 2, str(out))
code, out = run(root, "stop", "--reason", "사용자가 멈춤")
check("stop → stopped(user)", out.get("status") == "stopped" and out.get("reason", "").startswith("user:"), str(out))
code, out = run(root, "init", "--plan", "다른 계획")
check("stop 뒤 init → 새 루프", code == 0 and out.get("iteration") == 0, str(out))

# 10. 진짜 quality-gate.mjs 출력으로 — node --test 의 "ℹ tests 0" 을 0개 실행으로 잡는다.
#     이 형태를 못 잡아 테스트가 하나도 없는데 루프가 pass 로 끝난 적이 있다
GATE = os.path.join(HERE, "..", "quality-gate.mjs")


def real_gate(root):
    p = os.path.join(root, "gate.json")
    r = subprocess.run(["node", GATE, "--json", "--only", "typecheck,lint,test", "--dir", root], capture_output=True, text=True)
    with open(p, "w") as f:
        f.write(r.stdout)
    return p


def node_project(tests):
    root = fresh()
    with open(os.path.join(root, ".curvez", "profile.json"), "w") as f:
        json.dump({"stack": "nextjs", "commands": {"typecheck": "true", "lint": "true", "test": "node --test"}}, f)
    os.makedirs(os.path.join(root, "test"))
    for i in range(tests):
        with open(os.path.join(root, "test", f"t{i}.test.mjs"), "w") as f:
            f.write("import { test } from 'node:test';\ntest('ok', () => {});\n")
    return root


root = node_project(0)
code, out = run(root, "record", "--gate", real_gate(root))
check("실제 게이트: 테스트 0개 → stop(blocked)", out.get("verdict") == "stop" and "0개 실행" in out.get("reason", ""), str(out))
root = node_project(10)
code, out = run(root, "record", "--gate", real_gate(root))
check("실제 게이트: 테스트 10개 통과 → pass (tests 10 을 0개로 읽지 않는다)", out.get("verdict") == "pass", str(out))

print(f"\n{len(failures)} 실패" if failures else "\n전부 통과")
sys.exit(1 if failures else 0)
