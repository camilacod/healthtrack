import { defineEventHandler } from 'h3'
import { loginController } from '../../controllers/authController'

export default defineEventHandler(async (event) => {
  return await loginController(event)
})

