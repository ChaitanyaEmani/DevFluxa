'use client'

import { useRef, useEffect, useCallback, KeyboardEvent, ChangeEvent } from 'react'
import { SELF_CLOSING_TAGS, LintError } from '@/lib/formatter/html'

interface SmartHTMLEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  lintErrors?: LintError[]
  autoClose?: boolean
  autoIndent?: boolean
}

export function SmartHTMLEditor({
  value,
  onChange,
  placeholder = 'Paste or type HTML here...',
  className = '',
  lintErrors = [],
  autoClose = true,
  autoIndent = true,
}: SmartHTMLEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Sync scroll between textarea and line numbers
  const lineNumbersRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    if (lineNumbersRef.current && textareaRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }

  const lines = value.split('\n')
  const errorLines = new Set(lintErrors.map(e => e.line))

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      const textarea = e.currentTarget
      const { selectionStart, selectionEnd, value: val } = textarea

      // Tab key -> insert spaces
      if (e.key === 'Tab') {
        e.preventDefault()
        const indent = '  '
        const newVal = val.slice(0, selectionStart) + indent + val.slice(selectionEnd)
        onChange(newVal)
        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart + indent.length
        })
        return
      }

      // Enter key -> auto-indent
      if (e.key === 'Enter' && autoIndent) {
        e.preventDefault()
        const lineStart = val.lastIndexOf('\n', selectionStart - 1) + 1
        const currentLine = val.slice(lineStart, selectionStart)
        const indentMatch = currentLine.match(/^(\s*)/)
        const currentIndent = indentMatch ? indentMatch[1] : ''

        // Check if cursor is between opening and closing tag
        const before = val.slice(0, selectionStart)
        const after = val.slice(selectionEnd)
        const openTagMatch = before.match(/<([a-zA-Z][a-zA-Z0-9]*)([^>]*)>$/)
        const closeTagMatch = after.match(/^<\/([a-zA-Z][a-zA-Z0-9]*)>/)

        if (openTagMatch && closeTagMatch && openTagMatch[1].toLowerCase() === closeTagMatch[1].toLowerCase()) {
          // Between <tag> and </tag> - add extra indent level
          const extraIndent = currentIndent + '  '
          const insert = '\n' + extraIndent + '\n' + currentIndent
          const newVal = before + insert + after
          onChange(newVal)
          requestAnimationFrame(() => {
            const newPos = selectionStart + 1 + extraIndent.length
            textarea.selectionStart = textarea.selectionEnd = newPos
          })
        } else {
          const insert = '\n' + currentIndent
          const newVal = before + insert + after
          onChange(newVal)
          requestAnimationFrame(() => {
            textarea.selectionStart = textarea.selectionEnd = selectionStart + insert.length
          })
        }
        return
      }

      // Auto-close HTML tags on >
      if (e.key === '>' && autoClose) {
        const before = val.slice(0, selectionStart)
        const after = val.slice(selectionEnd)

        // Extract the opening tag being typed
        const openMatch = before.match(/<([a-zA-Z][a-zA-Z0-9]*)([^>]*)$/)
        if (openMatch) {
          const tagName = openMatch[1].toLowerCase()
          const attrs = openMatch[2]

          // Don't auto-close self-closing or already closing tags
          if (!SELF_CLOSING_TAGS.includes(tagName) && !before.trimEnd().endsWith('/')) {
            e.preventDefault()
            const closeTag = `</${tagName}>`
            const newVal = before + '>' + closeTag + after
            onChange(newVal)
            requestAnimationFrame(() => {
              // Place cursor between opening and closing tag
              textarea.selectionStart = textarea.selectionEnd = selectionStart + 1
            })
            return
          }
        }
      }

      // Auto-close quotes
      if ((e.key === '"' || e.key === "'") && autoClose) {
        const before = val.slice(0, selectionStart)
        const after = val.slice(selectionEnd)
        // Only inside a tag attribute context
        if (before.match(/<[^>]*=\s*$/)) {
          e.preventDefault()
          const quote = e.key
          const newVal = before + quote + quote + after
          onChange(newVal)
          requestAnimationFrame(() => {
            textarea.selectionStart = textarea.selectionEnd = selectionStart + 1
          })
          return
        }
      }

      // Wrap selected text in tag with < >
      // Auto-complete closing bracket when user types </ and there's an open tag
    },
    [value, onChange, autoClose, autoIndent]
  )

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className={`relative flex border border-border rounded-lg overflow-hidden bg-[#1e1e2e] font-mono text-sm ${className}`}>
      {/* Line numbers */}
      <div
        ref={lineNumbersRef}
        className="select-none overflow-hidden flex-shrink-0 text-right py-3 px-2 text-[#585b70] bg-[#181825] border-r border-[#313244]"
        style={{ minWidth: '3rem', lineHeight: '1.5rem' }}
        aria-hidden="true"
      >
        {lines.map((_, i) => (
          <div
            key={i}
            className={`leading-6 text-xs ${errorLines.has(i + 1) ? 'text-red-400 font-bold' : ''}`}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onScroll={handleScroll}
        placeholder={placeholder}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        className="flex-1 resize-none bg-transparent text-[#cdd6f4] py-3 px-4 outline-none leading-6 text-sm placeholder:text-[#45475a]"
        style={{ minHeight: '400px', lineHeight: '1.5rem', tabSize: 2 }}
      />

      {/* Lint error overlay indicator */}
      {lintErrors.length > 0 && (
        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-red-900/80 text-red-200 text-xs px-2 py-1 rounded-md">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {lintErrors.length} issue{lintErrors.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}