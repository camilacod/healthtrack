import { readBody, getRouterParam } from 'h3'
import type { CreateAdminInput } from '../domain/admin'
import { createAdmin, deleteAdmin, listAdmins } from '../services/adminService'

export async function createAdminController(event: any) {
  const body = (await readBody(event)) as CreateAdminInput
  return await createAdmin(body)
}

export async function listAdminsController() {
  return await listAdmins()
}

export async function deleteAdminController(event: any) {
  const userId = getRouterParam(event, 'userId')!
  return await deleteAdmin(userId)
}
