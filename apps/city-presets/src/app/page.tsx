import { AppLink } from "@scopulus/ui";
import { Brand } from "@/widgets/brand";
import { PresetPicker } from "@/widgets/preset-picker";

/**
 * 한 화면으로 끝낸다. 사진을 고르기 전에는 데모 사진이 뷰어에 들어가 있다.
 */
export default function Home() {
  return (
    <div className="mx-auto flex h-dvh w-full max-w-[430px] flex-col border-border sm:border-x">
      {/* 버튼이 들어와 세로가 두꺼워지므로 위아래 여백을 줄인다. 사진이 쓸 자리다 */}
      <header className="flex shrink-0 items-center justify-between px-5 py-2">
        <Brand />
        <AppLink href="/about" variant="cta-quiet">
          소개
        </AppLink>
      </header>

      <PresetPicker />
    </div>
  );
}
