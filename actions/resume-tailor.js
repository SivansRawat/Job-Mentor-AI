"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { generateTextWithFallback } from "@/lib/ai-provider";
import { retrieveUserVectorChunks, formatChunksForPrompt } from "@/lib/rag-helper";
import pdf from "pdf-parse";

export async function tailorResumeATS(base64PDF, jobTitle, jobDescription) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!base64PDF) {
      return { success: false, error: "Please upload your resume PDF." };
    }
    if (!jobDescription || !jobDescription.trim()) {
      return { success: false, error: "Please paste the target job description." };
    }

    // RAG Vector Retrieval: Fetch candidate's matching vector chunks from Neon PostgreSQL
    let ragContext = "";
    if (user) {
      const vectorChunks = await retrieveUserVectorChunks(user.id, `${jobTitle} ${jobDescription}`, 4);
      ragContext = formatChunksForPrompt(vectorChunks);
    }

    // 1. Decode base64 PDF into a binary buffer
    const buffer = Buffer.from(base64PDF, "base64");

    // 2. Parse text from PDF
    const parsedData = await pdf(buffer);
    const resumeText = parsedData.text || "";

    if (!resumeText.trim()) {
      return { success: false, error: "We couldn't extract text from this PDF. Please make sure it's not an image scan." };
    }

    // 3. Compile authentic ATS optimization prompt with RAG context
    const prompt = `
      You are an elite executive resume writer and ATS optimization specialist.
      Your task is to tailor and rewrite the candidate's existing resume text to maximize its ATS match compatibility for a target role.

      Target Role Title: "${jobTitle || "Target Position"}"
      Target Job Description:
      "${jobDescription}"

      Original Candidate Resume Text:
      "${resumeText}"

      ${ragContext}

      CRITICAL INTEGRITY GUARDRAILS (DO NOT LIE):
      1. DO NOT fabricate fake job titles, fake dates, or unearned degrees.
      2. DO NOT invent false employment history or fake companies.
      3. ONLY rephrase, restructure, emphasize, and highlight the candidate's REAL existing skills, technologies, and achievements (including retrieved vector chunks above).
      4. Seamlessly incorporate missing keywords from the job description into the summary, bullet points, and skills section ONLY if they match or relate to the candidate's real experience.

      OUTPUT INSTRUCTION:
      Return the output in ONLY the following JSON structure without markdown wrapping tags (no \`\`\`json):
      {
        "originalScore": number (integer 0-100 estimating original ATS match),
        "newScore": number (integer 85-98 estimating tailored ATS match),
        "keyOptimizations": ["string", "string", "string"], (3-5 bullet points summarizing authentic improvements made)
        "tailoredMarkdown": "string" (the complete tailored resume in clean markdown format)
      }
    `;

    // 4. Execute prompt through multi-provider fallback engine
    const text = await generateTextWithFallback({ prompt });
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    const result = JSON.parse(cleanedText);

    return {
      success: true,
      result,
    };
  } catch (error) {
    console.error("Error tailoring resume:", error);
    return { success: false, error: error.message || "Failed to tailor resume." };
  }
}
