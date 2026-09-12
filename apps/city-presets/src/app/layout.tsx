import type { Metadata } from "next";
import { Gowun_Batang } from "next/font/google";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const pretendard = localFont({
  src: "../../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  variable: "--font-sans",
  display: "swap",
  weight: "45 920",
});

// 도시 이름과 헤드라인에만 쓴다. 열두 개를 모으면 필터 목록이 아니라
// 여행지 목록처럼 읽혀야 하고, 그 읽힘을 명조가 만든다.
const gowunBatang = Gowun_Batang({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shadetide — 사진에 도시의 색을 입힌다",
  description:
    "도시 이름은 찍을 장소가 아니라 색의 이름이다. 열두 도시 중 하나를 고르면 사진이 그 색이 된다. 계산은 브라우저 안에서만 돈다.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 흰 지면이 사진의 매트다. 어두운 배경은 사진의 밝기를 다르게 읽게 하므로
    // 이 화면은 라이트 하나로 간다.
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${pretendard.variable} ${gowunBatang.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <ThemeProvider attribute="class" forcedTheme="light">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
