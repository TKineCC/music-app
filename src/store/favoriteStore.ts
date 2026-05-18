import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Song } from '@/types/music'

interface FavoriteState {
  favorites: Song[]
  recentPlayed: Song[]

  toggleFavorite: (song: Song) => void
  isFavorite: (songId: number) => boolean
  addToRecent: (song: Song) => void
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      favorites: [],
      recentPlayed: [],

      toggleFavorite: (song: Song) => {
        set((state) => {
          const exists = state.favorites.some((s) => s.id === song.id)
          return {
            favorites: exists
              ? state.favorites.filter((s) => s.id !== song.id)
              : [...state.favorites, song],
          }
        })
      },

      isFavorite: (songId: number) => {
        return get().favorites.some((s) => s.id === songId)
      },

      addToRecent: (song: Song) => {
        set((state) => {
          const filtered = state.recentPlayed.filter((s) => s.id !== song.id)
          return {
            recentPlayed: [song, ...filtered].slice(0, 20),
          }
        })
      },
    }),
    {
      name: 'favorite-storage',
    }
  )
)
