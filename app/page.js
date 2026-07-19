"use client";

import React, { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  Mic,
  MessageSquare,
  LineChart,
  ShieldCheck,
  Award,
  FileText,
  TrendingUp,
  Brain,
  Globe
} from "lucide-react";
import HeroSection from "@/components/hero";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { features } from "@/data/features";
import { testimonial } from "@/data/testimonial";
import { faqs } from "@/data/faqs";
import { howItWorks } from "@/data/howItWorks";

export default function LandingPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [spotlightTab, setSpotlightTab] = useState("tailor");

  const handleNavigate = (targetPath) => {
    if (isSignedIn) {
      router.push(targetPath);
    } else {
      router.push(`/sign-in?redirect_url=${encodeURIComponent(targetPath)}`);
    }
  };

  return (
    <div className="relative space-y-16">
      <div className="grid-background"></div>

      {/* Hero Section */}
      <HeroSection />

      {/* Live Feature Spotlight Section */}
      <section className="w-full py-12 bg-muted/40 border-y">
        <div className="container mx-auto px-4 md:px-6 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <Badge variant="outline" className="border-primary/30 text-primary px-3 py-1 text-xs">
              ⚡ Platform Capabilities
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Interactive AI Tool Spotlight
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Explore how JobMentorAI accelerates your job search across resume tailoring, speech coaching, and RAG document intelligence.
            </p>
          </div>

          <Tabs value={spotlightTab} onValueChange={setSpotlightTab} className="max-w-5xl mx-auto space-y-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1">
              <TabsTrigger value="tailor" className="py-2.5 text-xs md:text-sm font-semibold flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-primary" /> ATS Tailor
              </TabsTrigger>
              <TabsTrigger value="speech" className="py-2.5 text-xs md:text-sm font-semibold flex items-center gap-1.5">
                <Mic className="h-4 w-4 text-primary" /> Voice Coach
              </TabsTrigger>
              <TabsTrigger value="advisor" className="py-2.5 text-xs md:text-sm font-semibold flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-primary" /> RAG Advisor
              </TabsTrigger>
              <TabsTrigger value="roadmap" className="py-2.5 text-xs md:text-sm font-semibold flex items-center gap-1.5">
                <LineChart className="h-4 w-4 text-primary" /> Role Roadmap
              </TabsTrigger>
            </TabsList>

            {/* Spotlight 1: ATS Tailor */}
            <TabsContent value="tailor">
              <Card className="border-2 border-primary/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" /> Smart AI Resume Tailor & ATS Optimizer
                  </CardTitle>
                  <CardDescription>
                    Tailors your existing resume PDF to any job description using authentic experience alignment.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-xl bg-card space-y-2">
                    <span className="text-xs font-bold uppercase text-primary">Strict Integrity Guardrail</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Rephrases bullet points & injects job keywords without lying or fabricating unearned credentials.
                    </p>
                  </div>
                  <div className="p-4 border rounded-xl bg-card space-y-2">
                    <span className="text-xs font-bold uppercase text-green-500">ATS Match Score Boost</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Tracks score increases in real-time (e.g. 58% ➔ 94% Match) with bulleted optimization logs.
                    </p>
                  </div>
                  <div className="p-4 border rounded-xl bg-card space-y-2 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase text-primary">Single-Click Import</span>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Instantly load tailored markdown into your active builder.
                      </p>
                    </div>
                    <Button size="sm" className="mt-2 text-xs" onClick={() => handleNavigate("/resume")}>
                      Try ATS Tailor <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Spotlight 2: Voice Coach */}
            <TabsContent value="speech">
              <Card className="border-2 border-primary/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Mic className="h-5 w-5 text-primary" /> Multimodal Voice Speech Practice Coach
                  </CardTitle>
                  <CardDescription>
                    Practice speaking interview responses out loud with cross-browser microphone analytics.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-xl bg-card space-y-2">
                    <span className="text-xs font-bold uppercase text-primary">Pacing & Speed (WPM)</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Calculates words per minute to ensure your verbal delivery is optimal (~130 WPM).
                    </p>
                  </div>
                  <div className="p-4 border rounded-xl bg-card space-y-2">
                    <span className="text-xs font-bold uppercase text-primary">Filler Word Detection</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Counts filler words (&quot;um&quot;, &quot;uh&quot;, &quot;like&quot;) and provides delivery articulation scores.
                    </p>
                  </div>
                  <div className="p-4 border rounded-xl bg-card space-y-2 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase text-primary">Gemini Audio AI</span>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Direct audio transcription & targeted knowledge gap feedback.
                      </p>
                    </div>
                    <Button size="sm" className="mt-2 text-xs" onClick={() => handleNavigate("/interview/speech")}>
                      Start Voice Practice <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Spotlight 3: RAG Advisor */}
            <TabsContent value="advisor">
              <Card className="border-2 border-primary/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" /> AI Career Advisor (RAG & Vector Search)
                  </CardTitle>
                  <CardDescription>
                    Upload resumes, certifications, or job targets and chat with an AI advisor grounded in your documents.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-xl bg-card space-y-2">
                    <span className="text-xs font-bold uppercase text-primary">768-Dim Vector Search</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Indexes document chunks into Neon PostgreSQL pgvector for grounded similarity retrieval.
                    </p>
                  </div>
                  <div className="p-4 border rounded-xl bg-card space-y-2">
                    <span className="text-xs font-bold uppercase text-primary">React Markdown Rendering</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Renders structured list responses, bullet points, and code snippets cleanly.
                    </p>
                  </div>
                  <div className="p-4 border rounded-xl bg-card space-y-2 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase text-primary">Personalized Guidance</span>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Answers questions based specifically on your uploaded resume files.
                      </p>
                    </div>
                    <Button size="sm" className="mt-2 text-xs" onClick={() => handleNavigate("/advisor")}>
                      Chat with Advisor <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Spotlight 4: Role Roadmap */}
            <TabsContent value="roadmap">
              <Card className="border-2 border-primary/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <LineChart className="h-5 w-5 text-primary" /> Role Intelligence & 30-60-90 Day Roadmap
                  </CardTitle>
                  <CardDescription>
                    Search target job titles on demand for dynamic salary guides and career progression roadmaps.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-xl bg-card space-y-2">
                    <span className="text-xs font-bold uppercase text-primary">On-Demand Role Search</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Search any custom title (e.g. Full-Stack AI Engineer) for real-time market metrics.
                    </p>
                  </div>
                  <div className="p-4 border rounded-xl bg-card space-y-2">
                    <span className="text-xs font-bold uppercase text-primary">Skill Action Bridge</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      One-click add skills directly to your Resume Builder or launch Mock Interview prep.
                    </p>
                  </div>
                  <div className="p-4 border rounded-xl bg-card space-y-2 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase text-primary">30-60-90 Day Roadmap</span>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Step-by-step career progression milestones for role mastery.
                      </p>
                    </div>
                    <Button size="sm" className="mt-2 text-xs" onClick={() => handleNavigate("/dashboard")}>
                      Explore Dashboard <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="w-full py-12 md:py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Comprehensive AI Tools for Your Career
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Everything you need to optimize resumes, practice interviews, and accelerate your career.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-2 hover:border-primary transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <CardContent className="pt-6 text-center flex flex-col items-center">
                  <div className="p-3 rounded-full bg-primary/10 mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Performance Stats Section */}
      <section className="w-full py-12 bg-muted/60 border-y">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
            <div className="space-y-1">
              <h3 className="text-3xl md:text-4xl font-extrabold text-primary">10+</h3>
              <p className="text-xs md:text-sm font-medium text-muted-foreground">AI Career Tools</p>
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl md:text-4xl font-extrabold text-primary">99.9%</h3>
              <p className="text-xs md:text-sm font-medium text-muted-foreground">Multi-Provider Uptime</p>
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl md:text-4xl font-extrabold text-primary">768-dim</h3>
              <p className="text-xs md:text-sm font-medium text-muted-foreground">Vector RAG Search</p>
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl md:text-4xl font-extrabold text-primary">90%+</h3>
              <p className="text-xs md:text-sm font-medium text-muted-foreground">ATS Match Boost</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-12 md:py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight">How JobMentorAI Works</h2>
            <p className="text-muted-foreground text-sm">
              Four simple steps to accelerate your professional growth
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {howItWorks.map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center space-y-3 p-4 rounded-xl border bg-card shadow-sm"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {index + 1}
                </div>
                <h3 className="font-bold text-base">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="w-full py-12 md:py-20 bg-muted/40 border-t">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-extrabold text-center mb-12">
            Trusted by Job Seekers & Professionals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonial.map((item, index) => (
              <Card key={index} className="bg-card border-2">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                      {item.author[0]}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{item.author}</p>
                      <p className="text-xs text-muted-foreground">{item.role}</p>
                      <p className="text-xs text-primary font-semibold">{item.company}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground italic leading-relaxed">
                    &quot;{item.quote}&quot;
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="w-full py-12 md:py-20 bg-background border-t">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <h2 className="text-3xl font-extrabold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-sm font-semibold">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="w-full py-16 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-2xl max-w-6xl mx-auto my-12 text-center p-8 shadow-2xl">
        <div className="space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Ready to Supercharge Your Career?
          </h2>
          <p className="text-xs md:text-sm text-primary-foreground/90 leading-relaxed">
            Join thousands of professionals using JobMentorAI for authentic ATS resume tailoring, voice interview coaching, and RAG document intelligence.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="mt-4 font-bold px-8 h-12 shadow-lg"
            onClick={() => handleNavigate("/dashboard")}
          >
            Start Your Free Career Journey <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
