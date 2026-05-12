'use client'

import { useState } from 'react'
import { TextareaInput } from '@/components/ui/TextareaInput'
import { TextareaOutput } from '@/components/ui/TextareaOutput'
import { CopyButton } from '@/components/ui/CopyButton'
import { Download } from '@/components/ui/Download'
import { Button } from '@/components/ui/Button'
import { encodeUrl, decodeUrl } from '@/lib/converters/url'

export function UrlEncoder() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [error, setError] = useState('')


  const process = () => {
    try {
      if (!input.trim()) {
        throw new Error(`Please enter URL to ${mode}`)
      }

      setError('')
      let result = ''
      
      if (mode === 'encode') {
        // Basic URL validation before encoding
        try {
          new URL(input)
        } catch (urlErr) {
          throw new Error('Invalid URL format. Please enter a valid URL.')
        }
        result = encodeUrl(input)
      } else {
        // Additional validation for URL decoding
        if (!/%[0-9A-Fa-f]{2}/.test(input)) {
          throw new Error('Invalid URL encoding format. Expected percent-encoded URL.')
        }
        
        // Check for common invalid sequences
        if (input.includes(' ')) {
          throw new Error('Invalid URL encoding: URLs should not contain spaces when encoded')
        }
        
        result = decodeUrl(input)
      }
      
      setOutput(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Processing failed'
      setError(errorMessage)
      setOutput('')
    }
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setError('')
  }

  const swapMode = () => {
    setMode(mode === 'encode' ? 'decode' : 'encode')
    setInput(output)
    setOutput(input)
    setError('')
  }

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">URL Encoder</h1>
          <p className="text-muted-foreground">
            Encode and decode URLs for safe transmission. Perfect for handling special characters in URLs.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant={mode === 'encode' ? 'default' : 'outline'}
              onClick={() => setMode('encode')}
            >
              Encode
            </Button>
            <Button
              variant={mode === 'decode' ? 'default' : 'outline'}
              onClick={() => setMode('decode')}
            >
              Decode
            </Button>
            <Button variant="outline" onClick={swapMode}>
              Swap ↔
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {mode === 'encode' ? 'Original URL' : 'Encoded URL'}
              </h2>
              <Button variant="outline" onClick={clearAll}>
                Clear
              </Button>
            </div>
            <TextareaInput
              value={input}
              onChange={setInput}
              placeholder={mode === 'encode' ? 'Enter URL to encode...' : 'Enter encoded URL to decode...'}
              rows={8}
            />
          </div>

          {/* Output Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {mode === 'encode' ? 'Encoded URL' : 'Decoded URL'}
              </h2>
              {output && (
                <div className="flex gap-2">
                  <CopyButton text={output} />
                  <Download
                    content={output}
                    filename={mode === 'encode' ? 'encoded-url.txt' : 'decoded-url.txt'}
                    mimeType="text/plain"
                  />
                </div>
              )}
            </div>
            <TextareaOutput
              value={output}
              placeholder={mode === 'encode' ? 'Encoded URL will appear here...' : 'Decoded URL will appear here...'}
              rows={8}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mt-6">
          <Button onClick={process}>
            {mode === 'encode' ? 'Encode URL' : 'Decode URL'}
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Special Characters</h3>
            <p className="text-sm text-muted-foreground">
              Properly handles spaces, symbols, and non-ASCII characters
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Safe Transmission</h3>
            <p className="text-sm text-muted-foreground">
              Ensures URLs are safe for HTTP requests and database storage
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Bidirectional</h3>
            <p className="text-sm text-muted-foreground">
              Switch between encode and decode modes instantly
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
