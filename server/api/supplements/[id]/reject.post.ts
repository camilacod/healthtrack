import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { rejectSupplementRepo } from '../../../repositories/supplementRepository'

export default defineEventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const idParam = getRouterParam(event, 'id')
  const id = idParam ? Number(idParam) : NaN
  if (!id || Number.isNaN(id)) return { ok: false }
  const body = (await readBody(event)) as { notes?: string | null }
  const ok = await rejectSupplementRepo(id, user.id, body?.notes ?? null)
  return { ok }
})

