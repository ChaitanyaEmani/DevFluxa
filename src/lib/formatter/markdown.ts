export interface MarkdownError {
  message: string
  line: number | null
  column: number | null
}

export interface MarkdownFormatOptions {
  lineLength?: number
  bulletStyle?: '-' | '*' | '+'
  headerStyle?: '#' | 'underline'
}

export function formatMarkdown(markdown: string, options: MarkdownFormatOptions = {}): string {
  const {
    lineLength = 80,
    bulletStyle = '-',
    headerStyle = '#'
  } = options

  try {
    if (!markdown.trim()) return ''
    
    const lines = markdown.split('\n')
    let formatted = []
    let inCodeBlock = false
    let inList = false
    let currentListIndent = 0
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i]
      const trimmed = line.trim()
      
      // Handle code blocks
      if (trimmed.startsWith('```')) {
        inCodeBlock = !inCodeBlock
        formatted.push(line)
        continue
      }
      
      if (inCodeBlock) {
        formatted.push(line)
        continue
      }
      
      // Handle headers
      if (trimmed.startsWith('#')) {
        inList = false
        // Normalize header spacing
        line = line.replace(/^(#{1,6})\s*/, '$1 ')
        formatted.push(line)
        continue
      }
      
      // Handle horizontal rules
      if (trimmed.match(/^[-*_]{3,}$/)) {
        inList = false
        formatted.push('---')
        continue
      }
      
      // Handle lists
      if (trimmed.match(/^[-*+]\s+/) || trimmed.match(/^\d+\.\s+/)) {
        inList = true
        // Normalize bullet points
        if (!trimmed.match(/^\d+\.\s+/)) {
          line = line.replace(/^[-*+]\s+/, `${bulletStyle} `)
        }
        formatted.push(line)
        continue
      }
      
      // Handle blockquotes
      if (trimmed.startsWith('>')) {
        inList = false
        // Normalize blockquote spacing
        line = line.replace(/^>\s*/, '> ')
        formatted.push(line)
        continue
      }
      
      // Handle empty lines
      if (!trimmed) {
        formatted.push('')
        continue
      }
      
      // Regular text - wrap long lines
      if (lineLength > 0 && line.length > lineLength) {
        const words = line.split(' ')
        let currentLine = ''
        
        for (const word of words) {
          if ((currentLine + ' ' + word).length <= lineLength) {
            currentLine = currentLine ? currentLine + ' ' + word : word
          } else {
            formatted.push(currentLine)
            currentLine = word
          }
        }
        
        if (currentLine) {
          formatted.push(currentLine)
        }
      } else {
        formatted.push(line)
      }
    }
    
    // Add proper spacing between sections
    let result = []
    for (let i = 0; i < formatted.length; i++) {
      const line = formatted[i]
      const nextLine = formatted[i + 1]
      
      result.push(line)
      
      // Add extra blank line before headers
      if (nextLine && nextLine.trim().startsWith('#') && line.trim() !== '') {
        result.push('')
      }
      
      // Add extra blank line after headers
      if (line.trim().startsWith('#') && nextLine && nextLine.trim() !== '' && !nextLine.trim().startsWith('#')) {
        result.push('')
      }
      
      // Add spacing around code blocks
      if (line.trim().startsWith('```') && i > 0 && !formatted[i - 1].trim().startsWith('```')) {
        result.splice(result.length - 1, 0, '')
      }
    }
    
    return result.join('\n').replace(/\n{3,}/g, '\n\n').trim()
  } catch (error) {
    return markdown // Return original if formatting fails
  }
}

export function minifyMarkdown(markdown: string): string {
  try {
    return markdown
      .replace(/\n{3,}/g, '\n\n') // Collapse multiple newlines
      .replace(/[ \t]+$/gm, '') // Remove trailing whitespace
      .trim()
  } catch (error) {
    return markdown // Return original if minification fails
  }
}

export function getExampleMarkdown(): string {
  return `# Markdown Formatting Example

This is a sample Markdown document to demonstrate formatting capabilities.

## Features
Here are some key features:

*   Bullet point one
*   Bullet point two
*   Bullet point three

1. Numbered list item one
2. Numbered list item two
3. Numbered list item three

## Code Examples
Inline code: \`console.log('Hello, World!')\`

\`\`\`javascript
function greet(name) {
    return \`Hello, \${name}!\`;
}
\`\`\`

## Blockquotes
> This is a blockquote.
> It can span multiple lines.
> And provide proper formatting.

## Links and Images
Visit [GitHub](https://github.com)

---

Horizontal rule above this line.`
}