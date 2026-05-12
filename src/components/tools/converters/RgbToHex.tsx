'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

// ─── helpers ────────────────────────────────────────────────────────────────

/** Returns true when v is an integer string in [0, 255] */
const isValidChannel = (v: string): boolean => {
  if (!v.trim()) return false
  if (v.includes('.')) return false
  const n = Number(v)
  return Number.isInteger(n) && n >= 0 && n <= 255
}

/** rgb channels → "#rrggbb" */
const channelsToHex = (r: number, g: number, b: number): string =>
  `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`

/** "#rgb" | "#rrggbb" → { r, g, b } or null */
const parseHex = (raw: string): { r: number; g: number; b: number } | null => {
  const clean = raw.replace(/^#/, '').trim()
  if (!/^[0-9A-Fa-f]+$/.test(clean)) return null
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16),
    }
  }
  if (clean.length === 6) {
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16),
    }
  }
  return null
}

// ─── component ───────────────────────────────────────────────────────────────

export function RgbToHex() {
  const [rgb, setRgb] = useState({ r: '', g: '', b: '' })
  const [hex, setHex] = useState('')
  const [error, setError] = useState('')

  // ── derived preview color (only valid, confirmed values) ──────────────────
  // We compute a preview from the *current* hex field when it's a valid hex,
  // otherwise from the rgb fields when all three are valid channels.
  // This keeps preview and inputs always in sync without a separate state.
  const previewHex = (() => {
    // Prefer hex field — but only when it parses cleanly
    if (hex.trim()) {
      const parsed = parseHex(hex)
      if (parsed) return channelsToHex(parsed.r, parsed.g, parsed.b)
    }
    // Fall back to rgb fields
    if (isValidChannel(rgb.r) && isValidChannel(rgb.g) && isValidChannel(rgb.b)) {
      return channelsToHex(Number(rgb.r), Number(rgb.g), Number(rgb.b))
    }
    return null
  })()

  // Derived rgb string for the info panel (only when previewHex is set)
  const previewRgb =
    previewHex && parseHex(previewHex)
      ? (() => {
          const p = parseHex(previewHex)!
          return `rgb(${p.r}, ${p.g}, ${p.b})`
        })()
      : null

  // ── field change handlers (clear error so banner doesn't linger) ──────────

  const handleRgbChange = (channel: 'r' | 'g' | 'b', value: string) => {
    // Reject anything that can't possibly be a valid channel as the user types,
    // but allow empty string and partial numbers (e.g. "-" or "25")
    if (value !== '' && value !== '-' && !/^\d{0,3}$/.test(value)) return
    setRgb((prev) => ({ ...prev, [channel]: value }))
    
    // Real-time validation
    const next = { ...rgb, [channel]: value }
    if (value.trim() && !isValidChannel(value)) {
      if (value.includes('.')) {
        setError('RGB values must be integers — no decimals allowed.')
      } else {
        const num = Number(value)
        if (num < 0 || num > 255) {
          setError('RGB values must each be between 0 and 255.')
        } else {
          setError('RGB values must be valid whole numbers.')
        }
      }
    } else {
      setError('')
    }
    
    // Keep hex field in sync only when all three channels are valid
    if (isValidChannel(next.r) && isValidChannel(next.g) && isValidChannel(next.b)) {
      setHex(channelsToHex(Number(next.r), Number(next.g), Number(next.b)))
    }
  }

  const handleHexChange = (value: string) => {
    setHex(value)
    
    // Real-time validation
    if (value.trim()) {
      const clean = value.replace(/^#/, '').trim()
      if (clean.length !== 3 && clean.length !== 6) {
        setError('Invalid hex format — expected 3 or 6 hexadecimal characters.')
      } else if (!/^[0-9A-Fa-f]+$/.test(clean)) {
        setError('Invalid hex characters — only 0–9 and A–F are allowed.')
      } else {
        setError('')
      }
    } else {
      setError('')
    }
    
    // Live-sync RGB fields when the hex is already valid while typing
    const parsed = parseHex(value)
    if (parsed) {
      setRgb({ r: String(parsed.r), g: String(parsed.g), b: String(parsed.b) })
    }
  }

  const clearAll = () => {
    setRgb({ r: '', g: '', b: '' })
    setHex('')
    setError('')
  }

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">RGB HEX Converter</h1>
          <p className="text-muted-foreground">
            Convert RGB colors to HEX color codes and vice versa. Perfect for designers and developers.
          </p>
        </div>

        {/* Color Preview */}
        <div className="mb-8 flex items-center justify-center">
          <div className="text-center">
            <div
              className="w-32 h-32 rounded-lg border-2 border-border mb-4 transition-colors duration-200"
              style={{ backgroundColor: previewHex ?? '#f3f4f6' }}
            />
            {previewHex && (
              <div className="space-y-0.5">
                <p className="font-mono text-sm">{previewHex.toUpperCase()}</p>
                <p className="font-mono text-xs text-muted-foreground">{previewRgb}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* RGB Input */}
          <div>
            <h2 className="text-xl font-semibold mb-4">RGB Values</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {(['r', 'g', 'b'] as const).map((ch) => (
                  <div key={ch}>
                    <label className="block text-sm font-medium mb-2">
                      {ch === 'r' ? 'Red' : ch === 'g' ? 'Green' : 'Blue'}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={rgb[ch]}
                      onChange={(e) => handleRgbChange(ch, e.target.value)}
                      placeholder="0–255"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* HEX Input */}
          <div>
            <h2 className="text-xl font-semibold mb-4">HEX Value</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={hex}
                onChange={(e) => handleHexChange(e.target.value)}
                placeholder="#RRGGBB"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
              />
              {previewHex && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="space-y-1 text-sm">
                    <p>
                      CSS HEX:{' '}
                      <span className="font-mono">{previewHex.toUpperCase()}</span>
                    </p>
                    <p>
                      CSS RGB:{' '}
                      <span className="font-mono">{previewRgb}</span>
                    </p>
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
              <strong>Error:</strong> {error}
            </p>
            <p className="text-destructive text-xs mt-1">
              RGB values must be integers 0–255. HEX values must be 3 or 6 characters (0–9, A–F).
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
              Color swatch updates instantly as you type valid values.
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Bidirectional</h3>
            <p className="text-sm text-muted-foreground">
              Convert between RGB and HEX formats seamlessly.
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Validation</h3>
            <p className="text-sm text-muted-foreground">
              Validates input ranges and formats automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}