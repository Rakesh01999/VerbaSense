"use client"

import React from "react"
import PageHero from "@/components/PageHero"
import BackgroundEffects from "@/components/BackgroundEffects"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, MessageSquare, Phone } from "lucide-react"

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <BackgroundEffects />
      
      <PageHero 
        badge="CONTACT US"
        title="We'd Love to Hear From You"
        subtitle="Have questions about our API, pricing, or enterprise solutions? Our team is here to help."
      />

      <section className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
          {/* Info Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div>
              <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
              <p className="text-muted-foreground leading-relaxed">
                Whether you're a developer with a technical question or an enterprise looking for a custom solution, we're ready to chat.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email us</p>
                  <p className="font-bold">hello@verbasense.ai</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                   <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Live Chat</p>
                  <p className="font-bold">Available Mon-Fri, 9am-6pm PST</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Call sales</p>
                  <p className="font-bold">+1 (555) 123-4567</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-secondary/30 border border-border backdrop-blur-xl"
          >
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="Jane" className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Clark" className="bg-background/50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Work Email</Label>
                <Input id="email" type="email" placeholder="jane@company.com" className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">How can we help?</Label>
                <Textarea id="message" placeholder="Tell us about your project..." className="bg-background/50 min-h-[150px]" />
              </div>
              <Button className="w-full py-6 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 font-bold">
                Send Message
              </Button>
            </form>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
