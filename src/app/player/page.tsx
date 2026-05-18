"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  Music2,
} from "lucide-react";
import AlbumCover from "@/components/AlbumCover";
import Lyrics from "@/components/Lyrics";
import { usePlayerStore } from "@/store/playerStore";
import { useFavoriteStore } from "@/store/favoriteStore";
import { getLyric } from "@/services/musicApi";
import { formatTime } from "@/utils/formatTime";
import type { LyricLine } from "@/types/music";

export default function PlayerPage() {
  const router = useRouter();
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    nextSong,
    prevSong,
    setCurrentTime,
  } = usePlayerStore();

  const { toggleFavorite, isFavorite, addToRecent } = useFavoriteStore();
  const progressRef = useRef<HTMLDivElement>(null);
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);

  // Fetch lyrics when song changes
  useEffect(() => {
    if (currentSong) {
      setLyrics([]);
      getLyric(currentSong.id)
        .then(setLyrics)
        .catch(() => setLyrics([]));
    }
  }, [currentSong]);

  // Add to recent on mount
  useEffect(() => {
    if (currentSong) {
      addToRecent(currentSong);
    }
  }, [currentSong, addToRecent]);

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current || duration === 0) return;
      const rect = progressRef.current.getBoundingClientRect();
      const ratio = Math.max(
        0,
        Math.min(1, (e.clientX - rect.left) / rect.width)
      );
      setCurrentTime(ratio * duration);
    },
    [duration, setCurrentTime]
  );

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!currentSong) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center text-muted-foreground">
        <div className="fixed inset-0 -z-10 bg-deep-bg" />
        <Music2 className="size-16 mb-4 text-neon-blue/20" />
        <p className="text-lg font-medium">还没有播放的歌曲</p>
        <p className="text-sm text-muted-foreground mt-1">去首页选一首歌吧</p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 px-6 py-2.5 rounded-full bg-neon-blue/10 hover:bg-neon-blue/20 text-neon-cyan text-sm transition-colors border border-neon-blue/30 cursor-pointer"
        >
          返回首页
        </button>
      </div>
    );
  }

  const fav = isFavorite(currentSong.id);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Dynamic gradient background */}
      <div className="fixed inset-0 -z-10 animate-gradient bg-gradient-to-br from-deep-bg via-neon-purple/25 to-deep-bg" />
      <div className="fixed inset-0 -z-10 bg-deep-bg/50" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col h-screen max-w-lg mx-auto px-6"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between pt-12 pb-4 shrink-0">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-neon-cyan/60 hover:text-neon-cyan transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="text-center flex-1 min-w-0 px-4">
            <p className="text-sm font-medium text-foreground truncate">
              {currentSong.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {currentSong.artist}
            </p>
          </div>
          <button
            onClick={() => toggleFavorite(currentSong)}
            className="p-2 -mr-2 transition-colors cursor-pointer"
          >
            <Heart
              className={`size-5 ${
                fav
                  ? "text-neon-pink fill-neon-pink"
                  : "text-muted-foreground hover:text-neon-pink"
              } transition-colors`}
            />
          </button>
        </div>

        {/* Album cover */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center py-6 shrink-0"
        >
          <AlbumCover
            src={currentSong.coverUrl}
            alt={currentSong.name}
            size={260}
            spinning={isPlaying}
          />
        </motion.div>

        {/* Song info */}
        <div className="text-center mb-4 shrink-0">
          <h2 className="text-xl font-heading text-foreground neon-glow-cyan">{currentSong.name}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {currentSong.artist} &middot; {currentSong.album}
          </p>
        </div>

        {/* Lyrics */}
        <div className="flex-1 min-h-0 overflow-hidden mb-4">
          <Lyrics lyrics={lyrics} currentTime={currentTime} />
        </div>

        {/* Progress bar */}
        <div className="shrink-0 mb-3">
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="h-1.5 w-full bg-neon-blue/10 rounded-full cursor-pointer group relative"
          >
            <div
              className="h-full bg-gradient-to-r from-neon-blue to-neon-pink rounded-full transition-[width] duration-100"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 size-3.5 rounded-full bg-neon-cyan shadow-[0_0_10px_rgba(0,255,255,0.8)] opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                left: `${progress}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-xs text-neon-blue/50 font-mono tabular-nums">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex items-center justify-center gap-8 pb-8 shrink-0"
        >
          <button
            onClick={prevSong}
            className="text-neon-blue/70 hover:text-neon-cyan transition-colors p-2 cursor-pointer"
          >
            <SkipBack className="size-7" fill="currentColor" />
          </button>
          <button
            onClick={togglePlay}
            className="p-4 bg-deep-bg rounded-full text-neon-cyan hover:scale-105 active:scale-95 transition-transform neon-box-cyan hover:shadow-[0_0_20px_rgba(0,255,255,0.5)]"
          >
            {isPlaying ? (
              <Pause className="size-7" fill="currentColor" />
            ) : (
              <Play className="size-7 ml-0.5" fill="currentColor" />
            )}
          </button>
          <button
            onClick={nextSong}
            className="text-neon-blue/70 hover:text-neon-cyan transition-colors p-2 cursor-pointer"
          >
            <SkipForward className="size-7" fill="currentColor" />
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
