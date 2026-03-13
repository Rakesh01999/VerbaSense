"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { MicOff, Home, ArrowLeft, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] left-[20%] w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-2xl w-full text-center relative z-10">
        {/* Animated Icon Area */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-12 relative inline-block"
        >
          <div className="w-32 h-32 rounded-[2.5rem] bg-card border border-border flex items-center justify-center shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <MicOff className="w-16 h-16 text-muted-foreground relative z-10" />
          </div>
          
          {/* Audio Waveform "Flatline" */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <motion.div
                key={i}
                animate={{ 
                  height: [4, 4, 4],
                  opacity: [0.2, 0.5, 0.2] 
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1.5, 
                  delay: i * 0.1 
                }}
                className="w-1.5 h-1 bg-purple-500 rounded-full"
              />
            ))}
          </div>
        </motion.div>

        {/* Text Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-7xl md:text-9xl font-black text-foreground tracking-tighter mb-4">
            4<span className="text-purple-500">0</span>4
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 uppercase tracking-widest">
            Signal Not Found
          </h2>
          <p className="text-muted-foreground text-lg mb-12 max-w-md mx-auto leading-relaxed">
            The page you're looking for has faded into silence. It might have been moved, deleted, or never existed in the first place.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6 font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/10">
            <Link href="/">
              <Home className="w-5 h-5" /> Return Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-border text-foreground hover:bg-accent rounded-full px-8 py-6 font-bold flex items-center gap-2 transition-all">
            <button onClick={() => window.history.back()}>
              <ArrowLeft className="w-5 h-5" /> Go Back
            </button>
          </Button>
        </motion.div>

        {/* Troubleshooting Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-20 pt-10 border-t border-border flex wrap justify-center gap-8 text-xs font-mono uppercase tracking-widest text-muted-foreground"
        >
          <Link href="/help" className="hover:text-foreground transition-colors flex items-center gap-2">
            <Search className="w-3 h-3" /> Search Help
          </Link>
          <Link href="/status" className="hover:text-foreground transition-colors">System Status</Link>
          <Link href="/contact" className="hover:text-foreground transition-colors">Support</Link>
        </motion.div>
      </div>
    </div>
  )
}
