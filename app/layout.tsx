import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "小学生满分作文助手",
  description: "AI 作文辅导工具，输入标题生成调研问卷，精准产出满分范文",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}