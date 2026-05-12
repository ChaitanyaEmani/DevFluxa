"use client"

import { useState } from "react"
import { CodeEditor } from "@/components/ui/CodeEditor"
import { CopyButton } from "@/components/ui/CopyButton"
import { Download } from "@/components/ui/Download"
import { Button } from "@/components/ui/Button"
import { Header } from "@/components/ui/Header"
import {
  MarkdownError,
  formatMarkdown,
  minifyMarkdown,
  getExampleMarkdown,
  type MarkdownFormatOptions
} from "@/lib/formatter/markdown"




export function MarkdownFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<MarkdownError | null>(null)
  const [isMinified, setIsMinified] = useState(false)
  const [lineLength, setLineLength] = useState(80)
  const [bulletStyle, setBulletStyle] = useState<'-' | '*' | '+'>('-')

  const processMarkdown = () => {
    try {
      if (!input.trim()) {
        setOutput('')
        setError(null)
        setIsMinified(false)
        return
      }
      
      const formatted = formatMarkdown(input, {
        lineLength,
        bulletStyle
      })
      setOutput(formatted)
      setError(null)
      setIsMinified(false)
    } catch (err: any) {
      setError({
        message: err.message || 'Failed to format Markdown',
        line: null,
        column: null
      })
      setOutput('')
      setIsMinified(false)
    }
  }

  const minifyCode = () => {
    try {
      const minified = minifyMarkdown(input)
      setOutput(minified)
      setError(null)
      setIsMinified(true)
    } catch (err: any) {
      setError({
        message: err.message || 'Failed to minify Markdown',
        line: null,
        column: null
      })
      setOutput('')
      setIsMinified(false)
    }
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setError(null)
    setIsMinified(false)
  }

  const loadExample = () => {
    const example = getExampleMarkdown()
    setInput(example)
  }

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <Header 
          toolTitle="Markdown Formatter" 
          toolDescription="Format and beautify Markdown text with proper structure, line wrapping, and consistency." 
        />

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <Button onClick={processMarkdown} className="shadow-sm hover:shadow-md transition-all duration-200">
              <span className="mr-2">✨</span>Format Markdown
            </Button>
            <Button variant="outline" onClick={minifyCode} className="shadow-sm hover:shadow-md transition-all duration-200">
              <span className="mr-2">📦</span>Minify
            </Button>
            <Button variant="outline" onClick={loadExample} className="shadow-sm hover:shadow-md transition-all duration-200">
              <span className="mr-2">📝</span>Load Example
            </Button>
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Line Length:</label>
              <select 
                value={lineLength} 
                onChange={(e) => setLineLength(Number(e.target.value))}
                className="px-3 py-1 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value={0}>No wrap</option>
                <option value={72}>72 chars</option>
                <option value={80}>80 chars</option>
                <option value={100}>100 chars</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Bullets:</label>
              <select 
                value={bulletStyle} 
                onChange={(e) => setBulletStyle(e.target.value as '-' | '*' | '+')}
                className="px-3 py-1 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="-">Dash (-)</option>
                <option value="*">Asterisk (*)</option>
                <option value="+">Plus (+)</option>
              </select>
            </div>
            <Button variant="outline" onClick={clearAll} className="shadow-sm hover:shadow-md transition-all duration-200 text-destructive hover:bg-destructive/5">
              <span className="mr-2">🗑️</span>Clear
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Input */}
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Input Markdown</h2>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative h-96 border-2 border-border/50 rounded-lg overflow-hidden bg-background/50 backdrop-blur-sm">
                <CodeEditor
                  value={input}
                  onChange={setInput}
                  placeholder="Paste your Markdown text here..."
                  className="h-full"
                  showLineNumbers={true}
                />
              </div>
            </div>
          </div>

          {/* Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {isMinified ? 'Minified Markdown' : 'Formatted Markdown'}
              </h2>
              {output && (
                <div className="flex gap-2">
                  <CopyButton text={output} />
                  <Download 
                    content={output} 
                    filename={isMinified ? "minified.md" : "formatted.md"} 
                    mimeType="text/markdown" 
                  />
                </div>
              )}
            </div>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative h-96 border-2 border-border/50 rounded-lg bg-background/50 backdrop-blur-sm overflow-hidden">
                {error && (
                  <div className="h-full p-4 text-destructive">
                    <div className="font-semibold mb-2">Markdown Error</div>
                    <div className="text-sm">{error.message}</div>
                  </div>
                )}
                {!error && output && (
                  <CodeEditor
                    value={output}
                    onChange={() => {}}
                    className="h-full"
                    showLineNumbers={!isMinified}
                    readOnly={true}
                  />
                )}
                {!error && !output && (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📝</div>
                      <div>Format Markdown to see the result</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Line Wrapping', desc: 'Wrap long lines to specified character count.', icon: '📏' },
              { title: 'List Formatting', desc: 'Normalize bullet points and numbered lists.', icon: '📋' },
              { title: 'Header Spacing', desc: 'Add proper spacing around headers.', icon: '📰' },
              { title: 'Code Block Handling', desc: 'Preserve code blocks and inline code.', icon: '💻' },
              { title: 'Bullet Style Options', desc: 'Choose between dash, asterisk, or plus bullets.', icon: '•' },
              { title: 'Blockquote Formatting', desc: 'Normalize blockquote spacing and syntax.', icon: '💬' },
            ].map(({ title, desc, icon }) => (
              <div key={title} className="group relative p-6 border-2 border-border/50 rounded-lg bg-background/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="text-3xl mb-3">{icon}</div>
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
