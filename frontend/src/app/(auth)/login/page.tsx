"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/context/ToastContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Loader2 } from "lucide-react"
import { apiLogin, apiGoogleLogin } from "@/lib/api"
import { GoogleLogin } from "@react-oauth/google"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await apiLogin(email, password)
      login(res.data.token, { email })
      showToast("Welcome back! Signed in successfully.", "success")
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
  
  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return
    
    setIsLoading(true)
    try {
      const res = await apiGoogleLogin(credentialResponse.credential)
      login(res.data.token)
      showToast("Signed in successfully with Google!", "success")
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast(err.message, "error")
      } else {
        showToast("Google authentication failed. Please try again.", "error")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-background overflow-hidden">
      {/* Abstract background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      
      <div className="z-10 w-full max-w-md px-4">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 mb-4 transition-transform hover:scale-105">
            <Mic className="text-white w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">VerbaSense</h1>
          <p className="text-muted-foreground mt-2">Precision voice-to-text services.</p>
        </div>

        <Card className="border-border bg-card/50 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-foreground">Sign In</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your credentials to access your transcriptions.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">

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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-foreground/80">Password</Label>
                  <Link 
                    href="/forgot-password" 
                    className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-500 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <PasswordInput 
                  id="password" 
                  type="password" 
                  placeholder="********" 
                  className="bg-secondary/50 border-border text-foreground focus-visible:ring-purple-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <div className="flex justify-center w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => showToast("Google Login failed", "error")}
                  useOneTap
                  theme="filled_blue"
                  shape="pill"
                  width="100%"
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
                  <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Signing In...</>
                ) : (
                  "Sign In"
                )}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-purple-600 dark:text-purple-400 hover:text-purple-500 font-medium transition-colors">
                  Create Account
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
