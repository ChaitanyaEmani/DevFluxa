'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Star, Zap, Shield, Code } from 'lucide-react'
import { ToolCard } from '@/app/components/ui/ToolCard'
import { tools, getPopularTools } from '@/config/tools'

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  const categories = [
    { id: 'all', name: 'All' },
    { id: 'formatter', name: 'Formatters' },
    { id: 'converter', name: 'Converters' },
    { id: 'other', name: 'Other Tools' }
  ]
  
  const filteredTools = selectedCategory === 'all' 
    ? tools.slice(0, 6) 
    : tools.filter(tool => tool.category === selectedCategory).slice(0, 6)
  
  const popularTools = getPopularTools()

  return (
    <>
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-background to-muted/20 py-20">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Star className="w-4 h-4 mr-2" />
                New tools added weekly
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                Free Online <span className="text-primary">Developer Tools</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Simple, fast, and free utilities for developers and creators. No registration, no tracking—just pure browser-based tools.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="#tools"
                  className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Explore 50+ Tools
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
                <Link 
                  href="#features"
                  className="inline-flex items-center px-6 py-3 border border-border bg-background hover:bg-muted transition-colors rounded-lg font-medium"
                >
                  Watch Tutorial
                </Link>
              </div>
              
              <div className="mt-12 p-4 bg-muted/50 rounded-lg max-w-md mx-auto">
                <p className="text-sm text-muted-foreground">ADVERTISEMENT</p>
              </div>
            </div>
          </div>
        </section>

        {/* Essential Utilities Section */}
        <section id="tools" className="py-20">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Essential Utilities
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Boost your productivity with our most popular developer tools, optimized for performance and ease of use.
              </p>
            </div>
            
            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            
            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
              
              {/* Request a Tool Card */}
              <div className="bg-muted/30 rounded-lg border p-6 flex flex-col items-center justify-center text-center">
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center mb-4">
                  <Code className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Request a Tool</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Don't see what you need? Suggest a new tool and we'll build it.
                </p>
                <Link 
                  href="/contact"
                  className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Suggest Tool
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Built for Developers Who Value Speed & Privacy
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No Latency. All Browser</h3>
                <p className="text-muted-foreground">
                  All tools run entirely in your browser. No server calls, no waiting, no data leaves your device.
                </p>
              </div>
              
              <div className="text-center">
                <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Zero Data Storage</h3>
                <p className="text-muted-foreground">
                  We don't store, track, or analyze your data. What you process stays private and secure.
                </p>
              </div>
              
              <div className="text-center">
                <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
                  <Star className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
                <h3 className="font-semibold text-lg mb-2">SEO Optimized & Clean</h3>
                <p className="text-muted-foreground">
                  Minimal distractions, no ads, and full dark mode support for the best developer experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to streamline your workflow?
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of developers using our tools daily. Fast, free, and always improving.
            </p>
            <Link 
              href="#tools"
              className="inline-flex items-center px-6 py-3 bg-background text-foreground rounded-lg font-medium hover:bg-muted transition-colors"
            >
              Start Using Tools Now
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
