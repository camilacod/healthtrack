import { defineEventHandler } from 'h3'
import { useAdminAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const auth = await useAdminAuth(event)
  return auth || null
})

