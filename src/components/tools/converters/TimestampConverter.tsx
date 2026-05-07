'use client'

import { useState, useEffect } from 'react'
import { CopyButton } from '@/components/ui/CopyButton'
import { Button } from '@/components/ui/Button'

export function TimestampConverter() {
  const [unixTimestamp, setUnixTimestamp] = useState('')
  const [dateTime, setDateTime] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [error, setError] = useState('')

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const convertToDateTime = () => {
    try {
      if (!unixTimestamp.trim()) {
        throw new Error('Please enter a Unix timestamp')
      }

      const timestamp = parseInt(unixTimestamp)
      if (isNaN(timestamp)) {
        throw new Error('Invalid timestamp: must be a number')
      }

      // Validate timestamp range (reasonable limits)
      const minTimestamp = -2208988800 // Year 1900
      const maxTimestamp = 253402300799 // Year 9999
      
      if (timestamp < minTimestamp || timestamp > maxTimestamp) {
        throw new Error(`Timestamp out of valid range (${minTimestamp} to ${maxTimestamp})`)
      }

      const date = new Date(timestamp * 1000)
      if (isNaN(date.getTime())) {
        throw new Error('Invalid timestamp: cannot convert to date')
      }

      setDateTime(date.toISOString().slice(0, 19).replace('T', ' '))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error converting timestamp'
      setError(errorMessage)
    }
  }

  const convertToTimestamp = () => {
    try {
      const date = new Date(dateTime)
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date format')
      }

      const timestamp = Math.floor(date.getTime() / 1000)
      setUnixTimestamp(timestamp.toString())
    } catch (err) {
      console.error('Error converting date:', err)
    }
  }

  const getCurrentTimestamp = () => {
    const now = Math.floor(Date.now() / 1000)
    setUnixTimestamp(now.toString())
    const date = new Date(now * 1000)
    setDateTime(date.toISOString().slice(0, 19).replace('T', ' '))
  }

  const clearAll = () => {
    setUnixTimestamp('')
    setDateTime('')
    setError('')
  }

  const currentTimestamp = Math.floor(currentTime.getTime() / 1000)

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Timestamp Converter</h1>
          <p className="text-muted-foreground">
            Convert between Unix timestamps and human-readable dates instantly.
          </p>
        </div>

        {/* Current Time Display */}
        <div className="mb-8 p-6 bg-muted/50 rounded-lg text-center">
          <h2 className="text-lg font-semibold mb-2">Current Time</h2>
          <p className="text-2xl font-mono mb-2">
            {currentTime.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">
            Unix Timestamp: <span className="font-mono">{currentTimestamp}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Unix Timestamp Input */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Unix Timestamp</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={unixTimestamp}
                onChange={(e) => setUnixTimestamp(e.target.value)}
                placeholder="Enter Unix timestamp..."
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
              />
              <Button onClick={convertToDateTime} className="w-full">
                Convert to Date/Time
              </Button>
              {unixTimestamp && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Milliseconds: <span className="font-mono">{parseInt(unixTimestamp) * 1000}</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Date/Time Input */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Date/Time</h2>
            <div className="space-y-4">
              <input
                type="datetime-local"
                value={dateTime ? dateTime.slice(0, 16) : ''}
                onChange={(e) => setDateTime(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Button onClick={convertToTimestamp} className="w-full">
                Convert to Timestamp
              </Button>
              {dateTime && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    ISO Format: <span className="font-mono">{dateTime}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">
              <strong>Timestamp Conversion Error:</strong> {error}
            </p>
            <p className="text-destructive text-xs mt-2">
              Please check your input format. Unix timestamps should be numbers, dates should be in valid format.
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Button variant="outline" onClick={getCurrentTimestamp}>
            Use Current Time
          </Button>
          <Button variant="outline" onClick={clearAll}>
            Clear All
          </Button>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Real-time Updates</h3>
            <p className="text-sm text-muted-foreground">
              Shows current time and updates every second
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Multiple Formats</h3>
            <p className="text-sm text-muted-foreground">
              Supports Unix timestamp and ISO date formats
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Instant Conversion</h3>
            <p className="text-sm text-muted-foreground">
              Convert between formats with a single click
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
