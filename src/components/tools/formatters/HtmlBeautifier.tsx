'use client'

import { useState, useRef, useEffect } from 'react'
import { CodeEditor } from '@/components/ui/CodeEditor'
import { CopyButton } from '@/components/ui/CopyButton'
import { Download } from '@/components/ui/Download'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { DiffViewer } from '@/components/ui/DiffViewer'

interface FormattingOptions {
  indentType: 'spaces' | 'tabs'
  indentSize: 2 | 4 | 8
  wrapLines: boolean
  wrapColumn: number
  attributeFormat: 'single-line' | 'multi-line'
  tagCase: 'lowercase' | 'uppercase'
  selfClosingStyle: 'html' | 'xhtml'
  removeComments: boolean
  quoteStyle: 'single' | 'double'
  preserveDoctype: boolean
}

interface ValidationError {
  line: number
  column: number
  message: string
}

interface TextStats {
  characters: number
  words: number
  lines: number
}

export function HtmlBeautifier() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [activeTab, setActiveTab] = useState('format')
  const [isMinifyMode, setIsMinifyMode] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
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
    preserveDoctype: true
  })

  const getInputStats = (): TextStats => ({
    characters: input.length,
    words: input.split(/\s+/).filter(word => word.length > 0).length,
    lines: input.split('\n').length
  })

  const getOutputStats = (): TextStats => ({
    characters: output.length,
    words: output.split(/\s+/).filter(word => word.length > 0).length,
    lines: output.split('\n').length
  })

  const validateHTML = (html: string): ValidationError[] => {
    const validationErrors: ValidationError[] = []
    let tagCount = 0
    let inString = false
    let escapeNext = false
    let inComment = false
    let lineNum = 1
    let colNum = 1

    for (let i = 0; i < html.length; i++) {
      const char = html[i]
      
      if (char === '\n') {
        lineNum++
        colNum = 1
      } else {
        colNum++
      }
      
      if (escapeNext) {
        escapeNext = false
        continue
      }
      
      if (char === '\\') {
        escapeNext = true
        continue
      }
      
      if (!inComment && (char === '"' || char === "'") && !escapeNext) {
        inString = !inString
        continue
      }
      
      if (inString || inComment) continue
      
      if (char === '<' && html.substring(i, i + 4) !== '<!--') {
        tagCount++
      } else if (char === '>') {
        tagCount--
        if (tagCount < 0) {
          validationErrors.push({
            line: lineNum,
            column: colNum,
            message: `Unexpected closing tag`
          })
        }
      }
      
      if (html.substring(i, i + 4) === '<!--') {
        inComment = true
      } else if (html.substring(i - 3, i) === '-->') {
        inComment = false
      }
    }

    if (tagCount !== 0) {
      validationErrors.push({
        line: lineNum,
        column: colNum,
        message: `Unclosed tags: ${tagCount > 0 ? tagCount + ' opening tags' : Math.abs(tagCount) + ' closing tags'} missing`
      })
    }

    if (inString) {
      validationErrors.push({
        line: lineNum,
        column: colNum,
        message: 'Unclosed string literal'
      })
    }

    if (inComment) {
      validationErrors.push({
        line: lineNum,
        column: colNum,
        message: 'Unclosed HTML comment'
      })
    }

    return validationErrors
  }

  const formatHTML = (html: string, minify: boolean = false): string => {
    if (!html.trim()) return ''

    let processed = html

    // Handle DOCTYPE
    let doctype = ''
    if (options.preserveDoctype) {
      const doctypeMatch = html.match(/<!DOCTYPE[^>]*>/i)
      if (doctypeMatch) {
        doctype = doctypeMatch[0] + '\n'
        processed = processed.replace(doctypeMatch[0], '')
      }
    }

    // Remove comments if requested
    if (options.removeComments) {
      processed = processed.replace(/<!--[\s\S]*?-->/g, '')
    }

    if (minify) {
      // Minify mode
      return doctype + processed
        .replace(/>\s+</g, '><')
        .replace(/\s+/g, ' ')
        .replace(/^\s+|\s+$/g, '')
        .trim()
    }

    // Beautify mode
    const indentChar = options.indentType === 'tabs' ? '\t' : ' '.repeat(options.indentSize)
    
    // Convert tag case
    if (options.tagCase === 'uppercase') {
      processed = processed.replace(/<\s*\/?\s*([a-zA-Z][a-zA-Z0-9]*)/g, (match, tag) => {
        return match.replace(tag, tag.toUpperCase())
      })
    } else {
      processed = processed.replace(/<\s*\/?\s*([a-zA-Z][a-zA-Z0-9]*)/g, (match, tag) => {
        return match.replace(tag, tag.toLowerCase())
      })
    }

    // Standardize quotes
    if (options.quoteStyle === 'single') {
      processed = processed.replace(/="([^"]*)"/g, "='$1'")
    } else {
      processed = processed.replace(/='([^']*)'/g, '="$1"')
    }

    // Handle self-closing tags
    if (options.selfClosingStyle === 'xhtml') {
      const selfClosingTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']
      selfClosingTags.forEach(tag => {
        const regex = new RegExp(`<${tag}([^>]*)>`, 'gi')
        processed = processed.replace(regex, `<${tag}$1 />`)
      })
    }

    // Basic formatting
    let formatted = processed
      .replace(/></g, '>\n<')
      .replace(/(\s+)></g, '>')
      .replace(/^\s+|\s+$/gm, '')
      .split('\n')
      .map((line) => {
        const trimmed = line.trim()
        if (trimmed === '') return ''
        
        let indentLevel = 0
        
        // Calculate indentation
        if (trimmed.startsWith('</')) {
          indentLevel = Math.max(0, getCurrentIndentLevel(processed, processed.indexOf(line)) - 1)
        } else {
          indentLevel = getCurrentIndentLevel(processed, processed.indexOf(line))
        }
        
        return indentChar.repeat(Math.max(0, indentLevel)) + trimmed
      })
      .join('\n')

    // Line wrapping
    if (options.wrapLines && options.wrapColumn > 0) {
      formatted = formatted.split('\n').map(line => {
        if (line.length <= options.wrapColumn) return line
        return line.match(new RegExp(`.{1,${options.wrapColumn}}`, 'g'))?.join('\n') || line
      }).join('\n')
    }

    return doctype + formatted
  }

  const getCurrentIndentLevel = (text: string, position: number): number => {
    const before = text.substring(0, position)
    const openTags = before.match(/<[^\/][^>]*[^\/]>/g) || []
    const closeTags = before.match(/<\/[^>]+>/g) || []
    return Math.max(0, openTags.length - closeTags.length)
  }

  const processHTML = () => {
    try {
      setIsProcessing(true)
      const validationErrors = validateHTML(input)
      setErrors(validationErrors)
      
      if (validationErrors.length > 0) {
        setOutput('')
        return
      }

      const formatted = formatHTML(input, isMinifyMode)
      setOutput(formatted)
    } catch (err) {
      setErrors([{
        line: 1,
        column: 1,
        message: err instanceof Error ? err.message : 'Error processing HTML'
      }])
      setOutput('')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'text/html') {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setInput(content)
      }
      reader.readAsText(file)
    }
  }

  const fetchFromURL = async () => {
    try {
      setIsProcessing(true)
      const response = await fetch(urlInput)
      if (!response.ok) throw new Error('Failed to fetch URL')
      const html = await response.text()
      setInput(html)
      setUrlInput('')
    } catch (err) {
      setErrors([{
        line: 1,
        column: 1,
        message: 'Failed to fetch HTML from URL'
      }])
    } finally {
      setIsProcessing(false)
    }
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setErrors([])
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">HTML Beautifier & Formatter</h1>
          <p className="text-muted-foreground">
            Advanced HTML formatting with customizable options, validation, and multiple export formats.
          </p>
        </div>

        <Tabs defaultValue="format" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="format" isActive={activeTab === 'format'} onClick={() => setActiveTab('format')}>
              Format
            </TabsTrigger>
            <TabsTrigger value="options" isActive={activeTab === 'options'} onClick={() => setActiveTab('options')}>
              Options
            </TabsTrigger>
            <TabsTrigger value="compare" isActive={activeTab === 'compare'} onClick={() => setActiveTab('compare')}>
              Compare
            </TabsTrigger>
            <TabsTrigger value="import" isActive={activeTab === 'import'} onClick={() => setActiveTab('import')}>
              Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="format" isActive={activeTab === 'format'}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Input HTML</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={clearAll}>
                      Clear
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      Upload File
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {getInputStats().characters} chars, {getInputStats().words} words, {getInputStats().lines} lines
                </div>
                <CodeEditor
                  value={input}
                  onChange={setInput}
                  placeholder="Paste your HTML code here..."
                  rows={15}
                  showLineNumbers={true}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".html,.htm"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">
                    {isMinifyMode ? 'Minified' : 'Beautified'} Output
                  </h2>
                  {output && (
                    <div className="flex gap-2">
                      <CopyButton text={output} />
                      <Button variant="outline" size="sm" onClick={() => downloadFile(output, isMinifyMode ? 'minified.html' : 'beautified.html', 'text/html')}>
                        Download HTML
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => downloadFile(output, 'formatted.txt', 'text/plain')}>
                        Download TXT
                      </Button>
                    </div>
                  )}
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {getOutputStats().characters} chars, {getOutputStats().words} words, {getOutputStats().lines} lines
                </div>
                <CodeEditor
                  value={output}
                  onChange={() => {}}
                  placeholder={`${isMinifyMode ? 'Minified' : 'Beautified'} HTML will appear here...`}
                  rows={15}
                  showLineNumbers={true}
                  readOnly={true}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button onClick={processHTML} disabled={isProcessing || !input.trim()}>
                {isMinifyMode ? 'Minify HTML' : 'Beautify HTML'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsMinifyMode(!isMinifyMode)}
              >
                Switch to {isMinifyMode ? 'Beautify' : 'Minify'} Mode
              </Button>
            </div>

            {errors.length > 0 && (
              <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <h3 className="text-destructive font-semibold mb-2">Validation Errors:</h3>
                {errors.map((error, index) => (
                  <div key={index} className="text-destructive text-sm">
                    Line {error.line}, Column {error.column}: {error.message}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="options" isActive={activeTab === 'options'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Indentation</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Indent Type</label>
                  <Select
                    value={options.indentType}
                    onChange={(e) => setOptions({...options, indentType: e.target.value as 'spaces' | 'tabs'})}
                    options={[
                      { value: 'spaces', label: 'Spaces' },
                      { value: 'tabs', label: 'Tabs' }
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Indent Size</label>
                  <Select
                    value={options.indentSize.toString()}
                    onChange={(e) => setOptions({...options, indentSize: parseInt(e.target.value) as 2 | 4 | 8})}
                    options={[
                      { value: '2', label: '2 spaces' },
                      { value: '4', label: '4 spaces' },
                      { value: '8', label: '8 spaces' }
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tag Case</label>
                  <Select
                    value={options.tagCase}
                    onChange={(e) => setOptions({...options, tagCase: e.target.value as 'lowercase' | 'uppercase'})}
                    options={[
                      { value: 'lowercase', label: 'lowercase' },
                      { value: 'uppercase', label: 'UPPERCASE' }
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Self-closing Style</label>
                  <Select
                    value={options.selfClosingStyle}
                    onChange={(e) => setOptions({...options, selfClosingStyle: e.target.value as 'html' | 'xhtml'})}
                    options={[
                      { value: 'html', label: 'HTML (<br>)' },
                      { value: 'xhtml', label: 'XHTML (<br />)' }
                    ]}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Formatting Options</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Attribute Format</label>
                  <Select
                    value={options.attributeFormat}
                    onChange={(e) => setOptions({...options, attributeFormat: e.target.value as 'single-line' | 'multi-line'})}
                    options={[
                      { value: 'single-line', label: 'Single line' },
                      { value: 'multi-line', label: 'Multi line' }
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Quote Style</label>
                  <Select
                    value={options.quoteStyle}
                    onChange={(e) => setOptions({...options, quoteStyle: e.target.value as 'single' | 'double'})}
                    options={[
                      { value: 'double', label: 'Double quotes ("")' },
                      { value: 'single', label: 'Single quotes (\'\')' }
                    ]}
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={options.wrapLines}
                      onChange={(e) => setOptions({...options, wrapLines: e.target.checked})}
                    />
                    <span className="text-sm">Wrap lines at column</span>
                  </label>
                  
                  {options.wrapLines && (
                    <input
                      type="number"
                      value={options.wrapColumn}
                      onChange={(e) => setOptions({...options, wrapColumn: parseInt(e.target.value) || 80})}
                      className="w-24 px-2 py-1 border rounded text-sm"
                      min="40"
                      max="200"
                    />
                  )}
                </div>

                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={options.removeComments}
                      onChange={(e) => setOptions({...options, removeComments: e.target.checked})}
                    />
                    <span className="text-sm">Remove HTML comments</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={options.preserveDoctype}
                      onChange={(e) => setOptions({...options, preserveDoctype: e.target.checked})}
                    />
                    <span className="text-sm">Preserve DOCTYPE</span>
                  </label>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="compare" isActive={activeTab === 'compare'}>
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Format Comparison</h3>
              {input && output ? (
                <DiffViewer before={input} after={output} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Format some HTML first to see the comparison
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="import" isActive={activeTab === 'import'}>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-4">Upload HTML File</h3>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept=".html,.htm"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="text-muted-foreground">
                      Click to upload HTML file or drag and drop
                    </div>
                    <Button variant="outline" className="mt-4">
                      Choose File
                    </Button>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4">Fetch from URL</h3>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/page.html"
                    className="flex-1 px-3 py-2 border rounded-md"
                  />
                  <Button onClick={fetchFromURL} disabled={!urlInput.trim() || isProcessing}>
                    Fetch
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}