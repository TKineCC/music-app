import { Song, LyricLine, ApiSong, ApiPlaylist } from '@/types/music'

const API_BASE = '/api/music'

async function fetchApi<T>(endpoint: string, params?: Record<string, string>, signal?: AbortSignal): Promise<T> {
  const url = new URL(`${API_BASE}${endpoint}`, window.location.origin)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }
  const res = await fetch(url.toString(), { signal })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const data = await res.json()
  if (data.code && data.code !== 200) throw new Error(data.msg || 'API error')
  return data
}

// Song detail response uses ar/al, search uses artists/album
function mapDetailSong(s: ApiSong): Song {
  return {
    id: s.id,
    name: s.name,
    artist: s.ar.map((a) => a.name).join(' / '),
    album: s.al.name,
    coverUrl: s.al.picUrl || '',
    audioUrl: '',
    duration: Math.round(s.dt / 1000),
  }
}

interface SearchSong {
  id: number
  name: string
  artists?: { name: string }[]
  ar?: { name: string }[]
  album?: { name: string; picUrl: string }
  al?: { name: string; picUrl: string }
  duration?: number
  dt?: number
}

function mapSearchSong(s: SearchSong): Song {
  const artists = (s.artists || s.ar || []).map((a: { name: string }) => a.name).join(' / ')
  const albumObj = s.album || s.al
  return {
    id: s.id,
    name: s.name,
    artist: artists,
    album: albumObj?.name || '',
    coverUrl: albumObj?.picUrl || '',
    audioUrl: '',
    duration: Math.round((s.duration || s.dt || 0) / 1000),
  }
}

export async function searchSongs(keywords: string, limit = 20): Promise<Song[]> {
  const data = await fetchApi<{ result: { songs: unknown[] } }>('/search', {
    keywords,
    limit: String(limit),
  })
  const songs = (data.result.songs as SearchSong[]).map(mapSearchSong)
  // Batch-fetch song details for results missing cover art.
  // This is inherently serial (depends on search results) but fires only when needed.
  const ids = songs.filter((s) => !s.coverUrl).map((s) => s.id)
  if (ids.length > 0) {
    try {
      const detailData = await fetchApi<{ songs: ApiSong[] }>('/song/detail', {
        ids: ids.join(','),
      })
      const coverMap = new Map(detailData.songs.map((s) => [s.id, s.al.picUrl]))
      songs.forEach((s) => {
        if (!s.coverUrl && coverMap.has(s.id)) {
          s.coverUrl = coverMap.get(s.id) || ''
        }
      })
    } catch {
      // Ignore cover fetch errors
    }
  }
  return songs
}

export async function getSongDetail(id: number): Promise<Song> {
  const data = await fetchApi<{ songs: ApiSong[] }>('/song/detail', {
    ids: String(id),
  })
  return mapDetailSong(data.songs[0])
}

export async function getSongUrl(id: number, signal?: AbortSignal): Promise<string> {
  const data = await fetchApi<{ data: { url: string; code: number }[] }>(
    '/song/url',
    { id: String(id), br: '320000' },
    signal,
  )
  return data.data?.[0]?.url || ''
}

export async function getLyric(id: number): Promise<LyricLine[]> {
  const data = await fetchApi<{ lrc: { lyric: string } }>('/lyric', {
    id: String(id),
  })
  return parseLrc(data.lrc?.lyric || '')
}

function parseLrc(lrc: string): LyricLine[] {
  // TODO(code-review): H07 当前仓库缺少测试基础设施，需补充 parseLrc 与登录流程单测后再扩大覆盖率。
  const lines = lrc.split('\n')
  const result: LyricLine[] = []
  const timeReg = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/

  for (const line of lines) {
    const match = timeReg.exec(line)
    if (!match) continue
    const minutes = parseInt(match[1])
    const seconds = parseInt(match[2])
    const ms = parseInt(match[3].padEnd(3, '0'))
    const time = minutes * 60 + seconds + ms / 1000
    const text = line.replace(/\[\d{2}:\d{2}\.\d{2,3}\]/g, '').trim()
    if (text) {
      result.push({ time, text })
    }
  }

  return result.sort((a, b) => a.time - b.time)
}

export async function getRecommendedPlaylists(): Promise<
  { id: number; name: string; coverUrl: string; playCount: number }[]
> {
  const data = await fetchApi<{ result: { id: number; name: string; picUrl: string; playCount: number }[] }>(
    '/personalized',
    { limit: '10' }
  )
  return data.result.map((p) => ({
    id: p.id,
    name: p.name,
    coverUrl: p.picUrl,
    playCount: p.playCount,
  }))
}

export async function getPlaylistDetail(id: number): Promise<Song[]> {
  const data = await fetchApi<{ playlist: ApiPlaylist }>('/playlist/detail', {
    id: String(id),
  })
  return (data.playlist.tracks || []).map(mapDetailSong)
}

export async function getHotSearch(): Promise<string[]> {
  const data = await fetchApi<{ result: { hots: { first: string }[] } }>('/search/hot')
  return data.result.hots.map((h) => h.first)
}

// Phone login
export async function sendCaptcha(phone: string): Promise<boolean> {
  const data = await fetchApi<{ code: number }>('/captcha/sent', { phone })
  return data.code === 200
}

type LoginResult = { success: boolean; nickname?: string; message?: string }

async function loginRequest(
  params: Record<string, string>,
): Promise<LoginResult> {
  try {
    const url = new URL(`${API_BASE}/login/cellphone`, window.location.origin)
    // C01 Critical 安全漏洞: 敏感字段（password/captcha）仅通过请求体提交，避免出现在 URL、历史记录或代理日志中
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ ...params, countrycode: '86' }).toString(),
    })
    const data = await res.json()
    if (data.code === 200 && data.profile) {
      // H01 High 安全漏洞: 避免将会话凭据暴露给同源脚本，改由浏览器管理受保护 Cookie
      return { success: true, nickname: data.profile.nickname }
    }
    return { success: false, message: data.message || data.msg || '登录失败' }
  } catch {
    return { success: false, message: '网络错误' }
  }
}

export const loginWithPhone = (phone: string, captcha: string) =>
  loginRequest({ phone, captcha })

export const loginWithPassword = (phone: string, password: string) =>
  loginRequest({ phone, password, remember: 'true' })

export async function createQRCode(): Promise<{ key: string; qrimg: string } | null> {
  try {
    // Step 1: get unikey
    const keyData = await fetchApi<{ data: { unikey: string } }>('/login/qr/key')
    const key = keyData.data.unikey
    if (!key) return null

    // Step 2: create QR code image
    const qrData = await fetchApi<{ data: { qrimg: string } }>('/login/qr/create', { key })
    return { key, qrimg: qrData.data.qrimg }
  } catch {
    return null
  }
}

export async function checkQRCode(key: string): Promise<{ status: 'pending' | 'scanned' | 'confirmed' | 'expired'; nickname?: string; cookie?: string }> {
  try {
    const data = await fetchApi<{ code: number; cookie?: string; profile?: { nickname: string } }>('/login/qr/check', { key })
    if (data.code === 801) {
      return { status: 'pending' } // not scanned yet
    }
    if (data.code === 802) {
      return { status: 'scanned' } // scanned, waiting for confirm
    }
    if (data.code === 803) {
      // Login success
      return {
        status: 'confirmed',
        nickname: data.profile?.nickname || '用户',
        cookie: data.cookie,
      }
    }
    return { status: 'expired' }
  } catch {
    return { status: 'pending' }
  }
}
