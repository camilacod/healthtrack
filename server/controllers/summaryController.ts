import { countSupplements } from '../services/supplementService'
import { listUsers } from '../services/userService'

export async function getAdminSummaryController() {
  const [usersList, supp] = await Promise.all([listUsers(), countSupplements()])
  return {
    users: usersList.length,
    supplements: supp.count,
  }
}
