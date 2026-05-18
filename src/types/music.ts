export interface Song {
  id: number
  name: string
  artist: string
  album: string
  coverUrl: string
  audioUrl: string
  duration: number // 秒
}

export interface LyricLine {
  time: number // 秒
  text: string
}

export interface Playlist {
  id: number
  name: string
  coverUrl: string
  songs: Song[]
}

// API response types
export interface ApiSong {
  id: number
  name: string
  ar: { id: number; name: string }[]
  al: { id: number; name: string; picUrl: string }
  dt: number // 毫秒
  fee: number
  mv: number
}

export interface ApiPlaylist {
  id: number
  name: string
  coverImgUrl: string
  trackCount: number
  playCount: number
  description: string
  tracks?: ApiSong[]
}