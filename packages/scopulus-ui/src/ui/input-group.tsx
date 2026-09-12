import { cn } from "cn";

/**
 * 입력 앞뒤에 칸을 붙여 한 면으로 보이게 한다. 단위(`원`)·접두(`https://`)·아이콘 자리다.
 *
 * 스펙은 `packages/scopulus-ui/design/components/InputGroup.md` 가 정본이다.
 *
 * **테두리·반경·포커스 링을 그룹이 갖고, 안쪽 입력은 면만 맡는다.** 그래서 `Input` 을 넣지 않고
 * `InputGroupInput` 을 따로 둔다 — 이유: `Input` 은 자기 테두리와 자기 링을 갖고 있어서 그룹
 * 안에 넣으면 테두리가 두 겹, 링이 두 겹이 된다. 바깥에서 후손 선택자로 그것을 지우는 방법도
 * 있지만, 그러면 `input.tsx` 의 클래스 문자열이 바뀔 때마다 이 파일이 조용히 깨진다.
 * **높이 32px · 반경 10px · 링 조각은 `input.tsx:11` 과 같은 값으로 맞췄다. 그 파일이 바뀌면
 * 이 파일도 함께 고친다.**
 *
 * **애드온에 버튼을 넣지 않는다.** 이유는 스펙의 `## 상호작용` 에 적었다 — 초점 대상이 둘이
 * 되면 그룹 전체에 걸린 링이 둘 중 어느 것이 잡혔는지 말하지 못하고, `Button` 의
 * `outline-offset-2` 는 그룹의 `overflow-hidden` 에 잘린다. 입력 옆에 버튼이 필요하면
 * 그룹 바깥에 둔다.
 *
 * `className` 을 받지 않는다. 폭은 `w-full` 로 부모가 정하고 나머지 값은 한 벌뿐이다.
 */
export function InputGroup({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-slot="input-group"
      className={
        // 높이·반경·테두리·다크 면은 `input.tsx:11` 과 같은 값이다.
        "flex h-8 w-full min-w-0 items-stretch overflow-hidden rounded-lg border border-input bg-transparent " +
        "transition-colors duration-150 ease-out motion-reduce:transition-none " +
        // 포커스 링은 그룹 전체에 걸린다. 안쪽 `input` 이 잡혔을 때만 켠다 — 애드온에 초점 대상이
        // 생기더라도 그룹이 대신 빛나지 않게 하려는 것이다.
        "has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/50 " +
        "has-[[aria-invalid=true]]:border-destructive has-[[aria-invalid=true]]:ring-3 has-[[aria-invalid=true]]:ring-destructive/20 " +
        // 흐려지는 것은 입력 칸뿐이다. 애드온까지 `opacity-50` 으로 덮으면 `--muted-foreground`
        // 가 `--muted` 위에서 대비 1.97 로 떨어져 "₩" 나 "https://" 를 읽을 수 없게 된다
        // (axe `color-contrast` 가 실제로 잡았다). 고칠 수 없는 것과 읽을 수 없는 것은 다르다.
        "has-[input:disabled]:cursor-not-allowed has-[input:disabled]:bg-input/50 " +
        "dark:bg-input/30 dark:has-[input:disabled]:bg-input/80 " +
        "dark:has-[[aria-invalid=true]]:border-destructive/50 dark:has-[[aria-invalid=true]]:ring-destructive/40"
      }
    >
      {children}
    </div>
  );
}

/**
 * 입력 앞이나 뒤에 붙는 칸. 글자나 아이콘만 담는다.
 *
 * 칸과 입력을 가르는 것은 면 색(`--muted`)과 1px 선이다. 그 선이 어느 쪽에 서는지가
 * `side` 가 정하는 전부다 — **축이 하나라 `cva` 를 쓰지 않는다.**
 */
export function InputGroupAddon({
  side = "start",
  children,
}: {
  /** `start`=입력 앞, `end`=입력 뒤. */
  side?: "start" | "end";
  children: React.ReactNode;
}) {
  return (
    <span
      data-slot="input-group-addon"
      className={cn(
        // fg=--muted-foreground / bg=--muted 는 이미 검증된 쌍이다 (라이트 4.91 · 다크 6.51).
        "flex shrink-0 items-center gap-1.5 bg-muted px-2.5 text-sm text-muted-foreground",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        side === "start" ? "border-r border-input" : "border-l border-input",
      )}
    >
      {children}
    </span>
  );
}

/**
 * 그룹 안의 입력. 테두리도 반경도 링도 갖지 않는다 — 그 셋은 `InputGroup` 이 갖는다.
 *
 * 글자 크기 `text-base md:text-sm` 와 좌우 여백 `px-2.5`, 안내 글자 색은 `input.tsx:11` 과
 * 같은 값이다. **`input.tsx` 의 그 값을 바꾸면 이 줄도 함께 고친다.**
 */
export function InputGroupInput(
  props: Omit<React.ComponentProps<"input">, "className">,
) {
  return (
    <input
      data-slot="input-group-control"
      className="h-full w-full min-w-0 flex-1 bg-transparent px-2.5 text-base outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
      {...props}
    />
  );
}
