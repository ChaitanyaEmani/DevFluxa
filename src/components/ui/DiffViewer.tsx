import { useState } from "react";

interface DiffViewerProps {
  before: string;
  after: string;
}

export function DiffViewer({ before, after }: DiffViewerProps) {
  const [showDiff] = useState(true);

  if (!showDiff) return null;

  const beforeLines = before.split('\n');
  const afterLines = after.split('\n');
  const maxLines = Math.max(beforeLines.length, afterLines.length);

  const getLineClass = (beforeLine: string, afterLine: string, index: number) => {
    if (index >= beforeLines.length) return 'bg-green-50 border-green-200';
    if (index >= afterLines.length) return 'bg-red-50 border-red-200';
    if (beforeLine !== afterLine) {
      if (beforeLine === '') return 'bg-green-50 border-green-200';
      if (afterLine === '') return 'bg-red-50 border-red-200';
      return 'bg-yellow-50 border-yellow-200';
    }
    return '';
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="grid grid-cols-2 bg-muted border-b">
        <div className="p-2 font-medium text-sm">Before</div>
        <div className="p-2 font-medium text-sm border-l">After</div>
      </div>
      <div className="max-h-96 overflow-auto">
        {Array.from({ length: maxLines }, (_, index) => {
          const beforeLine = beforeLines[index] || '';
          const afterLine = afterLines[index] || '';
          const lineClass = getLineClass(beforeLine, afterLine, index);
          
          return (
            <div key={index} className={`grid grid-cols-2 border-b ${lineClass}`}>
              <div className="p-2 font-mono text-sm border-r overflow-x-auto">
                {beforeLine || '\u00A0'}
              </div>
              <div className="p-2 font-mono text-sm overflow-x-auto">
                {afterLine || '\u00A0'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
