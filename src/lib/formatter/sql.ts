export interface SqlError {
  message: string
  line: number | null
  column: number | null
}

export function formatSQL(sql: string, indentSize: number = 2): string {
  try {
    if (!sql.trim()) return ''
    
    const indent = ' '.repeat(indentSize)
    let formatted = ''
    let indentLevel = 0
    let inString = false
    let escapeNext = false
    
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN',
      'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE',
      'ALTER', 'DROP', 'INDEX', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES',
      'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'ON', 'AS',
      'GROUP', 'BY', 'HAVING', 'ORDER', 'ASC', 'DESC', 'LIMIT', 'OFFSET',
      'UNION', 'ALL', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX',
      'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'EXISTS', 'IS', 'NULL'
    ]
    
    const upperKeywords = keywords.map(k => k.toUpperCase())
    
    for (let i = 0; i < sql.length; i++) {
      const char = sql[i]
      
      if (escapeNext) {
        formatted += char
        escapeNext = false
        continue
      }
      
      if (char === '\\') {
        formatted += char
        escapeNext = true
        continue
      }
      
      if (char === "'" || char === '"') {
        formatted += char
        inString = !inString
        continue
      }
      
      if (inString) {
        formatted += char
        continue
      }
      
      if (char === '(') {
        formatted += char + '\n' + indent.repeat(indentLevel + 1)
        indentLevel++
      } else if (char === ')') {
        indentLevel = Math.max(0, indentLevel - 1)
        formatted += '\n' + indent.repeat(indentLevel) + char
      } else if (char === ',') {
        formatted += char + '\n' + indent.repeat(indentLevel)
      } else if (char === ';') {
        formatted += char + '\n\n'
        indentLevel = 0
      } else if (/\s/.test(char)) {
        // Check if we're at a keyword boundary
        const remaining = sql.substring(i).trim()
        const isKeyword = upperKeywords.some(keyword => 
          remaining.toUpperCase().startsWith(keyword) && 
          (remaining.length === keyword.length || /\W/.test(remaining[keyword.length]))
        )
        
        if (isKeyword) {
          formatted += '\n' + indent.repeat(indentLevel)
        } else {
          formatted += ' '
        }
      } else {
        formatted += char.toUpperCase()
      }
    }
    
    return formatted.replace(/\n\s*\n/g, '\n').trim()
  } catch (error) {
    return sql // Return original if formatting fails
  }
}

export function minifySQL(sql: string): string {
  try {
    return sql
      .replace(/--.*$/gm, '') // Remove single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/\s*([,;()])\s*/g, '$1') // Remove whitespace around punctuation
      .trim()
  } catch (error) {
    return sql // Return original if minification fails
  }
}

export function getExampleSQL(): string {
  return `SELECT u.id, u.name, u.email, COUNT(o.id) as order_count, SUM(o.total) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2023-01-01'
  AND u.status = 'active'
GROUP BY u.id, u.name, u.email
HAVING COUNT(o.id) > 0
ORDER BY total_spent DESC
LIMIT 10;`
}

export function validateIndentSize(value: string): number {
  const num = Number(value)
  return Math.min(8, Math.max(1, num || 2))
}