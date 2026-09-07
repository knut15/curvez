import { HomeView } from "@/views/home";
import { SiteHeader } from "@/widgets/site-header";

export default function HomePage() {
  return (
    <main className="flex h-dvh flex-col overflow-hidden">
      <SiteHeader current="home" />
      <HomeView />
    </main>
  );
}
