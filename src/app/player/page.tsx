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
      <div className="relative min-h-screen flex flex-col items-center justify-center text-zinc-500">
        <div className="fixed inset-0 -z-10 bg-gray-950" />
        <Music2 className="size-16 mb-4 text-zinc-700" />
        <p className="text-lg font-medium">还没有播放的歌曲</p>
        <p className="text-sm text-zinc-600 mt-1">去首页选一首歌吧</p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-sm transition-colors"
        >
          返回首页
        </button>
      </div>
    );
  }

  const fav = isFavorite(currentSong.id);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Dynamic gradient background from cover */}
      <div className="fixed inset-0 -z-10 animate-gradient bg-gradient-to-br from-gray-950 via-purple-950/40 to-gray-950" />
      <div className="fixed inset-0 -z-10 bg-gray-950/50" />

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
            className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="text-center flex-1 min-w-0 px-4">
            <p className="text-sm font-medium text-white truncate">
              {currentSong.name}
            </p>
            <p className="text-xs text-zinc-400 truncate">
              {currentSong.artist}
            </p>
          </div>
          <button
            onClick={() => toggleFavorite(currentSong)}
            className="p-2 -mr-2 transition-colors"
          >
            <Heart
              className={`size-5 ${
                fav
                  ? "text-pink-500 fill-pink-500"
                  : "text-zinc-400 hover:text-white"
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
          <h2 className="text-xl font-bold text-white">{currentSong.name}</h2>
          <p className="text-sm text-zinc-400 mt-0.5">
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
            className="h-1.5 w-full bg-white/10 rounded-full cursor-pointer group relative"
          >
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-[width] duration-100"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 size-3.5 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                left: `${progress}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-xs text-zinc-500 tabular-nums">
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
            className="text-zinc-300 hover:text-white transition-colors p-2"
          >
            <SkipBack className="size-7" fill="currentColor" />
          </button>
          <button
            onClick={togglePlay}
            className="p-4 bg-white rounded-full text-gray-950 hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-white/20"
          >
            {isPlaying ? (
              <Pause className="size-7" fill="currentColor" />
            ) : (
              <Play className="size-7 ml-0.5" fill="currentColor" />
            )}
          </button>
          <button
            onClick={nextSong}
            className="text-zinc-300 hover:text-white transition-colors p-2"
          >
            <SkipForward className="size-7" fill="currentColor" />
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
