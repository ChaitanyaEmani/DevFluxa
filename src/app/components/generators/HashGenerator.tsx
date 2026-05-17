"use client"

import { useState, useEffect } from "react"
import { CopyButton } from "@/app/components/ui/CopyButton"
import { Button } from "@/app/components/ui/Button"
import { Header } from "@/app/components/ui/Header"
import {
  HashResult,
  hashAlgorithms,
  sampleTexts,
  generateHashes,
  getTextStatistics,
  getDefaultSelectedAlgorithms
} from "@/lib/generators/hash"


export function HashGenerator() {
  const [inputText, setInputText] = useState("")
  const [hashes, setHashes] = useState<HashResult[]>([])
  const [selectedAlgorithms, setSelectedAlgorithms] = useState(getDefaultSelectedAlgorithms())


  const handleGenerateHashes = async () => {
    const results = await generateHashes(inputText, selectedAlgorithms)
    setHashes(results)
  }

  useEffect(() => {
    handleGenerateHashes()
  }, [inputText, selectedAlgorithms])

  const handleAlgorithmToggle = (algorithm: string) => {
    setSelectedAlgorithms(prev => ({
      ...prev,
      [algorithm]: !prev[algorithm]
    }))
  }

  const clearAll = () => {
    setInputText("")
    setHashes([])
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        toolTitle="Hash Generator"
        toolDescription="Generate MD5, SHA1, SHA256, and SHA512 hashes instantly"
      />

      <div className="container py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Sample Texts */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Sample Texts</h3>
            <div className="flex flex-wrap gap-2">
              {sampleTexts.map((sample) => (
                <Button
                  key={sample.name}
                  variant="outline"
                  size="sm"
                  onClick={() => setInputText(sample.text)}
                  className="text-xs"
                >
                  {sample.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Input Section */}
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium">Input Text</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {inputText.length} characters
                </span>
                {inputText && <CopyButton text={inputText} />}
              </div>
            </div>
            
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text to generate hashes..."
              className="w-full h-32 px-4 py-3 border rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />

            <div className="flex gap-2 mt-4">
              <Button onClick={handleGenerateHashes} size="sm">
                Generate Hashes
              </Button>
              <Button onClick={clearAll} variant="outline" size="sm">
                Clear
              </Button>
            </div>
          </div>

          {/* Algorithm Selection */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Hash Algorithms</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(hashAlgorithms).map(([key, algorithm]) => (
                <label key={key} className="flex items-start gap-3 cursor-pointer p-3 border rounded-lg hover:bg-muted/50">
                  <input
                    type="checkbox"
                    checked={selectedAlgorithms[key]}
                    onChange={() => handleAlgorithmToggle(key)}
                    className="rounded border-gray-300 mt-1"
                  />
                  <div>
                    <div className="font-medium">{algorithm.name}</div>
                    <div className="text-sm text-muted-foreground">{algorithm.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Hash Results */}
          {hashes.length > 0 && (
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Generated Hashes</h3>
                <div className="text-sm text-muted-foreground">
                  Total processing time: {hashes.reduce((sum, h) => sum + h.processingTime, 0).toFixed(2)}ms
                </div>
              </div>

              <div className="space-y-4">
                {hashes.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{result.algorithm}</span>
                        <span className="text-xs text-muted-foreground">
                          {result.hash.length} bits
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {result.processingTime.toFixed(2)}ms
                        </span>
                      </div>
                      <CopyButton text={result.hash} />
                    </div>
                    
                    <div className="font-mono text-xs bg-muted p-3 rounded break-all">
                      {result.hash}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hash Information */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">About Hash Algorithms</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">MD5</h4>
                <p className="text-sm text-muted-foreground">
                  Fast but vulnerable to collisions. Not recommended for security-critical applications.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">SHA-1</h4>
                <p className="text-sm text-muted-foreground">
                  Deprecated for security purposes due to known vulnerabilities. Use SHA-256 or higher instead.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">SHA-256</h4>
                <p className="text-sm text-muted-foreground">
                  Part of the SHA-2 family. Widely used and considered secure for most applications.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">SHA-512</h4>
                <p className="text-sm text-muted-foreground">
                  Part of the SHA-2 family with longer hash length. More secure but slower than SHA-256.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          {inputText && (() => {
            const stats = getTextStatistics(inputText, hashes.length)
            return (
              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Input Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{stats.characters}</div>
                    <div className="text-sm text-muted-foreground">Characters</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{stats.words}</div>
                    <div className="text-sm text-muted-foreground">Words</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{stats.bytes}</div>
                    <div className="text-sm text-muted-foreground">Bytes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{stats.hashes}</div>
                    <div className="text-sm text-muted-foreground">Hashes</div>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
