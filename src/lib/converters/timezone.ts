export interface Timezone {
  value: string
  label: string
  offset: string
}

export const timezones: Timezone[] = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)', offset: '+00:00' },
  { value: 'America/New_York', label: 'Eastern Time (ET)', offset: '-05:00' },
  { value: 'America/Chicago', label: 'Central Time (CT)', offset: '-06:00' },
  { value: 'America/Denver', label: 'Mountain Time (MT)', offset: '-07:00' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: '-08:00' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)', offset: '-09:00' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)', offset: '-10:00' },
  { value: 'America/Sao_Paulo', label: 'Brasília Time (BRT)', offset: '-03:00' },
  { value: 'America/Mexico_City', label: 'Central Time (Mexico)', offset: '-06:00' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)', offset: '+00:00' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)', offset: '+01:00' },
  { value: 'Europe/Berlin', label: 'Central European Time (CET)', offset: '+01:00' },
  { value: 'Europe/Moscow', label: 'Moscow Time (MSK)', offset: '+03:00' },
  { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST)', offset: '+04:00' },
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST)', offset: '+05:30' },
  { value: 'Asia/Shanghai', label: 'China Standard Time (CST)', offset: '+08:00' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)', offset: '+09:00' },
  { value: 'Asia/Seoul', label: 'Korea Standard Time (KST)', offset: '+09:00' },
  { value: 'Asia/Singapore', label: 'Singapore Time (SGT)', offset: '+08:00' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)', offset: '+10:00' },
  { value: 'Pacific/Auckland', label: 'New Zealand Time (NZT)', offset: '+12:00' }
]

export function convertTimezone(date: Date, fromTimezone: string, toTimezone: string): Date {
  // This is a simplified timezone conversion
  // In a real app, you'd use a proper timezone library like moment-timezone or date-fns-tz
  
  const fromOffset = timezones.find(tz => tz.value === fromTimezone)?.offset || '+00:00'
  const toOffset = timezones.find(tz => tz.value === toTimezone)?.offset || '+00:00'
  
  // Parse offsets (simplified)
  const parseOffset = (offset: string): number => {
    const match = offset.match(/([+-])(\d{2}):(\d{2})/)
    if (!match) return 0
    const sign = match[1] === '+' ? 1 : -1
    const hours = parseInt(match[2])
    const minutes = parseInt(match[3])
    return sign * (hours * 60 + minutes)
  }
  
  const fromMinutes = parseOffset(fromOffset)
  const toMinutes = parseOffset(toOffset)
  const diffMinutes = toMinutes - fromMinutes
  
  const newDate = new Date(date.getTime() + diffMinutes * 60 * 1000)
  return newDate
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZoneName: 'short'
  })
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  })
}
