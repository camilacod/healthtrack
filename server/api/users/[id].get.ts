import { defineEventHandler } from 'h3'
import { getUserController } from '../../controllers/userController'

export default defineEventHandler(async (event) => {
  return await getUserController(event)
})
