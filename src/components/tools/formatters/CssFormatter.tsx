'use client'

import { useState } from 'react'
import { TextareaInput } from '@/components/ui/TextareaInput'
import { TextareaOutput } from '@/components/ui/TextareaOutput'
import { CopyButton } from '@/components/ui/CopyButton'
import { Download } from '@/components/ui/Download'
import { Button } from '@/components/ui/Button'

export function CssFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [indentSize, setIndentSize] = useState(2)

  const formatCss = () => {
    try {
      if (!input.trim()) {
        throw new Error('Please enter CSS content to format')
      }

      // Basic CSS syntax validation
      let braceCount = 0
      let inString = false
      let escapeNext = false
      let inComment = false

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
        
        if (!inComment && (char === '"' || char === "'") && !escapeNext) {
          inString = !inString
          continue
        }
        
        if (inString) continue
        
        // Handle CSS comments
        if (char === '/' && i + 1 < input.length && input[i + 1] === '*') {
          inComment = true
        } else if (char === '*' && i + 1 < input.length && input[i + 1] === '/') {
          inComment = false
        }
        
        if (!inComment) {
          if (char === '{') braceCount++
          else if (char === '}') braceCount--
          
          if (braceCount < 0) {
            throw new Error(`Unexpected closing brace at position ${i}`)
          }
        }
      }

      if (braceCount !== 0) {
        throw new Error(`Unclosed braces: ${braceCount > 0 ? braceCount + ' opening braces' : Math.abs(braceCount) + ' closing braces'} missing`)
      }

      if (inString) {
        throw new Error('Unclosed string literal')
      }

      if (inComment) {
        throw new Error('Unclosed CSS comment')
      }

      // Basic CSS formatting logic
      let formatted = input
        .replace(/\s*{\s*/g, ' {\n  ') // Format opening braces
        .replace(/;\s*/g, ';\n  ') // Format semicolons
        .replace(/\s*}\s*/g, '\n}\n') // Format closing braces
        .replace(/^\s+|\s+$/gm, '') // Trim lines
        .replace(/\n\s*\n/g, '\n') // Remove empty lines
        .split('\n')
        .map((line) => {
          const trimmed = line.trim()
          if (trimmed === '') return ''
          
          // Calculate indentation based on braces
          let indentLevel = 0
          if (trimmed.startsWith('}')) {
            // Closing brace - reduce indentation
            indentLevel = -1
          }
          
          const indent = '  '.repeat(Math.max(0, getCurrentIndentation(input, input.indexOf(line)) + indentLevel))
          return indent + trimmed
        })
        .join('\n')

      setOutput(formatted)
      setError('')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error formatting CSS'
      setError(errorMessage)
      setOutput('')
    }
  }

  const getCurrentIndentation = (text: string, position: number) => {
    const beforePosition = text.substring(0, position)
    const openBraces = (beforePosition.match(/{/g) || []).length
    const closeBraces = (beforePosition.match(/}/g) || []).length
    return Math.max(0, openBraces - closeBraces)
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
          <h1 className="text-3xl font-bold mb-4">CSS Formatter</h1>
          <p className="text-muted-foreground">
            Format and beautify CSS code with proper indentation and structure for better readability.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Input CSS</h2>
              <Button variant="outline" onClick={clearAll}>
                Clear
              </Button>
            </div>
            <TextareaInput
              value={input}
              onChange={setInput}
              placeholder="Paste your CSS code here..."
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
                    filename="formatted.css"
                    mimeType="text/css"
                  />
                </div>
              )}
            </div>
            <TextareaOutput
              value={output}
              placeholder="Formatted CSS will appear here..."
              rows={12}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mt-6">
          <Button onClick={formatCss}>
            Format CSS
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">
              <strong>CSS Validation Error:</strong> {error}
            </p>
            <p className="text-destructive text-xs mt-2">
              Please check your CSS syntax. Common issues include unclosed braces, unmatched quotes, or invalid comment syntax.
            </p>
          </div>
        )}

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Selector Formatting</h3>
            <p className="text-sm text-muted-foreground">
              Properly formats CSS selectors and properties with consistent spacing
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Property Alignment</h3>
            <p className="text-sm text-muted-foreground">
              Aligns CSS properties with proper indentation for better readability
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Brace Formatting</h3>
            <p className="text-sm text-muted-foreground">
              Formats opening and closing braces with consistent style
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
