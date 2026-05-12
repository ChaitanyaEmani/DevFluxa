// Format a Date → "YYYY-MM-DDTHH:mm" (value expected by datetime-local input)
export const toDateTimeLocalValue = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  )
}

// Display label: "YYYY-MM-DD HH:mm:ss" in local time
export const toDisplayString = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  )
}

// Convert Unix timestamp to datetime-local value
export const convertUnixToDateTimeLocal = (unixTimestamp: string): string | null => {
  const raw = unixTimestamp.trim()

  if (!raw) {
    return null
  }

  const timestamp = Number(raw)
  if (!Number.isFinite(timestamp) || raw === '') {
    return null
  }

  const minTimestamp = -2208988800 // Year 1900
  const maxTimestamp = 253402300799 // Year 9999
  if (timestamp < minTimestamp || timestamp > maxTimestamp) {
    return null
  }

  const date = new Date(timestamp * 1000)
  if (isNaN(date.getTime())) {
    return null
  }

  return toDateTimeLocalValue(date)
}

// Convert datetime-local value to Unix timestamp
export const convertDateTimeLocalToUnix = (dateTimeLocal: string): string | null => {
  if (!dateTimeLocal) {
    return null
  }

  // datetime-local value is treated as local time by the Date constructor
  const date = new Date(dateTimeLocal)
  if (isNaN(date.getTime())) {
    return null
  }

  const timestamp = Math.floor(date.getTime() / 1000)
  return timestamp.toString()
}

// Get current Unix timestamp
export const getCurrentUnixTimestamp = (): string => {
  const now = new Date()
  return Math.floor(now.getTime() / 1000).toString()
}

// Get current datetime-local value
export const getCurrentDateTimeLocal = (): string => {
  const now = new Date()
  return toDateTimeLocalValue(now)
}

// Validate Unix timestamp
export const validateUnixTimestamp = (unixTimestamp: string): { isValid: boolean; error?: string } => {
  const raw = unixTimestamp.trim()

  if (!raw) {
    return { isValid: false, error: 'Please enter a Unix timestamp.' }
  }

  const timestamp = Number(raw)
  if (!Number.isFinite(timestamp) || raw === '') {
    return { isValid: false, error: 'Invalid timestamp: must be a number.' }
  }

  const minTimestamp = -2208988800 // Year 1900
  const maxTimestamp = 253402300799 // Year 9999
  if (timestamp < minTimestamp || timestamp > maxTimestamp) {
    return { isValid: false, error: `Timestamp out of valid range (${minTimestamp} to ${maxTimestamp}).` }
  }

  const date = new Date(timestamp * 1000)
  if (isNaN(date.getTime())) {
    return { isValid: false, error: 'Invalid timestamp: cannot convert to date.' }
  }

  return { isValid: true }
}

// Validate datetime-local value
export const validateDateTimeLocal = (dateTimeLocal: string): { isValid: boolean; error?: string } => {
  if (!dateTimeLocal) {
    return { isValid: false, error: 'Please select a date and time first.' }
  }

  const date = new Date(dateTimeLocal)
  if (isNaN(date.getTime())) {
    return { isValid: false, error: 'Invalid date: please use the date picker to select a valid date.' }
  }

  return { isValid: true }
}