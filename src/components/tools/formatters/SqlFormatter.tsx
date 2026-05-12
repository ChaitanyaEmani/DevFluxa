"use client"

import { useState } from "react"
import { CodeEditor } from "@/components/ui/CodeEditor"
import { CopyButton } from "@/components/ui/CopyButton"
import { Download } from "@/components/ui/Download"
import { Button } from "@/components/ui/Button"
import { Header } from "@/components/ui/Header"
import {
  SqlError,
  formatSQL,
  minifySQL,
  getExampleSQL,
  validateIndentSize
} from "@/lib/formatter/sql"


export function SqlFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<SqlError | null>(null)
  const [isMinified, setIsMinified] = useState(false)
  const [indentSize, setIndentSize] = useState(2)
  const [uppercaseKeywords, setUppercaseKeywords] = useState(true)

  const processSQL = () => {
    try {
      if (!input.trim()) {
        setOutput('')
        setError(null)
        setIsMinified(false)
        return
      }
      
      const formatted = formatSQL(input, indentSize)
      setOutput(formatted)
      setError(null)
      setIsMinified(false)
    } catch (err: any) {
      setError({
        message: err.message || 'Failed to format SQL',
        line: null,
        column: null
      })
      setOutput('')
      setIsMinified(false)
    }
  }

  const minifyCode = () => {
    try {
      const minified = minifySQL(input)
      setOutput(minified)
      setError(null)
      setIsMinified(true)
    } catch (err: any) {
      setError({
        message: err.message || 'Failed to minify SQL',
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
    const example = getExampleSQL()
    setInput(example)
  }

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <Header 
          toolTitle="SQL Formatter" 
          toolDescription="Format and beautify SQL queries with proper indentation, keyword highlighting, and structure." 
        />

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <Button onClick={processSQL} className="shadow-sm hover:shadow-md transition-all duration-200">
              <span className="mr-2">✨</span>Format SQL
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
              <label className="text-sm font-medium">Indent:</label>
              <select 
                value={indentSize} 
                onChange={(e) => setIndentSize(validateIndentSize(e.target.value))}
                className="px-3 py-1 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
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
            <h2 className="text-xl font-bold">Input SQL</h2>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative h-96 border-2 border-border/50 rounded-lg overflow-hidden bg-background/50 backdrop-blur-sm">
                <CodeEditor
                  value={input}
                  onChange={setInput}
                  placeholder="Paste your SQL query here..."
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
                {isMinified ? 'Minified SQL' : 'Formatted SQL'}
              </h2>
              {output && (
                <div className="flex gap-2">
                  <CopyButton text={output} />
                  <Download 
                    content={output} 
                    filename={isMinified ? "minified.sql" : "formatted.sql"} 
                    mimeType="application/sql" 
                  />
                </div>
              )}
            </div>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative h-96 border-2 border-border/50 rounded-lg bg-background/50 backdrop-blur-sm overflow-hidden">
                {error && (
                  <div className="h-full p-4 text-destructive">
                    <div className="font-semibold mb-2">SQL Error</div>
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
                      <div className="text-4xl mb-2">🗃️</div>
                      <div>Format SQL to see the result</div>
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
              { title: 'Keyword Formatting', desc: 'Automatic uppercase formatting for SQL keywords.', icon: '🔤' },
              { title: 'Indentation Control', desc: 'Customizable indentation with 2 or 4 spaces.', icon: '📏' },
              { title: 'Query Structure', desc: 'Proper line breaks for clauses and subqueries.', icon: '🏗️' },
              { title: 'Comment Removal', desc: 'Remove single-line and multi-line comments.', icon: '💬' },
              { title: 'Code Minification', desc: 'Compress SQL for production use.', icon: '📦' },
              { title: 'Example Queries', desc: 'Load example SQL queries to test formatting.', icon: '📝' },
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
