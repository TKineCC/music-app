import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Song } from '@/types/music'
import { audioManager } from '@/lib/audioManager'
import { getSongUrl } from '@/services/musicApi'

// Track which song is being fetched to prevent race conditions
let currentPlayId = 0

interface PlayerState {
  currentSong: Song | null
  isPlaying: boolean
  currentTime: number
  duration: number
  playlist: Song[]

  playSong: (song: Song, playlist?: Song[]) => void
  togglePlay: () => void
  nextSong: () => void
  prevSong: () => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
}

function fetchAndPlay(song: Song) {
  const playId = ++currentPlayId
  audioManager.pause()
  getSongUrl(song.id)
    .then((url) => {
      if (playId !== currentPlayId) return
      if (url) {
        const songWithUrl = { ...song, audioUrl: url }
        usePlayerStore.setState({ currentSong: songWithUrl })
        audioManager.play(songWithUrl)
      } else {
        usePlayerStore.setState({ isPlaying: false })
      }
    })
    .catch(() => {
      if (playId !== currentPlayId) return
      usePlayerStore.setState({ isPlaying: false })
    })
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentSong: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      playlist: [],

      playSong: (song: Song, playlist?: Song[]) => {
        set({
          currentSong: song,
          isPlaying: true,
          currentTime: 0,
          duration: song.duration,
          ...(playlist ? { playlist } : {}),
        })
        fetchAndPlay(song)
      },

      togglePlay: () => {
        const { isPlaying } = get()
        if (isPlaying) {
          audioManager.pause()
        } else {
          audioManager.play()
        }
        set({ isPlaying: !isPlaying })
      },

      nextSong: () => {
        const { currentSong, playlist } = get()
        if (!currentSong || playlist.length === 0) return

        const currentIndex = playlist.findIndex((s) => s.id === currentSong.id)
        const nextIndex = (currentIndex + 1) % playlist.length
        const next = playlist[nextIndex]
        set({
          currentSong: next,
          isPlaying: true,
          currentTime: 0,
          duration: next.duration,
        })
        fetchAndPlay(next)
      },

      prevSong: () => {
        const { currentSong, playlist } = get()
        if (!currentSong || playlist.length === 0) return

        const currentIndex = playlist.findIndex((s) => s.id === currentSong.id)
        const prevIndex =
          (currentIndex - 1 + playlist.length) % playlist.length
        const prev = playlist[prevIndex]
        set({
          currentSong: prev,
          isPlaying: true,
          currentTime: 0,
          duration: prev.duration,
        })
        fetchAndPlay(prev)
      },

      setCurrentTime: (time: number) => {
        set({ currentTime: time })
        audioManager.seek(time)
      },

      setDuration: (duration: number) => {
        set({ duration })
      },
    }),
    {
      name: 'player-storage',
      partialize: (state) => ({
        currentSong: state.currentSong,
        playlist: state.playlist,
      }),
    }
  )
)

// Wire up audioManager callbacks to sync state
audioManager.setCallbacks({
  onTimeUpdate: (time) => {
    usePlayerStore.setState({ currentTime: time })
  },
  onEnded: () => {
    usePlayerStore.getState().nextSong()
  },
  onLoadedMetadata: (duration) => {
    usePlayerStore.setState({ duration })
  },
  onError: () => {
    usePlayerStore.setState({ isPlaying: false })
  },
})
