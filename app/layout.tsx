import type { Metadata } from "next";
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
    <html lang="zh-CN" className="antialiased">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/instrument-serif@5.0.0/index.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/instrument-sans@5.0.0/400.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/instrument-sans@5.0.0/500.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/jetbrains-mono@5.0.0/400.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/jetbrains-mono@5.0.0/500.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/noto-serif-sc@5.0.0/400.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-sc@5.0.0/400.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-sc@5.0.0/500.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
