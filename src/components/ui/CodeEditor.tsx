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
  errorLine?: number | null
  onFocus?: () => void
  onBlur?: () => void
}

export const CodeEditor = forwardRef<HTMLTextAreaElement, CodeEditorProps>(
  ({
    value,
    onChange,
    placeholder = 'Enter your code here...',
    className = '',
    rows = 6,
    readOnly = false,
    showLineNumbers = true,
    errorLine = null,
    onFocus,
    onBlur,
  }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const lineNumbersRef = useRef<HTMLDivElement>(null)
    const errorLineRef = useRef<HTMLDivElement>(null)
    const [lineNumbers, setLineNumbers] = useState<string[]>(['1'])
    const [isFocused, setIsFocused] = useState(false)

    useEffect(() => {
      const lines = value.split('\n')
      const numbers = Array.from({ length: Math.max(1, lines.length) }, (_, i) => (i + 1).toString())
      setLineNumbers(numbers)
    }, [value])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (readOnly) return

      const textarea = e.currentTarget
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = value

      if (e.key === '{') {
        e.preventDefault()
        const newValue = text.substring(0, start) + '{}' + text.substring(end)
        onChange(newValue)
        setTimeout(() => { textarea.selectionStart = textarea.selectionEnd = start + 1 }, 0)
      } else if (e.key === '[') {
        e.preventDefault()
        const newValue = text.substring(0, start) + '[]' + text.substring(end)
        onChange(newValue)
        setTimeout(() => { textarea.selectionStart = textarea.selectionEnd = start + 1 }, 0)
      } else if (e.key === '(') {
        e.preventDefault()
        const newValue = text.substring(0, start) + '()' + text.substring(end)
        onChange(newValue)
        setTimeout(() => { textarea.selectionStart = textarea.selectionEnd = start + 1 }, 0)
      } else if (e.key === '"' || e.key === "'") {
        e.preventDefault()
        const quote = e.key
        const newValue = text.substring(0, start) + quote + quote + text.substring(end)
        onChange(newValue)
        setTimeout(() => { textarea.selectionStart = textarea.selectionEnd = start + 1 }, 0)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const before = text.substring(0, start)
        const after = text.substring(end)
        const linesBefore = before.split('\n')
        const currentLine = linesBefore[linesBefore.length - 1] || ''
        const indentation = currentLine.match(/^\s*/)?.[0] || ''
        const shouldIncreaseIndent = currentLine.trim().endsWith('{') ||
          currentLine.trim().endsWith('[') ||
          currentLine.trim().endsWith('(')
        const newIndent = shouldIncreaseIndent ? indentation + '  ' : indentation
        const newValue = before + '\n' + newIndent + after
        onChange(newValue)
        setTimeout(() => { textarea.selectionStart = textarea.selectionEnd = start + 1 + newIndent.length }, 0)
      } else if (e.key === 'Backspace' && start === end) {
        const charBefore = text[start - 1]
        const charAfter = text[start]
        const pairs = [['{', '}'], ['[', ']'], ['(', ')'], ['"', '"'], ["'", "'"]]
        const isPair = pairs.some(([open, close]) => charBefore === open && charAfter === close)
        if (isPair) {
          e.preventDefault()
          const newValue = text.substring(0, start - 1) + text.substring(start + 1)
          onChange(newValue)
          setTimeout(() => { textarea.selectionStart = textarea.selectionEnd = start - 1 }, 0)
        }
      }
    }

    const handleScroll = () => {
      if (textareaRef.current && lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
      }
      if (textareaRef.current && errorLineRef.current && errorLine !== null) {
        const scrollTop = textareaRef.current.scrollTop
        const baseTop = 0.75 + (errorLine - 1) * (LINE_HEIGHT / 16) // Convert to rem
        errorLineRef.current.style.transform = `translateY(-${scrollTop}px)`
      }
    }

    // Line height in px — must match the textarea's leading
    const LINE_HEIGHT = 21 // 14px font * 1.5 line-height

    return (
      <div className={`relative flex group ${className} ${isFocused ? 'ring-2 ring-primary/20 rounded-lg' : ''}`}>
        {showLineNumbers && (
          <div
            ref={lineNumbersRef}
            className="select-none bg-muted/50 border border-r-0 border-input rounded-l-md text-right text-sm text-muted-foreground font-mono overflow-hidden transition-all duration-200 group-hover:bg-muted/70"
            style={{ minWidth: '3rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
          >
            {lineNumbers.map((num, index) => {
              const lineNum = index + 1
              const isError = errorLine !== null && lineNum === errorLine
              return (
                <div
                  key={index}
                  className="transition-all duration-200"
                  style={{
                    height: `${LINE_HEIGHT}px`,
                    lineHeight: `${LINE_HEIGHT}px`,
                    paddingRight: '0.75rem',
                    paddingLeft: '0.5rem',
                    background: isError ? 'rgba(220,38,38,0.15)' : undefined,
                    color: isError ? 'rgb(220,38,38)' : undefined,
                    fontWeight: isError ? 700 : undefined,
                    borderRadius: isError ? '0.25rem' : undefined,
                  }}
                >
                  {num}
                </div>
              )
            })}
          </div>
        )}
        
        <textarea
          ref={(el) => {
            if (typeof ref === 'function') ref(el)
            else if (ref) ref.current = el
            textareaRef.current = el
          }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          onFocus={() => {
            setIsFocused(true)
            onFocus?.()
          }}
          onBlur={() => {
            setIsFocused(false)
            onBlur?.()
          }}
          placeholder={placeholder}
          rows={rows}
          readOnly={readOnly}
          className={`w-full px-4 py-3 border border-input bg-background/95 backdrop-blur-sm rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none font-mono text-sm transition-all duration-200 placeholder:text-muted-foreground/50 hover:bg-background ${
            showLineNumbers ? 'rounded-l-none border-l-0' : ''
          } ${readOnly ? 'cursor-not-allowed opacity-70' : 'hover:border-primary/30'}`}
          style={{
            tabSize: 2,
            lineHeight: `${LINE_HEIGHT}px`,
            position: 'relative',
            zIndex: 2,
          }}
        />
        
        {/* Focus indicator */}
        {isFocused && (
          <div className="absolute inset-0 pointer-events-none rounded-lg border-2 border-primary/20 animate-pulse"></div>
        )}
      </div>
    )
  }
)

CodeEditor.displayName = 'CodeEditor'