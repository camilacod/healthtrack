import { defineEventHandler } from 'h3'
import { updateUserController } from '../../controllers/userController'
import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return await updateUserController(event)
})
