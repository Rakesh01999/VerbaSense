"use client"

import React from "react"
import PageHero from "@/components/PageHero"
import BackgroundEffects from "@/components/BackgroundEffects"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function BlogPage() {
  const posts = [
    {
      title: "The Future of Voice-First Interfaces",
      excerpt: "Why the next decade of computing will be defined by how we talk to our devices.",
      date: "March 15, 2026",
      category: "Trends",
    },
    {
      title: "Optimizing Speech Models for Low Latency",
      excerpt: "A deep dive into our custom inference engine and how we achieves sub-100ms response times.",
      date: "March 10, 2026",
      category: "Engineering",
    },
    {
      title: "Privacy-Preserving Speech Recognition",
      excerpt: "How VerbaSense uses federated learning and on-device processing to keep data secure.",
      date: "March 5, 2026",
      category: "Security",
    },
  ]

  return (
    <main className="min-h-screen bg-background text-foreground">
      <BackgroundEffects />
      
      <PageHero 
        badge="BLOG"
        title="Insights From the Frontier"
        subtitle="Latest news, engineering deep-dives, and industry trends from the VerbaSense team."
      />

      <section className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <motion.div
              key={post.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full bg-card/40 border-border hover:border-purple-500/50 transition-all group overflow-hidden">
                <div className="aspect-video bg-secondary/50 relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 group-hover:scale-110 transition-transform duration-500" />
                </div>
                <CardContent className="p-6">
                  <span className="text-xs font-semibold text-purple-400 uppercase tracking-widest">{post.category}</span>
                  <h3 className="text-xl font-bold mt-2 mb-3 cursor-pointer hover:text-purple-400 transition-colors">{post.title}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-2">{post.excerpt}</p>
                </CardContent>
                <CardFooter className="p-6 pt-0 flex justify-between items-center">
                  <span className="text-xs text-muted-foreground/60">{post.date}</span>
                  <Button variant="link" className="text-purple-400 p-0 h-auto">Read More →</Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  )
}
