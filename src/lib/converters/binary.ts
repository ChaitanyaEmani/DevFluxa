export function textToBinary(text: string, options: {
  separator?: string
  encoding?: 'utf8' | 'ascii'
} = {}): string {
  const { separator = ' ', encoding = 'utf8' } = options
  
  if (!text) return ''
  
  try {
    return text
      .split('')
      .map(char => {
        const code = char.charCodeAt(0)
        return code.toString(2).padStart(8, '0')
      })
      .join(separator)
  } catch (error) {
    throw new Error('Failed to convert text to binary')
  }
}

export function binaryToText(binary: string, options: {
  separator?: string
  encoding?: 'utf8' | 'ascii'
} = {}): string {
  const { separator = ' ', encoding = 'utf8' } = options
  
  if (!binary) return ''
  
  try {
    return binary
      .split(separator)
      .filter(bits => bits.trim()) // Remove empty strings
      .map(bits => {
        const code = parseInt(bits, 2)
        if (isNaN(code)) throw new Error(`Invalid binary sequence: ${bits}`)
        return String.fromCharCode(code)
      })
      .join('')
  } catch (error) {
    throw new Error('Failed to convert binary to text')
  }
}

export function validateBinary(binary: string, separator: string): boolean {
  if (!binary) return true
  
  const parts = binary.split(separator).filter(bits => bits.trim())
  return parts.every(bits => /^[01]+$/.test(bits) && bits.length === 8)
}

export function isValidBinary(binary: string): boolean {
  return /^[01\s]+$/.test(binary) && binary.trim().split(' ').every(bin => bin.length === 8);
}

export function formatBinary(binary: string): string {
  return binary.replace(/\s+/g, ' ').trim();
}
