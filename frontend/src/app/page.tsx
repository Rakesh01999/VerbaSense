import Link from "next/link"
import { Mic, ArrowRight, Shield, Zap, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-center px-4 overflow-hidden relative selection:bg-purple-500/30">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center max-w-5xl">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/20 mb-10 transition-transform hover:rotate-6 hover:scale-110 duration-500 cursor-pointer">
          <Mic className="text-white w-10 h-10" />
        </div>
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-xs font-medium mb-6 backdrop-blur-sm">
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span>New: Real-time Whisper v3 integration</span>
        </div>

        <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter mb-6 leading-none">
          Verba<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400">Sense</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mb-12 font-medium leading-relaxed">
          The most accurate AI-powered speech-to-text platform. 
          Bridge the gap between voice and text with precision.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <Button asChild size="lg" className="bg-white text-black hover:bg-zinc-200 text-lg px-10 py-8 rounded-2xl font-bold transition-all hover:translate-y-[-2px] hover:shadow-xl active:translate-y-0">
            <Link href="/login" className="flex items-center">
              Enter Platform <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-white/10 text-white hover:bg-white/5 text-lg px-10 py-8 rounded-2xl font-bold transition-all">
            <Link href="/register">Create Free Account</Link>
          </Button>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {[
            { icon: <Zap className="w-6 h-6 text-yellow-400" />, title: "Instant Processing", desc: "Powered by optimized Whisper weights for near-zero latency." },
            { icon: <Shield className="w-6 h-6 text-green-400" />, title: "Secure & Private", desc: "End-to-end encryption for all your audio data and transcripts." },
            { icon: <Mic className="w-6 h-6 text-blue-400" />, title: "High Accuracy", desc: "Supports 90+ languages with state-of-the-art error correction." }
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 text-left backdrop-blur-md hover:bg-white/[0.04] transition-colors">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-20 pt-10 border-t border-white/5 w-full flex flex-col md:flex-row items-center justify-between gap-6 opacity-40">
          <span className="text-zinc-500 font-mono text-xs tracking-widest uppercase">© 2026 VerbaSense AI Systems</span>
          <div className="flex gap-8 text-zinc-500 font-mono text-xs uppercase tracking-widest">
            <span>Next.js 15</span>
            <span>Tailwind 4</span>
            <span>Whisper v3</span>
          </div>
        </div>
      </div>
    </div>
  )
}
