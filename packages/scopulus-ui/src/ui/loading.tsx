/**
 * 끝을 모르는 기다림 하나를 도는 고리로 알린다. 끝을 아는 진행은 `Progress` 가 맡는다.
 *
 * 스펙은 `packages/scopulus-ui/design/components/Loading.md` 가 정본이다.
 *
 * **`Skeleton` 과 나누는 기준은 자리를 아는가다.** 들어올 내용의 크기를 알면 `Skeleton` 으로
 * 그 자리를 미리 잡아 두고, 크기를 모르거나 한 곳에서 한 번만 알리면 이것을 쓴다.
 *
 * **진행률을 받지 않는다.** 값이 있으면 그것은 이 컴포넌트가 아니라 `Progress` 다.
 * 값을 받는 순간 0% 로 멈춘 막대와 도는 고리 둘 다로 같은 사실을 말하게 된다.
 *
 * **`className` 을 열지 않는다.** 크기는 `size` 두 단계가 전부이고, 어디에 놓일지는
 * 이것을 감싼 쪽이 정한다.
 */

/** 두 단계뿐이다. `sm` 은 버튼 안(`h-10`)에, `default` 는 혼자 설 때. */
const SIZE = {
  sm: "size-4",
  default: "size-6",
} as const;

type LoadingProps = {
  /**
   * 화면 낭독기가 읽는 이름이자, 동작 줄이기를 켠 사람에게 보이는 글자다.
   * 버튼 안에 넣을 때는 그 버튼이 하려는 일로 바꾼다 — `label="저장 중"`.
   */
  label?: string;
  size?: keyof typeof SIZE;
};

export function Loading({
  label = "불러오는 중",
  size = "default",
}: LoadingProps) {
  return (
    <span
      role="status"
      className="inline-flex items-center gap-2 text-muted-foreground"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        className={`${SIZE[size]} animate-spin motion-reduce:animate-none`}
      >
        {/* 바탕 고리는 장식이다. 도는 호가 어디까지 왔는지 눈으로 따라가게만 한다. */}
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="2.5"
          className="opacity-25"
        />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      {/*
        동작을 줄인 사람에게는 고리가 멈춘다. 멈춘 호는 "25% 까지 찬 진행" 으로도 읽히므로,
        그때 이 글자가 드러나 무슨 일이 일어나는지를 글로 대신 말한다.
      */}
      <span className="sr-only text-sm motion-reduce:not-sr-only">{label}</span>
    </span>
  );
}
