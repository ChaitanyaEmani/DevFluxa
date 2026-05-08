export type SqlDialect = 'mysql' | 'postgresql' | 'sqlserver' | 'oracle' | 'sqlite' | 'auto'
export type KeywordCasing = 'UPPERCASE' | 'lowercase' | 'TitleCase'
export type IndentationType = 'spaces2' | 'spaces4' | 'tabs'
export type CommaStyle = 'leading' | 'trailing'

export interface FormattingOptions {
  dialect: SqlDialect
  keywordCasing: KeywordCasing
  indentation: IndentationType
  commaStyle: CommaStyle
  alignColumns: boolean
  lineBreaks: boolean
}

export interface SqlAnalysis {
  lineCount: number
  statementCount: number
  complexityScore: number
  joinDepth: number
  subqueryLevels: number
  tables: string[]
  columns: string[]
  errors: string[]
  warnings: string[]
  performanceHints: string[]
}

export interface SqlToken {
  type: 'keyword' | 'string' | 'number' | 'comment' | 'operator' | 'identifier' | 'whitespace' | 'punctuation'
  value: string
  position: number
}

const SQL_KEYWORDS = {
  common: [
    'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'IS', 'NULL',
    'ORDER', 'BY', 'ASC', 'DESC', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'TOP', 'DISTINCT',
    'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'ON', 'USING', 'CROSS', 'UNION',
    'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'ALTER', 'DROP',
    'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'UNIQUE', 'CHECK', 'DEFAULT', 'AUTO_INCREMENT',
    'INT', 'VARCHAR', 'TEXT', 'DATETIME', 'TIMESTAMP', 'BOOLEAN', 'FLOAT', 'DOUBLE', 'DECIMAL',
    'CHAR', 'DATE', 'TIME', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'EXISTS', 'CAST', 'AS'
  ],
  mysql: [
    'AUTO_INCREMENT', 'ENGINE', 'CHARSET', 'COLLATE', 'TINYINT', 'SMALLINT', 'MEDIUMINT', 'BIGINT',
    'ENUM', 'SET', 'BLOB', 'TINYBLOB', 'MEDIUMBLOB', 'LONGBLOB', 'JSON', 'INDEX', 'KEY_BLOCK_SIZE',
    'SHOW', 'DATABASES', 'TABLES', 'COLUMNS', 'DESCRIBE', 'EXPLAIN', 'PROCEDURE', 'FUNCTION',
    'TRIGGER', 'EVENT', 'PARTITION', 'CONCAT', 'SUBSTRING', 'NOW', 'CURDATE', 'CURTIME'
  ],
  postgresql: [
    'SERIAL', 'BIGSERIAL', 'SMALLSERIAL', 'BYTEA', 'UUID', 'INET', 'CIDR', 'MACADDR', 'POINT',
    'LINE', 'BOX', 'PATH', 'POLYGON', 'CIRCLE', 'ARRAY', 'JSONB', 'HSTORE', 'RANGE', 'TSVECTOR',
    'TSQUERY', 'MONEY', 'INTERVAL', 'RECORD', 'VOID', 'REFCURSOR', 'OID', 'REGCLASS', 'REGPROC',
    'REGOPERATOR', 'REGPROCEDURE', 'REGTYPE', 'REGCONFIG', 'REGDICTIONARY', 'ILIKE', 'SIMILAR',
    'ANY', 'SOME', 'ALL', 'ROW', 'ROW_NUMBER', 'RANK', 'DENSE_RANK', 'LAG', 'LEAD'
  ],
  sqlserver: [
    'NVARCHAR', 'NCHAR', 'NTEXT', 'UNIQUEIDENTIFIER', 'VARBINARY', 'IMAGE', 'BIT', 'DATETIME2',
    'DATETIMEOFFSET', 'SMALLDATETIME', 'DECIMAL', 'NUMERIC', 'REAL', 'MONEY', 'SMALLMONEY',
    'PIVOT', 'UNPIVOT', 'APPLY', 'CROSS', 'OUTER', 'OVER', 'PARTITION', 'ROW_NUMBER', 'RANK',
    'DENSE_RANK', 'NTILE', 'LEAD', 'LAG', 'FIRST_VALUE', 'LAST_VALUE', 'CONVERT', 'PARSE', 'TRY_CAST',
    'TRY_CONVERT', 'TRY_PARSE', 'IIF', 'CHOOSE', 'GOTO', 'WAITFOR', 'BEGIN', 'TRAN', 'COMMIT', 'ROLLBACK'
  ],
  oracle: [
    'NUMBER', 'VARCHAR2', 'NVARCHAR2', 'CLOB', 'NCLOB', 'BLOB', 'BFILE', 'RAW', 'LONG', 'RAW',
    'INTERVAL', 'YEAR', 'MONTH', 'DAY', 'HOUR', 'MINUTE', 'SECOND', 'TIMESTAMP', 'WITH', 'TIME',
    'ZONE', 'ROWNUM', 'ROWID', 'UROWID', 'PLS_INTEGER', 'BINARY_INTEGER', 'NATURAL', 'POSITIVE',
    'SIGNTYPE', 'SIMPLE_INTEGER', 'REF', 'CURSOR', 'SYS_REFCURSOR', 'BULK', 'COLLECT', 'FORALL',
    'MERGE', 'USING', 'MATCHED', 'WHEN', 'THEN', 'UPDATE', 'INSERT', 'DELETE', 'EXCEPTION', 'RAISE'
  ],
  sqlite: [
    'INTEGER', 'REAL', 'TEXT', 'BLOB', 'NUMERIC', 'WITHOUT', 'ROWID', 'AUTOINCREMENT', 'CONFLICT',
    'ROLLBACK', 'ABORT', 'FAIL', 'IGNORE', 'REPLACE', 'STRICT', 'TEMP', 'TEMPORARY', 'MEMORY',
    'VACUUM', 'ANALYZE', 'ATTACH', 'DETACH', 'PRAGMA', 'REINDEX', 'SAVEPOINT', 'RELEASE',
    'EXPLAIN', 'QUERY', 'PLAN', 'REGEXP', 'GLOB', 'ISNULL', 'NOTNULL', 'COALESCE', 'IFNULL'
  ]
}

