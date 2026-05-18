"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { usePlayerStore } from "@/store/playerStore";
import { formatTime } from "@/utils/formatTime";
import { useCallback, useRef } from "react";

export default function PlayerBar() {
  const currentSong = usePlayerStore((s) => s.currentSong);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const nextSong = usePlayerStore((s) => s.nextSong);
  const prevSong = usePlayerStore((s) => s.prevSong);
  const setCurrentTime = usePlayerStore((s) => s.setCurrentTime);

  const progressRef = useRef<HTMLDivElement>(null);

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current || duration === 0) return;
      const rect = progressRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setCurrentTime(ratio * duration);
    },
    [duration, setCurrentTime]
  );

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <AnimatePresence>
      {currentSong && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 inset-x-0 z-50 backdrop-blur-2xl bg-deep-bg/90 border-t border-neon-blue/25"
        >
          {/* Progress bar (clickable) */}
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="h-1 w-full bg-neon-blue/10 cursor-pointer group relative"
          >
            <div
              className="h-full bg-gradient-to-r from-neon-blue to-neon-cyan transition-[width] duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 size-3 rounded-full bg-neon-cyan shadow-[0_0_8px_rgba(0,255,255,0.6)] opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `${progress}%`, transform: "translate(-50%, -50%)" }}
            />
          </div>

          <div className="flex items-center gap-4 px-4 py-3 max-w-4xl mx-auto">
            {/* Song info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative size-12 rounded-lg overflow-hidden shrink-0 shadow-md shadow-black/40">
                <Image
                  src={currentSong.coverUrl}
                  alt={currentSong.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                  unoptimized
                />
              </div>
              <div className="min-w-0">
                <p className="text-foreground text-sm font-medium truncate">
                  {currentSong.name}
                </p>
                <p className="text-muted-foreground text-xs truncate">
                  {currentSong.artist}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={prevSong}
                className="text-neon-blue/60 hover:text-neon-blue transition-colors p-2 cursor-pointer"
                aria-label="上一首"
              >
                <SkipBack className="size-5" fill="currentColor" />
              </button>

              <button
                onClick={togglePlay}
                className="text-neon-cyan hover:text-neon-cyan/80 transition-colors p-2 bg-neon-blue/20 hover:bg-neon-blue/30 rounded-full neon-box-blue cursor-pointer"
                aria-label={isPlaying ? "暂停" : "播放"}
              >
                {isPlaying ? (
                  <Pause className="size-5" fill="currentColor" />
                ) : (
                  <Play className="size-5" fill="currentColor" />
                )}
              </button>

              <button
                onClick={nextSong}
                className="text-neon-blue/60 hover:text-neon-blue transition-colors p-2 cursor-pointer"
                aria-label="下一首"
              >
                <SkipForward className="size-5" fill="currentColor" />
              </button>
            </div>

            {/* Time */}
            <div className="flex items-center gap-1 text-xs text-neon-cyan/60 font-mono tabular-nums shrink-0">
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
