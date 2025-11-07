import { db } from '../utils/db'
import { supplements } from '../db/schema'
import { sql } from 'drizzle-orm'

export async function countSupplementsRepo(): Promise<number> {
  const rows = await db.select({ count: sql`count(*)::int` }).from(supplements)
  // @ts-expect-error drizzle infers count as unknown
  return Number(rows?.[0]?.count ?? 0)
}

export async function listSupplementsRepo() {
  return await db
    .select({ id: supplements.id, name: supplements.name, brand: supplements.brand, status: supplements.status })
    .from(supplements)
    .limit(100)
}

export async function addUserSupplementRepo(userId: string, supplementId: number, relation: 'added' | 'uses' | 'favorite') {
  // raw SQL to upsert unique(user_id, supplement_id, relation)
  const q = sql`insert into user_supplements (user_id, supplement_id, relation)
               values (${userId}, ${supplementId}, ${relation})
               on conflict (user_id, supplement_id, relation) do nothing`
  await db.execute(q)
  return { ok: true }
}
