"use client"

import React from "react"
import PageHero from "@/components/PageHero"
import BackgroundEffects from "@/components/BackgroundEffects"
import { motion } from "framer-motion"

export default function AboutUsPage() {
  const values = [
    { title: "Precision", description: "Every word matters. We strive for 99%+ accuracy in all conditions." },
    { title: "Privacy", description: "Your data is yours. We never train our models on your private audio." },
    { title: "Innovation", description: "Pushing the boundaries of what's possible with neural speech processing." },
  ]

  return (
    <main className="min-h-screen bg-background text-foreground">
      <BackgroundEffects />
      
      <PageHero 
        badge="OUR STORY"
        title="We Humanize Speech Interaction"
        subtitle="VerbaSense was founded with a simple mission: to bridge the gap between spoken word and digital action."
      />

      <section className="container mx-auto px-6 py-20">
        <div className="max-w-3xl mx-auto space-y-12">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="prose prose-invert max-w-none"
          >
            <p className="text-xl text-muted-foreground leading-relaxed">
              Based in the intersection of linguistic research and deep learning, our team of engineers and linguists work tirelessly to build the most accurate voice-to-text engine on the planet.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-secondary/30 border border-border"
              >
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
