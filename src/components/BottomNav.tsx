"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Heart } from "lucide-react";
import { usePlayerStore } from "@/store/playerStore";

const navItems = [
  { href: "/", label: "首页", icon: Home },
  { href: "/search", label: "搜索", icon: Search },
  { href: "/favorites", label: "收藏", icon: Heart },
];

export default function BottomNav() {
  const pathname = usePathname();
  const currentSong = usePlayerStore((s) => s.currentSong);

  return (
    <nav
      className={`fixed inset-x-0 z-40 bg-gray-950/80 backdrop-blur-xl border-t border-white/5 transition-all duration-300 ${
        currentSong ? "bottom-[72px]" : "bottom-0"
      }`}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-6 py-1.5 rounded-xl transition-colors ${
                isActive
                  ? "text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Icon
                className={`size-5 ${isActive ? "fill-white" : ""}`}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
