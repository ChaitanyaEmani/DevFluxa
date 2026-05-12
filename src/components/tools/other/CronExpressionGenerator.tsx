"use client"

import { useState } from "react"
import { CopyButton } from "@/components/ui/CopyButton"
import { Button } from "@/components/ui/Button"
import { Header } from "@/components/ui/Header"

interface CronParts {
  minute: string
  hour: string
  day: string
  month: string
  weekday: string
}

interface CronPreset {
  name: string
  description: string
  expression: string
}

const cronPresets: CronPreset[] = [
  { name: 'Every Minute', description: 'Runs every minute', expression: '* * * * * *' },
  { name: 'Every Hour', description: 'Runs at the beginning of every hour', expression: '0 * * * * *' },
  { name: 'Every Day at Midnight', description: 'Runs every day at midnight', expression: '0 0 * * *' },
  { name: 'Every Day at Noon', description: 'Runs every day at 12:00 PM', expression: '0 12 * * *' },
  { name: 'Every Monday', description: 'Runs every Monday at midnight', expression: '0 0 * * 1' },
  { name: 'Every Weekday', description: 'Runs Monday through Friday at 9:00 AM', expression: '0 9 * * 1-5' },
  { name: 'Every Weekend', description: 'Runs Saturday and Sunday at 10:00 AM', expression: '0 10 * * 6,0' },
  { name: 'First Day of Month', description: 'Runs on the 1st of every month at midnight', expression: '0 0 1 * *' },
  { name: 'Last Day of Month', description: 'Runs on the last day of every month at midnight', expression: '0 0 L * *' },
  { name: 'Every 15 Minutes', description: 'Runs every 15 minutes', expression: '*/15 * * * * *' },
  { name: 'Every 30 Minutes', description: 'Runs every 30 minutes', expression: '*/30 * * * * *' },
  { name: 'Every 2 Hours', description: 'Runs every 2 hours', expression: '0 */2 * * * *' },
  { name: 'Every 6 Hours', description: 'Runs every 6 hours', expression: '0 */6 * * * *' },
  { name: 'Business Hours', description: 'Runs Monday to Friday, 9 AM to 5 PM, every hour', expression: '0 9-17 * * 1-5' }
]

function generateCronExpression(parts: CronParts): string {
  return `${parts.minute} ${parts.hour} ${parts.day} ${parts.month} ${parts.weekday}`
}

function parseCronExpression(expression: string): CronParts {
  const parts = expression.trim().split(/\s+/)
  return {
    minute: parts[0] || '*',
    hour: parts[1] || '*',
    day: parts[2] || '*',
    month: parts[3] || '*',
    weekday: parts[4] || '*'
  }
}

