"use client"

import React from "react"
import PageHero from "@/components/PageHero"
import BackgroundEffects from "@/components/BackgroundEffects"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function APIReferencePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <BackgroundEffects />
      
      <PageHero 
        badge="DEVELOPER TOOLS"
        title="API Reference"
        subtitle="Build powerful voice integrations with our robust, low-latency REST and WebSocket APIs."
      />

      <section className="container mx-auto px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <Tabs defaultValue="rest" className="w-full">
            <TabsList className="bg-secondary/50 p-1 mb-12">
              <TabsTrigger value="rest" className="px-8 py-3 rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white">REST API</TabsTrigger>
              <TabsTrigger value="ws" className="px-8 py-3 rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white">WebSocket</TabsTrigger>
            </TabsList>
            
            <TabsContent value="rest">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">Transcription Endpoint</h3>
                    <p className="text-muted-foreground mb-4">POST /v1/transcribe</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Send your audio files via multipart/form-data. Our engine will process the file and return the transcription result.
                    </p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/30 border border-border">
                    <h4 className="font-bold mb-2">Parameters</h4>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• <code className="text-white">audio_file</code>: The audio data (required)</li>
                      <li>• <code className="text-white">language</code>: ISO code (optional)</li>
                      <li>• <code className="text-white">smart_punct</code>: Boolean (optional)</li>
                    </ul>
                  </div>
                </div>
                <div className="rounded-3xl bg-zinc-950 p-8 border border-zinc-800 shadow-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-mono text-zinc-500">Node.js</span>
                  </div>
                  <pre className="text-sm font-mono text-zinc-300 overflow-x-auto">
                    <code>{`const response = await fetch('https://api.verbasense.ai/v1/transcribe', {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});`}</code>
                  </pre>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="ws">
              <div className="text-center py-20">
                <h3 className="text-2xl font-bold mb-4">Streaming API Documentation</h3>
                <p className="text-muted-foreground">Our WebSocket API documentation is coming soon. Stay tuned!</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </main>
  )
}
