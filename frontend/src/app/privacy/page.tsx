"use client"

import React from "react"
import PageHero from "@/components/PageHero"
import BackgroundEffects from "@/components/BackgroundEffects"

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <BackgroundEffects />
      
      <PageHero 
        badge="LEGAL"
        title="Privacy Policy"
        subtitle="Last Updated: March 14, 2026. Your privacy is our priority."
      />

      <section className="container mx-auto px-6 py-20">
        <div className="max-w-3xl mx-auto prose prose-invert">
          <h2 className="text-2xl font-bold mb-6">1. Data Collection</h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            VerbaSense collects only the minimum information necessary to provide our services. This includes your account details and the audio data you submit for transcription.
          </p>
          
          <h2 className="text-2xl font-bold mb-6">2. Data Usage</h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Audio data submitted for transcription is processed in real-time. We do NOT store audio files after processing unless specifically requested for asynchronous batch tasks, in which case they are deleted immediately after transcription is complete.
          </p>

          <h2 className="text-2xl font-bold mb-6">3. Security</h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            All data transmitted to and from our servers is encrypted using industry-standard TLS. Processing happens in secure, isolated environments.
          </p>
        </div>
      </section>
    </main>
  )
}
