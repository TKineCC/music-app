'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, CheckCircle, Eye, EyeOff, QrCode, Smartphone } from 'lucide-react'
import { sendCaptcha, loginWithPhone, loginWithPassword, createQRCode, checkQRCode } from '@/services/musicApi'

interface LoginModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (nickname: string) => void
}

type LoginMode = 'qr' | 'phone' | 'password'

export default function LoginModal({ open, onClose, onSuccess }: LoginModalProps) {
  const [mode, setMode] = useState<LoginMode>('phone')
  const [loading, setLoading] = useState(false)

  // Phone + captcha
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [nickname, setNickname] = useState('')

  // QR code
  const [qrKey, setQrKey] = useState('')
  const [qrImg, setQrImg] = useState('')
  const [qrExpired, setQrExpired] = useState(false)
  const [qrStatus, setQrStatus] = useState<'idle' | 'scanning' | 'confirmed' | 'expired' | 'error'>('idle')
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const qrExpiryRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000)
    return () => clearInterval(timer)
  }, [countdown])

  // QR code polling
  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current)
      pollTimerRef.current = null
    }
    if (qrExpiryRef.current) {
      clearTimeout(qrExpiryRef.current)
      qrExpiryRef.current = null
    }
  }, [])

  const startQRPolling = useCallback((key: string) => {
    stopPolling()
    setQrExpired(false)

    pollTimerRef.current = setInterval(async () => {
      const result = await checkQRCode(key)
      if (result.status === 'pending') {
        setQrStatus('scanning')
      } else if (result.status === 'scanned') {
        setQrStatus('scanning')
      } else if (result.status === 'confirmed') {
        stopPolling()
        setQrStatus('confirmed')
        setNickname(result.nickname || '用户')
        setSuccess(true)
        setTimeout(() => onSuccess(result.nickname || '用户'), 1200)
      } else if (result.status === 'expired') {
        stopPolling()
        setQrStatus('expired')
        setQrExpired(true)
      }
    }, 2000)

    // QR code expires after 300 seconds
    qrExpiryRef.current = setTimeout(() => {
      stopPolling()
      setQrStatus('expired')
      setQrExpired(true)
    }, 300000)
  }, [stopPolling, onSuccess])

  const refreshQRCode = useCallback(async () => {
    setQrStatus('idle')
    setQrExpired(false)
    const result = await createQRCode()
    if (result) {
      setQrKey(result.key)
      setQrImg(result.qrimg)
      startQRPolling(result.key)
    } else {
      setQrStatus('error')
    }
  }, [startQRPolling])

  // Load QR code when switching to QR mode
  useEffect(() => {
    if (open && mode === 'qr' && !qrImg) {
      refreshQRCode()
    }
  }, [open, mode, qrImg, refreshQRCode])

  // Cleanup on close
  useEffect(() => {
    if (!open) {
      stopPolling()
    }
  }, [open, stopPolling])

  const handleSendCaptcha = async () => {
    if (!phone.trim()) return setError('请输入手机号')
    setError('')
    setLoading(true)
    try {
      const ok = await sendCaptcha(phone.trim())
      if (ok) {
        setCountdown(60)
      } else {
        setError('发送验证码失败')
      }
    } catch {
      setError('发送验证码失败')
    }
    setLoading(false)
  }

  const handleLogin = async () => {
    if (!phone.trim()) return setError('请输入手机号')
    if (mode === 'phone' && !code.trim()) return setError('请输入验证码')
    if (mode === 'password' && !password.trim()) return setError('请输入密码')
    setError('')
    setLoading(true)

    const result = mode === 'phone'
      ? await loginWithPhone(phone.trim(), code.trim())
      : await loginWithPassword(phone.trim(), password.trim())

    setLoading(false)

    if (result.success && result.nickname) {
      setNickname(result.nickname)
      setSuccess(true)
      setTimeout(() => onSuccess(result.nickname!), 1200)
    } else {
      setError(result.message || '登录失败')
    }
  }

  const handleClose = useCallback(() => {
    setPhone('')
    setCode('')
    setError('')
    setSuccess(false)
    setCountdown(0)
    setQrImg('')
    setQrKey('')
    setQrStatus('idle')
    setQrExpired(false)
    stopPolling()
    onClose()
  }, [onClose, stopPolling])

  const [password, setPassword] = useState('')

  if (!open) return null

  const modes: { key: LoginMode; label: string; icon: React.ReactNode }[] = [
    { key: 'phone', label: '手机登录', icon: <Smartphone className="size-4" /> },
    { key: 'qr', label: '扫码登录', icon: <QrCode className="size-4" /> },
    { key: 'password', label: '密码登录', icon: <Eye className="size-4" /> },
  ]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
          >
            <X className="size-5" />
          </button>

          {success ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <CheckCircle className="size-12 text-green-400" />
              <p className="text-lg text-white font-bold">登录成功</p>
              <p className="text-sm text-zinc-500">{nickname}</p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-white mb-1">登录网易云音乐</h2>
              <p className="text-xs text-zinc-500 mb-4">登录后可播放完整歌曲</p>

              {/* Mode tabs */}
              <div className="flex gap-1 mb-5 bg-white/5 rounded-xl p-1">
                {modes.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => {
                      setMode(m.key)
                      setError('')
                      if (m.key !== 'qr') stopPolling()
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                      mode === m.key
                        ? 'bg-white/15 text-white'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {m.icon}
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Phone + Captcha */}
              {mode === 'phone' && (
                <div>
                  <div className="mb-3">
                    <input
                      type="tel"
                      placeholder="手机号"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 rounded-lg text-white text-sm placeholder-zinc-500 outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="验证码"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="flex-1 px-4 py-3 bg-white/10 rounded-lg text-white text-sm placeholder-zinc-500 outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <button
                      onClick={handleSendCaptcha}
                      disabled={countdown > 0 || loading}
                      className="shrink-0 px-4 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-700 disabled:text-zinc-500 rounded-lg text-white text-sm transition-colors"
                    >
                      {countdown > 0 ? `${countdown}s` : '发送验证码'}
                    </button>
                  </div>
                  {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
                  <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-zinc-700 disabled:to-zinc-700 rounded-lg text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 className="size-4 animate-spin" />}
                    登录
                  </button>
                </div>
              )}

              {/* QR Code */}
              {mode === 'qr' && (
                <div className="flex flex-col items-center">
                  {qrImg ? (
                    <div className="relative">
                      <img
                        src={qrImg}
                        alt="扫码登录"
                        className="size-52 rounded-xl mx-auto mb-3"
                      />
                      {/* Status overlay */}
                      {(qrStatus === 'scanning' || qrStatus === 'confirmed' || qrStatus === 'expired' || qrStatus === 'error') && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-black/70">
                          {qrStatus === 'scanning' && (
                            <>
                              <Loader2 className="size-8 text-green-400 animate-spin mb-2" />
                              <p className="text-xs text-green-400">扫描成功，请在手机确认</p>
                            </>
                          )}
                          {qrStatus === 'confirmed' && (
                            <>
                              <CheckCircle className="size-8 text-green-400 mb-2" />
                              <p className="text-xs text-green-400">登录成功</p>
                            </>
                          )}
                          {(qrStatus === 'expired' || qrStatus === 'error') && (
                            <>
                              <QrCode className="size-8 text-zinc-400 mb-2" />
                              <p className="text-xs text-zinc-400">{qrStatus === 'expired' ? '二维码已过期' : '加载失败'}</p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="size-52 flex items-center justify-center mb-3">
                      <Loader2 className="size-8 text-zinc-500 animate-spin" />
                    </div>
                  )}

                  <p className="text-xs text-zinc-500 text-center mb-3">
                    {qrExpired
                      ? '二维码已过期，请刷新'
                      : '打开网易云音乐APP扫描二维码'}
                  </p>

                  <button
                    onClick={refreshQRCode}
                    disabled={qrStatus === 'confirmed'}
                    className="px-6 py-2 bg-white/10 hover:bg-white/15 text-zinc-300 hover:text-white text-sm rounded-lg transition-colors"
                  >
                    {qrExpired ? '刷新二维码' : '刷新二维码'}
                  </button>
                </div>
              )}

              {/* Password */}
              {mode === 'password' && (
                <div>
                  <div className="mb-3">
                    <input
                      type="tel"
                      placeholder="手机号"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 rounded-lg text-white text-sm placeholder-zinc-500 outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div className="relative mb-3">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="密码"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 rounded-lg text-white text-sm placeholder-zinc-500 outline-none focus:ring-1 focus:ring-purple-500 pr-10"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
                  <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-zinc-700 disabled:to-zinc-700 rounded-lg text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 className="size-4 animate-spin" />}
                    登录
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}