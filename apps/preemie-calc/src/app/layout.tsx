import type { Metadata } from "next";

import { siteName } from "@/shared/config/site";
import { Announcer } from "@/shared/ui";

import "./globals.css";

export const metadata: Metadata = {
  title: siteName.value,
  description:
    "출생일과 출산 예정일을 입력하면 생후 나이와 교정 나이를 나란히 보여주는 계산기",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body>
        {children}
        <Announcer />
      </body>
    </html>
  );
}
