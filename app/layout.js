import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { dark } from "@clerk/themes";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["italic", "normal"],
  variable: "--font-serif",
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://job-mentor-ai.vercel.app";

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "AI Job Mentor | AI-Powered Career Co-pilot & ATS Optimizer",
    template: "%s | AI Job Mentor",
  },
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
  authors: [{ name: "AI Job Mentor Team" }],
  creator: "AI Job Mentor",
  publisher: "AI Job Mentor",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.svg?v=3", type: "image/svg+xml" },
      { url: "/favicon.ico?v=3", type: "image/x-icon" },
    ],
    shortcut: "/favicon.svg?v=3",
    apple: "/logo.png?v=3",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AI Job Mentor | AI-Powered Career Co-pilot & ATS Optimizer",
    description:
      "Land your dream job with AI-powered resume building, ATS keyword optimization, cover letter generation, voice & quiz mock interviews, and AI job matching.",
    url: baseUrl,
    siteName: "AI Job Mentor",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "AI Job Mentor Banner",
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
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      "url": baseUrl,
      "name": "AI Job Mentor",
      "description": "Your AI-Powered Career Co-pilot & ATS Optimization Platform",
      "publisher": {
        "@type": "Organization",
        "name": "AI Job Mentor",
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/logo.png`
        }
      }
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${baseUrl}/#application`,
      "name": "AI Job Mentor",
      "operatingSystem": "All",
      "applicationCategory": "BusinessApplication",
      "description": "Comprehensive AI platform for resume optimization, cover letter creation, mock interviews, and career guidance.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }
  ]
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/favicon.svg?v=3" type="image/svg+xml" />
          <link rel="alternate icon" href="/favicon.ico?v=3" type="image/x-icon" />
          <link rel="apple-touch-icon" href="/logo.png?v=3" />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </head>
        <body className={`${inter.className} ${playfair.variable}`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
          >
            <div className="grid-background"></div>
            <div className="bg-glow-spot"></div>
            <div className="bg-glow-spot-2"></div>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Toaster richColors />

            <footer className="bg-muted/50 py-12">
              <div className="container mx-auto px-4 text-center text-gray-200">
                {/* <p>Made with 💗 by Sivans Rawat</p> */}
              </div>
            </footer>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
