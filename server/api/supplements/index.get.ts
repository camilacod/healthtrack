import { defineEventHandler } from 'h3'
import { listSupplements } from '../../services/supplementService'

export default defineEventHandler(async () => {
  return await listSupplements()
})

