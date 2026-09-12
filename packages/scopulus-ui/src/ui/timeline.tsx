/**
 * 시간 순으로 일어난 일. 위에서 아래로 한 방향이다.
 *
 * 스펙은 `packages/scopulus-ui/design/components/Timeline.md` 가 정본이다.
 *
 * **`<ol>` 이다.** 순서가 뜻을 갖는 목록이라 `<ul>` 이나 `<div>` 로 만들지 마라 —
 * 스크린리더가 항목 수와 몇 번째인지를 읽어 주는 것이 이 컴포넌트의 절반이다.
 *
 * **선과 점은 장식이다.** `aria-hidden` 을 붙인다. 읽히는 것은 각 항목의 시각과 내용뿐이고,
 * 선이 말하는 "이어져 있다" 는 뜻은 목록이라는 사실이 이미 말한다.
 *
 * **세로 한 방향만 만든다.** daisyUI 의 가로·양쪽(좌우 번갈아) 변형을 옮기지 않았다 —
 * 이 시스템에 쓸 자리가 0곳이고, 양쪽 변형은 화면 폭이 좁아지면 읽는 순서가 지그재그가 된다.
 */
export function Timeline({ children }: { children: React.ReactNode }) {
  return <ol className="flex flex-col">{children}</ol>;
}

/**
 * 일 하나. 언제(`time`)와 무엇(`children`)이 한 항목이다.
 *
 * **`dateTime` 이 필수다.** 화면에 보이는 `time`(`사흘 전`·`2026년 9월`)은 사람이 읽는 글이라
 * 기계가 언제인지 알 수 없다. 둘을 따로 받아 `<time datetime>` 에 기계용 값을 넣는다.
 * 선택으로 두면 빠진 항목이 생기고, 그때는 `<time>` 이 자기 글자를 날짜로 읽으려다 실패한다.
 *
 * `className` 을 열지 않는다. 점과 선의 자리가 어긋나면 선이 이어지지 않는다.
 */
export function TimelineItem({
  time,
  dateTime,
  children,
}: {
  /** 화면에 보이는 시각. */
  time: string;
  /** 기계가 읽는 시각. `<time datetime>` 에 그대로 들어간다 — `2026-09-12` 처럼 쓴다. */
  dateTime: string;
  /** 그때 무슨 일이 있었는지. */
  children: React.ReactNode;
}) {
  return (
    <li className="group flex gap-4">
      {/* 선과 점은 장식이다. 첫 항목은 점 위로 선이 솟지 않고, 마지막 항목은 점에서 선이 끝난다. */}
      <span aria-hidden className="relative w-2 shrink-0">
        <span className="absolute inset-x-0 top-0 bottom-0 mx-auto w-px bg-border group-first:top-1 group-last:bottom-auto group-last:h-2" />
        <span className="relative mt-1 block size-2 rounded-full bg-muted-foreground" />
      </span>

      <div className="flex flex-col gap-1 pb-6 group-last:pb-0">
        <time dateTime={dateTime} className="text-xs text-muted-foreground">
          {time}
        </time>
        <div className="text-sm">{children}</div>
      </div>
    </li>
  );
}
