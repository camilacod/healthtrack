import { readBody } from 'h3'
import type { CreateUserInput, LoginInput } from '../domain/user'
import { login, signup } from '../services/authService'
import { setAuthCookie, clearAuthCookie, useAuth } from '../utils/auth'

export async function signupController(event: any) {
  const body = (await readBody(event)) as CreateUserInput
  const user = await signup(body)
  const session = { uid: user.id, email: user.email, isAdmin: false, ts: Date.now() }
  setAuthCookie(event, session)
  return { user, isAdmin: false }
}

export async function loginController(event: any) {
  const body = (await readBody(event)) as LoginInput
  const { user, isAdmin } = await login(body)
  const session = { uid: user.id, email: user.email, isAdmin, ts: Date.now() }
  setAuthCookie(event, session)
  return { user, isAdmin }
}

export async function logoutController(event: any) {
  clearAuthCookie(event)
  return { ok: true }
}

export async function meController(event: any) {
  const auth = await useAuth(event)
  return auth || null
}

