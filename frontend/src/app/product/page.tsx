"use client"

import React from "react"
import PageHero from "@/components/PageHero"
import BackgroundEffects from "@/components/BackgroundEffects"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, Zap, BarChart3, ShieldCheck } from "lucide-react"

export default function ProductPage() {
  const products = [
    {
      title: "Voice Transcription",
      description: "Convert audio to text with industry-leading accuracy in real-time or batch mode.",
      icon: <Mic className="w-8 h-8 text-purple-500" />,
    },
    {
      title: "Real-time Analytics",
      description: "Analyze voice patterns and sentiment as the speech happens.",
      icon: <BarChart3 className="w-8 h-8 text-blue-500" />,
    },
    {
      title: "Lightning Speed",
      description: "Ultra-low latency processing powered by our custom neural engine.",
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
    },
    {
      title: "Enterprise Security",
      description: "End-to-end encryption and SOC2 compliance for your sensitive data.",
      icon: <ShieldCheck className="w-8 h-8 text-green-500" />,
    },
  ]

  return (
    <main className="min-h-screen bg-background text-foreground">
      <BackgroundEffects />
      
      <PageHero 
        badge="THE PRODUCT"
        title="Revolutionize Your Voice Workflow"
        subtitle="VerbaSense combines cutting-edge AI with an intuitive interface to transform how you interact with speech data."
      />

      <section className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full bg-card/40 backdrop-blur-xl border-border hover:border-purple-500/50 transition-colors">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mb-6 shadow-inner">
                    {product.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{product.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  )
}
