#!/usr/bin/env python3
"""check-brief.mjs 회귀 테스트.

    python3 hooks/tests/check-brief.test.py

이 가드가 지켜야 할 것은 두 가지다.
칸이 빠진 curvez 워커 호출은 막는다. curvez 가 아닌 호출과 다른 도구는 건드리지 않는다.
두 번째가 깨지면 사용자의 다른 서브에이전트까지 막혀 사람이 가드를 꺼 버린다.

exit 0 = 전부 통과.
"""
import json, subprocess, sys, os

os.chdir(os.path.join(os.path.dirname(__file__), "..", ".."))
HOOK = "hooks/check-brief.mjs"

FULL = """GOAL: 로그인 화면의 오류 문구를 요구사항 AC-3 에 맞춘다
SCOPE: apps/web/src/app/login/ 만 쓴다. 그 밖은 읽기만 한다
CONTEXT: .curvez/requirements.md, .curvez/handoff/curvez-architect.20260928-101010.json
ACCEPTANCE:
- AC-3 비밀번호가 틀리면 "이메일 또는 비밀번호를 확인하세요" 가 보인다
VERIFY: pnpm --filter web test -- login
FORBIDDEN: 소유 경로 밖 쓰기, 의존성 추가, 강제 push
REPORT: .curvez/handoff/curvez-nextjs.<ts>.json. 막히면 status: blocked
STANDING: .curvez/standing.md"""


def without(field):
    return "\n".join(l for l in FULL.split("\n") if not l.startswith(field + ":") and not (field == "ACCEPTANCE" and l.startswith("- AC-3")))


def replace(field, value):
    lines = []
    skip = False
    for l in FULL.split("\n"):
        if l.startswith(field + ":"):
            lines.append(f"{field}: {value}")
            skip = field == "ACCEPTANCE"
            continue
        if skip and l.startswith("- "):
            continue
        skip = False
        lines.append(l)
    return "\n".join(lines)


def call(prompt, subagent="curvez:curvez-nextjs", tool="Agent"):
    return {"tool_name": tool, "tool_input": {"subagent_type": subagent, "description": "x", "prompt": prompt}}


# (payload, 기대 exit code, 설명)
cases = [
    # ── 다 채운 지시서는 통과 ──
    (call(FULL), 0, "칸 8개를 모두 채움"),
    (call(FULL, tool="Task"), 0, "예전 도구 이름 Task"),
    (call(replace("CONTEXT", "없음: 첫 라운드라 앞 산출물이 없다")), 0, "CONTEXT 를 이유와 함께 비움"),
    (call(replace("ACCEPTANCE", "없음: 읽기 전용 조사라 판정할 산출물이 없다")), 0, "ACCEPTANCE 를 이유와 함께 비움"),
    # ── 칸이 빠지거나 비면 막는다 ──
    (call(without("GOAL")), 2, "GOAL 없음"),
    (call(without("VERIFY")), 2, "VERIFY 없음"),
    (call(without("STANDING")), 2, "STANDING 없음"),
    (call(replace("SCOPE", "")), 2, "SCOPE 값이 빔"),
    (call(replace("ACCEPTANCE", "")), 2, "ACCEPTANCE 줄만 있고 목록이 없음"),
    (call("로그인 화면을 고쳐 줘"), 2, "자유 서술만 있음"),
    (call(""), 2, "프롬프트가 빔"),
    # ── 없음 규칙 ──
    (call(replace("GOAL", "없음: 알아서")), 2, "GOAL 은 없음으로 비울 수 없음"),
    (call(replace("REPORT", "없음: 반환만 한다")), 2, "REPORT 는 없음으로 비울 수 없음"),
    (call(replace("FORBIDDEN", "없음:")), 2, "없음 뒤에 이유가 없음"),
    # ── 칸 이름은 줄 맨 앞에서만 인정한다 ──
    (call(FULL.replace("GOAL:", "목표는 GOAL: ")), 2, "줄 중간의 GOAL: 은 칸이 아님"),
    # ── curvez 가 아닌 호출과 다른 도구는 건드리지 않는다 ──
    (call("아무 말", subagent="general-purpose"), 0, "curvez 가 아닌 서브에이전트"),
    (call("아무 말", subagent="Explore"), 0, "내장 Explore"),
    (call("아무 말", tool="Bash"), 0, "Agent 가 아닌 도구"),
    ({"tool_name": "Agent", "tool_input": {}}, 0, "tool_input 이 비어 있음"),
    ({}, 0, "입력이 비어 있음"),
]

fails = []
for payload, want, label in cases:
    r = subprocess.run(["node", HOOK], input=json.dumps(payload), capture_output=True, text=True)
    if r.returncode != want:
        fails.append(f"{label}: exit {r.returncode} (기대 {want}) {r.stderr.strip()[:200]}")

if fails:
    print(f"FAILED {len(fails)}/{len(cases)}")
    for f in fails:
        print("  " + f)
    sys.exit(1)

print(f"OK {len(cases)}/{len(cases)} — check-brief 회귀 테스트 통과")
