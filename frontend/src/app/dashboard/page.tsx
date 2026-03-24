"use client"

import React, { useState, useCallback } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/context/ToastContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { Mic, Square, Loader2, LogOut, History, Settings, User, Copy, Trash2, ChevronLeft, ChevronRight, Clock, AlertCircle, LayoutDashboard, UploadCloud, BarChart3, Star, FileText } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"

interface TranscriptionItem {
  _id: string;
  transcribedText: string;
  createdAt: string;
  audioUrl?: string;
  metadata?: {
    size: number;
    format: string;
    duration?: number;
  };
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const { showToast } = useToast()
  
  const [activeTab, setActiveTab] = useState("overview")
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcription, setTranscription] = useState("")
  const [history, setHistory] = useState<TranscriptionItem[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  
  const [searchTerm, setSearchTerm] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    confirmText?: string;
    variant?: "danger" | "warning" | "info";
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  })
  
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [transcriptionLanguage, setTranscriptionLanguage] = useState("en")
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('audio/')) {
        setSelectedFile(file)
        showToast(`Selected: ${file.name}`, "info")
      } else {
        showToast("Please upload an audio file.", "error")
      }
    }
  }

  const fetchHistory = useCallback(async () => {
    setIsLoadingHistory(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transcribe/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const result = await response.json()
      if (result.success) {
        setHistory(result.data)
      }
    } catch (err) {
      console.error("Error fetching history:", err)
      showToast("Failed to load history.", "error")
    } finally {
      setIsLoadingHistory(false)
    }
  }, [showToast])

  // Fetch history on mount or tab change
  React.useEffect(() => {
    if (activeTab === "history" || activeTab === "overview") {
      fetchHistory()
    }
  }, [activeTab, fetchHistory])

  const deleteHistoryItem = (id: string) => {
    setModalConfig({
      isOpen: true,
      title: "Delete Transcription",
      description: "Are you sure you want to delete this transcription? This action cannot be undone.",
      confirmText: "Delete",
      variant: "danger",
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token')
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transcribe/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          })
          const result = await response.json()
          if (result.success) {
            setHistory(prev => prev.filter(item => item._id !== id))
            showToast("Transcription deleted.", "success")
          }
        } catch (err) {
          console.error("Error deleting item:", err)
          showToast("Failed to delete transcription.", "error")
        }
      }
    })
  }

  const clearAllHistory = () => {
    setModalConfig({
      isOpen: true,
      title: "Clear All History",
      description: "Wait! This will permanently delete your entire transcription history. Are you sure you want to proceed?",
      confirmText: "Clear All",
      variant: "danger",
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token')
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transcribe`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          })
          const result = await response.json()
          if (result.success) {
            setHistory([])
            showToast("All history cleared.", "success")
          }
        } catch (err) {
          console.error("Error clearing history:", err)
          showToast("Failed to clear history.", "error")
        }
      }
    })
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: Blob[] = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' })
        await sendAudioToBackend(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
      setTranscription("")
    } catch (err) {
      console.error("Error accessing microphone:", err)
      showToast("Could not access microphone.", "error")
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
      setIsProcessing(true)
    }
  }

  const sendAudioToBackend = async (audioBlob: Blob) => {
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      const fileName = audioBlob instanceof File ? audioBlob.name : 'recording.wav'
      formData.append('audio', audioBlob, fileName)
      formData.append('language', transcriptionLanguage)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transcribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        setTranscription(result.data.transcribedText)
        showToast("Transcription complete!", "success")
        // If history is open, refresh it
        if (activeTab === "history") fetchHistory()
      } else {
        showToast(result.msg || "Transcription failed", "error")
      }
    } catch (err) {
      console.error("Transcription error:", err)
      showToast("Error connecting to server.", "error")
    } finally {
      setIsProcessing(false)
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const copyToClipboard = (text: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    showToast("Transcription copied to clipboard.", "success")
  }

  const clearTranscription = () => {
    setTranscription("")
    showToast("Transcription cleared.", "info")
  }

  const handleUpdateTranscription = async (id: string) => {
    if (!editingText.trim()) return
    setIsUpdating(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transcribe/${id}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ transcribedText: editingText })
      })
      const result = await response.json()
      if (result.success) {
        setHistory(prev => prev.map(item => item._id === id ? { ...item, transcribedText: editingText } : item))
        setEditingId(null)
        showToast("Transcription updated.", "success")
      }
    } catch (err) {
      console.error("Error updating transcription:", err)
      showToast("Failed to update.", "error")
    } finally {
      setIsUpdating(false)
    }
  }

  const filteredHistory = history.filter(item => 
    item.transcribedText.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleLogout = () => {
    logout()
    showToast("Signed out successfully. See you soon!", "info")
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const exportAsTxt = (text: string, date: string) => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transcription-${new Date(date).toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast("Downloaded as .txt", "success")
  }

  const getFullAudioUrl = (path: string) => {
    // Cloudinary and other absolute URLs should be used as-is
    if (path.startsWith('http')) return path;
    // Legacy: local backend file path
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
    const baseUrl = apiBase.replace("/api", "")
    return `${baseUrl}/${path}`
  }

  const totalDuration = history.reduce((acc, item) => acc + (item.metadata?.duration || 0), 0)

  const navigation = [
    { group: "Management", items: [
      { icon: LayoutDashboard, label: "Overview", id: "overview" },
    ]},
    { group: "Workspace", items: [
      { icon: Mic, label: "Voice Recorder", id: "recorder" },
      { icon: UploadCloud, label: "File Uploads", id: "uploads" },
    ]},
    { group: "Archive", items: [
      { icon: History, label: "History", id: "history" },
      { icon: Star, label: "Starred", id: "starred" },
    ]},
    { group: "Analytics", items: [
      { icon: BarChart3, label: "Usage Stats", id: "analytics" },
    ]},
    { group: "System", items: [
      { icon: Settings, label: "Settings", id: "settings" },
    ]}
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex pt-16 overflow-x-hidden">
      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-16 bottom-0 z-40 border-r border-border flex flex-col px-3 py-6 bg-card/40 backdrop-blur-2xl hidden md:flex transition-all duration-500 shadow-[0_0_50px_-12px_rgba(0,0,0,0.15)] ${
          isSidebarCollapsed ? "w-22" : "w-72"
        }`}
      >
        {/* Floating Toggle Button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50 focus:outline-none"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>

        <div className={`flex items-center gap-4 mb-2 px-3 ${isSidebarCollapsed ? "justify-center" : ""}`}>
          {!isSidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <span className="font-bold text-xl tracking-tight leading-none text-foreground/90 uppercase">Studio Workspace</span>
              <span className="text-[10px] text-primary uppercase tracking-[0.2em] mt-2 font-black">Management Hub</span>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 space-y-6 mt-8 overflow-y-auto custom-scrollbar pr-1">
          {navigation.map((group) => (
            <div key={group.group} className="space-y-2">
              {!isSidebarCollapsed && (
                <h3 className="px-5 text-[10px] font-black tracking-[0.2em] text-muted-foreground/40 uppercase mb-3">
                  {group.group}
                </h3>
              )}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <Button 
                    key={item.id}
                    variant="ghost" 
                    className={`w-full group relative h-12 transition-all duration-300 ${
                      isSidebarCollapsed ? "justify-center px-0" : "justify-start px-4"
                    } ${activeTab === item.id 
                        ? "bg-primary/10 text-primary shadow-[0_0_20px_-5px_rgba(0,0,0,0.1)]" 
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      }`}
                    title={isSidebarCollapsed ? item.label : ""}
                    onClick={() => setActiveTab(item.id)}
                  >
                    {activeTab === item.id && !isSidebarCollapsed && (
                      <motion.div 
                        layoutId="active-pill"
                        className="absolute left-0 w-1.5 h-6 bg-primary rounded-r-full shadow-[2px_0_10px_rgba(var(--primary),0.5)]" 
                      />
                    )}
                    <item.icon className={`${isSidebarCollapsed ? "" : "mr-4"} w-5 h-5 shrink-0 transition-all duration-300 group-hover:scale-110 ${activeTab === item.id ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground"}`} />
                    {!isSidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`font-semibold text-sm ${activeTab === item.id ? "text-primary" : ""}`}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-border/50 space-y-4">
          <Link 
            href="/profile"
            className={`flex items-center gap-4 px-3 py-3 rounded-2xl transition-all duration-300 border border-transparent shadow-sm hover:border-primary/20 hover:bg-muted/60 group ${isSidebarCollapsed ? "justify-center" : "bg-muted/40 border-border/50 backdrop-blur-md"}`}
          >
            <div className="relative shrink-0 transition-transform group-hover:scale-105">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-primary/10">
                <User className="w-6 h-6 text-primary/80" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full shadow-sm" />
            </div>
            {!isSidebarCollapsed && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col min-w-0"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold truncate text-foreground leading-tight">{user?.email?.split('@')[0]}</span>
                  <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-[10px] text-primary font-bold uppercase tracking-widest mt-0.5">View Profile</span>
              </motion.div>
            )}
          </Link>
          
          <Button 
            variant="ghost" 
            className={`w-full h-14 hover:bg-red-500/10 text-red-500 transition-all rounded-2xl border border-transparent hover:border-red-500/20 group ${
              isSidebarCollapsed ? "justify-center px-0" : "justify-start px-5 gap-4"
            }`}
            onClick={handleLogout}
            title={isSidebarCollapsed ? "Logout" : ""}
          >
            <LogOut className={`w-5 h-5 shrink-0 transition-transform group-hover:-translate-x-1`} />
            {!isSidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-sm tracking-wide"
              >
                Sign Out
              </motion.span>
            )}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main 
        className={`flex-1 flex flex-col p-8 md:p-12 overflow-y-auto transition-all duration-500 bg-gradient-to-br from-background via-background to-primary/5 ${
          isSidebarCollapsed ? "md:ml-22" : "md:ml-72"
        }`}
      >
        <header className="flex justify-between items-center mb-10 md:hidden bg-card/50 backdrop-blur-md p-4 rounded-2xl border border-border/50">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9">
              <Image 
                src="/verbasense_logo.png" 
                alt="VerbaSense Logo" 
                fill
                className="object-contain"
              />
            </div>
            <span className="font-bold text-xl brand-text">VerbaSense</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full hover:bg-red-500/10 hover:text-red-500">
            <LogOut className="w-5 h-5" />
          </Button>
        </header>

        <section className="max-w-5xl mx-auto w-full flex-1 flex flex-col">
          {activeTab === "overview" ? (
            <div className="space-y-10">
              <div className="mb-10 text-center md:text-left space-y-2">
                <motion.h2 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl md:text-5xl font-black tracking-tight"
                >
                  Welcome back, <span className="brand-text">{user?.name?.split(' ')[0] || user?.email?.split('@')[0]}</span>
                </motion.h2>
                <p className="text-muted-foreground text-lg">Here&apos;s your studio activity overview for today.</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "Total Intelligence", value: history.length, sub: "transcriptions", icon: LayoutDashboard, color: "text-blue-500" },
                  { label: "Speech Processed", value: formatDuration(totalDuration), sub: "total minutes", icon: Mic, color: "text-purple-500" },
                  { label: "Studio Storage", value: `${(history.reduce((acc, item) => acc + (item.metadata?.size || 0), 0) / (1024 * 1024)).toFixed(1)} MB`, sub: "cloud space used", icon: UploadCloud, color: "text-emerald-500" }
                ].map((stat, i) => (
                  <Card key={i} className="bg-card/30 backdrop-blur-3xl border-border/50 p-6 rounded-[2rem] border-2 shadow-xl hover:shadow-primary/5 transition-all group overflow-hidden relative">
                    <div className="relative z-10">
                      <div className={`w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${stat.color}`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <h4 className="text-3xl font-black tracking-tight mb-1">{stat.value}</h4>
                      <p className="text-xs uppercase tracking-widest font-black text-muted-foreground/60">{stat.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-2 italic">{stat.sub}</p>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <stat.icon className="w-32 h-32 rotate-12" />
                    </div>
                  </Card>
                ))}
              </div>

              {/* Recent Activity & Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="md:col-span-2 space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-bold flex items-center gap-3">
                      <History className="w-5 h-5 text-primary" />
                      Recent Activity
                    </h3>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("history")} className="text-primary font-bold text-xs uppercase tracking-widest">
                      View Archives
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {history.slice(0, 3).length > 0 ? (
                      history.slice(0, 3).map((item) => (
                        <div key={item._id} className="p-4 rounded-[1.5rem] bg-card/20 border border-border/30 hover:border-primary/20 transition-all flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="max-w-[150px] sm:max-w-xs">
                              <p className="text-sm font-bold truncate">{item.transcribedText}</p>
                              <p className="text-[10px] text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => copyToClipboard(item.transcribedText)} className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="p-10 text-center border-2 border-dashed border-border/50 rounded-[2rem] bg-muted/10">
                        <p className="text-muted-foreground text-sm italic">Initialize your first session to see activity.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-bold px-2">Quick Commands</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <Button 
                      className="h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-[1.5rem] text-white font-bold flex flex-col items-center justify-center shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-all"
                      onClick={() => setActiveTab("recorder")}
                    >
                      <Mic className="w-5 h-5 mb-1" />
                      <span>Start Recording</span>
                    </Button>
                    <Button 
                      variant="outline"
                      className="h-20 border-2 border-primary/20 hover:border-primary/50 bg-primary/5 rounded-[1.5rem] font-bold flex flex-col items-center justify-center hover:scale-[1.02] transition-all"
                      onClick={() => setActiveTab("uploads")}
                    >
                      <UploadCloud className="w-5 h-5 mb-1 text-primary" />
                      <span className="text-primary">Upload Session</span>
                    </Button>
                  </div>

                  <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20 p-6 rounded-[1.5rem] relative overflow-hidden">
                    <div className="relative z-10">
                      <h5 className="text-xs font-black uppercase tracking-widest text-amber-600 mb-2">Current Plan</h5>
                      <p className="text-xl font-black mb-1">Pioneer Free</p>
                      <p className="text-[10px] text-amber-700/60 font-medium">15 minutes remaining this month</p>
                      <Button variant="link" className="p-0 h-auto text-[10px] text-amber-600 font-bold uppercase mt-4">Upgrade Now →</Button>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          ) : activeTab === "recorder" ? (
            <>
              <div className="mb-12 text-center md:text-left space-y-2">
                <motion.h2 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl md:text-5xl font-black tracking-tight"
                >
                  Live <span className="brand-text">Capture.</span>
                </motion.h2>
                <p className="text-muted-foreground text-lg max-w-2xl">Precision voice-to-text intelligence. Powered by Open-Source models.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 flex-1">
                {/* Recording Area */}
                <Card className="border-border/50 bg-card/30 backdrop-blur-3xl flex flex-col items-center justify-center p-10 text-center relative overflow-hidden min-h-[450px] shadow-2xl shadow-primary/5 rounded-[2.5rem] border-2">
                  <AnimatePresence>
                    {isRecording && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 0.3, scale: 1.5 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="absolute inset-0 bg-purple-600/20 blur-[100px] rounded-full"
                      />
                    )}
                  </AnimatePresence>

                  <div className="relative z-10 flex flex-col items-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleRecording}
                      disabled={isProcessing}
                      className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
                        isRecording 
                        ? "bg-red-500 shadow-red-500/40" 
                        : "bg-gradient-to-br from-purple-600 to-blue-600 shadow-purple-500/40 hover:shadow-purple-500/60"
                      }`}
                    >
                      {isRecording ? (
                        <Square className="w-10 h-10 text-white fill-white" />
                      ) : isProcessing ? (
                        <Loader2 className="w-12 h-12 text-white animate-spin" />
                      ) : (
                        <Mic className="w-12 h-12 text-white" />
                      )}
                    </motion.button>
                    
                    <div className="mt-8">
                      <h3 className="text-xl font-semibold mb-1">
                        {isRecording ? "Recording Signal..." : isProcessing ? "De-noising & Processing..." : "Initialize Mic"}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {isRecording ? "Tap to finish transcription" : "Encrypted local processing"}
                      </p>
                    </div>
                    
                    {/* Quick Language Toggle */}
                    <div className="mt-6 flex flex-wrap justify-center bg-muted/50 p-1 rounded-xl border border-white/5 relative z-20 max-w-sm gap-1">
                      {['en', 'hi', 'es', 'ar', 'mr', 'auto'].map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => setTranscriptionLanguage(lang)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all uppercase tracking-widest ${
                            transcriptionLanguage === lang 
                            ? "bg-primary text-primary-foreground shadow-lg" 
                            : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>

                    {isRecording && (
                      <div className="mt-6 flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ height: [8, 24, 8] }}
                            transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                            className="w-1 bg-red-500 rounded-full"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </Card>

                {/* Result Area */}
                <Card className="border-border/50 bg-card/40 backdrop-blur-2xl flex flex-col shadow-xl rounded-[2.5rem] overflow-hidden border-2">
                  <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 py-5 px-8">
                    <div>
                      <CardTitle className="text-[10px] uppercase tracking-[0.2em] text-primary font-black">AI Output Stream</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => copyToClipboard(transcription)} title="Copy result" className="rounded-full hover:bg-primary/10">
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={clearTranscription} title="Clear" className="rounded-full hover:bg-red-500/10">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 flex-1 min-h-[300px]">
                    {transcription ? (
                      <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-lg leading-relaxed text-foreground font-medium"
                      >
                        {transcription}
                      </motion.p>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-muted-foreground italic gap-4">
                        <Loader2 className={`w-8 h-8 opacity-20 ${isProcessing ? 'animate-spin' : ''}`} />
                        <p className="text-sm">{isProcessing ? "Whisper model processing audio patterns..." : "Awaiting voice input signals..."}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          ) : activeTab === "uploads" ? (
            <div className="space-y-10">
               <div className="mb-10 text-center md:text-left space-y-2">
                <motion.h2 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl md:text-5xl font-black tracking-tight"
                >
                  File <span className="brand-text">Insights.</span>
                </motion.h2>
                <p className="text-muted-foreground text-lg">Upload existing media for high-precision transcription.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <Card 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed p-10 flex flex-col items-center justify-center text-center rounded-[2.5rem] transition-all relative overflow-hidden min-h-[450px] shadow-2xl shadow-primary/5 ${
                    isDragging 
                    ? "border-primary bg-primary/10 scale-[1.02]" 
                    : "border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40"
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="hidden"
                    accept="audio/*"
                  />
                  
                  {!selectedFile ? (
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-24 h-24 rounded-[2rem] bg-card flex items-center justify-center mb-8 shadow-2xl group-hover:scale-110 transition-transform">
                        <UploadCloud className={`w-10 h-10 transition-colors ${isDragging ? "text-primary" : "text-primary/60"}`} />
                      </div>
                      <h3 className="text-2xl font-black mb-3 italic">
                        {isDragging ? "Drop to Process" : "Drop Audio Intelligence"}
                      </h3>
                      <p className="text-muted-foreground max-w-xs mb-10">Select or drag MP3, WAV, or M4A files up to 50MB.</p>
                      <Button 
                        size="lg"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-primary text-primary-foreground font-black uppercase tracking-widest rounded-2xl px-10 h-14 shadow-xl shadow-primary/20"
                      >
                        Browse Files
                      </Button>
                    </div>
                  ) : (
                    <div className="relative z-10 w-full max-w-sm space-y-6">
                      <div className="p-6 rounded-[2rem] bg-card border-2 border-primary/20 flex items-center justify-between shadow-2xl">
                         <div className="flex items-center gap-4 text-left">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">
                            {selectedFile.name.split('.').pop()?.toUpperCase()}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-black truncate">{selectedFile.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedFile(null)} className="rounded-full text-red-500 hover:bg-red-500/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <Button 
                        size="lg"
                        className="w-full bg-gradient-to-r from-primary to-blue-600 font-black uppercase tracking-widest rounded-2xl h-14 shadow-xl shadow-primary/20"
                        onClick={async () => {
                          if (selectedFile) {
                            setIsProcessing(true);
                            await sendAudioToBackend(selectedFile);
                            setSelectedFile(null);
                          }
                        }}
                        disabled={isProcessing}
                      >
                        {isProcessing ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : null}
                        {isProcessing ? "Analyzing..." : "Process Audio"}
                      </Button>
                    </div>
                  )}
                </Card>

                {/* Result Area */}
                <Card className="border-border/50 bg-card/40 backdrop-blur-2xl flex flex-col shadow-xl rounded-[2.5rem] overflow-hidden border-2">
                  <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 py-5 px-8">
                    <div>
                      <CardTitle className="text-[10px] uppercase tracking-[0.2em] text-primary font-black">AI Output Stream</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => copyToClipboard(transcription)} title="Copy result" className="rounded-full hover:bg-primary/10">
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={clearTranscription} title="Clear" className="rounded-full hover:bg-red-500/10">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 flex-1 min-h-[300px]">
                    {transcription ? (
                      <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-lg leading-relaxed text-foreground font-medium"
                      >
                        {transcription}
                      </motion.p>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-muted-foreground italic gap-4">
                        <Loader2 className={`w-8 h-8 opacity-20 ${isProcessing ? 'animate-spin' : ''}`} />
                        <p className="text-sm">{isProcessing ? "Processing audio through Whisper..." : "Processing result will appear here..."}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "Multi-Format", desc: "Support for MP3, WAV, FLAC, M4A", icon: Mic },
                  { label: "High Fidelity", desc: "99.9% accuracy with Large-V3 model", icon: Star },
                  { label: "Global Ready", desc: "Supports 90+ languages automatically", icon: LayoutDashboard }
                ].map((feature, i) => (
                  <div key={i} className="flex gap-4 p-6 rounded-[1.5rem] border border-border/50 bg-muted/20">
                    <div className="w-10 h-10 shrink-0 rounded-lg bg-card/50 flex items-center justify-center text-primary border border-border/50">
                      <feature.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm mb-1">{feature.label}</h5>
                      <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === "analytics" ? (
             <div className="space-y-10">
                <div className="mb-10 text-center md:text-left space-y-2">
                <motion.h2 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl md:text-5xl font-black tracking-tight"
                >
                  Insights & <span className="brand-text">Performance.</span>
                </motion.h2>
                <p className="text-muted-foreground text-lg">Statistical breakdown of your voice intelligence usage.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <Card className="bg-card/30 backdrop-blur-3xl border-border/50 p-8 rounded-[3rem] border-2">
                  <h3 className="text-lg font-black uppercase tracking-widest text-primary mb-8 underline decoration-primary/20 underline-offset-8">Usage Over Time</h3>
                  <div className="h-64 flex items-end gap-3 pb-4">
                    {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: i * 0.1, duration: 1 }}
                          className="w-full bg-gradient-to-t from-primary/40 to-primary rounded-xl group-hover:from-primary/60 transition-all relative"
                        >
                           <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            {h}m
                           </div>
                        </motion.div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Day {i+1}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="bg-card/30 backdrop-blur-3xl border-border/50 p-8 rounded-[3rem] border-2">
                   <h3 className="text-lg font-black uppercase tracking-widest text-primary mb-8 underline decoration-primary/20 underline-offset-8">Language Distribution</h3>
                   <div className="space-y-6">
                      {[
                        { lang: "English", percent: 85, color: "bg-blue-500" },
                        { lang: "Hindi", percent: 10, color: "bg-purple-500" },
                        { lang: "Spanish", percent: 5, color: "bg-emerald-500" }
                      ].map((l, i) => (
                        <div key={i} className="space-y-2">
                           <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                            <span>{l.lang}</span>
                            <span className="text-primary">{l.percent}%</span>
                           </div>
                           <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${l.percent}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className={`h-full ${l.color} rounded-full`}
                              />
                           </div>
                        </div>
                      ))}
                   </div>
                </Card>
              </div>

              <Card className="bg-primary/5 border-primary/20 p-10 rounded-[3rem] border-2 text-center">
                 <h4 className="text-xl font-bold mb-4">Unlock Professional Analytics</h4>
                 <p className="text-muted-foreground text-sm max-w-md mx-auto mb-8">Get deep insights into team productivity, custom vocabulary performance, and sentiment analysis trends.</p>
                 <Button className="bg-primary text-primary-foreground font-black uppercase tracking-widest rounded-2xl px-10 h-14">Upgrade to Pro Studio</Button>
              </Card>
            </div>
          ) : activeTab === "starred" ? (
             <div className="space-y-10">
                <div className="mb-10 text-center md:text-left space-y-2">
                <motion.h2 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl md:text-5xl font-black tracking-tight"
                >
                  Priority <span className="brand-text">Archives.</span>
                </motion.h2>
                <p className="text-muted-foreground text-lg">Your most important voice collection sessions.</p>
              </div>

              <div className="flex flex-col items-center justify-center p-32 border-4 border-dashed border-border/50 rounded-[4rem] bg-muted/5 opacity-50">
                 <Star className="w-20 h-20 text-muted-foreground/20 mb-6" />
                 <p className="text-xl font-bold italic text-muted-foreground/40">Feature Launching in next update.</p>
                 <p className="text-sm text-muted-foreground/30 mt-2">Soon you&apos;ll be able to star important files for quick access.</p>
              </div>
            </div>
          ) : activeTab === "history" ? (
            <>
              <div className="mb-12 text-center md:text-left space-y-2">
                <motion.h2 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-4xl md:text-5xl font-black tracking-tight"
                >
                  Your <span className="brand-text">Archives.</span>
                </motion.h2>
                <p className="text-muted-foreground text-lg">Manage and review your previous voice intelligence sessions.</p>
              </div>

              {/* Search Bar */}
              <div className="mb-6 relative">
                <input
                  type="text"
                  placeholder="Search transcriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-card/30 backdrop-blur-3xl border border-border/50 rounded-2xl p-4 pl-12 focus:ring-2 focus:ring-primary/50 outline-none transition-all shadow-lg"
                />
                <History className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>

              <div className="space-y-4">
                {isLoadingHistory ? (
                  <div className="flex items-center justify-center p-20">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  </div>
                ) : history.length > 0 ? (
                  (searchTerm ? filteredHistory : history).map((item, index) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="border-border/50 bg-card/30 hover:bg-card/50 backdrop-blur-xl transition-all duration-300 overflow-hidden group rounded-2xl border-2 hover:border-primary/30 shadow-lg hover:shadow-primary/5">
                        <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                          <div className="grow min-w-0 w-full">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] font-black tracking-[0.1em] text-primary uppercase bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                                  {new Date(item.createdAt).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                                <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                   {new Date(item.createdAt).toLocaleTimeString(undefined, {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                {item.metadata?.duration && (
                                  <span className="text-[10px] font-bold text-primary/60 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDuration(item.metadata.duration)}
                                  </span>
                                )}
                            </div>
                            
                            {editingId === item._id ? (
                              <div className="space-y-3 w-full">
                                <textarea
                                  value={editingText}
                                  onChange={(e) => setEditingText(e.target.value)}
                                  className="w-full bg-muted/30 border border-primary/30 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none min-h-[100px]"
                                  autoFocus
                                />
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    disabled={isUpdating}
                                    onClick={() => handleUpdateTranscription(item._id)}
                                    className="bg-primary text-primary-foreground font-bold rounded-lg"
                                  >
                                    {isUpdating && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
                                    Save
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => setEditingId(null)}
                                    className="text-muted-foreground hover:bg-muted font-bold rounded-lg"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-foreground line-clamp-2 leading-relaxed mb-4">
                                {item.transcribedText}
                              </p>
                            )}
                            
                            {item.audioUrl && (
                              <div className="flex items-center gap-3 bg-muted/30 p-2 rounded-xl border border-white/5 max-w-xs transition-colors hover:bg-muted/50">
                                <audio 
                                  src={getFullAudioUrl(item.audioUrl)} 
                                  controls 
                                  className="h-8 w-full scale-90 -ml-4 opacity-70 hover:opacity-100 transition-opacity" 
                                />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end sm:justify-start">
                             <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-9 w-9 p-0 hover:bg-primary/10 text-primary" 
                              onClick={() => {
                                setEditingId(item._id)
                                setEditingText(item.transcribedText)
                              }}
                              title="Edit"
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-9 w-9 p-0 hover:bg-primary/10 text-primary" 
                              onClick={() => copyToClipboard(item.transcribedText)}
                              title="Copy Text"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-9 w-9 p-0 hover:bg-emerald-500/10 text-emerald-500" 
                              onClick={() => exportAsTxt(item.transcribedText, item.createdAt)}
                              title="Download .txt"
                            >
                              <History className="h-4 w-4 rotate-180" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-9 w-9 p-0 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                              onClick={() => deleteHistoryItem(item._id)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <Card className="border-dashed border-border p-20 text-center bg-transparent">
                    <History className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">No transcriptions found. Start recording to see them here!</p>
                  </Card>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-8 pb-10">
              <div className="mb-12 text-center md:text-left space-y-2">
                <motion.h2 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-4xl md:text-5xl font-black tracking-tight"
                >
                  Studio <span className="brand-text">Preferences.</span>
                </motion.h2>
                <p className="text-muted-foreground text-lg">Configure your workspace and account identity.</p>
              </div>

              {/* Profile Section */}
              <Card className="border-border/50 bg-card/30 backdrop-blur-3xl p-8 rounded-3xl shadow-xl">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" /> Profile Information
                </h3>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/20 rounded-xl border border-white/5">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Email Address</p>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                    <span className="mt-2 sm:mt-0 text-xs font-medium text-green-500 bg-green-500/10 px-3 py-1 rounded-full w-fit"> Verified</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/20 rounded-xl border border-white/5">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Account Status</p>
                      <p className="font-medium">Free Tier</p>
                    </div>
                    <Button variant="outline" size="sm" className="mt-2 sm:mt-0 border-primary/20 hover:bg-primary/10">Upgrade Plan</Button>
                  </div>
                </div>
              </Card>

              {/* Preferences Section */}
              <Card className="border-border bg-card/40 backdrop-blur-sm p-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" /> Transcription Preferences
                </h3>
                <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-muted-foreground">Default Language</label>
                    <select 
                      value={transcriptionLanguage}
                      onChange={(e) => setTranscriptionLanguage(e.target.value)}
                      className="bg-muted/30 border border-white/10 rounded-lg p-2 focus:ring-2 focus:ring-primary/50 outline-none"
                    >
                      <option value="en">English (Global)</option>
                      <option value="hi">Hindi (India)</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="it">Italian</option>
                      <option value="ar">Arabic</option>
                      <option value="mr">Marathi</option>
                      <option value="ne">Nepali</option>
                      <option value="ur">Urdu</option>
                      {/* <option value="bn">Bengali</option> */}
                      <option value="auto">Auto-detect Language</option>
                    </select>
                    <p className="text-[10px] text-muted-foreground italic">Note: Multi-language support uses the Whisper Medium model for high accuracy.</p>
                  </div>
                </div>
              </Card>

              {/* Danger Zone */}
              <Card className="border-red-500/20 bg-red-500/5 backdrop-blur-3xl p-8 rounded-3xl border-2 shadow-2xl shadow-red-500/5">
                <h3 className="text-xl font-bold mb-6 text-red-500 flex items-center gap-3">
                  <AlertCircle className="w-6 h-6" /> Danger Zone
                </h3>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">Wipe All Archives</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-sm leading-relaxed">This will permanently delete all your previous recordings and transcriptions. This action is irreversible.</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/40 rounded-2xl h-12 px-6 font-bold"
                    onClick={clearAllHistory}
                  >
                    Delete Everything
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </section>
      </main>

      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        description={modalConfig.description}
        confirmText={modalConfig.confirmText}
        variant={modalConfig.variant}
      />
    </div>
  )
}