function getCronDescription(expression: string): string {
  const parts = parseCronExpression(expression)
  
  try {
    // Simple description generation
    if (parts.minute === '*' && parts.hour === '*' && parts.day === '*' && parts.month === '*' && parts.weekday === '*') {
      return 'Runs every minute'
    }
    
    if (parts.minute === '0' && parts.hour === '*' && parts.day === '*' && parts.month === '*' && parts.weekday === '*') {
      return 'Runs every hour at minute 0'
    }
    
    if (parts.minute === '0' && parts.hour === '0' && parts.day === '*' && parts.month === '*' && parts.weekday === '*') {
      return 'Runs every day at midnight'
    }
    
    if (parts.minute === '0' && parts.hour === '9' && parts.day === '*' && parts.month === '*' && parts.weekday === '1-5') {
      return 'Runs Monday to Friday at 9:00 AM'
    }
    
    if (parts.minute === '0' && parts.hour === '0' && parts.day === '1' && parts.month === '*' && parts.weekday === '*') {
      return 'Runs on the 1st of every month at midnight'
    }
    
    // More complex patterns
    let description = 'Runs '
    
    if (parts.minute !== '*') {
      description += `at minute ${parts.minute} `
    }
    
    if (parts.hour !== '*') {
      if (parts.hour.includes('-')) {
        description += `between hours ${parts.hour} `
      } else if (parts.hour.includes('/')) {
        const interval = parts.hour.split('/')[1]
        description += `every ${interval} hours `
      } else {
        description += `at hour ${parts.hour} `
      }
    }
    
    if (parts.day !== '*') {
      if (parts.day === 'L') {
        description += 'on the last day of the month '
      } else if (parts.day.includes('-')) {
        description += `on days ${parts.day} `
      } else {
        description += `on day ${parts.day} `
      }
    }
    
    if (parts.weekday !== '*') {
      if (parts.weekday.includes('-')) {
        description += `on weekdays ${parts.weekday} `
      } else if (parts.weekday.includes(',')) {
        description += `on weekdays ${parts.weekday} `
      } else {
        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const dayIndex = parseInt(parts.weekday)
        if (!isNaN(dayIndex) && dayIndex >= 0 && dayIndex <= 6) {
          description += `on ${weekdays[dayIndex]} `
        } else {
          description += `on weekday ${parts.weekday} `
        }
      }
    }
    
    if (parts.month !== '*') {
      description += `in month ${parts.month} `
    }
    
    return description.trim() || 'Complex cron expression'
  } catch {
    return 'Complex cron expression'
  }
}

