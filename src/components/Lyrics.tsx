"use client";

import { useEffect, useMemo, useRef } from "react";
import type { LyricLine } from "@/types/music";

interface LyricsProps {
  lyrics: LyricLine[];
  currentTime: number;
}

export default function Lyrics({ lyrics, currentTime }: LyricsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLParagraphElement>(null);

  const activeIndex = useMemo(
    () =>
      lyrics.reduce((acc, line, idx) => {
        if (currentTime >= line.time) return idx;
        return acc;
      }, 0),
    [lyrics, currentTime]
  );

  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      const container = containerRef.current;
      const active = activeRef.current;
      const offset =
        active.offsetTop - container.offsetHeight / 2 + active.offsetHeight / 2;
      container.scrollTo({ top: offset, behavior: "smooth" });
    }
  }, [activeIndex]);

  if (lyrics.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm font-mono">
        暂无歌词
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto px-4"
      style={{
        maskImage: "linear-gradient(transparent, black 15%, black 85%, transparent)",
        WebkitMaskImage: "linear-gradient(transparent, black 15%, black 85%, transparent)",
      }}
    >
      <div className="py-20 space-y-4">
        {lyrics.map((line, idx) => (
          <p
            key={idx}
            ref={idx === activeIndex ? activeRef : null}
            className={`text-center transition-all duration-300 ${
              idx === activeIndex
                ? "text-neon-cyan text-lg font-semibold scale-105 neon-glow-cyan"
                : idx < activeIndex
                  ? "text-neon-blue/30 text-base"
                  : "text-muted-foreground text-base"
            }`}
          >
            {line.text}
          </p>
        ))}
      </div>
    </div>
  );
}
