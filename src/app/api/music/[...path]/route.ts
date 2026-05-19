import { NextRequest, NextResponse } from 'next/server'

// H06 High 架构设计: API 基础地址改为环境变量可配置，保留本地默认值
const API_BASE = process.env.NCM_API_BASE?.trim() || 'http://localhost:3000'

// C03 Critical 安全漏洞: 仅代理前端当前实际使用的音乐接口，拒绝任意后端路径探测
const ALLOWED_ENDPOINTS = new Set([
  '/search',
  '/song/detail',
  '/song/url',
  '/lyric',
  '/personalized',
  '/playlist/detail',
  '/search/hot',
  '/captcha/sent',
  '/login/cellphone',
  '/login/qr/key',
  '/login/qr/create',
  '/login/qr/check',
])

async function proxyRequest(
  request: NextRequest,
  path: string[],
  methodOverride?: string
): Promise<NextResponse> {
  const endpoint = '/' + path.join('/')
  if (!ALLOWED_ENDPOINTS.has(endpoint)) {
    return NextResponse.json(
      { code: 403, msg: 'Forbidden' },
      { status: 403 }
    )
  }

  const searchParams = request.nextUrl.searchParams.toString()
  const url = `${API_BASE}${endpoint}${searchParams ? `?${searchParams}` : ''}`

  const method = methodOverride || request.method
  const headers: Record<string, string> = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Referer': 'https://music.163.com',
  }
  const cookie = request.headers.get('cookie')
  if (cookie) {
    // H01 High 安全漏洞: 使用浏览器受保护 Cookie 维持登录态，避免前端脚本持久化会话凭据
    headers.Cookie = cookie
  }

  let body: string | undefined
  if (method === 'POST' || method === 'PUT') {
    body = await request.text()
    headers['Content-Type'] = 'application/x-www-form-urlencoded'
  }

  try {
    const res = await fetch(url, {
      method,
      headers,
      body,
      redirect: 'follow',
    })
    const data = await res.json()
    const response = NextResponse.json(data)

    // Pass Set-Cookie headers from the API
    const setCookie = res.headers.get('set-cookie')
    if (setCookie) {
      response.headers.set('set-cookie', setCookie)
    }

    return response
  } catch (error) {
    // H02 High 安全漏洞: 客户端仅返回通用错误，详细信息保留在服务端日志
    console.error('Proxy error:', error)
    return NextResponse.json(
      { code: 500, msg: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const { path } = await params
  return proxyRequest(request, path)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const { path } = await params
  return proxyRequest(request, path)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const { path } = await params
  return proxyRequest(request, path)
}
