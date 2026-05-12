"use client"

import { useState, useEffect } from "react"
import { CopyButton } from "@/components/ui/CopyButton"
import { Button } from "@/components/ui/Button"
import { Header } from "@/components/ui/Header"
import {
  PasswordOptions,
  PasswordStrength,
  generatePassword,
  calculatePasswordStrength,
  getPasswordAnalysis,
  passwordPresets,
  getDefaultOptions
} from "@/lib/generators/password"


export function PasswordGenerator() {
  const [password, setPassword] = useState("")
  const [options, setOptions] = useState<PasswordOptions>(getDefaultOptions())
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: "Weak",
    color: "bg-red-500"
  })


  useEffect(() => {
    handleGeneratePassword()
  }, [])

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password))
  }, [password])

  const handleOptionChange = (key: keyof PasswordOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  const handleGeneratePassword = () => {
    const newPassword = generatePassword(options)
    setPassword(newPassword)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="max-w-6xl mx-auto">
          <Header
            toolTitle="Password Generator"
            toolDescription="Generate secure, random passwords with customizable options"
          />
          <div className="flex flex-col gap-6">
            {/* Generated Password */}
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium">Generated Password</label>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full text-white ${passwordStrength.color}`}>
                    {passwordStrength.label}
                  </span>
                  {password && <CopyButton text={password} />}
                </div>
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  value={password}
                  readOnly
                  className="w-full px-4 py-3 pr-24 border rounded-md font-mono text-lg bg-muted focus:outline-none"
                  placeholder="Click generate to create a password"
                />
                <Button
                  onClick={handleGeneratePassword}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  size="sm"
                >
                  Generate
                </Button>
              </div>

              {/* Strength Indicator */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Password Strength</span>
                  <span className="text-sm text-muted-foreground">{passwordStrength.score.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${passwordStrength.score}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Presets */}
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Presets</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {passwordPresets.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setOptions({
                        length: preset.length,
                        includeUppercase: preset.includeUppercase,
                        includeLowercase: preset.includeLowercase,
                        includeNumbers: preset.includeNumbers,
                        includeSymbols: preset.includeSymbols,
                        excludeSimilar: false,
                        excludeAmbiguous: false
                      })
                      setTimeout(generatePassword, 100)
                    }}
                    className="text-xs"
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Password Options</h3>
              
              {/* Length Slider */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">Password Length</label>
                  <span className="text-sm font-mono bg-muted px-2 py-1 rounded">{options.length}</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="64"
                  value={options.length}
                  onChange={(e) => handleOptionChange('length', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>4</span>
                  <span>64</span>
                </div>
              </div>

              {/* Character Types */}
              <div className="space-y-3">
                <label className="text-sm font-medium mb-3 block">Character Types</label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeUppercase}
                    onChange={(e) => handleOptionChange('includeUppercase', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Uppercase Letters (A-Z)</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeLowercase}
                    onChange={(e) => handleOptionChange('includeLowercase', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Lowercase Letters (a-z)</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeNumbers}
                    onChange={(e) => handleOptionChange('includeNumbers', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Numbers (0-9)</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeSymbols}
                    onChange={(e) => handleOptionChange('includeSymbols', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Symbols (!@#$%^&*)</span>
                </label>
              </div>

              {/* Advanced Options */}
              <div className="mt-6 pt-6 border-t">
                <label className="text-sm font-medium mb-3 block">Advanced Options</label>
                
                <label className="flex items-center gap-3 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={options.excludeSimilar}
                    onChange={(e) => handleOptionChange('excludeSimilar', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Exclude Similar Characters (i, l, 1, L, o, 0, O)</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.excludeAmbiguous}
                    onChange={(e) => handleOptionChange('excludeAmbiguous', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Exclude Ambiguous Characters ({ } [ ] ( ) / \ ' " ` ~ , ; . &lt; &gt;)</span>
                </label>
              </div>
            </div>

            {/* Password Analysis */}
            {password && password !== "Please select at least one character type" && (() => {
              const analysis = getPasswordAnalysis(password)
              return (
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Password Analysis</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{analysis.length}</div>
                      <div className="text-sm text-muted-foreground">Characters</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {analysis.uniqueChars}
                      </div>
                      <div className="text-sm text-muted-foreground">Unique Chars</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {analysis.hasLowercase ? '✓' : '✗'}
                      </div>
                      <div className="text-sm text-muted-foreground">Lowercase</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {analysis.hasUppercase ? '✓' : '✗'}
                      </div>
                      <div className="text-sm text-muted-foreground">Uppercase</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {analysis.hasNumbers ? '✓' : '✗'}
                      </div>
                      <div className="text-sm text-muted-foreground">Numbers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {analysis.hasSymbols ? '✓' : '✗'}
                      </div>
                      <div className="text-sm text-muted-foreground">Symbols</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {analysis.noRepeats ? '✓' : '✗'}
                      </div>
                      <div className="text-sm text-muted-foreground">No Repeats</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {passwordStrength.label}
                      </div>
                      <div className="text-sm text-muted-foreground">Strength</div>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}
