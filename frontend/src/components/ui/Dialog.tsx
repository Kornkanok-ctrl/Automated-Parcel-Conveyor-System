"use client"

import * as React from "react"
import { X } from "lucide-react"

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false)
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 animate-in fade-in-0 zoom-in-95 duration-200">
        {children}
      </div>
    </div>
  )
}

const DialogContent: React.FC<{ 
  className?: string
  children: React.ReactNode 
}> = ({ className, children }) => (
  <div className={`relative ${className || ''}`}>
    {children}
  </div>
)

const DialogHeader: React.FC<{ 
  children: React.ReactNode 
}> = ({ children }) => (
  <div className="mb-4 space-y-1.5 text-center sm:text-left">
    {children}
  </div>
)

const DialogTitle: React.FC<{ 
  className?: string
  children: React.ReactNode 
}> = ({ className, children }) => (
  <h2 className={`text-lg font-semibold leading-none tracking-tight ${className || ''}`}>
    {children}
  </h2>
)

const DialogDescription: React.FC<{ 
  children: React.ReactNode 
}> = ({ children }) => (
  <p className="text-sm text-gray-600 mt-2">
    {children}
  </p>
)

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
}