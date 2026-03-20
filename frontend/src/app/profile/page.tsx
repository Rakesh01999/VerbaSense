"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/context/AuthContext"
import BackgroundEffects from "@/components/BackgroundEffects"
import PageHero from "@/components/PageHero"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Shield, Zap, BarChart3, Clock, KeyRound, LogOut, Edit2, Check, X, Loader2, Camera, Calendar } from "lucide-react"
import { apiUpdateProfile } from "@/lib/api"
import Link from "next/link"
import Image from "next/image"
import { useToast } from "@/context/ToastContext"

export default function ProfilePage() {
  const { user, stats, logout, isLoading, refreshUser, token } = useAuth()
  const { showToast } = useToast()
  
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user?.name || "")
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const getPhotoUrl = (photoPath?: string) => {
    if (!photoPath) return null
    if (photoPath.startsWith("http")) return photoPath
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
    const baseUrl = apiBase.replace("/api", "")
    return encodeURI(`${baseUrl}/${photoPath}`)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("Image size must be less than 5MB.", "error")
        return
      }
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setIsEditing(true)
    }
  }

  const statsDisplay = [
    { label: "Minutes Processed", value: stats?.totalMinutes || "0", icon: <Clock className="w-5 h-5 text-blue-500" /> },
    { label: "Success Rate", value: `${stats?.averageAccuracy || "99.8"}%`, icon: <Zap className="w-5 h-5 text-yellow-500" /> },
    { label: "Total Files", value: stats?.totalTranscriptions || "0", icon: <BarChart3 className="w-5 h-5 text-purple-500" /> },
  ]

  const handleUpdateProfile = async () => {
    if (!name.trim() && !photoFile) {
      showToast("No changes to update", "info")
      return
    }

    setIsUpdating(true)
    try {
      const formData = new FormData()
      if (name !== user?.name) formData.append("name", name)
      if (photoFile) formData.append("photo", photoFile)

      if (!token) throw new Error("No auth token found")
      const result = await apiUpdateProfile(formData, token)

      if (result.success) {
        await refreshUser()
        setIsEditing(false)
        setPhotoFile(null)
        setPhotoPreview(null)
        showToast("Profile updated successfully", "success")
      } else {
        showToast(result.message || "Failed to update profile", "error")
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      showToast("An error occurred while updating profile", "error")
    } finally {
      setIsUpdating(false)
    }
  }

  const cancelEditing = () => {
    setName(user?.name || "")
    setPhotoFile(null)
    setPhotoPreview(null)
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      <BackgroundEffects />
      
      <PageHero 
        badge="USER PROFILE"
        title={`Welcome, ${user.name?.split(' ')[0] || 'User'}`}
        subtitle="View your processing statistics and manage your account security."
      />

      <div className="container mx-auto px-6 -mt-10 relative z-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* User Information Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card className="bg-card/40 backdrop-blur-2xl border-border shadow-2xl overflow-hidden h-fit">
              <div className="h-24 bg-gradient-to-r from-purple-600/20 to-blue-600/20 relative" />
              <div className="px-8 pb-8 -mt-12 relative">
                <div className="flex justify-between items-start mb-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-4xl font-bold shadow-xl border-4 border-background overflow-hidden">
                      {photoPreview || user.photo ? (
                        <Image 
                          src={photoPreview || getPhotoUrl(user.photo) || ""} 
                          alt={user.name || "Profile Photo"} 
                          width={96}
                          height={96}
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        (user.name?.[0] || user.email?.[0] || "U").toUpperCase()
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-purple-600 border-2 border-background flex items-center justify-center cursor-pointer hover:bg-purple-500 transition-colors shadow-lg">
                      <Camera className="w-4 h-4 text-white" />
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                    </label>
                  </div>
                  {!isEditing ? (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full hover:bg-purple-500/10 text-purple-400"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  ) : null}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <AnimatePresence mode="wait">
                      {isEditing ? (
                        <motion.div
                          key="editing"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-3"
                        >
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Full Name</label>
                            <input 
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="w-full bg-background/50 border border-purple-500/30 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-semibold"
                              placeholder="Enter your name"
                              autoFocus
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="flex-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white gap-2"
                              onClick={handleUpdateProfile}
                              disabled={isUpdating}
                            >
                              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                              Save
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1 rounded-xl border-border hover:bg-accent gap-2"
                              onClick={cancelEditing}
                              disabled={isUpdating}
                            >
                              <X className="w-4 h-4" />
                              Cancel
                            </Button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="display"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <h2 className="text-2xl font-bold tracking-tight">{user.name || "VerbaSense User"}</h2>
                          <div className="flex flex-col gap-1 mt-1">
                            <p className="text-muted-foreground flex items-center gap-2 italic text-sm">
                              <Calendar className="w-3.5 h-3.5" /> Joined {user.date ? new Date(user.date).toLocaleDateString() : 'Active Member'}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Email Address</p>
                      <p className="text-muted-foreground flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4" /> {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col gap-2">
                    <Button asChild variant="outline" className="w-full justify-start gap-3 rounded-xl hover:bg-accent border-purple-500/20">
                      <Link href="/forgot-password">
                        <KeyRound className="w-4 h-4 text-purple-400" /> Update Password
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      onClick={logout}
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="font-semibold text-sm">Verified Account</p>
                  <p className="text-xs text-muted-foreground">Pro features are enabled for your email.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Statistics Grid */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {statsDisplay.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-card/30 backdrop-blur-xl border-border hover:border-purple-500/30 transition-all group">
                    <CardContent className="p-8">
                      <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        {stat.icon}
                      </div>
                      <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">{stat.label}</p>
                      <p className="text-4xl font-bold tracking-tight">{stat.value}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Motivation Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-zinc-900 dark:to-black border-purple-500/20 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
                <CardContent className="p-8 relative z-10">
                  <h3 className="text-xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">Ready for your next project?</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-6">Your current usage shows consistent processing efficiency. Start a new transcription to continue your workflow.</p>
                  <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-8 shadow-lg shadow-purple-500/20">
                    <Link href="/dashboard">Return to Dashboard</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

        </div>
      </div>
    </main>
  )
}
