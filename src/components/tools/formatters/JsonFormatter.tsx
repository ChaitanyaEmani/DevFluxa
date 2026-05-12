"use client"

import { useState, useCallback, useEffect } from "react";
import { CodeEditor } from "@/components/ui/CodeEditor";
import { CopyButton } from "@/components/ui/CopyButton";
import { Download } from "@/components/ui/Download";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { 
  processJson, 
  minifyJson, 
  clearAll, 
  syntaxHighlightJson,
  parseCurl,
  type JsonValue,
  type JsonObject,
  type JsonStats,
  type JsonError,
  type ParsedCurl,
} from "@/lib/formatter/json";
// ─── Types ────────────────────────────────────────────────────────────────────


// ─── Component Types ───────────────────────────────────────────────────────────

type ViewMode = 'tree' | 'highlighted'

function SyntaxHighlightedJson({ json }: { json: string }) {
  const highlighted = syntaxHighlightJson(json)
  return (
    <div
      className="w-full h-full font-mono text-sm leading-relaxed p-4 overflow-auto whitespace-pre syntax-output"
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  );
}

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
        <textarea 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          placeholder="https://api.example.com/data.json" 
          rows={5}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring mb-3 resize-none" 
          autoFocus 
        />
        {err && <div className="mb-3 p-2 bg-destructive/10 border border-destructive/20 rounded-md"><p className="text-destructive text-xs">{err}</p></div>}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleFetch} disabled={loading || (isCurl && !parsed?.url)}>{loading ? 'Fetching…' : 'Fetch JSON'}</Button>
        </div>
      </div>
    </div>
  )
}

function useHistory(initial: string) {
  const [history, setHistory] = useState<string[]>([initial])
  const [index, setIndex] = useState(0)

  const current = history[index]

  const push = useCallback((val: string) => {
    setHistory(prev => {
      // avoid duplicate consecutive entries
      if (prev[index] === val) return prev

      const next = prev.slice(0, index + 1)
      next.push(val)

      // keep max 50 entries
      return next.slice(-50)
    })

    setIndex(prev => Math.min(prev + 1, 49))
  }, [index])

  const undo = useCallback(() => {
    setIndex(prev => Math.max(prev - 1, 0))
  }, [])

  const redo = useCallback(() => {
    setIndex(prev => Math.min(prev + 1, history.length - 1))
  }, [history.length])

  return {
    current,
    push,
    undo,
    redo,
    canUndo: index > 0,
    canRedo: index < history.length - 1,
  }
}

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

