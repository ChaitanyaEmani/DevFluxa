interface AdUnitProps {
  className?: string
}

export function AdUnit({ className = '' }: AdUnitProps) {
  return (
    <div className={`border-2 border-dashed border-muted-foreground/20 rounded-lg p-8 text-center ${className}`}>
      <p className="text-sm text-muted-foreground mb-2">ADVERTISEMENT</p>
      <div className="h-32 bg-muted/30 rounded flex items-center justify-center">
        <span className="text-xs text-muted-foreground">Ad Space</span>
      </div>
    </div>
  )
}
