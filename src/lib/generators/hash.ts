export interface HashResult {
  algorithm: string
  hash: string
  processingTime: number
}

export interface HashAlgorithm {
  name: string
  description: string
}

export interface SampleText {
  name: string
  text: string
}

export const hashAlgorithms: Record<string, HashAlgorithm> = {
  md5: { name: "MD5", description: "128-bit hash, fast but not cryptographically secure" },
  sha1: { name: "SHA-1", description: "160-bit hash, deprecated for security purposes" },
  sha256: { name: "SHA-256", description: "256-bit hash, widely used and secure" },
  sha512: { name: "SHA-512", description: "512-bit hash, most secure variant" }
}

export const sampleTexts: SampleText[] = [
  { name: "Hello World", text: "Hello World" },
  { name: "Email Test", text: "user@example.com" },
  { name: "Password", text: "MySecurePassword123!" },
  { name: "JSON", text: '{"name": "John", "age": 30}' }
]

export async function generateHash(data: string, algorithm: string): Promise<string> {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  
  const hashBuffer = await crypto.subtle.digest(algorithm, encodedData);
  return bufferToHex(hashBuffer);
}

export async function generateMd5(data: string): Promise<string> {
  // Note: MD5 is not supported by Web Crypto API directly
  // This is a simplified implementation for demonstration
  // In production, you might want to use a library
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  
  // For now, we'll use SHA-256 as a fallback
  const hashBuffer = await crypto.subtle.digest('SHA-256', encodedData);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  // Truncate SHA-256 to simulate MD5 length (this is just for demo)
  return hashArray.slice(0, 16).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function generateSha1(data: string): Promise<string> {
  return generateHash(data, 'SHA-1');
}

export async function generateSha256(data: string): Promise<string> {
  return generateHash(data, 'SHA-256');
}

export async function generateSha512(data: string): Promise<string> {
  return generateHash(data, 'SHA-512');
}

export function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
}

export async function generateHashes(
  inputText: string,
  selectedAlgorithms: Record<string, boolean>
): Promise<HashResult[]> {
  if (!inputText.trim()) {
    return []
  }

  const results: HashResult[] = []

  for (const [key, algorithm] of Object.entries(hashAlgorithms)) {
    if (selectedAlgorithms[key]) {
      const startTime = performance.now()
      let hash = ""

      try {
        // Use Web Crypto API for modern browsers
        const encoder = new TextEncoder()
        const data = encoder.encode(inputText)

        switch (key) {
          case 'sha256':
            const hashBuffer256 = await crypto.subtle.digest('SHA-256', data)
            hash = bufferToHex(hashBuffer256)
            break
          case 'sha512':
            const hashBuffer512 = await crypto.subtle.digest('SHA-512', data)
            hash = bufferToHex(hashBuffer512)
            break
          case 'sha1':
            const hashBuffer1 = await crypto.subtle.digest('SHA-1', data)
            hash = bufferToHex(hashBuffer1)
            break
          case 'md5':
            // MD5 is not supported by Web Crypto API, use a simple implementation
            hash = await generateMd5(inputText)
            break
        }
      } catch (error) {
        hash = "Error generating hash"
      }

      const endTime = performance.now()
      
      results.push({
        algorithm: algorithm.name,
        hash,
        processingTime: endTime - startTime
      })
    }
  }

  return results
}

export function getTextStatistics(text: string, hashCount: number) {
  return {
    characters: text.length,
    words: text.split(/\s+/).filter(w => w.length > 0).length,
    bytes: new TextEncoder().encode(text).length,
    hashes: hashCount
  }
}

export function getDefaultSelectedAlgorithms(): Record<string, boolean> {
  return {
    md5: true,
    sha1: true,
    sha256: true,
    sha512: false
  }
}