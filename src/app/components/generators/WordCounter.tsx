"use client"

import { useState, useMemo } from "react"
import { CopyButton } from "@/app/components/ui/CopyButton"
import { Button } from "@/app/components/ui/Button"
import { Header } from "@/app/components/ui/Header"
import {
  sampleTexts,
  calculateTextStats,
  calculateDetailedAnalysis,
  getComplexityColor,
  transformText
} from "@/lib/generators/wordCounter"


export function WordCounter() {
  const [text, setText] = useState("")

  const stats = useMemo(() => calculateTextStats(text), [text])
  const detailedAnalysis = useMemo(() => calculateDetailedAnalysis(stats), [stats])

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
                    {detailedAnalysis.averageWordsPerSentence.toFixed(1)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">Average Characters per Word</span>
                  <span className="text-sm text-muted-foreground">
                    {detailedAnalysis.averageCharactersPerWord.toFixed(1)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">Average Sentences per Paragraph</span>
                  <span className="text-sm text-muted-foreground">
                    {detailedAnalysis.averageSentencesPerParagraph.toFixed(1)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium">Text Complexity</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getComplexityColor(detailedAnalysis.complexity)}`}>
                    {detailedAnalysis.complexity}
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
                  onClick={() => setText(transformText(text, 'uppercase'))}
                >
                  UPPERCASE
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setText(transformText(text, 'lowercase'))}
                >
                  lowercase
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setText(transformText(text, 'removeExtraSpaces'))}
                >
                  Remove Extra Spaces
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setText(transformText(text, 'clear'))}
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
