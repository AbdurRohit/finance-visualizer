// components/providers/toast-provider.tsx
"use client"

import { Toaster as SonnerToaster } from "@/components/ui/sonner"

export function ToastProvider() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        duration: 3000,
        className: "border-border bg-background text-foreground",
      }}
    />
  )
}