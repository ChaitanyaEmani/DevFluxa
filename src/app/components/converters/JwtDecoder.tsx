"use client"

import { useState } from "react"
import { CodeEditor } from "@/app/components/ui/CodeEditor"
import { CopyButton } from "@/app/components/ui/CopyButton"
import { Button } from "@/app/components/ui/Button"
import { Header } from "@/app/components/ui/Header"
import { JwtData, decodeJWT, formatTimestamp, isTokenExpired, getTokenTimeLeft } from "@/lib/converters/jwt"


export function JwtDecoder() {
  const [input, setInput] = useState('')
  const [decoded, setDecoded] = useState<JwtData | null>(null)

  const decodeToken = () => {
    if (!input.trim()) {
      setDecoded(null)
      return
    }
    
    const result = decodeJWT(input.trim())
    setDecoded(result)
  }

  const clearAll = () => {
    setInput('')
    setDecoded(null)
  }

  const loadExample = () => {
    const example = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTYyMzkwMjJ9.4Adcj3UFYzPUVaVF43FmMab6RlaQD8A9V8wFzzht-KQ'
    setInput(example)
  }

  const formatValue = (value: any): string => {
    if (value === null) return 'null'
    if (value === undefined) return 'undefined'
    if (typeof value === 'string') return value
    if (typeof value === 'number') return value.toString()
    if (typeof value === 'boolean') return value.toString()
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value, null, 2)
      } catch {
        return '[Object]'
      }
    }
    return String(value)
  }

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <Header 
          toolTitle="JWT Decoder" 
          toolDescription="Decode JSON Web Tokens (JWT) to view header, payload, and signature information." 
        />

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <Button onClick={decodeToken} className="shadow-sm hover:shadow-md transition-all duration-200">
              <span className="mr-2">🔓</span>Decode JWT
            </Button>
            <Button variant="outline" onClick={loadExample} className="shadow-sm hover:shadow-md transition-all duration-200">
              <span className="mr-2">📝</span>Load Example
            </Button>
          </div>
          
          <Button variant="outline" onClick={clearAll} className="ml-auto shadow-sm hover:shadow-md transition-all duration-200 text-destructive hover:bg-destructive/5">
            <span className="mr-2">🗑️</span>Clear
          </Button>
        </div>

        <div className="space-y-6">
          {/* Input */}
          <div className="space-y-2">
            <h2 className="text-xl font-bold">JWT Token</h2>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative h-32 border-2 border-border/50 rounded-lg overflow-hidden bg-background/50 backdrop-blur-sm">
                <CodeEditor
                  value={input}
                  onChange={setInput}
                  placeholder="Paste your JWT token here..."
                  className="h-full"
                  showLineNumbers={false}
                />
              </div>
            </div>
          </div>

          {/* Results */}
          {decoded && (
            <>
              {decoded.error ? (
                <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10">
                  <div className="flex items-center gap-2 text-destructive">
                    <span className="text-xl">❌</span>
                    <span className="font-semibold">Decoding Error</span>
                  </div>
                  <p className="mt-2 text-sm">{decoded.error}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Header */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Header</h3>
                      <CopyButton text={JSON.stringify(decoded.header, null, 2)} />
                    </div>
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative border-2 border-border/50 rounded-lg bg-background/50 backdrop-blur-sm overflow-hidden">
                        <div className="p-4 space-y-3 max-h-64 overflow-auto">
                          {Object.entries(decoded.header).map(([key, value]) => (
                            <div key={key} className="space-y-1">
                              <div className="font-medium text-sm text-primary">{key}</div>
                              <div className="text-sm bg-muted/50 rounded p-2 font-mono break-all">
                                {formatValue(value)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payload */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Payload</h3>
                      <CopyButton text={JSON.stringify(decoded.payload, null, 2)} />
                    </div>
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative border-2 border-border/50 rounded-lg bg-background/50 backdrop-blur-sm overflow-hidden">
                        <div className="p-4 space-y-3 max-h-64 overflow-auto">
                          {Object.entries(decoded.payload).map(([key, value]) => (
                            <div key={key} className="space-y-1">
                              <div className="font-medium text-sm text-primary">{key}</div>
                              <div className="text-sm bg-muted/50 rounded p-2 font-mono break-all">
                                {formatValue(value)}
                              </div>
                              {(key === 'iat' || key === 'exp' || key === 'nbf') && typeof value === 'number' && (
                                <div className="text-xs text-muted-foreground">
                                  {formatTimestamp(value)}
                                  {key === 'exp' && (
                                    <span className={`ml-2 font-medium ${isTokenExpired(decoded.payload) ? 'text-destructive' : 'text-green-600'}`}>
                                      {isTokenExpired(decoded.payload) ? 'Expired' : `Expires in ${getTokenTimeLeft(decoded.payload)}`}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Signature */}
              {decoded.signature && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Signature</h3>
                    <CopyButton text={decoded.signature} />
                  </div>
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative border-2 border-border/50 rounded-lg bg-background/50 backdrop-blur-sm p-4">
                      <div className="font-mono text-sm break-all">{decoded.signature}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Token Status */}
              {decoded.isValid && decoded.payload.exp && (
                <div className={`p-4 rounded-lg border ${
                  isTokenExpired(decoded.payload) 
                    ? 'bg-destructive/10 border-destructive/50' 
                    : 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{isTokenExpired(decoded.payload) ? '⚠️' : '✅'}</span>
                    <span className="font-semibold">
                      Token is {isTokenExpired(decoded.payload) ? 'Expired' : 'Valid'}
                    </span>
                  </div>
                  {!isTokenExpired(decoded.payload) && (
                    <p className="mt-1 text-sm">
                      Expires in {getTokenTimeLeft(decoded.payload)}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Header Decoding', desc: 'View JWT header with algorithm and token type information.', icon: '📋' },
              { title: 'Payload Decoding', desc: 'Extract and display claims, user data, and metadata.', icon: '📦' },
              { title: 'Expiration Check', desc: 'Automatically check if token is expired.', icon: '⏰' },
              { title: 'Timestamp Conversion', desc: 'Convert Unix timestamps to readable dates.', icon: '📅' },
              { title: 'Signature Display', desc: 'Show the signature part of the token.', icon: '🔐' },
              { title: 'Copy Functions', desc: 'Easily copy decoded header and payload.', icon: '📋' },
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
