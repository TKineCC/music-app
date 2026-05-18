"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import type { Song } from "@/types/music";

interface MusicCardProps {
  song: Song;
  onClick: () => void;
  index?: number;
}

export default function MusicCard({ song, onClick, index }: MusicCardProps) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-4 w-full p-3 rounded-xl hover:bg-neon-blue/5 transition-colors text-left cursor-pointer"
    >
      {index !== undefined && (
        <span className="w-6 text-center text-sm text-neon-blue/50 group-hover:text-neon-blue font-mono tabular-nums">
          {index + 1}
        </span>
      )}
      <div className="relative size-12 rounded-lg overflow-hidden shrink-0">
        <Image
          src={song.coverUrl}
          alt={song.name}
          width={48}
          height={48}
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-neon-blue/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="size-4 text-neon-cyan fill-neon-cyan" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{song.name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {song.artist} - {song.album}
        </p>
      </div>
      <span className="text-xs text-neon-blue/40 font-mono tabular-nums shrink-0">
        {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, "0")}
      </span>
    </button>
  );
}
