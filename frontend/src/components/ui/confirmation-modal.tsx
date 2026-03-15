"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, X } from "lucide-react"
import { Button } from "./button"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "danger" | "warning" | "info"
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger"
}: ConfirmationModalProps) {
  if (!isOpen) return null

  const variantStyles = {
    danger: "bg-red-500 hover:bg-red-600 shadow-red-500/20",
    warning: "bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/20",
    info: "bg-blue-500 hover:bg-blue-600 shadow-blue-500/20"
  }

  const iconStyles = {
    danger: "text-red-400 bg-red-400/10",
    warning: "text-yellow-400 bg-yellow-400/10",
    info: "text-blue-400 bg-blue-400/10"
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-card border border-border shadow-2xl rounded-2xl overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${iconStyles[variant]}`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <h3 className="text-xl font-bold mb-2">{title}</h3>
              <p className="text-muted-foreground leading-relaxed mb-8">
                {description}
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="flex-1 order-2 sm:order-1"
                >
                  {cancelText}
                </Button>
                <Button
                  onClick={() => {
                    onConfirm()
                    onClose()
                  }}
                  className={`flex-1 order-1 sm:order-2 ${variantStyles[variant]}`}
                >
                  {confirmText}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
