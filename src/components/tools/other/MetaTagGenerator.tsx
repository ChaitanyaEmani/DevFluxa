"use client"

import { useState } from "react"
import { CopyButton } from "@/components/ui/CopyButton"
import { Button } from "@/components/ui/Button"
import { Header } from "@/components/ui/Header"

interface MetaTagData {
  title: string
  description: string
  keywords: string
  author: string
  robots: string
  canonical: string
  ogTitle: string
  ogDescription: string
  ogImage: string
  ogUrl: string
  twitterCard: string
  twitterTitle: string
  twitterDescription: string
  twitterImage: string
  twitterSite: string
  favicon: string
  themeColor: string
  viewport: string
  charset: string
  lang: string
}

function generateMetaTags(data: MetaTagData): string {
  const tags: string[] = []
  
  // Basic meta tags
  if (data.charset) tags.push(`<meta charset="${data.charset}">`)
  if (data.viewport) tags.push(`<meta name="viewport" content="${data.viewport}">`)
  if (data.title) tags.push(`<title>${data.title}</title>`)
  if (data.description) tags.push(`<meta name="description" content="${data.description}">`)
  if (data.keywords) tags.push(`<meta name="keywords" content="${data.keywords}">`)
  if (data.author) tags.push(`<meta name="author" content="${data.author}">`)
  if (data.robots) tags.push(`<meta name="robots" content="${data.robots}">`)
  if (data.canonical) tags.push(`<link rel="canonical" href="${data.canonical}">`)
  if (data.lang) tags.push(`<html lang="${data.lang}">`)
  
  // Open Graph tags
  if (data.ogTitle || data.title) tags.push(`<meta property="og:title" content="${data.ogTitle || data.title}">`)
  if (data.ogDescription || data.description) tags.push(`<meta property="og:description" content="${data.ogDescription || data.description}">`)
  if (data.ogImage) tags.push(`<meta property="og:image" content="${data.ogImage}">`)
  if (data.ogUrl || data.canonical) tags.push(`<meta property="og:url" content="${data.ogUrl || data.canonical}">`)
  tags.push('<meta property="og:type" content="website">')
  
  // Twitter Card tags
  if (data.twitterCard) tags.push(`<meta name="twitter:card" content="${data.twitterCard}">`)
  if (data.twitterTitle || data.title) tags.push(`<meta name="twitter:title" content="${data.twitterTitle || data.title}">`)
  if (data.twitterDescription || data.description) tags.push(`<meta name="twitter:description" content="${data.twitterDescription || data.description}">`)
  if (data.twitterImage || data.ogImage) tags.push(`<meta name="twitter:image" content="${data.twitterImage || data.ogImage}">`)
  if (data.twitterSite) tags.push(`<meta name="twitter:site" content="${data.twitterSite}">`)
  
  // Additional meta tags
  if (data.favicon) tags.push(`<link rel="icon" href="${data.favicon}">`)
  if (data.themeColor) tags.push(`<meta name="theme-color" content="${data.themeColor}">`)
  
  return tags.join('\n')
}

