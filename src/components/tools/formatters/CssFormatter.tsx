'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface FormatOptions {
  indentType: 'spaces' | 'tabs'
  indentSize: number
  braceStyle: 'same-line' | 'new-line'
  propertySorting: 'none' | 'alphabetical' | 'grouped'
  colorFormat: 'original' | 'hex' | 'rgb' | 'hsl'
  unitOptimization: 'none' | 'px-to-rem' | 'px-to-em'
  minify: boolean
  vendorPrefixing: boolean
  preset: 'custom' | 'google' | 'airbnb' | 'bootstrap'
}

const formatPresets: Record<string, Partial<FormatOptions>> = {
  google: {
    indentType: 'spaces',
    indentSize: 2,
    braceStyle: 'new-line',
    propertySorting: 'alphabetical',
  },
  airbnb: {
    indentType: 'spaces',
    indentSize: 2,
    braceStyle: 'same-line',
    propertySorting: 'grouped',
  },
  bootstrap: {
    indentType: 'tabs',
    indentSize: 4,
    braceStyle: 'same-line',
    propertySorting: 'none',
  },
}

const propertyGroups: Record<string, string[]> = {
  layout: ['display', 'position', 'top', 'right', 'bottom', 'left', 'z-index', 'float', 'clear', 'overflow', 'visibility'],
  box: ['width', 'height', 'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'border', 'border-top', 'border-right', 'border-bottom', 'border-left'],
  typography: ['font', 'font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'text-align', 'text-decoration', 'text-transform', 'letter-spacing', 'word-spacing', 'color'],
  visual: ['background', 'background-color', 'background-image', 'background-repeat', 'background-position', 'background-size', 'opacity', 'box-shadow', 'border-radius'],
  animation: ['transition', 'transform', 'animation', 'animation-name', 'animation-duration', 'animation-timing-function', 'animation-delay', 'animation-iteration-count', 'animation-direction'],
}

const vendorPrefixMap: Record<string, string[]> = {
  'border-radius': ['-webkit-border-radius', '-moz-border-radius'],
  'box-shadow': ['-webkit-box-shadow', '-moz-box-shadow'],
  'transform': ['-webkit-transform', '-moz-transform', '-ms-transform'],
  'transition': ['-webkit-transition', '-moz-transition', '-o-transition'],
  'animation': ['-webkit-animation', '-moz-animation', '-o-animation'],
  'box-sizing': ['-webkit-box-sizing', '-moz-box-sizing'],
  'background-size': ['-webkit-background-size', '-moz-background-size', '-o-background-size'],
  'user-select': ['-webkit-user-select', '-moz-user-select', '-ms-user-select'],
  'flex': ['-webkit-flex', '-ms-flex'],
  'flex-direction': ['-webkit-flex-direction', '-ms-flex-direction'],
  'justify-content': ['-webkit-justify-content', '-ms-justify-content'],
  'align-items': ['-webkit-align-items', '-ms-flex-align'],
  'grid-template-columns': ['-ms-grid-columns'],
  'grid-template-rows': ['-ms-grid-rows'],
}

// ─── Color helpers ────────────────────────────────────────────────────────────

function hexToRgb(hex: string): string {
  // Expand shorthand #abc → #aabbcc
  const short = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  const full = hex.replace(short, (_, r, g, b) => r + r + g + g + b + b)
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(full)
  if (result) {
    return `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`
  }
  return hex
}

function hexToHsl(hex: string): string {
  const short = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  const full = hex.replace(short, (_, r, g, b) => r + r + g + g + b + b)
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(full)
  if (!result) return hex
  let r = parseInt(result[1], 16) / 255
  let g = parseInt(result[2], 16) / 255
  let b = parseInt(result[3], 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
}

function rgbToHex(rgb: string): string {
  const match = rgb.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/)
  if (match) {
    const r = parseInt(match[1])
    const g = parseInt(match[2])
    const b = parseInt(match[3])
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
  }
  return rgb
}

function convertColors(css: string, targetFormat: string): string {
  if (targetFormat === 'original') return css
  return css.replace(/#([a-f\d]{3}|[a-f\d]{6})\b|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/gi, (match) => {
    if (match.startsWith('#')) {
      if (targetFormat === 'rgb') return hexToRgb(match)
      if (targetFormat === 'hsl') return hexToHsl(match)
      return match // hex → hex
    } else if (match.startsWith('rgb')) {
      if (targetFormat === 'hex') return rgbToHex(match)
      if (targetFormat === 'hsl') return hexToHsl(rgbToHex(match))
      return match // rgb → rgb
    }
    return match
  })
}

// ─── Unit optimization ────────────────────────────────────────────────────────

function optimizeUnits(css: string, optimization: string): string {
  if (optimization === 'none') return css
  const base = 16
  return css.replace(/(\d+(?:\.\d+)?)px\b/g, (_, value) => {
    const px = parseFloat(value)
    if (px === 0) return '0' // 0px → 0 (no unit needed)
    const converted = px / base
    return `${parseFloat(converted.toFixed(4))}${optimization === 'px-to-rem' ? 'rem' : 'em'}`
  })
}

// ─── Vendor prefixing ─────────────────────────────────────────────────────────

function addVendorPrefixes(css: string): string {
  const lines = css.split('\n')
  const result: string[] = []
  for (const line of lines) {
    const trimmed = line.trim()
    // Match property declarations (not selectors or closing braces or at-rules)
    const declMatch = trimmed.match(/^([\w-]+)\s*:\s*(.+?);?\s*$/)
    if (declMatch && !trimmed.startsWith('@') && !trimmed.startsWith('}') && !trimmed.startsWith('//')) {
      const property = declMatch[1]
      const rest = trimmed.substring(property.length) // ": value;" portion
      const indent = line.substring(0, line.length - line.trimStart().length)
      const prefixes = vendorPrefixMap[property]
      if (prefixes) {
        for (const prefix of prefixes) {
          result.push(`${indent}${prefix}${rest}`)
        }
      }
    }
    result.push(line)
  }
  return result.join('\n')
}

// ─── Property sorting ─────────────────────────────────────────────────────────

function sortProperties(css: string, sorting: string): string {
  if (sorting === 'none') return css

  // Parse the CSS into blocks (selector + declarations) without losing structure
  // Strategy: tokenize by `{` and `}`, sort declarations inside each rule block
  const result: string[] = []
  let i = 0
  const chars = css.split('')

  while (i < chars.length) {
    // Find next `{`
    let openIdx = css.indexOf('{', i)
    if (openIdx === -1) {
      result.push(css.slice(i))
      break
    }

    // Push selector (and any whitespace/newlines before `{`)
    result.push(css.slice(i, openIdx + 1))
    i = openIdx + 1

    // Find matching `}` (handle nesting for @rules)
    let depth = 1
    let j = i
    while (j < css.length && depth > 0) {
      if (css[j] === '{') depth++
      else if (css[j] === '}') depth--
      j++
    }
    // Block content is css.slice(i, j-1), closing `}` is at j-1
    const blockContent = css.slice(i, j - 1)

    // Sort declarations inside this block
    const sortedBlock = sortDeclarations(blockContent, sorting)
    result.push(sortedBlock)
    result.push('}')
    i = j
  }

  return result.join('')
}

function sortDeclarations(block: string, sorting: string): string {
  // Split into lines, preserving empties for spacing
  const lines = block.split('\n')
  const declarations: string[] = []
  const others: string[] = [] // nested rules etc.

  for (const line of lines) {
    const t = line.trim()
    if (t === '') continue
    if (t.includes(':') && !t.includes('{')) {
      declarations.push(line)
    } else {
      others.push(line)
    }
  }

  if (sorting === 'alphabetical') {
    declarations.sort((a, b) => {
      const pa = a.trim().split(':')[0].trim()
      const pb = b.trim().split(':')[0].trim()
      return pa.localeCompare(pb)
    })
  } else if (sorting === 'grouped') {
    const groupOrder = ['layout', 'box', 'typography', 'visual', 'animation']
    const grouped: Record<string, string[]> = {}
    const ungrouped: string[] = []

    for (const decl of declarations) {
      const prop = decl.trim().split(':')[0].trim()
      let placed = false
      for (const groupName of groupOrder) {
        if (propertyGroups[groupName].includes(prop)) {
          if (!grouped[groupName]) grouped[groupName] = []
          grouped[groupName].push(decl)
          placed = true
          break
        }
      }
      if (!placed) ungrouped.push(decl)
    }

    declarations.length = 0
    for (const groupName of groupOrder) {
      if (grouped[groupName]) declarations.push(...grouped[groupName])
    }
    declarations.push(...ungrouped)
  }

  return [...others, ...declarations].join('\n')
}

// ─── Minify ───────────────────────────────────────────────────────────────────

function minifyCss(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/\s+/g, ' ')             // Collapse whitespace
    .replace(/\s*{\s*/g, '{')
    .replace(/\s*}\s*/g, '}')
    .replace(/\s*;\s*/g, ';')
    .replace(/\s*:\s*/g, ':')
    .replace(/\s*,\s*/g, ',')
    .replace(/;}/g, '}')              // Remove last semicolon before }
    .trim()
}