export function detectSqlDialect(sql: string): SqlDialect {
  const upperSql = sql.toUpperCase()
  
  // MySQL specific patterns
  if (upperSql.includes('AUTO_INCREMENT') || upperSql.includes('ENGINE=') || 
      upperSql.includes('CHARSET=') || upperSql.includes('SHOW DATABASES')) {
    return 'mysql'
  }
  
  // PostgreSQL specific patterns
  if (upperSql.includes('SERIAL') || upperSql.includes('JSONB') || 
      upperSql.includes('ILIKE') || upperSql.includes('EXCEPT') ||
      upperSql.includes('WITHIN GROUP')) {
    return 'postgresql'
  }
  
  // SQL Server specific patterns
  if (upperSql.includes('NVARCHAR') || upperSql.includes('TOP (') || 
      upperSql.includes('PIVOT') || upperSql.includes('UNPIVOT') ||
      upperSql.includes('APPLY')) {
    return 'sqlserver'
  }
  
  // Oracle specific patterns
  if (upperSql.includes('VARCHAR2') || upperSql.includes('ROWNUM') || 
      upperSql.includes('CONNECT BY') || upperSql.includes('START WITH') ||
      upperSql.includes('DUAL')) {
    return 'oracle'
  }
  
  // SQLite specific patterns
  if (upperSql.includes('WITHOUT ROWID') || upperSql.includes('AUTOINCREMENT') || 
      upperSql.includes('PRAGMA') || upperSql.includes('GLOB')) {
    return 'sqlite'
  }
  
  return 'auto'
}

