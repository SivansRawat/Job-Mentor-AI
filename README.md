# JobMentorAI: Your AI-Powered Career Co-pilot 🚀

JobMentorAI is a premium, full-stack AI career coach application designed to empower job seekers and professionals. Built with **Next.js**, **Prisma**, **Neon PostgreSQL**, **Clerk**, **Inngest**, and **Google Gemini AI**, the platform offers intelligent tools like an AI Resume Builder, an Automated Cover Letter Generator, a Mock Interview Simulator, and a Dynamic Industry Insights Dashboard to help users navigate and excel in the modern job market.

---

## 📋 Table of Contents
1. [Key Features](#-key-features)
2. [Tech Stack & Architecture](#-tech-stack--architecture)
3. [Folder Structure](#-folder-structure)
4. [Database Schema & Models](#-database-schema--models)
5. [Getting Started (Local Installation)](#-getting-started-local-installation)
6. [Background Jobs & Automation](#-background-jobs--automation)
7. [API Endpoints & Server Actions](#-api-endpoints--server-actions)
8. [License](#-license)

---

## ✨ Key Features

### 👤 AI-Guided Onboarding
- Custom onboarding flow that captures the user's targeted industry, experience level, bio, and technical/interpersonal skills.
- Synchronizes the onboarding data to auto-generate baseline industry market insights using generative AI.

### 📈 Dynamic Industry Insights Dashboard
- Delivers real-time data regarding high-demand skills, average growth rates, and general market outlook for the user's industry.
- Provides dynamic salary charts mapping minimum, median, and maximum salaries across multiple common roles.
- Curates actionable career recommendations and learning suggestions based on current trends.

### ⚡ AI Resume Builder & ATS Enhancer
- Write and format professional resumes directly in Markdown inside a dedicated visual editor.
- Leverage AI-powered critique to rewrite bullet points, highlight action verbs, append quantifiable results, and add industry-relevant keywords.
- Single-click PDF generation to download polished, recruiter-ready documents.

### ✍️ Intelligent Cover Letter Generator
- Instantly generate tailored cover letters by feeding in a target job description, company name, and job title.
- Tailor the tone and content specifically to your onboarding profile (industry, years of experience, and key skills) so it reads naturally and professionally.
- Manage and save multiple cover letters as history with options to review, edit, or delete them.

### 🗣️ Mock Interview Simulator
- Simulates technical interviews by generating 10 multiple-choice questions custom-tailored to the user's industry and key skills.
- Evaluates answers in real-time, delivering scores, detailed explanations, and specific AI-driven improvement tips highlighting knowledge gaps.
- Saves progress as performance records (assessments) to track career readiness over time.

---

## 🏗️ Tech Stack & Architecture

### Core Frontend
* **Framework:** [Next.js 15 (App Router)](https://nextjs.org/) — Utilizing React server components and server-side rendering for speed and SEO optimization.
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) — A utility-first CSS framework coupled with CSS variables for dynamic variables.
* **Component Library:** [Shadcn UI](https://ui.shadcn.com/) — High-quality, highly accessible primitive UI elements built on top of Radix UI.
* **Theme Management:** [Next Themes](https://github.com/pacocoursey/next-themes) — Supports dynamic dark/light mode toggles.
* **Data Visualization:** [Recharts](https://recharts.org/) — Implements interactive data charts to visualize salary ranges.

### Core Backend & Services
* **Database & ORM:** [Neon PostgreSQL](https://neon.tech/) & [Prisma ORM](https://www.prisma.io/) — A serverless, auto-scaling relational database mapped with type-safe client models.
* **Authentication:** [Clerk](https://clerk.com/) — Secure session management, sign-up/sign-in flows, path protection middleware, and profile imagery.
* **Background Worker & Cron Scheduling:** [Inngest](https://www.inngest.com/) — Manages background task logic, reliable event queues, and cron triggers (e.g. weekly industry insight calculations) without dedicated daemon processes.
* **Artificial Intelligence:** [Google Gemini API (gemini-2.5-flash)](https://ai.google.dev/) — Powers resume optimization, cover letter copywriting, and mock interview questions generation.

---

## 📁 Folder Structure

The repository is modularly structured, keeping page layouts, database logic, AI server actions, and shared styles strictly segregated:

```
Job-Mentor-AI/
├── actions/                  # Next.js Server Actions (Database & AI operations)
│   ├── cover-letter.js       # Cover letter CRUD & generation actions
│   ├── dashboard.js          # Industry insights fetching & AI generation
│   ├── interview.js          # Mock interview quiz generation & assessment saving
│   ├── resume.js             # Resume saving, loading, & AI improvement
│   └── user.js               # Onboarding & user profile management
├── app/                      # Next.js App Router Pages & APIs
│   ├── (auth)/               # Auth routes (sign-in/sign-up layouts)
│   ├── (main)/               # Authenticated application modules
│   │   ├── ai-cover-letter/  # Cover letter generator UI & history list
│   │   ├── dashboard/        # Industry insights dashboard UI
│   │   ├── interview/        # Quiz/Mock interview UI & dashboard
│   │   ├── onboarding/       # Industry/Skills onboarding flow
│   │   └── resume/           # Resume builder & ATS editor UI
│   ├── api/
│   │   └── inngest/          # Inngest API serve endpoint
│   ├── globals.css           # Global Tailwind and app-wide styles
│   └── layout.js             # Root application shell & context providers
├── components/               # React Components
│   ├── ui/                   # Shadcn UI reusable components (button, card, dialog, etc.)
│   ├── header.jsx            # Main app navigation header with Clerk user buttons
│   ├── hero.jsx              # Landing page hero section
│   └── theme-provider.jsx    # Dark/light mode theme provider
├── data/                     # Static FAQ, testimonials, and industry definitions
├── hooks/                    # Custom React hooks (e.g., useFetch for Server Actions)
├── lib/                      # Helper modules and clients
│   ├── checkUser.js          # Clerk-to-Prisma user synchronization utility
│   ├── inngest/              # Inngest background worker client and jobs
│   ├── prisma.js             # Prisma client singleton
│   └── utils.js              # General helper utilities (Tailwind merger)
├── prisma/                   # Database configuration
│   └── schema.prisma         # Prisma database schema definition
└── public/                   # Static assets (images, icons)
```

---

## 🗄️ Database Schema & Models

The PostgreSQL database is organized into 5 relational tables using Prisma. Below is the relational structure:

```mermaid
erDiagram
    User ||--|| Resume : "has one"
    User ||--o{ Assessment : "completes many"
    User ||--o{ CoverLetter : "creates many"
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
```

---

## 🛠️ Getting Started (Local Installation)

Follow these steps to get the project up and running locally.

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- A **Neon PostgreSQL** database instance (or any PostgreSQL instance)
- A **Clerk** account for user authentication credentials
- A **Google Gemini API Key** for generative AI features

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
Copy the template `.env.example` into a new file named `.env`:
```bash
cp .env.example .env
```
Open `.env` and fill in your corresponding credentials:
```env
DATABASE_URL="postgresql://username:password@hostname/dbname?sslmode=require"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_your_clerk_publishable_key"
CLERK_SECRET_KEY="sk_your_clerk_secret_key"
GEMINI_API_KEY="your_google_gemini_api_key"
```

### 5. Initialize the Database
Generate the Prisma Client models and push the schema directly to your live database instance:
```bash
npx prisma generate
npx prisma db push
```

### 6. Run Inngest Local Dev Server (Background Jobs)
Inngest triggers event-driven and cron workflows. To simulate background jobs locally, start the Inngest Dev Server in a separate terminal:
```bash
npx inngest-cli dev
```
By default, the dev server will run on `http://localhost:8288` and automatically connect to your local Next.js instance endpoint at `http://localhost:3000/api/inngest`.

### 7. Run the Application
Start the Next.js local development server:
```bash
npm run dev
```
Open your browser and navigate to **`http://localhost:3000`**.

---

## ⏳ Background Jobs & Automation

JobMentorAI uses **Inngest** to execute automated processes:

1. **Weekly Industry Insights Refresh (`cron: "0 0 * * 0"`)**
   - Automatically executes every Sunday at midnight.
   - Fetches every industry current active in the database.
   - Queries `gemini-2.5-flash` to analyze job market trends, update salary guides, check current in-demand skills, and evaluate industry growth rates.
   - Saves updated JSON structures back into the `IndustryInsight` database table to keep dashboards live and fresh.

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
