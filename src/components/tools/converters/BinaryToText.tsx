"use client"

import { useState } from "react"
import { CodeEditor } from "@/components/ui/CodeEditor"
import { CopyButton } from "@/components/ui/CopyButton"
import { Download } from "@/components/ui/Download"
import { Button } from "@/components/ui/Button"
import { Header } from "@/components/ui/Header"
import { binaryToText, validateBinary } from "@/lib/converters/binary"


export function BinaryToText() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [separator, setSeparator] = useState(' ')
  const [error, setError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(true)

  const convert = () => {
    try {
      setError(null)
      
      if (!input.trim()) {
        setOutput('')
        setIsValid(true)
        return
      }
      
      // Validate binary input
      if (!validateBinary(input, separator)) {
        setError('Invalid binary format. Please ensure each binary sequence is 8 bits (0s and 1s only).')
        setOutput('')
        setIsValid(false)
        return
      }
      
      const result = binaryToText(input, { separator })
      setOutput(result)
      setIsValid(true)
    } catch (err: any) {
      setError(err.message || 'Conversion failed')
      setOutput('')
      setIsValid(false)
    }
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setError(null)
    setIsValid(true)
  }

  const loadExample = () => {
    setInput('01001000 01100101 01101100 01101100 01101111 00101100 00100000 01010111 01101111 01110010 01101100 01100100 00100001')
  }

  // Auto-validate input
  useState(() => {
    if (input.trim()) {
      const valid = validateBinary(input, separator)
      setIsValid(valid)
      if (!valid) {
        setError('Invalid binary format detected')
      } else {
        setError(null)
      }
    }
  })

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <Header 
          toolTitle="Binary to Text Converter" 
          toolDescription="Convert binary code back to readable text with validation and error checking." 
        />

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <Button onClick={convert} className="shadow-sm hover:shadow-md transition-all duration-200">
              <span className="mr-2">🔄</span>Convert to Text
            </Button>
            <Button variant="outline" onClick={loadExample} className="shadow-sm hover:shadow-md transition-all duration-200">
              <span className="mr-2">📝</span>Load Example
            </Button>
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Separator:</label>
              <select 
                value={separator} 
                onChange={(e) => setSeparator(e.target.value)}
                className="px-3 py-1 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value=" ">Space</option>
                <option value="">None</option>
                <option value="-">Hyphen</option>
                <option value=",">Comma</option>
                <option value=":">Colon</option>
              </select>
            </div>
            <Button variant="outline" onClick={clearAll} className="shadow-sm hover:shadow-md transition-all duration-200 text-destructive hover:bg-destructive/5">
              <span className="mr-2">🗑️</span>Clear
            </Button>
          </div>
        </div>

        {/* Validation Status */}
        {input.trim() && (
          <div className={`mb-6 p-4 rounded-lg border ${
            isValid 
              ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
              : 'bg-destructive/10 border-destructive/50'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{isValid ? '✅' : '❌'}</span>
              <span className="font-medium">
                {isValid ? 'Valid binary format' : 'Invalid binary format'}
              </span>
            </div>
            {!isValid && (
              <p className="mt-1 text-sm">
                Each binary sequence should be exactly 8 bits (0s and 1s only).
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Input */}
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Binary Input</h2>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative h-96 border-2 border-border/50 rounded-lg overflow-hidden bg-background/50 backdrop-blur-sm">
                <CodeEditor
                  value={input}
                  onChange={setInput}
                  placeholder="Enter binary code (8-bit sequences separated by spaces)..."
                  className="h-full"
                  showLineNumbers={true}
                />
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              💡 Tip: Enter binary sequences like "01001000 01100101 01101100 01101100 01101111"
            </div>
          </div>

          {/* Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Text Output</h2>
              {output && (
                <div className="flex gap-2">
                  <CopyButton text={output} />
                  <Download 
                    content={output} 
                    filename="converted-text.txt" 
                    mimeType="text/plain" 
                  />
                </div>
              )}
            </div>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative h-96 border-2 border-border/50 rounded-lg bg-background/50 backdrop-blur-sm overflow-hidden">
                {error && (
                  <div className="h-full p-4 text-destructive">
                    <div className="font-semibold mb-2">Conversion Error</div>
                    <div className="text-sm">{error}</div>
                  </div>
                )}
                {!error && output && (
                  <div className="h-full p-4">
                    <div className="text-lg font-mono whitespace-pre-wrap break-words">
                      {output}
                    </div>
                  </div>
                )}
                {!error && !output && (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📝</div>
                      <div>Convert binary to see text result</div>
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
              { title: 'Binary Validation', desc: 'Real-time validation of binary input format.', icon: '✅' },
              { title: 'Custom Separators', desc: 'Support for spaces, hyphens, commas, or no separator.', icon: '🔧' },
              { title: 'Error Detection', desc: 'Clear error messages for invalid binary sequences.', icon: '⚠️' },
              { title: '8-bit Validation', desc: 'Ensures each sequence is exactly 8 bits.', icon: '🔢' },
              { title: 'Copy & Download', desc: 'Easily copy converted text or download as file.', icon: '📋' },
              { title: 'Clean Interface', desc: 'Simple, focused interface for binary conversion.', icon: '🎨' },
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
