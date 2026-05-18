"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TrendingUp, Clock, Loader2, User } from "lucide-react";
import SearchInput from "@/components/SearchInput";
import MusicCard from "@/components/MusicCard";
import LoginModal from "@/components/LoginModal";
import { usePlayerStore } from "@/store/playerStore";
import { useFavoriteStore } from "@/store/favoriteStore";
import { getRecommendedPlaylists, getPlaylistDetail } from "@/services/musicApi";
import Image from "next/image";

interface RecommendedPlaylist {
  id: number;
  name: string;
  coverUrl: string;
  playCount: number;
}

export default function Home() {
  const router = useRouter();
  const [keywords, setKeywords] = useState("");
  const [playlists, setPlaylists] = useState<RecommendedPlaylist[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [nickname, setNickname] = useState<string | null>(null);
  const { playSong } = usePlayerStore();
  const { addToRecent, recentPlayed } = useFavoriteStore();

  useEffect(() => {
    getRecommendedPlaylists()
      .then(setPlaylists)
      .catch(() => {})
      .finally(() => setLoadingPlaylists(false));
  }, []);

  const handleSearch = () => {
    const trimmed = keywords.trim();
    if (trimmed) {
      router.push(`/search?keywords=${encodeURIComponent(trimmed)}`);
    }
  };

  const handlePlayRecent = (song: (typeof recentPlayed)[0]) => {
    playSong(song, recentPlayed);
    addToRecent(song);
  };

  const handlePlayPlaylist = async (playlistId: number) => {
    try {
      const songs = await getPlaylistDetail(playlistId);
      if (songs.length > 0) {
        playSong(songs[0], songs);
        addToRecent(songs[0]);
      }
    } catch {}
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10 animate-gradient bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 opacity-80" />
      <div className="fixed inset-0 -z-10 bg-gray-950/40" />

      <div className="px-5 pt-14 pb-8 max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
              Music Player
            </h1>
            <p className="text-zinc-500 text-sm mt-1">发现你的音乐世界</p>
          </div>
          <button
            onClick={() => setShowLogin(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-sm text-zinc-300 hover:text-white transition-colors"
          >
            <User className="size-4" />
            {nickname || '登录'}
          </button>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <SearchInput
            value={keywords}
            onChange={setKeywords}
            onSubmit={handleSearch}
          />
        </motion.div>

        {/* Recommended Playlists */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="size-4 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">推荐歌单</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none -mx-5 px-5">
            {loadingPlaylists ? (
              <div className="flex items-center justify-center w-full py-8">
                <Loader2 className="size-6 text-zinc-500 animate-spin" />
              </div>
            ) : (
              playlists.map((pl, idx) => (
                <motion.div
                  key={pl.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 * idx }}
                  className="shrink-0 w-40 cursor-pointer group"
                  onClick={() => handlePlayPlaylist(pl.id)}
                >
                  <div className="relative size-40 rounded-2xl overflow-hidden mb-2">
                    <Image
                      src={pl.coverUrl}
                      alt={pl.name}
                      width={160}
                      height={160}
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="eager"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <p className="text-sm font-medium text-white truncate">
                    {pl.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {pl.playCount > 10000
                      ? `${Math.round(pl.playCount / 10000)}万次播放`
                      : `${pl.playCount}次播放`}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </motion.section>

        {/* Recent Played */}
        {recentPlayed.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock className="size-4 text-pink-400" />
              <h2 className="text-lg font-semibold text-white">最近播放</h2>
            </div>
            <div className="space-y-1">
              {recentPlayed.slice(0, 10).map((song, idx) => (
                <MusicCard
                  key={song.id}
                  song={song}
                  index={idx}
                  onClick={() => handlePlayRecent(song)}
                />
              ))}
            </div>
          </motion.section>
        )}
      </div>

      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={(name) => {
          setNickname(name)
          setShowLogin(false)
        }}
      />
    </div>
  );
}
