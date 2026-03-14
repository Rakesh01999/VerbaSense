"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useToast } from "@/context/ToastContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, UserPlus, Loader2, CheckCircle2 } from "lucide-react"
import { apiRegister } from "@/lib/api"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 6) {
      showToast("Password must be at least 6 characters long.", "error")
      return
    }

    setIsLoading(true)

    try {
      await apiRegister(name, email, password)
      setIsSuccess(true)
      showToast("Account created! Check your inbox for the verification link.", "success")
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
    <div className="relative min-h-screen w-full flex items-center justify-center bg-background overflow-hidden">
      {/* Abstract background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      
      <div className="z-10 w-full max-w-md px-4 py-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 mb-4 transition-transform hover:scale-105">
            <Mic className="text-white w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">VerbaSense</h1>
          <p className="text-muted-foreground mt-2">Professional voice-to-text services.</p>
        </div>

        <Card className="border-border bg-card/50 backdrop-blur-xl shadow-2xl">
          {isSuccess ? (
            /* ── Success State ── */
            <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">Check your inbox!</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We sent a verification link to <span className="text-foreground font-medium">{email}</span>.
                  Click the link in the email to activate your account.
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
            /* ── Registration Form ── */
            <>
              <CardHeader>
                <CardTitle className="text-2xl text-foreground">Create Account</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Fill in your details to start using VerbaSense.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground/80">Full Name</Label>
                    <Input 
                      id="name" 
                      placeholder="John Doe" 
                      className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-purple-500"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground/80">Email</Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground/80">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="Min. 6 characters"
                      className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-purple-500"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                      <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Creating Account...</>
                    ) : (
                      <><UserPlus className="mr-2 w-5 h-5" /> Sign Up</>
                    )}
                  </Button>
                  <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="text-purple-600 dark:text-purple-400 hover:text-purple-500 font-medium transition-colors">
                      Login
                    </Link>
                  </div>
                </CardFooter>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
