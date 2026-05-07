import { generateMetadata } from '@/lib/generateMetadata'
import { ToolCard } from '@/components/ui/ToolCard'
import { getToolsByCategory } from '@/config/tools'

export const metadata = generateMetadata({
  title: 'Formatters - Free Online Code Formatting Tools',
  description: 'Format and beautify your code with our collection of professional formatters. JSON, SQL, HTML, XML, CSS and more.',
  keywords: ['code formatter', 'JSON formatter', 'SQL formatter', 'HTML beautifier', 'XML formatter', 'CSS formatter', 'online formatter']
})

export default function FormattersPage() {
  const formatters = getToolsByCategory('formatter')

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Code Formatters</h1>
          <p className="text-xl text-muted-foreground mb-4">
            Professional tools to format and beautify your code
          </p>
          <p className="text-muted-foreground">
            Transform messy code into clean, readable, and properly formatted files. 
            Our formatters support multiple languages and formats with customizable options.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formatters.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>

        <div className="mt-16 p-6 bg-muted/50 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Why Use Our Formatters?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">🎯 Precision Formatting</h3>
              <p className="text-sm text-muted-foreground">
                Industry-standard formatting rules for consistent code structure
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">⚡ Instant Results</h3>
              <p className="text-sm text-muted-foreground">
                Format your code in real-time with no server delays
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">🔒 Privacy First</h3>
              <p className="text-sm text-muted-foreground">
                All processing happens in your browser - your code never leaves your device
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">🎨 Customizable</h3>
              <p className="text-sm text-muted-foreground">
                Adjust indentation, line breaks, and formatting options to your preference
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
