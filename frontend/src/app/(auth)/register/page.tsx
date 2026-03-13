"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, UserPlus } from "lucide-react"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login } = useAuth()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Connect to actual backend API
    // Mock registration then login
    login("mock-jwt-token", { id: "1", email })
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground/80">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  className="bg-secondary/50 border-border text-foreground focus-visible:ring-purple-500"
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
                <UserPlus className="mr-2 w-5 h-5" />
                Sign Up
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-purple-600 dark:text-purple-400 hover:text-purple-500 font-medium transition-colors">
                  Login
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