// ─── Pretty-print ─────────────────────────────────────────────────────────────
// Replaces the buggy "getCurrentIndentation + line-map" approach with a proper
// character-by-character pretty-printer.

function prettifyCSS(css: string, indentChar: string, sameLineBrace: boolean): string {
  // First normalise the input: strip redundant whitespace so we have a
  // consistent token stream to work with.
  const flat = css
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m) // keep comments intact
    .replace(/\s+/g, ' ')
    .trim()

  const out: string[] = []
  let depth = 0
  let i = 0

  const indent = () => indentChar.repeat(depth)
  const nl = () => '\n'

  while (i < flat.length) {
    const ch = flat[i]

    if (ch === '/' && flat[i + 1] === '*') {
      // CSS comment — copy verbatim until */
      const end = flat.indexOf('*/', i + 2)
      const comment = end === -1 ? flat.slice(i) : flat.slice(i, end + 2)
      out.push(indent() + comment.trim())
      out.push(nl())
      i = end === -1 ? flat.length : end + 2
      continue
    }

    if (ch === '{') {
      if (sameLineBrace) {
        // ensure exactly one space before {
        if (out.length && out[out.length - 1].trimEnd().endsWith(' ')) {
          out[out.length - 1] = out[out.length - 1].trimEnd()
        }
        out.push(' {')
      } else {
        out.push(nl() + indent() + '{')
      }
      out.push(nl())
      depth++
      out.push(indent())
      i++
      // skip whitespace after {
      while (i < flat.length && flat[i] === ' ') i++
      continue
    }

    if (ch === '}') {
      // Remove trailing indent/spaces added speculatively at the last ;
      while (out.length && out[out.length - 1].trim() === '') out.pop()
      depth = Math.max(0, depth - 1)
      out.push(nl() + indent() + '}')
      out.push(nl())
      i++
      // skip whitespace after }
      while (i < flat.length && flat[i] === ' ') i++
      if (flat[i] && flat[i] !== '}') out.push(nl()) // blank line between rules
      continue
    }

    if (ch === ';') {
      out.push(';')
      out.push(nl())
      i++
      while (i < flat.length && flat[i] === ' ') i++
      if (i < flat.length && flat[i] !== '}') {
        out.push(indent())
      }
      continue
    }

    out.push(ch)
    i++
  }

  return out
    .join('')
    .replace(/\n{3,}/g, '\n\n') // collapse 3+ blank lines → max 2
    .trim()
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateCss(css: string): void {
  let braceCount = 0
  let inString = false
  let stringChar = ''
  let inComment = false
  let line = 1

  for (let i = 0; i < css.length; i++) {
    const ch = css[i]
    const next = css[i + 1] ?? ''

    if (ch === '\n') { line++; continue }

    if (inComment) {
      if (ch === '*' && next === '/') { inComment = false; i++ }
      continue
    }

    if (!inString && ch === '/' && next === '*') {
      inComment = true; i++; continue
    }

    if (!inString && (ch === '"' || ch === "'")) {
      inString = true; stringChar = ch; continue
    }

    if (inString) {
      if (ch === stringChar) inString = false
      continue
    }

    if (ch === '{') braceCount++
    else if (ch === '}') {
      braceCount--
      if (braceCount < 0) throw new Error(`Unexpected closing brace '}' at line ${line}`)
    }
  }

  if (inComment) throw new Error('Unclosed CSS comment /* … */')
  if (inString) throw new Error('Unclosed string literal')
  if (braceCount > 0) throw new Error(`${braceCount} unclosed brace${braceCount > 1 ? 's' : ''} '{'`)
}

