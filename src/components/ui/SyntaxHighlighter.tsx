'use client'

import { useRef, useEffect, useCallback } from 'react'

interface SyntaxHighlighterProps {
  value: string
  language: string
  className?: string
  showLineNumbers?: boolean
  editable?: boolean
  onChange?: (value: string) => void
  placeholder?: string
  rows?: number
  readOnly?: boolean
}

// ─── HTML Syntax Highlighting ─────────────────────────────────────────────────

function highlightHTML(raw: string): string {
  if (!raw) return ''

  const escaped = raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

  return escaped
    // DOCTYPE
    .replace(
      /(&lt;!DOCTYPE[^>]*?&gt;)/gi,
      '<span class="sh-doctype">$1</span>'
    )
    // HTML comments
    .replace(
      /(&lt;!--[\s\S]*?--&gt;)/g,
      '<span class="sh-comment">$1</span>'
    )
    // Closing tags </tag>
    .replace(
      /(&lt;\/)([a-zA-Z][a-zA-Z0-9-]*)(&gt;)/g,
      '<span class="sh-punct">$1</span><span class="sh-tag">$2</span><span class="sh-punct">$3</span>'
    )
    // Opening / self-closing tags with attributes
    .replace(
      /(&lt;)([a-zA-Z][a-zA-Z0-9-]*)((?:\s[^]*?)?)(\/?&gt;)/g,
      (_, open, tag, attrs, close) => {
        const highlightedAttrs = attrs
          .replace(
            /(\s+)([a-zA-Z_:][a-zA-Z0-9_.:-]*)(\s*=\s*)(&quot;[^]*?&quot;)/g,
            '$1<span class="sh-attr-name">$2</span><span class="sh-punct">$3</span><span class="sh-attr-value">$4</span>'
          )
          .replace(
            /(\s+)([a-zA-Z_:][a-zA-Z0-9_.:-]*)(?=[\s/&]|$)/g,
            '$1<span class="sh-attr-name">$2</span>'
          )
        return (
          `<span class="sh-punct">${open}</span>` +
          `<span class="sh-tag">${tag}</span>` +
          highlightedAttrs +
          `<span class="sh-punct">${close}</span>`
        )
      }
    )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const SH_STYLES = `
  .sh-editor-wrap {
    display: flex;
    overflow: hidden;
    border: 1px solid hsl(var(--input, 214 32% 91%));
    border-radius: 6px;
    background: hsl(var(--background));
    max-height: 400px;
    height: 400px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.875rem;
    line-height: 21px;
  }
  .sh-line-nums {
    flex-shrink: 0;
    min-width: 3rem;
    padding: 0.75rem 0;
    background: rgba(0,0,0,0.03);
    border-right: 1px solid hsl(var(--input, 214 32% 91%));
    text-align: right;
    color: #9ca3af;
    overflow: hidden;
    user-select: none;
  }
  .sh-line-nums div { height: 21px; line-height: 21px; padding: 0 0.5rem 0 0.25rem; }
  .sh-editor-cell { position: relative; flex: 1; overflow: hidden; }
  .sh-editable {
    position: absolute;
    inset: 0;
    padding: 0.75rem 1rem;
    white-space: pre;
    overflow: auto;
    outline: none;
    caret-color: #111;
    tab-size: 2;
  }
  .dark .sh-editable { caret-color: #f8fafc; }
  .sh-editable:empty:before {
    content: attr(data-placeholder);
    color: rgba(156,163,175,0.6);
    pointer-events: none;
  }
  .sh-readonly {
    flex: 1;
    padding: 0.75rem 1rem;
    white-space: pre;
    overflow: auto;
    max-height: 400px;
  }
  .sh-doctype   { color: #9ca3af; font-style: italic; }
  .sh-comment   { color: #6b7280; font-style: italic; }
  .sh-tag       { color: #2563eb; font-weight: 600; }
  .sh-punct     { color: #6b7280; }
  .sh-attr-name  { color: #db2777; }
  .sh-attr-value { color: #16a34a; }

  .dark .sh-doctype    { color: #6b7280; }
  .dark .sh-comment    { color: #4b5563; }
  .dark .sh-tag        { color: #60a5fa; font-weight: 600; }
  .dark .sh-punct      { color: #9ca3af; }
  .dark .sh-attr-name  { color: #f472b6; }
  .dark .sh-attr-value { color: #4ade80; }
`

// ─── Caret save / restore ─────────────────────────────────────────────────────

function saveCaretOffset(el: HTMLElement): number {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return 0
  const range = sel.getRangeAt(0).cloneRange()
  range.selectNodeContents(el)
  range.setEnd(sel.getRangeAt(0).startContainer, sel.getRangeAt(0).startOffset)
  return range.toString().length
}

function restoreCaretOffset(el: HTMLElement, offset: number) {
  const sel = window.getSelection()
  if (!sel) return
  const range = document.createRange()
  range.setStart(el, 0)
  range.collapse(true)

  const stack: Node[] = [el]
  let charsSeen = 0
  let done = false

  while (stack.length && !done) {
    const node = stack.pop()!
    if (node.nodeType === Node.TEXT_NODE) {
      const len = node.textContent?.length ?? 0
      if (charsSeen + len >= offset) {
        range.setStart(node, offset - charsSeen)
        range.collapse(true)
        done = true
      }
      charsSeen += len
    } else {
      Array.from(node.childNodes).reverse().forEach(c => stack.push(c))
    }
  }

  sel.removeAllRanges()
  sel.addRange(range)
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SyntaxHighlighter({
  value,
  language,
  className = '',
  showLineNumbers = true,
  editable = false,
  onChange,
  placeholder = '',
  readOnly = false,
}: SyntaxHighlighterProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const isComposing = useRef(false)
  const skipNextSync = useRef(false)  // set true after user edits to avoid caret reset

  const getHighlighted = (raw: string) =>
    language === 'markup'
      ? highlightHTML(raw)
      : raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const lineCount = Math.max(1, (value || '').split('\n').length)
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1)

  // Sync DOM when value changes externally (e.g. "Format" button clicked)
  useEffect(() => {
    const el = editorRef.current
    if (!el || !editable) return
    if (skipNextSync.current) { skipNextSync.current = false; return }
    el.innerHTML = getHighlighted(value)
  })

  // On first mount, set content
  useEffect(() => {
    const el = editorRef.current
    if (!el || !editable) return
    el.innerHTML = getHighlighted(value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleInput = useCallback(() => {
    if (isComposing.current) return
    const el = editorRef.current
    if (!el) return

    // Save caret before we re-highlight
    const caretOffset = saveCaretOffset(el)

    const raw = el.innerText ?? ''
    const normalized = raw.endsWith('\n') ? raw.slice(0, -1) : raw

    // Re-highlight in place
    el.innerHTML = getHighlighted(normalized)

    // Restore caret
    restoreCaretOffset(el, caretOffset)

    // Tell parent — but skip the next useEffect sync since we already updated DOM
    skipNextSync.current = true
    onChange?.(normalized)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onChange, language])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      document.execCommand('insertText', false, '  ')
    }
  }, [])

  if (editable) {
    return (
      <>
        <style>{SH_STYLES}</style>
        <div className={`sh-editor-wrap ${className}`}>
          {showLineNumbers && (
            <div className="sh-line-nums">
              {lineNumbers.map((n) => <div key={n}>{n}</div>)}
            </div>
          )}
          <div className="sh-editor-cell">
            <div
              ref={editorRef}
              contentEditable={!readOnly}
              suppressContentEditableWarning
              spellCheck={false}
              data-placeholder={placeholder}
              className="sh-editable"
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => { isComposing.current = true }}
              onCompositionEnd={() => { isComposing.current = false; handleInput() }}
            />
          </div>
        </div>
      </>
    )
  }

  // ── Read-only ──
  return (
    <>
      <style>{SH_STYLES}</style>
      <div className={`sh-editor-wrap ${className}`}>
        {showLineNumbers && (
          <div className="sh-line-nums">
            {lineNumbers.map((n) => <div key={n}>{n}</div>)}
          </div>
        )}
        <div
          className="sh-readonly"
          dangerouslySetInnerHTML={{
            __html: value
              ? getHighlighted(value)
              : `<span style="opacity:0.4">${placeholder}</span>`,
          }}
        />
      </div>
    </>
  )
}