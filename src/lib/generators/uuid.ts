export function generateUUID(version: 'v1' | 'v4'): string {
  if (version === 'v4') {
    // Generate UUID v4 (random)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  } else {
    // Generate UUID v1 (timestamp-based)
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    const random2 = Math.random().toString(36).substring(2, 15)
    
    // Simple v1-like UUID (not fully RFC compliant but good for demo)
    return `${timestamp.toString(16).padStart(12, '0')}-${random.substring(0, 4)}-1${random.substring(4, 7)}-${random2.substring(0, 4)}-${random2.substring(4, 16)}`
  }
}

export function generateBulkUUIDs(version: 'v1' | 'v4', count: number): string[] {
  const uuids: string[] = []
  for (let i = 0; i < count; i++) {
    uuids.push(generateUUID(version))
  }
  return uuids
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}

export function downloadAsFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function validateBulkCount(count: string): number {
  const num = parseInt(count) || 1
  return Math.min(100, Math.max(1, num))
}

export type UUIDVersion = 'v1' | 'v4'