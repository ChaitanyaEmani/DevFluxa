export interface JsError {
  message: string
  line: number | null
  column: number | null
}

export function formatJavaScript(code: string, indentSize: number = 2): string {
  try {
    // Basic JavaScript formatting - this is a simplified implementation
    // In a real app, you'd want to use a proper JS formatter like prettier
    const lines = code.split('\n')
    let formatted = ''
    let indentLevel = 0
    const indent = ' '.repeat(indentSize)
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      if (!line) {
        formatted += '\n'
        continue
      }
      
      // Decrease indent for closing braces
      if (line.startsWith('}') || line.startsWith(']') || line.startsWith(')')) {
        indentLevel = Math.max(0, indentLevel - 1)
      }
      
      // Add current line with proper indentation
      formatted += indent.repeat(indentLevel) + line + '\n'
      
      // Increase indent for opening braces
      if (line.endsWith('{') || line.endsWith('[') || line.endsWith('(')) {
        indentLevel++
      }
    }
    
    return formatted.trim()
  } catch (error) {
    return code // Return original if formatting fails
  }
}

export function minifyJavaScript(code: string): string {
  try {
    // Basic minification - remove comments and extra whitespace
    return code
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
      .replace(/\/\/.*$/gm, '') // Remove line comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/;\s*}/g, '}') // Remove unnecessary semicolons before braces
      .replace(/\s*([{}();,])\s*/g, '$1') // Remove whitespace around operators
      .trim()
  } catch (error) {
    return code // Return original if minification fails
  }
}

export function validateIndentSize(value: string): number {
  const num = Number(value)
  return Math.min(8, Math.max(1, num || 2))
}