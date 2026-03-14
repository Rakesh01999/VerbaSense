"use client"

import React from "react"
import PageHero from "@/components/PageHero"
import BackgroundEffects from "@/components/BackgroundEffects"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Layers, Puzzle, Code2, Globe } from "lucide-react"

export default function IntegrationsPage() {
  const integrations = [
    {
      title: "Cloud Storage",
      description: "Directly process audio files from S3, Google Cloud Storage, and Azure Blob.",
      icon: <Layers className="w-6 h-6 text-blue-500" />,
    },
    {
      title: "Workflow Automation",
      description: "Connect with Zapier, Make, and Pipedrive to automate your transcriptions.",
      icon: <Puzzle className="w-6 h-6 text-purple-500" />,
    },
    {
      title: "Developer SDKs",
      description: "Libraries for Python, Node.js, Go, and Java to get started in minutes.",
      icon: <Code2 className="w-6 h-6 text-green-500" />,
    },
    {
      title: "Global CDN",
      description: "Edge processing sites around the world for ultra-fast local uploads.",
      icon: <Globe className="w-6 h-6 text-orange-500" />,
    },
  ]

  return (
    <main className="min-h-screen bg-background text-foreground">
      <BackgroundEffects />
      
      <PageHero 
        badge="INTEGRATIONS"
        title="Seamlessly Connect Your Stack"
        subtitle="VerbaSense plays well with the tools you already use, making voice integration effortless."
      />

      <section className="container mx-auto px-6 py-20 text-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {integrations.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="border-border bg-card/30 backdrop-blur-md hover:bg-card/50 transition-all cursor-default">
                <CardContent className="p-8 flex flex-col items-center">
                  <div className="mb-4">{item.icon}</div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  )
}
