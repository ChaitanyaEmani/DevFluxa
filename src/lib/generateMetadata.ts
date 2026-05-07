import type { Metadata } from 'next'

interface GenerateMetadataOptions {
  title: string
  description: string
  keywords?: string[]
  image?: string
}

export function generateMetadata(options: GenerateMetadataOptions): Metadata {
  const { title, description, keywords, image } = options
  
  return {
    title,
    description,
    keywords: keywords?.join(', '),
    openGraph: {
      title,
      description,
      type: 'website',
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}
