import { defineEventHandler, getRouterParam } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { publishSupplementRepo, updateSubmittedRelationsToUsesRepo } from '../../../repositories/supplementRepository'

export default defineEventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const idParam = getRouterParam(event, 'id')
  const id = idParam ? Number(idParam) : NaN
  if (!id || Number.isNaN(id)) return { ok: false }
  const ok = await publishSupplementRepo(id, user.id)
  if (ok) await updateSubmittedRelationsToUsesRepo(id)
  return { ok }
})

