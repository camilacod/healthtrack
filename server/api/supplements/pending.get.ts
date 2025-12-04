import { defineEventHandler } from 'h3'
import { requireAdmin } from '../../utils/auth'
import { listPendingSupplementsRepo } from '../../repositories/supplementRepository'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return await listPendingSupplementsRepo(200)
})

