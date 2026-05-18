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
      className="relative rounded-full overflow-hidden shadow-2xl shadow-neon-blue/20"
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
          loading="eager"
          unoptimized
        />
      </div>
      <div className="absolute inset-0 rounded-full border-4 border-neon-cyan/20 shadow-[0_0_20px_rgba(0,255,255,0.15),0_0_40px_rgba(0,128,255,0.1)]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-8 rounded-full bg-deep-bg/90 border-2 border-neon-cyan/30" />
    </div>
  );
}
