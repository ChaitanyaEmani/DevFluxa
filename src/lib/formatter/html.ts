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

export const SELF_CLOSING_TAGS = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']

export const isSelfClosingTag = (tag: string): boolean => {
  const tagName = tag.replace(/<\/?([^\s>]+).*/, '$1').toLowerCase()
  return SELF_CLOSING_TAGS.includes(tagName) || tag.endsWith('/>')
}

export const formatHTML = (html: string, options: FormattingOptions): string => {
  if (!html.trim()) return ''

  let processed = html

  let doctype = ''
  if (options.preserveDoctype) {
    const doctypeMatch = html.match(/<!DOCTYPE[^>]*>/i)
    if (doctypeMatch) {
      doctype = doctypeMatch[0] + '\n'
      processed = processed.replace(doctypeMatch[0], '')
    }
  }

  if (options.removeComments) {
    processed = processed.replace(/<!--[\s\S]*?-->/g, '')
  }

  const indentChar = options.indentType === 'tabs' ? '\t' : ' '.repeat(options.indentSize)

  if (options.tagCase === 'uppercase') {
    processed = processed.replace(/<\s*\/?\s*([a-zA-Z][a-zA-Z0-9]*)/g, (match, tag) => match.replace(tag, tag.toUpperCase()))
  } else {
    processed = processed.replace(/<\s*\/?\s*([a-zA-Z][a-zA-Z0-9]*)/g, (match, tag) => match.replace(tag, tag.toLowerCase()))
  }

  if (options.quoteStyle === 'single') {
    processed = processed.replace(/="([^"]*)"/g, "='$1'")
  } else {
    processed = processed.replace(/='([^']*)'/g, '="$1"')
  }

  if (options.selfClosingStyle === 'xhtml') {
    SELF_CLOSING_TAGS.forEach(tag => {
      const regex = new RegExp(`<${tag}([^>]*)(?<!/)>`, 'gi')
      processed = processed.replace(regex, `<${tag}$1 />`)
    })
  }

  const tokens = processed.match(/<[^>]+>|[^<]+/g) || []
  const lines: string[] = []
  let currentLine = ''
  let indentLevel = 0

  const blockTags = ['html', 'head', 'body', 'div', 'section', 'article', 'aside', 'nav', 'main', 'header', 'footer', 'form', 'fieldset', 'legend', 'table', 'tbody', 'thead', 'tfoot', 'tr', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote', 'pre', 'address', 'figure', 'figcaption', 'iframe', 'video', 'audio', 'canvas', 'svg', 'script', 'style', 'title', 'meta', 'link']

  for (const token of tokens) {
    const trimmedToken = token.trim()
    if (!trimmedToken) continue

    if (trimmedToken.startsWith('<')) {
      const isClosingTag = trimmedToken.startsWith('</')
      const isSelfClosing = trimmedToken.endsWith('/>') || isSelfClosingTag(trimmedToken)
      const tagName = trimmedToken.replace(/<\/?([^\s>]+).*/, '$1').toLowerCase()

      if (blockTags.includes(tagName)) {
        if (currentLine.trim()) {
          lines.push(indentChar.repeat(indentLevel) + currentLine.trim())
          currentLine = ''
        }

        if (isClosingTag) {
          indentLevel = Math.max(0, indentLevel - 1)
          lines.push(indentChar.repeat(indentLevel) + trimmedToken)
        } else {
          lines.push(indentChar.repeat(indentLevel) + trimmedToken)
          if (!isSelfClosing) indentLevel++
        }
      } else {
        currentLine += trimmedToken
      }
    } else {
      currentLine += trimmedToken
    }
  }

  if (currentLine.trim()) {
    lines.push(indentChar.repeat(indentLevel) + currentLine.trim())
  }

  let formatted = lines.join('\n')

  if (options.wrapLines && options.wrapColumn > 0) {
    formatted = formatted.split('\n').map(line => {
      if (line.length <= options.wrapColumn) return line
      return line.match(new RegExp(`.{1,${options.wrapColumn}}`, 'g'))?.join('\n') || line
    }).join('\n')
  }

  return doctype + formatted
}

export const minifyHTML = (html: string): string => {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .replace(/\s+>/g, '>')
    .replace(/<\s+/g, '<')
    .trim()
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
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setInput(content)
    }
    reader.readAsText(file)
  }
}

export const fetchFromURL = async (urlInput: string, setInput: (content: string) => void, setUrlInput: (value: string) => void) => {
  const response = await fetch(urlInput)
  if (!response.ok) throw new Error('Failed to fetch URL')
  const html = await response.text()
  setInput(html)
  setUrlInput('')
}

export const clearAll = (setInput: (value: string) => void, setOutput: (value: string) => void) => {
  setInput('')
  setOutput('')
}

// Auto-close tag logic
export const getAutoCloseTag = (text: string, cursorPos: number): { closeTag: string; offset: number } | null => {
  const textUpToCursor = text.slice(0, cursorPos)
  // Match the most recently typed opening tag
  const match = textUpToCursor.match(/<([a-zA-Z][a-zA-Z0-9]*)([^>]*)>$/)
  if (!match) return null
  const tagName = match[1].toLowerCase()
  if (SELF_CLOSING_TAGS.includes(tagName)) return null
  return { closeTag: `</${tagName}>`, offset: 0 }
}

// Tag validation / linting
export interface LintError {
  line: number
  message: string
  type: 'error' | 'warning'
}

export const lintHTML = (html: string): LintError[] => {
  const errors: LintError[] = []
  const lines = html.split('\n')
  const stack: { tag: string; line: number }[] = []
  const tokenRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g

  lines.forEach((line, lineIndex) => {
    let match
    tokenRegex.lastIndex = 0
    while ((match = tokenRegex.exec(line)) !== null) {
      const full = match[0]
      const tagName = match[1].toLowerCase()
      const isClosing = full.startsWith('</')
      const isSelfClose = full.endsWith('/>') || SELF_CLOSING_TAGS.includes(tagName)

      if (isSelfClose || SELF_CLOSING_TAGS.includes(tagName)) continue

      if (isClosing) {
        if (stack.length === 0) {
          errors.push({ line: lineIndex + 1, message: `Unexpected closing tag </${tagName}>`, type: 'error' })
        } else if (stack[stack.length - 1].tag !== tagName) {
          errors.push({ line: lineIndex + 1, message: `Mismatched tag: expected </${stack[stack.length - 1].tag}>, got </${tagName}>`, type: 'error' })
          stack.pop()
        } else {
          stack.pop()
        }
      } else {
        stack.push({ tag: tagName, line: lineIndex + 1 })
      }
    }
  })

  stack.forEach(({ tag, line }) => {
    errors.push({ line, message: `Unclosed tag <${tag}>`, type: 'error' })
  })

  return errors
}