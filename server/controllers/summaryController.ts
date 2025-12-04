import { countSupplementsByStatus } from '../services/supplementService'
import { listUsers } from '../services/userService'

export async function getAdminSummaryController() {
  const [usersList, suppCounts] = await Promise.all([listUsers(), countSupplementsByStatus()])
  return {
    users: usersList.length,
    supplements: suppCounts,
  }
}
