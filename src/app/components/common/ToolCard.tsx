import React from 'react';
import Link from 'next/link';

interface ToolCardProps {
  title: string;
  description: string;
  href: string;
  icon?: React.ReactNode;
}

export function ToolCard({ title, description, href, icon }: ToolCardProps) {
  return (
    <Link href={href} className="block">
      <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-shadow bg-white dark:bg-gray-800">
        <div className="flex items-center mb-4">
          {icon && <div className="mr-3">{icon}</div>}
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          {description}
        </p>
      </div>
    </Link>
  );
}
