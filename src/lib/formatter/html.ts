export interface FormattingOptions {
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

export interface TextStats {
  characters: number
  words: number
  lines: number
}

export const isSelfClosingTag = (tag: string): boolean => {
  const selfClosingTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']
  const tagName = tag.replace(/<\/?([^\s>]+).*/, '$1').toLowerCase()
  return selfClosingTags.includes(tagName) || tag.endsWith('/>')
}

export const formatHTML = (html: string, options: FormattingOptions): string => {
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

export const getTextStats = (text: string): TextStats => ({
  characters: text.length,
  words: text.split(/\s+/).filter(word => word.length > 0).length,
  lines: text.split('\n').length
})

export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, setInput: (content: string) => void) => {
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

export const fetchFromURL = async (urlInput: string, setInput: (content: string) => void, setUrlInput: (value: string) => void) => {
  try {
    const response = await fetch(urlInput)
    if (!response.ok) throw new Error('Failed to fetch URL')
    const html = await response.text()
    setInput(html)
    setUrlInput('')
  } catch (err) {
    console.error('Failed to fetch URL:', err)
  }
}

export const clearAll = (setInput: (value: string) => void, setOutput: (value: string) => void) => {
  setInput('')
  setOutput('')
}