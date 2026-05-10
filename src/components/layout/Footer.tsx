import Link from 'next/link'
// import { Github, Twitter, Linkedin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">D</span>
              </div>
              <span className="font-bold text-xl">Devfluxa</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Simple, fast, and free tools for developers and creators. No registration required, no ads, just pure productivity.
            </p>
            <div className="flex space-x-4">
              {/* <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <GitHub className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <LinkedIn className="h-5 w-5" />
              </Link> */}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Formatters</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/formatters/json-formatter" className="text-muted-foreground hover:text-foreground transition-colors">JSON Formatter</Link></li>
              <li><Link href="/formatters/sql-formatter" className="text-muted-foreground hover:text-foreground transition-colors">SQL Formatter</Link></li>
              <li><Link href="/formatters/html-beautifier" className="text-muted-foreground hover:text-foreground transition-colors">HTML Beautifier</Link></li>
              <li><Link href="/formatters/xml-formatter" className="text-muted-foreground hover:text-foreground transition-colors">XML Formatter</Link></li>
              <li><Link href="/formatters/css-formatter" className="text-muted-foreground hover:text-foreground transition-colors">CSS Formatter</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Converters</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/converters/base64-encode-decode" className="text-muted-foreground hover:text-foreground transition-colors">Base64 Encode/Decode</Link></li>
              <li><Link href="/converters/timestamp-converter" className="text-muted-foreground hover:text-foreground transition-colors">Timestamp Converter</Link></li>
              <li><Link href="/converters/rgb-to-hex" className="text-muted-foreground hover:text-foreground transition-colors">RGB to HEX</Link></li>
              <li><Link href="/converters/url-encoder" className="text-muted-foreground hover:text-foreground transition-colors">URL Encoder</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t text-center sm:text-left">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 Devfluxa. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Made with ❤️ for the developer community
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
