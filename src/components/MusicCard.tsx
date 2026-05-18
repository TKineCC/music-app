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
      className="group flex items-center gap-4 w-full p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
    >
      {index !== undefined && (
        <span className="w-6 text-center text-sm text-zinc-500 group-hover:text-zinc-300 tabular-nums">
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
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="size-4 text-white fill-white" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{song.name}</p>
        <p className="text-xs text-zinc-400 truncate">
          {song.artist} - {song.album}
        </p>
      </div>
      <span className="text-xs text-zinc-500 shrink-0">
        {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, "0")}
      </span>
    </button>
  );
}