export function tokenizeSql(sql: string): SqlToken[] {
  const tokens: SqlToken[] = []
  let position = 0
  let current = ''
  
  while (position < sql.length) {
    const char = sql[position]
    
    // Skip whitespace
    if (/\s/.test(char)) {
      if (current) {
        tokens.push({ type: 'identifier', value: current, position: position - current.length })
        current = ''
      }
      let whitespace = ''
      while (position < sql.length && /\s/.test(sql[position])) {
        whitespace += sql[position]
        position++
      }
      tokens.push({ type: 'whitespace', value: whitespace, position: position - whitespace.length })
      continue
    }
    
    // Strings
    if (char === "'" || char === '"') {
      if (current) {
        tokens.push({ type: 'identifier', value: current, position: position - current.length })
        current = ''
      }
      
      const quote = char
      let string = quote
      position++
      
      while (position < sql.length) {
        const currentChar = sql[position]
        string += currentChar
        position++
        
        if (currentChar === quote) {
          // Check if it's escaped
          if (position < sql.length && sql[position] === quote) {
            string += quote
            position++
          } else {
            break
          }
        }
      }
      
      tokens.push({ type: 'string', value: string, position: position - string.length })
      continue
    }
    
    // Comments
    if (char === '-' && position + 1 < sql.length && sql[position + 1] === '-') {
      if (current) {
        tokens.push({ type: 'identifier', value: current, position: position - current.length })
        current = ''
      }
      
      let comment = '--'
      position += 2
      
      while (position < sql.length && sql[position] !== '\n') {
        comment += sql[position]
        position++
      }
      
      tokens.push({ type: 'comment', value: comment, position: position - comment.length })
      continue
    }
    
    if (char === '/' && position + 1 < sql.length && sql[position + 1] === '*') {
      if (current) {
        tokens.push({ type: 'identifier', value: current, position: position - current.length })
        current = ''
      }
      
      let comment = '/*'
      position += 2
      
      while (position + 1 < sql.length && !(sql[position] === '*' && sql[position + 1] === '/')) {
        comment += sql[position]
        position++
      }
      
      if (position + 1 < sql.length) {
        comment += '*/'
        position += 2
      }
      
      tokens.push({ type: 'comment', value: comment, position: position - comment.length })
      continue
    }
    
    // Numbers
    if (/\d/.test(char)) {
      if (current) {
        tokens.push({ type: 'identifier', value: current, position: position - current.length })
        current = ''
      }
      
      let number = ''
      while (position < sql.length && (/[\d.]/.test(sql[position]) || 
             (sql[position] === 'e' && position + 1 < sql.length && /[\d+-]/.test(sql[position + 1])))) {
        number += sql[position]
        position++
      }
      
      tokens.push({ type: 'number', value: number, position: position - number.length })
      continue
    }
    
    // Operators and punctuation
    if (/[(),;=<>!+*/%&|^]/.test(char)) {
      if (current) {
        tokens.push({ type: 'identifier', value: current, position: position - current.length })
        current = ''
      }
      
      tokens.push({ type: 'operator', value: char, position })
      position++
      continue
    }
    
    current += char
    position++
  }
  
  if (current) {
    tokens.push({ type: 'identifier', value: current, position: position - current.length })
  }
  
  return tokens
}

