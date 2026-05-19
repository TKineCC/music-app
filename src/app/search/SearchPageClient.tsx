"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, SearchX, AlertCircle } from "lucide-react";
import SearchInput from "@/components/SearchInput";
import MusicCard from "@/components/MusicCard";
import { usePlayerStore } from "@/store/playerStore";
import { useFavoriteStore } from "@/store/favoriteStore";
import { searchSongs } from "@/services/musicApi";
import type { Song } from "@/types/music";

export default function SearchPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlKeywords = searchParams.get("keywords") || "";

  const [keywords, setKeywords] = useState(urlKeywords);
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const { playSong } = usePlayerStore();
  const { addToRecent } = useFavoriteStore();

  useEffect(() => {
    const trimmedKeywords = urlKeywords.trim();

    if (!trimmedKeywords) {
      const timer = setTimeout(() => {
        setResults([]);
        setSearched(false);
        setError(null);
        setLoading(false);
      }, 0);

      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setLoading(true);
      setSearched(true);
      setError(null);
    }, 0);

    searchSongs(trimmedKeywords, 20)
      .then((songs) => {
        setResults(songs);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "搜索失败，请稍后重试");
        setResults([]);
        setLoading(false);
      });

    return () => clearTimeout(timer);
  }, [urlKeywords]);

  const handleSearch = () => {
    const trimmed = keywords.trim();
    if (trimmed) {
      router.push(`/search?keywords=${encodeURIComponent(trimmed)}`);
    }
  };

  const handlePlay = (song: Song) => {
    playSong(song, results.length > 0 ? results : []);
    addToRecent(song);
  };

  return (
    <div className="relative min-h-screen">
      {/* H05 High 架构设计: 搜索页由 server page 承载，交互查询状态收敛到 client island */}
      <div className="fixed inset-0 -z-10 animate-gradient bg-gradient-to-br from-deep-bg via-neon-blue/15 to-deep-bg" />
      <div className="fixed inset-0 -z-10 bg-deep-bg/50" />

      <div className="px-5 pt-14 pb-8 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <SearchInput
            value={keywords}
            onChange={setKeywords}
            onSubmit={handleSearch}
          />
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-8 text-neon-blue/60 animate-spin" />
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-muted-foreground"
          >
            <AlertCircle className="size-12 mb-4 text-neon-pink" />
            <p className="text-sm text-neon-pink">{error}</p>
            <p className="text-xs text-muted-foreground mt-1">请检查网络连接后重试</p>
          </motion.div>
        ) : searched && results.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-muted-foreground"
          >
            <SearchX className="size-12 mb-4 text-neon-blue/30" />
            <p className="text-sm">未找到与 &ldquo;{urlKeywords}&rdquo; 相关的歌曲</p>
            <p className="text-xs text-muted-foreground mt-1">换个关键词试试吧</p>
          </motion.div>
        ) : results.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-1"
          >
            <p className="text-xs text-neon-blue/50 font-mono mb-3">
              找到 {results.length} 首相关歌曲
            </p>
            <AnimatePresence>
              {results.map((song, idx) => (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                >
                  <MusicCard
                    song={song}
                    index={idx}
                    onClick={() => handlePlay(song)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <p className="text-sm">输入关键词搜索歌曲</p>
          </div>
        )}
      </div>
    </div>
  );
}
