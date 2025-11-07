import { H3Event, getCookie, setCookie, deleteCookie, createError } from 'h3'
import { createHmac, timingSafeEqual } from 'crypto'
import { db } from '../utils/db'
import { admins, users } from '../db/schema'
import { eq } from 'drizzle-orm'

const COOKIE_NAME = 'auth'

function getSecret() {
  const s = process.env.NUXT_SESSION_SECRET
  if (!s) throw new Error('Missing NUXT_SESSION_SECRET')
  return s
}

export interface SessionPayload {
  uid: string
  email: string
  isAdmin: boolean
  ts: number
}

function b64(s: string) {
  return Buffer.from(s, 'utf8').toString('base64url')
}

function b64d(s: string) {
  return Buffer.from(s, 'base64url').toString('utf8')
}

export function signSession(payload: SessionPayload) {
  const secret = getSecret()
  const data = b64(JSON.stringify(payload))
  const sig = createHmac('sha256', secret).update(data).digest('hex')
  return `${data}.${sig}`
}

export function verifySession(token?: string): SessionPayload | null {
  if (!token) return null
  const [data, sig] = token.split('.')
  if (!data || !sig) return null
  const secret = getSecret()
  const expect = createHmac('sha256', secret).update(data).digest('hex')
  try {
    const valid = timingSafeEqual(Buffer.from(sig), Buffer.from(expect))
    if (!valid) return null
    return JSON.parse(b64d(data)) as SessionPayload
  } catch {
    return null
  }
}

export async function useAuth(event: H3Event) {
  const token = getCookie(event, COOKIE_NAME)
  const payload = verifySession(token)
  if (!payload) return null
  const [user] = await db.select().from(users).where(eq(users.id, payload.uid))
  if (!user) return null
  const [adm] = await db.select().from(admins).where(eq(admins.userId, payload.uid))
  return { user, isAdmin: !!adm }
}

export async function requireUser(event: H3Event) {
  const auth = await useAuth(event)
  if (!auth) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  return auth
}

export async function requireAdmin(event: H3Event) {
  const auth = await requireUser(event)
  if (!auth.isAdmin) throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  return auth
}

export function setAuthCookie(event: H3Event, payload: SessionPayload) {
  const token = signSession(payload)
  setCookie(event, COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
}

export function clearAuthCookie(event: H3Event) {
  deleteCookie(event, COOKIE_NAME, { path: '/' })
}
