import { defineEventHandler } from 'h3'
import { signupController } from '../../controllers/authController'

export default defineEventHandler(async (event) => {
  return await signupController(event)
})

