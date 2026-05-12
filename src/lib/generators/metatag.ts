export interface MetaTagData {
  title: string
  description: string
  keywords: string
  author: string
  robots: string
  canonical: string
  ogTitle: string
  ogDescription: string
  ogImage: string
  ogUrl: string
  twitterCard: string
  twitterTitle: string
  twitterDescription: string
  twitterImage: string
  twitterSite: string
  favicon: string
  themeColor: string
  viewport: string
  charset: string
  lang: string
}

export function generateMetaTags(data: MetaTagData): string {
  const tags: string[] = []
  
  // Basic meta tags
  if (data.charset) tags.push(`<meta charset="${data.charset}">`)
  if (data.viewport) tags.push(`<meta name="viewport" content="${data.viewport}">`)
  if (data.title) tags.push(`<title>${data.title}</title>`)
  if (data.description) tags.push(`<meta name="description" content="${data.description}">`)
  if (data.keywords) tags.push(`<meta name="keywords" content="${data.keywords}">`)
  if (data.author) tags.push(`<meta name="author" content="${data.author}">`)
  if (data.robots) tags.push(`<meta name="robots" content="${data.robots}">`)
  if (data.canonical) tags.push(`<link rel="canonical" href="${data.canonical}">`)
  if (data.lang) tags.push(`<html lang="${data.lang}">`)
  
  // Open Graph tags
  if (data.ogTitle || data.title) tags.push(`<meta property="og:title" content="${data.ogTitle || data.title}">`)
  if (data.ogDescription || data.description) tags.push(`<meta property="og:description" content="${data.ogDescription || data.description}">`)
  if (data.ogImage) tags.push(`<meta property="og:image" content="${data.ogImage}">`)
  if (data.ogUrl || data.canonical) tags.push(`<meta property="og:url" content="${data.ogUrl || data.canonical}">`)
  tags.push('<meta property="og:type" content="website">')
  
  // Twitter Card tags
  if (data.twitterCard) tags.push(`<meta name="twitter:card" content="${data.twitterCard}">`)
  if (data.twitterTitle || data.title) tags.push(`<meta name="twitter:title" content="${data.twitterTitle || data.title}">`)
  if (data.twitterDescription || data.description) tags.push(`<meta name="twitter:description" content="${data.twitterDescription || data.description}">`)
  if (data.twitterImage || data.ogImage) tags.push(`<meta name="twitter:image" content="${data.twitterImage || data.ogImage}">`)
  if (data.twitterSite) tags.push(`<meta name="twitter:site" content="${data.twitterSite}">`)
  
  // Additional meta tags
  if (data.favicon) tags.push(`<link rel="icon" href="${data.favicon}">`)
  if (data.themeColor) tags.push(`<meta name="theme-color" content="${data.themeColor}">`)
  
  return tags.join('\n')
}