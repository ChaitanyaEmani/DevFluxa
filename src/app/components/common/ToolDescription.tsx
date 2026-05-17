import React from 'react';

interface ToolDescriptionProps {
  description: string;
}

export function ToolDescription({ description }: ToolDescriptionProps) {
  return (
    <div className="max-w-3xl mx-auto mb-8">
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
