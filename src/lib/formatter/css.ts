// CSS Formatting Library

export interface FormatOptions {
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

export const formatPresets: Record<string, Partial<FormatOptions>> = {
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

export const propertyGroups: Record<string, string[]> = {
  layout: ['display', 'position', 'top', 'right', 'bottom', 'left', 'z-index', 'float', 'clear', 'overflow', 'visibility'],
  box: ['width', 'height', 'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'border', 'border-top', 'border-right', 'border-bottom', 'border-left'],
  typography: ['font', 'font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'text-align', 'text-decoration', 'text-transform', 'letter-spacing', 'word-spacing', 'color'],
  visual: ['background', 'background-color', 'background-image', 'background-repeat', 'background-position', 'background-size', 'opacity', 'box-shadow', 'border-radius'],
  animation: ['transition', 'transform', 'animation', 'animation-name', 'animation-duration', 'animation-timing-function', 'animation-delay', 'animation-iteration-count', 'animation-direction'],
}

export const vendorPrefixMap: Record<string, string[]> = {
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

export function hexToRgb(hex: string): string {
  // Expand shorthand #abc → #aabbcc
  const short = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  const full = hex.replace(short, (_, r, g, b) => r + r + g + g + b + b)
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(full)
  if (result) {
    return `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`
  }
  return hex
}

export function hexToHsl(hex: string): string {
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

export function rgbToHex(rgb: string): string {
  const match = rgb.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/)
  if (match) {
    const r = parseInt(match[1])
    const g = parseInt(match[2])
    const b = parseInt(match[3])
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
  }
  return rgb
}

export function convertColors(css: string, targetFormat: string): string {
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

export function optimizeUnits(css: string, optimization: string): string {
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

export function addVendorPrefixes(css: string): string {
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

export function sortProperties(css: string, sorting: string): string {
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

export function minifyCss(css: string): string {
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

export function prettifyCSS(css: string, indentChar: string, sameLineBrace: boolean): string {
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

export function validateCss(css: string): void {
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

export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged'
  content: string
}

export function computeDiff(before: string, after: string): DiffLine[] {
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