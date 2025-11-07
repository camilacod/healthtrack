import { defineEventHandler } from 'h3'
import { deleteUserController } from '../../controllers/userController'
import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return await deleteUserController(event)
})
