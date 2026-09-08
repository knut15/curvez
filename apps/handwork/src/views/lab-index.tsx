export function LabIndexView() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 md:py-16">
      <h1 className="text-2xl font-semibold">Labs</h1>
      <p className="mt-2 max-w-[60ch] break-keep text-muted-foreground">
        끝나지 않은 것들. 검증 중인 실험, 만들다 만 도구, 답이 안 나온 시도를
        둡니다. 케이스가 &quot;무엇을 골랐나&quot;라면 여기는 &quot;아직 고르지
        못한 것&quot;입니다.
      </p>

      {/* 아직 공개한 실험이 없다. 이 화면은 목록이 채워지기 전까지 이 상태다. */}
      <p className="mt-8 text-muted-foreground">아직 공개한 실험이 없습니다.</p>
    </main>
  );
}
