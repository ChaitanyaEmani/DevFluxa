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
    { toolSlug: 'word-counter' },
    { toolSlug: 'password-generator' },
    { toolSlug: 'hash-generator' },
    { toolSlug: 'uuid-generator' },
    { toolSlug: 'meta-tag-generator' },
    { toolSlug: 'fake-user-data-generator' },
    { toolSlug: 'cron-expression-generator' },
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
      case 'word-counter':
        ToolComponent = (await import('@/components/tools/other/WordCounter')).WordCounter
        break
      case 'password-generator':
        ToolComponent = (await import('@/components/tools/other/PasswordGenerator')).PasswordGenerator
        break
      case 'hash-generator':
        ToolComponent = (await import('@/components/tools/other/HashGenerator')).HashGenerator
        break
      case 'uuid-generator':
        ToolComponent = (await import('@/components/tools/other/UuidGenerator')).UuidGenerator
        break
      case 'meta-tag-generator':
        ToolComponent = (await import('@/components/tools/other/MetaTagGenerator')).MetaTagGenerator
        break
      case 'fake-user-data-generator':
        ToolComponent = (await import('@/components/tools/other/FakeUserDataGenerator')).FakeUserDataGenerator
        break
      case 'javascript-validator':
        ToolComponent = (await import('@/components/tools/validators/JavaScriptValidator')).JavaScriptValidator
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
