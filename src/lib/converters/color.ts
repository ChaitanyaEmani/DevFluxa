export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, n)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export function parseRgbString(rgb: string): { r: number; g: number; b: number } | null {
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  
  if (match) {
    return {
      r: parseInt(match[1]),
      g: parseInt(match[2]),
      b: parseInt(match[3])
    };
  }
  
  return null;
}

export function isValidHex(hex: string): boolean {
  return /^#?[0-9A-F]{6}$/i.test(hex);
}

// Returns true when v is an integer string in [0, 255]
export function isValidChannel(v: string): boolean {
  if (!v.trim()) return false
  if (v.includes('.')) return false
  const n = Number(v)
  return Number.isInteger(n) && n >= 0 && n <= 255
}

// RGB channels → "#rrggbb" (enhanced version of rgbToHex)
export function channelsToHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// Enhanced hex parser that supports both "#rgb" and "#rrggbb" formats
export function parseHex(raw: string): { r: number; g: number; b: number } | null {
  const clean = raw.replace(/^#/, '').trim()
  if (!/^[0-9A-Fa-f]+$/.test(clean)) return null
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16),
    }
  }
  if (clean.length === 6) {
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16),
    }
  }
  return null
}

// Validate hex input with detailed error messages
export function validateHexInput(value: string): { isValid: boolean; error?: string } {
  if (!value.trim()) {
    return { isValid: true }
  }
  
  const clean = value.replace(/^#/, '').trim()
  if (clean.length !== 3 && clean.length !== 6) {
    return { isValid: false, error: 'Invalid hex format — expected 3 or 6 hexadecimal characters.' }
  }
  if (!/^[0-9A-Fa-f]+$/.test(clean)) {
    return { isValid: false, error: 'Invalid hex characters — only 0–9 and A–F are allowed.' }
  }
  
  return { isValid: true }
}

// Validate RGB channel input with detailed error messages
export function validateRgbChannel(value: string): { isValid: boolean; error?: string } {
  if (!value.trim()) {
    return { isValid: true }
  }
  
  if (value.includes('.')) {
    return { isValid: false, error: 'RGB values must be integers — no decimals allowed.' }
  }
  
  const num = Number(value)
  if (!Number.isInteger(num)) {
    return { isValid: false, error: 'RGB values must be valid whole numbers.' }
  }
  
  if (num < 0 || num > 255) {
    return { isValid: false, error: 'RGB values must each be between 0 and 255.' }
  }
  
  return { isValid: true }
}
