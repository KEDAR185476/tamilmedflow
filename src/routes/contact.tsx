import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Sales — MedFlow Nexus" },
      { name: "description", content: "Get in touch with MedFlow Nexus for demos, pricing, and partnership inquiries." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Contact Sales</h1>
          <p className="text-muted-foreground">Schedule a demo, discuss pricing, or explore partnership opportunities</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6">
              <h2 className="font-bold text-lg mb-4">Get in Touch</h2>
              {submitted ? (
                <div className="text-center py-8">
                  <div className="h-14 w-14 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-4 glow-sm">
                    <Send className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-semibold text-foreground">Message Sent!</p>
                  <p className="text-sm text-muted-foreground mt-1">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="First Name" className="bg-muted/30" required />
                    <Input placeholder="Last Name" className="bg-muted/30" required />
                  </div>
                  <Input placeholder="Work Email" type="email" className="bg-muted/30" required />
                  <Input placeholder="Organization" className="bg-muted/30" />
                  <Textarea placeholder="Tell us about your needs..." rows={4} className="bg-muted/30" required />
                  <Button type="submit" className="w-full">Send Message</Button>
                </form>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {[
              { icon: Mail, title: "Email", value: "sales@medflownexus.com", sub: "For pricing and demo requests" },
              { icon: Phone, title: "Phone", value: "+91 44 2345 6789", sub: "Monday–Friday, 9 AM – 6 PM IST" },
              { icon: MapPin, title: "Office", value: "Chennai, Tamil Nadu", sub: "Directorate of Medical Services" },
            ].map(c => (
              <div key={c.title} className="glass rounded-xl p-5 flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <c.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{c.title}</p>
                  <p className="text-sm text-foreground">{c.value}</p>
                  <p className="text-xs text-muted-foreground">{c.sub}</p>
                </div>
              </div>
            ))}

            <div className="glass rounded-xl p-5">
              <h3 className="font-semibold text-sm mb-3">Quick Links</h3>
              <div className="space-y-2">
                <Link to="/pricing" className="block text-sm text-primary hover:underline">View Pricing Plans →</Link>
                <Link to="/security" className="block text-sm text-primary hover:underline">Security & Compliance →</Link>
                <Link to="/about" className="block text-sm text-primary hover:underline">About MedFlow Nexus →</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
