import Image from "next/image";

/**
 * 배경 세 장이 24초 주기로 번갈아 뜬다. A(사진) → E(플랫 그래픽) → F(캠페인 사진).
 * 예정된 모션이라 CSS 애니메이션이고 움직이는 속성은 opacity 하나다.
 * `prefers-reduced-motion` 에서는 두 층을 끄고 A 만 남긴다.
 *
 * 워드마크는 테마와 무관하게 검은색 고정이다 — 배경이 사진이라 따라갈 대상이 없고,
 * 홈에서 테마가 바꾸는 것은 헤더뿐이다. 스크림은 두지 않는다.
 */
export function HomeView() {
  return (
    <div className="relative min-h-0 flex-1 overflow-hidden">
      <Image
        src="/brand/polygon-field-plain.webp"
        alt="teal 과 mint 종이 조각이 화면을 가득 채우고, 오른쪽 아래에서 손이 조각 하나를 제자리에 놓는 장면"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* 2층: 플랫 그래픽. 필드가 단색이라 대비가 균일하고, 형상은 아래쪽에만 둔다. */}
      <div className="brand-layer-2 absolute inset-0 bg-[#85c7bf]" aria-hidden>
        {/* SVG 는 이미 벡터라 next/image 최적화가 할 일이 없다. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/mark-field.svg"
          alt=""
          className="absolute inset-x-0 bottom-0 h-[52%] w-full object-contain object-bottom"
        />
      </div>

      {/* 3층: 캠페인 사진. */}
      <div className="brand-layer-3 absolute inset-0" aria-hidden>
        <Image
          src="/brand/campaign-wall.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center text-[#101514]">
        <h1 className="text-[clamp(2.1rem,9vw,6.6rem)] leading-[0.82] font-black tracking-[-0.03em] uppercase">
          hand<span className="text-[#ff6b4a]">w</span>ork
        </h1>
      </div>
    </div>
  );
}
