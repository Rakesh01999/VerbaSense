"use client"

import React from "react"
import PageHero from "@/components/PageHero"
import BackgroundEffects from "@/components/BackgroundEffects"

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <BackgroundEffects />
      
      <PageHero 
        badge="LEGAL"
        title="Terms of Service"
        subtitle="Last Updated: March 14, 2026. Please read these terms carefully."
      />

      <section className="container mx-auto px-6 py-20">
        <div className="max-w-3xl mx-auto prose prose-invert">
          <h2 className="text-2xl font-bold mb-6">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            By accessing or using VerbaSense, you agree to be bound by these Terms of Service and all applicable laws and regulations.
          </p>
          
          <h2 className="text-2xl font-bold mb-6">2. Use License</h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Permission is granted to temporarily use VerbaSense for personal or commercial transcription purposes. This is the grant of a license, not a transfer of title.
          </p>

          <h2 className="text-2xl font-bold mb-6">3. Disclaimer</h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            The materials on VerbaSense are provided &apos;as is&apos;. VerbaSense makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties.
          </p>
        </div>
      </section>
    </main>
  )
}
