"use client"

import { forwardRef, useRef, useEffect, useState } from "react";
 
interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  rows?: number
  readOnly?: boolean
  showLineNumbers?: boolean
}

export const CodeEditor = forwardRef<HTMLTextAreaElement, CodeEditorProps>(
  ({ 
    value, 
    onChange, 
    placeholder = 'Enter your code here...', 
    className = '', 
    rows = 6,
    readOnly = false,
    showLineNumbers = true
  }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [lineNumbers, setLineNumbers] = useState<string[]>(['1'])

    // Update line numbers when value changes
    useEffect(() => {
      const lines = value.split('\n')
      const numbers = Array.from({ length: Math.max(1, lines.length) }, (_, i) => (i + 1).toString())
      setLineNumbers(numbers)
    }, [value])

    // Auto-completion logic
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (readOnly) return

      const textarea = e.currentTarget
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = value

      // Auto-brace completion
      if (e.key === '{') {
        e.preventDefault()
        const before = text.substring(0, start)
        const after = text.substring(end)
        const newValue = before + '{}' + after
        onChange(newValue)
        
        // Set cursor position between the braces
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1
        }, 0)
      }
      else if (e.key === '[') {
        e.preventDefault()
        const before = text.substring(0, start)
        const after = text.substring(end)
        const newValue = before + '[]' + after
        onChange(newValue)
        
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1
        }, 0)
      }
      else if (e.key === '(') {
        e.preventDefault()
        const before = text.substring(0, start)
        const after = text.substring(end)
        const newValue = before + '()' + after
        onChange(newValue)
        
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1
        }, 0)
      }
      // Auto-quote completion
      else if (e.key === '"' || e.key === "'") {
        e.preventDefault()
        const quote = e.key
        const before = text.substring(0, start)
        const after = text.substring(end)
        const newValue = before + quote + quote + after
        onChange(newValue)
        
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1
        }, 0)
      }
      // Auto-indentation
      else if (e.key === 'Enter') {
        e.preventDefault()
        const before = text.substring(0, start)
        const after = text.substring(end)
        
        // Get current line's indentation
        const linesBefore = before.split('\n')
        const currentLine = linesBefore[linesBefore.length - 1] || ''
        const indentation = currentLine.match(/^\s*/)?.[0] || ''
        
        // Check if we need to increase indentation (after opening brace/bracket)
        const shouldIncreaseIndent = currentLine.trim().endsWith('{') || 
                                   currentLine.trim().endsWith('[') || 
                                   currentLine.trim().endsWith('(')
        
        const newIndent = shouldIncreaseIndent ? indentation + '  ' : indentation
        
        const newValue = before + '\n' + newIndent + after
        onChange(newValue)
        
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1 + newIndent.length
        }, 0)
      }
      // Handle backspace for paired characters
      else if (e.key === 'Backspace' && start === end) {
        const charBefore = text[start - 1]
        const charAfter = text[start]
        
        // Check if we have a pair of characters to delete together
        const pairs = [
          ['{', '}'],
          ['[', ']'],
          ['(', ')'],
          ['"', '"'],
          ["'", "'"]
        ]
        
        const isPair = pairs.some(([open, close]) => 
          charBefore === open && charAfter === close
        )
        
        if (isPair) {
          e.preventDefault()
          const before = text.substring(0, start - 1)
          const after = text.substring(start + 1)
          const newValue = before + after
          onChange(newValue)
          
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start - 1
          }, 0)
        }
      }
    }

    // Sync scroll between textarea and line numbers
    const handleScroll = () => {
      if (textareaRef.current) {
        const lineNumbersElement = textareaRef.current.previousElementSibling as HTMLElement
        if (lineNumbersElement) {
          lineNumbersElement.scrollTop = textareaRef.current.scrollTop
        }
      }
    }

    return (
      <div className={`relative flex ${className}`}>
        {showLineNumbers && (
          <div className="select-none bg-muted border border-r-0 border-input rounded-l-md px-3 py-3 text-right text-sm text-muted-foreground font-mono overflow-hidden">
            <div className="sticky top-0">
              {lineNumbers.map((num, index) => (
                <div key={index} className="leading-[1.5] min-h-[1.5em] flex items-center justify-end">
                  {num}
                </div>
              ))}
            </div>
          </div>
        )}
        <textarea
          ref={(el) => {
            if (typeof ref === 'function') {
              ref(el)
            } else if (ref) {
              ref.current = el
            }
            textareaRef.current = el
          }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          placeholder={placeholder}
          rows={rows}
          readOnly={readOnly}
          className={`w-full px-4 py-3 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none font-mono text-sm leading-[1.5] ${
            showLineNumbers ? 'rounded-l-none border-l-0' : ''
          }`}
          style={{ tabSize: 2 }}
        />
      </div>
    )
  }
)

CodeEditor.displayName = 'CodeEditor'
