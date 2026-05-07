'use client'

import { useState } from 'react'
import { TextareaInput } from '@/components/ui/TextareaInput'
import { TextareaOutput } from '@/components/ui/TextareaOutput'
import { CopyButton } from '@/components/ui/CopyButton'
import { Download } from '@/components/ui/Download'
import { Button } from '@/components/ui/Button'

export function HtmlBeautifier() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [indentSize, setIndentSize] = useState(2)

  const formatHtml = () => {
    try {
      if (!input.trim()) {
        throw new Error('Please enter HTML content to format')
      }

      // Basic HTML syntax validation
      let tagCount = 0
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
        
        if (inString || inComment) continue
        
        if (char === '<' && input.substring(i, i + 4) !== '<!--') {
          tagCount++
        } else if (char === '>') {
          tagCount--
        }
        
        if (tagCount < 0) {
          throw new Error(`Unexpected closing tag at position ${i}`)
        }

        // Handle comments
        if (input.substring(i, i + 4) === '<!--') {
          inComment = true
        } else if (input.substring(i - 3, i) === '-->') {
          inComment = false
        }
      }

      if (tagCount !== 0) {
        throw new Error(`Unclosed tags: ${tagCount > 0 ? tagCount + ' opening tags' : Math.abs(tagCount) + ' closing tags'} missing`)
      }

      if (inString) {
        throw new Error('Unclosed string literal')
      }

      if (inComment) {
        throw new Error('Unclosed HTML comment')
      }

      // Basic HTML formatting logic
      let formatted = input
        .replace(/></g, '>\n<') // Add newlines between tags
        .replace(/(\s+)></g, '>') // Remove whitespace before closing tags
        .replace(/^\s+|\s+$/gm, '') // Trim lines
        .split('\n')
        .map((line, index) => {
          const trimmed = line.trim()
          if (trimmed === '') return ''
          
          // Calculate indentation based on tag nesting
          let indentLevel = 0
          const openTags = trimmed.match(/<[^\/][^>]*[^\/]>/g) || []
          const closeTags = trimmed.match(/<\/[^>]+>/g) || []
          const selfClosingTags = trimmed.match(/<[^>]*\/>/g) || []
          
          // For closing tags, reduce indentation
          if (trimmed.startsWith('</')) {
            const currentLevel = getCurrentIndentation(input, input.indexOf(line))
            indentLevel = Math.max(0, currentLevel - 1)
          } else {
            // Opening tag or content
            const currentLevel = getCurrentIndentation(input, input.indexOf(line))
            indentLevel = currentLevel
          }
          
          const indent = '  '.repeat(Math.max(0, getCurrentIndentation(input, input.indexOf(line)) + indentLevel))
          return indent + trimmed
        })
        .join('\n')

      setOutput(formatted)
      setError('')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error formatting HTML'
      setError(errorMessage)
      setOutput('')
    }
  }

  const getCurrentIndentation = (text: string, lineIndex: number) => {
    const lines = text.split('\n').slice(0, lineIndex)
    let indent = 0
    
    lines.forEach(line => {
      const openTags = line.match(/<[^\/][^>]*[^\/]>/g) || []
      const closeTags = line.match(/<\/[^>]+>/g) || []
      indent += openTags.length - closeTags.length
    })
    
    return Math.max(0, indent)
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
          <h1 className="text-3xl font-bold mb-4">HTML Beautifier</h1>
          <p className="text-muted-foreground">
            Format and beautify HTML code with proper indentation and structure for better readability.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Input HTML</h2>
              <Button variant="outline" onClick={clearAll}>
                Clear
              </Button>
            </div>
            <TextareaInput
              value={input}
              onChange={setInput}
              placeholder="Paste your HTML code here..."
              rows={12}
            />
          </div>

          {/* Output Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Beautified Output</h2>
              {output && (
                <div className="flex gap-2">
                  <CopyButton text={output} />
                  <Download
                    content={output}
                    filename="beautified.html"
                    mimeType="text/html"
                  />
                </div>
              )}
            </div>
            <TextareaOutput
              value={output}
              placeholder="Beautified HTML will appear here..."
              rows={12}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mt-6">
          <Button onClick={formatHtml}>
            Beautify HTML
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">
              <strong>HTML Validation Error:</strong> {error}
            </p>
            <p className="text-destructive text-xs mt-2">
              Please check your HTML syntax. Common issues include unclosed tags, mismatched quotes, or invalid comment syntax.
            </p>
          </div>
        )}

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Proper Indentation</h3>
            <p className="text-sm text-muted-foreground">
              Automatically formats HTML with consistent indentation based on tag nesting
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Tag Structure</h3>
            <p className="text-sm text-muted-foreground">
              Preserves HTML structure while improving readability and organization
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Line Breaks</h3>
            <p className="text-sm text-muted-foreground">
              Adds appropriate line breaks between HTML elements for better formatting
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
