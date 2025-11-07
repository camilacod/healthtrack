import { addUserSupplementRepo, countSupplementsRepo, listSupplementsRepo } from '../repositories/supplementRepository'

export async function countSupplements() {
  const count = await countSupplementsRepo()
  return { count }
}

export async function listSupplements() {
  return await listSupplementsRepo()
}

export async function addUserSupplement(userId: string, supplementId: number, relation: 'added' | 'uses' | 'favorite') {
  return await addUserSupplementRepo(userId, supplementId, relation)
}
