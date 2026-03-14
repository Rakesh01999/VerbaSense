"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, AlertCircle, Loader2, CheckCircle2, ArrowLeft } from "lucide-react"
import { apiForgotPassword } from "@/lib/api"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await apiForgotPassword(email)
      setIsSuccess(true)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unexpected error occurred. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-background overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />

      <div className="z-10 w-full max-w-md px-4">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 mb-4 transition-transform hover:scale-105">
            <Mic className="text-white w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">VerbaSense</h1>
          <p className="text-muted-foreground mt-2">Account recovery.</p>
        </div>

        <Card className="border-border bg-card/50 backdrop-blur-xl shadow-2xl">
          {isSuccess ? (
            <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">Reset link sent!</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  If an account exists for <span className="text-foreground font-medium">{email}</span>, 
                  a password reset link has been sent. Check your inbox.
                </p>
              </div>
              <Link 
                href="/login" 
                className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-500 transition-colors font-medium"
              >
                Return to Sign In →
              </Link>
            </CardContent>
          ) : (
            <>
              <CardHeader>
                <CardTitle className="text-2xl text-foreground">Forgot Password</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Enter your email address and we&apos;ll send you a reset link.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground/80">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-purple-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Sending...</>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                  <Link 
                    href="/login"
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
                  >
                    <ArrowLeft className="w-3 h-3" /> Back to Sign In
                  </Link>
                </CardFooter>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
