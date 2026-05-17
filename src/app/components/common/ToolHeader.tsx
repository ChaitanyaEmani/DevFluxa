import React from 'react';

interface ToolHeaderProps {
  title: string;
  description: string;
}

export function ToolHeader({ title, description }: ToolHeaderProps) {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        {title}
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300">
        {description}
      </p>
    </div>
  );
}
