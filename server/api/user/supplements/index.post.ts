import { defineEventHandler, readBody } from 'h3'
import { addUserSupplement } from '../../../services/supplementService'
import { requireUser } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const { user } = await requireUser(event)
  const body = (await readBody(event)) as { supplementId: number; relation?: 'added' | 'uses' | 'favorite' }
  return await addUserSupplement(user.id, body.supplementId, body.relation || 'added')
})

