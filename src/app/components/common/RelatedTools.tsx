import React from 'react';
import { ToolCard } from './ToolCard';

interface Tool {
  title: string;
  description: string;
  href: string;
}

interface RelatedToolsProps {
  tools: Tool[];
}

export function RelatedTools({ tools }: RelatedToolsProps) {
  return (
    <div className="max-w-4xl mx-auto mt-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Related Tools
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, index) => (
          <ToolCard key={index} {...tool} />
        ))}
      </div>
    </div>
  );
}
