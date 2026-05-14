// ─── Types ────────────────────────────────────────────────────────────────────

export type JsonValue = string | number | boolean | null | JsonValue[] | JsonObject;
export type JsonObject = { [key: string]: JsonValue };

export interface JsonStats {
  totalKeys: number;
  maxDepth: number;
  arrayCount: number;
  objectCount: number;
  stringCount: number;
  numberCount: number;
  booleanCount: number;
  nullCount: number;
}

export interface JsonError {
  message: string;
  causeLine: number;
  causeCol: number;
  causeExcerpt: string;
  reportedLine: number | null;
  reportedCol: number | null;
}

export interface JsonProcessResult {
  success: boolean;
  output: string;
  error: JsonError | null;
  stats: JsonStats | null;
  parsedData: JsonValue | null;
  isMinified: boolean;
}

export interface ClearAllResult {
  input: string;
  output: string;
  error: null;
  stats: null;
  parsedData: null;
  isMinified: boolean;
}

// ─── Error Analysis ───────────────────────────────────────────────────────────

export function findBracketErrorLine(
  raw: string
): { line: number; excerpt: string } | null {
  const lines = raw.split('\n')
  const stack: { ch: string; pos: number; line: number; indent: number }[] = []
  let inString = false
  let escape = false
  let lineNum = 1

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]

    if (ch === '\n') { lineNum++; continue }
    if (escape)       { escape = false; continue }
    if (ch === '\\')  { escape = true;  continue }
    if (inString) { if (ch === '"') inString = false; continue }
    if (ch === '"')   { inString = true; continue }

    if (ch === '{' || ch === '[') {
      const lineContent = lines[lineNum - 1] ?? ''
      const indent = lineContent.match(/^(\s*)/)?.[1].length ?? 0
      stack.push({ ch, pos: i, line: lineNum, indent })

    } else if ((ch === '}' || ch === ']') && stack.length > 0) {
      const lineContent = lines[lineNum - 1] ?? ''
      const closerIndent = lineContent.match(/^(\s*)/)?.[1].length ?? 0
      const top = stack[stack.length - 1]

      // Closer is shallower than the opener on the stack
      // → the opener was never closed; it is the root cause
      if (closerIndent < top.indent) {
        return { line: top.line, excerpt: lines[top.line - 1] ?? '' }
      }

      // Extra closing bracket with nothing on the stack would appear below,
      // but we already guard with `stack.length > 0` above. Handle it:
      stack.pop()

    } else if ((ch === '}' || ch === ']') && stack.length === 0) {
      // Unexpected closer — this line itself is the problem
      return { line: lineNum, excerpt: lines[lineNum - 1] ?? '' }
    }
  }

  // Anything left unclosed — report the innermost one
  if (stack.length > 0) {
    const unclosed = stack[stack.length - 1]
    return { line: unclosed.line, excerpt: lines[unclosed.line - 1] ?? '' }
  }

  return null // brackets are balanced; error is something else (value, comma, etc.)
}

export function analyseJsonError(raw: string, parseError: any): JsonError {
  const msg: string = parseError?.message ?? 'Invalid JSON'

  // Extract what the parser itself reported
  let reportedLine: number | null = null
  let reportedCol: number | null = null

  // Chrome/Node modern: "… at position 553 (line 23 column 4)"
  const chromeFull = msg.match(/at position \d+\s*\(line (\d+) column (\d+)\)/i)
  if (chromeFull) {
    reportedLine = parseInt(chromeFull[1], 10)
    reportedCol  = parseInt(chromeFull[2], 10)
  }

  // Chrome/Node older: "… at position 47"
  if (!reportedLine) {
    const posOnly = msg.match(/at position (\d+)/i)
    if (posOnly) {
      const pos = parseInt(posOnly[1], 10)
      const before = raw.substring(0, pos)
      const bLines = before.split('\n')
      reportedLine = bLines.length
      reportedCol  = bLines[bLines.length - 1].length + 1
    }
  }

  // Firefox: "… at line N column N"
  if (!reportedLine) {
    const ff = msg.match(/at line (\d+) column (\d+)/i)
    if (ff) { reportedLine = parseInt(ff[1], 10); reportedCol = parseInt(ff[2], 10) }
  }

  // Try to find the bracket root cause first
  const bracketError = findBracketErrorLine(raw)

  if (bracketError) {
    return {
      message: msg,
      causeLine:    bracketError.line,
      causeCol:     1,
      causeExcerpt: bracketError.excerpt,
      reportedLine,
      reportedCol,
    }
  }

  // Fallback: use the parser's reported position (accurate for non-bracket errors)
  const fallbackLine = reportedLine ?? 1
  const fallbackCol  = reportedCol  ?? 1
  return {
    message: msg,
    causeLine:    fallbackLine,
    causeCol:     fallbackCol,
    causeExcerpt: raw.split('\n')[fallbackLine - 1] ?? '',
    reportedLine,
    reportedCol,
  }
}

