import { NextRequest, NextResponse } from "next/server"
import { getAuthCookie, getNestApiUrl } from "@/lib/auth-session"

type RouteContext = { params: Promise<{ path: string[] }> }

async function proxyRequest(request: NextRequest, context: RouteContext) {
  const { path } = await context.params
  const targetPath = path.join("/")
  const targetUrl = `${getNestApiUrl()}/${targetPath}${request.nextUrl.search}`
  const token = await getAuthCookie()

  const headers = new Headers()
  const contentType = request.headers.get("content-type")
  if (contentType) {
    headers.set("content-type", contentType)
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const method = request.method
  const hasBody = method !== "GET" && method !== "HEAD"

  const init: RequestInit = {
    method,
    headers,
  }
  if (hasBody) {
    init.body = await request.arrayBuffer()
  }

  const upstream = await fetch(targetUrl, init)

  if (upstream.status === 204) {
    return new NextResponse(null, { status: 204 })
  }

  const responseHeaders = new Headers()
  const upstreamType = upstream.headers.get("content-type")
  if (upstreamType) {
    responseHeaders.set("content-type", upstreamType)
  }
  const disposition = upstream.headers.get("content-disposition")
  if (disposition) {
    responseHeaders.set("content-disposition", disposition)
  }

  // Stream quando possível — evita buffer completo na Vercel.
  if (upstream.body) {
    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    })
  }

  const buffer = await upstream.arrayBuffer()
  return new NextResponse(buffer, {
    status: upstream.status,
    headers: responseHeaders,
  })
}

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context)
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context)
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context)
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context)
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context)
}
