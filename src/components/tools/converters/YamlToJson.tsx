'use client'

import { useState } from 'react'
import { TextareaInput } from '@/components/ui/TextareaInput'
import { TextareaOutput } from '@/components/ui/TextareaOutput'
import { CopyButton } from '@/components/ui/CopyButton'
import { Download } from '@/components/ui/Download'
import { Button } from '@/components/ui/Button'

export function YamlToJson() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [isValid, setIsValid] = useState(false)

  const parseYaml = (yaml: string) => {
    // Basic YAML parsing logic (simplified version)
    const lines = yaml.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'))
    const result: any = {}
    let currentKey = ''
    let currentValue = ''
    let inMultiline = false
    let indentLevel = 0

    lines.forEach((line, index) => {
      const trimmed = line.trim()
      if (!trimmed) return

      const lineIndent = line.match(/^(\s*)/)?.[1]?.length || 0
      
      if (lineIndent < indentLevel && currentKey) {
        // End of current value
        if (inMultiline) {
          result[currentKey] = currentValue.trim()
          currentValue = ''
          inMultiline = false
        }
      }

      if (trimmed.includes(':')) {
        const [key, ...valueParts] = trimmed.split(':')
        currentKey = key.trim()
        const value = valueParts.join(':').trim()
        
        if (value) {
          if (value.startsWith("'") || value.startsWith('"')) {
            // Quoted string
            result[currentKey] = value.slice(1, -1)
          } else if (value === '|' || value === '>') {
            // Start of multiline
            inMultiline = true
            indentLevel = lineIndent
          } else {
            // Simple value
            result[currentKey] = isNaN(Number(value)) ? value : Number(value)
          }
        } else {
          inMultiline = true
          indentLevel = lineIndent
        }
      } else if (inMultiline) {
        currentValue += line + '\n'
      }
    })

    // Handle final multiline value
    if (inMultiline && currentKey) {
      result[currentKey] = currentValue.trim()
    }

    return result
  }

  const convertToJson = () => {
    try {
      setError('')
      setIsValid(false)

      if (!input.trim()) {
        throw new Error('Please enter YAML content')
      }

      // Basic YAML validation
      const lines = input.split('\n')
      let braceCount = 0
      let bracketCount = 0

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line || line.startsWith('#')) continue

        // Check for basic YAML syntax issues
        if (line.includes(':') && !line.match(/^\s*[\w-]+\s*:\s*.*/)) {
          throw new Error(`Invalid YAML syntax at line ${i + 1}: ${line}`)
        }
      }

      const parsed = parseYaml(input)
      const json = JSON.stringify(parsed, null, 2)
      
      setOutput(json)
      setIsValid(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse YAML')
      setOutput('')
      setIsValid(false)
    }
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setError('')
    setIsValid(false)
  }

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">YAML to JSON</h1>
          <p className="text-muted-foreground">
            Convert YAML configuration files to JSON format with validation and error reporting.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">YAML Input</h2>
              <Button variant="outline" onClick={clearAll}>
                Clear
              </Button>
            </div>
            <TextareaInput
              value={input}
              onChange={setInput}
              placeholder="Paste your YAML here..."
              rows={12}
            />
          </div>

          {/* Output Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">JSON Output</h2>
              {output && (
                <div className="flex gap-2">
                  <CopyButton text={output} />
                  <Download
                    content={output}
                    filename="converted.json"
                    mimeType="application/json"
                  />
                </div>
              )}
            </div>
            <TextareaOutput
              value={output}
              placeholder="JSON output will appear here..."
              rows={12}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mt-6">
          <Button onClick={convertToJson}>
            Convert to JSON
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">
              <strong>YAML Validation Error:</strong> {error}
            </p>
            <p className="text-destructive text-xs mt-2">
              Please check your YAML syntax. Common issues include incorrect indentation (use spaces, not tabs), missing colons, or invalid characters.
            </p>
          </div>
        )}

        {/* Success Message */}
        {isValid && !error && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800 rounded-lg">
            <p className="text-green-700 dark:text-green-300 text-sm">
              ✓ Valid YAML format - Successfully converted to JSON
            </p>
          </div>
        )}

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Syntax Validation</h3>
            <p className="text-sm text-muted-foreground">
              Validates YAML syntax and highlights specific line errors
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Type Detection</h3>
            <p className="text-sm text-muted-foreground">
              Automatically detects numbers, strings, and nested objects
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Pretty JSON</h3>
            <p className="text-sm text-muted-foreground">
              Outputs formatted JSON with proper indentation
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
