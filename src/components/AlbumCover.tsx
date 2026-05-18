"use client";

import Image from "next/image";

interface AlbumCoverProps {
  src: string;
  alt: string;
  size?: number;
  spinning?: boolean;
}

export default function AlbumCover({
  src,
  alt,
  size = 200,
  spinning = false,
}: AlbumCoverProps) {
  return (
    <div
      className="relative rounded-full overflow-hidden shadow-2xl"
      style={{ width: size, height: size }}
    >
      <div
        className={`w-full h-full ${spinning ? "animate-[spin_8s_linear_infinite]" : ""}`}
      >
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          className="object-cover"
          unoptimized
        />
      </div>
      <div className="absolute inset-0 rounded-full border-4 border-white/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-8 rounded-full bg-gray-950/80 border-2 border-white/10" />
    </div>
  );
}
