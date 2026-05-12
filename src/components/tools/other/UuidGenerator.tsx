"use client"

import { useState } from "react"
import { CopyButton } from "@/components/ui/CopyButton"
import { Button } from "@/components/ui/Button"
import { Header } from "@/components/ui/Header"
import {
  generateUUID,
  generateBulkUUIDs,
  copyToClipboard,
  downloadAsFile,
  validateBulkCount,
  UUIDVersion
} from "@/lib/generators/uuid"


export function UuidGenerator() {
  const [version, setVersion] = useState<UUIDVersion>('v4')
  const [uuids, setUuids] = useState<string[]>([])
  const [bulkCount, setBulkCount] = useState(5)

  const generateSingle = () => {
    const newUuid = generateUUID(version)
    setUuids([newUuid])
  }

  const generateBulk = () => {
    const newUuids = generateBulkUUIDs(version, bulkCount)
    setUuids(newUuids)
  }

  const clearAll = () => {
    setUuids([])
  }

  const copyAll = async () => {
    const text = uuids.join('\n')
    await copyToClipboard(text)
  }

  const downloadAsFileHandler = () => {
    const text = uuids.join('\n')
    downloadAsFile(text, `uuids-${version}.txt`)
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <Header 
          toolTitle="UUID Generator" 
          toolDescription="Generate unique UUIDs in v1 (timestamp-based) and v4 (random) formats." 
        />

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <Button onClick={generateSingle} className="shadow-sm hover:shadow-md transition-all duration-200">
              <span className="mr-2">🎲</span>Generate UUID
            </Button>
            <Button variant="outline" onClick={generateBulk} className="shadow-sm hover:shadow-md transition-all duration-200">
              <span className="mr-2">📦</span>Generate Bulk ({bulkCount})
            </Button>
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Version:</label>
              <select 
                value={version} 
                onChange={(e) => setVersion(e.target.value as UUIDVersion)}
                className="px-3 py-1 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="v4">UUID v4 (Random)</option>
                <option value="v1">UUID v1 (Timestamp)</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Bulk Count:</label>
              <input 
                type="number"
                min="1"
                max="100"
                value={bulkCount}
                onChange={(e) => setBulkCount(validateBulkCount(e.target.value))}
                className="w-16 px-2 py-1 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button variant="outline" onClick={clearAll} className="shadow-sm hover:shadow-md transition-all duration-200 text-destructive hover:bg-destructive/5">
              <span className="mr-2">🗑️</span>Clear
            </Button>
          </div>
        </div>

        {/* Version Info */}
        <div className="mb-6 p-4 bg-muted/30 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">ℹ️</span>
            <span className="font-semibold">UUID {version.toUpperCase()}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {version === 'v4' 
              ? 'UUID v4 uses random or pseudo-random numbers. Most commonly used version.'
              : 'UUID v1 uses timestamp and MAC address. Time-sortable but less private.'}
          </p>
        </div>

        {/* Results */}
        {uuids.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Generated UUID{uuids.length > 1 ? `s (${uuids.length})` : ''}
              </h3>
              <div className="flex gap-2">
                {uuids.length > 1 && (
                  <>
                    <Button variant="outline" onClick={copyAll} size="sm">
                      <span className="mr-1">📋</span>Copy All
                    </Button>
                    <Button variant="outline" onClick={downloadAsFileHandler} size="sm">
                      <span className="mr-1">💾</span>Download
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              {uuids.map((uuid, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-background/50 border border-border/50 rounded-lg">
                  <span className="text-sm text-muted-foreground font-mono w-8">
                    {index + 1}.
                  </span>
                  <code className="flex-1 font-mono text-sm bg-muted/30 px-3 py-1 rounded">
                    {uuid}
                  </code>
                  <CopyButton text={uuid} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {uuids.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-6xl mb-4">🎲</div>
            <h3 className="text-xl font-semibold mb-2">No UUIDs Generated Yet</h3>
            <p className="text-sm mb-4">Click "Generate UUID" to create a unique identifier</p>
            <Button onClick={generateSingle} className="shadow-sm hover:shadow-md transition-all duration-200">
              <span className="mr-2">🎲</span>Generate First UUID
            </Button>
          </div>
        )}

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'UUID v4 Support', desc: 'Generate random UUIDs (most common type).', icon: '🎲' },
              { title: 'UUID v1 Support', desc: 'Generate timestamp-based UUIDs.', icon: '⏰' },
              { title: 'Bulk Generation', desc: 'Generate multiple UUIDs at once.', icon: '📦' },
              { title: 'Copy Functions', desc: 'Copy individual or all UUIDs to clipboard.', icon: '📋' },
              { title: 'Download Support', desc: 'Export UUIDs as text file.', icon: '💾' },
              { title: 'Collision Free', desc: 'Extremely low probability of duplicates.', icon: '🔒' },
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

        <div className="mt-12 p-6 bg-muted/30 rounded-lg border">
          <h3 className="text-lg font-semibold mb-3">About UUIDs</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div>
              <strong>UUID (Universally Unique Identifier)</strong> is a 128-bit number used to identify information in computer systems.
            </div>
            <div>
              <strong>Version 4:</strong> Uses random or pseudo-random numbers. Most commonly used version with 122 random bits.
            </div>
            <div>
              <strong>Version 1:</strong> Uses timestamp and MAC address. Time-sortable but reveals MAC address and creation time.
            </div>
            <div>
              <strong>Format:</strong> 8-4-4-4-12 hexadecimal characters (32 total characters with 4 hyphens).
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
