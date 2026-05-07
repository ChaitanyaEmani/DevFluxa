'use client'

import { useState } from 'react'
import { TextareaInput } from '@/components/ui/TextareaInput'
import { TextareaOutput } from '@/components/ui/TextareaOutput'
import { CopyButton } from '@/components/ui/CopyButton'
import { Download } from '@/components/ui/Download'
import { Button } from '@/components/ui/Button'

export function XmlFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [indentSize, setIndentSize] = useState(2)

  const formatXml = () => {
    try {
      if (!input.trim()) {
        throw new Error('Please enter XML content to format')
      }

      // Basic XML syntax validation
      let tagCount = 0
      let inString = false
      let escapeNext = false
      let inComment = false
      let inCData = false

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
        
        if (!inComment && !inCData && (char === '"' || char === "'") && !escapeNext) {
          inString = !inString
          continue
        }
        
        if (inString || inComment || inCData) continue
        
        // Handle XML comments
        if (input.substring(i, i + 4) === '<!--') {
          inComment = true
        } else if (input.substring(i - 3, i) === '-->') {
          inComment = false
        }
        
        // Handle CDATA sections
        if (input.substring(i, i + 9) === '<![CDATA[') {
          inCData = true
        } else if (input.substring(i - 3, i) === ']]>') {
          inCData = false
        }
        
        if (!inComment && !inCData && char === '<' && input.substring(i, i + 4) !== '<!--') {
          tagCount++
        } else if (!inComment && !inCData && char === '>') {
          tagCount--
        }
        
        if (tagCount < 0) {
          throw new Error(`Unexpected closing tag at position ${i}`)
        }
      }

      if (tagCount !== 0) {
        throw new Error(`Unclosed tags: ${tagCount > 0 ? tagCount + ' opening tags' : Math.abs(tagCount) + ' closing tags'} missing`)
      }

      if (inString) {
        throw new Error('Unclosed string literal')
      }

      if (inComment) {
        throw new Error('Unclosed XML comment')
      }

      if (inCData) {
        throw new Error('Unclosed CDATA section')
      }

      // Basic XML formatting logic
      const indent = ' '.repeat(indentSize)
      let formatted = input
        .replace(/>\s*</g, '>\n<') // Add newlines between tags
        .replace(/^\s+|\s+$/gm, '') // Trim lines
        .split('\n')
        .map((line) => {
          const trimmed = line.trim()
          if (trimmed === '') return ''
          
          // Calculate indentation based on tag nesting
          let indentLevel = 0
          if (trimmed.startsWith('</')) {
            // Closing tag - reduce indentation
            const currentLevel = getCurrentIndentation(input, input.indexOf(line))
            indentLevel = Math.max(0, currentLevel - 1)
          } else {
            // Opening tag or content
            const currentLevel = getCurrentIndentation(input, input.indexOf(line))
            indentLevel = currentLevel
          }
          
          const indent = indent.repeat(Math.max(0, getCurrentIndentation(input, input.indexOf(line)) + indentLevel))
          return indent + trimmed
        })
        .join('\n')

      setOutput(formatted)
      setError('')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error formatting XML'
      setError(errorMessage)
      setOutput('')
    }
  }

  const getCurrentIndentation = (text: string, position: number) => {
    const beforePosition = text.substring(0, position)
    const openTags = beforePosition.match(/<[^\/][^>]*[^\/]>/g) || []
    const closeTags = beforePosition.match(/<\/[^>]+>/g) || []
    return Math.max(0, openTags.length - closeTags.length)
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
          <h1 className="text-3xl font-bold mb-4">XML Formatter</h1>
          <p className="text-muted-foreground">
            Format XML files with proper indentation and structure for better readability and validation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Input XML</h2>
              <Button variant="outline" onClick={clearAll}>
                Clear
              </Button>
            </div>
            <TextareaInput
              value={input}
              onChange={setInput}
              placeholder="Paste your XML here..."
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
                    filename="formatted.xml"
                    mimeType="text/xml"
                  />
                </div>
              )}
            </div>
            <TextareaOutput
              value={output}
              placeholder="Formatted XML will appear here..."
              rows={12}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mt-6">
          <Button onClick={formatXml}>
            Format XML
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">
              <strong>XML Validation Error:</strong> {error}
            </p>
            <p className="text-destructive text-xs mt-2">
              Please check your XML syntax. Common issues include unclosed tags, mismatched quotes, invalid comments, or malformed CDATA sections.
            </p>
          </div>
        )}

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Proper Indentation</h3>
            <p className="text-sm text-muted-foreground">
              Formats XML with consistent indentation based on element nesting level
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Structure Preservation</h3>
            <p className="text-sm text-muted-foreground">
              Maintains XML hierarchy and structure while improving readability
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Tag Formatting</h3>
            <p className="text-sm text-muted-foreground">
              Properly formats opening and closing tags with appropriate spacing
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
