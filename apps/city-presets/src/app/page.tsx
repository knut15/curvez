import Link from "next/link";
import { Brand } from "@/widgets/brand";
import { PresetPicker } from "@/widgets/preset-picker";

/**
 * 한 화면으로 끝낸다. 사진을 고르기 전에는 데모 사진이 뷰어에 들어가 있다.
 */
export default function Home() {
  return (
    <div className="mx-auto flex h-dvh w-full max-w-[430px] flex-col border-border sm:border-x">
      <header className="flex shrink-0 items-baseline justify-between px-5 py-3.5">
        <Brand />
        <Link
          href="/about"
          className="text-[13px] text-muted-foreground underline-offset-4 hover:underline"
        >
          소개
        </Link>
      </header>

      <PresetPicker />
    </div>
  );
}
