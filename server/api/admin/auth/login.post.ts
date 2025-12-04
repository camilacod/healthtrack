import { defineEventHandler, readBody, createError } from 'h3'
import { login } from '../../../services/authService'
import { setAuthCookie } from '../../../utils/auth'
import type { LoginInput } from '../../../domain/user'

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as LoginInput
  const { user, isAdmin } = await login(body)
  
  // Verify this user is actually an admin
  if (!isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Not authorized as admin' })
  }
  
  const session = { uid: user.id, email: user.email, isAdmin: true, ts: Date.now() }
  setAuthCookie(event, session, true) // true = admin login
  return { user, isAdmin }
})

