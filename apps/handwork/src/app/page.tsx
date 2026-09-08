import { HomeView } from "@/views/home";
import { SiteHeader } from "@/widgets/site-header";

// 배경을 방문할 때마다 다시 뽑는다. 정적 생성하면 빌드 때 뽑은 한 장이 굳어
// 모든 방문자가 같은 그림을 본다.
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main className="flex h-dvh flex-col overflow-hidden">
      <SiteHeader current="home" />
      <HomeView />
    </main>
  );
}
