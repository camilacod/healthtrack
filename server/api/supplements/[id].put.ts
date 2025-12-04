import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { requireAdmin } from '../../utils/auth'
import { updateSupplementDetailsRepo } from '../../repositories/supplementRepository'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const idParam = getRouterParam(event, 'id')
  const id = idParam ? Number(idParam) : NaN
  if (!id || Number.isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const body = (await readBody(event)) as any
  let perServing: any = undefined
  if (typeof body?.perServing !== 'undefined') {
    if (typeof body.perServing === 'string' && body.perServing.trim()) {
      try { perServing = JSON.parse(body.perServing) } catch { perServing = body.perServing }
    } else {
      perServing = body.perServing
    }
  }

  const res = await updateSupplementDetailsRepo(id, {
    name: body?.name,
    brand: body?.brand ?? null,
    form: body?.form ?? null,
    servingSize: typeof body?.servingSize === 'number' || typeof body?.servingSize === 'string' ? body.servingSize : undefined,
    servingUnit: body?.servingUnit ?? null,
    perServing,
  })
  return res
})
