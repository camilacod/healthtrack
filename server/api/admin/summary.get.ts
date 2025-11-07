import { defineEventHandler } from 'h3'
import { getAdminSummaryController } from '../../controllers/summaryController'

export default defineEventHandler(async () => {
  return await getAdminSummaryController()
})
