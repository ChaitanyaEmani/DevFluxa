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
    { toolSlug: 'timestamp-converter' },
    { toolSlug: 'rgb-to-hex' },
    { toolSlug: 'jwt-decoder' },
    { toolSlug: 'text-to-binary' },
    { toolSlug: 'binary-to-text' },
    { toolSlug: 'timezone-converter' },
    { toolSlug: 'date-difference-calculator' }
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
      case 'timestamp-converter':
        ConverterComponent = (await import('@/components/tools/converters/TimestampConverter')).TimestampConverter
        break
      case 'rgb-to-hex':
        ConverterComponent = (await import('@/components/tools/converters/RgbToHex')).RgbToHex
        break
      case 'jwt-decoder':
        ConverterComponent = (await import('@/components/tools/converters/JwtDecoder')).JwtDecoder
        break
      case 'text-to-binary':
        ConverterComponent = (await import('@/components/tools/converters/TextToBinary')).TextToBinary
        break
      case 'timezone-converter':
        ConverterComponent = (await import('@/components/tools/converters/TimezoneConverter')).TimezoneConverter
        break
      case 'date-difference-calculator':
        ConverterComponent = (await import('@/components/tools/converters/DateDifferenceCalculator')).DateDifferenceCalculator
        break
      default:
        notFound()
    }
  } catch (error) {
    notFound()
  }

  return <ConverterComponent />
}
