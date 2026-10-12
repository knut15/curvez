// 스펙: .curvez/design/preemie-calc/components/RequiredMark.md
// 순수 프레젠테이션 (훅 없음). DateField·GestationInput·SegmentedControl·TextField 네
// 컴포넌트의 레이블 안에서만 쓰인다(DUP-01).
export type RequiredMarkProps = {
  required: boolean;
};

export function RequiredMark({ required }: RequiredMarkProps) {
  if (!required) return null;

  return (
    <>
      {" "}
      <span aria-hidden="true" style={{ color: "var(--color-accent-danger)" }}>
        *
      </span>
      {/* 2026-09-29 재리뷰: 레이블 텍스트 뒤에 이 마크가 붙으므로 sr-only 문구에 label 을
          다시 넣으면 접근성 이름에 라벨이 두 번 들어간다(예: "출생일 출생일, 필수"). 콤마
          뒤 문구만 남긴다. */}
      <span className="sr-only">, 필수</span>
    </>
  );
}
