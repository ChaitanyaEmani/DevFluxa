export interface TextStats {
  words: number
  characters: number
  charactersNoSpaces: number
  sentences: number
  paragraphs: number
  readingTime: number
  speakingTime: number
}

export interface SampleText {
  name: string
  text: string
}

export interface DetailedAnalysis {
  averageWordsPerSentence: number
  averageCharactersPerWord: number
  averageSentencesPerParagraph: number
  complexity: 'Simple' | 'Moderate' | 'Complex'
}

export const sampleTexts: SampleText[] = [
  {
    name: "Lorem Ipsum",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris."
  },
  {
    name: "Sample Paragraph",
    text: "The quick brown fox jumps over lazy dog. This pangram sentence contains every letter of alphabet at least once. It's commonly used for testing typewriters and computer keyboards."
  },
  {
    name: "Technical Text",
    text: "React is a JavaScript library for building user interfaces. It allows developers to create reusable UI components and manage application state efficiently. React uses a virtual DOM to optimize rendering performance."
  }
]

export function calculateTextStats(text: string): TextStats {
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
}

export function calculateDetailedAnalysis(stats: TextStats): DetailedAnalysis {
  const averageWordsPerSentence = stats.sentences > 0 ? stats.words / stats.sentences : 0
  const averageCharactersPerWord = stats.words > 0 ? stats.charactersNoSpaces / stats.words : 0
  const averageSentencesPerParagraph = stats.paragraphs > 0 ? stats.sentences / stats.paragraphs : 0

  let complexity: 'Simple' | 'Moderate' | 'Complex' = 'Simple'
  if (stats.sentences > 0) {
    if (averageWordsPerSentence > 20) {
      complexity = 'Complex'
    } else if (averageWordsPerSentence > 15) {
      complexity = 'Moderate'
    }
  }

  return {
    averageWordsPerSentence,
    averageCharactersPerWord,
    averageSentencesPerParagraph,
    complexity
  }
}

export function getComplexityColor(complexity: 'Simple' | 'Moderate' | 'Complex'): string {
  switch (complexity) {
    case 'Complex':
      return 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
    case 'Moderate':
      return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300'
    case 'Simple':
    default:
      return 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
  }
}

export function transformText(text: string, transformation: 'uppercase' | 'lowercase' | 'removeExtraSpaces' | 'clear'): string {
  switch (transformation) {
    case 'uppercase':
      return text.toUpperCase()
    case 'lowercase':
      return text.toLowerCase()
    case 'removeExtraSpaces':
      return text.replace(/\s+/g, ' ').trim()
    case 'clear':
      return ''
    default:
      return text
  }
}