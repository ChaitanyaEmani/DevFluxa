export interface DateDifference {
  years: number
  months: number
  days: number
  hours: number
  minutes: number
  seconds: number
  totalDays: number
  totalHours: number
  totalMinutes: number
  totalSeconds: number
  milliseconds: number
}

export interface TimeSegment {
  label: string
  value: number
  unit: string
}

export function calculateDateDifference(startDate: Date, endDate: Date): DateDifference {
  const diffMs = Math.abs(endDate.getTime() - startDate.getTime())
  
  const milliseconds = diffMs % 1000
  const totalSeconds = Math.floor(diffMs / 1000)
  const seconds = totalSeconds % 60
  const totalMinutes = Math.floor(totalSeconds / 60)
  const minutes = totalMinutes % 60
  const totalHours = Math.floor(totalMinutes / 60)
  const hours = totalHours % 24
  const totalDays = Math.floor(totalHours / 24)
  
  // Calculate years, months, and remaining days
  let years = 0
  let months = 0
  let days = totalDays
  
  // Approximate years and months
  if (totalDays >= 365) {
    years = Math.floor(totalDays / 365.25)
    const remainingDays = totalDays % 365.25
    months = Math.floor(remainingDays / 30.44)
    days = Math.floor(remainingDays % 30.44)
  } else if (totalDays >= 30) {
    months = Math.floor(totalDays / 30.44)
    days = Math.floor(totalDays % 30.44)
  }
  
  return {
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    totalDays,
    totalHours,
    totalMinutes,
    totalSeconds,
    milliseconds
  }
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  })
}

export function formatDateTimeLocal(date: string): Date {
  const parsed = new Date(date)
  if (isNaN(parsed.getTime())) {
    return new Date()
  }
  return parsed
}
