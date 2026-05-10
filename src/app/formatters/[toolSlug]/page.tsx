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
    { toolSlug: 'json-formatter' },
    { toolSlug: 'html-beautifier' },
    { toolSlug: 'css-formatter' }
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

  // Dynamic import of the tool component
  let ToolComponent
  try {
    switch (toolSlug) {
      case 'json-formatter':
        ToolComponent = (await import('@/components/tools/formatters/JsonFormatter')).JsonFormatter
        break
      case 'html-beautifier':
        ToolComponent = (await import('@/components/tools/formatters/HtmlBeautifier')).HtmlBeautifier
        break
      case 'css-formatter':
        ToolComponent = (await import('@/components/tools/formatters/CssFormatter')).CssFormatter
        break
      default:
        notFound()
    }
  } catch (error) {
    notFound()
  }

  return <ToolComponent />
}
