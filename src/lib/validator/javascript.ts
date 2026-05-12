export interface ValidationError {
  message: string
  line: number | null
  column: number | null
  type: 'syntax' | 'reference' | 'type' | 'warning' | 'error'
  severity: 'error' | 'warning'
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  summary: {
    totalErrors: number
    totalWarnings: number
    syntaxErrors: number
    referenceErrors: number
    typeErrors: number
  }
}

export function validateJavaScript(code: string): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []

  // Basic syntax validation using try-catch
  try {
    // Remove comments to avoid false positives
    const codeWithoutComments = code
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')

    // Check for basic syntax errors
    new Function(codeWithoutComments)
  } catch (err: any) {
    const errorMatch = err.message?.match(/at position (\d+)/)
    const position = errorMatch ? parseInt(errorMatch[1]) : 0
    
    // Calculate line and column from position
    const lines = code.substring(0, position).split('\n')
    const line = lines.length
    const column = lines[lines.length - 1].length + 1

    errors.push({
      message: err.message || 'Syntax error',
      line,
      column,
      type: 'syntax',
      severity: 'error'
    })
  }

  // Check for common JavaScript issues
  const lines = code.split('\n')
  
  lines.forEach((line, index) => {
    const lineNumber = index + 1
    const trimmedLine = line.trim()

    // Check for undeclared variables (common patterns)
    if (trimmedLine && !trimmedLine.startsWith('//') && !trimmedLine.startsWith('*')) {
      // Check for console.log in production code
      if (trimmedLine.includes('console.log') || trimmedLine.includes('console.error')) {
        warnings.push({
          message: 'Console statement detected. Consider removing in production code.',
          line: lineNumber,
          column: trimmedLine.indexOf('console') + 1,
          type: 'warning',
          severity: 'warning'
        })
      }

      // Check for == vs ===
      if (trimmedLine.includes('==') && !trimmedLine.includes('===') && !trimmedLine.includes('!=')) {
        warnings.push({
          message: 'Consider using === instead of == for strict equality comparison.',
          line: lineNumber,
          column: trimmedLine.indexOf('==') + 1,
          type: 'warning',
          severity: 'warning'
        })
      }

      // Check for var usage (suggest let/const)
      if (trimmedLine.includes('var ')) {
        warnings.push({
          message: 'Consider using let or const instead of var for better scoping.',
          line: lineNumber,
          column: trimmedLine.indexOf('var') + 1,
          type: 'warning',
          severity: 'warning'
        })
      }

      // Check for missing semicolons (basic check)
      if (trimmedLine && 
          !trimmedLine.endsWith(';') && 
          !trimmedLine.endsWith('{') && 
          !trimmedLine.endsWith('}') &&
          !trimmedLine.startsWith('if') &&
          !trimmedLine.startsWith('for') &&
          !trimmedLine.startsWith('while') &&
          !trimmedLine.startsWith('function') &&
          !trimmedLine.includes('//') &&
          !trimmedLine.includes('/*') &&
          !trimmedLine.includes('*/')) {
        warnings.push({
          message: 'Missing semicolon at the end of statement.',
          line: lineNumber,
          column: trimmedLine.length,
          type: 'warning',
          severity: 'warning'
        })
      }

      // Check for unused variables (basic pattern)
      const varMatches = trimmedLine.match(/(?:let|const|var)\s+(\w+)/g)
      if (varMatches) {
        varMatches.forEach(match => {
          const varName = match.split(' ')[1]
          // Check if variable is used elsewhere in the code
          const varUsage = code.split('\n').slice(index + 1).join('\n').match(new RegExp(`\\b${varName}\\b`))
          if (!varUsage) {
            warnings.push({
              message: `Variable '${varName}' is declared but never used.`,
              line: lineNumber,
              column: trimmedLine.indexOf(varName) + 1,
              type: 'warning',
              severity: 'warning'
            })
          }
        })
      }
    }
  })

  // Check for unmatched brackets
  const bracketStack: string[] = []
  const bracketMap: { [key: string]: string } = {
    '(': ')',
    '[': ']',
    '{': '}'
  }

  for (let i = 0; i < code.length; i++) {
    const char = code[i]
    if (bracketMap[char]) {
      bracketStack.push(char)
    } else if (Object.values(bracketMap).includes(char)) {
      const lastOpen = bracketStack.pop()
      if (!lastOpen || bracketMap[lastOpen] !== char) {
        const line = code.substring(0, i).split('\n').length
        const column = code.substring(0, i).split('\n').pop()!.length + 1
        
        errors.push({
          message: `Unmatched closing bracket '${char}'`,
          line,
          column,
          type: 'syntax',
          severity: 'error'
        })
        break
      }
    }
  }

  if (bracketStack.length > 0) {
    bracketStack.forEach(openBracket => {
      errors.push({
        message: `Unmatched opening bracket '${openBracket}'`,
        line: null,
        column: null,
        type: 'syntax',
        severity: 'error'
      })
    })
  }

  // Check for function definitions without return statements (basic check)
  const functionMatches = code.match(/function\s+\w+\s*\([^)]*\)\s*{[^}]*}/g)
  if (functionMatches) {
    functionMatches.forEach(func => {
      if (!func.includes('return') && !func.includes('=>')) {
        warnings.push({
          message: 'Function defined but no return statement found.',
          line: null,
          column: null,
          type: 'warning',
          severity: 'warning'
        })
      }
    })
  }

  const summary = {
    totalErrors: errors.length,
    totalWarnings: warnings.length,
    syntaxErrors: errors.filter(e => e.type === 'syntax').length,
    referenceErrors: errors.filter(e => e.type === 'reference').length,
    typeErrors: errors.filter(e => e.type === 'type').length
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary
  }
}

export function getErrorTypeIcon(type: ValidationError['type']): string {
  switch (type) {
    case 'syntax': return '❌'
    case 'reference': return '🔗'
    case 'type': return '📝'
    case 'warning': return '⚠️'
    case 'error': return '🚨'
    default: return '❓'
  }
}

export function getSeverityColor(severity: ValidationError['severity']): string {
  switch (severity) {
    case 'error': return 'text-red-600 dark:text-red-400'
    case 'warning': return 'text-yellow-600 dark:text-yellow-400'
    default: return 'text-gray-600 dark:text-gray-400'
  }
}
