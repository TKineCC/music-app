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
        className="fixed inset-0 z-[100] bg-deep-bg/85 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-deep-bg rounded-2xl p-6 w-full max-w-sm relative border border-neon-blue/20 shadow-[0_0_30px_rgba(0,128,255,0.15)]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-neon-cyan transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>

          {success ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <CheckCircle className="size-12 text-neon-cyan" />
              <p className="text-lg text-foreground font-bold">登录成功</p>
              <p className="text-sm text-muted-foreground">{nickname}</p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-foreground mb-1 font-heading neon-glow-cyan">登录网易云音乐</h2>
              <p className="text-xs text-muted-foreground mb-4">登录后可播放完整歌曲</p>

              {/* Mode tabs */}
              <div className="flex gap-1 mb-5 bg-neon-blue/5 rounded-xl p-1 border border-neon-blue/10">
                {modes.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => {
                      setMode(m.key)
                      setError('')
                      if (m.key !== 'qr') stopPolling()
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      mode === m.key
                        ? 'bg-neon-blue/20 text-neon-cyan'
                        : 'text-muted-foreground hover:text-neon-cyan/60'
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
                      className="w-full px-4 py-3 bg-white/5 rounded-lg text-foreground text-sm placeholder-muted-foreground outline-none focus:ring-1 focus:ring-neon-blue border border-neon-blue/10 focus:border-neon-blue/40"
                    />
                  </div>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="验证码"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="flex-1 px-4 py-3 bg-white/5 rounded-lg text-foreground text-sm placeholder-muted-foreground outline-none focus:ring-1 focus:ring-neon-blue border border-neon-blue/10 focus:border-neon-blue/40"
                    />
                    <button
                      onClick={handleSendCaptcha}
                      disabled={countdown > 0 || loading}
                      className="shrink-0 px-4 py-3 bg-neon-blue/80 hover:bg-neon-blue disabled:bg-muted disabled:text-muted-foreground rounded-lg text-white text-sm transition-colors cursor-pointer"
                    >
                      {countdown > 0 ? `${countdown}s` : '发送验证码'}
                    </button>
                  </div>
                  {error && <p className="text-xs text-neon-pink mb-3">{error}</p>}
                  <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-neon-blue to-neon-pink hover:from-neon-blue hover:to-neon-pink disabled:from-muted disabled:to-muted rounded-lg text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
                        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-deep-bg/80">
                          {qrStatus === 'scanning' && (
                            <>
                              <Loader2 className="size-8 text-neon-cyan animate-spin mb-2" />
                              <p className="text-xs text-neon-cyan">扫描成功，请在手机确认</p>
                            </>
                          )}
                          {qrStatus === 'confirmed' && (
                            <>
                              <CheckCircle className="size-8 text-neon-cyan mb-2" />
                              <p className="text-xs text-neon-cyan">登录成功</p>
                            </>
                          )}
                          {(qrStatus === 'expired' || qrStatus === 'error') && (
                            <>
                              <QrCode className="size-8 text-muted-foreground mb-2" />
                              <p className="text-xs text-muted-foreground">{qrStatus === 'expired' ? '二维码已过期' : '加载失败'}</p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="size-52 flex items-center justify-center mb-3">
                      <Loader2 className="size-8 text-neon-blue/60 animate-spin" />
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground text-center mb-3">
                    {qrExpired
                      ? '二维码已过期，请刷新'
                      : '打开网易云音乐APP扫描二维码'}
                  </p>

                  <button
                    onClick={refreshQRCode}
                    disabled={qrStatus === 'confirmed'}
                    className="px-6 py-2 bg-neon-blue/10 hover:bg-neon-blue/20 text-neon-cyan/80 hover:text-neon-cyan text-sm rounded-lg transition-colors border border-neon-blue/20 cursor-pointer"
                  >
                    刷新二维码
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
                      className="w-full px-4 py-3 bg-white/5 rounded-lg text-foreground text-sm placeholder-muted-foreground outline-none focus:ring-1 focus:ring-neon-blue border border-neon-blue/10 focus:border-neon-blue/40"
                    />
                  </div>
                  <div className="relative mb-3">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="密码"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 rounded-lg text-foreground text-sm placeholder-muted-foreground outline-none focus:ring-1 focus:ring-neon-blue pr-10 border border-neon-blue/10 focus:border-neon-blue/40"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-neon-cyan cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {error && <p className="text-xs text-neon-pink mb-3">{error}</p>}
                  <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-neon-blue to-neon-pink hover:from-neon-blue hover:to-neon-pink disabled:from-muted disabled:to-muted rounded-lg text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