export function CronExpressionGenerator() {
  const [cronParts, setCronParts] = useState<CronParts>({
    minute: '*',
    hour: '*',
    day: '*',
    month: '*',
    weekday: '*'
  })
  
  const [customExpression, setCustomExpression] = useState('')
  const [generatedExpression, setGeneratedExpression] = useState('')
  const [useAdvanced, setUseAdvanced] = useState(false)

  const handlePartChange = (part: keyof CronParts, value: string) => {
    setCronParts(prev => ({ ...prev, [part]: value }))
  }

  const generateFromParts = () => {
    const expression = generateCronExpression(cronParts)
    setGeneratedExpression(expression)
  }

  const applyPreset = (preset: CronPreset) => {
    const parts = parseCronExpression(preset.expression)
    setCronParts(parts)
    setGeneratedExpression(preset.expression)
  }

  const clearAll = () => {
    setCronParts({
      minute: '*',
      hour: '*',
      day: '*',
      month: '*',
      weekday: '*'
    })
    setCustomExpression('')
    setGeneratedExpression('')
  }

  const currentExpression = useAdvanced ? customExpression : generateCronExpression(cronParts)
  const currentDescription = useAdvanced ? getCronDescription(customExpression) : getCronDescription(currentExpression)

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <Header 
          toolTitle="Cron Expression Generator" 
          toolDescription="Generate and validate cron expressions with visual builder and common presets." 
        />

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => setUseAdvanced(!useAdvanced)} 
              variant={useAdvanced ? "default" : "outline"}
              className="shadow-sm hover:shadow-md transition-all duration-200"
            >
              <span className="mr-2">{useAdvanced ? '🎛️' : '🔧'}</span>
              {useAdvanced ? 'Simple Mode' : 'Advanced Mode'}
            </Button>
            {!useAdvanced && (
              <Button onClick={generateFromParts} className="shadow-sm hover:shadow-md transition-all duration-200">
                <span className="mr-2">⚡</span>Generate Expression
              </Button>
            )}
          </div>
          
          <Button variant="outline" onClick={clearAll} className="ml-auto shadow-sm hover:shadow-md transition-all duration-200 text-destructive hover:bg-destructive/5">
            <span className="mr-2">🗑️</span>Clear
          </Button>
        </div>

        {/* Presets */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Common Presets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {cronPresets.map((preset, index) => (
              <button
                key={index}
                onClick={() => applyPreset(preset)}
                className="p-3 text-left border border-border/50 rounded-lg bg-background/50 hover:border-primary/30 transition-all duration-200 hover:shadow-md"
              >
                <div className="font-medium text-sm">{preset.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{preset.description}</div>
                <div className="text-xs font-mono text-primary mt-2">{preset.expression}</div>
              </button>
            ))}
          </div>
        </div>

        {!useAdvanced ? (
          /* Visual Builder */
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Visual Builder</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Minute (0-59)</label>
                <input
                  type="text"
                  value={cronParts.minute}
                  onChange={(e) => handlePartChange('minute', e.target.value)}
                  placeholder="* or 0-59"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="text-xs text-muted-foreground">
                  * = every minute, */5 = every 5 minutes, 0,15,30,45 = specific minutes
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Hour (0-23)</label>
                <input
                  type="text"
                  value={cronParts.hour}
                  onChange={(e) => handlePartChange('hour', e.target.value)}
                  placeholder="* or 0-23"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="text-xs text-muted-foreground">
                  * = every hour, 9-17 = 9 AM to 5 PM, */2 = every 2 hours
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Day (1-31)</label>
                <input
                  type="text"
                  value={cronParts.day}
                  onChange={(e) => handlePartChange('day', e.target.value)}
                  placeholder="* or 1-31"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="text-xs text-muted-foreground">
                  * = every day, 1,15 = 1st and 15th, L = last day of month
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Month (1-12)</label>
                <input
                  type="text"
                  value={cronParts.month}
                  onChange={(e) => handlePartChange('month', e.target.value)}
                  placeholder="* or 1-12"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="text-xs text-muted-foreground">
                  * = every month, 1,6,12 = Jan, Jun, Dec
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Weekday (0-7)</label>
                <input
                  type="text"
                  value={cronParts.weekday}
                  onChange={(e) => handlePartChange('weekday', e.target.value)}
                  placeholder="* or 0-7 (0=Sunday, 1=Monday...)"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="text-xs text-muted-foreground">
                  * = every day, 1-5 = Monday to Friday, 0,6 = Sunday and Saturday
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Advanced Mode */
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Advanced Mode</h3>
            <div>
              <label className="block text-sm font-medium mb-2">Cron Expression</label>
              <input
                type="text"
                value={customExpression}
                onChange={(e) => setCustomExpression(e.target.value)}
                placeholder="* * * * *"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="text-xs text-muted-foreground mt-2">
                Enter cron expression manually. Format: minute hour day month weekday
              </div>
            </div>
          </div>
        )}

        {/* Generated Expression */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Generated Expression</h3>
            <CopyButton text={currentExpression} />
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="p-4 border-2 border-border/50 rounded-lg bg-background/50 backdrop-blur-sm">
              <div className="text-2xl font-mono text-center mb-4">
                {currentExpression}
              </div>
              <div className="text-sm text-muted-foreground text-center">
                {currentDescription}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Visual Builder', desc: 'Build cron expressions with easy-to-use controls.', icon: '🔧' },
              { title: 'Common Presets', desc: 'Quick-start with frequently used cron patterns.', icon: '⚡' },
              { title: 'Real-time Preview', desc: 'See your cron expression as you build it.', icon: '👁️' },
              { title: 'Expression Description', desc: 'Human-readable description of your cron expression.', icon: '📝' },
              { title: 'Copy Function', desc: 'One-click copy of generated expressions.', icon: '📋' },
              { title: 'Advanced Mode', desc: 'Direct input for complex cron expressions.', icon: '🎛️' },
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

        <div className="mt-12 p-6 bg-muted/30 rounded-lg border">
          <h3 className="text-lg font-semibold mb-3">Cron Expression Reference</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium mb-2">Field Format</h4>
              <code className="block p-2 bg-background rounded text-xs">minute hour day month weekday</code>
            </div>
            <div>
              <h4 className="font-medium mb-2">Special Characters</h4>
              <ul className="space-y-1 text-xs">
                <li><code>*</code> = any value</li>
                <li><code>,</code> = list of values</li>
                <li><code>-</code> = range of values</li>
                <li><code>/</code> = step values</li>
                <li><code>L</code> = last (day of month, weekday)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