export interface DuplicateKeyInfo {
  key: string
  line: number
  column: number
  firstOccurrenceLine: number
  firstOccurrenceColumn: number
}

export function findDuplicateJsonKey(raw: string): DuplicateKeyInfo | null {
  type StackFrame =
    | { type: 'object'; keys: Map<string, { line: number; column: number }>; expectingKey: boolean }
    | { type: 'array' }

  const stack: StackFrame[] = []
  let line = 1
  let column = 1

  const readString = (startIndex: number) => {
    let i = startIndex + 1
    let currentLine = line
    let currentColumn = column + 1
    let escaped = false
    let value = ''

    while (i < raw.length) {
      const ch = raw[i]
      if (ch === '\n') {
        currentLine++
        currentColumn = 1
        value += ch
        i++
        continue
      }

      if (escaped) {
        escaped = false
        value += ch
        currentColumn++
        i++
        continue
      }

      if (ch === '\\') {
        escaped = true
        currentColumn++
        i++
        continue
      }

      if (ch === '"') {
        return {
          value,
          endIndex: i,
          line: currentLine,
          column: currentColumn + 1,
        }
      }

      value += ch
      currentColumn++
      i++
    }

    return {
      value,
      endIndex: raw.length - 1,
      line: currentLine,
      column: currentColumn,
    }
  }

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]
    if (ch === '\n') {
      line++
      column = 1
      continue
    }

    if (/\s/.test(ch)) {
      column++
      continue
    }

    if (ch === '"') {
      const keyStartLine = line
      const keyStartColumn = column
      const result = readString(i)
      const key = result.value
      i = result.endIndex
      line = result.line
      column = result.column

      const top = stack[stack.length - 1]
      const isKey = top?.type === 'object' && top.expectingKey
      if (isKey) {
        const existing = top.keys.get(key)
        if (existing) {
          return {
            key,
            line: keyStartLine,
            column: keyStartColumn,
            firstOccurrenceLine: existing.line,
            firstOccurrenceColumn: existing.column,
          }
        }

        top.keys.set(key, { line: keyStartLine, column: keyStartColumn })
        top.expectingKey = false
      }

      continue
    }

    if (ch === '{') {
      stack.push({ type: 'object', keys: new Map(), expectingKey: true })
      column++
      continue
    }

    if (ch === '[') {
      stack.push({ type: 'array' })
      column++
      continue
    }

    if (ch === '}') {
      stack.pop()
      column++
      continue
    }

    if (ch === ']') {
      stack.pop()
      column++
      continue
    }

    if (ch === ':') {
      const top = stack[stack.length - 1]
      if (top?.type === 'object') top.expectingKey = false
      column++
      continue
    }

    if (ch === ',') {
      const top = stack[stack.length - 1]
      if (top?.type === 'object') top.expectingKey = true
      column++
      continue
    }

    column++
  }

  return null
}

export function analyseDuplicateKeyError(raw: string, info: DuplicateKeyInfo): JsonError {
  return {
    message: `Duplicate key "${info.key}" found at line ${info.line}, column ${info.column}. First occurrence was at line ${info.firstOccurrenceLine}, column ${info.firstOccurrenceColumn}.`,
    causeLine: info.line,
    causeCol: info.column,
    causeExcerpt: raw.split('\n')[info.line - 1] ?? '',
    reportedLine: null,
    reportedCol: null,
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────────

export function computeStats(obj: JsonValue, depth = 0, stats: JsonStats = {
  totalKeys: 0, maxDepth: 0, arrayCount: 0, objectCount: 0,
  stringCount: 0, numberCount: 0, booleanCount: 0, nullCount: 0
}): JsonStats {
  stats.maxDepth = Math.max(stats.maxDepth, depth)
  if (Array.isArray(obj)) {
    stats.arrayCount++
    obj.forEach(item => computeStats(item, depth + 1, stats))
  } else if (obj !== null && typeof obj === 'object') {
    stats.objectCount++
    Object.keys(obj as JsonObject).forEach(k => { stats.totalKeys++; computeStats((obj as JsonObject)[k], depth + 1, stats) })
  } else if (typeof obj === 'string')  stats.stringCount++
  else if (typeof obj === 'number')    stats.numberCount++
  else if (typeof obj === 'boolean')   stats.booleanCount++
  else if (obj === null)               stats.nullCount++
  return stats
}

// ─── Syntax Highlighting ──────────────────────────────────────────────────────

export function syntaxHighlightJson(json: string): string {
  return json
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/("((?:[^"\\]|\\.)*)")\s*:/g, (_, full) => `<span class="json-key">${full}</span>:`)
    .replace(/:\s*("(?:[^"\\]|\\\\)*")/g, (_, val) => `: <span class="json-string">${val}</span>`)
    .replace(/:\s*(-?\d+\.?\d*(?:[eE][+-]?\d+)?)/g, `: <span class="json-number">$1</span>`)
    .replace(/:\s*(true|false)/g, `: <span class="json-boolean">$1</span>`)
    .replace(/:\s*(null)/g, `: <span class="json-null">$1</span>`)
}

