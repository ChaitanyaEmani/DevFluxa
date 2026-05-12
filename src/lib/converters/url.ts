export function encodeUrl(str: string): string {
  try {
    return encodeURIComponent(str)
  } catch (err) {
    throw new Error('Failed to encode URL')
  }
}

export function decodeUrl(str: string): string {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    throw new Error('Failed to decode URL - invalid URL encoding')
  }
}
