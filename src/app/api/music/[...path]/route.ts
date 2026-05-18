import { NextRequest, NextResponse } from 'next/server'

const API_BASE = 'http://localhost:3000'

async function proxyRequest(
  request: NextRequest,
  path: string[],
  methodOverride?: string
): Promise<NextResponse> {
  const endpoint = '/' + path.join('/')
  const searchParams = request.nextUrl.searchParams.toString()
  const url = `${API_BASE}${endpoint}${searchParams ? `?${searchParams}` : ''}`

  const method = methodOverride || request.method
  const headers: Record<string, string> = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Referer': 'https://music.163.com',
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
    return NextResponse.json(
      { code: 500, msg: `Proxy error: ${error}` },
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
