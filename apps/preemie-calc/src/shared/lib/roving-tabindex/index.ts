// 방향키 roving tabindex 공용 계산. 도메인을 모르는 순수 함수라 shared 에 둔다.
// SegmentedControl(성별, radiogroup/radio)과 ChildSwitcherTabs(tablist/tab) 가 함께 쓴다.
export function nextRovingIndex(currentIndex: number, length: number, key: string): number | null {
  if (length <= 0) return null;
  if (key === "ArrowRight" || key === "ArrowDown") return (currentIndex + 1) % length;
  if (key === "ArrowLeft" || key === "ArrowUp") return (currentIndex - 1 + length) % length;
  return null;
}
