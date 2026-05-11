"use client"

import { useState, useEffect, useMemo } from "react"
import { CodeEditor } from "@/components/ui/CodeEditor"
import { CopyButton } from "@/components/ui/CopyButton"
import { Button } from "@/components/ui/Button"
import { Header } from "@/components/ui/Header"

interface RegexMatch {
  match: string
  index: number
  groups: string[]
  start: number
  end: number
}

interface RegexTestResult {
  matches: RegexMatch[]
  isValid: boolean
  error?: string
  flags: {
    global: boolean
    ignoreCase: boolean
    multiline: boolean
    dotAll: boolean
    unicode: boolean
    sticky: boolean
  }
}

export function RegexTester() {
  const [pattern, setPattern] = useState("")
  const [testString, setTestString] = useState("")
  const [flags, setFlags] = useState({
    g: true,
    i: false,
    m: false,
    s: false,
    u: false,
    y: false
  })
  const [result, setResult] = useState<RegexTestResult | null>(null)

  const testRegex = useMemo(() => {
    if (!pattern) return null
    
    try {
      const flagString = Object.entries(flags)
        .filter(([_, enabled]) => enabled)
        .map(([flag, _]) => flag)
        .join('')
      
      const regex = new RegExp(pattern, flagString)
      
      const matches: RegexMatch[] = []
      let match: RegExpExecArray | null
      
      if (flags.g) {
        while ((match = regex.exec(testString)) !== null) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            start: match.index,
            end: match.index + match[0].length
          })
          
          if (!flags.g) break
        }
      } else {
        match = regex.exec(testString)
        if (match) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            start: match.index,
            end: match.index + match[0].length
          })
        }
      }
      
      return {
        matches,
        isValid: true,
        flags: {
          global: flags.g,
          ignoreCase: flags.i,
          multiline: flags.m,
          dotAll: flags.s,
          unicode: flags.u,
          sticky: flags.y
        }
      }
    } catch (error) {
      return {
        matches: [],
        isValid: false,
        error: error instanceof Error ? error.message : 'Invalid regex pattern',
        flags: {
          global: flags.g,
          ignoreCase: flags.i,
          multiline: flags.m,
          dotAll: flags.s,
          unicode: flags.u,
          sticky: flags.y
        }
      }
    }
  }, [pattern, testString, flags])

  useEffect(() => {
    setResult(testRegex)
  }, [testRegex])

  const getHighlightedText = () => {
    if (!result || !result.isValid || result.matches.length === 0) {
      return testString
    }

    let highlighted = testString
    const matches = [...result.matches].reverse() // Process from end to start
    
    matches.forEach((match, index) => {
      const before = highlighted.substring(0, match.start)
      const highlightedMatch = `<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">${match.match}</mark>`
      const after = highlighted.substring(match.end)
      highlighted = before + highlightedMatch + after
    })
    
    return highlighted
  }

  const commonPatterns = [
    { name: "Email", pattern: "^[\\w.-]+@[\\w.-]+\\.\\w+$" },
    { name: "Phone (US)", pattern: "^(\\+1[-.\\s]?)?\\(?([0-9]{3})\\)?[-.\\s]?([0-9]{3})[-.\\s]?([0-9]{4})$" },
    { name: "URL", pattern: "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)" },
    { name: "IPv4", pattern: "^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$" },
    { name: "Hex Color", pattern: "^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$" },
    { name: "Username", pattern: "^[a-zA-Z0-9_]{3,20}$" }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header
        toolTitle="Regex Tester"
        toolDescription="Test and debug regular expressions with real-time matching and highlighting"
      />

      <div className="container py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Common Patterns */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Common Patterns</h3>
            <div className="flex flex-wrap gap-2">
              {commonPatterns.map((commonPattern) => (
                <Button
                  key={commonPattern.name}
                  variant="outline"
                  size="sm"
                  onClick={() => setPattern(commonPattern.pattern)}
                  className="text-xs"
                >
                  {commonPattern.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Pattern Input */}
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium">Regular Expression Pattern</label>
              <div className="flex items-center gap-2">
                {result && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    result.isValid 
                      ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' 
                      : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {result.isValid ? "Valid" : "Invalid"}
                  </span>
                )}
                {pattern && <CopyButton text={pattern} />}
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter your regex pattern here..."
                className="w-full px-4 py-3 border rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {result?.error && (
                <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                  {result.error}
                </div>
              )}
            </div>

            {/* Flags */}
            <div className="mt-4">
              <label className="text-sm font-medium mb-2 block">Flags</label>
              <div className="flex flex-wrap gap-3">
                {Object.entries({
                  g: "Global (g)",
                  i: "Ignore Case (i)",
                  m: "Multiline (m)",
                  s: "Dot All (s)",
                  u: "Unicode (u)",
                  y: "Sticky (y)"
                }).map(([flag, label]) => (
                  <label key={flag} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={flags[flag as keyof typeof flags]}
                      onChange={(e) => setFlags(prev => ({ ...prev, [flag]: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Test String */}
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium">Test String</label>
              <CopyButton text={testString} />
            </div>
            <textarea
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="Enter text to test against the regex pattern..."
              className="w-full h-32 px-4 py-3 border rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Results */}
          {result && result.isValid && (
            <div className="space-y-6">
              {/* Highlighted Matches */}
              {result.matches.length > 0 && (
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Highlighted Matches</h3>
                  <div 
                    className="p-4 bg-muted rounded-md font-mono text-sm whitespace-pre-wrap break-words"
                    dangerouslySetInnerHTML={{ __html: getHighlightedText() }}
                  />
                </div>
              )}

              {/* Match Details */}
              <div className="bg-card border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    Match Details {result.matches.length > 0 && `(${result.matches.length})`}
                  </h3>
                  {result.matches.length > 0 && (
                    <CopyButton 
                      text={JSON.stringify(result.matches.map(m => m.match), null, 2)} 
                    />
                  )}
                </div>
                
                {result.matches.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No matches found
                  </p>
                ) : (
                  <div className="space-y-3">
                    {result.matches.map((match, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-muted/30">
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-medium text-sm">Match {index + 1}</span>
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 rounded-full">
                            Position: {match.index} - {match.end}
                          </span>
                        </div>
                        <div className="font-mono text-sm bg-background p-2 rounded border">
                          {match.match}
                        </div>
                        {match.groups.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs font-medium text-muted-foreground">Groups:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {match.groups.map((group, groupIndex) => (
                                <span key={groupIndex} className="inline-block px-2 py-1 bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-300 text-xs rounded-full">
                                  {group || "(empty)"}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Statistics */}
              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{result.matches.length}</div>
                    <div className="text-sm text-muted-foreground">Total Matches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{testString.length}</div>
                    <div className="text-sm text-muted-foreground">Text Length</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{pattern.length}</div>
                    <div className="text-sm text-muted-foreground">Pattern Length</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {Object.values(result.flags).filter(Boolean).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Active Flags</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}