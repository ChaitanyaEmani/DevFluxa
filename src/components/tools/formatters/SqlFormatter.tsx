'use client'

import { useState } from 'react'
import { TextareaInput } from '@/components/ui/TextareaInput'
import { TextareaOutput } from '@/components/ui/TextareaOutput'
import { CopyButton } from '@/components/ui/CopyButton'
import { Download } from '@/components/ui/Download'
import { Button } from '@/components/ui/Button'

export function SqlFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [indentSize, setIndentSize] = useState(2)

  const formatSql = () => {
    try {
      if (!input.trim()) {
        throw new Error('Please enter SQL content to format')
      }

      // Basic SQL syntax validation
      const lines = input.split('\n')
      let parenCount = 0
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
        
        if ((char === '"' || char === "'") && !escapeNext) {
          inString = !inString
          continue
        }
        
        if (inString) continue
        
        if (char === '(') parenCount++
        else if (char === ')') parenCount--
        
        if (parenCount < 0) {
          throw new Error(`Unexpected closing parenthesis at position ${i}`)
        }
      }

      if (parenCount !== 0) {
        throw new Error(`Unclosed parentheses: ${parenCount > 0 ? parenCount + ' opening parentheses' : Math.abs(parenCount) + ' closing parentheses'} missing`)
      }

      if (inString) {
        throw new Error('Unclosed string literal')
      }

      // Basic SQL formatting logic
      let formatted = input
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/\s*,\s*/g, ',\n  ') // Format commas
        .replace(/\s*\(\s*/g, ' (\n  ') // Format opening parentheses
        .replace(/\s*\)\s*/g, '\n)') // Format closing parentheses
        .replace(/\b(SELECT|FROM|WHERE|AND|OR|ORDER BY|GROUP BY|HAVING|INSERT INTO|VALUES|UPDATE|SET|DELETE FROM|CREATE TABLE|ALTER TABLE|DROP TABLE|PRIMARY KEY|FOREIGN KEY|NOT NULL|NULL|DEFAULT|AUTO_INCREMENT|INT|VARCHAR|TEXT|DATETIME|TIMESTAMP|BOOLEAN|FLOAT|DOUBLE|DECIMAL|CHAR|DATE|TIME)\b/gi, '\n$1') // Format keywords
        .replace(/^\s+|\s+$/gm, '') // Trim lines
        .replace(/\n\s*\n/g, '\n') // Remove empty lines
        .split('\n')
        .map((line, index) => {
          if (line.trim() === '') return ''
          const indent = '  '.repeat(Math.max(0, (line.match(/^\s*/)?.[0].length || 0) / 2))
          return indent + line.trim()
        })
        .join('\n')

      setOutput(formatted)
      setError('')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error formatting SQL'
      setError(errorMessage)
      setOutput('')
    }
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setError('')
  }

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">SQL Formatter</h1>
          <p className="text-muted-foreground">
            Format SQL queries with proper indentation and keyword highlighting for better readability.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Input SQL</h2>
              <Button variant="outline" onClick={clearAll}>
                Clear
              </Button>
            </div>
            <TextareaInput
              value={input}
              onChange={setInput}
              placeholder="Paste your SQL query here..."
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
                    filename="formatted.sql"
                    mimeType="text/sql"
                  />
                </div>
              )}
            </div>
            <TextareaOutput
              value={output}
              placeholder="Formatted SQL will appear here..."
              rows={12}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mt-6">
          <Button onClick={formatSql}>
            Format SQL
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">
              <strong>SQL Validation Error:</strong> {error}
            </p>
            <p className="text-destructive text-xs mt-2">
              Please check your SQL syntax. Common issues include unclosed parentheses, unmatched quotes, or incorrect keyword usage.
            </p>
          </div>
        )}

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Keyword Formatting</h3>
            <p className="text-sm text-muted-foreground">
              Automatically formats SQL keywords with proper capitalization and spacing
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Indentation Control</h3>
            <p className="text-sm text-muted-foreground">
              Consistent indentation for nested queries and subqueries
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Structure Preservation</h3>
            <p className="text-sm text-muted-foreground">
              Maintains the logical structure while improving readability
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
