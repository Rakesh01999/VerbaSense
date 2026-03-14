"use client"

import React from "react"
import PageHero from "@/components/PageHero"
import BackgroundEffects from "@/components/BackgroundEffects"

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <BackgroundEffects />
      
      <PageHero 
        badge="LEGAL"
        title="Cookie Policy"
        subtitle="Last Updated: March 14, 2026. How we use cookies to improve your experience."
      />

      <section className="container mx-auto px-6 py-20">
        <div className="max-w-3xl mx-auto prose prose-invert">
          <h2 className="text-2xl font-bold mb-6">1. What are Cookies?</h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Cookies are small pieces of text sent by your web browser by a website you visit. A cookie file is stored in your web browser and allows the service or a third-party to recognize you.
          </p>
          
          <h2 className="text-2xl font-bold mb-6">2. How VerbaSense uses Cookies</h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            We use cookies for authentication (to keep you signed in) and analytics (to understand how our service is being used). We do not use advertising cookies.
          </p>

          <h2 className="text-2xl font-bold mb-6">3. Managing Cookies</h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            You can manage or delete cookies through your browser settings. However, disabling essential cookies may prevent you from using VerbaSense correctly.
          </p>
        </div>
      </section>
    </main>
  )
}
