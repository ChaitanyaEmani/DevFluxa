'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { SmartHTMLEditor } from '@/components/SmartHtmlEditor'
import {
  FormattingOptions,
  TextStats,
  formatHTML,
  minifyHTML,
  getTextStats,
  downloadFile,
  handleFileUpload as handleFileUploadUtil,
  fetchFromURL as fetchFromURLUtil,
  clearAll as clearAllUtil,
  lintHTML,
  LintError,
} from '@/lib/formatter/html'

// ── tiny UI primitives ────────────────────────────────────────────────────────

function Button({
  children,
  onClick,
  disabled,
  variant = 'primary',
  size = 'md',
  className = '',
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  className?: string
}) {
  const base = 'inline-flex items-center gap-1.5 font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-40 disabled:cursor-not-allowed'
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm' }
  const variants = {
    primary: 'bg-[#cba6f7] text-[#1e1e2e] hover:bg-[#d4b3ff] focus:ring-[#cba6f7]',
    outline: 'border border-[#45475a] text-[#cdd6f4] hover:bg-[#313244] focus:ring-[#45475a]',
    ghost: 'text-[#cdd6f4] hover:bg-[#313244] focus:ring-[#45475a]',
    danger: 'bg-[#f38ba8]/20 text-[#f38ba8] border border-[#f38ba8]/30 hover:bg-[#f38ba8]/30 focus:ring-[#f38ba8]',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 rounded-lg border border-[#45475a] bg-[#181825] text-[#cdd6f4] text-sm focus:outline-none focus:ring-2 focus:ring-[#cba6f7]/50"
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  label: string
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded border-[#45475a] bg-[#181825] text-[#cba6f7] focus:ring-[#cba6f7]/50 focus:ring-offset-0"
      />
      <span className="text-sm text-[#cdd6f4] group-hover:text-white transition-colors">{label}</span>
    </label>
  )
}

function StatBadge({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col items-center px-3 py-1.5 rounded-lg bg-[#313244] border border-[#45475a]">
      <span className="text-[10px] uppercase tracking-wider text-[#6c7086] font-medium">{label}</span>
      <span className="text-sm font-semibold text-[#cdd6f4]">{value}</span>
    </div>
  )
}

function LintPanel({ errors }: { errors: LintError[] }) {
  if (errors.length === 0) {
    return (
      <div className="flex items-center gap-2 text-[#a6e3a1] text-sm py-2 px-3 rounded-lg bg-[#a6e3a1]/10 border border-[#a6e3a1]/20">
        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        No issues found — HTML looks valid!
      </div>
    )
  }
  return (
    <div className="space-y-1.5">
      {errors.map((err, i) => (
        <div
          key={i}
          className={`flex items-start gap-2 text-sm py-2 px-3 rounded-lg border ${
            err.type === 'error'
              ? 'bg-[#f38ba8]/10 border-[#f38ba8]/20 text-[#f38ba8]'
              : 'bg-[#fab387]/10 border-[#fab387]/20 text-[#fab387]'
          }`}
        >
          <span className="flex-shrink-0 font-mono text-xs mt-0.5 opacity-70">L{err.line}</span>
          <span>{err.message}</span>
        </div>
      ))}
    </div>
  )
}

// ── diff viewer ───────────────────────────────────────────────────────────────

function DiffLine({ type, content, lineNum }: { type: 'add' | 'remove' | 'same'; content: string; lineNum: number }) {
  const colors = {
    add: 'bg-[#a6e3a1]/10 text-[#a6e3a1] border-l-2 border-[#a6e3a1]',
    remove: 'bg-[#f38ba8]/10 text-[#f38ba8] border-l-2 border-[#f38ba8]',
    same: 'text-[#585b70]',
  }
  const prefix = { add: '+ ', remove: '- ', same: '  ' }
  return (
    <div className={`flex gap-3 px-3 py-0.5 font-mono text-xs ${colors[type]}`}>
      <span className="opacity-50 select-none w-8 text-right flex-shrink-0">{lineNum}</span>
      <span className="whitespace-pre-wrap break-all">{prefix[type]}{content}</span>
    </div>
  )
}

function SimpleDiff({ before, after }: { before: string; after: string }) {
  const beforeLines = before.split('\n')
  const afterLines = after.split('\n')
  const maxLen = Math.max(beforeLines.length, afterLines.length)

  const rows: { type: 'add' | 'remove' | 'same'; content: string; lineNum: number }[] = []

  for (let i = 0; i < maxLen; i++) {
    const bLine = beforeLines[i] ?? ''
    const aLine = afterLines[i] ?? ''
    if (bLine === aLine) {
      rows.push({ type: 'same', content: bLine, lineNum: i + 1 })
    } else {
      if (bLine) rows.push({ type: 'remove', content: bLine, lineNum: i + 1 })
      if (aLine) rows.push({ type: 'add', content: aLine, lineNum: i + 1 })
    }
  }

  return (
    <div className="rounded-lg border border-[#45475a] bg-[#1e1e2e] overflow-auto max-h-[500px]">
      <div className="flex gap-4 px-3 py-2 border-b border-[#45475a] bg-[#181825]">
        <span className="text-xs text-[#f38ba8] flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#f38ba8]" /> Before
        </span>
        <span className="text-xs text-[#a6e3a1] flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#a6e3a1]" /> After
        </span>
      </div>
      {rows.map((row, i) => (
        <DiffLine key={i} {...row} />
      ))}
    </div>
  )
}

// ── main component ────────────────────────────────────────────────────────────

type Tab = 'format' | 'minify' | 'lint' | 'options' | 'compare'

export function HtmlBeautifier() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('format')
  const [urlInput, setUrlInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showUrlModal, setShowUrlModal] = useState(false)
  const [lintErrors, setLintErrors] = useState<LintError[]>([])
  const [copied, setCopied] = useState(false)
  const [autoClose, setAutoClose] = useState(true)
  const [autoIndent, setAutoIndent] = useState(true)
  const [minified, setMinified] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [options, setOptions] = useState<FormattingOptions>({
    indentType: 'spaces',
    indentSize: 2,
    wrapLines: false,
    wrapColumn: 80,
    attributeFormat: 'single-line',
    tagCase: 'lowercase',
    selfClosingStyle: 'html',
    removeComments: false,
    quoteStyle: 'double',
    preserveDoctype: true,
  })

  // live lint as user types
  useEffect(() => {
    const t = setTimeout(() => {
      if (input.trim()) setLintErrors(lintHTML(input))
      else setLintErrors([])
    }, 400)
    return () => clearTimeout(t)
  }, [input])

  const processHTML = () => {
    try {
      setIsProcessing(true)
      const formatted = formatHTML(input, options)
      setOutput(formatted)
      setMinified(minifyHTML(input))
    } catch (err) {
      console.error('Error processing HTML:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUploadUtil(event, setInput)
  }

  const fetchFromURL = async () => {
    try {
      setIsProcessing(true)
      await fetchFromURLUtil(urlInput, setInput, setUrlInput)
    } catch (err) {
      console.error('Failed to fetch URL:', err)
    } finally {
      setIsProcessing(false)
      setShowUrlModal(false)
    }
  }

  const clearAll = () => {
    clearAllUtil(setInput, setOutput)
    setLintErrors([])
    setMinified('')
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const inputStats = getTextStats(input)
  const outputStats = getTextStats(output)

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'format', label: 'Format', icon: '✦' },
    { id: 'minify', label: 'Minify', icon: '⚡' },
    { id: 'lint', label: `Lint${lintErrors.length ? ` (${lintErrors.length})` : ''}`, icon: '🔍' },
    { id: 'compare', label: 'Diff', icon: '⟺' },
    { id: 'options', label: 'Options', icon: '⚙' },
  ]

  return (
    <div className="min-h-screen bg-[#1e1e2e] text-[#cdd6f4]">
      {/* Header */}
      <header className="border-b border-[#313244] bg-[#181825]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="text-[#cba6f7]">&lt;/&gt;</span>
              HTML Beautifier
            </h1>
            <p className="text-xs text-[#6c7086] mt-0.5">Format · Minify · Lint · Diff — with smart auto-completion</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#cdd6f4]">
              <div
                onClick={() => setAutoClose(v => !v)}
                className={`w-8 h-4 rounded-full transition-colors relative cursor-pointer ${autoClose ? 'bg-[#cba6f7]' : 'bg-[#45475a]'}`}
              >
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${autoClose ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              Auto-close tags
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#cdd6f4]">
              <div
                onClick={() => setAutoIndent(v => !v)}
                className={`w-8 h-4 rounded-full transition-colors relative cursor-pointer ${autoIndent ? 'bg-[#cba6f7]' : 'bg-[#45475a]'}`}
              >
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${autoIndent ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              Auto-indent
            </label>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* Action bar */}
        <div className="flex flex-wrap gap-2 mb-5">
          <Button onClick={processHTML} disabled={isProcessing || !input.trim()}>
            {isProcessing ? (
              <><span className="animate-spin">↻</span> Processing…</>
            ) : (
              <><span>✦</span> Beautify HTML</>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowUrlModal(true)}>
            🔗 Load URL
          </Button>
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            📁 Upload File
          </Button>
          <Button variant="danger" size="sm" onClick={clearAll}>
            ✕ Clear
          </Button>
          <input ref={fileInputRef} type="file" accept=".html,.htm,.txt" onChange={handleFileUpload} className="hidden" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 border-b border-[#313244]">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all duration-150 flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-[#313244] text-[#cba6f7] border-b-2 border-[#cba6f7] -mb-px'
                  : 'text-[#6c7086] hover:text-[#cdd6f4] hover:bg-[#313244]/50'
              }`}
            >
              <span className="text-xs">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* FORMAT TAB */}
        {activeTab === 'format' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Input */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#cdd6f4] uppercase tracking-wider">Input HTML</h2>
                <div className="flex gap-2">
                  <StatBadge label="chars" value={inputStats.characters} />
                  <StatBadge label="lines" value={inputStats.lines} />
                  {lintErrors.length > 0 && (
                    <span className="flex items-center gap-1 text-xs text-[#f38ba8] bg-[#f38ba8]/10 border border-[#f38ba8]/20 px-2 py-1 rounded-lg">
                      ⚠ {lintErrors.length}
                    </span>
                  )}
                </div>
              </div>
              <SmartHTMLEditor
                value={input}
                onChange={setInput}
                placeholder="Paste your HTML here... Auto-close and auto-indent are active!"
                lintErrors={lintErrors}
                autoClose={autoClose}
                autoIndent={autoIndent}
                className="flex-1"
              />
              <p className="text-[10px] text-[#45475a]">
                Tip: Type <code className="text-[#cba6f7]">&lt;div&gt;</code> and closing tag is added automatically · <kbd className="bg-[#313244] px-1 rounded">Tab</kbd> to indent
              </p>
            </div>

            {/* Output */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#cdd6f4] uppercase tracking-wider">Beautified Output</h2>
                <div className="flex items-center gap-2">
                  <StatBadge label="chars" value={outputStats.characters} />
                  <StatBadge label="lines" value={outputStats.lines} />
                  {output && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(output)}>
                        {copied ? '✓ Copied' : '⎘ Copy'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => downloadFile(output, 'beautified.html', 'text/html')}>
                        ↓ HTML
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <div className="relative border border-[#45475a] rounded-lg bg-[#1e1e2e] overflow-auto" style={{ minHeight: '400px' }}>
                {output ? (
                  <div className="flex font-mono text-sm">
                    {/* line numbers */}
                    <div className="select-none text-right py-3 px-2 text-[#585b70] bg-[#181825] border-r border-[#313244] flex-shrink-0" style={{ minWidth: '3rem' }}>
                      {output.split('\n').map((_, i) => (
                        <div key={i} className="leading-6 text-xs">{i + 1}</div>
                      ))}
                    </div>
                    <pre className="flex-1 text-[#cdd6f4] py-3 px-4 leading-6 text-sm overflow-x-auto whitespace-pre">
                      {output}
                    </pre>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-[#45475a] text-sm" style={{ minHeight: '400px' }}>
                    Beautified output will appear here
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MINIFY TAB */}
        {activeTab === 'minify' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-[#cdd6f4] uppercase tracking-wider">Minified HTML</h3>
              {minified && (
                <span className="text-xs text-[#a6e3a1] bg-[#a6e3a1]/10 border border-[#a6e3a1]/20 px-2 py-0.5 rounded-full">
                  {Math.round((1 - minified.length / (input.length || 1)) * 100)}% smaller
                </span>
              )}
            </div>
            {!input.trim() ? (
              <div className="text-[#45475a] text-sm py-12 text-center border border-[#313244] rounded-lg">
                Enter HTML in the Format tab first
              </div>
            ) : (
              <>
                <div className="flex gap-2 mb-3">
                  <Button
                    onClick={() => setMinified(minifyHTML(input))}
                    disabled={!input.trim()}
                  >
                    ⚡ Minify Now
                  </Button>
                  {minified && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(minified)}>
                        {copied ? '✓ Copied' : '⎘ Copy'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => downloadFile(minified, 'minified.html', 'text/html')}>
                        ↓ Download
                      </Button>
                    </>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-[#313244] rounded-lg p-3 text-center">
                    <div className="text-xs text-[#6c7086] mb-1">Original</div>
                    <div className="text-lg font-bold text-[#cdd6f4]">{input.length.toLocaleString()}</div>
                    <div className="text-xs text-[#45475a]">characters</div>
                  </div>
                  <div className="bg-[#313244] rounded-lg p-3 text-center">
                    <div className="text-xs text-[#6c7086] mb-1">Minified</div>
                    <div className="text-lg font-bold text-[#a6e3a1]">{(minified || minifyHTML(input)).length.toLocaleString()}</div>
                    <div className="text-xs text-[#45475a]">characters</div>
                  </div>
                  <div className="bg-[#313244] rounded-lg p-3 text-center">
                    <div className="text-xs text-[#6c7086] mb-1">Saved</div>
                    <div className="text-lg font-bold text-[#cba6f7]">
                      {Math.max(0, Math.round((1 - (minified || minifyHTML(input)).length / (input.length || 1)) * 100))}%
                    </div>
                    <div className="text-xs text-[#45475a]">reduction</div>
                  </div>
                </div>
                {minified && (
                  <div className="border border-[#45475a] rounded-lg bg-[#181825] p-4 font-mono text-sm text-[#cdd6f4] break-all whitespace-pre-wrap max-h-64 overflow-auto">
                    {minified}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* LINT TAB */}
        {activeTab === 'lint' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#cdd6f4] uppercase tracking-wider">HTML Linter</h3>
              <Button size="sm" variant="outline" onClick={() => setLintErrors(lintHTML(input))} disabled={!input.trim()}>
                ↻ Re-check
              </Button>
            </div>
            {!input.trim() ? (
              <div className="text-[#45475a] text-sm py-12 text-center border border-[#313244] rounded-lg">
                Enter HTML in the Format tab to lint it
              </div>
            ) : (
              <LintPanel errors={lintErrors} />
            )}
          </div>
        )}

        {/* DIFF TAB */}
        {activeTab === 'compare' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#cdd6f4] uppercase tracking-wider">Before / After Diff</h3>
            {input && output ? (
              <SimpleDiff before={input} after={output} />
            ) : (
              <div className="text-[#45475a] text-sm py-12 text-center border border-[#313244] rounded-lg">
                Format some HTML first to see the diff
              </div>
            )}
          </div>
        )}

        {/* OPTIONS TAB */}
        {activeTab === 'options' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <h3 className="text-sm font-semibold text-[#cdd6f4] uppercase tracking-wider border-b border-[#313244] pb-2">Indentation</h3>

              <div>
                <label className="block text-xs text-[#6c7086] mb-1.5 uppercase tracking-wider">Indent Type</label>
                <Select
                  value={options.indentType}
                  onChange={e => setOptions({ ...options, indentType: e.target.value as 'spaces' | 'tabs' })}
                  options={[{ value: 'spaces', label: 'Spaces' }, { value: 'tabs', label: 'Tabs' }]}
                />
              </div>

              <div>
                <label className="block text-xs text-[#6c7086] mb-1.5 uppercase tracking-wider">Indent Size</label>
                <Select
                  value={options.indentSize.toString()}
                  onChange={e => setOptions({ ...options, indentSize: parseInt(e.target.value) as 2 | 4 | 8 })}
                  options={[{ value: '2', label: '2 spaces' }, { value: '4', label: '4 spaces' }, { value: '8', label: '8 spaces' }]}
                />
              </div>

              <div>
                <label className="block text-xs text-[#6c7086] mb-1.5 uppercase tracking-wider">Tag Case</label>
                <Select
                  value={options.tagCase}
                  onChange={e => setOptions({ ...options, tagCase: e.target.value as 'lowercase' | 'uppercase' })}
                  options={[{ value: 'lowercase', label: 'lowercase' }, { value: 'uppercase', label: 'UPPERCASE' }]}
                />
              </div>

              <div>
                <label className="block text-xs text-[#6c7086] mb-1.5 uppercase tracking-wider">Self-closing Style</label>
                <Select
                  value={options.selfClosingStyle}
                  onChange={e => setOptions({ ...options, selfClosingStyle: e.target.value as 'html' | 'xhtml' })}
                  options={[{ value: 'html', label: 'HTML5 (<br>)' }, { value: 'xhtml', label: 'XHTML (<br />)' }]}
                />
              </div>
            </div>

            <div className="space-y-5">
              <h3 className="text-sm font-semibold text-[#cdd6f4] uppercase tracking-wider border-b border-[#313244] pb-2">Formatting</h3>

              <div>
                <label className="block text-xs text-[#6c7086] mb-1.5 uppercase tracking-wider">Attribute Format</label>
                <Select
                  value={options.attributeFormat}
                  onChange={e => setOptions({ ...options, attributeFormat: e.target.value as 'single-line' | 'multi-line' })}
                  options={[{ value: 'single-line', label: 'Single line' }, { value: 'multi-line', label: 'Multi-line' }]}
                />
              </div>

              <div>
                <label className="block text-xs text-[#6c7086] mb-1.5 uppercase tracking-wider">Quote Style</label>
                <Select
                  value={options.quoteStyle}
                  onChange={e => setOptions({ ...options, quoteStyle: e.target.value as 'single' | 'double' })}
                  options={[{ value: 'double', label: 'Double ("")' }, { value: 'single', label: "Single ('')" }]}
                />
              </div>

              <div className="space-y-3 pt-1">
                <Checkbox
                  checked={options.wrapLines}
                  onChange={e => setOptions({ ...options, wrapLines: e.target.checked })}
                  label="Wrap lines"
                />
                {options.wrapLines && (
                  <div className="flex items-center gap-2 ml-6">
                    <label className="text-xs text-[#6c7086]">Column:</label>
                    <input
                      type="number"
                      value={options.wrapColumn}
                      onChange={e => setOptions({ ...options, wrapColumn: parseInt(e.target.value) || 80 })}
                      className="w-20 px-2 py-1 border border-[#45475a] rounded-lg text-sm bg-[#181825] text-[#cdd6f4] focus:outline-none focus:ring-2 focus:ring-[#cba6f7]/50"
                      min={40} max={200}
                    />
                  </div>
                )}
                <Checkbox
                  checked={options.removeComments}
                  onChange={e => setOptions({ ...options, removeComments: e.target.checked })}
                  label="Remove HTML comments"
                />
                <Checkbox
                  checked={options.preserveDoctype}
                  onChange={e => setOptions({ ...options, preserveDoctype: e.target.checked })}
                  label="Preserve DOCTYPE"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* URL Modal */}
      {showUrlModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1e1e2e] border border-[#45475a] rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4 text-white">Load HTML from URL</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[#6c7086] mb-1.5 uppercase tracking-wider">URL</label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  placeholder="https://example.com/page.html"
                  className="w-full px-3 py-2 border border-[#45475a] rounded-lg bg-[#181825] text-[#cdd6f4] text-sm focus:outline-none focus:ring-2 focus:ring-[#cba6f7]/50 placeholder:text-[#45475a]"
                  onKeyDown={e => e.key === 'Enter' && urlInput.trim() && fetchFromURL()}
                  autoFocus
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => { setShowUrlModal(false); setUrlInput('') }}>
                  Cancel
                </Button>
                <Button onClick={fetchFromURL} disabled={!urlInput.trim() || isProcessing}>
                  {isProcessing ? '⟳ Loading…' : '→ Load'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}