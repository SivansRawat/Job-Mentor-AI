# JobMentorAI: Your AI-Powered Career Co-pilot 🚀

JobMentorAI is a premium, full-stack AI career coach application designed to empower job seekers and professionals. Built with **Next.js**, **Prisma**, **Neon PostgreSQL**, **Clerk**, **Inngest**, and a **Multi-Provider AI Engine (Gemini, Groq, OpenAI)**, the platform offers intelligent tools like an AI Resume Builder & ATS Tailor, an Automated Cover Letter Generator, a Mock Interview Simulator, and a Dynamic Industry Insights Dashboard to help users navigate and excel in the modern job market.

---

## 📋 Table of Contents
1. [Key Features](#-key-features)
2. [Multi-Provider AI Architecture](#-multi-provider-ai-architecture)
3. [Tech Stack & Architecture](#-tech-stack--architecture)
4. [Folder Structure](#-folder-structure)
5. [Database Schema & Models](#-database-schema--models)
6. [Getting Started (Local Installation)](#-getting-started-local-installation)
7. [Background Jobs & Automation](#-background-jobs--automation)
8. [License](#-license)

---

## ✨ Key Features

### 👤 AI-Guided Onboarding
- Custom onboarding flow that captures the user's targeted industry, experience level, bio, and technical/interpersonal skills.
- Synchronizes the onboarding data to auto-generate baseline industry market insights using generative AI.

### 📈 Interactive Role & Industry Insights Hub
- **On-Demand Role Intelligence Search:** Search any custom job title (e.g. *"Full-Stack AI Engineer"*, *"Cloud Architect"*) to generate targeted salary benchmarks, in-demand skills, and trends on demand.
- **Interactive Skill Action Bridge:** One-click action buttons next to recommended skills to immediately **Add to Resume**, **Practice Interview**, or **Ask AI Advisor**.
- **Seniority Salary Adjuster:** Dynamically scale salary compensation benchmarks across Junior, Mid-Level, Senior, and Lead/Manager tiers.
- **AI 30-60-90 Day Career Roadmap:** Step-by-step career progression milestone plan for target role mastery.

### ⚡ AI Resume Builder & Real-time Strength Meter
- **AI Summary & Skill Auto-Generation:** One-click "AI Generate Summary" and "AI Suggest Skills" controls tailored to the user's target role.
- **Resume Strength Meter:** Real-time completion progress bar (0% to 100%) tracking section completion (Contact Info, Summary, Skills, Experience, Education, Projects) with actionable guidance.
- **Live Styled A4 Resume Preview:** Render elegant, recruiter-ready resume layouts featuring styled contact badges, section headers, and skill chips.
- Single-click PDF export to download high-resolution resume documents.

### 🎯 Smart AI Resume Tailor & ATS Optimizer (Authentic Optimization)
- **Target Role Resume Tailoring:** Upload an existing resume PDF, input target Job Title and Job Description, and generate an ATS-optimized version tailored specifically for that role.
- **Strict Integrity Guardrail (No-Lying Rule):** Rephrases bullet points, injects essential keywords, and highlights real accomplishments without fabricating fake jobs, fake dates, or unearned credentials.
- **ATS Match Score Boost Card:** Shows original vs tailored match compatibility (e.g., 58% ➔ **94% ATS Match**).
- **Single-Click Import:** Load tailored markdown directly into the active Resume Builder with one click.

### 🔍 ATS Audit Scanner & Futuristic AI Wave Scanner
- **ATS Compatibility Audit Scanner:** Drag-and-drop a PDF resume, input target job requirements, and run real-time checks highlighting missing keywords, layout caveats, recommendations, and bullet rewrites.
- **Interactive AI Wave Scanner:** Features a high-tech animated sonar radar core and audio/data wave equalizer with phase indicators (`📄 Parsing Layout`, `🎯 Matching Keywords`, `⚡ Writing Recommendations`).

### ✍️ Intelligent Cover Letter Generator
- Instantly generate tailored cover letters by feeding in a target job description, company name, and job title.
- Tailor tone and content specifically to your onboarding profile (industry, years of experience, and key skills).
- Manage and save multiple cover letters with options to review, edit, or delete them.

### 🗣️ Mock Interview Simulator & Speech Coach
- Simulates technical interviews by generating 10 multiple-choice questions custom-tailored to the user's industry and key skills.
- **Multimodal AI Speech Coach:** Practice speaking responses out loud with cross-browser audio recording support (`audio/webm`, `audio/mp4`, `audio/ogg`). Transcribes spoken answers via Gemini and calculates filler word counts and verbal pacing rates.
- Evaluates answers in real-time, delivering scores, detailed explanations, and specific AI-driven improvement tips.

### 💬 AI Career Advisor (RAG & Semantic Search)
- Upload career documents (resumes, certifications, cover letters, or job descriptions) to embed them into your vector profile.
- Conversational chat assistant utilizing **Retrieval-Augmented Generation (RAG)** to index and answer document-specific user questions.
- Grounded responses using `gemini-embedding-001` (768-dimensional vectors) and `gemini-2.5-flash` querying Neon PostgreSQL `pgvector` datasets.

---

## 🤖 Multi-Provider AI Architecture

JobMentorAI features a resilient, multi-provider LLM cascade runner (`lib/ai-provider.js`) that prevents service outages due to API rate limits (HTTP 429) or provider quota caps:

```
[User Request] ➔ 1. Google Gemini (gemini-2.5-flash)
                    │ (If Rate Limited / HTTP 429)
                    ▼
                 2. Groq API (llama-3.3-70b-versatile)
                    │ (If Quota Exceeded / Error)
                    ▼
                 3. OpenAI API (gpt-4o-mini)
```

- **Zero Bundle Bloat:** Uses native HTTP `fetch` for Groq and OpenAI REST endpoints to keep client and serverless bundle sizes minimal.
- **Automatic Fallback:** Seamlessly shifts traffic to secondary providers without interrupting the user experience.

---

## 🏗️ Tech Stack & Architecture

### Core Frontend
* **Framework:** [Next.js 15 (App Router)](https://nextjs.org/) — Utilizing React server components and server-side rendering.
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS framework coupled with CSS variables for dynamic themes.
* **Component Library:** [Shadcn UI](https://ui.shadcn.com/) — Primitive UI elements built on top of Radix UI.
* **Markdown Rendering:** [React Markdown](https://github.com/remarkjs/react-markdown) & `@uiw/react-md-editor` — Renders formatted AI responses and live resume previews.
* **Theme Management:** [Next Themes](https://github.com/pacocoursey/next-themes) — Supports dynamic dark/light mode toggles.
* **Data Visualization:** [Recharts](https://recharts.org/) — Interactive data charts visualizing salary ranges.

### Core Backend & Services
* **Database & ORM:** [Neon PostgreSQL](https://neon.tech/) & [Prisma ORM](https://www.prisma.io/) — Serverless PostgreSQL database with `pgvector` vector embeddings extension.
* **Authentication:** [Clerk](https://clerk.com/) — Secure session management, sign-up/sign-in flows, path protection middleware.
* **Background Worker & Cron Scheduling:** [Inngest](https://www.inngest.com/) — Manages background tasks and weekly cron triggers without dedicated daemon processes.
* **Artificial Intelligence Engine:** 
  - Primary: [Google Gemini API (`gemini-2.5-flash` & `gemini-embedding-001`)](https://ai.google.dev/)
  - Fallback 1: [Groq API (`llama-3.3-70b-versatile`)](https://groq.com/)
  - Fallback 2: [OpenAI API (`gpt-4o-mini`)](https://openai.com/)

---

## 📁 Folder Structure

```
Job-Mentor-AI/
├── actions/                  # Next.js Server Actions
│   ├── cover-letter.js       # Cover letter CRUD & generation actions
│   ├── dashboard.js          # Industry insights fetching & AI generation
│   ├── interview.js          # Mock interview quiz generation & assessment saving
│   ├── rag.js                # RAG context ingestion & advisor chat actions
│   ├── resume-generator.js   # AI summary & skill suggestion generator
│   ├── resume-scanner.js     # Resume ATS parsing & evaluation actions
│   ├── resume-tailor.js      # Authentic ATS resume tailoring action
│   ├── resume.js             # Resume saving, loading, & AI improvement
│   ├── speech.js             # Speech coach audio analyzing actions
│   └── user.js               # Onboarding & user profile management
├── app/                      # Next.js App Router Pages & APIs
│   ├── (auth)/               # Auth routes (sign-in/sign-up layouts)
│   ├── (main)/               # Authenticated application modules
│   │   ├── advisor/          # AI Career Advisor RAG semantic chat route
│   │   ├── ai-cover-letter/  # Cover letter generator UI & history list
│   │   ├── dashboard/        # Industry insights dashboard UI
│   │   ├── interview/        # Quiz/Mock interview UI & dashboard
│   │   │   └── speech/       # Voice Coach record & analyze layout route
│   │   ├── onboarding/       # Industry/Skills onboarding flow
│   │   └── resume/           # Resume builder workspace UI
│   │       └── _components/  # Resume forms, ATS scanner, & Smart Tailor UI
│   │           ├── ats-scanner.jsx   # ATS audit scanner & wave equalizer
│   │           ├── entry-form.jsx    # Work/Education/Project form entries
│   │           ├── resume-builder.jsx# Main resume editor & strength meter
│   │           ├── resume-preview.jsx# Live styled A4 resume preview
│   │           └── resume-tailor.jsx # Smart AI resume tailor component
├── app/api/
│   └── inngest/              # Inngest background event-driven router handler
├── components/               # React Components
│   ├── ui/                   # Shadcn UI reusable components
│   ├── header.jsx            # Main app navigation header
│   └── theme-provider.jsx    # Dark/light mode theme provider
├── lib/                      # Helper modules and clients
│   ├── ai-provider.js        # Multi-Provider AI Fallback Engine (Gemini ➔ Groq ➔ OpenAI)
│   ├── checkUser.js          # Clerk-to-Prisma user synchronization utility
│   ├── inngest/              # Inngest background worker client and jobs
│   └── prisma.js             # Prisma client singleton
├── prisma/                   # Database configuration
│   └── schema.prisma         # Prisma database schema definition
├── vercel.json               # Vercel serverless function configuration (60s maxDuration)
├── next.config.mjs           # Next.js bundler configuration
└── package.json              # Project dependencies and scripts
```

---

## 🗄️ Database Schema & Models

The PostgreSQL database is organized into 6 relational tables using Prisma:

```mermaid
erDiagram
    User ||--|| Resume : "has one"
    User ||--o{ Assessment : "completes many"
    User ||--o{ CoverLetter : "creates many"
    User ||--o{ DocumentChunk : "embeds many"
    IndustryInsight ||--o{ User : "belongs to"

    User {
        String id PK
        String clerkUserId UK
        String email UK
        String name
        String imageUrl
        String industry FK
        String bio
        Int experience
        String[] skills
        DateTime createdAt
        DateTime updatedAt
    }

    Assessment {
        String id PK
        String userId FK
        Float quizScore
        Json[] questions
        String category
        String improvementTip
        DateTime createdAt
        DateTime updatedAt
        Float deliveryScore
        Int fillerWords
        String speakingSpeed
        String transcript
    }

    Resume {
        String id PK
        String userId FK "UK"
        String content "Markdown"
        Float atsScore
        String feedback
        DateTime createdAt
        DateTime updatedAt
    }

    CoverLetter {
        String id PK
        String userId FK
        String content "Markdown"
        String jobDescription
        String companyName
        String jobTitle
        String status
        DateTime createdAt
        DateTime updatedAt
    }

    IndustryInsight {
        String id PK
        String industry UK
        Json[] salaryRanges
        Float growthRate
        String demandLevel
        String[] topSkills
        String marketOutlook
        String[] keyTrends
        String[] recommendedSkills
        DateTime lastUpdated
        DateTime nextUpdate
    }

    DocumentChunk {
        String id PK
        String userId FK
        String content
        Json metadata
        Vector embedding
        DateTime createdAt
    }
```

---

## 🛠️ Getting Started (Local Installation)

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- A **Neon PostgreSQL** database instance with `pgvector` enabled
- A **Clerk** account for user authentication
- API Keys:
  - **Google Gemini API Key** (Primary AI Provider)
  - **Groq API Key** (Fallback 1 AI Provider - Optional)
  - **OpenAI API Key** (Fallback 2 AI Provider - Optional)

### 2. Clone the Repository
```bash
git clone https://github.com/SivansRawat/JobMentorAI.git
cd JobMentorAI
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your credentials:
```env
DATABASE_URL="postgresql://username:password@hostname/dbname?sslmode=require"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_your_clerk_publishable_key"
CLERK_SECRET_KEY="sk_your_clerk_secret_key"
GEMINI_API_KEY="your_google_gemini_api_key"
GROQ_API_KEY="your_groq_api_key"
OPENAI_API_KEY="your_openai_api_key"
RESEND_API_KEY="your_resend_api_key"
```

### 5. Initialize the Database
```bash
npx prisma generate
npx prisma db push
```

### 6. Run Inngest Local Dev Server
```bash
npx inngest-cli dev
```

### 7. Run the Application
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## ⏳ Background Jobs & Automation

JobMentorAI uses **Inngest** to execute automated processes:

1. **Weekly Industry Insights Refresh (`cron: "0 0 * * 0"`)**
   - Executes every Sunday at midnight.
   - Fetches active industries, queries the AI engine to update market trends, salary ranges, in-demand skills, and growth rates.
2. **Weekly Job-Match & Industry Digests (`cron: "0 9 * * 1"`)**
   - Runs every Monday morning at 9:00 AM.
   - Compiles weekly market pulse digests and dispatches email reports to users using the **Resend API**.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
