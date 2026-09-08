import Image from "next/image";

/**
 * 배경은 다섯 장 중 **한 장**이다. 어느 장이 걸릴지는 방문할 때마다 서버가 정한다.
 * 그래서 이 화면은 정적 생성이 아니라 요청마다 렌더한다(`app/page.tsx` 의 `dynamic`).
 *
 * 섞기를 클라이언트에서 하지 않는 이유: 첫 페인트 뒤에 그림을 바꾸면 정해진 한 장이
 * 한 번 번쩍이고 교체된다. 서버에서 정하면 사용자가 받는 HTML 이 이미 최종 그림이다.
 *
 * **돌아가지 않는다.** 한 번 정해진 그림은 그 방문 동안 그대로다. 그래서 이 화면에는
 * 모션이 없고 `prefers-reduced-motion` 으로 끌 것도 없다.
 *
 * 워드마크는 테마와 무관하게 검은색 고정이다 — 배경이 사진이라 따라갈 대상이 없고,
 * 홈에서 테마가 바꾸는 것은 헤더뿐이다. 스크림은 두지 않는다.
 */
type Backdrop = {
  src: string;
  alt: string;
  /**
   * 그림이 뜨기 전에 깔아 둘 바탕색. 사진마다 테두리 10% 의 중앙값을 재서 넣었다.
   * 없으면 그 구간에 body 배경(다크에서 거의 검정)이 드러나고, 그 위의 검은 워드마크가
   * 통째로 사라진다. 플랫 그래픽은 이 색이 곧 자기 바탕이라 SVG 가 그 위에 얹힌다.
   */
  ground: string;
  /** SVG 형상을 아래쪽에 얹는 플랫 그래픽인가. 나머지는 화면을 채우는 사진이다. */
  flat?: boolean;
};

const BACKDROPS: Backdrop[] = [
  {
    src: "/brand/polygon-field-plain.webp",
    alt: "teal 과 mint 종이 조각이 화면을 가득 채우고, 오른쪽 아래에서 손이 조각 하나를 제자리에 놓는 장면",
    ground: "#17928e",
  },
  {
    src: "/brand/maker-portrait.webp",
    alt: "teal 조명이 도는 어두운 벽 앞에서 안경 쓴 사람이 화면 밖 위쪽을 올려다보는 상반신",
    ground: "#144946",
  },
  {
    src: "/brand/workbench.webp",
    alt: "위에서 내려다본 teal 작업대. 자와 칼, 격자 위에 놓인 접힌 종이 모듈을 손이 하나씩 옮긴다",
    ground: "#3ca89e",
  },
  {
    src: "/brand/mark-field.svg",
    alt: "teal 바탕에 검은 기하 형상이 늘어선 플랫 그래픽. 가운데 하나만 코랄이다",
    ground: "#85c7bf",
    flat: true,
  },
  {
    src: "/brand/campaign-wall.webp",
    alt: "mint 색 벽 앞에서 접은 종이 조각 두 개를 눈에 대고 혀를 내민 사람",
    ground: "#9eddcb",
  },
];

function Backdrop({ layer }: { layer: Backdrop }) {
  return (
    <div className="absolute inset-0" style={{ backgroundColor: layer.ground }}>
      {layer.flat ? (
        <>
          {/* SVG 는 이미 벡터라 next/image 최적화가 할 일이 없다. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={layer.src}
            alt={layer.alt}
            className="absolute inset-x-0 bottom-0 h-[52%] w-full object-contain object-bottom"
          />
        </>
      ) : (
        <Image
          src={layer.src}
          alt={layer.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      )}
    </div>
  );
}

/**
 * 요청마다 한 장을 뽑는다. 컴포넌트 본문이 아니라 여기서 뽑는 이유는 이것이
 * 렌더 입력이 아니라 **요청 스코프 데이터**이기 때문이다 — `headers()` 나 `cookies()` 와 같은 자리다.
 * 렌더 안에서 뽑으면 컴포넌트가 순수하지 않게 되고, React Compiler 가 그것을 막는다
 * (`react-hooks/purity`).
 */
async function pickBackdrop(): Promise<Backdrop> {
  return BACKDROPS[Math.floor(Math.random() * BACKDROPS.length)];
}

export async function HomeView() {
  const layer = await pickBackdrop();

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden">
      <Backdrop layer={layer} />

      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center text-[#101514]">
        <h1 className="text-[clamp(2.1rem,9vw,6.6rem)] leading-[0.82] font-black tracking-[-0.03em] uppercase">
          hand<span className="text-[#ff6b4a]">w</span>ork
        </h1>
      </div>
    </div>
  );
}
