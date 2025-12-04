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

  const prompt = `Analyze the provided supplement product photo.
Return ONLY a JSON array of objects with these exact keys per detected product:
[{
  "name": string,          // product name (human readable)
  "brand": string|null,    // brand if identifiable, otherwise null
  "form": string|null,     // capsule | tablet | powder | liquid | gummy | softgel | etc. if visible
  "serving_size": number|string|null, // numeric value if labelled, otherwise null
  "serving_unit": string|null,        // unit like capsule, tablet, scoop, ml, g
  "per_serving": object|string|null   // nutrition composition per serving as key-value; if unknown, null
}]
Do not include any extra text, explanations or markdown.
If nothing is identifiable, return an empty JSON array []`;

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