// ─── Diff helpers ─────────────────────────────────────────────────────────────

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged'
  content: string
}

function computeDiff(before: string, after: string): DiffLine[] {
  const oldLines = before.split('\n')
  const newLines = after.split('\n')
  const result: DiffLine[] = []

  // Simple LCS-based diff (good enough for CSS)
  const m = oldLines.length
  const n = newLines.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  let i = m, j = n
  const ops: DiffLine[] = []
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      ops.push({ type: 'unchanged', content: oldLines[i - 1] })
      i--; j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.push({ type: 'added', content: newLines[j - 1] })
      j--
    } else {
      ops.push({ type: 'removed', content: oldLines[i - 1] })
      i--
    }
  }
  return ops.reverse()
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DiffViewer({ before, after }: { before: string; after: string }) {
  const lines = computeDiff(before, after)
  return (
    <div
      className="rounded-xl border border-border overflow-auto"
      style={{
        background: '#1e1e1e',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: '13px',
        lineHeight: '1.6rem',
        maxHeight: '480px',
      }}
    >
      {lines.map((line, idx) => (
        <div
          key={idx}
          style={{
            background:
              line.type === 'added'   ? 'rgba(40,120,40,0.25)' :
              line.type === 'removed' ? 'rgba(160,40,40,0.25)' :
              'transparent',
            color:
              line.type === 'added'   ? '#89d185' :
              line.type === 'removed' ? '#f48771' :
              '#888',
            display: 'flex',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '2rem',
              textAlign: 'center',
              flexShrink: 0,
              userSelect: 'none',
              opacity: 0.7,
              borderRight: '1px solid #333',
              marginRight: '12px',
            }}
          >
            {line.type === 'added' ? '+' : line.type === 'removed' ? '−' : ' '}
          </span>
          <span style={{ whiteSpace: 'pre', color: line.type === 'unchanged' ? '#666' : undefined }}>
            {line.content}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CssFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [showDiff, setShowDiff] = useState(false)
  const [showLineNumbers, setShowLineNumbers] = useState(false)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [options, setOptions] = useState<FormatOptions>({
    indentType: 'spaces',
    indentSize: 2,
    braceStyle: 'same-line',
    propertySorting: 'none',
    colorFormat: 'original',
    unitOptimization: 'none',
    minify: false,
    vendorPrefixing: false,
    preset: 'custom',
  })

  // ── Format ──────────────────────────────────────────────────────────────────

  const formatCss = useCallback(() => {
    try {
      if (!input.trim()) throw new Error('Please enter CSS content to format')

      validateCss(input)

      let formatted = input

      if (options.vendorPrefixing) formatted = addVendorPrefixes(formatted)
      if (options.colorFormat !== 'original') formatted = convertColors(formatted, options.colorFormat)
      if (options.unitOptimization !== 'none') formatted = optimizeUnits(formatted, options.unitOptimization)
      if (options.propertySorting !== 'none') formatted = sortProperties(formatted, options.propertySorting)

      if (options.minify) {
        formatted = minifyCss(formatted)
      } else {
        const indentChar = options.indentType === 'tabs' ? '\t' : ' '.repeat(Math.max(1, options.indentSize))
        formatted = prettifyCSS(formatted, indentChar, options.braceStyle === 'same-line')
      }

      setOutput(formatted)
      setError('')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error formatting CSS'
      setError(msg)
      setOutput('')
    }
  }, [input, options])

  // ── Auto-format on option changes ───────────────────────────────────────

  useEffect(() => {
    // Auto-reformat when minify or vendorPrefixing changes (and we have output)
    if (output) {
      formatCss()
    }
  }, [options.minify, options.vendorPrefixing, output, formatCss])

  // ── Keyboard shortcuts ───────────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        formatCss()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [formatCss])

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const clearAll = () => { setInput(''); setOutput(''); setError('') }

  const handleCopy = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!output) return
    const blob = new Blob([output], { type: 'text/css' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'formatted.css'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.css') && file.type !== 'text/css') {
      setError('Please select a valid CSS file (.css)')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => setInput(ev.target?.result as string)
    reader.readAsText(file)
    // reset so same file can be re-selected
    e.target.value = ''
  }

  const handlePresetChange = (preset: string) => {
    if (preset !== 'custom' && formatPresets[preset]) {
      setOptions((prev) => ({ ...prev, ...formatPresets[preset], preset: preset as FormatOptions['preset'] }))
    } else {
      setOptions((prev) => ({ ...prev, preset: 'custom' }))
    }
  }

  const handleOptionChange = <K extends keyof FormatOptions>(key: K, value: FormatOptions[K]) => {
    setOptions((prev) => ({ ...prev, [key]: value, preset: 'custom' }))
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">CSS Formatter</h1>
          <p className="text-muted-foreground mb-3">
            Format, validate, and optimize your CSS with advanced options.
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <kbd className="px-2 py-1 bg-muted rounded border border-border">⌘ / Ctrl + Enter — Format</kbd>
          </div>
        </div>

        {/* Options Panel */}
        <div className="mb-6 p-5 border border-border rounded-xl bg-muted/30">
          <h2 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">Formatting Options</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">

            {/* Preset */}
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Preset</span>
              <select
                value={options.preset}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="custom">Custom</option>
                <option value="google">Google Style</option>
                <option value="airbnb">Airbnb Style</option>
                <option value="bootstrap">Bootstrap Style</option>
              </select>
            </label>

            {/* Indentation */}
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Indentation</span>
              <div className="flex gap-2">
                <select
                  value={options.indentType}
                  onChange={(e) => handleOptionChange('indentType', e.target.value as FormatOptions['indentType'])}
                  className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="spaces">Spaces</option>
                  <option value="tabs">Tabs</option>
                </select>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={options.indentSize}
                  disabled={options.indentType === 'tabs'}
                  onChange={(e) => handleOptionChange('indentSize', Math.min(8, Math.max(1, parseInt(e.target.value) || 2)))}
                  className="w-16 h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-40"
                />
              </div>
            </label>

            {/* Brace Style */}
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Brace Style</span>
              <select
                value={options.braceStyle}
                onChange={(e) => handleOptionChange('braceStyle', e.target.value as FormatOptions['braceStyle'])}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="same-line">Same Line</option>
                <option value="new-line">New Line</option>
              </select>
            </label>

            {/* Property Sorting */}
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Property Sorting</span>
              <select
                value={options.propertySorting}
                onChange={(e) => handleOptionChange('propertySorting', e.target.value as FormatOptions['propertySorting'])}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="none">None</option>
                <option value="alphabetical">Alphabetical</option>
                <option value="grouped">Grouped by Type</option>
              </select>
            </label>

            {/* Color Format */}
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Color Format</span>
              <select
                value={options.colorFormat}
                onChange={(e) => handleOptionChange('colorFormat', e.target.value as FormatOptions['colorFormat'])}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="original">Original</option>
                <option value="hex">HEX</option>
                <option value="rgb">RGB</option>
                <option value="hsl">HSL</option>
              </select>
            </label>

            {/* Unit Optimization */}
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Unit Optimization</span>
              <select
                value={options.unitOptimization}
                onChange={(e) => handleOptionChange('unitOptimization', e.target.value as FormatOptions['unitOptimization'])}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="none">None</option>
                <option value="px-to-rem">px → rem</option>
                <option value="px-to-em">px → em</option>
              </select>
            </label>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-3 pt-3 border-t border-border">
            {([
              { key: 'minify', label: 'Minify Output', desc: 'Remove whitespace & comments' },
              { key: 'vendorPrefixing', label: 'Vendor Prefixes', desc: 'Add -webkit-, -moz-, -ms-' },
            ] as const).map(({ key, label, desc }) => (
              <button
                key={key}
                onClick={() => handleOptionChange(key, !options[key])}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                  options[key]
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border text-foreground hover:bg-muted'
                }`}
              >
                <span className={`w-4 h-4 rounded border flex items-center justify-center text-xs ${
                  options[key] ? 'bg-primary-foreground border-primary-foreground text-primary' : 'border-muted-foreground'
                }`}>
                  {options[key] ? '✓' : ''}
                </span>
                <span>{label}</span>
                <span className="text-xs opacity-60 hidden sm:inline">— {desc}</span>
              </button>
            ))}

            <button
              onClick={() => setShowLineNumbers((v) => !v)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                showLineNumbers
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border text-foreground hover:bg-muted'
              }`}
            >
              <span className={`w-4 h-4 rounded border flex items-center justify-center text-xs ${
                showLineNumbers ? 'bg-primary-foreground border-primary-foreground text-primary' : 'border-muted-foreground'
              }`}>
                {showLineNumbers ? '✓' : ''}
              </span>
              Line Numbers
            </button>

            <button
              onClick={() => setShowDiff((v) => !v)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                showDiff
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border text-foreground hover:bg-muted'
              }`}
            >
              <span className={`w-4 h-4 rounded border flex items-center justify-center text-xs ${
                showDiff ? 'bg-primary-foreground border-primary-foreground text-primary' : 'border-muted-foreground'
              }`}>
                {showDiff ? '✓' : ''}
              </span>
              Diff View
            </button>
          </div>
        </div>

        {/* File Upload */}
        <div className="mb-4">
          <input ref={fileInputRef} type="file" accept=".css" onChange={handleFileUpload} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted text-sm transition-colors"
          >
            📁 Upload CSS File
          </button>
        </div>

        {/* Editor Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Input CSS</h2>
              <button
                onClick={clearAll}
                className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors"
              >
                Clear
              </button>
            </div>
            <CodeArea
              value={input}
              onChange={setInput}
              placeholder="Paste your CSS here…"
              showLineNumbers={showLineNumbers}
              readOnly={false}
            />
          </div>

          {/* Output */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Formatted Output</h2>
              {output && (
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors"
                  >
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors"
                  >
                    Download
                  </button>
                </div>
              )}
            </div>
            <CodeArea
              value={output}
              onChange={() => {}}
              placeholder="Formatted CSS will appear here…"
              showLineNumbers={showLineNumbers}
              readOnly={true}
            />
          </div>
        </div>

        {/* Format Button */}
        <div className="mt-4">
          <button
            onClick={formatCss}
            className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            Format CSS
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
            <p className="text-destructive text-sm font-medium">CSS Validation Error: {error}</p>
            <p className="text-destructive/80 text-xs mt-1">
              Common issues: unclosed braces, unmatched quotes, invalid comment syntax.
            </p>
          </div>
        )}

        {/* Diff View */}
        {showDiff && output && (
          <div className="mt-6">
            <div className="mb-3 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Before / After Comparison</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <span className="text-green-600 font-medium">Green (+)</span> lines added,{' '}
                <span className="text-red-600 font-medium">red (−)</span> lines removed, grey lines unchanged.
              </p>
            </div>
            <DiffViewer before={input} after={output} />
          </div>
        )}

        {/* Feature Cards */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold mb-5">Features</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: '🎨', title: 'Color Conversion',
                body: 'Convert between HEX, RGB, and HSL color formats automatically.',
                detail: '#ff0000 → rgb(255, 0, 0) → hsl(0, 100%, 50%)',
              },
              {
                icon: '📏', title: 'Unit Optimization',
                body: 'Convert px values to rem/em for better responsive design.',
                detail: '16px → 1rem  ·  24px → 1.5rem',
              },
              {
                icon: '🏷️', title: 'Vendor Prefixing',
                body: 'Auto-add -webkit-, -moz-, -ms- prefixes for broader compatibility.',
                detail: 'transform → -webkit-transform, -ms-transform',
              },
              {
                icon: '📊', title: 'Property Sorting',
                body: 'Sort declarations alphabetically or by category group.',
                detail: 'Layout → Box → Typography → Visual → Animation',
              },
            ].map(({ icon, title, body, detail }) => (
              <div key={title} className="p-4 border border-border rounded-xl bg-muted/20">
                <div className="text-xl mb-2">{icon}</div>
                <h4 className="font-semibold text-sm mb-1">{title}</h4>
                <p className="text-xs text-muted-foreground mb-2">{body}</p>
                <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded block">{detail}</code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── CSS Syntax Highlighter ───────────────────────────────────────────────────
// Tokenises CSS into spans. Returns an HTML string safe for dangerouslySetInnerHTML.

type TokenType =
  | 'comment'
  | 'at-rule'
  | 'selector'
  | 'property'
  | 'value'
  | 'punctuation'
  | 'color-hex'
  | 'color-fn'
  | 'number'
  | 'unit'
  | 'string'
  | 'important'
  | 'vendor'
  | 'plain'

const TOKEN_COLORS: Record<TokenType, string> = {
  comment:    'var(--sh-comment,   #6a9955)',
  'at-rule':  'var(--sh-at,        #c586c0)',
  selector:   'var(--sh-selector,  #4ec9b0)',
  property:   'var(--sh-property,  #9cdcfe)',
  vendor:     'var(--sh-vendor,    #b5cea8)',
  value:      'var(--sh-value,     #ce9178)',
  string:     'var(--sh-string,    #ce9178)',
  'color-hex':'var(--sh-hex,       #d7ba7d)',
  'color-fn': 'var(--sh-colorfn,   #dcdcaa)',
  number:     'var(--sh-number,    #b5cea8)',
  unit:       'var(--sh-unit,      #4fc1ff)',
  punctuation:'var(--sh-punct,     #d4d4d4)',
  important:  'var(--sh-important, #f44747)',
  plain:      'var(--sh-plain,     #d4d4d4)',
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function span(type: TokenType, content: string): string {
  return `<span style="color:${TOKEN_COLORS[type]}">${esc(content)}</span>`
}

// Highlight a single declaration value (everything after the colon)
function highlightValue(raw: string): string {
  // Process token by token with a regex
  return raw.replace(
    /(\/\*[\s\S]*?\*\/)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")|(#[0-9a-fA-F]{3,8}\b)|((?:rgb|rgba|hsl|hsla|linear-gradient|radial-gradient|conic-gradient|var|calc|clamp|min|max)\s*\()|(!\s*important)|(-(?:webkit|moz|ms|o)-[\w-]+)|([\d.]+)(px|rem|em|vh|vw|vmin|vmax|%|s|ms|deg|fr|ch|ex|turn)?/g,
    (_, comment, str, hex, colorFnStart, imp, vendorVal, num, unit) => {
      if (comment)     return span('comment', comment)
      if (str)         return span('string', str)
      if (hex)         return span('color-hex', hex)
      if (colorFnStart)return span('color-fn', colorFnStart)
      if (imp)         return span('important', imp)
      if (vendorVal)   return span('vendor', vendorVal)
      if (num !== undefined) {
        return span('number', num) + (unit ? span('unit', unit) : '')
      }
      return esc(_)
    }
  )
}

function highlightCSS(css: string): string {
  if (!css) return ''

  const out: string[] = []
  let i = 0
  let inRule = false // inside a { } block

  while (i < css.length) {
    // ── Comment ──────────────────────────────────────────────────────────────
    if (css[i] === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2)
      const tok = end === -1 ? css.slice(i) : css.slice(i, end + 2)
      out.push(span('comment', tok))
      i += tok.length
      continue
    }

    // ── At-rule (@media, @keyframes, …) ──────────────────────────────────────
    if (css[i] === '@') {
      const m = css.slice(i).match(/^@[\w-]+/)
      if (m) {
        out.push(span('at-rule', m[0]))
        i += m[0].length
        continue
      }
    }

    // ── Opening brace ─────────────────────────────────────────────────────────
    if (css[i] === '{') {
      inRule = true
      out.push(span('punctuation', '{'))
      i++
      continue
    }

    // ── Closing brace ─────────────────────────────────────────────────────────
    if (css[i] === '}') {
      inRule = false
      out.push(span('punctuation', '}'))
      i++
      continue
    }

    // ── Inside a rule: property: value; ───────────────────────────────────────
    if (inRule) {
      // Skip whitespace/newlines verbatim
      if (/\s/.test(css[i])) {
        out.push(esc(css[i]))
        i++
        continue
      }

      // Find the colon separating property from value
      const colonIdx = css.indexOf(':', i)
      const semiIdx  = css.indexOf(';', i)
      const closeIdx = css.indexOf('}', i)

      if (colonIdx !== -1 && colonIdx < (semiIdx === -1 ? Infinity : semiIdx) && colonIdx < (closeIdx === -1 ? Infinity : closeIdx)) {
        // property
        const prop = css.slice(i, colonIdx)
        const propTrim = prop.trim()
        const propType: TokenType = propTrim.startsWith('-webkit-') || propTrim.startsWith('-moz-') || propTrim.startsWith('-ms-') || propTrim.startsWith('-o-')
          ? 'vendor'
          : 'property'
        out.push(span(propType, prop))
        out.push(span('punctuation', ':'))
        i = colonIdx + 1

        // value (up to ; or })
        const endOfVal = (() => {
          let j = i
          while (j < css.length && css[j] !== ';' && css[j] !== '}') j++
          return j
        })()
        const val = css.slice(i, endOfVal)
        out.push(highlightValue(val))
        i = endOfVal

        if (css[i] === ';') {
          out.push(span('punctuation', ';'))
          i++
        }
        continue
      }
    }

    // ── Outside a rule: selector text ────────────────────────────────────────
    if (!inRule) {
      // Collect until { or end
      let j = i
      while (j < css.length && css[j] !== '{' && css[j] !== '@') {
        if (css[j] === '/' && css[j + 1] === '*') break
        j++
      }
      if (j > i) {
        out.push(span('selector', css.slice(i, j)))
        i = j
        continue
      }
    }

    // Fallback: emit character as-is
    out.push(esc(css[i]))
    i++
  }

  return out.join('')
}

// ─── Shared constants ─────────────────────────────────────────────────────────

const EDITOR_HEIGHT = 480 // px — fixed height for both panes
const MONO: React.CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontSize: '13px',
  lineHeight: '22px', // fixed px line-height — critical for line-number alignment
}

// ─── InputPane ────────────────────────────────────────────────────────────────
// Plain editable textarea. No overlay tricks — just clean and fast.

function InputPane({
  value,
  onChange,
  placeholder,
  showLineNumbers,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  showLineNumbers: boolean
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const gutterRef   = useRef<HTMLDivElement>(null)
  const lineCount   = Math.max(value.split('\n').length, 1)

  const syncGutter = () => {
    if (gutterRef.current && textareaRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        height: EDITOR_HEIGHT,
        background: '#1e1e1e',
        borderRadius: 12,
        border: '1px solid #333',
        overflow: 'hidden',
      }}
    >
      {/* Gutter */}
      {showLineNumbers && (
        <div
          ref={gutterRef}
          aria-hidden
          style={{
            ...MONO,
            width: 48,
            flexShrink: 0,
            overflowY: 'hidden', // scrolled programmatically
            paddingTop: 12,
            paddingBottom: 12,
            textAlign: 'right',
            paddingRight: 10,
            color: '#555',
            background: '#1a1a1a',
            borderRight: '1px solid #2d2d2d',
            userSelect: 'none',
            boxSizing: 'border-box',
          }}
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i} style={{ height: 22 }}>{i + 1}</div>
          ))}
        </div>
      )}

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={showLineNumbers ? syncGutter : undefined}
        placeholder={placeholder}
        spellCheck={false}
        style={{
          ...MONO,
          flex: 1,
          height: '100%',
          padding: '12px 14px',
          background: 'transparent',
          color: '#d4d4d4',
          caretColor: '#aeafad',
          outline: 'none',
          resize: 'none',
          border: 'none',
          overflowY: 'scroll',
          overflowX: 'auto',
          boxSizing: 'border-box',
          whiteSpace: 'pre',
          wordBreak: 'normal',
          overflowWrap: 'normal',
        }}
      />
    </div>
  )
}

// ─── OutputPane ───────────────────────────────────────────────────────────────
// Syntax-highlighted read-only pane. Uses a single scrollable <pre> — no overlay.

function OutputPane({
  value,
  placeholder,
  showLineNumbers,
}: {
  value: string
  placeholder: string
  showLineNumbers: boolean
}) {
  const preRef    = useRef<HTMLPreElement>(null)
  const gutterRef = useRef<HTMLDivElement>(null)
  const lineCount = Math.max(value.split('\n').length, 1)

  const syncGutter = () => {
    if (gutterRef.current && preRef.current) {
      gutterRef.current.scrollTop = preRef.current.scrollTop
    }
  }

  const highlighted = value ? highlightCSS(value) : ''

  return (
    <div
      style={{
        display: 'flex',
        height: EDITOR_HEIGHT,
        background: '#1e1e1e',
        borderRadius: 12,
        border: '1px solid #333',
        overflow: 'hidden',
      }}
    >
      {/* Gutter */}
      {showLineNumbers && (
        <div
          ref={gutterRef}
          aria-hidden
          style={{
            ...MONO,
            width: 48,
            flexShrink: 0,
            overflowY: 'hidden',
            paddingTop: 12,
            paddingBottom: 12,
            textAlign: 'right',
            paddingRight: 10,
            color: '#555',
            background: '#1a1a1a',
            borderRight: '1px solid #2d2d2d',
            userSelect: 'none',
            boxSizing: 'border-box',
          }}
        >
          {value
            ? Array.from({ length: lineCount }, (_, i) => (
                <div key={i} style={{ height: 22 }}>{i + 1}</div>
              ))
            : null}
        </div>
      )}

      {/* Highlighted pre — split to avoid dangerouslySetInnerHTML + children conflict */}
      {value ? (
        <pre
          ref={preRef}
          onScroll={showLineNumbers ? syncGutter : undefined}
          dangerouslySetInnerHTML={{ __html: highlighted }}
          style={{
            ...MONO,
            flex: 1,
            height: '100%',
            margin: 0,
            padding: '12px 14px',
            color: TOKEN_COLORS.plain,
            background: 'transparent',
            overflowY: 'scroll',
            overflowX: 'auto',
            boxSizing: 'border-box',
            whiteSpace: 'pre',
            wordBreak: 'normal',
          }}
        />
      ) : (
        <pre
          ref={preRef}
          style={{
            ...MONO,
            flex: 1,
            height: '100%',
            margin: 0,
            padding: '12px 14px',
            color: '#555',
            background: 'transparent',
            overflowY: 'scroll',
            overflowX: 'auto',
            boxSizing: 'border-box',
            whiteSpace: 'pre',
            wordBreak: 'normal',
          }}
        >
          {placeholder}
        </pre>
      )}
    </div>
  )
}

// ─── CodeArea (router) ───────────────────────────────────────────────────────
// Keeps the call-site in CssFormatter unchanged.

function CodeArea({
  value,
  onChange,
  placeholder,
  showLineNumbers,
  readOnly,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  showLineNumbers: boolean
  readOnly: boolean
}) {
  if (readOnly) {
    return (
      <OutputPane
        value={value}
        placeholder={placeholder}
        showLineNumbers={showLineNumbers}
      />
    )
  }
  return (
    <InputPane
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      showLineNumbers={showLineNumbers}
    />
  )
}