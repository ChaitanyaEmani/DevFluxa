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
    { toolSlug: 'base64-encode-decode' },
    { toolSlug: 'timestamp-converter' },
    { toolSlug: 'yaml-to-json' },
    { toolSlug: 'rgb-to-hex' },
    { toolSlug: 'url-encoder' }
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
    title: `${tool.name} - Free Online ${tool.category === 'formatter' ? 'Formatter' : 'Converter'} Tool`,
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

  // Dynamic import of the converter component
  let ConverterComponent
  try {
    switch (toolSlug) {
      case 'base64-encode-decode':
        ConverterComponent = (await import('@/components/tools/converters/Base64EncodeDecode')).Base64EncodeDecode
        break
      case 'timestamp-converter':
        ConverterComponent = (await import('@/components/tools/converters/TimestampConverter')).TimestampConverter
        break
      case 'rgb-to-hex':
        ConverterComponent = (await import('@/components/tools/converters/RgbToHex')).RgbToHex
        break
      case 'url-encoder':
        ConverterComponent = (await import('@/components/tools/converters/UrlEncoder')).UrlEncoder
        break
      case 'yaml-to-json':
        ConverterComponent = (await import('@/components/tools/converters/YamlToJson')).YamlToJson
        break
      default:
        notFound()
    }
  } catch (error) {
    notFound()
  }

  return <ConverterComponent />
}
