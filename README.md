# JobMentorAI: Your AI-Powered Career Co-pilot 🚀

## Project by Sivans Rawat

---

## Overview

Welcome to **JobMentorAI**, your ultimate AI-powered partner for navigating the modern job market! As a full-stack platform, JobMentorAI is engineered to equip job seekers and professionals with cutting-edge tools and insights. Forget generic advice; our platform, powered by **Google Gemini AI**, offers intelligent features like an **AI Resume Builder**, a smart **Cover Letter Generator**, and a dynamic **Mock Interview simulator**. Beyond individual tools, we provide a live pulse on the industry with a **Dynamic Industry Insights Dashboard**, updated weekly to give you real-time market trends and actionable career recommendations.

Built with a robust tech stack including **Next.js**, **Shadcn UI**, **Prisma**, **Neon PostgreSQL**, **Clerk**, and **Ingest**, JobMentorAI delivers a seamless, responsive, and truly personalized experience. Your career growth starts here!

---

## Why JobMentorAI? What It Does For You

* **⚡ AI Resume Builder:** Craft standout resumes effortlessly. Our AI intelligently tailors your resume to specific job descriptions, highlighting your most relevant skills and experiences for maximum impact.
* **✍️ Intelligent Cover Letter Generator:** Say goodbye to writer's block. Generate compelling, personalized cover letters in minutes. Just provide your resume and the job description, and let our AI do the rest.
* **🗣️ Mock Interview Simulator:** Sharpen your interview skills with confidence. Practice in a realistic environment and receive instant, AI-driven feedback on your responses, helping you pinpoint areas for improvement and ace your next interview.
* **📈 Dynamic Industry Insights Dashboard:** Stay ahead of the curve. Get weekly updates on in-demand skills, salary benchmarks, and emerging industries. Make data-driven decisions that propel your career forward.
* **🎯 Personalized Career Guidance:** Receive tailored advice and resources specifically aligned with your unique profile and career aspirations.
* **🔒 Secure & Scalable User Accounts:** Manage your profile and sensitive data with peace of mind, thanks to robust authentication powered by Clerk.
* **✨ Intuitive User Experience:** Enjoy a beautiful, responsive, and easy-to-navigate interface built with Shadcn UI, ensuring a consistent and delightful experience on any device.

---

## Tech Stack & Architecture

JobMentorAI is built on a modern and powerful foundation:

* **Frontend Framework:** **Next.js** - A React framework that enables powerful server-side rendering and static site generation for blazing-fast performance.
* **UI Library:** **Shadcn UI** - Provides elegant, reusable, and accessible UI components built on top of Tailwind CSS, ensuring a polished and consistent look.
* **AI Engine:** **Google Gemini AI** - The intelligence behind our powerful resume, cover letter, and interview tools, enabling smart text generation and analysis.
* **ORM (Object-Relational Mapper):** **Prisma** - For type-safe, efficient, and developer-friendly database access.
* **Database:** **Neon PostgreSQL** - A serverless, auto-scaling PostgreSQL database that provides robust and flexible data storage.
* **Authentication:** **Clerk** - Handles all user authentication and management securely and seamlessly.
* **Background Jobs:** **Ingest** - Powers our dynamic features by scheduling and managing weekly data updates for the industry insights dashboard.
* **Styling:** **Tailwind CSS** - A utility-first CSS framework for rapid and precise styling.

---

## Get Started: Set Up JobMentorAI Locally

Ready to explore JobMentorAI? Follow these steps to get it running on your machine.

### Prerequisites

Before you begin, ensure you have:

* **Node.js** (version 18 or higher recommended)
* **npm** or **yarn** package manager
* A **Neon PostgreSQL** database URL
* **Clerk API keys** (Publishable Key and Secret Key)
* A **Google Gemini AI API key**
* An **Ingest API key** (if you plan to run background jobs locally)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone [https://github.com/SivansRawat/JobMentorAI.git](https://github.com/SivansRawat/JobMentorAI.git)
    cd JobMentorAI
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure Environment Variables:**
    Create a file named `.env.local` in the root directory of the project and populate it with your specific API keys and database URL.

    ```env
    DATABASE_URL="your_neon_postgresql_connection_url"
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_your_clerk_publishable_key"
    CLERK_SECRET_KEY="sk_your_clerk_secret_key"
    GOOGLE_API_KEY="your_google_gemini_ai_api_key"
    INGEST_API_KEY="your_ingest_api_key" # Optional, for local background job testing
    # Add any other necessary environment variables here
    ```

4.  **Run Database Migrations:**
    Initialize your database schema and apply any necessary migrations.

    ```bash
    npx prisma migrate dev --name init
    # If you have seed data for initial population:
    npx prisma db seed
    ```

### Running the Application

Once everything is set up, launch the development server:

```bash
npm run dev
# or
yarn dev
