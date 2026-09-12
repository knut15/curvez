/**
 * 화면은 아직 뼈대다. 무엇을 그릴지는 `docs/GOAL.md` 5절이 정해 두었고,
 * 그 앞에 2~5절의 셰이더 이식과 72장 전수 판정이 끝나야 한다.
 */
export default function Home() {
  return (
    <main className="mx-auto flex max-w-2xl flex-1 flex-col justify-center gap-4 px-6 py-24">
      <h1 className="text-3xl font-semibold tracking-tight">city-presets</h1>
      <p className="text-muted-foreground">
        사진 한 장에 도시 이름의 색 하나를 건다. 계산은 브라우저 안에서만 돌고
        사진은 기기 밖으로 나가지 않는다.
      </p>
      <p className="text-sm text-muted-foreground">
        값의 정본은 <code className="font-mono">presets/grade.py</code> 의{" "}
        <code className="font-mono">PRESETS</code> 이고, 만들 것과 완료 기준은{" "}
        <code className="font-mono">docs/GOAL.md</code> 에 있다.
      </p>
    </main>
  );
}
