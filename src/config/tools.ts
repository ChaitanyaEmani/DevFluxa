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
    id: 'sql-formatter',
    name: 'SQL Formatter',
    description: 'Format SQL queries with proper indentation and keyword highlighting',
    category: 'formatter',
    icon: 'Database',
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
    tag: 'Database',
    path: '/formatters/sql-formatter'
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
    id: 'xml-formatter',
    name: 'XML Formatter',
    description: 'Format XML files with proper indentation and structure',
    category: 'formatter',
    icon: 'FileCode',
    color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
    tag: 'Data',
    path: '/formatters/xml-formatter'
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

  // Converters
  {
    id: 'base64-encode-decode',
    name: 'Base64 Encode/Decode',
    description: 'Encode and decode Base64 strings instantly',
    category: 'converter',
    icon: 'Shield',
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
    tag: 'Security',
    path: '/converters/base64-encode-decode',
    popular: true
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
    id: 'yaml-to-json',
    name: 'YAML to JSON',
    description: 'Convert YAML configuration files to JSON format',
    category: 'converter',
    icon: 'FileJson',
    color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300',
    tag: 'Config',
    path: '/converters/yaml-to-json'
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
    id: 'url-encoder',
    name: 'URL Encoder',
    description: 'Encode and decode URLs for safe transmission',
    category: 'converter',
    icon: 'Link',
    color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900 dark:text-cyan-300',
    tag: 'Web',
    path: '/converters/url-encoder'
  },

  // Other Tools
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    description: 'Test and debug regular expressions with real-time matching',
    category: 'other',
    icon: 'Search',
    color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
    tag: 'Coding',
    path: '/tools/regex-tester',
    popular: true
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
    id: 'qr-code-generator',
    name: 'QR Code Generator',
    description: 'Generate QR codes from text or URLs',
    category: 'other',
    icon: 'QrCode',
    color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300',
    tag: 'Utility',
    path: '/tools/qr-code-generator'
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