// ─── Curl Parser ─────────────────────────────────────────────────────────────

export interface ParsedCurl { 
  url: string; 
  method: string; 
  headers: Record<string, string>; 
  body: string | null 
}

export function parseCurl(input: string): ParsedCurl | null {
  const raw = input.trim()
  if (!raw.startsWith('curl')) return null
  const n = raw.replace(/\\\s*\n\s*/g, ' ')
  const result: ParsedCurl = { url: '', method: 'GET', headers: {}, body: null }
  const urlM = n.match(/curl\s+(?:--\S+\s+(?:'[^']*'|"[^"]*"|\S+)\s+)*['"]?(https?:\/\/[^\s'"]+)['"]?/)
    || n.match(/['"]?(https?:\/\/[^\s'"]+)['"]?/)
  if (urlM) result.url = urlM[1]
  const mM = n.match(/-X\s+(\w+)|--request\s+(\w+)/i)
  if (mM) result.method = (mM[1] || mM[2]).toUpperCase()
  const hRe = /(?:-H|--header)\s+['"]([^'"]+)['"]/g; let hm
  while ((hm = hRe.exec(n)) !== null) {
    const ci = hm[1].indexOf(':')
    if (ci > -1) result.headers[hm[1].slice(0, ci).trim()] = hm[1].slice(ci + 1).trim()
  }
  const bm = n.match(/(?:-d|--data|--data-raw|--data-binary)\s+['"]([\s\S]*?)['"]\s*(?:--|$|-[A-Za-z]|$)/)
    || n.match(/(?:-d|--data|--data-raw|--data-binary)\s+'([\s\S]*?)'\s*$/)
  if (bm) result.body = bm[1]
  if (result.body && !mM) result.method = 'POST'
  return result.url ? result : null
}

// ─── Main Processing Functions ─────────────────────────────────────────────────

export function processJson(raw: string, indent = 2): JsonProcessResult {
  try {
    if (!raw.trim()) {
      // Return empty result for empty input
      return {
        success: true,
        output: '',
        error: null,
        stats: null,
        parsedData: null,
        isMinified: false
      }
    }
    const parsed = JSON.parse(raw);
    const duplicateKey = findDuplicateJsonKey(raw)
    if (duplicateKey) {
      return {
        success: false,
        output: '',
        error: analyseDuplicateKeyError(raw, duplicateKey),
        stats: null,
        parsedData: null,
        isMinified: false,
      }
    }
    return {
      success: true,
      output: JSON.stringify(parsed, null, indent),
      error: null,
      stats: computeStats(parsed),
      parsedData: parsed,
      isMinified: false
    }
  } catch (err: any) {
    return {
      success: false,
      output: '',
      error: analyseJsonError(raw, err),
      stats: null,
      parsedData: null,
      isMinified: false
    }
  }
}

export function minifyJson(input: string): JsonProcessResult {
  try {
    const parsed = JSON.parse(input)
    const duplicateKey = findDuplicateJsonKey(input)
    if (duplicateKey) {
      return {
        success: false,
        output: '',
        error: analyseDuplicateKeyError(input, duplicateKey),
        stats: null,
        parsedData: null,
        isMinified: false,
      }
    }
    return {
      success: true,
      output: JSON.stringify(parsed),
      error: null,
      stats: computeStats(parsed),
      parsedData: parsed,
      isMinified: true
    }
  } catch (err: any) {
    return {
      success: false,
      output: '',
      error: analyseJsonError(input, err),
      stats: null,
      parsedData: null,
      isMinified: false
    }
  }
}

export function clearAll(): ClearAllResult {
  return {
    input: '',
    output: '',
    error: null,
    stats: null,
    parsedData: null,
    isMinified: false
  }
}