import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

/**
 * 주소를 바꾸지 않는 행동 하나. 주소가 바뀌는 것은 `AppLink` 가 맡는다.
 *
 * 스펙은 `packages/scopulus-ui/design/components/Button.md` 가 정본이다.
 *
 * **`shadcn add button` 으로 받지 않고 손으로 썼다.** 받는 쪽은 variant 6종 · size 7종이고,
 * 쓰이지 않는 variant 는 검증되지 않은 채 스토리만 늘린다. 버린 값과 이유는 스펙의
 * `### 넣지 않는 값` 표에 있다.
 *
 * **`outline` 과 `icon-sm` 은 되살렸다.** 처음 뺀 근거는 "이 사이트에 버튼이 들어갈 자리가
 * 둘뿐" 이었는데, 라이브러리가 되면서 그 전제가 깨졌다 — `Dialog` 가 닫기 버튼에 `icon-sm`,
 * 바닥 버튼에 `outline` 을 쓴다(`dialog.tsx:64,110`). 쓰는 곳이 생긴 값은 더 이상 미사용이 아니다.
 * `secondary` · `link` · `sm` · `lg` 는 여전히 쓰는 곳이 0이라 빼 둔다.
 *
 * **되살릴 때 고칠 위치:** 아래 `cva` 정의와 스펙의 같은 표, 두 곳이다.
 */
const button = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium " +
    // 누를 때 크기가 줄어드므로 전이 속성에 transform 을 더한다.
    "transition-[color,background-color,transform] duration-150 ease-out " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring " +
    "active:scale-97 disabled:pointer-events-none disabled:opacity-50 " +
    "motion-reduce:transition-none motion-reduce:active:scale-100",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        ghost:
          "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        outline:
          "border border-border bg-background hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4",
        icon: "size-10",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

/**
 * `onClick` 과 `children` 은 **선택이다.**
 *
 * 처음에는 둘 다 필수로 잡았다 — 아무 일도 하지 않는 버튼과 라벨 없는 버튼을 타입으로 막으려고.
 * 그런데 Base UI 의 `render` 패턴은 바깥에서 핸들러와 내용을 주입한다. `Dialog` 의 닫기 버튼이
 * `<Button variant="ghost" size="icon-sm" />` 로만 쓰이는 것이 그 예다(`dialog.tsx:64`).
 * 필수로 두면 라이브러리 안에서 조합이 불가능해진다.
 *
 * **그 대신 두 가지를 잃는다.** 빈 버튼과 핸들러 없는 버튼을 타입이 막지 못한다.
 * `size="icon"` 에 `aria-label` 이 빠진 것은 a11y 검사가 `button-name` 으로 잡는다 —
 * 실제로 잡히는 것을 음성 검사로 확인했다. 나머지는 사람이 본다.
 *
 * **`className` 도 같은 이유로 연다.** `Dialog` 가 닫기 버튼을 `absolute top-2 right-2` 로
 * 바깥에서 앉힌다(`dialog.tsx:65`). 위치는 버튼이 아니라 그것을 쓰는 자리가 정하는 값이다.
 * 색·크기를 여기서 덮어쓰지 마라 — `cn` 이 충돌을 나중 값으로 정리하므로 조용히 이긴다.
 */
type ButtonProps = VariantProps<typeof button> & React.ComponentProps<"button">;

export function Button({ variant, size, className, ...rest }: ButtonProps) {
  return (
    <button
      // 폼 안에서 기본값이 submit 이라 의도하지 않은 전송이 일어난다.
      // 부르는 쪽이 `type="submit"` 을 주면 그것이 이긴다 — rest 가 뒤에 온다.
      type="button"
      className={cn(button({ variant, size }), className)}
      {...rest}
    />
  );
}
