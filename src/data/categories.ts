export interface Category {
  id: string;
  name: string;
  description: string;
  href: string;
}

export const categories: Category[] = [
  {
    id: 'formatters',
    name: 'Formatters',
    description: 'Format and beautify your code',
    href: '/formatters',
  },
  {
    id: 'converters',
    name: 'Converters',
    description: 'Convert between different data formats',
    href: '/converters',
  },
  {
    id: 'generators',
    name: 'Generators',
    description: 'Generate various types of data and codes',
    href: '/generators',
  },
];
