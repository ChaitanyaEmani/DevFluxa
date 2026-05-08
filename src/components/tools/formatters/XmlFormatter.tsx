'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { CodeEditor } from '@/components/ui/CodeEditor'
import { CopyButton } from '@/components/ui/CopyButton'
import { Download } from '@/components/ui/Download'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Toggle } from '@/components/ui/Toggle'
import { Input } from '@/components/ui/Input'

interface FormattingOptions {
  indentStyle: 'spaces' | 'tabs'
  indentSize: number
  minify: boolean
  alignAttributes: boolean
  wrapAttributes: boolean
  optimizeSelfClosing: boolean
}

interface HistoryEntry {
  input: string
  output: string
  options: FormattingOptions
  timestamp: number
}

interface ValidationError {
  line: number
  column: number
  message: string
}

export function XmlFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [options, setOptions] = useState<FormattingOptions>({
    indentStyle: 'spaces',
    indentSize: 2,
    minify: false,
    alignAttributes: false,
    wrapAttributes: false,
    optimizeSelfClosing: true
  })
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const [url, setUrl] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        formatXml()
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault()
        redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [input, output, history, historyIndex])

  const validateXml = useCallback((xml: string): ValidationError[] => {
    const errors: ValidationError[] = []
    let tagCount = 0
    let inString = false
    let escapeNext = false
    let inComment = false
    let inCData = false
    let line = 1
    let column = 1

    for (let i = 0; i < xml.length; i++) {
      const char = xml[i]
      
      if (char === '\n') {
        line++
        column = 1
      } else {
        column++
      }
      
      if (escapeNext) {
        escapeNext = false
        continue
      }
      
      if (char === '\\') {
        escapeNext = true
        continue
      }
      
      if (!inComment && !inCData && (char === '"' || char === "'") && !escapeNext) {
        inString = !inString
        continue
      }
      
      if (inString || inComment || inCData) continue
      
      // Handle XML comments
      if (xml.substring(i, i + 4) === '<!--') {
        inComment = true
      } else if (xml.substring(i - 3, i) === '-->') {
        inComment = false
      }
      
      // Handle CDATA sections
      if (xml.substring(i, i + 9) === '<![CDATA[') {
        inCData = true
      } else if (xml.substring(i - 3, i) === ']]>') {
        inCData = false
      }
      
      if (!inComment && !inCData && char === '<' && xml.substring(i, i + 4) !== '<!--') {
        tagCount++
      } else if (!inComment && !inCData && char === '>') {
        tagCount--
      }
      
      if (tagCount < 0) {
        errors.push({
          line,
          column,
          message: `Unexpected closing tag`
        })
      }
    }

    if (tagCount !== 0) {
      errors.push({
        line,
        column,
        message: `Unclosed tags: ${tagCount > 0 ? tagCount + ' opening tags' : Math.abs(tagCount) + ' closing tags'} missing`
      })
    }

    if (inString) {
      errors.push({
        line,
        column,
        message: 'Unclosed string literal'
      })
    }

    if (inComment) {
      errors.push({
        line,
        column,
        message: 'Unclosed XML comment'
      })
    }

    if (inCData) {
      errors.push({
        line,
        column,
        message: 'Unclosed CDATA section'
      })
    }

    return errors
  }, [])

  const formatXml = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      setValidationErrors([])

      if (!input.trim()) {
        throw new Error('Please enter XML content to format')
      }

      // Validate XML
      const errors = validateXml(input)
      if (errors.length > 0) {
        setValidationErrors(errors)
        throw new Error(`XML validation failed with ${errors.length} error(s)`)
      }

      let formatted = input

      // Minify if requested
      if (options.minify) {
        formatted = formatted
          .replace(/>\s+</g, '><')
          .replace(/\s+/g, ' ')
          .replace(/^\s+|\s+$/g, '')
      } else {
        // Format with indentation
        const indent = options.indentStyle === 'spaces' ? ' '.repeat(options.indentSize) : '\t'
        
        formatted = formatted
          .replace(/>\s*</g, '>\n<')
          .replace(/^\s+|\s+$/gm, '')
          .split('\n')
          .map((line, index, array) => {
            const trimmed = line.trim()
            if (trimmed === '') return ''
            
            let indentLevel = 0
            const beforeLines = array.slice(0, index)
            let currentLevel = 0
            
            beforeLines.forEach((prevLine) => {
              const prevTrimmed = prevLine.trim()
              if (prevTrimmed.startsWith('</')) {
                currentLevel--
              } else if (prevTrimmed.startsWith('<') && !prevTrimmed.startsWith('</') && !prevTrimmed.startsWith('<!--') && !prevTrimmed.startsWith('<?')) {
                if (!prevTrimmed.endsWith('/>') && !prevTrimmed.endsWith('-->') && !prevTrimmed.endsWith('?>')) {
                  currentLevel++
                }
              }
            })
            
            if (trimmed.startsWith('</')) {
              indentLevel = Math.max(0, currentLevel - 1)
            } else {
              indentLevel = currentLevel
            }
            
            // Handle attributes
            if (options.alignAttributes || options.wrapAttributes) {
              const tagMatch = trimmed.match(/^<([^>]+)>/)
              if (tagMatch) {
                const tagContent = tagMatch[1]
                const tagName = tagContent.split(' ')[0]
                const attributes = tagContent.substring(tagName.length).trim()
                
                if (attributes) {
                  if (options.wrapAttributes) {
                    const attrs = attributes.split(/\s+/).filter(Boolean)
                    const formattedAttrs = attrs.map((attr, i) => 
                      indent.repeat(indentLevel + 1) + (i === 0 ? '' : '  ') + attr
                    ).join('\n')
                    return indent.repeat(indentLevel) + `<${tagName}\n${formattedAttrs}>`
                  } else if (options.alignAttributes) {
                    const attrs = attributes.split(/\s+/).filter(Boolean)
                    const maxAttrLength = Math.max(...attrs.map(attr => attr.split('=')[0].length))
                    const formattedAttrs = attrs.map(attr => {
                      const [name, value] = attr.split('=')
                      return `${name}${' '.repeat(maxAttrLength - name.length + 2)}= ${value}`
                    }).join('\n' + indent.repeat(indentLevel + 1))
                    return indent.repeat(indentLevel) + `<${tagName} ${formattedAttrs}>`
                  }
                }
              }
            }
            
            return indent.repeat(indentLevel) + trimmed
          })
          .join('\n')
      }

      // Optimize self-closing tags
      if (options.optimizeSelfClosing && !options.minify) {
        formatted = formatted.replace(/<(\w+)([^>]*)><\/\1>/g, (match, tagName, attrs) => {
          return `<${tagName}${attrs}/>`
        })
      }

      setOutput(formatted)
      
      // Add to history
      const newEntry: HistoryEntry = {
        input,
        output: formatted,
        options: { ...options },
        timestamp: Date.now()
      }
      setHistory(prev => [...prev.slice(-49), newEntry])
      setHistoryIndex(-1)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error formatting XML'
      setError(errorMessage)
      setOutput('')
    } finally {
      setIsLoading(false)
    }
  }, [input, options, validateXml])

  const convertFormat = useCallback((targetFormat: 'json' | 'yaml' | 'csv') => {
    try {
      if (!output.trim()) {
        throw new Error('No formatted XML to convert')
      }

      let converted = ''
      
      if (targetFormat === 'json') {
        // Simple XML to JSON conversion
        const parser = new DOMParser()
        const doc = parser.parseFromString(output, 'text/xml')
        const errorNode = doc.querySelector('parsererror')
        if (errorNode) {
          throw new Error('Invalid XML for conversion')
        }
        
        const xmlToJson = (node: Element): any => {
          const obj: any = {}
          
          if (node.attributes) {
            for (const attr of node.attributes) {
              obj[`@${attr.name}`] = attr.value
            }
          }
          
          if (node.childNodes.length === 0) {
            return node.textContent || ''
          }
          
          if (node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE) {
            return node.textContent || ''
          }
          
          for (const child of node.childNodes) {
            if (child.nodeType === Node.ELEMENT_NODE) {
              const childNode = child as Element
              const childName = childNode.tagName
              const childValue = xmlToJson(childNode)
              
              if (obj[childName]) {
                if (!Array.isArray(obj[childName])) {
                  obj[childName] = [obj[childName]]
                }
                obj[childName].push(childValue)
              } else {
                obj[childName] = childValue
              }
            }
          }
          
          return obj
        }
        
        converted = JSON.stringify(xmlToJson(doc.documentElement), null, 2)
      } else if (targetFormat === 'yaml') {
        // Simple YAML conversion (basic implementation)
        converted = output
          .replace(/</g, '')
          .replace(/>/g, ':')
          .replace(/\//g, '')
      } else if (targetFormat === 'csv') {
        // Basic CSV conversion (extracts text content)
        const parser = new DOMParser()
        const doc = parser.parseFromString(output, 'text/xml')
        const texts = Array.from(doc.querySelectorAll('*')).map(el => el.textContent?.trim()).filter(Boolean)
        converted = texts.join(',')
      }
      
      setOutput(converted)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error converting format'
      setError(errorMessage)
    }
  }, [output])

  const fetchFromUrl = useCallback(async () => {
    try {
      if (!url.trim()) {
        throw new Error('Please enter a URL')
      }
      
      setIsLoading(true)
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const text = await response.text()
      setInput(text)
      setUrl('')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching XML'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [url])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setInput(content)
      }
      reader.onerror = () => {
        setError('Error reading file')
      }
      reader.readAsText(file)
    }
  }, [])

  const undo = useCallback(() => {
    if (history.length > 0 && historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      const entry = history[history.length - 1 - newIndex]
      setInput(entry.input)
      setOutput(entry.output)
      setOptions(entry.options)
      setHistoryIndex(newIndex)
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      const entry = history[history.length - 1 - newIndex]
      setInput(entry.input)
      setOutput(entry.output)
      setOptions(entry.options)
      setHistoryIndex(newIndex)
    }
  }, [history, historyIndex])

  const clearAll = useCallback(() => {
    setInput('')
    setOutput('')
    setError('')
    setValidationErrors([])
  }, [])

  return (
    <div className="container py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">XML Formatter</h1>
          <p className="text-muted-foreground">
            Advanced XML formatter with validation, conversion, and multiple formatting options.
          </p>
        </div>

        {/* Formatting Options */}
        <div className="mb-6 p-4 border rounded-lg bg-muted/50">
          <h3 className="font-semibold mb-4">Formatting Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Indent Style</label>
              <Select
                value={options.indentStyle}
                onChange={(e) => setOptions(prev => ({ ...prev, indentStyle: e.target.value as 'spaces' | 'tabs' }))}
                options={[
                  { value: 'spaces', label: 'Spaces' },
                  { value: 'tabs', label: 'Tabs' }
                ]}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Indent Size</label>
              <Input
                type="number"
                min="1"
                max="8"
                value={options.indentSize}
                onChange={(e) => setOptions(prev => ({ ...prev, indentSize: parseInt(e.target.value) || 2 }))}
                disabled={options.indentStyle === 'tabs'}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Minify</label>
              <Toggle
                pressed={options.minify}
                onPressedChange={(pressed) => setOptions(prev => ({ ...prev, minify: pressed }))}
              >
                {options.minify ? 'Minified' : 'Formatted'}
              </Toggle>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Align Attributes</label>
              <Toggle
                pressed={options.alignAttributes}
                onPressedChange={(pressed) => setOptions(prev => ({ ...prev, alignAttributes: pressed }))}
                disabled={options.minify}
              >
                {options.alignAttributes ? 'Aligned' : 'Default'}
              </Toggle>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Wrap Attributes</label>
              <Toggle
                pressed={options.wrapAttributes}
                onPressedChange={(pressed) => setOptions(prev => ({ ...prev, wrapAttributes: pressed }))}
                disabled={options.minify}
              >
                {options.wrapAttributes ? 'Wrapped' : 'Single Line'}
              </Toggle>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Optimize Self-Closing</label>
              <Toggle
                pressed={options.optimizeSelfClosing}
                onPressedChange={(pressed) => setOptions(prev => ({ ...prev, optimizeSelfClosing: pressed }))}
                disabled={options.minify}
              >
                {options.optimizeSelfClosing ? 'Optimized' : 'Preserve'}
              </Toggle>
            </div>
          </div>
        </div>

        {/* Import Options */}
        <div className="mb-6 p-4 border rounded-lg bg-muted/50">
          <h3 className="font-semibold mb-4">Import Options</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex gap-2 items-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xml,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                Upload File
              </Button>
            </div>
            
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Enter XML URL..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-64"
              />
              <Button onClick={fetchFromUrl} variant="outline" disabled={!url.trim()}>
                Fetch
              </Button>
            </div>
          </div>
        </div>

        {/* Editor Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Input XML</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={clearAll}>
                  Clear
                </Button>
              </div>
            </div>
            <CodeEditor
              value={input}
              onChange={setInput}
              placeholder="Paste your XML here..."
              rows={12}
              showLineNumbers={true}
            />
          </div>

          {/* Output Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Formatted Output</h2>
              {output && (
                <div className="flex gap-2">
                  <CopyButton text={output} />
                  <Download
                    content={output}
                    filename="formatted.xml"
                    mimeType="text/xml"
                  />
                </div>
              )}
            </div>
            <CodeEditor
              value={output}
              onChange={setOutput}
              placeholder="Formatted XML will appear here..."
              rows={12}
              readOnly={true}
              showLineNumbers={true}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mt-6">
          <Button onClick={formatXml} disabled={isLoading}>
            {isLoading ? 'Formatting...' : 'Format XML'}
          </Button>
          
          <Button onClick={undo} variant="outline" disabled={history.length === 0 || historyIndex >= history.length - 1}>
            Undo
          </Button>
          
          <Button onClick={redo} variant="outline" disabled={historyIndex <= 0}>
            Redo
          </Button>
        </div>

        {/* Format Conversion */}
        {output && (
          <div className="flex flex-wrap gap-4 mt-4">
            <Button onClick={() => convertFormat('json')} variant="outline">
              Convert to JSON
            </Button>
            <Button onClick={() => convertFormat('yaml')} variant="outline">
              Convert to YAML
            </Button>
            <Button onClick={() => convertFormat('csv')} variant="outline">
              Convert to CSV
            </Button>
          </div>
        )}

        {/* Error Messages */}
        {error && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm font-medium">
              {error}
            </p>
          </div>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <h4 className="text-destructive font-medium mb-2">Validation Errors:</h4>
            <ul className="text-destructive text-sm space-y-1">
              {validationErrors.slice(0, 10).map((err, index) => (
                <li key={index}>
                  Line {err.line}, Column {err.column}: {err.message}
                </li>
              ))}
              {validationErrors.length > 10 && (
                <li className="text-xs">...and {validationErrors.length - 10} more errors</li>
              )}
            </ul>
          </div>
        )}

        {/* Keyboard Shortcuts */}
        <div className="mt-8 p-4 border rounded-lg bg-muted/30">
          <h3 className="font-semibold mb-2">Keyboard Shortcuts</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <div><kbd className="px-2 py-1 bg-background border rounded">Ctrl+Enter</kbd> - Format XML</div>
            <div><kbd className="px-2 py-1 bg-background border rounded">Ctrl+Z</kbd> - Undo</div>
            <div><kbd className="px-2 py-1 bg-background border rounded">Ctrl+Shift+Z</kbd> - Redo</div>
          </div>
        </div>
      </div>
    </div>
  )
}