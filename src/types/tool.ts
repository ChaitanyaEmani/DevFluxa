export interface Tool {
  id: string;
  name: string;
  description: string;
  category: 'formatters' | 'converters' | 'generators';
  href: string;
  icon?: string;
  tags?: string[];
}

export interface ToolCategory {
  id: string;
  name: string;
  description: string;
  href: string;
  tools: Tool[];
}

export interface ToolSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  wordWrap: boolean;
  lineNumbers: boolean;
}
