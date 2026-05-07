'use client'

import { useState } from 'react'
import { TextareaInput } from '@/components/ui/TextareaInput'
import { TextareaOutput } from '@/components/ui/TextareaOutput'
import { CopyButton } from '@/components/ui/CopyButton'
import { Download } from '@/components/ui/Download'
import { Button } from '@/components/ui/Button'

export function JsonFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [isValid, setIsValid] = useState(false)

  const formatJson = () => {
    try {
      if (!input.trim()) {
        throw new Error('Please enter JSON content to format')
      }

      // Basic JSON syntax validation before parsing
      const lines = input.split('\n')
      let braceCount = 0
      let bracketCount = 0
      let inString = false
      let escapeNext = false

      for (let i = 0; i < input.length; i++) {
        const char = input[i]
        
        if (escapeNext) {
          escapeNext = false
          continue
        }
        
        if (char === '\\') {
          escapeNext = true
          continue
        }
        
        if (char === '"' && !escapeNext) {
          inString = !inString
          continue
        }
        
        if (inString) continue
        
        if (char === '{') braceCount++
        else if (char === '}') braceCount--
        else if (char === '[') bracketCount++
        else if (char === ']') bracketCount--
        
        if (braceCount < 0 || bracketCount < 0) {
          throw new Error(`Unexpected closing bracket at position ${i}`)
        }
      }

      if (braceCount !== 0) {
        throw new Error(`Unclosed braces: ${braceCount > 0 ? braceCount + ' opening braces' : Math.abs(braceCount) + ' closing braces'} missing`)
      }

      if (bracketCount !== 0) {
        throw new Error(`Unclosed brackets: ${bracketCount > 0 ? bracketCount + ' opening brackets' : Math.abs(bracketCount) + ' closing brackets'} missing`)
      }

      if (inString) {
        throw new Error('Unclosed string literal')
      }

      const parsed = JSON.parse(input)
      const formatted = JSON.stringify(parsed, null, 2)
      setOutput(formatted)
      setError('')
      setIsValid(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid JSON format'
      setError(errorMessage)
      setOutput('')
      setIsValid(false)
    }
  }

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(input)
      const minified = JSON.stringify(parsed)
      setOutput(minified)
      setError('')
      setIsValid(true)
    } catch (err) {
      setError('Invalid JSON format')
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
            <h1 className="text-3xl font-bold mb-4">JSON Formatter</h1>
            <p className="text-muted-foreground">
              Format, validate, and minify JSON data with proper indentation and syntax highlighting.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Input JSON</h2>
                <Button variant="outline" onClick={clearAll}>
                  Clear
                </Button>
              </div>
              <TextareaInput
                value={input}
                onChange={setInput}
                placeholder="Paste your JSON here..."
                rows={12}
              />
            </div>

            {/* Output Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Formatted Output</h2>
                {output && (
                  <div className="flex gap-2">
                    <CopyButton text={output} />
                    <Download
                      content={output}
                      filename="formatted.json"
                      mimeType="application/json"
                    />
                  </div>
                )}
              </div>
              <TextareaOutput
                value={output}
                placeholder="Formatted JSON will appear here..."
                rows={12}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mt-6">
            <Button onClick={formatJson}>
              Format JSON
            </Button>
            <Button variant="outline" onClick={minifyJson}>
              Minify JSON
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive text-sm">
                <strong>JSON Validation Error:</strong> {error}
              </p>
              <p className="text-destructive text-xs mt-2">
                Please check your JSON syntax and try again. Common issues include missing commas, unclosed brackets, or trailing commas.
              </p>
            </div>
          )}

          {/* Success Message */}
          {isValid && !error && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800 rounded-lg">
              <p className="text-green-700 dark:text-green-300 text-sm">
                ✓ Valid JSON format
              </p>
            </div>
          )}

          {/* Features */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Syntax Validation</h3>
              <p className="text-sm text-muted-foreground">
                Automatically validates JSON syntax and highlights any errors
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Pretty Print</h3>
              <p className="text-sm text-muted-foreground">
                Format JSON with proper indentation for better readability
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Minify</h3>
              <p className="text-sm text-muted-foreground">
                Remove unnecessary whitespace to reduce file size
              </p>
            </div>
          </div>
        </div>
    </div>
  )
}
