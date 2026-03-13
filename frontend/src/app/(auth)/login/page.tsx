"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login } = useAuth()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Connect to actual backend API
    // Mock login for now
    login("mock-jwt-token", { id: "1", email })
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-zinc-950 overflow-hidden">
      {/* Abstract background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
      
      <div className="z-10 w-full max-w-md px-4">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 mb-4 transition-transform hover:scale-105">
            <Mic className="text-white w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">VerbaSense</h1>
          <p className="text-zinc-400 mt-2">Voice to text. Powered by AI.</p>
        </div>

        <Card className="border-white/10 bg-zinc-900/50 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Login</CardTitle>
            <CardDescription className="text-zinc-400">
              Enter your credentials to access your transcriptions.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  className="bg-zinc-800/50 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-purple-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-zinc-300">Password</Label>
                  <Link 
                    href="/forgot-password" 
                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  className="bg-zinc-800/50 border-white/10 text-white focus-visible:ring-purple-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium py-6 rounded-xl transition-all shadow-lg shadow-purple-500/20"
              >
                Sign In
              </Button>
              <div className="text-center text-sm text-zinc-500">
                Don't have an account?{" "}
                <Link href="/register" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
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
