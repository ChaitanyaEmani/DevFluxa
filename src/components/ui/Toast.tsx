'use client'

import { useState, useEffect } from 'react'
import { Check, X, AlertCircle, Info } from 'lucide-react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  onClose?: () => void
}

export function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  const icons = {
    success: <Check className="h-4 w-4 text-green-600" />,
    error: <X className="h-4 w-4 text-red-600" />,
    info: <Info className="h-4 w-4 text-blue-600" />
  }

  const bgColors = {
    success: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
    error: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
  }

  return (
    <div className={`fixed bottom-4 right-4 flex items-center p-4 rounded-lg border shadow-lg ${bgColors[type]} z-50 animate-in slide-in-from-bottom-2`}>
      <div className="flex items-center">
        {icons[type]}
        <span className="ml-2 text-sm font-medium">{message}</span>
      </div>
      <button
        onClick={() => {
          setIsVisible(false)
          onClose?.()
        }}
        className="ml-4 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
