import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ReduxProvider } from "@/store/provider";
import { cookies } from "next/headers";
import { ThemeProvider } from "@/components/theme-provider";
import GlobalLoadingIndicator from "@/components/loading/GlobalLoadingIndicator";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400"], // 사용할 폰트 두께
});

export const metadata: Metadata = {
  title: "sk-final-2",
  description: "Domain Specific GenAI",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  return (
    <html lang="en">
      <head>
        <Script
          src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${notoSansKr.className} antialiased`}>
        <ReduxProvider accessToken={accessToken}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <GlobalLoadingIndicator />
            {children}
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
