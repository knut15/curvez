/**
 * 한 낱말짜리 메타 정보를 본문과 구분해 얹는다. 태그 칩과 기록 상태 둘을 맡는다.
 *
 * 스펙은 `packages/scopulus-ui/design/components/Badge.md` 가 정본이다.
 *
 * **스펙과 한 군데 다르다.** 스펙은 `status` prop 의 타입을 `진행 중 | 멈춤 | 마무리` 로
 * 잡았지만, `shared` 는 ARCH-001 로 `@/entities` 를 import 할 수 없다. 그 이름들은
 * `entities/lab/model/types.ts` 의 도메인 값이다. 그래서 여기서는 색을 가르는 축만
 * `tone` 으로 받고, 어떤 status 가 어느 tone 인지는 부르는 쪽(`entities/lab`)이 정한다.
 * 화면에 나오는 것은 스펙과 같다 — `active` 가 `--ring`, `idle` 이 `--muted-foreground` 다.
 *
 * 색을 직접 넘기는 prop 을 두지 않는다. 부르는 쪽이 색을 고를 수 있으면 토큰 밖의 값이 들어온다.
 */
type BadgeProps =
  | { variant?: "tag"; children: string }
  | {
      variant: "status";
      /** `active`=지금 움직이는 것, `idle`=멈춰 있는 것. 점 색만 가른다. */
      tone: "active" | "idle";
      children: string;
    };

export function Badge(props: BadgeProps) {
  if (props.variant === "status") {
    return (
      <span className="flex items-center gap-2 text-xs text-muted-foreground">
        {/* 점은 색만으로 말하는 장식이다. 그 뜻은 옆 글자가 이미 말한다. */}
        <span
          aria-hidden
          className={
            props.tone === "active"
              ? "size-1.5 rounded-full bg-ring"
              : "size-1.5 rounded-full bg-muted-foreground"
          }
        />
        {props.children}
      </span>
    );
  }

  return (
    <span className="rounded-sm bg-muted px-2 py-0.5 text-xs text-muted-foreground">
      {props.children}
    </span>
  );
}
