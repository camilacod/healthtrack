import { H3Event, getCookie, setCookie, deleteCookie, createError } from 'h3'
import { useRuntimeConfig } from '#imports'
import { createHmac, timingSafeEqual } from 'crypto'
import { db } from '../utils/db'
import { admins, users } from '../db/schema'
import { eq } from 'drizzle-orm'

const USER_COOKIE_NAME = 'auth'
const ADMIN_COOKIE_NAME = 'admin_auth'

function getSecret() {
  // Prefer runtimeConfig to avoid build-time env inlining
  const { sessionSecret } = useRuntimeConfig()
  const s = sessionSecret || process.env.NUXT_SESSION_SECRET
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
  // Try user cookie first
  const token = getCookie(event, USER_COOKIE_NAME)
  const payload = verifySession(token)
  if (!payload) return null
  const [user] = await db.select().from(users).where(eq(users.id, payload.uid))
  if (!user) return null
  const [adm] = await db.select().from(admins).where(eq(admins.userId, payload.uid))
  return { user, isAdmin: !!adm }
}

export async function useAdminAuth(event: H3Event) {
  // Use admin-specific cookie
  const token = getCookie(event, ADMIN_COOKIE_NAME)
  const payload = verifySession(token)
  if (!payload) return null
  const [user] = await db.select().from(users).where(eq(users.id, payload.uid))
  if (!user) return null
  const [adm] = await db.select().from(admins).where(eq(admins.userId, payload.uid))
  if (!adm) return null // Must be admin
  return { user, isAdmin: true }
}

export async function requireUser(event: H3Event) {
  const auth = await useAuth(event)
  if (!auth) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  return auth
}

export async function requireAdmin(event: H3Event) {
  const auth = await useAdminAuth(event)
  if (!auth) throw createError({ statusCode: 401, statusMessage: 'Admin authentication required' })
  return auth
}

export function setAuthCookie(event: H3Event, payload: SessionPayload, isAdminLogin = false) {
  const token = signSession(payload)
  const cookieName = isAdminLogin ? ADMIN_COOKIE_NAME : USER_COOKIE_NAME
  setCookie(event, cookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
}

export function clearAuthCookie(event: H3Event, isAdmin = false) {
  const cookieName = isAdmin ? ADMIN_COOKIE_NAME : USER_COOKIE_NAME
  deleteCookie(event, cookieName, { path: '/' })
}

export function clearAllAuthCookies(event: H3Event) {
  deleteCookie(event, USER_COOKIE_NAME, { path: '/' })
  deleteCookie(event, ADMIN_COOKIE_NAME, { path: '/' })
}
