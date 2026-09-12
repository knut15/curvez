import { cn } from "cn";

/**
 * 순서가 있는 단계와 지금 자리. 세로로 선다.
 *
 * 스펙은 `packages/scopulus-ui/design/components/Steps.md` 가 정본이다.
 *
 * **상태를 받지 않고 `current` 하나에서 계산한다.** 앞은 완료, 그 자리는 지금, 뒤는 남은
 * 단계다. 단계마다 상태를 받으면 "지금" 이 둘인 상태를 타입이 막지 못한다.
 *
 * **상태를 색으로만 말하지 않는다.** 셋 다 `sr-only` 로 읽을 글자를 갖고, 지금 자리에는
 * `aria-current="step"` 이 붙는다. 색과 채움은 그 글자를 눈으로 본 것일 뿐이다.
 *
 * **가로로 서지 않는다.** 가로 한 줄은 375px 에서 라벨을 줄이거나 옆으로 밀어야 하는데
 * 둘 다 읽기를 해친다. 세로는 어느 폭에서나 같게 읽히고 브레이크포인트가 필요 없다.
 * 가로가 필요해지면 축이 둘이 되므로 그때는 `cva` 로 다시 쓴다.
 *
 * **번호는 `aria-hidden` 이다.** 몇 번째인지는 `<ol>` 이 이미 읽어 준다. 화면에 남기는 것은
 * 눈으로 세지 않게 하려는 것뿐이다.
 *
 * `current` 를 범위 밖으로 주면 그대로 계산된다 — 음수면 전부 남은 단계, 마지막보다 크면
 * 전부 완료다. 마지막 단계를 끝낸 뒤를 그렇게 표현한다.
 */
export function Steps({
  steps,
  current,
}: {
  /** 단계 이름. 순서가 곧 화면 순서다. */
  steps: string[];
  /** 지금 있는 단계의 0부터 센 자리. */
  current: number;
}) {
  return (
    // `role="list"` 는 Safari 대비다. Tailwind preflight 가 `list-style:none` 을 걸어
    // 목록 의미가 떨어지는 조건에 들어간다.
    <ol role="list" className="flex flex-col">
      {steps.map((label, i) => {
        const state = i < current ? "done" : i === current ? "current" : "todo";
        const last = i === steps.length - 1;

        return (
          <li
            key={`${i}-${label}`}
            aria-current={state === "current" ? "step" : undefined}
            className={cn("relative flex gap-3", !last && "pb-6")}
          >
            {last ? null : (
              // 다음 단계로 잇는 선. 이어져 있다는 것은 `<ol>` 이 이미 말하므로 장식이다.
              // `left-3.5` 는 번호 원(`size-7`)의 가운데다. 원 크기를 바꾸면 같이 바꾼다.
              <span
                aria-hidden
                className="absolute top-8 bottom-0 left-3.5 w-px bg-border"
              />
            )}

            <span
              aria-hidden
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full text-xs",
                state === "done" && "bg-primary text-primary-foreground",
                state === "current" && "border-2 border-ring text-foreground",
                state === "todo" &&
                  "border border-border text-muted-foreground",
              )}
            >
              {i + 1}
            </span>

            <span
              className={cn(
                // 번호 원 28px 과 글줄 20px 의 차이 절반이다. 글자가 원 가운데에 선다.
                "pt-1 text-sm",
                state === "current"
                  ? "font-medium text-foreground"
                  : "text-muted-foreground",
              )}
            >
              <span className="sr-only">{STATUS_TEXT[state]}, </span>
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** 화면 낭독기가 라벨 앞에 읽는 글자. 색과 채움이 말하는 것과 같은 것을 말한다. */
const STATUS_TEXT = {
  done: "완료",
  current: "지금 단계",
  todo: "남은 단계",
};
