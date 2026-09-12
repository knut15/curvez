import { PresetPicker } from "@/widgets/preset-picker";

/**
 * 한 화면으로 끝낸다. 사진을 고르기 전에는 데모 사진이 뷰어에 들어가 있다.
 */
export default function Home() {
  return (
    <div className="mx-auto flex h-dvh w-full max-w-[430px] flex-col border-border sm:border-x">
      <header className="shrink-0 px-5 py-3.5">
        <span className="text-[13px] font-medium tracking-tight">
          city-presets
        </span>
      </header>

      <PresetPicker />
    </div>
  );
}
