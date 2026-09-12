import { Button } from "@scopulus/ui";

import { PresetPicker } from "@/widgets/preset-picker";

/**
 * 한 화면으로 끝낸다. 사진을 고르기 전에는 데모 사진이 뷰어에 들어가 있다.
 *
 * 사진 고르기는 아직 붙지 않았다. 셰이더 이식(`docs/GOAL.md` 빌드 순서 1~5번)이
 * 끝나야 고른 사진에 입힐 것이 생긴다.
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

      <div className="shrink-0 px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {/* 높이만 덮는다. 기본 h-10(40px)은 모바일 최소 터치 영역 44px 에 못 미친다 */}
        <Button type="button" className="h-12 w-full text-[15px]">
          사진 고르기
        </Button>
      </div>
    </div>
  );
}
