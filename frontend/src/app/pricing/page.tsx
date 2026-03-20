"use client"

import React from "react"
import { useRouter } from "next/navigation"
import PageHero from "@/components/PageHero"
import BackgroundEffects from "@/components/BackgroundEffects"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Check } from "lucide-react"

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      price: "$0",
      description: "Perfect for exploring our precision transcription.",
      features: ["60 minutes / month", "Standard Accuracy", "Web App Access", "Community Support"],
      cta: "Start for Free",
      highlighted: false,
      href: "/dashboard",
    },
    {
      name: "Pro",
      price: "$49",
      description: "Ideal for power users and small teams.",
      features: ["1,000 minutes / month", "High Fidelity Engine", "Priority Processing", "Email Support", "API Access"],
      cta: "Get Started",
      highlighted: true,
      href: "/register",
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Scalable solutions for large organizations.",
      features: ["Unlimited Minutes", "Custom Neural Models", "Dedicated Account Manager", "SSO & Advanced Security", "SLA Guarantees"],
      cta: "Contact Sales",
      highlighted: false,
      href: "/contact",
    },
  ]

  const router = useRouter()
  return (
    <main className="min-h-screen bg-background text-foreground">
      <BackgroundEffects />
      
      <PageHero 
        badge="PRICING"
        title="Simple, Transparent Pricing"
        subtitle="Choose the plan that fits your needs. No hidden fees, just pure precision."
      />

      <section className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className={`h-full flex flex-col relative overflow-hidden bg-card/40 backdrop-blur-xl border-border ${plan.highlighted ? "border-purple-500 shadow-2xl shadow-purple-500/10" : ""}`}>
                {plan.highlighted && (
                  <div className="absolute top-0 right-0 px-4 py-1 bg-purple-500 text-white text-xs font-bold rounded-bl-xl">
                    MOST POPULAR
                  </div>
                )}
                <CardHeader className="p-8">
                  <CardTitle className="text-xl mb-2">{plan.name}</CardTitle>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.price !== "Custom" && <span className="text-muted-foreground italic">/mo</span>}
                  </div>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                </CardHeader>
                <CardContent className="p-8 pt-0 flex-grow">
                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm">
                        <Check className="w-4 h-4 text-purple-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="p-8">
                  <Button 
                    onClick={() => router.push(plan.href)}
                    className={`w-full py-6 rounded-xl font-bold transition-all ${plan.highlighted ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-500/20" : "variant-outline"}`}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  )
}
