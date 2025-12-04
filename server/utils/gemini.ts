import { useRuntimeConfig } from '#imports'

export interface GeminiSupplementResult {
  name: string
  brand: string | null
  form: string | null
  serving_size: number | string | null
  serving_unit: string | null
  per_serving: Record<string, any> | string | null
}

export interface VisionResponse {
  items: GeminiSupplementResult[]
}

function normalizeJson<T = any>(raw: string): T | null {
  try {
    // Try parse as-is (array or object)
    return JSON.parse(raw)
  } catch {}
  // Extract likely JSON segment
  const start = raw.indexOf('[') !== -1 ? raw.indexOf('[') : raw.indexOf('{')
  const end = raw.lastIndexOf(']') !== -1 ? raw.lastIndexOf(']') : raw.lastIndexOf('}')
  if (start >= 0 && end > start) {
    const slice = raw.slice(start, end + 1)
    try {
      return JSON.parse(slice)
    } catch {}
  }
  return null
}

export async function geminiRecognizeSupplement(imageBase64: string): Promise<GeminiSupplementResult[]> {
  const { geminiApiKey } = useRuntimeConfig()
  if (!geminiApiKey) throw new Error('Missing GEMINI_API_KEY')

  const prompt = `You are an expert at reading supplement labels from product photos.

IMPORTANT: Labels may be in English or Spanish. Detect text in either language and normalize the output as follows.

Return ONLY a JSON array of objects. For each detected supplement, include exactly these keys:
[
  {
    "name": string,            // COMPOUND ONLY (e.g., "CLA", "Vitamin C", "Magnesium", "CoQ10"). Do NOT include strength, dosage, counts, flavors, or marketing text. If the label says "CLA 800 mg Nutritional Oil", return "CLA".
    "brand": string|null,      // Brand on the label if clearly visible; otherwise null.
    "form": string|null,       // One of: capsule | tablet | powder | liquid | gummy | softgel (map Spanish synonyms: cápsula→capsule, tableta→tablet, polvo→powder, líquido→liquid, gomita→gummy, perla/blanda→softgel), if inferrable.
    "serving_size": number|string|null, // Numeric value of a single serving if visible or strongly inferable (e.g., 1, 2, 800). If unclear, use null.
    "serving_unit": string|null,        // Unit for serving_size in singular English (capsule, tablet, scoop, ml, g). Map Spanish units to English.
    "per_serving": object|string|null   // Key-value nutrients per serving inferred from the label. Use English snake_case keys like {"vitamin_c_mg": 100, "zinc_mg": 5}. If not visible, null.
  }
]

Language guidance:
- Recognize English and Spanish labels (e.g., "Vitamina C", "Ácido ascórbico", "Magnesio", "Aceite de Pescado").
- For "name", prefer the standard compound name. If a widely recognized English compound name exists (e.g., "Vitamina C" → "Vitamin C", "Ácido ascórbico" → "Vitamin C", "Magnesio" → "Magnesium"), output the English compound. If uncertain, keep the printed compound text without dosage/marketing words.
- For "form" and "serving_unit", always output the normalized English term (capsule, tablet, scoop, ml, g).
- For "per_serving", use English snake_case keys and numeric values where possible.

General guidance:
- Extract ONLY the compound for "name" (no numbers, mg, IU, bottle counts, or descriptors).
- Infer as much as possible from mg/mcg/IU/%DV and textual cues.
- If nothing identifiable, return [] (an empty JSON array).

Do not include any extra text, explanations, or markdown — only the JSON array.`;

  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          { inline_data: { mime_type: 'image/jpeg', data: imageBase64 } },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
    geminiApiKey
  )}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const msg = await res.text().catch(() => '')
    throw new Error(`Gemini API error: ${res.status} ${msg}`)
  }

  const data = (await res.json()) as any
  // Gemini v1beta returns candidates[].content.parts[].text
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) return []
  const parsed = normalizeJson<any>(text)
  if (Array.isArray(parsed)) return parsed as GeminiSupplementResult[]
  return []
}
