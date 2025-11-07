import type { CreateUserInput, UpdateUserInput } from '../domain/user'
import { createError } from 'h3'
import {
  createUserRepo,
  deleteUserRepo,
  getUserByEmailRepo,
  getUserByIdRepo,
  listUsersRepo,
  updateUserRepo,
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
