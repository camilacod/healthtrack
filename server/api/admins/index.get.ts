import { defineEventHandler } from 'h3'
import { listAdminsController } from '../../controllers/adminController'
import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return await listAdminsController()
})
