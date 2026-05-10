'use client'

import { useState, useRef, useEffect } from 'react'
import { CodeEditor } from '@/components/ui/CodeEditor'
import { SyntaxHighlighter } from '@/components/ui/SyntaxHighlighter'
import { CopyButton } from '@/components/ui/CopyButton'
import { Download } from '@/components/ui/Download'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { DiffViewer } from '@/components/ui/DiffViewer'
import { Header } from '@/components/ui/Header'

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


interface TextStats {
  characters: number
  words: number
  lines: number
}

export function HtmlBeautifier() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [activeTab, setActiveTab] = useState('format')
  const [urlInput, setUrlInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showUrlModal, setShowUrlModal] = useState(false)
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


  const formatHTML = (html: string): string => {
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

    // Basic formatting - proper HTML structure approach
    const tokens = processed.match(/<[^>]+>|[^<]+/g) || []
    const lines: string[] = []
    let currentLine = ''
    let indentLevel = 0
    
    for (const token of tokens) {
      const trimmedToken = token.trim()
      if (!trimmedToken) continue
      
      // Check if it's a tag
      if (trimmedToken.startsWith('<')) {
        const isClosingTag = trimmedToken.startsWith('</')
        const isSelfClosing = trimmedToken.endsWith('/>') || isSelfClosingTag(trimmedToken)
        const tagName = trimmedToken.replace(/<\/?([^\s>]+).*/, '$1').toLowerCase()
        
        // Block level tags that should be on their own line
        const blockTags = ['html', 'head', 'body', 'div', 'section', 'article', 'aside', 'nav', 'main', 'header', 'footer', 'form', 'fieldset', 'legend', 'table', 'tbody', 'thead', 'tfoot', 'tr', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote', 'pre', 'address', 'figure', 'figcaption', 'iframe', 'video', 'audio', 'canvas', 'svg', 'script', 'style', 'title', 'meta', 'link']
        
        if (blockTags.includes(tagName)) {
          // Finish current line if it has content
          if (currentLine.trim()) {
            lines.push(indentChar.repeat(indentLevel) + currentLine.trim())
            currentLine = ''
          }
          
          // Handle closing tags
          if (isClosingTag) {
            indentLevel = Math.max(0, indentLevel - 1)
            lines.push(indentChar.repeat(indentLevel) + trimmedToken)
          } else {
            lines.push(indentChar.repeat(indentLevel) + trimmedToken)
            if (!isSelfClosing) {
              indentLevel++
            }
          }
        } else {
          // Inline elements - add to current line
          currentLine += trimmedToken
        }
      } else {
        // Text content
        currentLine += trimmedToken
      }
    }
    
    // Add any remaining content
    if (currentLine.trim()) {
      lines.push(indentChar.repeat(indentLevel) + currentLine.trim())
    }
    
    let formatted = lines.join('\n')

    // Line wrapping
    if (options.wrapLines && options.wrapColumn > 0) {
      formatted = formatted.split('\n').map(line => {
        if (line.length <= options.wrapColumn) return line
        return line.match(new RegExp(`.{1,${options.wrapColumn}}`, 'g'))?.join('\n') || line
      }).join('\n')
    }

    return doctype + formatted
  }

  const isSelfClosingTag = (tag: string): boolean => {
    const selfClosingTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']
    const tagName = tag.replace(/<\/?([^\s>]+).*/, '$1').toLowerCase()
    return selfClosingTags.includes(tagName) || tag.endsWith('/>')
  }

  const processHTML = () => {
    try {
      setIsProcessing(true)
      const formatted = formatHTML(input)
      setOutput(formatted)
    } catch (err) {
      console.error('Error processing HTML:', err)
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
      console.error('Failed to fetch URL:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
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
        <Header 
          toolTitle="HTML Beautifier & Formatter"
          toolDescription="Advanced HTML formatting with customizable options, validation, and multiple export formats."
        />

        <div className="flex flex-wrap gap-4 mb-6">
            <Button onClick={processHTML} disabled={isProcessing || !input.trim()}>
              Beautify HTML
            </Button>
            <Button variant="outline" onClick={() => setShowUrlModal(true)}>
              Load URL
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              Upload File
            </Button>
            <Button variant="outline" size="sm" onClick={clearAll}>
              Clear
            </Button>
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
          </TabsList>

          <TabsContent value="format" isActive={activeTab === 'format'}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Input HTML</h2>
                  <div className="text-sm text-muted-foreground">
                    {getInputStats().characters} chars, {getInputStats().words} words, {getInputStats().lines} lines
                  </div>
                </div>
                <SyntaxHighlighter
                  value={input}
                  language="markup"
                  editable={true}
                  onChange={setInput}
                  placeholder="Paste your HTML code here..."
                  rows={15}
                  showLineNumbers={true}
                  readOnly={false}
                  className="h-[400px]"
                />
                {/* <CodeEditor
                    value={input}
                    onChange={setInput}
                    placeholder="Paste your HTML code here..."
                    className="h-full"
                    showLineNumbers={true}
                    errorLine={null}
                  /> */}
                
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
                  <h2 className="text-xl font-semibold">Beautified Output</h2>
                  <div className="flex gap-2">
                    {output && (
                      <>
                        <CopyButton text={output} />
                        <Button variant="outline" size="sm" onClick={() => downloadFile(output, 'beautified.html', 'text/html')}>
                          Download HTML
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => downloadFile(output, 'formatted.txt', 'text/plain')}>
                          Download TXT
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {getOutputStats().characters} chars, {getOutputStats().words} words, {getOutputStats().lines} lines
                </div>
                <SyntaxHighlighter
                  value={output}
                  language="markup"
                  editable={false}
                  placeholder="Beautified HTML will appear here..."
                  rows={15}
                  showLineNumbers={true}
                  readOnly={true}
                  className="h-[400px]"
                />
              </div>
            </div>

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
                    onChange={(e) => setOptions({...options, indentSize: parseInt(e.target.value) as 2 | 4 | 8})} // Changed from 4 to 8
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
        </Tabs>

        

        {/* URL Modal */}
        {showUrlModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Load HTML from URL</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">URL</label>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/page.html"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => {
                    setShowUrlModal(false)
                    setUrlInput('')
                  }}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => {
                      fetchFromURL()
                      setShowUrlModal(false)
                    }} 
                    disabled={!urlInput.trim() || isProcessing}
                  >
                    {isProcessing ? 'Loading...' : 'Load'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}