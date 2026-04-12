export interface RecognitionResult {
  value: number | null
  confidence: 'high' | 'low'
  rawText: string
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
      return 'Ionian (Milesian) Greek numerals use Greek letters where \u03B1=1...\u03B8=9 (ones), \u03B9=10...\u03DF=90 (tens), \u03C1=100...\u03E1=900 (hundreds). A mark \u02B9 follows the number. Thousands use \u0375 prefix.'
    case 'Attic Greek':
      return 'Attic Greek numerals are acrophonic: \u0399=1, \u03A0=5, \u0394=10, \u03A0\u0394=50, \u0397=100, \u03A0\u0397=500, \u03A7=1000. Numbers are additive, largest symbol first.'
    case 'Babylonian':
      return 'Babylonian numerals use two cuneiform wedge marks: a vertical wedge = 1, a corner wedge = 10. The system is base-60 positional, read left to right from highest to lowest place.'
    case 'Mayan':
      return 'Mayan numerals use dots (each worth 1), horizontal bars (each worth 5), and a shell shape (= 0). Digits are stacked vertically, highest at top. The system is base-20 positional.'
    case 'Chinese Rod':
      return 'Chinese rod numerals alternate orientation: vertical rods for ones/hundreds/ten-thousands, horizontal rods for tens/thousands. Single rods are simple lines; 6\u20139 add a crossing rod.'
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

function parseResponse(rawText: string): { value: number | null; confidence: 'high' | 'low' } {
  const trimmed = rawText.trim()

  if (trimmed.toLowerCase() === 'uncertain') {
    return { value: null, confidence: 'low' }
  }

  const match = trimmed.match(/^-?\d+$/)
  if (match) {
    const n = parseInt(match[0], 10)
    if (n >= 0 && n <= 3999) {
      return { value: n, confidence: 'high' }
    }
  }

  return { value: null, confidence: 'low' }
}

export async function recognizeNumeral(
  imageBase64: string,
  mimeType: string,
  systemName: string,
): Promise<RecognitionResult> {
  const apiKey = (import.meta.env as Record<string, string | undefined>)['VITE_CLAUDE_API_KEY']
  if (!apiKey) {
    console.warn('VITE_CLAUDE_API_KEY is not configured')
    return { value: null, confidence: 'low', rawText: 'API key not configured' }
  }

  let data: ClaudeResponse
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
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
      console.error('Claude API returned non-OK status:', response.status)
      return { value: null, confidence: 'low', rawText: '' }
    }

    data = (await response.json()) as ClaudeResponse
  } catch (err) {
    console.error('Network error calling Claude API:', err)
    return { value: null, confidence: 'low', rawText: '' }
  }

  const rawText = data.content[0]?.text ?? ''
  const { value, confidence } = parseResponse(rawText)
  return { value, confidence, rawText }
}
