export interface XmlError {
  message: string
  line: number | null
  column: number | null
}

export interface XmlNode {
  type: 'element' | 'text' | 'comment' | 'cdata'
  name?: string
  attributes?: Record<string, string>
  children?: XmlNode[]
  value?: string
}

export function parseXML(xml: string): XmlNode | null {
  try {
    // Simple XML parser - in production you'd want a more robust parser
    const parser = new DOMParser()
    const doc = parser.parseFromString(xml, 'text/xml')
    
    if (doc.getElementsByTagName('parsererror').length > 0) {
      throw new Error('Invalid XML syntax')
    }
    
    const elementNode = doc.documentElement
    return domNodeToXmlNode(elementNode)
  } catch (error) {
    throw new Error(`XML parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

function domNodeToXmlNode(node: Element): XmlNode {
  const result: XmlNode = {
    type: 'element',
    name: node.tagName,
    attributes: {}
  }
  
  // Get attributes
  for (let i = 0; i < node.attributes.length; i++) {
    const attr = node.attributes[i]
    if (result.attributes) {
      result.attributes[attr.name] = attr.value
    }
  }
  
  // Get children
  const children: XmlNode[] = []
  for (let i = 0; i < node.childNodes.length; i++) {
    const child = node.childNodes[i]
    
    if (child.nodeType === Node.ELEMENT_NODE) {
      children.push(domNodeToXmlNode(child as Element))
    } else if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent?.trim()
      if (text) {
        children.push({
          type: 'text',
          value: text
        })
      }
    } else if (child.nodeType === Node.COMMENT_NODE) {
      children.push({
        type: 'comment',
        value: child.textContent || ''
      })
    } else if (child.nodeType === Node.CDATA_SECTION_NODE) {
      children.push({
        type: 'cdata',
        value: child.textContent || ''
      })
    }
  }
  
  if (children.length > 0) {
    result.children = children
  }
  
  return result
}

export function formatXML(node: XmlNode, indent: number = 0): string {
  const spaces = '  '.repeat(indent)
  let result = ''
  
  if (node.type === 'element') {
    const attrs = node.attributes ? Object.entries(node.attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ') : ''
    
    if (node.children && node.children.length > 0) {
      result += `${spaces}<${node.name}${attrs ? ' ' + attrs : ''}>\n`
      
      for (const child of node.children) {
        result += formatXML(child, indent + 1)
      }
      
      result += `${spaces}</${node.name}>\n`
    } else {
      result += `${spaces}<${node.name}${attrs ? ' ' + attrs : ''} />\n`
    }
  } else if (node.type === 'text') {
    result += `${spaces}${node.value}\n`
  } else if (node.type === 'comment') {
    result += `${spaces}<!--${node.value}-->\n`
  } else if (node.type === 'cdata') {
    result += `${spaces}<![CDATA[${node.value}]]>\n`
  }
  
  return result
}

export function minifyXML(xml: string): string {
  try {
    return xml
      .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
      .replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, (match) => match.replace(/\s+/g, ' ')) // Minify CDATA
      .replace(/>\s+</g, '><') // Remove whitespace between tags
      .replace(/\s+/g, ' ') // Collapse remaining whitespace
      .trim()
  } catch (error) {
    return xml // Return original if minification fails
  }
}

export function getExampleXML(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book category="fiction">
    <title lang="en">The Great Gatsby</title>
    <author>F. Scott Fitzgerald</author>
    <year>1925</year>
    <price>10.99</price>
  </book>
  <book category="non-fiction">
    <title lang="en">A Brief History of Time</title>
    <author>Stephen Hawking</author>
    <year>1988</year>
    <price>14.99</price>
  </book>
  <!-- This is a comment -->
  <metadata>
    <store_name>City Books</store_name>
    <location>New York</location>
  </metadata>
</bookstore>`
}