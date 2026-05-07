import { generateMetadata } from '@/lib/generateMetadata'
import { Code, Zap, Shield, Heart } from 'lucide-react'

export const metadata = generateMetadata({
  title: 'About Devfluxa - Free Developer Tools Platform',
  description: 'Learn about Devfluxa, your free online platform for developers offering formatters, converters, and essential tools.',
  keywords: ['about devfluxa', 'developer tools', 'free online tools', 'web development tools']
})

export default function AboutPage() {
  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About Devfluxa</h1>
          <p className="text-xl text-muted-foreground mb-4">
            Your trusted companion for development tasks
          </p>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none mb-12">
          <div className="bg-card p-8 rounded-lg border">
            <p className="text-lg leading-relaxed mb-4">
              Devfluxa is a comprehensive suite of free online tools designed specifically for developers, 
              designers, and anyone working with code and data. We believe that essential development tools 
              should be accessible, fast, and privacy-focused.
            </p>
            <p className="text-lg leading-relaxed">
              Built with modern web technologies, our platform processes everything locally in your browser, 
              ensuring your data never leaves your device. No server uploads, no tracking, just pure functionality.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
            <p className="text-muted-foreground">
              All tools run instantly in your browser with no server delays
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
            <p className="text-muted-foreground">
              Your data never leaves your browser - complete privacy guaranteed
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Code className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Developer Focused</h3>
            <p className="text-muted-foreground">
              Built by developers, for developers with real-world use cases
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Always Free</h3>
            <p className="text-muted-foreground">
              No subscriptions, no limits - all tools are completely free
            </p>
          </div>
        </div>

        <div className="bg-muted/50 p-8 rounded-lg mb-12">
          <h2 className="text-2xl font-semibold mb-6">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-3">📝 Code Formatters</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• JSON Formatter & Validator</li>
                <li>• SQL Query Formatter</li>
                <li>• HTML Beautifier</li>
                <li>• XML Formatter</li>
                <li>• CSS Formatter</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">🔄 Data Converters</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Base64 Encode/Decode</li>
                <li>• Timestamp Converter</li>
                <li>• YAML to JSON</li>
                <li>• RGB to HEX Converter</li>
                <li>• URL Encoder/Decoder</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">🛠️ Utility Tools</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Regex Tester</li>
                <li>• Word Counter</li>
                <li>• Password Generator</li>
                <li>• Hash Generator</li>
                <li>• QR Code Generator</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center p-8 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-lg text-muted-foreground mb-6">
            To provide developers with the essential tools they need, 
            accessible anytime, anywhere, without compromising on privacy or performance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact" 
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Get in Touch
            </a>
            <a 
              href="/" 
              className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Explore Tools
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
