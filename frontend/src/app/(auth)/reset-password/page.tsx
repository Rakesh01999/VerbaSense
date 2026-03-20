"use client"

import React, { useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useToast } from "@/context/ToastContext"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import { apiResetPassword } from "@/lib/api"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      showToast("Invalid or missing reset token. Please request a new reset link.", "error")
      return
    }

    if (password.length < 6) {
      showToast("Password must be at least 6 characters long.", "error")
      return
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match.", "error")
      return
    }

    setIsLoading(true)

    try {
      await apiResetPassword(token, password)
      setIsSuccess(true)
      showToast("Password reset successfully! You can now sign in.", "success")
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast(err.message, "error")
      } else {
        showToast("An unexpected error occurred. Please try again.", "error")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-border bg-card/50 backdrop-blur-xl shadow-2xl">
      {isSuccess ? (
        <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">Password Reset!</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your password has been updated successfully. You can now sign in with your new password.
            </p>
          </div>
          <Link
            href="/login"
            className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-500 transition-colors font-medium"
          >
            Go to Sign In →
          </Link>
        </CardContent>
      ) : (
        <>
          <CardHeader>
            <CardTitle className="text-2xl text-foreground">Reset Password</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your new password below.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" title="Password must be at least 6 characters long" className="text-foreground/80">New Password</Label>
                <PasswordInput
                  id="password"
                  placeholder="Min. 6 characters"
                  className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-purple-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" title="Repeat your new password" className="text-foreground/80">Confirm Password</Label>
                <PasswordInput
                  id="confirmPassword"
                  placeholder="Repeat your new password"
                  className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-purple-500"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium py-6 rounded-xl transition-all shadow-lg shadow-purple-500/20"
              >
                {isLoading ? (
                  <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Resetting...</>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </CardFooter>
          </form>
        </>
      )}
    </Card>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-background overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />

      <div className="z-10 w-full max-w-md px-4">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-16 h-16 mb-4 transition-transform hover:scale-105">
            <Image 
              src="/verbasense_logo.png" 
              alt="VerbaSense Logo" 
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold tracking-tight brand-text">VerbaSense</h1>
          <p className="text-muted-foreground mt-2">Secure account recovery.</p>
        </div>

        <Suspense fallback={<div className="text-center text-muted-foreground">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
