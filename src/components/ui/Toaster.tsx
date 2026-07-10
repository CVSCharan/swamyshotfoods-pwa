import { Toaster as Sonner } from "sonner"
import React from "react"

type ToasterProps = React.ComponentProps<typeof Sonner>

export const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-neutral-950 group-[.toaster]:border-neutral-200 group-[.toaster]:shadow-lg font-display",
          description: "group-[.toast]:text-neutral-500",
          actionButton:
            "group-[.toast]:bg-neutral-900 group-[.toast]:text-neutral-50",
          cancelButton:
            "group-[.toast]:bg-neutral-100 group-[.toast]:text-neutral-500",
          error: "group-[.toaster]:bg-red-500 group-[.toaster]:text-white group-[.toaster]:border-red-600",
          success: "group-[.toaster]:bg-emerald-500 group-[.toaster]:text-white group-[.toaster]:border-emerald-600",
        },
      }}
      {...props}
    />
  )
}
