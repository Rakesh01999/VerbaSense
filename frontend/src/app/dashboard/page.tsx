"use client"

import React, { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/context/ToastContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Square, Loader2, LogOut, History, Settings, User, Copy, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"

interface TranscriptionItem {
  _id: string;
  transcribedText: string;
  createdAt: string;
  metadata?: {
    size: number;
    format: string;
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
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const [transcriptionLanguage, setTranscriptionLanguage] = useState("en")

  // Fetch history on mount or tab change
  React.useEffect(() => {
    if (activeTab === "history") {
      fetchHistory()
    }
  }, [activeTab])

  const fetchHistory = async () => {
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
  }

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
      setAudioChunks(chunks)
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
      formData.append('audio', audioBlob, 'recording.wav')
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

  const handleLogout = () => {
    logout()
    showToast("Signed out successfully. See you soon!", "info")
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex pt-20 overflow-x-hidden">
      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-20 bottom-0 z-40 border-r border-border flex flex-col p-4 bg-muted/30 backdrop-blur-xl hidden md:flex transition-all duration-300 shadow-[20px_0_50px_rgba(0,0,0,0.1)] ${
          isSidebarCollapsed ? "w-20" : "w-64"
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

        <div className={`flex items-center gap-3 mb-8 px-2 ${isSidebarCollapsed ? "justify-center" : ""}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
            <Mic className="w-5 h-5 text-white" />
          </div>
          {!isSidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              {/* <span className="font-bold text-lg tracking-tight leading-none">VerbaSense</span> */}
              <span className="font-bold text-lg tracking-tight leading-none">Dashboard</span>
              {/* <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Transcription</span> */}
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
              className={`w-full group relative transition-all duration-200 ${
                isSidebarCollapsed ? "justify-center px-0" : "justify-start px-3"
              } ${activeTab === item.id ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"}`}
              title={isSidebarCollapsed ? item.label : ""}
              onClick={() => setActiveTab(item.id)}
            >
              {activeTab === item.id && !isSidebarCollapsed && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-6 bg-primary rounded-r-full" 
                />
              )}
              <item.icon className={`${isSidebarCollapsed ? "" : "mr-3"} w-5 h-5 shrink-0 transition-transform group-hover:scale-110`} />
              {!isSidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-medium"
                >
                  {item.label}
                </motion.span>
              )}
            </Button>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-border/50 space-y-4">
          <div className={`flex items-center gap-3 px-2 py-2 rounded-xl transition-colors ${isSidebarCollapsed ? "justify-center" : "bg-accent/30"}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent to-muted flex items-center justify-center shrink-0 border border-border">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            {!isSidebarCollapsed && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col min-w-0"
              >
                <span className="text-sm font-bold truncate text-foreground">{user?.email?.split('@')[0]}</span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Free Plan</span>
                </div>
              </motion.div>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            className={`w-full hover:text-red-300 hover:bg-red-500/10 text-red-400/80 transition-all ${
              isSidebarCollapsed ? "justify-center px-0" : "justify-start px-3"
            }`}
            onClick={handleLogout}
            title={isSidebarCollapsed ? "Logout" : ""}
          >
            <LogOut className={`${isSidebarCollapsed ? "" : "mr-3"} w-5 h-5 shrink-0 transition-transform group-hover:-translate-x-1`} />
            {!isSidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-medium"
              >
                Logout
              </motion.span>
            )}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main 
        className={`flex-1 flex flex-col p-6 overflow-y-auto transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        <header className="flex justify-between items-center mb-8 md:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl">VerbaSense</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-5 h-5 text-muted-foreground" />
          </Button>
        </header>

        <section className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
          {activeTab === "recorder" ? (
            <>
              <div className="mb-8 text-center md:text-left">
                <h2 className="text-3xl font-bold mb-2">Speech-to-Text</h2>
                <p className="text-muted-foreground">Record your voice and let VerbaSense handle the rest.</p>
              </div>

              <div className="grid grid-cols-1 gap-6 flex-1">
                {/* Recording Area */}
                <Card className="border-border bg-card/50 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center relative overflow-hidden min-h-[400px]">
                  {/* Background gradient pulses when recording */}
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
                    <div className="mt-6 flex bg-muted/50 p-1 rounded-xl border border-white/5 relative z-20">
                      <button
                        type="button"
                        onClick={() => setTranscriptionLanguage("en")}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          transcriptionLanguage === "en" 
                          ? "bg-primary text-primary-foreground shadow-lg" 
                          : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        English
                      </button>
                      <button
                        type="button"
                        onClick={() => setTranscriptionLanguage("hi")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          transcriptionLanguage === "hi" 
                          ? "bg-primary text-primary-foreground shadow-lg" 
                          : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Hindi
                      </button>
                      <button
                        type="button"
                        onClick={() => setTranscriptionLanguage("bn")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          transcriptionLanguage === "bn" 
                          ? "bg-primary text-primary-foreground shadow-lg" 
                          : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Bengali
                      </button>
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
                <Card className="border-border bg-card/50 backdrop-blur-xl flex flex-col">
                  <CardHeader className="flex flex-row items-center justify-between border-b border-white/5">
                    <div>
                      <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground font-bold">Transcription Result</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => copyToClipboard(transcription)} title="Copy result">
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={clearTranscription} title="Clear">
                        <Trash2 className="w-4 h-4 text-red-400 text-muted-foreground" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 flex-1 min-h-[200px]">
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
              <div className="mb-8 text-center md:text-left">
                <h2 className="text-3xl font-bold mb-2">Transcription History</h2>
                <p className="text-muted-foreground">Manage your previous voice recordings and texts.</p>
              </div>

              <div className="space-y-4">
                {isLoadingHistory ? (
                  <div className="flex items-center justify-center p-20">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  </div>
                ) : history.length > 0 ? (
                  history.map((item, index) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="border-border bg-card/40 hover:bg-card/60 backdrop-blur-sm transition-colors overflow-hidden">
                        <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                          <div className="grow min-w-0 w-full">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                {new Date(item.createdAt).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(item.createdAt).toLocaleTimeString(undefined, {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <p className="text-sm text-foreground line-clamp-2 leading-relaxed">
                              {item.transcribedText}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end sm:justify-start">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0" 
                              onClick={() => copyToClipboard(item.transcribedText)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                              onClick={() => deleteHistoryItem(item._id)}
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
              <div className="mb-8 text-center md:text-left">
                <h2 className="text-3xl font-bold mb-2">Settings</h2>
                <p className="text-muted-foreground">Manage your account and transcription preferences.</p>
              </div>

              {/* Profile Section */}
              <Card className="border-border bg-card/40 backdrop-blur-sm p-6">
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
                      <option value="bn">Bengali</option>
                      <option value="auto">Auto-detect</option>
                    </select>
                    <p className="text-[10px] text-muted-foreground italic">Note: Multilingual support enabled (Whisper Medium model).</p>
                  </div>
                </div>
              </Card>

              {/* Danger Zone */}
              <Card className="border-red-500/20 bg-red-500/5 backdrop-blur-sm p-6">
                <h3 className="text-lg font-semibold mb-6 text-red-400 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" /> Danger Zone
                </h3>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-red-200">Clear Transcription History</p>
                    <p className="text-xs text-red-400/60 max-w-sm">This will permanently delete all your previous recordings and transcriptions. This action cannot be reversed.</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
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
