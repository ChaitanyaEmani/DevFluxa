"use client"

import { useState } from "react"
import { CopyButton } from "@/components/ui/CopyButton"
import { Button } from "@/components/ui/Button"
import { Header } from "@/components/ui/Header"
import { DateDifference, TimeSegment, calculateDateDifference, formatDate, formatDateTimeLocal } from "@/lib/converters/date"


export function DateDifferenceCalculator() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [difference, setDifference] = useState<DateDifference | null>(null)
  const [isStartBeforeEnd, setIsStartBeforeEnd] = useState(true)

  const calculateDifference = () => {
    if (!startDate || !endDate) {
      setDifference(null)
      return
    }
    
    const start = formatDateTimeLocal(startDate)
    const end = formatDateTimeLocal(endDate)
    
    const diff = calculateDateDifference(start, end)
    setDifference(diff)
    setIsStartBeforeEnd(start <= end)
  }

  const swapDates = () => {
    setStartDate(endDate)
    setEndDate(startDate)
  }

  const clearAll = () => {
    setStartDate('')
    setEndDate('')
    setDifference(null)
  }

  const setToNow = (type: 'start' | 'end') => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const localDateTime = `${year}-${month}-${day}T${hours}:${minutes}`
    
    if (type === 'start') {
      setStartDate(localDateTime)
    } else {
      setEndDate(localDateTime)
    }
  }

  const getTimeSegments = (): TimeSegment[] => {
    if (!difference) return []
    
    const segments: TimeSegment[] = []
    
    if (difference.years > 0) {
      segments.push({ label: 'Years', value: difference.years, unit: 'year' })
    }
    if (difference.months > 0) {
      segments.push({ label: 'Months', value: difference.months, unit: 'month' })
    }
    if (difference.days > 0) {
      segments.push({ label: 'Days', value: difference.days, unit: 'day' })
    }
    if (difference.hours > 0) {
      segments.push({ label: 'Hours', value: difference.hours, unit: 'hour' })
    }
    if (difference.minutes > 0) {
      segments.push({ label: 'Minutes', value: difference.minutes, unit: 'minute' })
    }
    if (difference.seconds > 0 || difference.milliseconds > 0) {
      segments.push({ label: 'Seconds', value: difference.seconds, unit: 'second' })
    }
    
    return segments
  }

  const formatResult = (segment: TimeSegment): string => {
    return `${segment.value} ${segment.value === 1 ? segment.unit : segment.unit + 's'}`
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <Header 
          toolTitle="Date Difference Calculator" 
          toolDescription="Calculate the difference between two dates in various time units." 
        />

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <Button onClick={calculateDifference} className="shadow-sm hover:shadow-md transition-all duration-200">
              <span className="mr-2">📅</span>Calculate Difference
            </Button>
            <Button variant="outline" onClick={swapDates} className="shadow-sm hover:shadow-md transition-all duration-200">
              <span className="mr-2">🔄</span>Swap Dates
            </Button>
          </div>
          
          <div className="flex gap-2 ml-auto">
            <Button 
              variant="outline" 
              onClick={() => setToNow('start')} 
              className="shadow-sm hover:shadow-md transition-all duration-200"
            >
              <span className="mr-2">⏰</span>Start Now
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setToNow('end')} 
              className="shadow-sm hover:shadow-md transition-all duration-200"
            >
              <span className="mr-2">⏰</span>End Now
            </Button>
            <Button variant="outline" onClick={clearAll} className="shadow-sm hover:shadow-md transition-all duration-200 text-destructive hover:bg-destructive/5">
              <span className="mr-2">🗑️</span>Clear
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Start Date */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Start Date</h3>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-border/50 rounded-lg bg-background/50 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">End Date</h3>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-border/50 rounded-lg bg-background/50 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {difference && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Time Difference {isStartBeforeEnd ? '(End - Start)' : '(Start - End)'}
              </h3>
              <CopyButton text={getTimeSegments().map(s => formatResult(s)).join(', ')} />
            </div>
            
            {/* Main Result Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getTimeSegments().map((segment, index) => (
                <div key={index} className="p-4 bg-background/50 border border-border/50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {segment.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {segment.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {segment.value === 1 ? segment.unit : segment.unit + 's'}
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Breakdown */}
            <div className="p-6 bg-muted/30 rounded-lg border">
              <h4 className="text-lg font-semibold mb-4">Detailed Breakdown</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Days:</span>
                    <span className="font-medium">{difference.totalDays.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Hours:</span>
                    <span className="font-medium">{difference.totalHours.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Minutes:</span>
                    <span className="font-medium">{difference.totalMinutes.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Seconds:</span>
                    <span className="font-medium">{difference.totalSeconds.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Milliseconds:</span>
                    <span className="font-medium">{difference.milliseconds.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Direction:</span>
                    <span className="font-medium">
                      {isStartBeforeEnd ? 'Forward in time' : 'Backward in time'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!difference && (startDate || endDate) && (
          <div className="mt-8 text-center py-12 text-muted-foreground">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2">Select Both Dates</h3>
            <p className="text-sm mb-4">Choose start and end dates to calculate the time difference</p>
            <Button onClick={calculateDifference} className="shadow-sm hover:shadow-md transition-all duration-200">
              <span className="mr-2">📅</span>Calculate Difference
            </Button>
          </div>
        )}

        {/* Complete Empty State */}
        {!difference && !startDate && !endDate && (
          <div className="mt-8 text-center py-12 text-muted-foreground">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2">Ready to Calculate</h3>
            <p className="text-sm mb-4">Select two dates to calculate the time difference between them</p>
            <div className="flex gap-2 justify-center">
              <Button 
                onClick={() => setToNow('start')} 
                className="shadow-sm hover:shadow-md transition-all duration-200"
              >
                <span className="mr-2">⏰</span>Use Now as Start
              </Button>
              <Button 
                onClick={() => setToNow('end')} 
                className="shadow-sm hover:shadow-md transition-all duration-200"
              >
                <span className="mr-2">⏰</span>Use Now as End
              </Button>
            </div>
          </div>
        )}

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Multiple Units', desc: 'Calculate difference in years, months, days, hours, minutes, and seconds.', icon: '⏱️' },
              { title: 'Detailed Breakdown', desc: 'View total days, hours, minutes, and seconds.', icon: '📊' },
              { title: 'Quick Actions', desc: 'Set dates to current time or swap them instantly.', icon: '⚡' },
              { title: 'Copy Results', desc: 'Copy calculated difference to clipboard.', icon: '📋' },
              { title: 'Visual Feedback', desc: 'Clear display of time difference with large numbers.', icon: '👁️' },
              { title: 'Precise Calculation', desc: 'Includes milliseconds for precise time differences.', icon: '🎯' },
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
