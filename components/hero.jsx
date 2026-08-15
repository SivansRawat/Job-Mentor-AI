"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const HeroSection = () => {
  const imageRef = useRef(null);
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const imageElement = imageRef.current;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;

      if (scrollPosition && imageElement) {
        if (scrollPosition > scrollThreshold) {
          imageElement.classList.add("scrolled");
        } else {
          imageElement.classList.remove("scrolled");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigate = (targetPath) => {
    if (isSignedIn) {
      router.push(targetPath);
    } else {
      router.push(`/sign-in?redirect_url=${encodeURIComponent(targetPath)}`);
    }
  };

  return (
    <section className="w-full pt-28 md:pt-40 pb-12 overflow-hidden">
      <div className="space-y-8 text-center max-w-5xl mx-auto px-4">
        {/* Headline & Subtitle */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight gradient-title leading-tight">
            Your AI Career Coach &<br />
            ATS Optimization Co-Pilot
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground text-sm sm:text-base md:text-xl leading-relaxed">
            Accelerate your job search with authentic ATS resume tailoring, multimodal voice interview coaching, and RAG document intelligence.
          </p>
        </div>

        {/* Dual Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            size="lg"
            className="w-full sm:w-auto px-8 h-12 text-sm font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            onClick={() => handleNavigate("/dashboard")}
          >
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto px-8 h-12 text-sm font-semibold border-primary/30 flex items-center justify-center gap-2 hover:bg-primary/5"
            onClick={() => handleNavigate("/resume")}
          >
            <Sparkles className="h-4 w-4 text-primary" /> Explore ATS Resume Tailor
          </Button>
        </div>

        {/* Glassmorphic Banner Preview */}
        <div className="hero-image-wrapper mt-8">
          <div ref={imageRef} className="hero-image p-2 rounded-2xl bg-gradient-to-tr from-primary/30 via-primary/10 to-transparent border-2 border-primary/30 shadow-2xl shadow-primary/20">
            <Image
              src="/banner.jpeg"
              width={1280}
              height={720}
              alt="JobMentorAI Dashboard Preview"
              className="rounded-xl shadow-xl border mx-auto object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
