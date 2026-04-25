import type { Metadata } from "next";
import { newsreader, notoSerifSC, jetbrainsMono } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenOri · 生成式引擎优化 GEO",
  description:
    "OpenOri 为品牌优化在 6 大 AI 平台中的可见度。GEO - Generative Engine Optimization。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`antialiased ${newsreader.variable} ${notoSerifSC.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
