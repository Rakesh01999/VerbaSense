"use client"

import React from "react"
import PageHero from "@/components/PageHero"
import BackgroundEffects from "@/components/BackgroundEffects"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export default function CareersPage() {
  const jobs = [
    { title: "Machine Learning Engineer", location: "Remote / SF", type: "Full-time" },
    { title: "Senior Backend Engineer (Go)", location: "Remote / London", type: "Full-time" },
    { title: "Product Designer", location: "Remote", type: "Full-time" },
    { title: "Developer Advocate", location: "Global Remote", type: "Contract" },
  ]

  return (
    <main className="min-h-screen bg-background text-foreground">
      <BackgroundEffects />
      
      <PageHero 
        badge="WE ARE HIRING"
        title="Shape the Future of Speech"
        subtitle="Join our global team and build the infra that powers the voice-first revolution."
      />

      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="mb-16 text-center">
             <h2 className="text-3xl font-bold mb-4">Open Positions</h2>
             <p className="text-muted-foreground">Don't see a role that fits? Email us anyway!</p>
          </div>

          <div className="space-y-4">
            {jobs.map((job, index) => (
              <motion.div
                key={job.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group p-6 rounded-2xl bg-secondary/20 border border-border hover:border-purple-500/50 flex items-center justify-between transition-all"
              >
                <div>
                  <h3 className="text-xl font-bold mb-1 group-hover:text-purple-400 transition-colors">{job.title}</h3>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{job.location}</span>
                    <span>•</span>
                    <span>{job.type}</span>
                  </div>
                </div>
                <Button variant="outline" className="rounded-full px-6 group-hover:bg-purple-600 group-hover:text-white transition-all">
                  Apply
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
