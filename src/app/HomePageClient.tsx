"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TrendingUp, Clock, Loader2, User, AlertCircle } from "lucide-react";
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

export default function HomePageClient() {
  const router = useRouter();
  const [keywords, setKeywords] = useState("");
  const [playlists, setPlaylists] = useState<RecommendedPlaylist[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(true);
  const [playlistError, setPlaylistError] = useState<string | null>(null);
  const [playlistActionError, setPlaylistActionError] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [nickname, setNickname] = useState<string | null>(null);
  const { playSong } = usePlayerStore();
  const { addToRecent, recentPlayed } = useFavoriteStore();

  const getErrorMessage = (error: unknown, fallback: string) =>
    error instanceof Error && error.message ? error.message : fallback;

  useEffect(() => {
    // H03 High 错误处理: 首页推荐歌单加载失败时给出可见提示，而不是静默吞掉异常
    getRecommendedPlaylists()
      .then((data) => {
        setPlaylists(data);
        setPlaylistError(null);
      })
      .catch((error: unknown) => {
        setPlaylists([]);
        setPlaylistError(getErrorMessage(error, "推荐歌单加载失败，请稍后重试"));
      })
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
    // H04 High 错误处理: 播放歌单失败时反馈给用户，避免点击后无响应
    setPlaylistActionError(null);
    try {
      const songs = await getPlaylistDetail(playlistId);
      if (songs.length > 0) {
        playSong(songs[0], songs);
        addToRecent(songs[0]);
      }
    } catch (error: unknown) {
      setPlaylistActionError(getErrorMessage(error, "播放歌单失败，请稍后重试"));
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* H05 High 架构设计: 交互状态下沉到 client island，page.tsx 保持为 server component */}
      <div className="fixed inset-0 -z-10 animate-gradient bg-gradient-to-br from-deep-bg via-neon-purple/20 to-deep-bg opacity-80" />
      <div className="fixed inset-0 -z-10 bg-deep-bg/50" />

      <div className="px-5 pt-14 pb-8 max-w-2xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-heading bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-pink bg-clip-text text-transparent">
              Music Player
            </h1>
            <p className="text-muted-foreground text-sm mt-1 font-mono tracking-wider">发现你的音乐世界</p>
          </div>
          <button
            onClick={() => setShowLogin(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon-blue/10 hover:bg-neon-blue/20 text-sm text-neon-cyan hover:text-neon-cyan border border-neon-blue/20 hover:border-neon-blue/40 transition-colors cursor-pointer"
          >
            <User className="size-4" />
            {nickname || "登录"}
          </button>
        </motion.div>

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

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="size-4 text-neon-pink" />
            <h2 className="text-lg font-semibold text-foreground font-heading">推荐歌单</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none -mx-5 px-5">
            {loadingPlaylists ? (
              <div className="flex items-center justify-center w-full py-8">
                <Loader2 className="size-6 text-neon-blue/60 animate-spin" />
              </div>
            ) : playlistError ? (
              <div className="flex w-full flex-col items-center justify-center py-8 text-muted-foreground">
                <AlertCircle className="mb-3 size-8 text-neon-pink" />
                <p className="text-sm text-neon-pink">{playlistError}</p>
                <p className="mt-1 text-xs text-muted-foreground">请稍后重试</p>
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
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="160px"
                      loading="eager"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-deep-bg/80 to-transparent" />
                  </div>
                  <p className="text-sm font-medium text-foreground truncate">
                    {pl.name}
                  </p>
                  <p className="text-xs text-neon-blue/40 font-mono">
                    {pl.playCount > 10000
                      ? `${Math.round(pl.playCount / 10000)}万次播放`
                      : `${pl.playCount}次播放`}
                  </p>
                </motion.div>
              ))
            )}
          </div>
          {playlistActionError && (
            <p className="mt-3 text-xs text-neon-pink">{playlistActionError}</p>
          )}
        </motion.section>

        {recentPlayed.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock className="size-4 text-neon-cyan" />
              <h2 className="text-lg font-semibold text-foreground font-heading">最近播放</h2>
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
          setNickname(name);
          setShowLogin(false);
        }}
      />
    </div>
  );
}