export function MetaTagGenerator() {
  const [formData, setFormData] = useState<MetaTagData>({
    title: '',
    description: '',
    keywords: '',
    author: '',
    robots: 'index, follow',
    canonical: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    ogUrl: '',
    twitterCard: 'summary_large_image',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    twitterSite: '',
    favicon: '',
    themeColor: '#000000',
    viewport: 'width=device-width, initial-scale=1.0',
    charset: 'UTF-8',
    lang: 'en'
  })

  const [generatedTags, setGeneratedTags] = useState('')

  const handleInputChange = (field: keyof MetaTagData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const generateTags = () => {
    const tags = generateMetaTags(formData)
    setGeneratedTags(tags)
  }

  const clearAll = () => {
    setFormData({
      title: '',
      description: '',
      keywords: '',
      author: '',
      robots: 'index, follow',
      canonical: '',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      ogUrl: '',
      twitterCard: 'summary_large_image',
      twitterTitle: '',
      twitterDescription: '',
      twitterImage: '',
      twitterSite: '',
      favicon: '',
      themeColor: '#000000',
      viewport: 'width=device-width, initial-scale=1.0',
      charset: 'UTF-8',
      lang: 'en'
    })
    setGeneratedTags('')
  }

  const loadExample = () => {
    setFormData({
      title: 'My Awesome Website',
      description: 'A comprehensive guide to web development and modern technologies',
      keywords: 'web development, programming, tutorials, javascript, react',
      author: 'John Doe',
      robots: 'index, follow',
      canonical: 'https://example.com',
      ogTitle: 'My Awesome Website - Web Development Guide',
      ogDescription: 'Learn web development with our comprehensive tutorials and guides',
      ogImage: 'https://example.com/og-image.jpg',
      ogUrl: 'https://example.com',
      twitterCard: 'summary_large_image',
      twitterTitle: 'My Awesome Website',
      twitterDescription: 'Learn web development with our comprehensive tutorials',
      twitterImage: 'https://example.com/twitter-image.jpg',
      twitterSite: '@example',
      favicon: 'https://example.com/favicon.ico',
      themeColor: '#3b82f6',
      viewport: 'width=device-width, initial-scale=1.0',
      charset: 'UTF-8',
      lang: 'en'
    })
  }

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <Header 
          toolTitle="Meta Tag Generator" 
          toolDescription="Generate SEO-friendly meta tags for your website with Open Graph and Twitter Card support." 
        />

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <Button onClick={generateTags} className="shadow-sm hover:shadow-md transition-all duration-200">
              <span className="mr-2">🏷️</span>Generate Meta Tags
            </Button>
            <Button variant="outline" onClick={loadExample} className="shadow-sm hover:shadow-md transition-all duration-200">
              <span className="mr-2">📝</span>Load Example
            </Button>
          </div>
          
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={clearAll} className="shadow-sm hover:shadow-md transition-all duration-200 text-destructive hover:bg-destructive/5">
              <span className="mr-2">🗑️</span>Clear
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Meta Tag Information</h2>
            
            {/* Basic SEO */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-primary">Basic SEO</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Page Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter your page title (50-60 characters)"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter your page description (150-160 characters)"
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Keywords</label>
                  <input
                    type="text"
                    value={formData.keywords}
                    onChange={(e) => handleInputChange('keywords', e.target.value)}
                    placeholder="keyword1, keyword2, keyword3"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Author</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => handleInputChange('author', e.target.value)}
                    placeholder="Author name"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </div>

            {/* Open Graph */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-primary">Open Graph (Facebook)</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">OG Title</label>
                  <input
                    type="text"
                    value={formData.ogTitle}
                    onChange={(e) => handleInputChange('ogTitle', e.target.value)}
                    placeholder="Leave empty to use page title"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">OG Description</label>
                  <textarea
                    value={formData.ogDescription}
                    onChange={(e) => handleInputChange('ogDescription', e.target.value)}
                    placeholder="Leave empty to use page description"
                    rows={2}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">OG Image URL</label>
                  <input
                    type="url"
                    value={formData.ogImage}
                    onChange={(e) => handleInputChange('ogImage', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Page URL</label>
                  <input
                    type="url"
                    value={formData.canonical}
                    onChange={(e) => handleInputChange('canonical', e.target.value)}
                    placeholder="https://example.com/page"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </div>

            {/* Twitter Card */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-primary">Twitter Card</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Card Type</label>
                  <select
                    value={formData.twitterCard}
                    onChange={(e) => handleInputChange('twitterCard', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="summary">Summary</option>
                    <option value="summary_large_image">Summary with Large Image</option>
                    <option value="app">App</option>
                    <option value="player">Player</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Twitter Site</label>
                  <input
                    type="text"
                    value={formData.twitterSite}
                    onChange={(e) => handleInputChange('twitterSite', e.target.value)}
                    placeholder="@yourusername"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Output */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Generated Meta Tags</h2>
              {generatedTags && <CopyButton text={generatedTags} />}
            </div>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative h-96 lg:h-full min-h-96 border-2 border-border/50 rounded-lg bg-background/50 backdrop-blur-sm overflow-hidden">
                {generatedTags ? (
                  <pre className="p-4 text-sm font-mono overflow-auto h-full whitespace-pre-wrap">
                    {generatedTags}
                  </pre>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🏷️</div>
                      <div>Fill in the form and generate meta tags</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Basic SEO Tags', desc: 'Title, description, keywords, and author meta tags.', icon: '🔍' },
              { title: 'Open Graph Support', desc: 'Facebook and social media sharing optimization.', icon: '📘' },
              { title: 'Twitter Cards', desc: 'Twitter Card markup for better sharing.', icon: '🐦' },
              { title: 'Live Preview', desc: 'See generated tags in real-time.', icon: '👁️' },
              { title: 'Copy to Clipboard', desc: 'One-click copy of all generated tags.', icon: '📋' },
              { title: 'Example Data', desc: 'Load example data to get started quickly.', icon: '📝' },
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
      </div>
    </div>
  )
}
