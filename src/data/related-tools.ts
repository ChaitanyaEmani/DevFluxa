export interface RelatedTool {
  toolId: string;
  relatedTools: string[];
}

export const relatedTools: RelatedTool[] = [
  {
    toolId: 'json-formatter',
    relatedTools: ['xml-formatter', 'javascript-formatter', 'css-formatter'],
  },
  {
    toolId: 'html-beautifier',
    relatedTools: ['css-formatter', 'javascript-formatter', 'markdown-formatter'],
  },
  {
    toolId: 'password-generator',
    relatedTools: ['hash-generator', 'uuid-generator'],
  },
];
