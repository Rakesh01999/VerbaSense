"use client"

import React, { useState } from "react"
import PageHero from "@/components/PageHero"
import BackgroundEffects from "@/components/BackgroundEffects"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, MessageSquare, Phone, CheckCircle2, AlertCircle, Loader2, ShieldCheck, User, ArrowRight, ArrowLeft } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

export default function ContactPage() {
  const { user, token, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
    code: ""
  });
  
  // Status for various async operations
  const [status, setStatus] = useState<'idle' | 'sending_code' | 'verifying' | 'loading' | 'success' | 'error'>('idle');
  
  // Steps: info (Names/Email) -> verify (Code) -> message (TextArea)
  const [step, setStep] = useState<'info' | 'verify' | 'message'>('info');
  const [errorMessage, setErrorMessage] = useState("");

  // Authenticated users go straight to message step - handled during render
  const [wasAuthenticated, setWasAuthenticated] = useState(false);
  if (isAuthenticated && !wasAuthenticated && user && step === 'info') {
    setWasAuthenticated(true);
    const fName = user.name?.split(' ')[0] || "";
    const lName = user.name?.split(' ').slice(1).join(' ') || "";
    const uEmail = user.email || "";
    
    // We update state during render, which restarts the render cycle
    setFormData({
      ...formData,
      firstName: fName,
      lastName: lName,
      email: uEmail
    });
    setStep('message');
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  // Step 1 -> Step 2: Send verification code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.firstName || !formData.lastName) {
      setErrorMessage("Please fill in your name and email");
      setStatus('error');
      return;
    }

    setStatus('sending_code');
    setErrorMessage("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('verify');
        setStatus('idle');
      } else {
        setStatus('error');
        setErrorMessage(data.message || "Failed to send code.");
      }
    } catch {
      setStatus('error');
      setErrorMessage("Connection error. Please try again.");
    }
  };

  // Step 2 -> Step 3: Verify the code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code) {
      setErrorMessage("Please enter the verification code");
      setStatus('error');
      return;
    }

    setStatus('verifying');
    setErrorMessage("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code: formData.code }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('message');
        setStatus('idle');
      } else {
        setStatus('error');
        setErrorMessage(data.message || "Invalid or expired code.");
      }
    } catch {
      setStatus('error');
      setErrorMessage("Verification failed. Please try again.");
    }
  };

  // Final Step: Submit message
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage("");

    try {
      const endpoint = isAuthenticated ? '/contact' : '/contact/verify-and-submit';
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (isAuthenticated) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setFormData({ firstName: "", lastName: "", email: "", message: "", code: "" });
      } else {
        setStatus('error');
        setErrorMessage(data.message || "Failed to send message.");
      }
    } catch {
      setStatus('error');
      setErrorMessage("Server error. Please try again.");
    }
  };

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
                Whether you&apos;re a developer with a technical question or an enterprise looking for a custom solution, we&apos;re ready to chat.
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

            {/* Verification Info / Guest Guide */}
            {!isAuthenticated ? (
                <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-secondary/20 border border-border/50">
                        <div className="flex gap-4 items-start">
                            <ShieldCheck className="w-6 h-6 text-purple-500 shrink-0" />
                            <div>
                                <h4 className="font-bold text-sm mb-1 text-purple-400 uppercase tracking-wider">Guest Verification</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    To maintain high support quality and prevent spam, we use a secure verification process for guest inquiries.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 px-2">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">How to send a message</h4>
                        {[
                            { step: 1, title: "Identity Details", desc: "Provide your name and professional email address." },
                            { step: 2, title: "Quick Verification", desc: "Enter the 6-digit code sent to your inbox to unlock the message area." },
                            { step: 3, title: "Direct Support", desc: "Write your inquiry and send it directly to our team." }
                        ].map((item) => (
                            <div key={item.step} className="flex gap-4">
                                <div className="w-6 h-6 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-[10px] font-bold text-purple-400 shrink-0">
                                    {item.step}
                                </div>
                                <div>
                                    <p className="text-xs font-bold">{item.title}</p>
                                    <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="p-6 rounded-2xl bg-secondary/20 border border-border/50">
                    <div className="flex gap-4 items-start">
                        <ShieldCheck className="w-6 h-6 text-purple-500 shrink-0" />
                        <div>
                            <h4 className="font-bold text-sm mb-1 text-purple-400 uppercase tracking-wider">Priority Support</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    You are currently logged in. Your message will be handled with priority by our support team.
                                </p>
                        </div>
                    </div>
                </div>
            )}
          </motion.div>

          {/* Form Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-secondary/30 border border-border backdrop-blur-xl relative overflow-hidden"
          >
            {/* Step Progress Bar */}
            {status !== 'success' && (
                <div className="flex items-center justify-between mb-8 px-2">
                    {[
                        { id: 'info', label: 'Identity' },
                        { id: 'verify', label: 'Verify' },
                        { id: 'message', label: 'Message' }
                    ].map((s, i) => (
                        <div key={s.id} className="flex items-center group">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                step === s.id ? 'bg-purple-600 text-white ring-4 ring-purple-600/20' : 
                                (i < ['info', 'verify', 'message'].indexOf(step) ? 'bg-green-500 text-white' : 'bg-secondary text-muted-foreground')
                            }`}>
                                {i < ['info', 'verify', 'message'].indexOf(step) ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                            </div>
                            {i < 2 && <div className={`w-12 sm:w-20 h-0.5 mx-2 transition-colors ${
                                i < ['info', 'verify', 'message'].indexOf(step) ? 'bg-green-500' : 'bg-secondary'
                            }`} />}
                        </div>
                    ))}
                </div>
            )}

            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground mb-8 text-sm">
                    Thank you, {formData.firstName}. We&apos;ve received your message and our team will get back to you shortly.
                  </p>
                  <Button 
                    onClick={() => {
                        setStatus('idle');
                        setStep(isAuthenticated ? 'message' : 'info');
                    }}
                    variant="outline"
                    className="rounded-xl px-8"
                  >
                    New Message
                  </Button>
                </motion.div>
              ) : (
                <motion.div 
                  key={step}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  {/* Step 1: Info */}
                  {step === 'info' && (
                    <form onSubmit={handleRequestCode} className="space-y-6">
                      <h3 className="text-xl font-bold">First, tell us who you are</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input id="firstName" placeholder="Yane" required value={formData.firstName} onChange={handleChange} className="bg-background/40" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input id="lastName" placeholder="Clark" required value={formData.lastName} onChange={handleChange} className="bg-background/40" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" placeholder="Yane@company.com" required value={formData.email} onChange={handleChange} className="bg-background/40" />
                      </div>
                      
                      {status === 'error' && (
                        <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" /> {errorMessage}
                        </div>
                      )}

                      <Button 
                        type="submit" 
                        disabled={status === 'sending_code'}
                        className="w-full py-6 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-[1.02] transition-transform font-bold"
                      >
                        {status === 'sending_code' ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="flex items-center gap-2">Get Verification Code <ArrowRight className="w-4 h-4" /></span>}
                      </Button>
                    </form>
                  )}

                  {/* Step 2: Verify */}
                  {step === 'verify' && (
                    <form onSubmit={handleVerifyCode} className="space-y-6">
                      <div className="space-y-2 text-center">
                        <h3 className="text-xl font-bold">Check your inbox</h3>
                        <p className="text-xs text-muted-foreground">We sent a 6-digit code to <span className="text-foreground font-medium">{formData.email}</span></p>
                      </div>
                      
                      <div className="pt-4">
                        <Label htmlFor="code" className="text-xs uppercase tracking-widest text-muted-foreground mb-4 block text-center">Enter Code</Label>
                        <Input 
                            id="code" 
                            required 
                            maxLength={6} 
                            value={formData.code} 
                            onChange={handleChange} 
                            className="text-center text-3xl tracking-[12px] py-8 rounded-2xl bg-purple-500/5 border-purple-500/30" 
                            placeholder="000000"
                        />
                      </div>

                      {status === 'error' && (
                        <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm flex items-center gap-2 justify-center">
                          <AlertCircle className="w-4 h-4" /> {errorMessage}
                        </div>
                      )}

                      <div className="flex gap-4">
                        <Button type="button" variant="ghost" onClick={() => setStep('info')} className="rounded-xl px-4 text-muted-foreground">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={status === 'verifying'} 
                            className="flex-1 py-6 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold shadow-lg shadow-purple-500/20"
                        >
                            {status === 'verifying' ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Identity"}
                        </Button>
                      </div>
                      <p className="text-center text-[10px] text-muted-foreground">Didn&apos;t get it? <button type="button" onClick={handleRequestCode} className="text-purple-400 hover:underline">Resend Code</button></p>
                    </form>
                  )}

                  {/* Step 3: Message */}
                  {step === 'message' && (
                    <form onSubmit={handleFinalSubmit} className="space-y-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold">Unlock complete!</h3>
                        {isAuthenticated && (
                            <div className="flex items-center gap-2 text-[10px] bg-purple-500/10 text-purple-400 px-2 py-1 rounded-full border border-purple-500/20">
                                <User className="w-3 h-3" /> Professional Account
                            </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="message">How can we help you today?</Label>
                        <Textarea 
                            id="message" 
                            required 
                            value={formData.message} 
                            onChange={handleChange} 
                            placeholder="Write your message here..." 
                            className="min-h-[180px] bg-background/40 rounded-2xl p-4 focus:ring-purple-500/20"
                        />
                      </div>

                      {status === 'error' && (
                        <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" /> {errorMessage}
                        </div>
                      )}

                      <Button 
                        type="submit" 
                        disabled={status === 'loading'} 
                        className="w-full py-7 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-[1.01] transition-all font-bold text-lg shadow-xl shadow-purple-500/20"
                      >
                        {status === 'loading' ? <div className="flex gap-2 items-center"><Loader2 className="w-5 h-5 animate-spin" /> Transmitting...</div> : "Send Message Now"}
                      </Button>
                      
                      {!isAuthenticated && (
                          <p className="text-center text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> Secure guest session for {formData.email}
                          </p>
                      )}
                    </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
