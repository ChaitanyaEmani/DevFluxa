import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Code, Database, Palette, Clock, Link2, FileText, Hash, Shield, Search } from 'lucide-react'

export const metadata: Metadata = {
  title: 'All Developer Tools - DevFluxa',
  description: 'Complete collection of free online developer tools for formatting, converting, and validating data.',
}

const tools = [
  {
    category: 'Formatters',
    description: 'Format and beautify your code with proper indentation and structure.',
    icon: Code,
    items: [
      {
        name: 'JSON Formatter',
        description: 'Format, validate, and minify JSON data with proper indentation',
        href: '/formatters/json-formatter',
        features: ['Syntax Validation', 'Error Detection', 'Pretty Print', 'Minify Option']
      },
      {
        name: 'HTML Beautifier',
        description: 'Format HTML code with proper indentation and structure',
        href: '/formatters/html-beautifier',
        features: ['Tag Validation', 'Proper Nesting', 'Comment Handling', 'Structure Preservation']
      },
      {
        name: 'CSS Formatter',
        description: 'Format CSS with consistent indentation and property organization',
        href: '/formatters/css-formatter',
        features: ['Selector Formatting', 'Property Alignment', 'Brace Formatting', 'Validation']
      }
    ]
  },
  {
    category: 'Converters',
    description: 'Convert between different data formats and types.',
    icon: Database,
    items: [
      {
        name: 'Base64 Encode/Decode',
        description: 'Encode and decode Base64 strings for safe data transmission',
        href: '/converters/base64-encode-decode',
        features: ['Bidirectional', 'Unicode Support', 'Instant Processing', 'Validation']
      },
      {
        name: 'Timestamp Converter',
        description: 'Convert between Unix timestamps and human-readable dates',
        href: '/converters/timestamp-converter',
        features: ['Real-time Updates', 'Multiple Formats', 'Range Validation', 'Current Time']
      },
      {
        name: 'RGB to HEX Converter',
        description: 'Convert RGB colors to HEX format with live preview',
        href: '/converters/rgb-to-hex',
        features: ['Live Preview', 'Color Validation', 'Bidirectional', '3/6-digit Support']
      },
      {
        name: 'URL Encoder',
        description: 'Encode and decode URLs for safe transmission',
        href: '/converters/url-encoder',
        features: ['Special Characters', 'Safe Transmission', 'Bidirectional', 'Format Validation']
      }
    ]
  },
  {
    category: 'Other Tools',
    description: 'Utility tools for developers and content creators.',
    icon: Search,
    items: [
      {
        name: 'Regex Tester',
        description: 'Test and debug regular expressions with real-time matching and highlighting',
        href: '/tools/regex-tester',
        features: ['Real-time Testing', 'Pattern Highlighting', 'Common Patterns', 'Match Groups']
      },
      {
        name: 'Word Counter',
        description: 'Count words, characters, and reading time of your text',
        href: '/tools/word-counter',
        features: ['Word Count', 'Character Count', 'Reading Time', 'Text Analysis']
      },
      {
        name: 'Password Generator',
        description: 'Generate secure passwords with customizable options',
        href: '/tools/password-generator',
        features: ['Custom Length', 'Character Types', 'Secure Generation', 'Copy to Clipboard']
      },
      {
        name: 'Hash Generator',
        description: 'Generate MD5, SHA1, SHA256 hashes of your text',
        href: '/tools/hash-generator',
        features: ['Multiple Algorithms', 'Instant Hashing', 'Copy Results', 'Text Input']
      }
    ]
  }
]

export default function ToolsPage() {
  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">All Developer Tools</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive collection of free online tools for developers. Privacy-focused, fast, and reliable.
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>100% Private</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Instant Results</span>
            </div>
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              <span>No Tracking</span>
            </div>
          </div>
        </div>

        {tools.map((category, categoryIndex) => (
          <section key={categoryIndex} className="mb-16">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <category.icon className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">{category.category}</h2>
              </div>
              <p className="text-muted-foreground text-lg">{category.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.items.map((tool, toolIndex) => (
                <Link
                  key={toolIndex}
                  href={tool.href}
                  className="group block p-6 border rounded-lg hover:border-primary/50 hover:shadow-lg transition-all duration-200 bg-card"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {tool.name}
                    </h3>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {tool.description}
                  </p>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Features:</p>
                    <div className="flex flex-wrap gap-1">
                      {tool.features.map((feature, featureIndex) => (
                        <span
                          key={featureIndex}
                          className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <span className="text-xs text-primary font-medium">
                      Use Tool →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <section className="mt-16 p-8 bg-muted/50 rounded-lg">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Why Choose DevFluxa Tools?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Privacy First</h4>
                <p className="text-sm text-muted-foreground">
                  All processing happens locally in your browser. We never see or store your data.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Lightning Fast</h4>
                <p className="text-sm text-muted-foreground">
                  Instant results with no server delays. Process data immediately in your browser.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Always Free</h4>
                <p className="text-sm text-muted-foreground">
                  No registration, no limits, no ads. Just powerful developer tools, forever free.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
