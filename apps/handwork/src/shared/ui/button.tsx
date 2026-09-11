import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

/**
 * 주소를 바꾸지 않는 행동 하나. 주소가 바뀌는 것은 `AppLink` 가 맡는다.
 *
 * 스펙은 `apps/handwork/design/components/Button.md` 가 정본이다.
 *
 * **`shadcn add button` 으로 받지 않고 손으로 썼다.** 받는 쪽은 variant 6종 · size 7종인데
 * 이 사이트에 버튼이 들어갈 자리가 둘뿐이다. 쓰이지 않는 variant 는 검증되지 않은 채
 * 스토리만 늘린다. 버린 값과 그 이유는 스펙의 `### 넣지 않는 값` 표에 있다.
 *
 * **버린 것을 되살릴 때 고칠 위치:** 아래 `cva` 정의와 스펙의 같은 표, 두 곳이다.
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
      },
      size: {
        default: "h-10 px-4",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

type ButtonProps = VariantProps<typeof button> & {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  /** `size="icon"` 이면 필수다. 보이는 라벨이 없어 이름이 여기서만 온다. */
  "aria-label"?: string;
};

export function Button({
  variant,
  size,
  onClick,
  disabled,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      // 폼 안에서 기본값이 submit 이라 의도하지 않은 전송이 일어난다.
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(button({ variant, size }))}
      {...rest}
    >
      {children}
    </button>
  );
}
