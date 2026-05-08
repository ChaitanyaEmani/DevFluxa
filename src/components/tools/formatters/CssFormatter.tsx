'use client'

import { useState, useEffect, useRef } from 'react'
import { TextareaInput } from '@/components/ui/TextareaInput'
import { TextareaOutput } from '@/components/ui/TextareaOutput'
import { CopyButton } from '@/components/ui/CopyButton'
import { Download } from '@/components/ui/Download'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Toggle } from '@/components/ui/Toggle'
import { Input } from '@/components/ui/Input'
import { CodeEditor } from '@/components/ui/CodeEditor'
import { DiffViewer } from '@/components/ui/DiffViewer'

interface FormatOptions {
  indentType: 'spaces' | 'tabs'
  indentSize: number
  braceStyle: 'same-line' | 'new-line'
  propertySorting: 'none' | 'alphabetical' | 'grouped'
  colorFormat: 'original' | 'hex' | 'rgb' | 'hsl'
  unitOptimization: 'none' | 'px-to-rem' | 'px-to-em'
  minify: boolean
  vendorPrefixing: boolean
  preset: 'custom' | 'google' | 'airbnb' | 'bootstrap'
}

const formatPresets: Record<string, Partial<FormatOptions>> = {
  google: {
    indentType: 'spaces',
    indentSize: 2,
    braceStyle: 'new-line',
    propertySorting: 'alphabetical'
  },
  airbnb: {
    indentType: 'spaces',
    indentSize: 2,
    braceStyle: 'same-line',
    propertySorting: 'grouped'
  },
  bootstrap: {
    indentType: 'tabs',
    indentSize: 4,
    braceStyle: 'same-line',
    propertySorting: 'none'
  }
}

