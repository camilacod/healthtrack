import { defineEventHandler, readBody, createError } from 'h3'
import { requireUser } from '../../utils/auth'
import { createPendingSupplementRepo, addUserSupplementRepo } from '../../repositories/supplementRepository'

export default defineEventHandler(async (event) => {
  const { user } = await requireUser(event)
  const body = (await readBody(event)) as {
    name: string
    brand?: string | null
    form?: string | null
    servingSize?: string | number | null
    servingUnit?: string | null
    perServing?: any
  }

  if (!body?.name) throw createError({ statusCode: 400, statusMessage: 'name required' })

  const created = await createPendingSupplementRepo({
    name: String(body.name),
    brand: body.brand ?? null,
    form: body.form ?? null,
    servingSize: body.servingSize ?? null,
    servingUnit: body.servingUnit ?? null,
    perServing: body.perServing ?? null,
    createdBy: user.id,
  })

  await addUserSupplementRepo(user.id, Number(created.id), 'submitted')
  return { ok: true, supplementId: Number(created.id) }
})

