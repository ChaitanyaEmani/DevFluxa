export interface PasswordOptions {
  length: number
  includeUppercase: boolean
  includeLowercase: boolean
  includeNumbers: boolean
  includeSymbols: boolean
  excludeSimilar: boolean
  excludeAmbiguous: boolean
}

export interface PasswordStrength {
  score: number
  label: string
  color: string
}

export const charSets = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  similar: "il1Lo0O",
  ambiguous: "{}[]()\/\"'`~,;.<>"
}

export function generatePassword(options: PasswordOptions): string {
  let charset = ""
  
  if (options.includeUppercase) {
    charset += options.excludeSimilar 
      ? charSets.uppercase.replace(/[O]/g, '')
      : charSets.uppercase
  }
  
  if (options.includeLowercase) {
    charset += options.excludeSimilar 
      ? charSets.lowercase.replace(/[l]/g, '')
      : charSets.lowercase
  }
  
  if (options.includeNumbers) {
    charset += options.excludeSimilar 
      ? charSets.numbers.replace(/[10]/g, '')
      : charSets.numbers
  }
  
  if (options.includeSymbols) {
    let symbols = charSets.symbols
    if (options.excludeAmbiguous) {
      symbols = symbols.replace(/[{}[\]()\/'"`~,;.<>]/g, '')
    }
    charset += symbols
  }

  if (charset === "") {
    return "Please select at least one character type"
  }

  let newPassword = ""
  const array = new Uint32Array(options.length)
  crypto.getRandomValues(array)
  
  for (let i = 0; i < options.length; i++) {
    newPassword += charset[array[i] % charset.length]
  }

  return newPassword
}

export function calculatePasswordStrength(pwd: string): PasswordStrength {
  if (!pwd || pwd.length === 0) {
    return { score: 0, label: "None", color: "bg-gray-500" }
  }

  if (pwd === "Please select at least one character type") {
    return { score: 0, label: "None", color: "bg-gray-500" }
  }

  let score = 0
  
  // Length bonus
  if (pwd.length >= 8) score += 1
  if (pwd.length >= 12) score += 1
  if (pwd.length >= 16) score += 1
  
  // Character variety bonus
  if (/[a-z]/.test(pwd)) score += 1
  if (/[A-Z]/.test(pwd)) score += 1
  if (/[0-9]/.test(pwd)) score += 1
  if (/[^a-zA-Z0-9]/.test(pwd)) score += 1

  // Complexity patterns
  if (!/(.)\1{2,}/.test(pwd)) score += 1 // No 3+ repeated characters
  if (!/^[a-zA-Z]+$/.test(pwd) && !/^[0-9]+$/.test(pwd)) score += 1 // Mixed character types

  const maxScore = 9
  const percentage = (score / maxScore) * 100

  if (percentage < 30) {
    return { score: percentage, label: "Weak", color: "bg-red-500" }
  } else if (percentage < 60) {
    return { score: percentage, label: "Fair", color: "bg-yellow-500" }
  } else if (percentage < 80) {
    return { score: percentage, label: "Good", color: "bg-blue-500" }
  } else {
    return { score: percentage, label: "Strong", color: "bg-green-500" }
  }
}

export function getPasswordAnalysis(password: string) {
  return {
    length: password.length,
    uniqueChars: Array.from(new Set(password)).length,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumbers: /[0-9]/.test(password),
    hasSymbols: /[^a-zA-Z0-9]/.test(password),
    noRepeats: !/(.)\1{2,}/.test(password)
  }
}

export const passwordPresets = [
  { name: "PIN (4 digits)", length: 4, includeUppercase: false, includeLowercase: false, includeNumbers: true, includeSymbols: false },
  { name: "Short (8 chars)", length: 8, includeUppercase: true, includeLowercase: true, includeNumbers: true, includeSymbols: false },
  { name: "Strong (16 chars)", length: 16, includeUppercase: true, includeLowercase: true, includeNumbers: true, includeSymbols: true },
  { name: "Maximum (32 chars)", length: 32, includeUppercase: true, includeLowercase: true, includeNumbers: true, includeSymbols: true }
] as const

export function getDefaultOptions(): PasswordOptions {
  return {
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false
  }
}