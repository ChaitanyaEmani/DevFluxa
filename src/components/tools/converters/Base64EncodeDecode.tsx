'use client'

import { useState } from 'react'
import { TextareaInput } from '@/components/ui/TextareaInput'
import { TextareaOutput } from '@/components/ui/TextareaOutput'
import { CopyButton } from '@/components/ui/CopyButton'
import { Download } from '@/components/ui/Download'
import { Button } from '@/components/ui/Button'

export function Base64EncodeDecode() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [error, setError] = useState('')

  const encodeBase64 = (str: string) => {
    try {
      return btoa(unescape(encodeURIComponent(str)))
    } catch (err) {
      throw new Error('Failed to encode string')
    }
  }

  const decodeBase64 = (str: string) => {
    try {
      return decodeURIComponent(escape(atob(str)))
    } catch (err) {
      throw new Error('Failed to decode string - invalid Base64 format')
    }
  }

  const process = () => {
    try {
      if (!input.trim()) {
        throw new Error(`Please enter text to ${mode}`)
      }

      setError('')
      let result = ''
      
      if (mode === 'encode') {
        result = encodeBase64(input)
      } else {
        // Additional validation for Base64 decoding
        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(input.trim())) {
          throw new Error('Invalid Base64 format. Expected format: Base64 encoded string with optional padding')
        }
        
        // Check for valid Base64 length
        const cleanedInput = input.replace(/=/g, '')
        if (cleanedInput.length % 4 !== 0) {
          throw new Error('Invalid Base64 padding. Base64 strings must have padding that makes the length a multiple of 4')
        }
        
        result = decodeBase64(input)
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
          <h1 className="text-3xl font-bold mb-4">Base64 Encode/Decode</h1>
          <p className="text-muted-foreground">
            Encode and decode Base64 strings instantly. Perfect for encoding data for safe transmission.
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
                {mode === 'encode' ? 'Plain Text' : 'Base64 Text'}
              </h2>
              <Button variant="outline" onClick={clearAll}>
                Clear
              </Button>
            </div>
            <TextareaInput
              value={input}
              onChange={setInput}
              placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
              rows={12}
            />
          </div>

          {/* Output Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}
              </h2>
              {output && (
                <div className="flex gap-2">
                  <CopyButton text={output} />
                  <Download
                    content={output}
                    filename={mode === 'encode' ? 'encoded.txt' : 'decoded.txt'}
                    mimeType="text/plain"
                  />
                </div>
              )}
            </div>
            <TextareaOutput
              value={output}
              placeholder={mode === 'encode' ? 'Base64 output will appear here...' : 'Decoded text will appear here...'}
              rows={12}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mt-6">
          <Button onClick={process}>
            {mode === 'encode' ? 'Encode to Base64' : 'Decode from Base64'}
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">
              <strong>Base64 {mode === 'encode' ? 'Encoding' : 'Decoding'} Error:</strong> {error}
            </p>
            <p className="text-destructive text-xs mt-2">
              {mode === 'encode' 
                ? 'Please ensure your input text is valid. Special characters will be automatically encoded.'
                : 'Please ensure your Base64 string is valid. It should contain only A-Z, a-z, 0-9, +, /, and optional = padding.'
              }
            </p>
          </div>
        )}

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Bidirectional</h3>
            <p className="text-sm text-muted-foreground">
              Switch between encode and decode modes with a single click
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Unicode Support</h3>
            <p className="text-sm text-muted-foreground">
              Properly handles Unicode characters and special symbols
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Instant Processing</h3>
            <p className="text-sm text-muted-foreground">
              Fast encoding and decoding directly in your browser
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
