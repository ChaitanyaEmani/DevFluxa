import { CopyButton } from './CopyButton'

interface TextareaOutputProps {
  value: string
  placeholder?: string
  className?: string
  rows?: number
  showCopy?: boolean
}

export function TextareaOutput({ 
  value, 
  placeholder = 'Output will appear here...', 
  className = '', 
  rows = 6,
  showCopy = true 
}: TextareaOutputProps) {
  return (
    <div className="relative">
      <textarea
        value={value}
        readOnly
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-4 py-3 border border-input bg-muted rounded-md resize-none ${className}`}
      />
      {showCopy && value && (
        <div className="absolute top-2 right-2">
          <CopyButton text={value} />
        </div>
      )}
    </div>
  )
}
