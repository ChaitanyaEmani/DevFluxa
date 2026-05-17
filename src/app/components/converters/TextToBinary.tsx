"use client"

import { useState } from "react"
import { CodeEditor } from "@/app/components/ui/CodeEditor"
import { CopyButton } from "@/app/components/ui/CopyButton"
import { Download } from "@/app/components/ui/Download"
import { Button } from "@/app/components/ui/Button"
import { Header } from "@/app/components/ui/Header"
import { textToBinary, binaryToText } from "@/lib/converters/binary"


export function TextToBinary() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'text-to-binary' | 'binary-to-text'>('text-to-binary')
  const [separator, setSeparator] = useState(' ')
  const [error, setError] = useState<string | null>(null)

  const convert = () => {
    try {
      setError(null)
      
      if (!input.trim()) {
        setOutput('')
        return
      }
      
      let result = ''
      
      if (mode === 'text-to-binary') {
        result = textToBinary(input, { separator })
      } else {
        result = binaryToText(input, { separator })
      }
      
      setOutput(result)
    } catch (err: any) {
      setError(err.message || 'Conversion failed')
      setOutput('')
    }
  }

  const swapMode = () => {
    setMode(mode === 'text-to-binary' ? 'binary-to-text' : 'text-to-binary')
    setInput(output)
    setOutput(input)
    setError(null)
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setError(null)
  }

  const loadExample = () => {
    if (mode === 'text-to-binary') {
      setInput('Hello, World!')
    } else {
      setInput('01001000 01100101 01101100 01101100 01101111 00101100 00100000 01010111 01101111 01110010 01101100 01100100 00100001')
    }
  }

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <Header 
          toolTitle="Text to Binary Converter" 
          toolDescription="Convert text to binary code and vice versa with customizable separators." 
        />

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <Button onClick={convert} className="shadow-sm hover:shadow-md transition-all duration-200">
              <span className="mr-2">🔄</span>
              {mode === 'text-to-binary' ? 'Convert to Binary' : 'Convert to Text'}
            </Button>
            <Button variant="outline" onClick={swapMode} className="shadow-sm hover:shadow-md transition-all duration-200">
              <span className="mr-2">🔀</span>
              Swap Mode
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

        {/* Mode Indicator */}
        <div className="mb-6 p-4 bg-muted/30 rounded-lg border">
          <div className="flex items-center justify-center gap-4">
            <span className={`font-medium ${mode === 'text-to-binary' ? 'text-primary' : 'text-muted-foreground'}`}>
              Text
            </span>
            <span className="text-muted-foreground">→</span>
            <span className={`font-medium ${mode === 'binary-to-text' ? 'text-primary' : 'text-muted-foreground'}`}>
              Binary
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Input */}
          <div className="space-y-2">
            <h2 className="text-xl font-bold">
              {mode === 'text-to-binary' ? 'Input Text' : 'Input Binary'}
            </h2>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative h-96 border-2 border-border/50 rounded-lg overflow-hidden bg-background/50 backdrop-blur-sm">
                <CodeEditor
                  value={input}
                  onChange={setInput}
                  placeholder={mode === 'text-to-binary' ? "Enter text to convert to binary..." : "Enter binary code to convert to text..."}
                  className="h-full"
                  showLineNumbers={mode === 'binary-to-text'}
                />
              </div>
            </div>
          </div>

          {/* Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {mode === 'text-to-binary' ? 'Binary Output' : 'Text Output'}
              </h2>
              {output && (
                <div className="flex gap-2">
                  <CopyButton text={output} />
                  <Download 
                    content={output} 
                    filename={mode === 'text-to-binary' ? "binary.txt" : "text.txt"} 
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
                  <CodeEditor
                    value={output}
                    onChange={() => {}}
                    className="h-full"
                    showLineNumbers={mode === 'text-to-binary'}
                    readOnly={true}
                  />
                )}
                {!error && !output && (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <div className="text-4xl mb-2">{mode === 'text-to-binary' ? '💻' : '📝'}</div>
                      <div>
                        {mode === 'text-to-binary' ? 'Convert text to see binary result' : 'Convert binary to see text result'}
                      </div>
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
              { title: 'Bidirectional', desc: 'Convert text to binary and binary to text.', icon: '🔄' },
              { title: 'Custom Separators', desc: 'Choose between space, hyphen, comma, or no separator.', icon: '🔧' },
              { title: 'Real-time Conversion', desc: 'Instant conversion with error handling.', icon: '⚡' },
              { title: 'Copy & Download', desc: 'Easily copy results or download as text file.', icon: '📋' },
              { title: 'Mode Switching', desc: 'Quickly swap between conversion modes.', icon: '🔀' },
              { title: 'Error Detection', desc: 'Clear error messages for invalid input.', icon: '⚠️' },
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
