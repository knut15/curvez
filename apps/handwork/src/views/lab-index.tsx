export function LabIndexView() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 md:px-8 md:py-16">
      <h1 className="text-4xl font-bold tracking-[-0.02em]">Labs</h1>
      <p className="mt-3 max-w-[60ch] leading-relaxed break-keep text-muted-foreground">
        끝나지 않은 것들. 검증 중인 실험, 만들다 만 도구, 답이 안 나온 시도를
        둡니다. 케이스가 &quot;무엇을 골랐나&quot;라면 여기는 &quot;아직 고르지
        못한 것&quot;입니다.
      </p>

      {/* 아직 공개한 실험이 없다. 이 화면은 목록이 채워지기 전까지 이 상태다.
          구분선은 "여기부터 목록 자리" 라는 표시다 — 문구 한 줄만 두면 설명 문단에 붙어 읽힌다. */}
      <p className="mt-8 border-t border-border pt-8 text-muted-foreground">
        아직 공개한 실험이 없습니다.
      </p>
    </main>
  );
}
