import type { Metadata } from "next";
import { Righteous, Poppins } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import PlayerBar from "@/components/PlayerBar";

const righteous = Righteous({
  variable: "--font-righteous",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Music Player",
  description: "轻量音乐播放器",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${righteous.variable} ${poppins.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-deep-bg text-foreground font-body">
        <main className="flex-1 pb-36">{children}</main>
        <BottomNav />
        <PlayerBar />
      </body>
    </html>
  );
}
