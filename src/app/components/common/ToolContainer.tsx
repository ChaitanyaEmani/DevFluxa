import React from 'react';

interface ToolContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function ToolContainer({ children, className = '' }: ToolContainerProps) {
  return (
    <div className={`max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
      {children}
    </div>
  );
}
