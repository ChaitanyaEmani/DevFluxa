"use client"

import { useState, useEffect, useMemo } from "react"
import { CopyButton } from "@/components/ui/CopyButton"
import { Button } from "@/components/ui/Button"
import { Header } from "@/components/ui/Header"

interface TextStats {
  words: number
  characters: number
  charactersNoSpaces: number
  sentences: number
  paragraphs: number
  readingTime: number
  speakingTime: number
}

export function WordCounter() {
  const [text, setText] = useState("")

  const stats = useMemo((): TextStats => {
    if (!text.trim()) {
      return {
        words: 0,
        characters: 0,
        charactersNoSpaces: 0,
        sentences: 0,
        paragraphs: 0,
        readingTime: 0,
        speakingTime: 0
      }
    }

    // Count words (splits by whitespace and filters out empty strings)
    const words = text.trim().split(/\s+/).filter(word => word.length > 0).length

    // Count characters
    const characters = text.length
    const charactersNoSpaces = text.replace(/\s/g, '').length

    // Count sentences (ends with . ! ?)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length

    // Count paragraphs (double newlines)
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length

    // Reading time (average 200 words per minute)
    const readingTime = Math.ceil(words / 200)

    // Speaking time (average 130 words per minute)
    const speakingTime = Math.ceil(words / 130)

    return {
      words,
      characters,
      charactersNoSpaces,
      sentences,
      paragraphs,
      readingTime,
      speakingTime
    }
  }, [text])

  const sampleTexts = [
    {
      name: "Lorem Ipsum",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris."
    },
    {
      name: "Sample Paragraph",
      text: "The quick brown fox jumps over the lazy dog. This pangram sentence contains every letter of the alphabet at least once. It's commonly used for testing typewriters and computer keyboards."
    },
    {
      name: "Technical Text",
      text: "React is a JavaScript library for building user interfaces. It allows developers to create reusable UI components and manage application state efficiently. React uses a virtual DOM to optimize rendering performance."
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header
        toolTitle="Word Counter"
        toolDescription="Count words, characters, sentences, paragraphs and calculate reading time"
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
                  onClick={() => setText(sample.text)}
                  className="text-xs"
                >
                  {sample.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Text Input */}
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium">Enter Your Text</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {stats.words} words, {stats.characters} characters
                </span>
                {text && <CopyButton text={text} />}
              </div>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Start typing or paste your text here to count words, characters, and more..."
              className="w-full h-64 px-4 py-3 border rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Statistics */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-6">Text Statistics</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stats.words}</div>
                <div className="text-sm text-muted-foreground">Words</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stats.characters}</div>
                <div className="text-sm text-muted-foreground">Characters</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stats.charactersNoSpaces}</div>
                <div className="text-sm text-muted-foreground">No Spaces</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stats.sentences}</div>
                <div className="text-sm text-muted-foreground">Sentences</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stats.paragraphs}</div>
                <div className="text-sm text-muted-foreground">Paragraphs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stats.readingTime} min</div>
                <div className="text-sm text-muted-foreground">Reading Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stats.speakingTime} min</div>
                <div className="text-sm text-muted-foreground">Speaking Time</div>
              </div>
            </div>
          </div>

          {/* Detailed Analysis */}
          {text && (
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Detailed Analysis</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">Average Words per Sentence</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.sentences > 0 ? (stats.words / stats.sentences).toFixed(1) : '0'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">Average Characters per Word</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.words > 0 ? (stats.charactersNoSpaces / stats.words).toFixed(1) : '0'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">Average Sentences per Paragraph</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.paragraphs > 0 ? (stats.sentences / stats.paragraphs).toFixed(1) : '0'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium">Text Complexity</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    stats.words / stats.sentences > 20 
                      ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
                      : stats.words / stats.sentences > 15
                      ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300'
                      : 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
                  }`}>
                    {stats.sentences > 0 && (
                      stats.words / stats.sentences > 20 
                        ? 'Complex'
                        : stats.words / stats.sentences > 15
                        ? 'Moderate'
                        : 'Simple'
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {text && (
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setText(text.toUpperCase())}
                >
                  UPPERCASE
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setText(text.toLowerCase())}
                >
                  lowercase
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setText(text.replace(/\s+/g, ' ').trim())}
                >
                  Remove Extra Spaces
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setText('')}
                >
                  Clear Text
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
