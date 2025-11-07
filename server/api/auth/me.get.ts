import { defineEventHandler } from 'h3'
import { meController } from '../../controllers/authController'

export default defineEventHandler(async (event) => {
  return await meController(event)
})

