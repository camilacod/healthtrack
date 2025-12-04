import { defineEventHandler, readBody, createError } from 'h3'
import { requireUser } from '../../utils/auth'
import { updateProfile } from '../../services/userService'
import type { UpdateProfileInput } from '../../domain/user'

export default defineEventHandler(async (event) => {
  const { user } = await requireUser(event)
  const body = await readBody<UpdateProfileInput>(event)

  try {
    const updated = await updateProfile(user.id, body)
    return {
      id: updated.id,
      email: updated.email,
      username: updated.username,
    }
  } catch (e: any) {
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || 'Failed to update profile',
    })
  }
})

