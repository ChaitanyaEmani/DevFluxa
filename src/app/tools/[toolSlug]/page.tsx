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
    { toolSlug: 'regex-tester' },
    { toolSlug: 'word-counter' },
    { toolSlug: 'password-generator' },
    { toolSlug: 'hash-generator' }
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

  // Static imports to avoid dynamic import issues
  switch (toolSlug) {
    case 'regex-tester':
      const { RegexTester } = await import('@/components/tools/other/RegexTester')
      return <RegexTester />
    case 'word-counter':
      const { WordCounter } = await import('@/components/tools/other/WordCounter')
      return <WordCounter />
    case 'password-generator':
      try {
        const passwordGeneratorModule = await import('@/components/tools/other/PasswordGenerator')
        const PasswordGenerator = passwordGeneratorModule.PasswordGenerator
        return <PasswordGenerator />
      } catch (error) {
        console.error('PasswordGenerator import error:', error)
        notFound()
      }
    case 'hash-generator':
      try {
        const hashGeneratorModule = await import('@/components/tools/other/HashGenerator')
        const HashGenerator = hashGeneratorModule.HashGenerator
        return <HashGenerator />
      } catch (error) {
        console.error('HashGenerator import error:', error)
        notFound()
      }
    default:
      notFound()
  }
}
