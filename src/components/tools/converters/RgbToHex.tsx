'use client'

import { useState } from 'react'
import { CopyButton } from '@/components/ui/CopyButton'
import { Button } from '@/components/ui/Button'

export function RgbToHex() {
  const [rgb, setRgb] = useState({ r: '', g: '', b: '' })
  const [hex, setHex] = useState('')
  const [error, setError] = useState('')

  const rgbToHex = () => {
    try {
      if (!rgb.r.trim() || !rgb.g.trim() || !rgb.b.trim()) {
        throw new Error('Please enter all RGB values (R, G, B)')
      }

      const r = parseInt(rgb.r)
      const g = parseInt(rgb.g)
      const b = parseInt(rgb.b)

      if (isNaN(r) || isNaN(g) || isNaN(b)) {
        throw new Error('RGB values must be valid numbers')
      }

      if (rgb.r.includes('.') || rgb.g.includes('.') || rgb.b.includes('.')) {
        throw new Error('RGB values must be integers (no decimals allowed)')
      }

      if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
        throw new Error('RGB values must be between 0 and 255')
      }

      const hexR = r.toString(16).padStart(2, '0')
      const hexG = g.toString(16).padStart(2, '0')
      const hexB = b.toString(16).padStart(2, '0')

      setHex(`#${hexR}${hexG}${hexB}`)
      setError('')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Conversion failed'
      setError(errorMessage)
      setHex('')
    }
  }

  const hexToRgb = () => {
    try {
      if (!hex.trim()) {
        throw new Error('Please enter a HEX color value')
      }

      const cleanHex = hex.replace('#', '')
      
      if (cleanHex.length !== 6 && cleanHex.length !== 3) {
        throw new Error('Invalid hex format. Expected 3 or 6 hexadecimal characters')
      }

      if (!/^[0-9A-Fa-f]+$/.test(cleanHex)) {
        throw new Error('Invalid hex characters. Only 0-9 and A-F are allowed')
      }

      // Handle both 3-digit and 6-digit hex
      let r, g, b
      if (cleanHex.length === 3) {
        // Expand 3-digit hex (e.g., #F00 -> #FF0000)
        r = parseInt(cleanHex[0] + cleanHex[0], 16)
        g = parseInt(cleanHex[1] + cleanHex[1], 16)
        b = parseInt(cleanHex[2] + cleanHex[2], 16)
      } else {
        r = parseInt(cleanHex.substring(0, 2), 16)
        g = parseInt(cleanHex.substring(2, 4), 16)
        b = parseInt(cleanHex.substring(4, 6), 16)
      }

      if (isNaN(r) || isNaN(g) || isNaN(b)) {
        throw new Error('Invalid hex values')
      }

      setRgb({ r: r.toString(), g: g.toString(), b: b.toString() })
      setError('')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Conversion failed'
      setError(errorMessage)
    }
  }

  const clearAll = () => {
    setRgb({ r: '', g: '', b: '' })
    setHex('')
    setError('')
  }

  const handleRgbChange = (color: 'r' | 'g' | 'b', value: string) => {
    setRgb(prev => ({ ...prev, [color]: value }))
  }

  const previewColor = () => {
    if (hex && !error) {
      return hex
    }
    if (rgb.r && rgb.g && rgb.b && !error) {
      try {
        const r = parseInt(rgb.r)
        const g = parseInt(rgb.g)
        const b = parseInt(rgb.b)
        if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
          return `rgb(${r}, ${g}, ${b})`
        }
      } catch {
        return undefined
      }
    }
    return undefined
  }

  const color = previewColor()

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">RGB to HEX Converter</h1>
          <p className="text-muted-foreground">
            Convert RGB colors to HEX color codes and vice versa. Perfect for designers and developers.
          </p>
        </div>

        {/* Color Preview */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div 
                className="w-32 h-32 rounded-lg border-2 border-border mb-4"
                style={{ backgroundColor: color || '#f3f4f6' }}
              />
              {color && (
                <p className="font-mono text-sm">{color}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* RGB Input */}
          <div>
            <h2 className="text-xl font-semibold mb-4">RGB Values</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Red</label>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={rgb.r}
                    onChange={(e) => handleRgbChange('r', e.target.value)}
                    placeholder="0-255"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Green</label>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={rgb.g}
                    onChange={(e) => handleRgbChange('g', e.target.value)}
                    placeholder="0-255"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Blue</label>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={rgb.b}
                    onChange={(e) => handleRgbChange('b', e.target.value)}
                    placeholder="0-255"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              <Button onClick={rgbToHex} className="w-full">
                Convert to HEX
              </Button>
            </div>
          </div>

          {/* HEX Input */}
          <div>
            <h2 className="text-xl font-semibold mb-4">HEX Value</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={hex}
                onChange={(e) => setHex(e.target.value)}
                placeholder="#RRGGBB"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
              />
              <Button onClick={hexToRgb} className="w-full">
                Convert to RGB
              </Button>
              {hex && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="space-y-1 text-sm">
                    <p>CSS: <span className="font-mono">{hex}</span></p>
                    <p>RGB: <span className="font-mono">{color}</span></p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">
              <strong>Color Conversion Error:</strong> {error}
            </p>
            <p className="text-destructive text-xs mt-2">
              RGB values must be integers 0-255. HEX values must be 3 or 6 characters (0-9, A-F).
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Button variant="outline" onClick={clearAll}>
            Clear All
          </Button>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Live Preview</h3>
            <p className="text-sm text-muted-foreground">
              See color preview in real-time as you type
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Bidirectional</h3>
            <p className="text-sm text-muted-foreground">
              Convert between RGB and HEX formats seamlessly
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Validation</h3>
            <p className="text-sm text-muted-foreground">
              Validates input ranges and formats automatically
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
