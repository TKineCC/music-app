"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Clock, Music2 } from "lucide-react";
import MusicCard from "@/components/MusicCard";
import { usePlayerStore } from "@/store/playerStore";
import { useFavoriteStore } from "@/store/favoriteStore";

type Tab = "favorites" | "recent";

export default function FavoritesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("favorites");
  const { playSong } = usePlayerStore();
  const { favorites, recentPlayed, addToRecent } = useFavoriteStore();

  const handlePlay = (
    song: (typeof favorites)[0],
    list: typeof favorites
  ) => {
    playSong(song, list);
    addToRecent(song);
  };

  const currentList = activeTab === "favorites" ? favorites : recentPlayed;

  return (
    <div className="relative min-h-screen">
      {/* Gradient background */}
      <div className="fixed inset-0 -z-10 animate-gradient bg-gradient-to-br from-deep-bg via-neon-pink/15 to-deep-bg" />
      <div className="fixed inset-0 -z-10 bg-deep-bg/50" />

      <div className="px-5 pt-14 pb-8 max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-foreground font-heading">我的音乐</h1>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex gap-2 mb-6"
        >
          <button
            onClick={() => setActiveTab("favorites")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
              activeTab === "favorites"
                ? "bg-neon-blue/15 text-neon-cyan border border-neon-blue/30"
                : "bg-white/5 text-muted-foreground border border-transparent hover:bg-neon-blue/10"
            }`}
          >
            <Heart className="size-4" />
            收藏
            {favorites.length > 0 && (
              <span className="text-xs bg-neon-blue/20 rounded-full px-1.5 py-0.5">
                {favorites.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("recent")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
              activeTab === "recent"
                ? "bg-neon-blue/15 text-neon-cyan border border-neon-blue/30"
                : "bg-white/5 text-muted-foreground border border-transparent hover:bg-neon-blue/10"
            }`}
          >
            <Clock className="size-4" />
            最近播放
            {recentPlayed.length > 0 && (
              <span className="text-xs bg-neon-blue/20 rounded-full px-1.5 py-0.5">
                {recentPlayed.length}
              </span>
            )}
          </button>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {currentList.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-muted-foreground"
            >
              <Music2 className="size-12 mb-4 text-neon-blue/20" />
              <p className="text-sm">
                {activeTab === "favorites"
                  ? "还没有收藏的歌曲"
                  : "还没有播放记录"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {activeTab === "favorites"
                  ? "播放歌曲时点击心形图标即可收藏"
                  : "去首页播放一首歌吧"}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: activeTab === "favorites" ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeTab === "favorites" ? 10 : -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-1"
            >
              {currentList.map((song, idx) => (
                <MusicCard
                  key={`${activeTab}-${song.id}`}
                  song={song}
                  index={idx}
                  onClick={() => handlePlay(song, currentList)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