export function JsonFormatter() {
  const inputHistory = useHistory('')
  const [input, setInputRaw] = useState('')
  const [output, setOutput] = useState('')
  const [jsonError, setJsonError] = useState<JsonError | null>(null)
  const [stats, setStats] = useState<JsonStats | null>(null)
  const [parsedData, setParsedData] = useState<JsonValue | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('highlighted')
  const [showUrlModal, setShowUrlModal] = useState(false)
  const [isMinified, setIsMinified] = useState(false)

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

  const handleProcessJson = (raw: string, indent = 2) => {
    const result = processJson(raw, indent)
    if (result.success) {
      setOutput(result.output)
      setJsonError(result.error)
      setStats(result.stats)
      setParsedData(result.parsedData)
      setIsMinified(result.isMinified)
    } else {
      setOutput(result.output)
      setJsonError(result.error)
      setStats(result.stats)
      setParsedData(result.parsedData)
      setIsMinified(result.isMinified)
    }
    return result.success
  }

  const handleMinifyJson = () => {
    const result = minifyJson(input)
    setOutput(result.output)
    setJsonError(result.error)
    setStats(result.stats)
    setParsedData(result.parsedData)
    setIsMinified(result.isMinified)
    if (result.success) {
      setViewMode('highlighted')
    }
  }

  const handleClearAll = () => {
    const result = clearAll()
    setInputRaw(result.input)
    setOutput(result.output)
    setJsonError(result.error)
    setStats(result.stats)
    setParsedData(result.parsedData)
    setIsMinified(result.isMinified)
  }

  const viewTabs: { id: ViewMode; label: string }[] = [
    { id: 'highlighted', label: 'Highlighted' },
    ...(isMinified ? [] : [{ id: 'tree' as ViewMode, label: 'Tree View'   }]),
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

          <div className="flex gap-2 mb-6">
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => handleProcessJson(input, 2)} className="shadow-sm hover:shadow-md transition-all duration-200 bg-primary hover:bg-primary/90 flex-1 sm:flex-none">
                <span className="mr-2 hidden sm:inline">✨</span>Format JSON
              </Button>
              {viewMode !== 'tree' && (
                <Button variant="outline" onClick={handleMinifyJson} className="shadow-sm hover:shadow-md transition-all duration-200 border-2 hover:border-primary/50 flex-1 sm:flex-none">
                  <span className="mr-2 hidden sm:inline">📦</span>Minify
                </Button>
              )}
              <Button variant="outline" onClick={() => setShowUrlModal(true)} className="shadow-sm hover:shadow-md transition-all duration-200 border-2 hover:border-primary/50 flex-1 sm:flex-none">
                <span className="mr-2 hidden sm:inline">🌐</span>Load URL
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3 sm:ml-auto">
              <Button variant="outline" onClick={handleClearAll} className="shadow-sm hover:shadow-md transition-all duration-200 border-2 hover:border-destructive/50 text-destructive hover:bg-destructive/5 flex-1 sm:flex-none">
                <span className="mr-2 hidden sm:inline">🗑️</span>Clear
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Input JSON</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">Ctrl+Z / Ctrl+Y to undo/redo</span>
                  <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">Auto-bracket completion</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex gap-1 p-1 bg-muted/20 rounded-lg border border-border/50 w-full sm:w-auto">
                  {viewTabs.map(tab => (
                    <button key={tab.id} onClick={() => setViewMode(tab.id)}
                      className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm rounded-md transition-all duration-200 font-medium ${
                        viewMode === tab.id 
                          ? 'bg-background shadow-sm text-primary border border-primary/20' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                      }`}>
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

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              {/* Input — errorLine highlights the actual root-cause line */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative h-80 sm:h-96 lg:h-[32rem] border-2 border-border/50 rounded-lg overflow-hidden bg-background/50 backdrop-blur-sm">
                  <CodeEditor
                    value={input}
                    onChange={setInput}
                    placeholder="Paste your JSON here... or try typing {&quot;example&quot;: &quot;data&quot;}"
                    className="h-full"
                    showLineNumbers={true}
                    errorLine={jsonError?.causeLine ?? null}
                  />
                </div>
              </div>

              {/* Output */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative h-80 sm:h-96 lg:h-[32rem] border-2 border-border/50 rounded-lg bg-background/50 backdrop-blur-sm overflow-hidden">
                  {jsonError && <ErrorPanel error={jsonError} />}
                  {!jsonError && viewMode === 'highlighted' && output && (
                    <div className="h-full overflow-auto"><SyntaxHighlightedJson json={output} /></div>
                  )}
                  {!jsonError && viewMode === 'highlighted' && !output && (
                    <div className="h-full p-4 text-muted-foreground text-sm font-mono flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl sm:text-4xl mb-2">🎨</div>
                        <div className="text-sm sm:text-base">Format JSON first to see syntax highlighting</div>
                      </div>
                    </div>
                  )}
                  {!jsonError && viewMode === 'tree' && parsedData !== null && (
                    <div className="h-full overflow-auto py-2"><TreeView data={parsedData} /></div>
                  )}
                  {!jsonError && viewMode === 'tree' && parsedData === null && (
                    <div className="h-full p-4 text-muted-foreground text-sm font-mono flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl sm:text-4xl mb-2">🌳</div>
                        <div className="text-sm sm:text-base">Format JSON first to see tree view</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {stats && (
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative border-2 border-border/50 rounded-lg bg-background/50 backdrop-blur-sm">
                <StatsPanel stats={stats} />
              </div>
            </div>
          )}

          <div className="mt-12 sm:mt-16">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-center bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[
                { title: 'Syntax Highlighting',  desc: 'Keys, strings, numbers, booleans, and nulls are color-coded for quick scanning.', icon: '🎨' },
                { title: 'Tree Explorer',         desc: 'Collapsible tree view for navigating large nested JSON structures.', icon: '🌳' },
                { title: 'Smart Error Detection', desc: 'Finds the unclosed bracket (root cause), not just where the parser gave up.', icon: '🔍' },
                { title: 'JSON Statistics',       desc: 'Shows key count, max depth, array lengths, and data type breakdown.', icon: '📊' },
                { title: 'Undo / Redo',           desc: 'Full edit history with Ctrl+Z / Ctrl+Y keyboard shortcuts.', icon: '↩️' },
                { title: 'Load from URL',         desc: 'Fetch JSON directly from any public API endpoint or URL.', icon: '🌐' },
                { title: 'Pretty Print & Minify', desc: 'Format with proper indentation or strip all whitespace for production.', icon: '✨' },
              ].map(({ title, desc, icon }) => (
                <div key={title} className="group relative p-4 sm:p-6 border-2 border-border/50 rounded-lg bg-background/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">{icon}</div>
                    <h3 className="font-semibold mb-2 text-base sm:text-lg">{title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}