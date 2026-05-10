"use client"

import { useState, useCallback, useEffect } from "react";
import { CodeEditor } from "@/components/ui/CodeEditor";
import { CopyButton } from "@/components/ui/CopyButton";
import { Download } from "@/components/ui/Download";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";

// ─── Types ────────────────────────────────────────────────────────────────────

type JsonValue = string | number | boolean | null | JsonValue[] | JsonObject;
type JsonObject = { [key: string]: JsonValue };

interface JsonStats {
  totalKeys: number;
  maxDepth: number;
  arrayCount: number;
  objectCount: number;
  stringCount: number;
  numberCount: number;
  booleanCount: number;
  nullCount: number;
}

interface JsonError {
  message: string;
  causeLine: number;
  causeCol: number;
  causeExcerpt: string;
  reportedLine: number | null;
  reportedCol: number | null;
}

// ─── JSON Error Analyser ──────────────────────────────────────────────────────
//
// WHY the naive stack approach fails
// ───────────────────────────────────
// Input (simplified):
//   11:  "geo": {          <- opens at indent 6
//   12:    "lat": "...",
//   13:    "lng": "..."
//   14:                    <- missing closing }
//   15:  },                <- this closer is at indent 4  (belongs to "address", not "geo")
//
// A naive stack just pops on ANY closing bracket, so the "geo" { gets "matched"
// by the "address" closer and no mismatch is detected.
//
// FIX: compare the INDENTATION of the closer vs the opener on top of the stack.
// If the closer is at a shallower indent than the opener, the opener was never
// properly closed — that opener's line is the root cause.
//
// This correctly yields line 11 for the example above, not line 23.
//
function findBracketErrorLine(
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

// ─────────────────────────────────────────────────────────────────────────────

function analyseJsonError(raw: string, parseError: any): JsonError {
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

// ─── Utilities ────────────────────────────────────────────────────────────────

function computeStats(obj: JsonValue, depth = 0, stats: JsonStats = {
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

function SyntaxHighlightedJson({ json }: { json: string }) {
  const highlighted = json
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/("((?:[^"\\]|\\.)*)")\s*:/g, (_, full) => `<span class="json-key">${full}</span>:`)
    .replace(/:\s*("(?:[^"\\]|\\\\)*")/g, (_, val) => `: <span class="json-string">${val}</span>`)
    .replace(/:\s*(-?\d+\.?\d*(?:[eE][+-]?\d+)?)/g, `: <span class="json-number">$1</span>`)
    .replace(/:\s*(true|false)/g, `: <span class="json-boolean">$1</span>`)
    .replace(/:\s*(null)/g, `: <span class="json-null">$1</span>`)
  return (
    <div
      className="w-full h-full font-mono text-sm leading-relaxed p-4 overflow-auto whitespace-pre syntax-output"
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  )
}

// ─── Tree View ────────────────────────────────────────────────────────────────

function TreeNodeRow({ nodeKey, value, depth }: {
  nodeKey: string | number; value: JsonValue; depth: number
}) {
  const [collapsed, setCollapsed] = useState(depth >= 2)
  const isObj = value !== null && typeof value === 'object'
  const isArr = Array.isArray(value)

  const renderValue = () => {
    if (isArr) return <span className="text-blue-500 text-xs">[{(value as JsonValue[]).length}]</span>
    if (isObj) return <span className="text-purple-500 text-xs">{'{' + Object.keys(value as JsonObject).length + '}'}</span>
    if (typeof value === 'string') return <span className="text-green-600 dark:text-green-400">"{value}"</span>
    if (value === null) return <span className="text-gray-400">null</span>
    if (typeof value === 'number') return <span className="text-orange-500">{String(value)}</span>
    if (typeof value === 'boolean') return <span className="text-pink-500">{String(value)}</span>
    return <span>{String(value)}</span>
  }

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-1 py-0.5 px-2 rounded hover:bg-accent/50 cursor-pointer"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => isObj && setCollapsed(!collapsed)}
      >
        {isObj
          ? <span className="text-muted-foreground text-xs w-3 flex-shrink-0">{collapsed ? '▶' : '▼'}</span>
          : <span className="w-3 flex-shrink-0" />}
        <span className="font-medium text-foreground">
          {typeof nodeKey === 'number' ? <span className="text-muted-foreground">[{nodeKey}]</span> : nodeKey}
        </span>
        {!isObj && <><span className="text-muted-foreground mx-1">:</span><span className="truncate max-w-xs">{renderValue()}</span></>}
        {isObj && <span className="text-muted-foreground ml-1">{renderValue()}</span>}
      </div>
      {isObj && !collapsed && (
        <div>
          {isArr
            ? (value as JsonValue[]).map((item, i) => <TreeNodeRow key={i} nodeKey={i} value={item} depth={depth + 1} />)
            : Object.entries(value as JsonObject).map(([k, v]) => <TreeNodeRow key={k} nodeKey={k} value={v} depth={depth + 1} />)}
        </div>
      )}
    </div>
  )
}

function TreeView({ data }: { data: JsonValue }) {
  if (Array.isArray(data))
    return <div className="font-mono text-sm">{(data as JsonValue[]).map((v, i) => <TreeNodeRow key={i} nodeKey={i} value={v} depth={0} />)}</div>
  if (data !== null && typeof data === 'object')
    return <div className="font-mono text-sm">{Object.entries(data as JsonObject).map(([k, v]) => <TreeNodeRow key={k} nodeKey={k} value={v} depth={0} />)}</div>
  return <div className="font-mono text-sm p-4 text-muted-foreground">{String(data)}</div>
}

// ─── Stats Panel ──────────────────────────────────────────────────────────────

function StatsPanel({ stats }: { stats: JsonStats }) {
  const items = [
    { label: 'Total Keys', value: stats.totalKeys,    color: 'text-blue-500'   },
    { label: 'Max Depth',  value: stats.maxDepth,     color: 'text-purple-500' },
    { label: 'Objects',    value: stats.objectCount,  color: 'text-indigo-500' },
    { label: 'Arrays',     value: stats.arrayCount,   color: 'text-cyan-500'   },
    { label: 'Strings',    value: stats.stringCount,  color: 'text-green-500'  },
    { label: 'Numbers',    value: stats.numberCount,  color: 'text-orange-500' },
    { label: 'Booleans',   value: stats.booleanCount, color: 'text-pink-500'   },
    { label: 'Nulls',      value: stats.nullCount,    color: 'text-gray-400'   },
  ]
  return (
    <div className="mt-6 p-4 border rounded-lg bg-muted/30">
      <h3 className="font-semibold mb-3 text-sm">JSON Statistics</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {items.map(({ label, value, color }) => (
          <div key={label} className="flex flex-col items-center p-2 border rounded-md bg-background">
            <span className={`text-xl font-bold ${color}`}>{value}</span>
            <span className="text-xs text-muted-foreground mt-1 text-center">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Curl Parser ─────────────────────────────────────────────────────────────

interface ParsedCurl { url: string; method: string; headers: Record<string, string>; body: string | null }

function parseCurl(input: string): ParsedCurl | null {
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

// ─── URL Fetch Modal ──────────────────────────────────────────────────────────

function UrlFetchModal({ onFetch, onClose }: { onFetch: (json: string) => void; onClose: () => void }) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [parsed, setParsed] = useState<ParsedCurl | null>(null)
  const isCurl = input.trim().startsWith('curl')
  useEffect(() => { setParsed(isCurl ? parseCurl(input) : null) }, [input, isCurl])

  const handleFetch = async () => {
    setLoading(true); setErr('')
    try {
      const url = isCurl && parsed ? parsed.url : input.trim()
      if (!url) throw new Error('Could not extract a valid URL')
      const opts: RequestInit = isCurl && parsed
        ? { method: parsed.method, headers: parsed.headers as HeadersInit, body: parsed.body ?? undefined }
        : {}
      const res = await fetch(url, opts)
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
      const text = await res.text()
      JSON.parse(text)
      onFetch(text); onClose()
    } catch (e: any) { setErr(e.message || 'Failed to fetch JSON') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-background border rounded-xl shadow-xl p-6 w-full max-w-lg mx-4">
        <h3 className="font-semibold text-lg mb-1">Load JSON from URL</h3>
        <p className="text-muted-foreground text-xs mb-4">Paste a plain URL or a full <code className="bg-muted px-1 rounded">curl</code> command.</p>
        <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="https://api.example.com/data.json" rows={5}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring mb-3 resize-none" autoFocus />
        {err && <div className="mb-3 p-2 bg-destructive/10 border border-destructive/20 rounded-md"><p className="text-destructive text-xs">{err}</p></div>}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleFetch} disabled={loading || (isCurl && !parsed?.url)}>{loading ? 'Fetching…' : 'Fetch JSON'}</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Undo/Redo Hook ───────────────────────────────────────────────────────────

function useHistory(initial: string) {
  const [history, setHistory] = useState<string[]>([initial])
  const [index, setIndex] = useState(0)
  const current = history[index]
  const push = useCallback((val: string) => {
    setHistory(h => { const n = h.slice(0, index + 1); n.push(val); return n.slice(-50) })
    setIndex(i => Math.min(i + 1, 49))
  }, [index])
  const undo = useCallback(() => setIndex(i => Math.max(0, i - 1)), [])
  const redo = useCallback(() => setIndex(i => Math.min(history.length - 1, i + 1)), [history.length])
  return { current, push, undo, redo, canUndo: index > 0, canRedo: index < history.length - 1 }
}

// ─── Error Panel ──────────────────────────────────────────────────────────────

function ErrorPanel({ error }: { error: JsonError }) {
  const { causeLine, causeCol, causeExcerpt, reportedLine, reportedCol, message } = error
  const differentLine = reportedLine !== null && reportedLine !== causeLine
  const caretStr = ' '.repeat(Math.max(0, causeCol - 1)) + '^'

  return (
    <div className="h-full p-4 overflow-auto text-sm">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="font-semibold text-destructive">JSON Validation Error</span>
        <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded font-mono">
          Line {causeLine}{causeCol > 1 ? `, col ${causeCol}` : ''}
        </span>
      </div>

      <p className="text-xs text-muted-foreground font-mono mb-4 leading-relaxed break-words">{message}</p>

      <div className="border border-destructive/30 rounded-md overflow-hidden mb-3">
        <div className="bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive">
          Root cause — Line {causeLine}
          {differentLine && (
            <span className="ml-2 font-normal text-muted-foreground opacity-80">
              (parser gave up at line {reportedLine})
            </span>
          )}
        </div>
        <div className="bg-background px-3 py-2 font-mono text-sm overflow-x-auto">
          <div className="text-foreground whitespace-pre">{causeExcerpt || ' '}</div>
          <div className="text-destructive whitespace-pre select-none">{caretStr}</div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Common issues: missing commas, unclosed brackets, trailing commas.
      </p>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

type ViewMode = 'tree' | 'highlighted'

export function JsonFormatter() {
  const inputHistory = useHistory('')
  const [input, setInputRaw] = useState('')
  const [output, setOutput] = useState('')
  const [jsonError, setJsonError] = useState<JsonError | null>(null)
  const [stats, setStats] = useState<JsonStats | null>(null)
  const [parsedData, setParsedData] = useState<JsonValue | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('highlighted')
  const [showUrlModal, setShowUrlModal] = useState(false)

  const setInput = (val: string) => { setInputRaw(val); inputHistory.push(val) }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault(); inputHistory.undo(); setInputRaw(inputHistory.current)
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault(); inputHistory.redo(); setInputRaw(inputHistory.current)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [inputHistory])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const shared = new URLSearchParams(window.location.search).get('json')
    if (shared) { try { const d = decodeURIComponent(atob(shared)); setInputRaw(d); inputHistory.push(d) } catch {} }
  }, [])

  const processJson = (raw: string, indent = 2) => {
    try {
      if (!raw.trim()) {
        // Clear everything for empty input without showing an error
        setOutput('')
        setJsonError(null)
        setStats(null)
        setParsedData(null)
        return true
      }
      const parsed = JSON.parse(raw)
      setOutput(JSON.stringify(parsed, null, indent))
      setJsonError(null)
      setStats(computeStats(parsed))
      setParsedData(parsed)
      return true
    } catch (err: any) {
      setJsonError(analyseJsonError(raw, err))
      setOutput(''); setStats(null); setParsedData(null)
      return false
    }
  }

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed))
      setJsonError(null); setStats(computeStats(parsed)); setParsedData(parsed)
    } catch (err: any) {
      setJsonError(analyseJsonError(input, err))
      setOutput(''); setStats(null); setParsedData(null)
    }
  }

  const clearAll = () => {
    setInputRaw(''); setOutput(''); setJsonError(null); setStats(null); setParsedData(null)
  }

  const viewTabs: { id: ViewMode; label: string }[] = [
    { id: 'highlighted', label: 'Highlighted' },
    { id: 'tree',        label: 'Tree View'   },
  ]

  return (
    <>
      <style>{`
        .syntax-output .json-key     { color: #2563eb; }
        .dark .syntax-output .json-key     { color: #60a5fa; }
        .syntax-output .json-string  { color: #16a34a; }
        .dark .syntax-output .json-string  { color: #4ade80; }
        .syntax-output .json-number  { color: #ea580c; }
        .dark .syntax-output .json-number  { color: #fb923c; }
        .syntax-output .json-boolean { color: #db2777; }
        .dark .syntax-output .json-boolean { color: #f472b6; }
        .syntax-output .json-null    { color: #9ca3af; }
      `}</style>

      {showUrlModal && (
        <UrlFetchModal
          onFetch={json => { setInputRaw(json); inputHistory.push(json) }}
          onClose={() => setShowUrlModal(false)}
        />
      )}

      <div className="container py-8">
        <div className="max-w-6xl mx-auto">
          <Header toolTitle="JSON Formatter" toolDescription="Format, validate, minify, explore, and share JSON data — entirely in your browser." />

          <div className="flex flex-wrap gap-2 mb-4">
            <Button onClick={() => processJson(input, 2)}>Format JSON</Button>
            <Button variant="outline" onClick={minifyJson}>Minify</Button>
            <Button variant="outline" onClick={() => setShowUrlModal(true)}>Load from URL</Button>
            <Button variant="outline" onClick={() => { inputHistory.undo(); setInputRaw(inputHistory.current) }} disabled={!inputHistory.canUndo}>↩ Undo</Button>
            <Button variant="outline" onClick={() => { inputHistory.redo(); setInputRaw(inputHistory.current) }} disabled={!inputHistory.canRedo}>↪ Redo</Button>
            <Button variant="outline" onClick={clearAll}>Clear</Button>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">Input JSON</h2>
                <span className="text-xs text-muted-foreground">Ctrl+Z / Ctrl+Y to undo/redo</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex gap-1 border rounded-md p-0.5 bg-muted/30">
                  {viewTabs.map(tab => (
                    <button key={tab.id} onClick={() => setViewMode(tab.id)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${viewMode === tab.id ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'}`}>
                      {tab.label}
                    </button>
                  ))}
                </div>
                {output && (
                  <div className="flex gap-2">
                    <CopyButton text={output} />
                    <Download content={output} filename="formatted.json" mimeType="application/json" />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input — errorLine highlights the actual root-cause line */}
              <div className="h-96 border border-input rounded-md overflow-hidden">
                <CodeEditor
                  value={input}
                  onChange={setInput}
                  placeholder="Paste your JSON here..."
                  className="h-full"
                  showLineNumbers={true}
                  errorLine={jsonError?.causeLine ?? null}
                />
              </div>

              {/* Output */}
              <div className="h-96 border border-input rounded-md bg-background overflow-hidden">
                {jsonError && <ErrorPanel error={jsonError} />}
                {!jsonError && viewMode === 'highlighted' && output && (
                  <div className="h-full overflow-auto"><SyntaxHighlightedJson json={output} /></div>
                )}
                {!jsonError && viewMode === 'highlighted' && !output && (
                  <div className="h-full p-4 text-muted-foreground text-sm font-mono flex items-center justify-center">
                    Format JSON first to see syntax highlighting
                  </div>
                )}
                {!jsonError && viewMode === 'tree' && parsedData !== null && (
                  <div className="h-full overflow-auto py-2"><TreeView data={parsedData} /></div>
                )}
                {!jsonError && viewMode === 'tree' && parsedData === null && (
                  <div className="h-full p-4 text-muted-foreground text-sm font-mono flex items-center justify-center">
                    Format JSON first to see tree view
                  </div>
                )}
              </div>
            </div>
          </div>

          {stats && <StatsPanel stats={stats} />}

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Syntax Highlighting',  desc: 'Keys, strings, numbers, booleans, and nulls are color-coded for quick scanning.' },
              { title: 'Tree Explorer',         desc: 'Collapsible tree view for navigating large nested JSON structures.' },
              { title: 'Smart Error Detection', desc: 'Finds the unclosed bracket (root cause), not just where the parser gave up.' },
              { title: 'JSON Statistics',       desc: 'Shows key count, max depth, array lengths, and data type breakdown.' },
              { title: 'Undo / Redo',           desc: 'Full edit history with Ctrl+Z / Ctrl+Y keyboard shortcuts.' },
              { title: 'Load from URL',         desc: 'Fetch JSON directly from any public API endpoint or URL.' },
              { title: 'Pretty Print & Minify', desc: 'Format with proper indentation or strip all whitespace for production.' },
            ].map(({ title, desc }) => (
              <div key={title} className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}