export function formatSql(sql: string, options: FormattingOptions): string {
  const tokens = tokenizeSql(sql)
  const dialect = options.dialect === 'auto' ? detectSqlDialect(sql) : options.dialect
  const keywords = new Set([...SQL_KEYWORDS.common, ...(SQL_KEYWORDS[dialect as keyof typeof SQL_KEYWORDS] || [])])
  
  let formatted = ''
  let indentLevel = 0
  let needsIndent = true
  const indentChar = options.indentation === 'tabs' ? '\t' : ' '.repeat(options.indentation === 'spaces4' ? 4 : 2)
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    const nextToken = tokens[i + 1]
    const prevToken = tokens[i - 1]
    
    if (token.type === 'whitespace') {
      if (options.lineBreaks && needsIndent) {
        formatted += '\n' + indentChar.repeat(indentLevel)
        needsIndent = false
      }
      continue
    }
    
    if (token.type === 'comment') {
      formatted += token.value
      continue
    }
    
    const upperValue = token.value.toUpperCase()
    const isKeyword = keywords.has(upperValue)
    
    // Apply keyword casing
    let value = token.value
    if (isKeyword) {
      switch (options.keywordCasing) {
        case 'UPPERCASE':
          value = upperValue
          break
        case 'lowercase':
          value = token.value.toLowerCase()
          break
        case 'TitleCase':
          value = token.value.charAt(0).toUpperCase() + token.value.slice(1).toLowerCase()
          break
      }
    }
    
    // Handle line breaks and indentation
    if (isKeyword && ['SELECT', 'FROM', 'WHERE', 'GROUP', 'ORDER', 'HAVING', 'UNION', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP'].includes(upperValue)) {
      formatted += '\n' + indentChar.repeat(indentLevel) + value
      needsIndent = true
      indentLevel++
    } else if (isKeyword && ['JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'CROSS', 'AND', 'OR'].includes(upperValue)) {
      formatted += '\n' + indentChar.repeat(indentLevel) + value
      needsIndent = true
    } else if (token.value === '(') {
      formatted += token.value
      indentLevel++
      needsIndent = true
    } else if (token.value === ')') {
      indentLevel = Math.max(0, indentLevel - 1)
      formatted += token.value
    } else if (token.value === ';') {
      formatted += token.value
      indentLevel = 0
      needsIndent = true
    } else if (token.value === ',') {
      if (options.commaStyle === 'leading') {
        formatted += '\n' + indentChar.repeat(indentLevel) + token.value
        needsIndent = true
      } else {
        formatted += token.value
        if (options.lineBreaks && nextToken && nextToken.type !== 'whitespace') {
          formatted += ' '
        }
      }
    } else {
      if (needsIndent && token.type !== 'whitespace') {
        formatted += '\n' + indentChar.repeat(indentLevel)
        needsIndent = false
      }
      formatted += value
      if (nextToken && nextToken.type !== 'whitespace' && nextToken.type !== 'operator' && 
          nextToken.value !== ',' && nextToken.value !== ';' && nextToken.value !== ')') {
        formatted += ' '
      }
    }
  }
  
  // Clean up extra whitespace
  formatted = formatted.replace(/\n\s*\n/g, '\n').replace(/^\s+|\s+$/g, '')
  
  return formatted
}

export function analyzeSql(sql: string): SqlAnalysis {
  const tokens = tokenizeSql(sql)
  const upperSql = sql.toUpperCase()
  
  const analysis: SqlAnalysis = {
    lineCount: sql.split('\n').length,
    statementCount: (sql.match(/;/g) || []).length,
    complexityScore: 0,
    joinDepth: 0,
    subqueryLevels: 0,
    tables: [],
    columns: [],
    errors: [],
    warnings: [],
    performanceHints: []
  }
  
  // Count JOINs for complexity
  const joinMatches = upperSql.match(/\bJOIN\b/gi)
  analysis.joinDepth = joinMatches ? joinMatches.length : 0
  
  // Count subqueries (simplified)
  const subqueryMatches = upperSql.match(/\bSELECT\b.*\bFROM\b.*\bSELECT\b/gi)
  analysis.subqueryLevels = subqueryMatches ? subqueryMatches.length : 0
  
  // Extract table names (simplified regex)
  const tableRegex = /\bFROM\s+([a-zA-Z_][a-zA-Z0-9_]*)\b/gi
  let tableMatch
  while ((tableMatch = tableRegex.exec(upperSql)) !== null) {
    const tableName = sql.substring(tableMatch.index, tableMatch.index + tableMatch[0].length)
      .match(/\bFROM\s+([a-zA-Z_][a-zA-Z0-9_]*)\b/i)?.[1]
    if (tableName && !analysis.tables.includes(tableName)) {
      analysis.tables.push(tableName)
    }
  }
  
  // Extract column names (simplified)
  const columnRegex = /\bSELECT\s+([a-zA-Z_][a-zA-Z0-9_]*\s*(?:,\s*[a-zA-Z_][a-zA-Z0-9_]*)*)\s+FROM\b/gi
  const columnMatch = columnRegex.exec(upperSql)
  if (columnMatch) {
    const columnsStr = columnMatch[1]
    const columns = columnsStr.split(',').map(col => col.trim().split(' ')[0]).filter(col => col !== '*')
    analysis.columns = columns
  }
  
  // Calculate complexity score
  analysis.complexityScore = 
    analysis.joinDepth * 2 + 
    analysis.subqueryLevels * 3 + 
    (upperSql.match(/\bWHERE\b/gi) || []).length +
    (upperSql.match(/\bGROUP\s+BY\b/gi) || []).length * 2 +
    (upperSql.match(/\bORDER\s+BY\b/gi) || []).length +
    (upperSql.match(/\bHAVING\b/gi) || []).length * 2
  
  // Performance hints
  if (analysis.joinDepth > 3) {
    analysis.performanceHints.push('Consider breaking down complex joins with multiple JOINs')
  }
  
  if (!upperSql.includes('WHERE') && upperSql.includes('SELECT') && upperSql.includes('FROM')) {
    analysis.performanceHints.push('Missing WHERE clause may result in full table scan')
  }
  
  if (upperSql.includes('SELECT *')) {
    analysis.performanceHints.push('Avoid SELECT * - specify only needed columns')
  }
  
  if (analysis.subqueryLevels > 2) {
    analysis.performanceHints.push('Consider using CTEs or temporary tables for complex subqueries')
  }
  
  return analysis
}

export function validateSql(sql: string): string[] {
  const errors: string[] = []
  const tokens = tokenizeSql(sql)
  
  let parenCount = 0
  let inString = false
  let stringChar = ''
  
  for (let i = 0; i < sql.length; i++) {
    const char = sql[i]
    
    // Handle strings
    if ((char === "'" || char === '"') && !inString) {
      inString = true
      stringChar = char
    } else if (char === stringChar && inString) {
      inString = false
      stringChar = ''
    }
    
    if (!inString) {
      if (char === '(') {
        parenCount++
      } else if (char === ')') {
        parenCount--
        if (parenCount < 0) {
          errors.push(`Unexpected closing parenthesis at position ${i}`)
          parenCount = 0
        }
      }
    }
  }
  
  if (parenCount > 0) {
    errors.push(`${parenCount} unclosed parentheses`)
  }
  
  if (inString) {
    errors.push('Unclosed string literal')
  }
  
  // Check for common SQL syntax issues
  const upperSql = sql.toUpperCase()
  
  // Missing semicolons
  const statements = sql.split(';')
  for (let i = 0; i < statements.length - 1; i++) {
    if (statements[i].trim() === '') {
      errors.push('Empty statement detected')
    }
  }
  
  // Check for balanced quotes
  const singleQuotes = (sql.match(/'/g) || []).length
  const doubleQuotes = (sql.match(/"/g) || []).length
  
  if (singleQuotes % 2 !== 0) {
    errors.push('Unbalanced single quotes')
  }
  
  if (doubleQuotes % 2 !== 0) {
    errors.push('Unbalanced double quotes')
  }
  
  return errors
}

export function convertJsonToInsert(json: string, tableName: string): string {
  try {
    let data = JSON.parse(json)
    if (!Array.isArray(data)) {
      data = [data]
    }
    
    if (data.length === 0) {
      return '-- No data to convert'
    }
    
    const columns = Object.keys(data[0])
    const insertStatements = []
    
    for (const row of data) {
      const values = columns.map(col => {
        const value = row[col]
        if (value === null || value === undefined) {
          return 'NULL'
        } else if (typeof value === 'string') {
          return `'${value.replace(/'/g, "''")}'`
        } else if (typeof value === 'number') {
          return value.toString()
        } else if (typeof value === 'boolean') {
          return value ? '1' : '0'
        } else {
          return `'${JSON.stringify(value).replace(/'/g, "''")}'`
        }
      })
      
      insertStatements.push(`INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});`)
    }
    
    return insertStatements.join('\n')
  } catch (error) {
    return `-- Error converting JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
  }
}

export function convertCsvToInsert(csv: string, tableName: string): string {
  try {
    const lines = csv.trim().split('\n')
    if (lines.length < 2) {
      return '-- CSV must have at least a header and one data row'
    }
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const insertStatements = []
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
      const formattedValues = values.map(val => {
        if (val === '' || val.toLowerCase() === 'null') {
          return 'NULL'
        } else if (!isNaN(Number(val)) && val !== '') {
          return val
        } else {
          return `'${val.replace(/'/g, "''")}'`
        }
      })
      
      insertStatements.push(`INSERT INTO ${tableName} (${headers.join(', ')}) VALUES (${formattedValues.join(', ')});`)
    }
    
    return insertStatements.join('\n')
  } catch (error) {
    return `-- Error converting CSV: ${error instanceof Error ? error.message : 'Unknown error'}`
  }
}
