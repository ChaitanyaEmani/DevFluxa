export interface Tool {
  id: string
  name: string
  description: string
  category: 'formatter' | 'converter' | 'other'
  icon: string
  color: string
  tag: string
  path: string
  popular?: boolean
}

export const tools: Tool[] = [
  // Formatters
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Format and validate JSON data with proper indentation and syntax highlighting',
    category: 'formatter',
    icon: 'Braces',
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
    tag: 'Most Popular',
    path: '/tools/json-formatter',
    popular: true
  },
  {
    id: 'html-beautifier',
    name: 'HTML Beautifier',
    description: 'Format and beautify HTML code with proper indentation',
    category: 'formatter',
    icon: 'Code2',
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300',
    tag: 'Web Dev',
    path: '/tools/html-beautifier'
  },
  {
    id: 'css-formatter',
    name: 'CSS Formatter',
    description: 'Format and beautify CSS code with proper structure',
    category: 'formatter',
    icon: 'Palette',
    color: 'bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300',
    tag: 'Styling',
    path: '/tools/css-formatter'
  },
  {
    id: 'javascript-formatter',
    name: 'JavaScript Formatter',
    description: 'Format and beautify JavaScript code with proper indentation and syntax',
    category: 'formatter',
    icon: 'Code',
    color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300',
    tag: 'Popular',
    path: '/tools/javascript-formatter',
    popular: true
  },
  {
    id: 'xml-formatter',
    name: 'XML Formatter',
    description: 'Format and validate XML documents with proper indentation',
    category: 'formatter',
    icon: 'FileCode',
    color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
    tag: 'Data',
    path: '/tools/xml-formatter'
  },
  {
    id: 'timestamp-converter',
    name: 'Timestamp Converter',
    description: 'Convert between Unix timestamps and human-readable dates',
    category: 'converter',
    icon: 'Clock',
    color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300',
    tag: 'Time Utility',
    path: '/tools/timestamp-converter'
  },
  {
    id: 'rgb-to-hex',
    name: 'RGB to HEX',
    description: 'Convert RGB colors to HEX color codes',
    category: 'converter',
    icon: 'Droplet',
    color: 'bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-300',
    tag: 'Design',
    path: '/tools/rgbtohex-converter'
  },
  {
    id: 'jwt-decoder',
    name: 'JWT Decoder',
    description: 'Decode and validate JSON Web Tokens (JWT) with header and payload information',
    category: 'converter',
    icon: 'Shield',
    color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300',
    tag: 'Security',
    path: '/tools/jwt-decoder',
    popular: true
  },
  {
    id: 'text-to-binary',
    name: 'Text to Binary',
    description: 'Convert text to binary code and vice versa',
    category: 'converter',
    icon: 'Binary',
    color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300',
    tag: 'Encoding',
    path: '/tools/text-to-binary'
  },
  {
    id: 'word-counter',
    name: 'Word Counter',
    description: 'Count words, characters, and reading time of your text',
    category: 'other',
    icon: 'FileText',
    color: 'bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300',
    tag: 'Content',
    path: '/tools/word-counter'
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    description: 'Generate secure passwords with customizable options',
    category: 'other',
    icon: 'Key',
    color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300',
    tag: 'Security',
    path: '/tools/password-generator'
  },
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    description: 'Generate MD5, SHA1, SHA256 hashes of your text',
    category: 'other',
    icon: 'Fingerprint',
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
    tag: 'Security',
    path: '/tools/hash-generator'
  },
  {
    id: 'meta-tag-generator',
    name: 'Meta Tag Generator',
    description: 'Generate SEO-friendly meta tags for your website',
    category: 'other',
    icon: 'Tag',
    color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
    tag: 'SEO',
    path: '/tools/meta-tag-generator'
  },
  {
    id: 'fake-user-data-generator',
    name: 'Fake User Data Generator',
    description: 'Generate realistic fake user data for testing and development',
    category: 'other',
    icon: 'Users',
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300',
    tag: 'Testing',
    path: '/tools/fake-user-data-generator'
  },
  {
    id: 'javascript-validator',
    name: 'JavaScript Validator',
    description: 'Validate JavaScript code for syntax errors, reference errors, and common issues',
    category: 'other',
    icon: 'CheckCircle',
    color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300',
    tag: 'Code Quality',
    path: '/tools/javascript-validator',
    popular: true
  }
]

export const getToolsByCategory = (category: string) => {
  return tools.filter(tool => tool.category === category)
}

export const getPopularTools = () => {
  return tools.filter(tool => tool.popular)
}

export const getToolById = (id: string) => {
  return tools.find(tool => tool.id === id)
}
