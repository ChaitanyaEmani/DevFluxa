'use client'

import { useState, useCallback, useRef } from 'react'

// ── tiny helpers ────────────────────────────────────────────────────────────

function encodeBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
}

function decodeBase64(str: string): string {
  return decodeURIComponent(escape(atob(str)))
}

function isValidBase64(str: string): boolean {
  return /^[A-Za-z0-9+/]*={0,2}$/.test(str.trim())
}

function byteSize(str: string): number {
  return new TextEncoder().encode(str).length
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(2)} MB`
}

function getLineCount(str: string): number {
  return str ? str.split('\n').length : 0
}

type Mode = 'encode' | 'decode'
type Tab = 'text' | 'file' | 'url' | 'hex'

// ── sub-components ──────────────────────────────────────────────────────────

function StatBadge({ label, value }: { label: string; value: string | number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
      <span className="font-medium text-foreground">{value}</span>
      <span>{label}</span>
    </span>
  )
}

function IconButton({
  onClick,
  title,
  children,
  disabled = false,
}: {
  onClick: () => void
  title: string
  children: React.ReactNode
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  )
}

// ── main component ──────────────────────────────────────────────────────────

export function Base64EncodeDecode() {
  const [mode, setMode] = useState<Mode>('encode')
  const [activeTab, setActiveTab] = useState<Tab>('text')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [autoProcess, setAutoProcess] = useState(false)
  const [wrapLines, setWrapLines] = useState(true)
  const [chunkSize, setChunkSize] = useState<number | null>(null) // for line-wrap output
  const [urlSafe, setUrlSafe] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // ── helpers ───────────────────────────────────────────────────────────────

  const toUrlSafe = (s: string) => s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  const fromUrlSafe = (s: string) => {
    s = s.replace(/-/g, '+').replace(/_/g, '/')
    while (s.length % 4) s += '='
    return s
  }

  const applyChunks = (s: string, size: number | null) =>
    size ? s.match(new RegExp(`.{1,${size}}`, 'g'))?.join('\n') ?? s : s

  const process = useCallback(
    (rawInput = input) => {
      setError('')
      const trimmed = rawInput.trim()
      if (!trimmed) { setOutput(''); return }

      try {
        if (mode === 'encode') {
          let result = encodeBase64(trimmed)
          if (urlSafe) result = toUrlSafe(result)
          setOutput(applyChunks(result, chunkSize))
        } else {
          const cleaned = urlSafe ? fromUrlSafe(trimmed) : trimmed
          if (!isValidBase64(cleaned)) throw new Error('Invalid Base64 — expected A–Z a–z 0–9 + / with optional = padding')
          setOutput(decodeBase64(cleaned))
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Processing failed')
        setOutput('')
      }
    },
    [mode, input, urlSafe, chunkSize]
  )

  const handleInputChange = (val: string) => {
    setInput(val)
    if (autoProcess) process(val)
  }

  const swap = () => {
    setMode(m => (m === 'encode' ? 'decode' : 'encode'))
    setInput(output)
    setOutput(input)
    setError('')
  }

  const clear = () => { setInput(''); setOutput(''); setError('') }

  const copy = () => {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const download = () => {
    const blob = new Blob([output], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = mode === 'encode' ? 'encoded.txt' : 'decoded.txt'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInput(text)
      if (autoProcess) process(text)
    } catch { setError('Clipboard read failed — please paste manually.') }
  }

  // FILE tab: read file → encode to base64
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const b64 = (reader.result as string).split(',')[1]
      setInput(`data:${file.type};base64,${b64}`)
      setOutput(b64)
      setError('')
    }
    reader.readAsDataURL(file)
  }

  // URL tab helpers
  const encodeUrl = () => {
    try { setOutput(encodeURIComponent(input)); setError('') }
    catch { setError('URL encoding failed') }
  }
  const decodeUrl = () => {
    try { setOutput(decodeURIComponent(input)); setError('') }
    catch { setError('URL decoding failed') }
  }

  // HEX tab helpers
  const toHex = () => {
    const bytes = new TextEncoder().encode(input)
    setOutput(Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(' '))
    setError('')
  }
  const fromHex = () => {
    try {
      const bytes = input.trim().split(/\s+/).map(h => parseInt(h, 16))
      setOutput(new TextDecoder().decode(new Uint8Array(bytes)))
      setError('')
    } catch { setError('Invalid hex input') }
  }

  // ── stats ─────────────────────────────────────────────────────────────────
  const inputStats = {
    chars: input.length,
    bytes: formatBytes(byteSize(input)),
    lines: getLineCount(input),
  }
  const outputStats = {
    chars: output.length,
    bytes: formatBytes(byteSize(output)),
    lines: getLineCount(output),
  }
  const ratio =
    input.length && output.length
      ? ((output.length / input.length) * 100).toFixed(0) + '%'
      : '—'

  // ── tabs config ───────────────────────────────────────────────────────────
  const tabs: { id: Tab; label: string }[] = [
    { id: 'text', label: 'Text' },
    { id: 'file', label: 'File → Base64' },
    { id: 'url', label: 'URL Encode' },
    { id: 'hex', label: 'Hex' },
  ]

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Base64 Encode / Decode</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Encode, decode, convert to URL-safe Base64, encode files, URL-encode strings, and inspect hex — all in your browser.
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1 w-fit">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); clear() }}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === t.id
                  ? 'bg-background text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TEXT TAB ─────────────────────────────────────────── */}
        {activeTab === 'text' && (
          <>
            {/* Controls row */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Mode toggle */}
              <div className="flex items-center rounded-lg border border-border bg-muted/40 p-1">
                <button
                  onClick={() => setMode('encode')}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                    mode === 'encode' ? 'bg-background shadow-sm border border-border text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Encode
                </button>
                <button
                  onClick={() => setMode('decode')}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                    mode === 'decode' ? 'bg-background shadow-sm border border-border text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Decode
                </button>
              </div>

              <button
                onClick={swap}
                title="Swap input ↔ output"
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                ⇄ Swap
              </button>

              {/* Options */}
              <label className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={urlSafe}
                  onChange={e => setUrlSafe(e.target.checked)}
                  className="rounded"
                />
                URL-safe Base64
              </label>

              <label className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoProcess}
                  onChange={e => setAutoProcess(e.target.checked)}
                  className="rounded"
                />
                Auto-process
              </label>

              <label className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={wrapLines}
                  onChange={e => { setWrapLines(e.target.checked); setChunkSize(e.target.checked ? 76 : null) }}
                  className="rounded"
                />
                Wrap at 76 chars
              </label>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* INPUT */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    {mode === 'encode' ? 'Plain Text' : 'Base64 Input'}
                  </h2>
                  <div className="flex gap-1.5">
                    <IconButton onClick={pasteFromClipboard} title="Paste from clipboard">
                      📋 Paste
                    </IconButton>
                    <IconButton onClick={clear} title="Clear all">
                      ✕ Clear
                    </IconButton>
                  </div>
                </div>

                <textarea
                  value={input}
                  onChange={e => handleInputChange(e.target.value)}
                  placeholder={mode === 'encode' ? 'Enter text to encode…' : 'Paste Base64 to decode…'}
                  rows={12}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-mono resize-y placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
                />

                {/* Input stats */}
                <div className="flex flex-wrap gap-1.5">
                  <StatBadge label="chars" value={inputStats.chars} />
                  <StatBadge label="bytes" value={inputStats.bytes} />
                  <StatBadge label="lines" value={inputStats.lines} />
                </div>
              </div>

              {/* OUTPUT */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    {mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}
                  </h2>
                  <div className="flex gap-1.5">
                    {output && (
                      <>
                        <IconButton onClick={copy} title="Copy to clipboard">
                          {copied ? '✓ Copied' : '📄 Copy'}
                        </IconButton>
                        <IconButton onClick={download} title="Download as file">
                          ↓ Download
                        </IconButton>
                        <IconButton
                          onClick={() => { setInput(output); setOutput(''); setError('') }}
                          title="Use output as input"
                        >
                          → Use as input
                        </IconButton>
                      </>
                    )}
                  </div>
                </div>

                <textarea
                  value={output}
                  readOnly
                  placeholder={mode === 'encode' ? 'Base64 output will appear here…' : 'Decoded text will appear here…'}
                  rows={12}
                  className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm font-mono resize-y placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
                />

                {/* Output stats + ratio */}
                <div className="flex flex-wrap gap-1.5">
                  <StatBadge label="chars" value={outputStats.chars} />
                  <StatBadge label="bytes" value={outputStats.bytes} />
                  <StatBadge label="lines" value={outputStats.lines} />
                  {output && <StatBadge label="size ratio" value={ratio} />}
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => process()}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 active:scale-[.98]"
              >
                {mode === 'encode' ? '→ Encode to Base64' : '→ Decode from Base64'}
              </button>
            </div>
          </>
        )}

        {/* ── FILE TAB ─────────────────────────────────────────── */}
        {activeTab === 'file' && (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Select any file to convert it to a Base64 data URI — useful for embedding images or binary data in JSON/HTML.
            </p>

            <div
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/20 py-16 cursor-pointer transition-colors hover:bg-muted/40"
            >
              <span className="text-4xl">📂</span>
              <p className="text-sm font-medium">Click to select a file</p>
              <p className="text-xs text-muted-foreground">Any file type supported</p>
              <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
            </div>

            {output && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Base64 Data URI</h2>
                  <div className="flex gap-1.5">
                    <IconButton onClick={copy} title="Copy">📄 {copied ? 'Copied!' : 'Copy'}</IconButton>
                    <IconButton onClick={download} title="Download">↓ Download</IconButton>
                  </div>
                </div>
                <textarea
                  value={output}
                  readOnly
                  rows={10}
                  className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-xs font-mono resize-y focus:outline-none"
                />
                <div className="flex gap-1.5">
                  <StatBadge label="chars" value={output.length} />
                  <StatBadge label="bytes" value={formatBytes(byteSize(output))} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── URL TAB ──────────────────────────────────────────── */}
        {activeTab === 'url' && (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Encode or decode URL components (percent-encoding). Useful for query strings and path segments.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Input</h2>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Enter text or URL…"
                  rows={10}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-mono resize-y placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Output</h2>
                  {output && <IconButton onClick={copy} title="Copy">📄 {copied ? 'Copied!' : 'Copy'}</IconButton>}
                </div>
                <textarea
                  value={output}
                  readOnly
                  rows={10}
                  className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm font-mono resize-y focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={encodeUrl} className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
                → URL Encode
              </button>
              <button onClick={decodeUrl} className="rounded-lg border border-border bg-background px-5 py-2 text-sm font-semibold text-foreground hover:bg-muted">
                → URL Decode
              </button>
            </div>
          </div>
        )}

        {/* ── HEX TAB ──────────────────────────────────────────── */}
        {activeTab === 'hex' && (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Convert text to a hex byte sequence or decode hex back to UTF-8 text.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Input</h2>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Enter text or space-separated hex bytes…"
                  rows={10}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-mono resize-y placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Output</h2>
                  {output && <IconButton onClick={copy} title="Copy">📄 {copied ? 'Copied!' : 'Copy'}</IconButton>}
                </div>
                <textarea
                  value={output}
                  readOnly
                  rows={10}
                  className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm font-mono resize-y focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={toHex} className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
                → Text to Hex
              </button>
              <button onClick={fromHex} className="rounded-lg border border-border bg-background px-5 py-2 text-sm font-semibold text-foreground hover:bg-muted">
                → Hex to Text
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
            <p className="text-sm font-semibold text-destructive">Error</p>
            <p className="mt-0.5 text-xs text-destructive/80">{error}</p>
          </div>
        )}

        {/* Feature cards */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🔒', title: 'URL-Safe Base64', desc: 'RFC 4648 § 5 variant with - and _ instead of + and /' },
            { icon: '📁', title: 'File Encoding', desc: 'Encode any binary file to a Base64 data URI' },
            { icon: '🔗', title: 'URL Encoding', desc: 'Percent-encode and decode URL components' },
            { icon: '🔢', title: 'Hex Conversion', desc: 'Inspect raw bytes as a hex sequence' },
          ].map(c => (
            <div key={c.title} className="rounded-lg border border-border p-4 space-y-1">
              <div className="text-xl">{c.icon}</div>
              <h3 className="text-sm font-semibold">{c.title}</h3>
              <p className="text-xs text-muted-foreground">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}