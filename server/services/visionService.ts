import { geminiRecognizeSupplement } from '../utils/gemini'
import {
  addUserSupplementRepo,
  createPendingSupplementRepo,
  findSupplementsByLooseNameBrand,
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

  const existing = await findSupplementsByLooseNameBrand(name, brand, 25)

  let best: any = null
  let bestScore = 0
  for (const row of existing) {
    const sName = jaccard(name, row.name || '')
    const sBrand = brand && row.brand ? jaccard(brand, row.brand) : 0
    const score = brand ? sName * 0.7 + sBrand * 0.3 : sName
    if (score > bestScore) {
      bestScore = score
      best = row
    }
  }

  if (best && bestScore >= 0.7 && best.status === 'published') {
    // Return proposal to add
    return { status: 'match' as const, match: best, score: bestScore }
  }

  // Create pending supplement with minimal fields
  const created = await createPendingSupplementRepo({
    name,
    brand: brand ?? null,
    form: candidate.form ? String(candidate.form) : null,
    createdBy: userId,
  })

  // Link to user as submitted (pending)
  await addUserSupplementRepo(userId, Number(created.id), 'submitted')
  // If enum supports 'submitted', try set it via SQL endpoint would have done; but repo API constrained to union
  // We'll leave as 'added' here at repo layer compatibility and adjust relation in API if needed.

  return {
    status: 'pending' as const,
    supplementId: Number(created.id),
    product: { name, brand: brand ?? null, form: candidate.form ?? null },
  }
}
