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

Return ONLY a JSON array of objects. For each detected supplement, include exactly these keys:
[
  {
    "name": string,            // IMPORTANT: compound ONLY (e.g., "CLA", "Vitamin C", "Magnesium"). Do NOT include strength, dosage, counts, flavors, or marketing text. For example, if the label says "CLA 800 mg Nutritional Oil", return "CLA".
    "brand": string|null,      // Brand on the label if clearly visible; otherwise null.
    "form": string|null,       // capsule | tablet | powder | liquid | gummy | softgel | etc., if inferrable.
    "serving_size": number|string|null, // Numeric value of a single serving if visible or strongly inferable (e.g., 1, 2, 800). If count is not numeric or unclear, use null.
    "serving_unit": string|null,        // Unit for serving_size (e.g., capsule, tablet, scoop, ml, g). Use singular forms like "capsule".
    "per_serving": object|string|null   // Key-value map of nutrients per serving inferred from the label (e.g., {"vitamin_c_mg": 100, "zinc_mg": 5}). If not visible, null.
  }
]

Guidance:
- Extract the compound name only for "name". Never include numbers, milligrams, bottles, counts, or descriptors in "name".
- Infer as much as possible from the visible text (mg, mcg, IU, %DV), including form and per_serving details.
- Prefer common units: capsule, tablet, scoop, ml, g. Use singular.
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
