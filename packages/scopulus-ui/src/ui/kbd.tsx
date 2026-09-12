import * as React from "react";

/**
 * 눌러야 하는 키 하나. `keys` 를 주면 여러 키를 이은 조합 하나가 된다.
 *
 * 스펙은 `packages/scopulus-ui/design/components/Kbd.md` 가 정본이다.
 *
 * **`<kbd>` 다. `<span>` 으로 만들지 마라.** 키보드 입력이라는 뜻이 시각에만 남아
 * 스크린리더가 그냥 글자로 읽는다. 조합은 `<kbd>` 를 겹쳐 쓴다 — 바깥이 조합 하나,
 * 안쪽이 키 하나다. HTML 이 그 겹침을 조합의 표기로 정해 두었다.
 *
 * **구분자를 글자로 받지 않는다.** `⌘ + K` 의 `+` 는 장식이고 `aria-hidden` 이어야 한다.
 * 부르는 쪽이 `<Kbd>⌘</Kbd> + <Kbd>K</Kbd>` 처럼 손으로 적으면 숨기는 것을 잊고,
 * 그러면 스크린리더가 "커맨드 플러스 케이" 를 읽는다. 그래서 `keys` 배열로만 받는다.
 *
 * **크기 축을 두지 않는다.** daisyUI 는 5단계를 주지만 이 시스템에서 키가 놓일 자리는
 * 본문 안 한 곳이고, 거기서 쓰는 글자 크기는 `text-xs` 하나다. 쓰이지 않는 단계를 만들면
 * 어느 것이 표준인지 판정할 근거가 사라진다.
 *
 * `className` 을 열지 않는다. 바깥에서 정할 것이 없다.
 */
const KEY_CLASS =
  "inline-block rounded-sm border border-border bg-muted px-2 py-0.5 align-middle font-mono text-xs text-muted-foreground";

type KbdProps =
  /** 키 하나. `<Kbd>K</Kbd>` */
  | { children: string }
  /** 조합 하나. `<Kbd keys={["⌘", "K"]} />` */
  | { keys: string[] };

export function Kbd(props: KbdProps) {
  if ("keys" in props) {
    return (
      <kbd className="inline-flex items-center gap-1 align-middle">
        {props.keys.map((label, i) => (
          <React.Fragment key={`${i}-${label}`}>
            {/* `+` 는 장식이다. 무엇을 함께 누르는지는 키 이름 둘이 이미 말한다. */}
            {i > 0 ? (
              <span aria-hidden className="text-xs text-muted-foreground">
                +
              </span>
            ) : null}
            <kbd className={KEY_CLASS}>{label}</kbd>
          </React.Fragment>
        ))}
      </kbd>
    );
  }

  return <kbd className={KEY_CLASS}>{props.children}</kbd>;
}
