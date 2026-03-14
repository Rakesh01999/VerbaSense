"use client"

import React, { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/context/ToastContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Square, Loader2, LogOut, History, Settings, User, Copy, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const { showToast } = useToast()
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcription, setTranscription] = useState("")
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false)
      setIsProcessing(true)
      // Simulate backend processing
      setTimeout(() => {
        setIsProcessing(false)
        setTranscription("This is a simulated transcription from VerbaSense using OpenAI's Whisper model. Our system accurately captures your voice and converts it to text in seconds.")
        showToast("Transcription complete!", "success")
      }, 2000)
    } else {
      setIsRecording(true)
      setTranscription("")
    }
  }

  const copyToClipboard = () => {
    if (!transcription) return
    navigator.clipboard.writeText(transcription)
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
            { icon: Mic, label: "Recorder", active: true },
            { icon: History, label: "History" },
            { icon: Settings, label: "Settings" }
          ].map((item) => (
            <Button 
              key={item.label}
              variant="ghost" 
              className={`w-full group relative transition-all duration-200 ${
                isSidebarCollapsed ? "justify-center px-0" : "justify-start px-3"
              } ${item.active ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"}`}
              title={isSidebarCollapsed ? item.label : ""}
            >
              {item.active && !isSidebarCollapsed && (
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
          <div className="mb-8">
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
                  <Button variant="ghost" size="icon" onClick={copyToClipboard} title="Copy result">
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
        </section>
      </main>
    </div>
  )
}
