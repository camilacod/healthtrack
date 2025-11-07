import { defineEventHandler } from 'h3'
import { logoutController } from '../../controllers/authController'

export default defineEventHandler(async (event) => {
  return await logoutController(event)
})

