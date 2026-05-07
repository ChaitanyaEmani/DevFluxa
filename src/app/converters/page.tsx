import { generateMetadata } from '@/lib/generateMetadata'
import { ToolCard } from '@/components/ui/ToolCard'
import { getToolsByCategory } from '@/config/tools'

export const metadata = generateMetadata({
  title: 'Converters - Free Online Data Conversion Tools',
  description: 'Convert between different data formats instantly. Base64, timestamps, YAML to JSON, RGB to HEX, URL encoding and more.',
  keywords: ['data converter', 'Base64 encoder', 'timestamp converter', 'YAML to JSON', 'RGB to HEX', 'URL encoder', 'online converter']
})

export default function ConvertersPage() {
  const converters = getToolsByCategory('converter')

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Data Converters</h1>
          <p className="text-xl text-muted-foreground mb-4">
            Transform data between different formats seamlessly
          </p>
          <p className="text-muted-foreground">
            Convert between various data formats, encodings, and representations. 
            Perfect for developers, designers, and anyone working with different data types.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {converters.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>

        <div className="mt-16 p-6 bg-muted/50 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Conversion Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">🔄 Bidirectional</h3>
              <p className="text-sm text-muted-foreground">
                Convert back and forth between formats with ease
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">⚡ Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">
                Instant conversions with real-time preview
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">🔒 Secure Processing</h3>
              <p className="text-sm text-muted-foreground">
                All conversions happen locally in your browser
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">📋 Easy Copy</h3>
              <p className="text-sm text-muted-foreground">
                One-click copy to clipboard for converted results
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Popular Use Cases</h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Web Development</p>
                <p className="text-sm text-muted-foreground">
                  Encode URLs for safe transmission, convert colors between RGB and HEX
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Data Processing</p>
                <p className="text-sm text-muted-foreground">
                  Convert YAML configurations to JSON, encode data in Base64
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <div>
                <p className="font-medium">API Integration</p>
                <p className="text-sm text-muted-foreground">
                  Convert timestamps, encode URLs for API requests
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
