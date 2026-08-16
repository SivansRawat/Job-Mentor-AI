"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Sparkles, ChevronDown } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const HeroSection = () => {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const handleNavigate = (targetPath) => {
    if (isSignedIn) {
      router.push(targetPath);
    } else {
      router.push(`/sign-in?redirect_url=${encodeURIComponent(targetPath)}`);
    }
  };

  const scrollToNextSection = () => {
    window.scrollTo({
      top: window.innerHeight * 0.75,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative w-full min-h-[82vh] flex flex-col justify-between items-center pt-28 md:pt-36 pb-8 overflow-hidden select-none">
      {/* Central Content */}
      <div className="space-y-8 text-center max-w-5xl mx-auto px-4 my-auto">
        {/* Lumina-Style Headline & Subtitle */}
        <div className="space-y-6">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-[1.08]">
            Where Ambition Meets
            <br />
            <span className="font-serif italic font-normal text-white/95">Career</span>{" "}
            <span className="font-serif italic font-normal text-blue-400">Transformation.</span>
          </h1>
          <p className="mx-auto max-w-2xl text-slate-300/80 text-sm sm:text-base md:text-lg font-light leading-relaxed tracking-wide">
            Accelerate your job search with authentic ATS resume tailoring, multimodal voice interview coaching, and RAG document intelligence.
          </p>
        </div>

        {/* Lumina-Style Pill CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            size="lg"
            className="w-full sm:w-auto px-8 h-12 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium shadow-xl shadow-blue-600/30 transition-all duration-300 flex items-center justify-center gap-2 border border-blue-400/30 hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => handleNavigate("/dashboard")}
          >
            Get Started Free <ArrowUpRight className="h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto px-8 h-12 rounded-full bg-white/5 hover:bg-white/10 text-white border-white/20 text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-md hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => handleNavigate("/resume")}
          >
            <Sparkles className="h-4 w-4 text-blue-400" /> Explore ATS Tailor
          </Button>
        </div>
      </div>

      {/* Lumina-Style Swipe to Explore Scroll Indicator */}
      <button
        onClick={scrollToNextSection}
        className="group mt-12 flex flex-col items-center gap-2 text-xs font-light text-slate-400/70 hover:text-white transition-colors cursor-pointer"
        aria-label="Scroll to explore features"
      >
        <span className="tracking-widest uppercase text-[11px]">Swipe to Explore</span>
        <ChevronDown className="h-4 w-4 animate-bounce text-slate-400 group-hover:text-blue-400 transition-colors" />
      </button>
    </section>
  );
};

export default HeroSection;
