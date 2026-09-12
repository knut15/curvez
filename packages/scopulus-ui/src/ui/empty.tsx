/**
 * 보여 줄 것이 0개일 때 그 자리가 비었다는 사실과 다음에 할 일을 말한다.
 *
 * 스펙은 `packages/scopulus-ui/design/components/Empty.md` 가 정본이다.
 *
 * **기다리는 중이면 이것이 아니다.** 들어올 내용의 크기를 아는 자리는 `Skeleton`,
 * 끝을 모르는 기다림은 `Loading` 이다. 이것은 기다림이 끝났는데 결과가 0개일 때만이다.
 *
 * **버튼을 자기가 만들지 않는다.** 행동 하나가 들어갈 자리를 `children` 으로 열어 두고
 * 거기에 `Button` 이나 `AppLink` 가 들어온다. 안에서 만들면 이 컴포넌트가 `Button` 의
 * variant·size 를 다시 정하게 되고, 그 값이 두 곳에 남아 한쪽만 고쳐진다.
 *
 * **제목을 `<h2>` 로 내지 않는다.** 목록 안일 수도 카드 안일 수도 있어 문서 개요의 몇 번째
 * 단계인지 이 컴포넌트는 모른다. 잘못 고른 단계는 개요를 통째로 어긋나게 한다.
 *
 * **`className` 을 열지 않는다.** 테두리와 여백이 한 벌이고, 어디에 놓일지는 부모가 정한다.
 */
type EmptyProps = {
  /** 한 줄. 무엇이 없는지를 말한다. */
  title: string;
  /** 왜 없는지 또는 어떻게 하면 채워지는지. 없으면 넣지 않는다. */
  description?: string;
  /** 행동 하나. `Button` 이나 `AppLink` 가 들어온다. */
  children?: React.ReactNode;
};

export function Empty({ title, description, children }: EmptyProps) {
  return (
    <div className="flex w-full flex-col items-center gap-2 rounded-lg border border-border px-5 py-10 text-center">
      <p className="font-medium">{title}</p>
      {description ? (
        <p className="max-w-[65ch] text-sm leading-relaxed break-keep text-muted-foreground">
          {description}
        </p>
      ) : null}
      {/* 행동은 설명보다 한 칸 더 떨어진다. 붙여 두면 설명의 마지막 줄로 읽힌다. */}
      {children ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}
