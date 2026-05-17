import React from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
}

export function FAQ({ items }: FAQProps) {
  return (
    <div className="max-w-3xl mx-auto mt-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {item.question}
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              {item.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
