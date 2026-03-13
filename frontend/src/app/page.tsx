"use client"

import Link from "next/link"
import { Mic, ArrowRight, Shield, Zap, Sparkles, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function Home() {
  return (
    <div className="relative min-h-screen pt-20 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/15 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-6 py-20 relative z-10 flex flex-col items-center text-center">
        {/* Animated Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary border border-border text-muted-foreground text-sm font-medium mb-8 backdrop-blur-md"
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>New: Real-time Whisper v3 integration</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl md:text-8xl font-black text-foreground tracking-tighter mb-8 leading-[1.1]"
        >
          Transform Your Voice into <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 px-2 pb-1">
            Digital Intelligence
          </span>
        </motion.h1>

        {/* Hero Description */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-3xl mb-12 font-medium leading-relaxed"
        >
          The most accurate AI-powered speech-to-text platform. 
          Bridge the gap between voice and text with state-of-the-art neural networks.
          Experience precision, speed, and privacy in one seamless interface.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-5 mb-24"
        >
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-7 rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/10">
            <Link href="/register" className="flex items-center">
              Start Building Free <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-border text-foreground hover:bg-accent text-lg px-8 py-7 rounded-full font-bold transition-all">
            <Link href="/login" className="flex items-center gap-2">
              <Play className="w-4 h-4 fill-current" /> Live Demo
            </Link>
          </Button>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mt-12">
          {[
            { 
              icon: <Zap className="w-6 h-6 text-yellow-500" />, 
              title: "Instant Processing", 
              desc: "Optimized Whisper weights for latency-sensitive applications and real-time streams.",
              gradient: "from-yellow-500/10 to-transparent"
            },
            { 
              icon: <Shield className="w-6 h-6 text-blue-500" />, 
              title: "Secure & Private", 
              desc: "Enterprise-grade encryption for all audio data. Your transcripts never leave your control.",
              gradient: "from-blue-500/10 to-transparent"
            },
            { 
              icon: <Sparkles className="w-6 h-6 text-purple-500" />, 
              title: "99% Accuracy", 
              desc: "Supports 90+ languages with contextual understanding and speaker diarization.",
              gradient: "from-purple-500/10 to-transparent"
            }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + (i * 0.1) }}
              whileHover={{ y: -10 }}
              className="relative p-10 rounded-[2.5rem] bg-card/60 border border-border text-left backdrop-blur-3xl overflow-hidden group shadow-sm"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative z-10">
                <div className="mb-6 p-3 w-fit rounded-2xl bg-secondary border border-border">{feature.icon}</div>
                <h3 className="text-xl font-bold text-foreground mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
