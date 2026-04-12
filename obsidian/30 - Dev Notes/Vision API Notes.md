# Vision API Notes

## Overview

The Vision integration lets a user photograph a numeral written in one of the seven supported systems and have the app identify the corresponding Arabic integer. The user selects the system first, then uploads or captures a photo.

---

## Model

`claude-sonnet-4-6` — set as a constant in `src/vision/vision-client.ts`.

---

## API Integration

### Function Signature

```ts
export async function recognizeNumeral(
  imageBase64: string,      // base64-encoded image data (no data: prefix)
  mimeType: string,         // 'image/jpeg' | 'image/png' | 'image/webp'
  systemName: string        // e.g., "Roman", "Egyptian Hieroglyphic"
): Promise<{
  value: number | null      // the identified Arabic integer, or null if uncertain
  confidence: 'high' | 'low'
  rawText: string           // Claude's full response for debugging
}>
```

### Request Structure

```ts
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': import.meta.env.VITE_CLAUDE_API_KEY,
    'anthropic-version': '2023-06-01',
  },
  body: JSON.stringify({
    model: 'claude-sonnet-4-6',
    max_tokens: 100,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mimeType,
            data: imageBase64,
          }
        },
        {
          type: 'text',
          text: buildPrompt(systemName)
        }
      ]
    }]
  })
})
```

---

## Prompt Engineering

### Core Prompt Template

```
You are analyzing an image of a number written in the ${systemName} numeral system.

Your task: identify the Arabic integer this numeral represents.

${systemHint(systemName)}

Respond with ONLY one of:
- A single integer (e.g., "42") if you are confident
- The word "uncertain" if you cannot confidently identify the numeral

Do not explain. Do not add any other text.
```

### System Hints

Each system gets a contextual hint to guide recognition:

**Roman:** "Roman numerals use letters I (1), V (5), X (10), L (50), C (100), D (500), M (1000). Subtractive notation applies (IV=4, IX=9, etc.)."

**Egyptian Hieroglyphic:** "Egyptian numerals are additive. A vertical stroke = 1, a heel/hobble shape = 10, a coil of rope = 100, a lotus flower = 1000."

**Ionian Greek:** "Ionian (Milesian) Greek numerals use Greek letters where α=1...θ=9 (ones), ι=10...ϟ=90 (tens), ρ=100...ϡ=900 (hundreds). A mark ʹ follows the number. Thousands use ͵ prefix."

**Attic Greek:** "Attic Greek numerals are acrophonic: Ι=1, Π=5, Δ=10, ΠΔ=50, Η=100, ΠΗ=500, Χ=1000. Numbers are additive, largest symbol first."

**Babylonian:** "Babylonian numerals use two cuneiform wedge marks: a vertical wedge = 1, a corner wedge = 10. The system is base-60 positional, read left to right from highest to lowest place."

**Mayan:** "Mayan numerals use dots (each worth 1), horizontal bars (each worth 5), and a shell shape (= 0). Digits are stacked vertically, highest at top. The system is base-20 positional."

**Chinese Rod:** "Chinese rod numerals alternate orientation: vertical rods for ones/hundreds/ten-thousands, horizontal rods for tens/thousands. Single rods are simple lines; 6–9 add a crossing rod."

---

## Response Parsing

```ts
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

  // Claude gave text other than a clean integer or "uncertain"
  return { value: null, confidence: 'low' }
}
```

---

## Failure Handling

**When `value` is `null` (confidence: low):**
1. The `PhotoPanel` component shows an error message: "Could not identify the numeral. Please enter the value manually."
2. The `VisionOverride` component renders: a text input asking for the Arabic integer.
3. On submit, the manual value is validated (must be integer 0–3999) and used to populate the output grid.

**Network/API errors:**
- Wrap the fetch in try/catch
- On error: show "Vision unavailable. Please enter the value manually." and render `VisionOverride`
- Log the error to console for debugging (not shown to user)

**API key missing:**
- Check `import.meta.env.VITE_CLAUDE_API_KEY` at startup
- If undefined: disable the Photo mode tab entirely and show a tooltip: "Vision requires a Claude API key. See .env.local.example."

---

## Image Handling

**File input processing:**
```ts
async function fileToBase64(file: File): Promise<{ data: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      const [header, data] = dataUrl.split(',')
      const mimeType = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg'
      resolve({ data, mimeType })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
```

**Size limit:** Images over ~5MB should be resized client-side before sending (use Canvas API). Anthropic's API accepts images up to 20MB, but smaller images are faster and cheaper.

---

## Security Notes

- The API key is stored in `import.meta.env.VITE_CLAUDE_API_KEY`
- Vite bundles this into the client-side JavaScript — it IS visible in browser DevTools
- For personal local use: acceptable
- For public hosting: replace with a serverless proxy function (Vercel Edge Functions, Netlify Functions)
- `.env.local` is gitignored by Vite's default `.gitignore`

See [[Design Decisions#DD-007]].

---

## Future Enhancement: Auto-Detection Mode

Phase 4 stretch: allow the user to upload without pre-selecting a system. Claude attempts to identify both the system and the value in one pass.

Prompt addition:
```
The image may contain a numeral from any of these systems: Roman, Egyptian Hieroglyphic,
Ionian Greek, Attic Greek, Babylonian, Mayan, Chinese Rod.

First identify which system is shown (or respond "unknown system" if unclear).
Then identify the Arabic integer value.

Respond in this exact format:
SYSTEM: <system name>
VALUE: <integer or "uncertain">
```

This approach is less reliable than system-pre-selection and should remain a secondary option.

---

## Related Notes

- [[Architecture#Vision Integration]]
- [[Design Decisions#DD-004]] — model choice
- [[Design Decisions#DD-005]] — why system selection before upload
- [[Design Decisions#DD-007]] — security and API key
