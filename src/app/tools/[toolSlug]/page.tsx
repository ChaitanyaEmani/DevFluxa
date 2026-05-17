import { notFound } from 'next/navigation'
import { generateMetadata as generatePageMetadata } from '@/lib/generateMetadata'
import { getToolById } from '@/config/tools'

interface ToolPageProps {
  params: Promise<{
    toolSlug: string
  }>
}

export async function generateStaticParams() {
  return [
    {toolSlug: 'json-formatter'},
    {toolSlug: 'css-formatter'},
    {toolSlug: 'html-beautifier'}, 
    {toolSlug: 'xml-formatter'},
    {toolSlug: 'javascript-formatter'},
    {toolSlug: 'timestamp-converter'},
    {toolSlug: 'rgbtohex-converter'},
    {toolSlug: 'jwt-decoder'},
    {toolSlug: 'text-to-binary'},
    { toolSlug: 'word-counter' },
    { toolSlug: 'password-generator' },
    { toolSlug: 'hash-generator' },
    { toolSlug: 'meta-tag-generator' },
    { toolSlug: 'fake-user-data-generator' },
    { toolSlug: 'javascript-validator' }
  ]
}

export async function generateMetadata({ params }: ToolPageProps) {
  const { toolSlug } = await params
  const tool = getToolById(toolSlug)
  
  if (!tool) {
    return {
      title: 'Tool Not Found',
      description: 'The requested tool could not be found.'
    }
  }

  return generatePageMetadata({
    title: `${tool.name} - Free Online ${tool.category === 'formatter' ? 'Formatter' : tool.category === 'converter' ? 'Converter' : 'Tool'}`,
    description: tool.description,
    keywords: [tool.name.toLowerCase(), tool.category, 'online tool', 'free']
  })
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { toolSlug } = await params
  const tool = getToolById(toolSlug)

  if (!tool) {
    notFound()
  }

  // Dynamic import of tool component
  let ToolComponent
  try {
    switch (toolSlug) {
      case 'json-formatter':
        ToolComponent = (await import('@/app/components/formatters/JsonFormatter')).JsonFormatter
        break
      case 'css-formatter':
        ToolComponent = (await import('@/app/components/formatters/CssFormatter')).CssFormatter
        break
      case 'html-beautifier':
        ToolComponent = (await import('@/app/components/formatters/HtmlBeautifier')).HtmlBeautifier
        break
      case 'xml-formatter':
        ToolComponent = (await import('@/app/components/formatters/XmlFormatter')).XmlFormatter
        break
      case 'javascript-formatter':
        ToolComponent = (await import('@/app/components/formatters/JavaScriptFormatter')).JavaScriptFormatter
        break
      case 'timestamp-converter':
        ToolComponent = (await import('@/app/components/converters/TimestampConverter')).TimestampConverter
        break
      case 'rgbtohex-converter':
        ToolComponent = (await import('@/app/components/converters/RgbToHex')).RgbToHex
        break
      case 'jwt-decoder':
        ToolComponent = (await import('@/app/components/converters/JwtDecoder')).JwtDecoder
        break
      case 'text-to-binary':
        ToolComponent = (await import('@/app/components/converters/TextToBinary')).TextToBinary
        break
      case 'word-counter':
        ToolComponent = (await import('@/app/components/generators/WordCounter')).WordCounter
        break
      case 'password-generator':
        ToolComponent = (await import('@/app/components/generators/PasswordGenerator')).PasswordGenerator
        break
      case 'hash-generator':
        ToolComponent = (await import('@/app/components/generators/HashGenerator')).HashGenerator
        break
      case 'meta-tag-generator':
        ToolComponent = (await import('@/app/components/generators/MetaTagGenerator')).MetaTagGenerator
        break
      case 'fake-user-data-generator':
        ToolComponent = (await import('@/app/components/generators/FakeUserDataGenerator')).FakeUserDataGenerator
        break
      case 'javascript-validator':
        ToolComponent = (await import('@/app/components/validators/JavaScriptValidator')).JavaScriptValidator
        break
      default:
        notFound()
    }
  } catch (error) {
    console.error('Tool import error:', error)
    notFound()
  }

  return <ToolComponent />
}
