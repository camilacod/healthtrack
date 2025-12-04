import { geminiRecognizeSupplement } from '../utils/gemini'
import {
  addUserSupplementRepo,
  createPendingSupplementRepo,
  findSupplementsByLooseNameBrand,
  findPublishedByNameAndBrandExact,
  findGenericPublishedByName,
} from '../repositories/supplementRepository'

function tokenize(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

function jaccard(a: string, b: string) {
  const A = new Set(tokenize(a))
  const B = new Set(tokenize(b))
  const inter = new Set([...A].filter((x) => B.has(x)))
  const uni = new Set([...A, ...B])
  return uni.size ? inter.size / uni.size : 0
}

export async function recognizeSupplementFromImage(userId: string, base64Image: string) {
  const items = await geminiRecognizeSupplement(base64Image)
  // Choose first plausible item
  const candidate = items.find((i) => i?.name) || null
  if (!candidate) {
    return { status: 'no_match', items: [] as typeof items }
  }

  const name = String(candidate.name).trim()
  const brand = candidate.brand ? String(candidate.brand).trim() : null
  const cSize =
    typeof candidate.serving_size === 'number' || typeof candidate.serving_size === 'string'
      ? candidate.serving_size
      : null
  const cUnit = candidate.serving_unit ?? null
  const perServing = candidate.per_serving ?? null

  // Helper functions for serving comparison
  const normalizeUnit = (u?: string | null) => {
    if (!u) return ''
    const s = String(u).trim().toLowerCase()
    return s.endsWith('s') ? s.slice(0, -1) : s
  }
  const parseNum = (n?: string | number | null) => {
    if (n === null || typeof n === 'undefined') return NaN
    if (typeof n === 'number') return n
    const m = String(n).match(/[-+]?[0-9]*\.?[0-9]+/)
    return m ? parseFloat(m[0]) : NaN
  }
  const eqServing = (dbSize?: any, dbUnit?: any, candSize?: any, candUnit?: any) => {
    const a = parseNum(dbSize)
    const b = parseNum(candSize)
    const ua = normalizeUnit(dbUnit)
    const ub = normalizeUnit(candUnit)
    if (!ua || !ub || Number.isNaN(a) || Number.isNaN(b)) return false
    if (ua !== ub) return false
    return Math.abs(a - b) < 1e-6
  }

  // 1) Exact name + brand match (published)
  if (brand) {
    const exact = await findPublishedByNameAndBrandExact(name, brand)
    if (exact?.[0]) {
      return { status: 'match' as const, match: exact[0], score: 1 }
    }
  }

  // 2) If name matches but brand doesn't, and we have a Generic published for that name → offer generic suggestion
  const generic = await findGenericPublishedByName(name)
  if (generic?.[0]) {
    return {
      status: 'generic_suggestion' as const,
      generic: generic[0],
      product: { name, brand: brand ?? null, form: candidate.form ?? null, servingSize: cSize ?? null, servingUnit: cUnit ?? null, perServing },
    }
  }

  // Create pending supplement with minimal fields
  const created = await createPendingSupplementRepo({
    name,
    brand: brand ?? null,
    form: candidate.form ? String(candidate.form) : null,
    createdBy: userId,
    servingSize: cSize ?? null,
    servingUnit: cUnit ?? null,
    perServing,
  })

  // Link to user as submitted (pending)
  await addUserSupplementRepo(userId, Number(created.id), 'submitted')

  return {
    status: 'pending' as const,
    supplementId: Number(created.id),
    product: { name, brand: brand ?? null, form: candidate.form ?? null },
  }
}
