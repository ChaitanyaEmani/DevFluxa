export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  href: string;
  icon?: string;
}

export const tools: Tool[] = [
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Format and validate JSON data with ease',
    category: 'formatters',
    href: '/tools/json-formatter',
  },
  {
    id: 'html-beautifier',
    name: 'HTML Beautifier',
    description: 'Format and beautify HTML code with proper indentation',
    category: 'formatters',
    href: '/tools/html-beautifier',
  },
  {
    id: 'css-formatter',
    name: 'CSS Formatter',
    description: 'Format and beautify CSS code',
    category: 'formatters',
    href: '/tools/css-formatter',
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    description: 'Generate secure passwords with customizable options',
    category: 'generators',
    href: '/tools/password-generator',
  },
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    description: 'Generate various hash types for your data',
    category: 'generators',
    href: '/tools/hash-generator',
  },
];
