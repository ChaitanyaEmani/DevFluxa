'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import {
  toDateTimeLocalValue,
  toDisplayString,
  convertUnixToDateTimeLocal,
  convertDateTimeLocalToUnix,
  getCurrentUnixTimestamp,
  getCurrentDateTimeLocal,
  validateUnixTimestamp,
  validateDateTimeLocal
} from '@/lib/converters/timestamp'

export function TimestampConverter() {
  const [unixTimestamp, setUnixTimestamp] = useState('')
  // Store datetime-local value in its native format: "YYYY-MM-DDTHH:mm"
  const [dateTimeLocal, setDateTimeLocal] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [error, setError] = useState('')

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const convertToDateTime = () => {
    setError('')
    const validation = validateUnixTimestamp(unixTimestamp)
    
    if (!validation.isValid) {
      setError(validation.error!)
      return
    }

    const dateTimeLocalValue = convertUnixToDateTimeLocal(unixTimestamp)
    if (dateTimeLocalValue) {
      setDateTimeLocal(dateTimeLocalValue)
    }
  }

  const convertToTimestamp = () => {
    setError('')
    const validation = validateDateTimeLocal(dateTimeLocal)
    
    if (!validation.isValid) {
      setError(validation.error!)
      return
    }

    const timestamp = convertDateTimeLocalToUnix(dateTimeLocal)
    if (timestamp) {
      setUnixTimestamp(timestamp)
    }
  }

  const getCurrentTimestamp = () => {
    setError('')
    const timestamp = getCurrentUnixTimestamp()
    const dateTimeLocalValue = getCurrentDateTimeLocal()
    
    setUnixTimestamp(timestamp)
    setDateTimeLocal(dateTimeLocalValue)
  }

  const clearAll = () => {
    setUnixTimestamp('')
    setDateTimeLocal('')
    setError('')
  }

  const currentTimestamp = Math.floor(currentTime.getTime() / 1000)

  // Only compute milliseconds display when the input is a valid number
  const parsedTs = Number(unixTimestamp)
  const msDisplay =
    unixTimestamp.trim() !== '' && Number.isFinite(parsedTs)
      ? parsedTs * 1000
      : null

  // Derive a human-readable ISO label from the datetime-local value
  const dateDisplayLabel = dateTimeLocal
    ? toDisplayString(new Date(dateTimeLocal))
    : null

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
            Unix Timestamp:{' '}
            <span className="font-mono">{currentTimestamp}</span>
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
                onChange={(e) => {
                  setUnixTimestamp(e.target.value)
                  setError('')
                }}
                placeholder="Enter Unix timestamp…"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
              />
              <Button onClick={convertToDateTime} className="w-full">
                Convert to Date / Time ↓
              </Button>
              {msDisplay !== null && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Milliseconds:{' '}
                    <span className="font-mono">{msDisplay.toLocaleString()}</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Date/Time Input */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Date / Time</h2>
            <div className="space-y-4">
              <input
                type="datetime-local"
                value={dateTimeLocal}
                onChange={(e) => {
                  setDateTimeLocal(e.target.value)
                  setError('')
                }}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Button onClick={convertToTimestamp} className="w-full">
                Convert to Timestamp ↑
              </Button>
              {dateDisplayLabel && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Local time:{' '}
                    <span className="font-mono">{dateDisplayLabel}</span>
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
              <strong>Error:</strong> {error}
            </p>
            <p className="text-destructive text-xs mt-1">
              Unix timestamps must be integers. Use the date picker for the date/time side.
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
              Shows current time and updates every second.
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Multiple Formats</h3>
            <p className="text-sm text-muted-foreground">
              Supports Unix timestamp and local date/time formats.
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Instant Conversion</h3>
            <p className="text-sm text-muted-foreground">
              Convert between formats with a single click.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}