const propertyGroups = {
  layout: ['display', 'position', 'top', 'right', 'bottom', 'left', 'z-index', 'float', 'clear', 'overflow', 'visibility'],
  box: ['width', 'height', 'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'border', 'border-top', 'border-right', 'border-bottom', 'border-left'],
  typography: ['font', 'font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'text-align', 'text-decoration', 'text-transform', 'letter-spacing', 'word-spacing', 'color'],
  visual: ['background', 'background-color', 'background-image', 'background-repeat', 'background-position', 'background-size', 'opacity', 'box-shadow', 'border-radius'],
  animation: ['transition', 'transform', 'animation', 'animation-name', 'animation-duration', 'animation-timing-function', 'animation-delay', 'animation-iteration-count', 'animation-direction']
}

const vendorPrefixes = {
  'border-radius': ['-webkit-border-radius', '-moz-border-radius'],
  'box-shadow': ['-webkit-box-shadow', '-moz-box-shadow'],
  'transform': ['-webkit-transform', '-moz-transform', '-ms-transform'],
  'transition': ['-webkit-transition', '-moz-transition', '-o-transition'],
  'animation': ['-webkit-animation', '-moz-animation', '-o-animation'],
  'opacity': ['-webkit-opacity', '-moz-opacity'],
  'box-sizing': ['-webkit-box-sizing', '-moz-box-sizing'],
  'background-size': ['-webkit-background-size', '-moz-background-size', '-o-background-size'],
  'user-select': ['-webkit-user-select', '-moz-user-select', '-ms-user-select'],
  'flex': ['-webkit-flex', '-ms-flex'],
  'flex-direction': ['-webkit-flex-direction', '-ms-flex-direction'],
  'justify-content': ['-webkit-justify-content', '-ms-justify-content'],
  'align-items': ['-webkit-align-items', '-ms-flex-align'],
  'grid-template-columns': ['-ms-grid-columns'],
  'grid-template-rows': ['-ms-grid-rows']
}

export function CssFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [showDiff, setShowDiff] = useState(false)
  const [showLineNumbers, setShowLineNumbers] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [options, setOptions] = useState<FormatOptions>({
    indentType: 'spaces',
    indentSize: 2,
    braceStyle: 'same-line',
    propertySorting: 'none',
    colorFormat: 'original',
    unitOptimization: 'none',
    minify: false,
    vendorPrefixing: false,
    preset: 'custom'
  })

  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (result) {
      const r = parseInt(result[1], 16)
      const g = parseInt(result[2], 16)
      const b = parseInt(result[3], 16)
      return `rgb(${r}, ${g}, ${b})`
    }
    return hex
  }

  const hexToHsl = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (result) {
      let r = parseInt(result[1], 16) / 255
      let g = parseInt(result[2], 16) / 255
      let b = parseInt(result[3], 16) / 255
      
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      let h = 0, s = 0, l = (max + min) / 2
      
      if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
          case g: h = ((b - r) / d + 2) / 6; break
          case b: h = ((r - g) / d + 4) / 6; break
        }
      }
      
      return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
    }
    return hex
  }

  const rgbToHex = (rgb: string): string => {
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (match) {
      const r = parseInt(match[1])
      const g = parseInt(match[2])
      const b = parseInt(match[3])
      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
    }
    return rgb
  }

  const convertColors = (css: string, targetFormat: string): string => {
    if (targetFormat === 'original') return css
    
    return css.replace(/#([a-f\d]{3}|[a-f\d]{6})\b|rgb\([^)]+\)|hsl\([^)]+\)/gi, (match) => {
      if (match.startsWith('#')) {
        if (targetFormat === 'hex') return match
        if (targetFormat === 'rgb') return hexToRgb(match)
        if (targetFormat === 'hsl') return hexToHsl(match)
      } else if (match.startsWith('rgb')) {
        if (targetFormat === 'rgb') return match
        if (targetFormat === 'hex') return rgbToHex(match)
        if (targetFormat === 'hsl') {
          const hex = rgbToHex(match)
          return hexToHsl(hex)
        }
      } else if (match.startsWith('hsl')) {
        return match // hsl to other formats is complex, keep as is
      }
      return match
    })
  }

  const optimizeUnits = (css: string, optimization: string): string => {
    if (optimization === 'none') return css
    
    const baseFontSize = 16 // Default browser font size
    
    return css.replace(/(\d+(?:\.\d+)?)px\b/g, (match, value) => {
      const px = parseFloat(value)
      if (optimization === 'px-to-rem') {
        return `${(px / baseFontSize).toFixed(3)}rem`
      } else if (optimization === 'px-to-em') {
        return `${(px / baseFontSize).toFixed(3)}em`
      }
      return match
    })
  }

  const addVendorPrefixes = (css: string): string => {
    const lines = css.split('\n')
    const prefixedLines: string[] = []
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.includes(':') && !trimmed.startsWith('@') && !trimmed.startsWith('}')) {
        const property = trimmed.split(':')[0].trim()
        const value = trimmed.substring(trimmed.indexOf(':') + 1).trim()
        
        if (vendorPrefixes[property as keyof typeof vendorPrefixes]) {
          const prefixes = vendorPrefixes[property as keyof typeof vendorPrefixes]
          for (const prefix of prefixes) {
            const indent = line.substring(0, line.indexOf(trimmed))
            prefixedLines.push(`${indent}${prefix}: ${value};`)
          }
        }
      }
      prefixedLines.push(line)
    }
    
    return prefixedLines.join('\n')
  }

  const sortProperties = (css: string, sorting: string): string => {
    if (sorting === 'none') return css
    
    const lines = css.split('\n')
    const sortedLines: string[] = []
    let currentRule: string[] = []
    let inRule = false
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()
      
      if (trimmed.includes('{') && !trimmed.startsWith('@')) {
        inRule = true
        sortedLines.push(line)
        continue
      }
      
      if (trimmed === '}') {
        if (currentRule.length > 0) {
          if (sorting === 'alphabetical') {
            currentRule.sort((a, b) => {
              const propA = a.trim().split(':')[0].trim()
              const propB = b.trim().split(':')[0].trim()
              return propA.localeCompare(propB)
            })
          } else if (sorting === 'grouped') {
            const grouped: { [key: string]: string[] } = {}
            const ungrouped: string[] = []
            
            for (const propLine of currentRule) {
              const prop = propLine.trim().split(':')[0].trim()
              let groupedFound = false
              
              for (const [groupName, props] of Object.entries(propertyGroups)) {
                if (props.includes(prop)) {
                  if (!grouped[groupName]) grouped[groupName] = []
                  grouped[groupName].push(propLine)
                  groupedFound = true
                  break
                }
              }
              
              if (!groupedFound) {
                ungrouped.push(propLine)
              }
            }
            
            const order = ['layout', 'box', 'typography', 'visual', 'animation']
            for (const groupName of order) {
              if (grouped[groupName]) {
                currentRule = [...currentRule, ...grouped[groupName]]
              }
            }
            currentRule = [...currentRule, ...ungrouped]
          }
          
          sortedLines.push(...currentRule)
          currentRule = []
        }
        
        inRule = false
        sortedLines.push(line)
        continue
      }
      
      if (inRule && trimmed.includes(':')) {
        currentRule.push(line)
      } else if (!inRule) {
        sortedLines.push(line)
      }
    }
    
    return sortedLines.join('\n')
  }

  const minifyCss = (css: string): string => {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/;\s*}/g, '}') // Remove semicolons before closing braces
      .replace(/\s*{\s*/g, '{') // Remove spaces around braces
      .replace(/\s*}\s*/g, '}')
      .replace(/\s*;\s*/g, ';') // Remove spaces around semicolons
      .replace(/\s*:\s*/g, ':') // Remove spaces around colons
      .replace(/\s*,\s*/g, ',') // Remove spaces around commas
      .trim()
  }

  const formatCss = () => {
    try {
      if (!input.trim()) {
        throw new Error('Please enter CSS content to format')
      }

      // Enhanced CSS validation with line numbers
      let braceCount = 0
      let inString = false
      let escapeNext = false
      let inComment = false
      const lines = input.split('\n')

      for (let i = 0; i < input.length; i++) {
        const char = input[i]
        const lineNumber = input.substring(0, i).split('\n').length
        
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
        
        if (inString) continue
        
        // Handle CSS comments
        if (char === '/' && i + 1 < input.length && input[i + 1] === '*') {
          inComment = true
        } else if (char === '*' && i + 1 < input.length && input[i + 1] === '/') {
          inComment = false
        }
        
        if (!inComment) {
          if (char === '{') braceCount++
          else if (char === '}') braceCount--
          
          if (braceCount < 0) {
            throw new Error(`Unexpected closing brace at line ${lineNumber}`)
          }
        }
      }

      if (braceCount !== 0) {
        throw new Error(`Unclosed braces: ${braceCount > 0 ? braceCount + ' opening braces' : Math.abs(braceCount) + ' closing braces'} missing`)
      }

      if (inString) {
        throw new Error('Unclosed string literal')
      }

      if (inComment) {
        throw new Error('Unclosed CSS comment')
      }

      let formatted = input

      // Apply vendor prefixing first if enabled
      if (options.vendorPrefixing) {
        formatted = addVendorPrefixes(formatted)
      }

      // Convert colors if needed
      if (options.colorFormat !== 'original') {
        formatted = convertColors(formatted, options.colorFormat)
      }

      // Optimize units if needed
      if (options.unitOptimization !== 'none') {
        formatted = optimizeUnits(formatted, options.unitOptimization)
      }

      // Sort properties if needed
      if (options.propertySorting !== 'none') {
        formatted = sortProperties(formatted, options.propertySorting)
      }

      // Apply formatting based on options
      if (!options.minify) {
        const indentChar = options.indentType === 'tabs' ? '\t' : ' '.repeat(options.indentSize)
        
        if (options.braceStyle === 'same-line') {
          formatted = formatted
            .replace(/\s*{\s*/g, ' {\n' + indentChar)
            .replace(/;\s*/g, ';\n' + indentChar)
            .replace(/\s*}\s*/g, '\n}\n')
        } else {
          formatted = formatted
            .replace(/\s*{\s*/g, '\n{\n' + indentChar)
            .replace(/;\s*/g, ';\n' + indentChar)
            .replace(/\s*}\s*/g, '\n}\n')
        }
        
        formatted = formatted
          .replace(/^\s+|\s+$/gm, '')
          .replace(/\n\s*\n/g, '\n')
          .split('\n')
          .map((line) => {
            const trimmed = line.trim()
            if (trimmed === '') return ''
            
            let indentLevel = 0
            if (trimmed.startsWith('}')) {
              indentLevel = -1
            }
            
            const currentIndent = getCurrentIndentation(input, input.indexOf(line))
            const indent = indentChar.repeat(Math.max(0, currentIndent + indentLevel))
            return indent + trimmed
          })
          .join('\n')
      } else {
        formatted = minifyCss(formatted)
      }

      setOutput(formatted)
      setError('')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error formatting CSS'
      setError(errorMessage)
      setOutput('')
    }
  }

  const getCurrentIndentation = (text: string, position: number) => {
    const beforePosition = text.substring(0, position)
    const openBraces = (beforePosition.match(/{/g) || []).length
    const closeBraces = (beforePosition.match(/}/g) || []).length
    return Math.max(0, openBraces - closeBraces)
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setError('')
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'text/css') {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setInput(content)
      }
      reader.readAsText(file)
    } else {
      setError('Please select a valid CSS file')
    }
  }

  const handlePresetChange = (preset: string) => {
    if (preset !== 'custom' && formatPresets[preset]) {
      setOptions(prev => ({
        ...prev,
        ...formatPresets[preset],
        preset: preset as FormatOptions['preset']
      }))
    } else {
      setOptions(prev => ({ ...prev, preset: 'custom' }))
    }
  }

  const handleOptionChange = <K extends keyof FormatOptions>(
    key: K,
    value: FormatOptions[K]
  ) => {
    setOptions(prev => ({ ...prev, [key]: value, preset: 'custom' }))
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        formatCss()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && output) {
        e.preventDefault()
        navigator.clipboard.writeText(output)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [output])

  return (
    <div className="container py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">CSS Formatter</h1>
          <p className="text-muted-foreground mb-4">
            Advanced CSS formatter with multiple formatting options, validation, and optimization features.
          </p>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span className="px-2 py-1 bg-muted rounded">⌘+Enter: Format</span>
            <span className="px-2 py-1 bg-muted rounded">⌘+C: Copy Output</span>
          </div>
        </div>

        {/* Settings Panel */}
        <div className="mb-6 p-4 border rounded-lg bg-muted/50">
          <h3 className="font-semibold mb-4">Formatting Options</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Preset */}
            <div>
              <label className="block text-sm font-medium mb-2">Preset</label>
              <Select
                value={options.preset}
                onChange={(e) => handlePresetChange(e.target.value)}
                options={[
                  { value: 'custom', label: 'Custom' },
                  { value: 'google', label: 'Google Style' },
                  { value: 'airbnb', label: 'Airbnb Style' },
                  { value: 'bootstrap', label: 'Bootstrap Style' }
                ]}
              />
            </div>

            {/* Indentation Type */}
            <div>
              <label className="block text-sm font-medium mb-2">Indentation</label>
              <div className="flex gap-2">
                <Select
                  value={options.indentType}
                  onChange={(e) => handleOptionChange('indentType', e.target.value as FormatOptions['indentType'])}
                  options={[
                    { value: 'spaces', label: 'Spaces' },
                    { value: 'tabs', label: 'Tabs' }
                  ]}
                />
                <Input
                  type="number"
                  min="1"
                  max="8"
                  value={options.indentSize}
                  onChange={(e) => handleOptionChange('indentSize', parseInt(e.target.value))}
                  className="w-20"
                  disabled={options.indentType === 'tabs'}
                />
              </div>
            </div>

            {/* Brace Style */}
            <div>
              <label className="block text-sm font-medium mb-2">Brace Style</label>
              <Select
                value={options.braceStyle}
                onChange={(e) => handleOptionChange('braceStyle', e.target.value as FormatOptions['braceStyle'])}
                options={[
                  { value: 'same-line', label: 'Same Line' },
                  { value: 'new-line', label: 'New Line' }
                ]}
              />
            </div>

            {/* Property Sorting */}
            <div>
              <label className="block text-sm font-medium mb-2">Property Sorting</label>
              <Select
                value={options.propertySorting}
                onChange={(e) => handleOptionChange('propertySorting', e.target.value as FormatOptions['propertySorting'])}
                options={[
                  { value: 'none', label: 'None' },
                  { value: 'alphabetical', label: 'Alphabetical' },
                  { value: 'grouped', label: 'Grouped by Type' }
                ]}
              />
            </div>

            {/* Color Format */}
            <div>
              <label className="block text-sm font-medium mb-2">Color Format</label>
              <Select
                value={options.colorFormat}
                onChange={(e) => handleOptionChange('colorFormat', e.target.value as FormatOptions['colorFormat'])}
                options={[
                  { value: 'original', label: 'Original' },
                  { value: 'hex', label: 'HEX' },
                  { value: 'rgb', label: 'RGB' },
                  { value: 'hsl', label: 'HSL' }
                ]}
              />
            </div>

            {/* Unit Optimization */}
            <div>
              <label className="block text-sm font-medium mb-2">Unit Optimization</label>
              <Select
                value={options.unitOptimization}
                onChange={(e) => handleOptionChange('unitOptimization', e.target.value as FormatOptions['unitOptimization'])}
                options={[
                  { value: 'none', label: 'None' },
                  { value: 'px-to-rem', label: 'px → rem' },
                  { value: 'px-to-em', label: 'px → em' }
                ]}
              />
            </div>
          </div>

          {/* Toggle Options */}
          <div className="flex flex-wrap gap-4 mt-4">
            <Toggle
              pressed={options.minify}
              onPressedChange={(pressed) => handleOptionChange('minify', pressed)}
            >
              Minify Output
            </Toggle>
            <Toggle
              pressed={options.vendorPrefixing}
              onPressedChange={(pressed) => handleOptionChange('vendorPrefixing', pressed)}
            >
              Add Vendor Prefixes
            </Toggle>
            <Toggle
              pressed={showLineNumbers}
              onPressedChange={setShowLineNumbers}
            >
              Show Line Numbers
            </Toggle>
            <Toggle
              pressed={showDiff}
              onPressedChange={setShowDiff}
            >
              Show Diff View
            </Toggle>
          </div>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <input
            ref={fileInputRef}
            type="file"
            accept=".css"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            📁 Upload CSS File
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Input CSS</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={clearAll}>
                  Clear
                </Button>
              </div>
            </div>
            {showLineNumbers ? (
              <CodeEditor
                value={input}
                onChange={setInput}
                placeholder="Paste your CSS code here..."
                rows={12}
                showLineNumbers={true}
              />
            ) : (
              <TextareaInput
                value={input}
                onChange={setInput}
                placeholder="Paste your CSS code here..."
                rows={12}
              />
            )}
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
                    filename="formatted.css"
                    mimeType="text/css"
                  />
                </div>
              )}
            </div>
            {showLineNumbers ? (
              <CodeEditor
                value={output}
                onChange={() => {}}
                placeholder="Formatted CSS will appear here..."
                rows={12}
                showLineNumbers={true}
                readOnly={true}
              />
            ) : (
              <TextareaOutput
                value={output}
                placeholder="Formatted CSS will appear here..."
                rows={12}
              />
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mt-6">
          <Button onClick={formatCss}>
            Format CSS
          </Button>
        </div>

        {/* Diff View */}
        {showDiff && output && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Before / After Comparison</h3>
            <DiffViewer before={input} after={output} />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">
              <strong>CSS Validation Error:</strong> {error}
            </p>
            <p className="text-destructive text-xs mt-2">
              Please check your CSS syntax. Common issues include unclosed braces, unmatched quotes, or invalid comment syntax.
            </p>
          </div>
        )}

        {/* Enhanced Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">🎨 Color Conversion</h3>
            <p className="text-sm text-muted-foreground">
              Convert between HEX, RGB, and HSL color formats
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">📏 Unit Optimization</h3>
            <p className="text-sm text-muted-foreground">
              Convert px values to rem/em for responsive design
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">🏷️ Vendor Prefixing</h3>
            <p className="text-sm text-muted-foreground">
              Automatically add browser-specific prefixes
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">📊 Property Sorting</h3>
            <p className="text-sm text-muted-foreground">
              Organize properties alphabetically or by type
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
