'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { CodeEditor } from '@/components/ui/CodeEditor'
import { CopyButton } from '@/components/ui/CopyButton'
import { Download } from '@/components/ui/Download'
import { Button } from '@/components/ui/Button'
import { 
  formatSql, 
  analyzeSql, 
  validateSql, 
  detectSqlDialect, 
  convertJsonToInsert, 
  convertCsvToInsert,
  type SqlDialect,
  type KeywordCasing,
  type IndentationType,
  type CommaStyle,
  type FormattingOptions,
  type SqlAnalysis
} from '@/utils/sqlFormatter'

export function SqlFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [analysis, setAnalysis] = useState<SqlAnalysis | null>(null)
  const [detectedDialect, setDetectedDialect] = useState<SqlDialect>('auto')
  
  // Formatting options
  const [options, setOptions] = useState<FormattingOptions>({
    dialect: 'auto',
    keywordCasing: 'UPPERCASE',
    indentation: 'spaces2',
    commaStyle: 'trailing',
    alignColumns: false,
    lineBreaks: true
  })
  
  // Auto-completion state
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [cursorPosition, setCursorPosition] = useState(0)

  // SQL keywords for auto-completion
  const sqlKeywords = [
    'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'IS', 'NULL',
    'ORDER', 'BY', 'ASC', 'DESC', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'TOP', 'DISTINCT',
    'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'ON', 'USING', 'CROSS', 'UNION',
    'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'ALTER', 'DROP',
    'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'UNIQUE', 'CHECK', 'DEFAULT', 'AUTO_INCREMENT',
    'INT', 'VARCHAR', 'TEXT', 'DATETIME', 'TIMESTAMP', 'BOOLEAN', 'FLOAT', 'DOUBLE', 'DECIMAL',
    'CHAR', 'DATE', 'TIME', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'EXISTS', 'CAST', 'AS'
  ]

  // Detect dialect when input changes
  useEffect(() => {
    if (input.trim()) {
      const dialect = detectSqlDialect(input)
      setDetectedDialect(dialect)
    }
  }, [input])

  // Format SQL with current options
  const formatSqlCode = useCallback(() => {
    try {
      if (!input.trim()) {
        setErrors(['Please enter SQL content to format'])
        return
      }

      // Validate SQL
      const validationErrors = validateSql(input)
      if (validationErrors.length > 0) {
        setErrors(validationErrors)
        return
      }

      // Format SQL
      const formatted = formatSql(input, options)
      setOutput(formatted)
      
      // Analyze SQL
      const sqlAnalysis = analyzeSql(input)
      setAnalysis(sqlAnalysis)
      
      setErrors([])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error formatting SQL'
      setErrors([errorMessage])
      setOutput('')
    }
  }, [input, options])

  // Real-time formatting as user types
  useEffect(() => {
    const timer = setTimeout(() => {
      if (input.trim()) {
        formatSqlCode()
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }, [input, formatSqlCode])

  // Auto-completion logic
  const getAutoCompletionSuggestions = useCallback((text: string, position: number) => {
    const beforeCursor = text.substring(0, position)
    const words = beforeCursor.split(/\s+/)
    const currentWord = words[words.length - 1].toUpperCase()
    
    if (currentWord.length < 2) return []
    
    return sqlKeywords.filter(keyword => 
      keyword.startsWith(currentWord) && 
      !beforeCursor.toUpperCase().includes(keyword)
    ).slice(0, 8)
  }, [])

  // Handle input change with auto-completion
  const handleInputChange = useCallback((value: string) => {
    setInput(value)
    
    // Get suggestions for auto-completion
    const newSuggestions = getAutoCompletionSuggestions(value, cursorPosition)
    setSuggestions(newSuggestions)
    setShowSuggestions(newSuggestions.length > 0)
  }, [cursorPosition, getAutoCompletionSuggestions])

  // Handle cursor position change
  const handleCursorChange = useCallback((position: number) => {
    setCursorPosition(position)
    const newSuggestions = getAutoCompletionSuggestions(input, position)
    setSuggestions(newSuggestions)
    setShowSuggestions(newSuggestions.length > 0)
  }, [input, getAutoCompletionSuggestions])

  // Apply suggestion
  const applySuggestion = useCallback((suggestion: string) => {
    const beforeCursor = input.substring(0, cursorPosition)
    const afterCursor = input.substring(cursorPosition)
    const words = beforeCursor.split(/\s+/)
    words[words.length - 1] = suggestion + ' '
    
    const newInput = words.join(' ') + afterCursor
    setInput(newInput)
    setShowSuggestions(false)
    setCursorPosition(words.join(' ').length)
  }, [input, cursorPosition])

  // Clear all
  const clearAll = () => {
    setInput('')
    setOutput('')
    setErrors([])
    setAnalysis(null)
    setShowSuggestions(false)
  }

  // Convert JSON to INSERT statements
  const convertFromJson = () => {
    try {
      const tableName = prompt('Enter table name for INSERT statements:', 'table_name')
      if (!tableName) return
      
      const result = convertJsonToInsert(input, tableName)
      setInput(result)
    } catch (err) {
      setErrors(['Error converting JSON to SQL'])
    }
  }

  // Convert CSV to INSERT statements
  const convertFromCsv = () => {
    try {
      const tableName = prompt('Enter table name for INSERT statements:', 'table_name')
      if (!tableName) return
      
      const result = convertCsvToInsert(input, tableName)
      setInput(result)
    } catch (err) {
      setErrors(['Error converting CSV to SQL'])
    }
  }

  // Syntax highlighting styles
  const getSyntaxHighlighting = useCallback((text: string) => {
    // This would be implemented with a proper syntax highlighting library
    // For now, return the text as-is
    return text
  }, [])

  return (
    <div className="container py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Advanced SQL Formatter</h1>
          <p className="text-muted-foreground">
            Format SQL queries with multiple dialects, real-time highlighting, auto-completion, and comprehensive analysis.
          </p>
        </div>

        {/* Formatting Options */}
        <div className="mb-6 p-4 border rounded-lg bg-muted/30">
          <h3 className="font-semibold mb-4">Formatting Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* SQL Dialect */}
            <div>
              <label className="block text-sm font-medium mb-2">SQL Dialect</label>
              <select 
                value={options.dialect}
                onChange={(e) => setOptions({...options, dialect: e.target.value as SqlDialect})}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="auto">Auto Detect</option>
                <option value="mysql">MySQL</option>
                <option value="postgresql">PostgreSQL</option>
                <option value="sqlserver">SQL Server</option>
                <option value="oracle">Oracle</option>
                <option value="sqlite">SQLite</option>
              </select>
              {detectedDialect !== 'auto' && (
                <p className="text-xs text-muted-foreground mt-1">
                  Detected: {detectedDialect}
                </p>
              )}
            </div>

            {/* Keyword Casing */}
            <div>
              <label className="block text-sm font-medium mb-2">Keyword Casing</label>
              <select 
                value={options.keywordCasing}
                onChange={(e) => setOptions({...options, keywordCasing: e.target.value as KeywordCasing})}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="UPPERCASE">UPPERCASE</option>
                <option value="lowercase">lowercase</option>
                <option value="TitleCase">Title Case</option>
              </select>
            </div>

            {/* Indentation */}
            <div>
              <label className="block text-sm font-medium mb-2">Indentation</label>
              <select 
                value={options.indentation}
                onChange={(e) => setOptions({...options, indentation: e.target.value as IndentationType})}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="spaces2">2 Spaces</option>
                <option value="spaces4">4 Spaces</option>
                <option value="tabs">Tabs</option>
              </select>
            </div>

            {/* Comma Style */}
            <div>
              <label className="block text-sm font-medium mb-2">Comma Style</label>
              <select 
                value={options.commaStyle}
                onChange={(e) => setOptions({...options, commaStyle: e.target.value as CommaStyle})}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="trailing">Trailing</option>
                <option value="leading">Leading</option>
              </select>
            </div>

            {/* Additional Options */}
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.alignColumns}
                  onChange={(e) => setOptions({...options, alignColumns: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm">Align Columns</span>
              </label>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.lineBreaks}
                  onChange={(e) => setOptions({...options, lineBreaks: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm">Line Breaks</span>
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Input SQL</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={convertFromJson}>
                  JSON → SQL
                </Button>
                <Button variant="outline" size="sm" onClick={convertFromCsv}>
                  CSV → SQL
                </Button>
                <Button variant="outline" onClick={clearAll}>
                  Clear
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <CodeEditor
                value={input}
                onChange={handleInputChange}
                placeholder="Paste your SQL query here..."
                rows={12}
                showLineNumbers={true}
              />
              
              {/* Auto-completion suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-background border border-t-0 rounded-b-md shadow-lg z-10">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => applySuggestion(suggestion)}
                      className="block w-full text-left px-3 py-2 hover:bg-muted text-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
                    filename="formatted.sql"
                    mimeType="text/sql"
                  />
                </div>
              )}
            </div>
            <CodeEditor
              value={output}
              onChange={() => {}}
              placeholder="Formatted SQL will appear here..."
              rows={12}
              readOnly={true}
              showLineNumbers={true}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mt-6">
          <Button onClick={formatSqlCode}>
            Format SQL
          </Button>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm font-semibold mb-2">
              SQL Validation Errors:
            </p>
            <ul className="text-destructive text-sm space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* SQL Analysis */}
        {analysis && (
          <div className="mt-6 p-4 border rounded-lg bg-muted/30">
            <h3 className="font-semibold mb-4">Query Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium">Lines</p>
                <p className="text-2xl font-bold">{analysis.lineCount}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Statements</p>
                <p className="text-2xl font-bold">{analysis.statementCount}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Complexity Score</p>
                <p className="text-2xl font-bold">{analysis.complexityScore}</p>
              </div>
              <div>
                <p className="text-sm font-medium">JOIN Depth</p>
                <p className="text-2xl font-bold">{analysis.joinDepth}</p>
              </div>
            </div>

            {/* Tables and Columns */}
            {(analysis.tables.length > 0 || analysis.columns.length > 0) && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.tables.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Tables Found:</p>
                    <div className="flex flex-wrap gap-1">
                      {analysis.tables.map((table, index) => (
                        <span key={index} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                          {table}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {analysis.columns.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Columns Found:</p>
                    <div className="flex flex-wrap gap-1">
                      {analysis.columns.slice(0, 10).map((column, index) => (
                        <span key={index} className="px-2 py-1 bg-secondary/10 text-secondary text-xs rounded">
                          {column}
                        </span>
                      ))}
                      {analysis.columns.length > 10 && (
                        <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                          +{analysis.columns.length - 10} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Performance Hints */}
            {analysis.performanceHints.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Performance Hints:</p>
                <ul className="text-sm space-y-1">
                  {analysis.performanceHints.map((hint, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-yellow-500 mr-2">⚠️</span>
                      {hint}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Multi-Dialect Support</h3>
            <p className="text-sm text-muted-foreground">
              Auto-detect and format SQL for MySQL, PostgreSQL, SQL Server, Oracle, and SQLite
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Real-time Formatting</h3>
            <p className="text-sm text-muted-foreground">
              See formatted SQL as you type with instant validation and error highlighting
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Auto-completion</h3>
            <p className="text-sm text-muted-foreground">
              Smart SQL keyword suggestions as you type for faster query writing
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Query Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Analyze complexity, extract tables/columns, and get performance hints
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Data Conversion</h3>
            <p className="text-sm text-muted-foreground">
              Convert JSON/CSV data to SQL INSERT statements automatically
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Custom Formatting</h3>
            <p className="text-sm text-muted-foreground">
              Control keyword casing, indentation, comma style, and alignment
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}