"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/context/ToastContext"
import { motion, AnimatePresence } from "framer-motion"
import { ThemeToggle } from "@/components/ThemeToggle"

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  
  // Close menus on path change during render
  const [prevPathname, setPrevPathname] = useState(pathname)
  if (pathname !== prevPathname) {
    setPrevPathname(pathname)
    setMobileMenuOpen(false)
    setUserMenuOpen(false)
  }

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])



  const handleLogout = () => {
    logout()
    showToast("Signed out successfully. See you soon!", "info")
  }

  const getPhotoUrl = (photoPath?: string) => {
    if (!photoPath) return null
    if (photoPath.startsWith("http")) return photoPath
    
    // For local uploads, we need to point to the backend static folder
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
    const baseUrl = apiBase.replace("/api", "")
    return encodeURI(`${baseUrl}/${photoPath}`)
  }

  const navLinks = [
    { name: "Product", href: "/product" },
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Contact", href: "/contact" },
  ]

  // For now, let's keep it global but style it.
  const isDashboard = pathname.startsWith("/dashboard")

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 flex flex-col ${
        isScrolled || isDashboard 
          ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-lg" 
          : "bg-transparent"
      }`}
    >
      <div className={`container mx-auto px-4 md:px-6 flex items-center justify-between transition-all duration-300 ${isScrolled || isDashboard ? "h-16" : "h-20"}`}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 group-hover:scale-110 transition-transform duration-300">
            <Image 
              src="/verbasense_logo.png" 
              alt="VerbaSense Logo" 
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-xl font-bold tracking-tight brand-text">
            VerbaSense
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>

        {/* Auth Actions */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 pl-3 rounded-full bg-secondary border border-border hover:bg-muted transition-colors"
              >
                <span className="text-sm font-medium text-foreground">{user?.name || user?.email?.split('@')[0]}</span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold overflow-hidden border border-white/10 shadow-inner">
                  {user?.photo ? (
                      <img 
                        src={getPhotoUrl(user.photo) || ""} 
                        alt={user.name || "User"} 
                        width={32}
                        height={32}
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                  ) : (
                    (user?.name?.[0] || user?.email?.[0] || "U").toUpperCase()
                  )}
                </div>
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 py-2 bg-popover border border-border rounded-xl shadow-2xl backdrop-blur-xl"
                  >
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6">
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-muted-foreground hover:text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="flex flex-col gap-4 p-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-lg font-medium text-muted-foreground hover:text-foreground"
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Appearance</span>
                <ThemeToggle />
              </div>
              <hr className="border-border" />
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" className="text-lg font-medium text-muted-foreground">Dashboard</Link>
                   <button onClick={handleLogout} className="text-lg font-medium text-destructive text-left">Logout</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-lg font-medium text-muted-foreground">Login</Link>
                  <Link href="/register" className="text-lg font-medium text-foreground">Get Started</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
