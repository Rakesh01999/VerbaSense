"use client"

import React, { useState, useCallback } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/context/ToastContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { Mic, Square, Loader2, LogOut, History, Settings, User, Copy, Trash2, ChevronLeft, ChevronRight, Clock, AlertCircle } from "lucide-react"
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
  
  const [activeTab, setActiveTab] = useState("recorder")
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
    if (activeTab === "history") {
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
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
    const baseUrl = apiBase.replace("/api", "")
    return `${baseUrl}/${path}`
  }

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

        <div className={`flex items-center gap-4 mb-10 px-3 ${isSidebarCollapsed ? "justify-center" : ""}`}>
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

        <nav className="flex-1 space-y-2">
          {[
            { icon: Mic, label: "Recorder", id: "recorder" },
            { icon: History, label: "History", id: "history" },
            { icon: Settings, label: "Settings", id: "settings" }
          ].map((item) => (
            <Button 
              key={item.id}
              variant="ghost" 
              className={`w-full group relative h-14 transition-all duration-300 ${
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
                  className="absolute left-0 w-1.5 h-8 bg-primary rounded-r-full shadow-[2px_0_10px_rgba(var(--primary),0.5)]" 
                />
              )}
              <item.icon className={`${isSidebarCollapsed ? "" : "mr-4"} w-6 h-6 shrink-0 transition-all duration-300 group-hover:scale-110 ${activeTab === item.id ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground"}`} />
              {!isSidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`font-semibold text-base ${activeTab === item.id ? "text-primary" : ""}`}
                >
                  {item.label}
                </motion.span>
              )}
            </Button>
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

        <section className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
          {activeTab === "recorder" ? (
            <>
              <div className="mb-12 text-center md:text-left space-y-2">
                <motion.h2 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl md:text-5xl font-black tracking-tight"
                >
                  Beyond <span className="brand-text">Speech.</span>
                </motion.h2>
                <p className="text-muted-foreground text-lg max-w-2xl">Precision voice-to-text intelligence. Powered by Open-Source models.</p>
              </div>

              <div className="grid grid-cols-1 gap-10 flex-1">
                {/* Recording Area */}
                <Card className="border-border/50 bg-card/30 backdrop-blur-3xl flex flex-col items-center justify-center p-16 text-center relative overflow-hidden min-h-[450px] shadow-2xl shadow-primary/5 rounded-[2.5rem] border-2">
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
                        {isRecording ? "Recording..." : isProcessing ? "Processing Audio..." : "Start Recording"}
                      </h3>
                      <p className="text-muted-foreground">
                        {isRecording ? "Tap to finish transcription" : "Your voice patterns will be processed securely"}
                      </p>
                    </div>
                    
                    {/* Quick Language Toggle */}
                    <div className="mt-6 flex flex-wrap justify-center bg-muted/50 p-1 rounded-xl border border-white/5 relative z-20 max-w-sm gap-1">
                      {[
                        { id: 'en', label: 'English' },
                        { id: 'hi', label: 'Hindi' },
                        { id: 'es', label: 'Spanish' },
                        { id: 'ar', label: 'Arabic' },
                        { id: 'mr', label: 'Marathi' },
                        { id: 'auto', label: 'Auto' }
                      ].map((lang) => (
                        <button
                          key={lang.id}
                          type="button"
                          onClick={() => setTranscriptionLanguage(lang.id)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                            transcriptionLanguage === lang.id 
                            ? "bg-primary text-primary-foreground shadow-lg" 
                            : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {lang.label}
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

                    {/* File Upload Option */}
                    <div className="mt-10 w-full max-w-md">
                      <div className="relative border-t border-white/10 pt-8 mt-4 flex flex-col items-center">
                        <span className="absolute -top-3 px-4 bg-muted/30 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">OR</span>
                        
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          className="hidden"
                          accept="audio/*"
                        />
                        
                        {!selectedFile ? (
                          <Button
                            variant="outline"
                            className="w-full h-14 border-dashed border-white/20 hover:border-primary/50 hover:bg-primary/5 group"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isRecording || isProcessing}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                <History className="w-4 h-4 rotate-180" />
                              </div>
                              <div className="text-left">
                                <p className="text-sm font-semibold">Upload Audio File</p>
                                <p className="text-[10px] text-muted-foreground">MP3, WAV, M4A up to 50MB</p>
                              </div>
                            </div>
                          </Button>
                        ) : (
                          <div className="w-full space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/20">
                              <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                                  <Mic className="w-5 h-5" />
                                </div>
                                <div className="overflow-hidden">
                                  <p className="text-sm font-bold truncate">{selectedFile.name}</p>
                                  <p className="text-[10px] text-muted-foreground">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-red-400"
                                onClick={() => setSelectedFile(null)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <Button
                              className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/20"
                              onClick={async () => {
                                if (selectedFile) {
                                  setIsProcessing(true);
                                  await sendAudioToBackend(selectedFile);
                                  setSelectedFile(null);
                                }
                              }}
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : null}
                              {isProcessing ? "Processing..." : "Transcribe File"}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Result Area */}
                <Card className="border-border/50 bg-card/40 backdrop-blur-2xl flex flex-col shadow-xl rounded-[2rem] overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 py-5 px-8">
                    <div>
                      <CardTitle className="text-xs uppercase tracking-[0.2em] text-primary font-black">Live Output</CardTitle>
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
                  <CardContent className="p-8 flex-1 min-h-[250px]">
                    {transcription ? (
                      <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-lg leading-relaxed text-foreground"
                      >
                        {transcription}
                      </motion.p>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground italic">
                        {isProcessing ? "Processing audio signal..." : "Transcription will appear here..."}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
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
