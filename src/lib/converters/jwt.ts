export interface JwtData {
  header: Record<string, any>
  payload: Record<string, any>
  signature: string
  isValid: boolean
  error?: string
}

export function decodeJWT(token: string): JwtData {
  try {
    const parts = token.split('.')
    
    if (parts.length !== 3) {
      return {
        header: {},
        payload: {},
        signature: '',
        isValid: false,
        error: 'Invalid JWT format. Expected 3 parts separated by dots.'
      }
    }

    // Decode header
    let header: Record<string, any> = {}
    try {
      const headerDecoded = atob(parts[0].replace(/-/g, '+').replace(/_/g, '/'))
      header = JSON.parse(headerDecoded)
    } catch (error) {
      return {
        header: {},
        payload: {},
        signature: '',
        isValid: false,
        error: 'Failed to decode JWT header. Invalid Base64 or JSON.'
      }
    }

    // Decode payload
    let payload: Record<string, any> = {}
    try {
      const payloadDecoded = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
      payload = JSON.parse(payloadDecoded)
    } catch (error) {
      return {
        header: {},
        payload: {},
        signature: '',
        isValid: false,
        error: 'Failed to decode JWT payload. Invalid Base64 or JSON.'
      }
    }

    return {
      header,
      payload,
      signature: parts[2],
      isValid: true
    }
  } catch (error) {
    return {
      header: {},
      payload: {},
      signature: '',
      isValid: false,
      error: 'Failed to decode JWT token.'
    }
  }
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString()
}

export function isTokenExpired(payload: Record<string, any>): boolean {
  if (payload.exp) {
    return Date.now() >= payload.exp * 1000
  }
  return false
}

export function getTokenTimeLeft(payload: Record<string, any>): string {
  if (!payload.exp) return 'No expiration time'
  
  const now = Date.now()
  const exp = payload.exp * 1000
  const diff = exp - now
  
  if (diff <= 0) return 'Expired'
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}
