import { defineEventHandler, getQuery } from 'h3'
import { requireUser } from '../../../utils/auth'
import { getDashboardData } from '../../../services/dashboardService'

export default defineEventHandler(async (event) => {
  const { user } = await requireUser(event)
  const query = getQuery(event)
  const date = query.date as string | undefined
  
  const data = await getDashboardData(user.id, date)
  return data
})

