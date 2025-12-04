import type { CreateUserInput, UpdateUserInput, UpdateProfileInput } from '../domain/user'
import { createError } from 'h3'
import {
  createUserRepo,
  deleteUserRepo,
  getUserByEmailRepo,
  getUserByIdRepo,
  listUsersRepo,
  updateUserRepo,
  verifyPasswordRepo,
  updatePasswordRepo,
  updateProfileRepo,
} from '../repositories/userRepository'

export async function createUser(input: CreateUserInput) {
  if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid email' })
  }
  const existing = await getUserByEmailRepo(input.email)
  if (existing) throw createError({ statusCode: 409, statusMessage: 'Email already exists' })
  return await createUserRepo(input)
}

export async function getUserById(id: string) {
  const user = await getUserByIdRepo(id)
  if (!user) throw createError({ statusCode: 404, statusMessage: 'User not found' })
  return user
}

export async function listUsers() {
  return await listUsersRepo()
}

export async function updateUser(id: string, input: UpdateUserInput) {
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid email' })
  }
  const updated = await updateUserRepo(id, input)
  if (!updated) throw createError({ statusCode: 404, statusMessage: 'User not found' })
  return updated
}

export async function deleteUser(id: string) {
  const ok = await deleteUserRepo(id)
  if (!ok) throw createError({ statusCode: 404, statusMessage: 'User not found' })
  return { ok }
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  // Validate email if provided
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid email' })
  }

  // Check if email is already taken by another user
  if (input.email) {
    const existing = await getUserByEmailRepo(input.email)
    if (existing && existing.id !== userId) {
      throw createError({ statusCode: 409, statusMessage: 'Email already in use' })
    }
  }

  // Handle password change
  if (input.newPassword) {
    if (!input.currentPassword) {
      throw createError({ statusCode: 400, statusMessage: 'Current password is required' })
    }
    
    if (input.newPassword.length < 6) {
      throw createError({ statusCode: 400, statusMessage: 'Password must be at least 6 characters' })
    }

    // Verify current password
    const validPassword = await verifyPasswordRepo(userId, input.currentPassword)
    if (!validPassword) {
      throw createError({ statusCode: 401, statusMessage: 'Current password is incorrect' })
    }

    // Update password
    await updatePasswordRepo(userId, input.newPassword)
  }

  // Update profile fields
  const updated = await updateProfileRepo(userId, {
    email: input.email,
    username: input.username,
  })

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  return updated
}
