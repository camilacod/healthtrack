import { db } from '../utils/db'
import { supplements, userSupplements } from '../db/schema'
import { sql } from 'drizzle-orm'

export async function countSupplementsRepo(): Promise<number> {
  const rows = await db.select({ count: sql`count(*)::int` }).from(supplements)
  return Number((rows as any)?.[0]?.count ?? 0)
}

export async function countSupplementsByStatusRepo(): Promise<{ total: number; pending: number; published: number; rejected: number }> {
  const rows = await db.execute(
    sql`SELECT 
          count(*)::int as total,
          count(*) FILTER (WHERE status = 'pending')::int as pending,
          count(*) FILTER (WHERE status = 'published')::int as published,
          count(*) FILTER (WHERE status = 'rejected')::int as rejected
        FROM ${supplements}`
  )
  const row = (rows as any)?.rows?.[0] ?? {}
  return {
    total: Number(row.total ?? 0),
    pending: Number(row.pending ?? 0),
    published: Number(row.published ?? 0),
    rejected: Number(row.rejected ?? 0),
  }
}

export async function listSupplementsRepo() {
  const rows = await db.execute(
    sql`SELECT id, name, brand, form, serving_size as "servingSize", serving_unit as "servingUnit", per_serving as "perServing", category, status
        FROM supplements
        WHERE status = 'published'
        ORDER BY created_at DESC
        LIMIT 100`
  )
  return (rows as any)?.rows ?? []
}

export async function addUserSupplementRepo(
  userId: string,
  supplementId: number,
  relation: 'added' | 'uses' | 'favorite' | 'submitted'
) {
  // raw SQL to upsert unique(user_id, supplement_id, relation)
  const q = sql`insert into user_supplements (user_id, supplement_id, relation)
               values (${userId}, ${supplementId}, ${relation})
               on conflict (user_id, supplement_id, relation) do nothing`
  await db.execute(q)
  return { ok: true }
}

export async function findSupplementsByLooseNameBrand(name: string, brand?: string | null, limit = 20) {
  const nameLike = `%${name}%`
  const brandLike = brand ? `%${brand}%` : null
  const rows = await db.execute(
    sql`select id, name, brand, category, status, serving_size, serving_unit
        from ${supplements}
        where lower(name) like lower(${nameLike})
          ${brandLike ? sql` or (brand is not null and lower(brand) like lower(${brandLike}))` : sql``}
        limit ${limit}`
  )
  return (rows as any)?.rows ?? []
}

export async function findPublishedByNameAndBrandExact(name: string, brand: string) {
  const rows = await db.execute(
    sql`select id, name, brand, category, status, serving_size, serving_unit
        from ${supplements}
        where lower(name) = lower(${name})
          and brand is not null and lower(brand) = lower(${brand})
          and status = 'published'`
  )
  return (rows as any)?.rows ?? []
}

export async function findGenericPublishedByName(name: string) {
  const rows = await db.execute(
    sql`select id, name, brand, category, status, serving_size, serving_unit
        from ${supplements}
        where lower(name) = lower(${name})
          and (brand is null or lower(brand) = 'generic')
          and status = 'published'
        limit 5`
  )
  return (rows as any)?.rows ?? []
}

export async function createPendingSupplementRepo(input: {
  name: string
  brand?: string | null
  form?: string | null
  category?: string | null
  createdBy: string
  servingSize?: string | number | null
  servingUnit?: string | null
  perServing?: any
}) {
  const q = db
    .insert(supplements)
    .values({
      name: input.name,
      brand: input.brand ?? null,
      form: input.form ?? null,
      category: (input.category ?? null) as any,
      servingSize: typeof input.servingSize === 'number' ? String(input.servingSize) : (input.servingSize ?? null) as any,
      servingUnit: input.servingUnit ?? null,
      perServing: typeof input.perServing === 'string' ? (input.perServing as any) : (input.perServing ?? null),
      status: 'pending' as any,
      createdBy: input.createdBy,
    })
    .returning({ id: supplements.id })
  const [row] = await q
  return row
}

export async function listPendingSupplementsRepo(limit = 100) {
  const rows = await db
    .select({
      id: supplements.id,
      name: supplements.name,
      brand: supplements.brand,
      form: supplements.form,
      servingSize: supplements.servingSize,
      servingUnit: supplements.servingUnit,
      perServing: supplements.perServing,
      category: supplements.category,
      status: supplements.status,
      createdAt: supplements.createdAt,
    })
    .from(supplements)
    // @ts-ignore drizzle enum typed values
    .where(sql`${supplements.status} = 'pending'`)
    .orderBy(sql`${supplements.createdAt} desc`)
    .limit(limit)
  return rows
}

export async function publishSupplementRepo(id: number, adminId: string) {
  const res = await db.execute(
    sql`update ${supplements}
        set status = 'published', reviewed_by = ${adminId}::uuid, reviewed_at = now()
        where id = ${id}::bigint`
  )
  return (res as any)?.rowCount > 0
}

export async function rejectSupplementRepo(id: number, adminId: string, notes?: string | null) {
  const res = await db.execute(
    sql`update ${supplements}
        set status = 'rejected', reviewed_by = ${adminId}::uuid, reviewed_at = now(), review_notes = ${notes ?? null}
        where id = ${id}::bigint`
  )
  return (res as any)?.rowCount > 0
}

export async function updateSubmittedRelationsToUsesRepo(supplementId: number) {
  const res = await db.execute(
    sql`update user_supplements set relation = 'uses'
        where supplement_id = ${supplementId}::bigint and relation = 'submitted'`
  )
  return (res as any)?.rowCount ?? 0
}

export async function listUserSupplementsUsesRepo(userId: string) {
  const rows = await db.execute(
    sql`select s.id, s.name, s.brand, s.form, s.serving_size, s.serving_unit, s.per_serving, s.category, s.status
        from ${userSupplements} us
        join ${supplements} s on s.id = us.supplement_id
        where us.user_id = ${userId}::uuid and us.relation = 'uses'
        order by s.created_at desc`
  )
  return (rows as any)?.rows ?? []
}

export async function updateSupplementDetailsRepo(
  id: number,
  input: {
    name?: string
    brand?: string | null
    form?: string | null
    category?: string | null
    servingSize?: string | number | null
    servingUnit?: string | null
    perServing?: any
  }
) {
  const payload: Record<string, any> = {}
  if (typeof input.name !== 'undefined') payload.name = input.name
  if (typeof input.brand !== 'undefined') payload.brand = input.brand
  if (typeof input.form !== 'undefined') payload.form = input.form
  if (typeof input.category !== 'undefined') payload.category = input.category
  if (typeof input.servingSize !== 'undefined') payload.servingSize = input.servingSize === null ? null : String(input.servingSize)
  if (typeof input.servingUnit !== 'undefined') payload.servingUnit = input.servingUnit
  if (typeof input.perServing !== 'undefined') payload.perServing = input.perServing

  if (Object.keys(payload).length === 0) return { ok: true }

  const q = db
    .update(supplements)
    .set(payload as any)
    .where(sql`${supplements.id} = ${id}`)
  const res = await q
  return { ok: (res as any)?.rowCount > 0 }
}
