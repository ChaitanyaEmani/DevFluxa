import { forwardRef } from 'react'
import { cn } from "@/lib/utils"

interface ToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
}

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, pressed = false, onPressedChange, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={pressed}
        data-state={pressed ? 'on' : 'off'}
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 py-2 px-4',
          pressed 
            ? 'bg-primary text-primary-foreground' 
            : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
          className
        )}
        onClick={() => onPressedChange?.(!pressed)}
        {...props}
      />
    )
  }
)

Toggle.displayName = 'Toggle'
