import { cva, type VariantProps } from "class-variance-authority";

/**
 * 사람이나 사물 하나를 가리키는 작은 원형 그림.
 *
 * 스펙은 `packages/scopulus-ui/design/components/Avatar.md` 가 정본이다.
 *
 * **이름을 반드시 받는다.** 그림이 있으면 그 이름이 `alt` 가 되고, 없으면 이니셜과
 * `aria-label` 이 된다. `alt` 를 따로 받지 않는 이유는 한쪽만 채운 호출을 막기 위해서다 —
 * `alt=""` 로 두면 그림이 장식이 되어 누구의 얼굴인지 아무 데도 남지 않는다.
 *
 * **그림이 실패하는 것을 감지하지 않는다.** 감지하려면 `onError` 와 상태가 필요하고 그 순간
 * `"use client"` 가 붙는다. 실패하면 깨진 그림이 그대로 남는다 — 이니셜로 물러서지 않는다.
 * 믿을 수 없는 주소면 `src` 를 주지 않는 쪽을 부르는 쪽이 고른다.
 *
 * **이니셜을 직접 받지 않는다.** 이름에서 만든다. 둘을 따로 받으면 이름과 이니셜이 다른
 * 호출이 생기고, 화면에 보이는 글자와 읽히는 글자가 어긋난다.
 *
 * `className` 을 열지 않는다. 크기는 `size` 가 정하고 그 밖에 바깥에서 정할 것이 없다.
 */
const avatarClass = cva(
  "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted font-medium text-muted-foreground",
  {
    variants: {
      size: {
        sm: "size-6 text-xs",
        default: "size-10 text-sm",
        lg: "size-16 text-lg",
      },
    },
    defaultVariants: { size: "default" },
  },
);

/**
 * 이름을 최대 두 글자로 줄인다. 낱말이 둘 이상이면 앞 두 낱말의 첫 글자,
 * 하나면 앞 두 글자다. `Ada Lovelace` → `AL`, `김현우` → `김현`.
 */
function initialsOf(name: string) {
  const words = name.trim().split(/\s+/);
  const letters =
    words.length > 1
      ? words[0].charAt(0) + words[1].charAt(0)
      : words[0].slice(0, 2);
  return letters.toUpperCase();
}

type AvatarProps = VariantProps<typeof avatarClass> & {
  /** 이 그림이 누구인지. `alt` 와 이니셜 양쪽에 쓴다. */
  name: string;
  /** 그림 주소. 없으면 이니셜이 대신 선다. */
  src?: string;
};

export function Avatar({ name, src, size }: AvatarProps) {
  if (src) {
    // 이름은 `alt` 하나가 갖는다. 바깥 span 에 `aria-label` 을 얹으면 두 번 읽힌다.
    return (
      <span className={avatarClass({ size })}>
        <img src={src} alt={name} className="size-full object-cover" />
      </span>
    );
  }

  return (
    <span role="img" aria-label={name} className={avatarClass({ size })}>
      {/* 이니셜은 이름을 줄인 장식이다. 읽히는 이름은 위의 `aria-label` 하나다. */}
      <span aria-hidden>{initialsOf(name)}</span>
    </span>
  );
}
