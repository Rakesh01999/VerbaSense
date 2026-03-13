"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Mic, Square, Loader2, LogOut, History, Settings, User, Copy, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcription, setTranscription] = useState("")

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false)
      setIsProcessing(true)
      // Simulate backend processing
      setTimeout(() => {
        setIsProcessing(false)
        setTranscription("This is a simulated transcription from VerbaSense using OpenAI's Whisper model. Our system accurately captures your voice and converts it to text in seconds.")
      }, 2000)
    } else {
      setIsRecording(true)
      setTranscription("")
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transcription)
  }

  const clearTranscription = () => {
    setTranscription("")
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 flex flex-col p-4 bg-zinc-900/20 backdrop-blur-md hidden md:flex">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <Mic className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl">VerbaSense</span>
        </div>

        <nav className="flex-1 space-y-1">
          <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white hover:bg-white/5">
            <Mic className="mr-2 w-4 h-4" /> Recorder
          </Button>
          <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white hover:bg-white/5">
            <History className="mr-2 w-4 h-4" /> History
          </Button>
          <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white hover:bg-white/5">
            <Settings className="mr-2 w-4 h-4" /> Settings
          </Button>
        </nav>

        <div className="mt-auto pt-4 border-t border-white/10 space-y-2">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
              <User className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium truncate w-32">{user?.email?.split('@')[0]}</span>
              <span className="text-xs text-zinc-500">Free Plan</span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
            onClick={logout}
          >
            <LogOut className="mr-2 w-4 h-4" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-6 overflow-y-auto">
        <header className="flex justify-between items-center mb-8 md:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl">VerbaSense</span>
          </div>
          <Button variant="ghost" size="icon" onClick={logout}>
            <LogOut className="w-5 h-5 text-zinc-400" />
          </Button>
        </header>

        <section className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Speech-to-Text</h2>
            <p className="text-zinc-500">Record your voice and let VerbaSense handle the rest.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 flex-1">
            {/* Recording Area */}
            <Card className="border-white/10 bg-zinc-900/50 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center relative overflow-hidden min-h-[400px]">
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
                  <p className="text-zinc-500">
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
            <Card className="border-white/10 bg-zinc-900/50 backdrop-blur-xl flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between border-b border-white/5">
                <div>
                  <CardTitle className="text-sm uppercase tracking-wider text-zinc-500 font-bold">Transcription Result</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={copyToClipboard} title="Copy result">
                    <Copy className="w-4 h-4 text-zinc-400" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={clearTranscription} title="Clear">
                    <Trash2 className="w-4 h-4 text-red-400 text-zinc-400" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 flex-1 min-h-[200px]">
                {transcription ? (
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-lg leading-relaxed text-zinc-100"
                  >
                    {transcription}
                  </motion.p>
                ) : (
                  <div className="h-full flex items-center justify-center text-zinc-600 italic">
                    {isProcessing ? "Whisper AI is working..." : "Transcription will appear here..."}
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
