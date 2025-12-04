import { defineEventHandler, getQuery, createError } from 'h3'
import { requireUser } from '../../../utils/auth'
import { getDosesForDate } from '../../../services/dashboardService'

export default defineEventHandler(async (event) => {
  const { user } = await requireUser(event)
  const query = getQuery(event)
  const date = query.date as string
  
  if (!date) {
    throw createError({ statusCode: 400, statusMessage: 'Date parameter is required' })
  }
  
  const doses = await getDosesForDate(user.id, date)
  return doses
})

