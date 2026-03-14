"use client"

import React from "react"
import PageHero from "@/components/PageHero"
import BackgroundEffects from "@/components/BackgroundEffects"
import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"

export default function FeaturesPage() {
  const features = [
    {
      title: "Multi-Language Support",
      description: "Support for over 100 languages and dialects with automatic language detection.",
    },
    {
      title: "Punctuation & Formatting",
      description: "Smart punctuation, capitalization, and formatting for structured, readable text.",
    },
    {
      title: "Speaker Diarization",
      description: "Accurately identify and label different speakers in a single audio file.",
    },
    {
      title: "Custom Vocabulary",
      description: "Boost accuracy for industry-specific terms, acronyms, and proper names.",
    },
    {
      title: "Asynchronous API",
      description: "Process large audio files in the background with webhook notifications.",
    },
    {
      title: "Live Streaming",
      description: "Low-latency streaming API for real-time applications and captions.",
    },
  ]

  return (
    <main className="min-h-screen bg-background text-foreground">
      <BackgroundEffects />
      
      <PageHero 
        badge="FEATURES"
        title="Powerful Features for Every Need"
        subtitle="Explore the capabilities that make VerbaSense the leading choice for professional voice-to-text applications."
      />

      <section className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-start"
            >
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  )
}
