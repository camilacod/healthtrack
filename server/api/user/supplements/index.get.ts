import { defineEventHandler } from 'h3'
import { requireUser } from '../../../utils/auth'
import { listUserSupplementsUsesRepo } from '../../../repositories/supplementRepository'

export default defineEventHandler(async (event) => {
  const { user } = await requireUser(event)
  const rows = await listUserSupplementsUsesRepo(user.id)
  return rows
})

