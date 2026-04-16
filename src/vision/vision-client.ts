export type FailureReason = 'no-key' | 'network-error' | 'api-error' | 'uncertain' | 'parse-failed'

export interface RecognitionResult {
  value: number | null
  confidence: 'high' | 'low'
  rawText: string
  failureReason?: FailureReason
}

const MODEL = 'claude-sonnet-4-6'

interface ClaudeResponse {
  content: Array<{ type: string; text: string }>
}

function systemHint(systemName: string): string {
  switch (systemName) {
    case 'Roman':
      return 'Roman numerals use letters I (1), V (5), X (10), L (50), C (100), D (500), M (1000). Subtractive notation applies (IV=4, IX=9, etc.).'
    case 'Egyptian Hieroglyphic':
      return 'Egyptian numerals are additive. A vertical stroke = 1, a heel/hobble shape = 10, a coil of rope = 100, a lotus flower = 1000.'
    case 'Ionian Greek':
      return 'Ionian (Milesian) Greek numerals use Greek letters where α=1...θ=9 (ones), ι=10...ϟ=90 (tens), ρ=100...ϡ=900 (hundreds). A mark ʹ follows the number. Thousands use ͵ prefix.'
    case 'Attic Greek':
      return 'Attic Greek numerals are acrophonic: Ι=1, Π=5, Δ=10, ΠΔ=50, Η=100, ΠΗ=500, Χ=1000. Numbers are additive, largest symbol first.'
    case 'Babylonian':
      return 'Babylonian numerals use two cuneiform wedge marks: a vertical wedge = 1, a corner wedge = 10. The system is base-60 positional, read left to right from highest to lowest place.'
    case 'Mayan':
      return 'Mayan numerals use dots (each worth 1), horizontal bars (each worth 5), and a shell shape (= 0). Digits are stacked vertically, highest at top. The system is base-20 positional.'
    case 'Chinese Rod':
      return 'Chinese rod numerals alternate orientation: vertical rods for ones/hundreds/ten-thousands, horizontal rods for tens/thousands. Single rods are simple lines; 6–9 add a crossing rod.'
    case 'Chinese Traditional':
      return 'Classical Chinese numerals use characters: 一(1) 二(2) 三(3) 四(4) 五(5) 六(6) 七(7) 八(8) 九(9) 十(10) 百(100) 千(1000) 萬(10000). Numbers are written largest-to-smallest; 零 marks a zero gap between non-zero groups.'
    case 'Glagolitic':
      return 'Glagolitic numerals use Glagolitic script letters additively, largest to smallest. The first 9 letters equal 1–9, the next 9 equal 10–90, the next 9 equal 100–900, and the next 9 equal 1000–9000.'
    case 'Old Church Slavonic':
      return 'Old Church Slavonic numerals use Cyrillic letters additively, largest to smallest. А=1 В=2 Г=3 Д=4 Є=5 Ѕ=6 З=7 И=8 Ѳ=9, then І=10 К=20…Ч=90, Р=100…Ц=900, and ҂ prefixes thousands (҂А=1000).'
    default:
      return 'Identify the numeral value shown in the image.'
  }
}

function buildPrompt(systemName: string): string {
  return `You are analyzing an image of a number written in the ${systemName} numeral system.

Your task: identify the Arabic integer this numeral represents.

${systemHint(systemName)}

Respond with ONLY one of:
- A single integer (e.g., "42") if you are confident
- The word "uncertain" if you cannot confidently identify the numeral

Do not explain. Do not add any other text.`
}

function parseResponse(rawText: string): { value: number | null; confidence: 'high' | 'low'; failureReason?: FailureReason } {
  const trimmed = rawText.trim()

  if (trimmed.toLowerCase() === 'uncertain') {
    return { value: null, confidence: 'low', failureReason: 'uncertain' }
  }

  const match = trimmed.match(/^-?\d+$/)
  if (match) {
    const n = parseInt(match[0], 10)
    if (n >= 0 && n <= 9_999_999) {
      return { value: n, confidence: 'high' }
    }
  }

  return { value: null, confidence: 'low', failureReason: 'parse-failed' }
}

export async function recognizeNumeral(
  imageBase64: string,
  mimeType: string,
  systemName: string,
): Promise<RecognitionResult> {
  const apiKey = (import.meta.env as Record<string, string | undefined>)['VITE_CLAUDE_API_KEY']
  if (!apiKey) {
    console.warn('VITE_CLAUDE_API_KEY is not configured')
    return { value: null, confidence: 'low', rawText: 'API key not configured', failureReason: 'no-key' }
  }

  let data: ClaudeResponse
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mimeType,
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: buildPrompt(systemName),
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      console.error(`[vision] API error ${response.status}:`, body)
      return { value: null, confidence: 'low', rawText: body, failureReason: 'api-error' }
    }

    data = (await response.json()) as ClaudeResponse
  } catch (err) {
    console.error('[vision] Network error:', err)
    return { value: null, confidence: 'low', rawText: '', failureReason: 'network-error' }
  }

  const rawText = data.content[0]?.text ?? ''
  const { value, confidence, failureReason } = parseResponse(rawText)
  if (value === null) {
    console.warn(`[vision] Could not parse response for ${systemName}:`, JSON.stringify(rawText))
  }
  return { value, confidence, rawText, failureReason }
}
