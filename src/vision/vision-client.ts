export interface RecognitionResult {
  value: number | null
  confidence: 'high' | 'low'
  rawText: string
}

export async function recognizeNumeral(
  _imageBase64: string,
  _mimeType: string,
  _systemName: string,
): Promise<RecognitionResult> {
  throw new Error('Not implemented')
}
