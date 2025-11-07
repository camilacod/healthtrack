import { readBody, getRouterParam } from 'h3'
import type { CreateUserInput, UpdateUserInput } from '../domain/user'
import { createUser, deleteUser, getUserById, listUsers, updateUser } from '../services/userService'

export async function createUserController(event: any) {
  const body = (await readBody(event)) as CreateUserInput
  const user = await createUser(body)
  return user
}

export async function listUsersController() {
  return await listUsers()
}

export async function getUserController(event: any) {
  const id = getRouterParam(event, 'id')!
  return await getUserById(id)
}

export async function updateUserController(event: any) {
  const id = getRouterParam(event, 'id')!
  const body = (await readBody(event)) as UpdateUserInput
  return await updateUser(id, body)
}

export async function deleteUserController(event: any) {
  const id = getRouterParam(event, 'id')!
  return await deleteUser(id)
}
