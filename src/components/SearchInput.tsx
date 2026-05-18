"use client";

import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}

export default function SearchInput({
  value,
  onChange,
  onSubmit,
  placeholder = "搜索歌曲、歌手、专辑",
}: SearchInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <div className="relative w-full">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 py-3 pl-12 pr-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-white/20 focus:ring-2 focus:ring-white/10 transition-all"
      />
    </div>
  );
}
