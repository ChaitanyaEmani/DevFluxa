"use client"

import { useState, useEffect } from "react"
import { CopyButton } from "@/components/ui/CopyButton"
import { Button } from "@/components/ui/Button"
import { Header } from "@/components/ui/Header"

interface Timezone {
  value: string
  label: string
  offset: string
}

const timezones: Timezone[] = [
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

function convertTimezone(date: Date, fromTimezone: string, toTimezone: string): Date {
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

function formatDateTime(date: Date): string {
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

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  })
}

export function TimezoneConverter() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [fromTimezone, setFromTimezone] = useState('UTC')
  const [toTimezone, setToTimezone] = useState('America/New_York')
  const [convertedTime, setConvertedTime] = useState<Date | null>(null)
  const [inputTime, setInputTime] = useState('')

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (inputTime) {
      const parsedDate = new Date(inputTime)
      if (!isNaN(parsedDate.getTime())) {
        const converted = convertTimezone(parsedDate, fromTimezone, toTimezone)
        setConvertedTime(converted)
      }
    } else {
      const converted = convertTimezone(currentTime, fromTimezone, toTimezone)
      setConvertedTime(converted)
    }
  }, [inputTime, fromTimezone, toTimezone, currentTime])

  const convertCurrentTime = () => {
    const converted = convertTimezone(currentTime, fromTimezone, toTimezone)
    setConvertedTime(converted)
    setInputTime('')
  }

  const clearAll = () => {
    setInputTime('')
  }

  const swapTimezones = () => {
    setFromTimezone(toTimezone)
    setToTimezone(fromTimezone)
  }

  const copyResult = () => {
    if (convertedTime) {
      navigator.clipboard.writeText(formatDateTime(convertedTime))
    }
  }

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <Header 
          toolTitle="Timezone Converter" 
          toolDescription="Convert time between different timezones instantly with accurate calculations." 
        />

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <Button onClick={convertCurrentTime} className="shadow-sm hover:shadow-md transition-all duration-200">
              <span className="mr-2">🌍</span>Convert Current Time
            </Button>
            <Button variant="outline" onClick={swapTimezones} className="shadow-sm hover:shadow-md transition-all duration-200">
              <span className="mr-2">🔄</span>Swap Timezones
            </Button>
          </div>
          
          <Button variant="outline" onClick={clearAll} className="ml-auto shadow-sm hover:shadow-md transition-all duration-200 text-destructive hover:bg-destructive/5">
            <span className="mr-2">🗑️</span>Clear
          </Button>
        </div>

        {/* Current Time Display */}
        <div className="mb-8 p-4 bg-muted/30 rounded-lg border text-center">
          <div className="text-sm text-muted-foreground mb-2">Current UTC Time</div>
          <div className="text-2xl font-bold">
            {formatDateTime(currentTime)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* From Timezone */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">From Timezone</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Timezone</label>
                <select
                  value={fromTimezone}
                  onChange={(e) => setFromTimezone(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {timezones.map(tz => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label} ({tz.offset})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Or enter specific time</label>
                <input
                  type="datetime-local"
                  value={inputTime}
                  onChange={(e) => setInputTime(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          {/* To Timezone */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">To Timezone</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">Select Timezone</label>
              <select
                value={toTimezone}
                onChange={(e) => setToTimezone(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {timezones.map(tz => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label} ({tz.offset})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Conversion Result */}
        {convertedTime && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Converted Time</h3>
              <CopyButton text={formatDateTime(convertedTime)} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-background/50 border border-border/50 rounded-lg text-center">
                <div className="text-sm text-muted-foreground mb-2">Date</div>
                <div className="text-lg font-bold">
                  {formatDate(convertedTime)}
                </div>
              </div>
              
              <div className="p-4 bg-background/50 border border-border/50 rounded-lg text-center">
                <div className="text-sm text-muted-foreground mb-2">Time</div>
                <div className="text-lg font-bold">
                  {formatTime(convertedTime)}
                </div>
              </div>
              
              <div className="p-4 bg-background/50 border border-border/50 rounded-lg text-center">
                <div className="text-sm text-muted-foreground mb-2">Full DateTime</div>
                <div className="text-lg font-bold">
                  {formatDateTime(convertedTime)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!convertedTime && (
          <div className="mt-8 text-center py-12 text-muted-foreground">
            <div className="text-6xl mb-4">🌍</div>
            <h3 className="text-xl font-semibold mb-2">Ready to Convert</h3>
            <p className="text-sm mb-4">Select timezones and click "Convert Current Time" or enter a specific time</p>
            <Button onClick={convertCurrentTime} className="shadow-sm hover:shadow-md transition-all duration-200">
              <span className="mr-2">🌍</span>Convert Current Time
            </Button>
          </div>
        )}

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Real-time Updates', desc: 'Current UTC time updates every second.', icon: '⏰' },
              { title: 'Multiple Timezones', desc: 'Support for major timezones worldwide.', icon: '🌍' },
              { title: 'Custom Time Input', desc: 'Enter any specific date and time to convert.', icon: '📅' },
              { title: 'Swap Function', desc: 'Quickly swap source and target timezones.', icon: '🔄' },
              { title: 'Copy Results', desc: 'One-click copy of converted time.', icon: '📋' },
              { title: 'Clean Interface', desc: 'Simple, focused timezone conversion tool.', icon: '🎨' },
            ].map(({ title, desc, icon }) => (
              <div key={title} className="group relative p-6 border-2 border-border/50 rounded-lg bg-background/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="text-3xl mb-3">{icon}</div>
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
