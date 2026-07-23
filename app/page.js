import LandingView from "@/app/_components/landing-view";

export const metadata = {
  title: "AI Job Mentor | AI-Powered Career Co-pilot & ATS Optimizer",
  description:
    "Accelerate your career with AI-powered ATS resume optimization, smart cover letter generation, interactive mock interview preparation, real-time speech coaching, and AI job matching.",
  keywords: [
    "AI Career Coach",
    "ATS Resume Optimizer",
    "AI Cover Letter Generator",
    "Mock Interview AI",
    "Speech Practice AI",
    "AI Job Advisor",
    "Job Search Assistant",
    "Resume Builder",
    "Career Development",
  ],
  openGraph: {
    title: "AI Job Mentor | AI-Powered Career Co-pilot & ATS Optimizer",
    description:
      "Land your dream job with AI-powered resume building, ATS keyword optimization, cover letter generation, voice & quiz mock interviews, and AI job matching.",
    url: "/",
    siteName: "AI Job Mentor",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "AI Job Mentor Landing Page",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Job Mentor | AI-Powered Career Co-pilot & ATS Optimizer",
    description:
      "Land your dream job with AI-powered resume building, ATS keyword optimization, cover letter generation, voice & quiz mock interviews, and AI job matching.",
    images: ["/logo.png"],
  },
};

export default function LandingPage() {
  return <LandingView />;
}
