import type { CreateAdminInput } from '../domain/admin'
import { createError } from 'h3'
import { createAdminRepo, deleteAdminRepo, listAdminsRepo } from '../repositories/adminRepository'
import { getUserByIdRepo } from '../repositories/userRepository'

export async function createAdmin(input: CreateAdminInput) {
  const user = await getUserByIdRepo(input.userId)
  if (!user) throw createError({ statusCode: 404, statusMessage: 'User not found' })
  return await createAdminRepo(input)
}

export async function listAdmins() {
  return await listAdminsRepo()
}

export async function deleteAdmin(userId: string) {
  const ok = await deleteAdminRepo(userId)
  if (!ok) throw createError({ statusCode: 404, statusMessage: 'Admin not found' })
  return { ok }
}
