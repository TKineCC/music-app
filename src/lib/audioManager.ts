import { Song } from '@/types/music'

type Callbacks = {
  onTimeUpdate: (time: number) => void
  onEnded: () => void
  onLoadedMetadata: (duration: number) => void
  onError: () => void
}

class AudioManager {
  private audio: HTMLAudioElement | null = null
  private callbacks: Callbacks | null = null

  private getAudio(): HTMLAudioElement {
    if (!this.audio) {
      this.audio = new Audio()
      this.audio.addEventListener('timeupdate', () => {
        this.callbacks?.onTimeUpdate(this.audio!.currentTime)
      })
      this.audio.addEventListener('ended', () => {
        this.callbacks?.onEnded()
      })
      this.audio.addEventListener('loadedmetadata', () => {
        this.callbacks?.onLoadedMetadata(this.audio!.duration)
      })
      this.audio.addEventListener('error', () => {
        this.callbacks?.onError()
      })
    }
    return this.audio
  }

  setCallbacks(callbacks: Callbacks) {
    this.callbacks = callbacks
  }

  async play(song?: Song) {
    const audio = this.getAudio()
    if (song) {
      if (!song.audioUrl) return
      audio.src = song.audioUrl
      audio.load()
      audio.currentTime = 0
    }
    try {
      await audio.play()
    } catch {
      // Autoplay blocked, user needs to interact first
    }
  }

  pause() {
    this.getAudio().pause()
  }

  seek(time: number) {
    const audio = this.getAudio()
    if (Number.isFinite(time)) {
      audio.currentTime = time
    }
  }

  get currentTime(): number {
    return this.audio?.currentTime ?? 0
  }

  get duration(): number {
    const d = this.audio?.duration
    return d && Number.isFinite(d) ? d : 0
  }

  setVolume(vol: number) {
    this.getAudio().volume = Math.max(0, Math.min(1, vol))
  }
}

export const audioManager = new AudioManager()
