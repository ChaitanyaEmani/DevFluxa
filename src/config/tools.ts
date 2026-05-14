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
    path: '/formatters/json-formatter',
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
    path: '/formatters/html-beautifier'
  },
  {
    id: 'css-formatter',
    name: 'CSS Formatter',
    description: 'Format and beautify CSS code with proper structure',
    category: 'formatter',
    icon: 'Palette',
    color: 'bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300',
    tag: 'Styling',
    path: '/formatters/css-formatter'
  },
  {
    id: 'javascript-formatter',
    name: 'JavaScript Formatter',
    description: 'Format and beautify JavaScript code with proper indentation and syntax',
    category: 'formatter',
    icon: 'Code',
    color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300',
    tag: 'Popular',
    path: '/formatters/javascript-formatter',
    popular: true
  },
  {
    id: 'sql-formatter',
    name: 'SQL Formatter',
    description: 'Format SQL queries with proper indentation and structure',
    category: 'formatter',
    icon: 'Database',
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
    tag: 'Database',
    path: '/formatters/sql-formatter'
  },
  {
    id: 'xml-formatter',
    name: 'XML Formatter',
    description: 'Format and validate XML documents with proper indentation',
    category: 'formatter',
    icon: 'FileCode',
    color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
    tag: 'Data',
    path: '/formatters/xml-formatter'
  },
  {
    id: 'markdown-formatter',
    name: 'Markdown Formatter',
    description: 'Format and beautify Markdown text with proper structure',
    category: 'formatter',
    icon: 'FileText',
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-300',
    tag: 'Writing',
    path: '/formatters/markdown-formatter'
  },
  {
    id: 'timestamp-converter',
    name: 'Timestamp Converter',
    description: 'Convert between Unix timestamps and human-readable dates',
    category: 'converter',
    icon: 'Clock',
    color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300',
    tag: 'Time Utility',
    path: '/converters/timestamp-converter'
  },
  {
    id: 'rgb-to-hex',
    name: 'RGB to HEX',
    description: 'Convert RGB colors to HEX color codes',
    category: 'converter',
    icon: 'Droplet',
    color: 'bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-300',
    tag: 'Design',
    path: '/converters/rgb-to-hex'
  },
  {
    id: 'jwt-decoder',
    name: 'JWT Decoder',
    description: 'Decode and validate JSON Web Tokens (JWT) with header and payload information',
    category: 'converter',
    icon: 'Shield',
    color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300',
    tag: 'Security',
    path: '/converters/jwt-decoder',
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
    path: '/converters/text-to-binary'
  },
  {
    id: 'timezone-converter',
    name: 'Timezone Converter',
    description: 'Convert time between different timezones instantly',
    category: 'converter',
    icon: 'Globe',
    color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900 dark:text-cyan-300',
    tag: 'Time',
    path: '/converters/timezone-converter'
  },
  {
    id: 'date-difference-calculator',
    name: 'Date Difference Calculator',
    description: 'Calculate the difference between two dates in various units',
    category: 'converter',
    icon: 'Calendar',
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300',
    tag: 'Date',
    path: '/converters/date-difference-calculator'
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
    id: 'uuid-generator',
    name: 'UUID Generator',
    description: 'Generate unique UUIDs in various formats (v1, v4)',
    category: 'other',
    icon: 'Hash',
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
    tag: 'ID',
    path: '/tools/uuid-generator'
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
