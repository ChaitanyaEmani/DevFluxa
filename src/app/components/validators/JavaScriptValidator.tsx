"use client"

import { useState } from "react"
import { CodeEditor } from "@/app/components/ui/CodeEditor"
import { CopyButton } from "@/app/components/ui/CopyButton"
import { Download } from "@/app/components/ui/Download"
import { Button } from "@/app/components/ui/Button"
import { Header } from "@/app/components/ui/Header"
import {
  validateJavaScript,
  getErrorTypeIcon,
  getSeverityColor,
  ValidationResult,
  ValidationError
} from "@/lib/validator/javascript"

export function JavaScriptValidator() {
  const [input, setInput] = useState('')
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const validateCode = () => {
    if (!input.trim()) {
      setValidationResult(null)
      return
    }

    setIsValidating(true)
    try {
      // Add small delay to show loading state
      setTimeout(() => {
        const result = validateJavaScript(input)
        setValidationResult(result)
        setIsValidating(false)
      }, 100)
    } catch (err) {
      setIsValidating(false)
    }
  }

  
  const clearAll = () => {
    setInput('')
    setValidationResult(null)
  }

  const loadExample = () => {
    const exampleCode = `// Example JavaScript code with some issues
function calculateSum(a, b) {
  // Missing semicolon
  const result = a + b
  return result
}

// Using == instead of ===
if (x == y) {
  console.log("Values are equal")
}

// Using var instead of let/const
var unusedVariable = "This variable is never used"

// Unmatched bracket
const obj = {
  name: "John",
  age: 30
// Missing closing brace`

    setInput(exampleCode)
  }

  const allIssues = validationResult ? [...validationResult.errors, ...validationResult.warnings] : []

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <Header 
          toolTitle="JavaScript Validator" 
          toolDescription="Validate JavaScript code for syntax errors, reference errors, and common issues. Get detailed error reports with line numbers and suggestions." 
        />

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <Button onClick={validateCode} disabled={isValidating} className="shadow-sm hover:shadow-md transition-all duration-200">
              <span className="mr-2">{isValidating ? '⏳' : '🔍'}</span>
              {isValidating ? 'Validating...' : 'Validate Code'}
            </Button>
            <Button variant="outline" onClick={loadExample} className="shadow-sm hover:shadow-md transition-all duration-200">
              <span className="mr-2">📝</span>Load Example
            </Button>
          </div>
          
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" onClick={clearAll} className="shadow-sm hover:shadow-md transition-all duration-200 text-destructive hover:bg-destructive/5">
              <span className="mr-2">🗑️</span>Clear
            </Button>
          </div>
        </div>

        {/* Validation Summary */}
        {validationResult && (
          <div className="mb-6 p-4 border-2 border-border/50 rounded-lg bg-background/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Validation Summary</h3>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                validationResult.isValid 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {validationResult.isValid ? '✅ Valid' : '❌ Invalid'}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {validationResult.summary.totalErrors}
                </div>
                <div className="text-muted-foreground">Errors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {validationResult.summary.totalWarnings}
                </div>
                <div className="text-muted-foreground">Warnings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {validationResult.summary.syntaxErrors}
                </div>
                <div className="text-muted-foreground">Syntax</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {validationResult.summary.referenceErrors}
                </div>
                <div className="text-muted-foreground">Reference</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {validationResult.summary.typeErrors}
                </div>
                <div className="text-muted-foreground">Type</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Input */}
          <div className="space-y-2">
            <h2 className="text-xl font-bold">JavaScript Code</h2>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative h-96 border-2 border-border/50 rounded-lg overflow-hidden bg-background/50 backdrop-blur-sm">
                <CodeEditor
                  value={input}
                  onChange={setInput}
                  placeholder="Paste your JavaScript code here to validate..."
                  className="h-full"
                  showLineNumbers={true}
                />
              </div>
            </div>
          </div>

          {/* Validation Results */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Validation Results</h2>
              {validationResult && (
                <div className="flex gap-2">
                  <CopyButton 
                    text={allIssues.map(issue => 
                      `${issue.severity.toUpperCase()}: ${issue.message}${issue.line ? ` (Line ${issue.line})` : ''}`
                    ).join('\n')} 
                  />
                  <Download 
                    content={allIssues.map(issue => 
                      `${issue.severity.toUpperCase()}: ${issue.message}${issue.line ? ` (Line ${issue.line})` : ''}`
                    ).join('\n')} 
                    filename="validation-results.txt" 
                    mimeType="text/plain" 
                  />
                </div>
              )}
            </div>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative h-96 border-2 border-border/50 rounded-lg bg-background/50 backdrop-blur-sm overflow-hidden">
                {isValidating && (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <div className="text-4xl mb-2">⏳</div>
                      <div>Validating code...</div>
                    </div>
                  </div>
                )}
                
                {!isValidating && !validationResult && (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🔍</div>
                      <div>Enter JavaScript code to see validation results</div>
                    </div>
                  </div>
                )}
                
                {!isValidating && validationResult && allIssues.length === 0 && (
                  <div className="h-full flex items-center justify-center text-green-600 dark:text-green-400">
                    <div className="text-center">
                      <div className="text-4xl mb-2">✅</div>
                      <div className="font-semibold">No issues found!</div>
                      <div className="text-sm">Your JavaScript code looks good.</div>
                    </div>
                  </div>
                )}
                
                {!isValidating && validationResult && allIssues.length > 0 && (
                  <div className="h-full overflow-y-auto p-4">
                    <div className="space-y-3">
                      {allIssues.map((issue, index) => (
                        <div 
                          key={index}
                          className={`p-3 rounded-lg border-l-4 ${
                            issue.severity === 'error' 
                              ? 'bg-red-50 dark:bg-red-950 border-red-500' 
                              : 'bg-yellow-50 dark:bg-yellow-950 border-yellow-500'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-lg">{getErrorTypeIcon(issue.type)}</span>
                            <div className="flex-1">
                              <div className={`font-medium ${getSeverityColor(issue.severity)}`}>
                                {issue.severity === 'error' ? 'Error' : 'Warning'}
                              </div>
                              <div className="text-sm mt-1">{issue.message}</div>
                              {issue.line && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Line {issue.line}{issue.column ? `, Column ${issue.column}` : ''}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Validation Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Syntax Validation', desc: 'Detects syntax errors, unmatched brackets, and structural issues.', icon: '🔤' },
              { title: 'Best Practices', desc: 'Identifies common JavaScript anti-patterns and suggests improvements.', icon: '✨' },
              { title: 'Reference Checking', desc: 'Finds undeclared variables and unused variable declarations.', icon: '🔗' },
              { title: 'Code Quality', desc: 'Checks for proper semicolon usage and equality operators.', icon: '📏' },
              { title: 'Real-time Validation', desc: 'Automatically validates code as you type with debounced updates.', icon: '⚡' },
              { title: 'Detailed Reports', desc: 'Provides line numbers, column positions, and actionable error messages.', icon: '📊' },
            ].map(({ title, desc, icon }) => (
              <div key={title} className="group relative p-6 border-2 border-border/50 rounded-lg bg-background/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="text-3xl mb-3">{icon}</div>
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
